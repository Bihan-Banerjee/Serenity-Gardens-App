import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import { ordersAPI } from '../lib/api';
import { Alert } from '../lib/dialog';
import { Colors } from '../lib/colors';
import Icon from '../components/Icon';
import type { IconName } from '../components/Icon';

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void; on: (evt: string, cb: (r: any) => void) => void };
  }
}

const PAYMENT_METHODS: { id: string; label: string; icon: IconName; desc: string }[] = [
  { id: 'cod', label: 'Cash on delivery', icon: 'cash', desc: 'Pay when you receive' },
  { id: 'upi', label: 'UPI', icon: 'mobile', desc: 'GPay, PhonePe, Paytm' },
  { id: 'razorpay', label: 'Card / net banking', icon: 'card', desc: 'Secure payment via Razorpay' },
];

const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID as string | undefined;

function SignInGate() {
  const navigate = useNavigate();
  return (
    <div className="pad-x gate fade-up">
      <div className="card center">
        <Icon name="lock" size={36} className="empty-icon" />
        <h3>Sign in to place your order</h3>
        <p className="muted">An account is required so we can attach your name, email and delivery details to the order.</p>
        <div className="stack-gap" style={{ marginTop: 16 }}>
          <button className="btn btn-gradient" onClick={() => navigate('/login', { state: { from: '/checkout' } })}>Sign in</button>
          <button className="btn btn-outline" onClick={() => navigate('/register', { state: { from: '/checkout' } })}>Create account</button>
        </div>
      </div>
    </div>
  );
}

export default function Checkout() {
  const navigate = useNavigate();
  const items = useCartStore((s) => s.items);
  const totalPrice = useCartStore((s) => s.totalPrice());
  const clearCart = useCartStore((s) => s.clearCart);
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const updateProfile = useAuthStore((s) => s.updateProfile);

  // Details come from the account; the customer only edits them if something has changed.
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
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
    updateProfile({ phone, address: address.trim() }); // remembered for next time
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
        description: 'Serenity Gardens order',
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
    // Hard stop: nothing is sent to the server without a signed-in account and complete details.
    if (!isAuthenticated || !user?.email) {
      Alert.alert('Sign in required', 'Please sign in to place an order.');
      return;
    }
    if (!name.trim()) return Alert.alert('Missing details', 'Please enter your name.');
    if (phone.length !== 10) return Alert.alert('Invalid phone', 'Enter a valid 10-digit phone number.');
    if (address.trim().length < 10) return Alert.alert('Missing details', 'Please enter your full delivery address.');

    try {
      setLoading(true);
      // 1. Create the order on the backend (returns a Razorpay order id for online payments)
      const orderRes = await ordersAPI.create({
        items: items.map((i) => ({ name: i.name, quantity: i.quantity, price: i.price, itemId: i._id })),
        total,
        paymentMethod,
        deliveryAddress: { name: name.trim(), email: user.email, phone, address: address.trim(), notes },
      });

      if (paymentMethod === 'cod') {
        finishOrderSuccess();
        return;
      }

      // 2. Collect payment via Razorpay Checkout
      let payment;
      try {
        payment = await openRazorpay(orderRes.data.razorpayOrderId);
      } catch {
        Alert.alert('Payment not completed', 'Your payment was cancelled or failed. You have not been charged.');
        return;
      }

      // 3. Verify the signature on the backend
      await ordersAPI.verifyPayment(payment);
      finishOrderSuccess();
    } catch (err: any) {
      Alert.alert('Checkout error', err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  if (ordered) {
    return (
      <div className="success pop-in">
        <div className="success-banner">
          <svg className="check-draw" viewBox="0 0 64 64" width="72" height="72" aria-hidden="true">
            <circle cx="32" cy="32" r="28" pathLength={1} />
            <path d="M19 33l9 9 17-19" pathLength={1} />
          </svg>
          <h2>Order placed</h2>
          <p>Thank you{name ? `, ${name.split(' ')[0]}` : ''}. We'll take it from here.</p>
        </div>
        <button className="btn btn-gradient" onClick={() => navigate('/profile', { replace: true })}>View my orders</button>
        <button className="btn btn-outline" onClick={() => navigate('/menu', { replace: true })}>Continue shopping</button>
      </div>
    );
  }

  if (!isAuthenticated) return <SignInGate />;

  return (
    <div className="checkout pad-x">
      <h3 className="section-h">Order summary</h3>
      <div className="card">
        {items.map((item) => (
          <div key={item._id} className="row-between order-line">
            <span>{item.quantity} x {item.name}</span>
            <b>₹{(item.price * item.quantity).toFixed(0)}</b>
          </div>
        ))}
        <hr />
        <div className="row-between order-line"><span className="muted">Subtotal</span><b>₹{subtotal.toFixed(2)}</b></div>
        <div className="row-between order-line">
          <span className="muted">Delivery</span>
          <b style={delivery === 0 ? { color: Colors.success } : undefined}>{delivery === 0 ? 'Free' : `₹${delivery}`}</b>
        </div>
        {delivery > 0 && <div className="hint muted">Free delivery on orders above ₹500</div>}
        <hr />
        <div className="row-between"><span className="total-label">Total</span><span className="order-total">₹{total.toFixed(2)}</span></div>
      </div>

      <h3 className="section-h">Delivery details</h3>
      <div className="card form">
        <label>Account email</label>
        <input value={user?.email || ''} readOnly className="readonly" />
        <label>Full name</label>
        <input placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
        <label>Phone number</label>
        <input type="tel" inputMode="numeric" maxLength={10} placeholder="10-digit mobile number" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} />
        <label>Delivery address</label>
        <textarea rows={3} placeholder="House no., street, city, PIN" value={address} onChange={(e) => setAddress(e.target.value)} />
        <label>Order notes (optional)</label>
        <textarea rows={2} placeholder="Any special instructions" value={notes} onChange={(e) => setNotes(e.target.value)} />
        <p className="muted small" style={{ marginTop: 10 }}>Your phone and address are saved to your account for next time.</p>
      </div>

      <h3 className="section-h">Payment method</h3>
      <div className="stack-gap">
        {PAYMENT_METHODS.map((m) => (
          <button key={m.id} className={`pay-option ${paymentMethod === m.id ? 'on' : ''}`} onClick={() => setPaymentMethod(m.id)}>
            <span className="radio">{paymentMethod === m.id && <i />}</span>
            <Icon name={m.icon} size={24} className="pay-icon" />
            <span className="pay-info"><b>{m.label}</b><small>{m.desc}</small></span>
            {paymentMethod === m.id && <Icon name="check" size={18} className="pay-check" />}
          </button>
        ))}
      </div>

      <button className="btn btn-gradient place-order" onClick={handlePlaceOrder} disabled={loading}>
        {loading ? <span className="spinner small" /> : <><span>Place order</span><span>₹{total.toFixed(2)}</span></>}
      </button>
      <div style={{ height: 32 }} />
    </div>
  );
}
