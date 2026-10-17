import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import { ordersAPI } from '../lib/api';
import { Alert } from '../lib/dialog';
import { Colors } from '../lib/colors';

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void; on: (evt: string, cb: (r: any) => void) => void };
  }
}

const PAYMENT_METHODS = [
  { id: 'cod', label: 'Cash on Delivery', emoji: '💵', desc: 'Pay when you receive' },
  { id: 'upi', label: 'UPI / QR Pay', emoji: '📱', desc: 'GPay, PhonePe, Paytm' },
  { id: 'razorpay', label: 'Card / Net Banking', emoji: '💳', desc: 'Secure via Razorpay' },
];

const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID as string | undefined;

export default function Checkout() {
  const navigate = useNavigate();
  const items = useCartStore((s) => s.items);
  const totalPrice = useCartStore((s) => s.totalPrice());
  const clearCart = useCartStore((s) => s.clearCart);
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [loading, setLoading] = useState(false);
  const [ordered, setOrdered] = useState(false);

  useEffect(() => {
    if (items.length === 0 && !ordered) navigate(-1);
  }, [items, ordered, navigate]);

  const subtotal = totalPrice;
  const delivery = subtotal > 500 ? 0 : 40;
  const total = subtotal + delivery;

  const finishOrderSuccess = () => {
    setOrdered(true);
    clearCart();
  };

  const openRazorpay = (razorpayOrderId: string) =>
    new Promise<{ razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }>((resolve, reject) => {
      if (!window.Razorpay) return reject(new Error('Payment gateway failed to load. Check your connection.'));
      if (!RAZORPAY_KEY) return reject(new Error('Payment key is not configured.'));
      const rzp = new window.Razorpay({
        key: RAZORPAY_KEY,
        amount: Math.round(total * 100), // paise
        currency: 'INR',
        name: 'Serenity Gardens',
        description: 'Serenity Gardens Order',
        order_id: razorpayOrderId,
        prefill: { email: user?.email, contact: phone, name },
        theme: { color: Colors.primary },
        handler: resolve,
        modal: { ondismiss: () => reject(new Error('cancelled')) },
      });
      rzp.on('payment.failed', (r: any) => reject(new Error(r?.error?.description || 'failed')));
      rzp.open();
    });

  const handlePlaceOrder = async () => {
    if (!name.trim() || !phone.trim() || !address.trim()) {
      Alert.alert('Missing Details', 'Please fill in your name, phone, and address.');
      return;
    }
    if (phone.length < 10) {
      Alert.alert('Invalid Phone', 'Enter a valid 10-digit phone number.');
      return;
    }
    if (!isAuthenticated) {
      Alert.alert('Sign in Required', 'Please sign in to place an order.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign In', onPress: () => navigate('/login') },
      ]);
      return;
    }

    try {
      setLoading(true);
      // 1. Create the order on the backend (returns a Razorpay order id for online payments)
      const orderRes = await ordersAPI.create({
        items: items.map((i) => ({ name: i.name, quantity: i.quantity, price: i.price, itemId: i._id })),
        total,
        paymentMethod,
        deliveryAddress: { name, phone, address, notes },
      });

      if (paymentMethod === 'cod') {
        finishOrderSuccess();
        return;
      }

      // 2. Collect payment via Razorpay Checkout
      let payment;
      try {
        payment = await openRazorpay(orderRes.data.razorpayOrderId);
      } catch (err: any) {
        console.log('Razorpay Checkout Error:', err);
        Alert.alert('Payment Failed', 'Your transaction was cancelled or failed.');
        return;
      }

      // 3. Verify the signature on the backend
      await ordersAPI.verifyPayment(payment);
      finishOrderSuccess();
    } catch (err: any) {
      Alert.alert('Checkout Error', err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  if (ordered) {
    return (
      <div className="success pop-in">
        <div className="success-banner">
          <div className="big-emoji">🎉</div>
          <h2>Order Placed!</h2>
          <p>Thank you{name ? `, ${name.split(' ')[0]}` : ''}! Your fresh produce is on its way.</p>
        </div>
        <button className="btn btn-gradient" onClick={() => navigate('/profile', { replace: true })}>View My Orders</button>
        <button className="btn btn-outline" onClick={() => navigate('/menu', { replace: true })}>Continue Shopping</button>
      </div>
    );
  }

  return (
    <div className="checkout pad-x">
      <h3 className="section-h">🧾 Order Summary</h3>
      <div className="card">
        {items.map((item) => (
          <div key={item._id} className="row-between order-line">
            <span>{item.quantity}× {item.name}</span>
            <b>₹{(item.price * item.quantity).toFixed(0)}</b>
          </div>
        ))}
        <hr />
        <div className="row-between order-line"><span className="muted">Subtotal</span><b>₹{subtotal.toFixed(2)}</b></div>
        <div className="row-between order-line">
          <span className="muted">Delivery</span>
          <b style={delivery === 0 ? { color: Colors.success } : undefined}>{delivery === 0 ? 'FREE' : `₹${delivery}`}</b>
        </div>
        {delivery === 0 && <div className="hint">🎉 Free delivery on orders above ₹500</div>}
        <hr />
        <div className="row-between"><span className="total-label">Total</span><span className="order-total">₹{total.toFixed(2)}</span></div>
      </div>

      <h3 className="section-h">📍 Delivery Details</h3>
      <div className="card form">
        <label>Full Name</label>
        <input placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
        <label>Phone Number</label>
        <input
          type="tel"
          inputMode="numeric"
          maxLength={10}
          placeholder="10-digit mobile number"
          value={phone}
          onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
        />
        <label>Delivery Address</label>
        <textarea rows={3} placeholder="House no., Street, City, PIN" value={address} onChange={(e) => setAddress(e.target.value)} />
        <label>Order Notes (optional)</label>
        <textarea rows={2} placeholder="Any special instructions..." value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>

      <h3 className="section-h">💳 Payment Method</h3>
      <div className="stack-gap">
        {PAYMENT_METHODS.map((m) => (
          <button
            key={m.id}
            className={`pay-option ${paymentMethod === m.id ? 'on' : ''}`}
            onClick={() => setPaymentMethod(m.id)}
          >
            <span className="radio">{paymentMethod === m.id && <i />}</span>
            <span className="pay-emoji">{m.emoji}</span>
            <span className="pay-info"><b>{m.label}</b><small>{m.desc}</small></span>
            {paymentMethod === m.id && <span className="pay-check">✓</span>}
          </button>
        ))}
      </div>

      <button className="btn btn-gradient place-order" onClick={handlePlaceOrder} disabled={loading}>
        {loading ? <span className="spinner small" /> : <><span>Place Order</span><span>₹{total.toFixed(2)}</span></>}
      </button>
      <p className="muted center small">🔒 Your order details are encrypted and secure</p>
      <div style={{ height: 32 }} />
    </div>
  );
}
