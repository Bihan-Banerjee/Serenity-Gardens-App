import { useEffect, useRef, useState } from 'react';
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
  { id: 'online', label: 'Pay online', icon: 'card', desc: 'UPI, cards and net banking via Razorpay' },
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
  const saveDetails = useAuthStore((s) => s.saveDetails);

  // Details come from the account; the customer only edits them if something has changed.
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const formRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [ordered, setOrdered] = useState(false);

  useEffect(() => {
    if (items.length === 0 && !ordered) navigate(-1);
  }, [items, ordered, navigate]);

  const subtotal = totalPrice;
  // The server prices the order from its own item prices; there is no delivery fee on the backend.
  const total = subtotal;

  const finishOrderSuccess = (savedPhone: string, savedAddress: string) => {
    void saveDetails({ phone: savedPhone, address: savedAddress }); // remembered for next time, on the account too
    setOrdered(true);
    clearCart();
  };

  const openRazorpay = (razorpayOrderId: string, amountPaise: number) =>
    new Promise<{ razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }>((resolve, reject) => {
      if (!window.Razorpay) return reject(new Error('Payment gateway failed to load. Check your connection.'));
      if (!RAZORPAY_KEY) return reject(new Error('Payment key is not configured.'));
      const rzp = new window.Razorpay({
        key: RAZORPAY_KEY,
        amount: amountPaise, // paise, as issued by the server
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
    // Read what is actually in the fields, so a keyboard or autofill quirk can never leave stale state behind.
    const el = (n: string) => formRef.current?.querySelector<HTMLInputElement | HTMLTextAreaElement>(`[name="${n}"]`)?.value ?? '';
    const fName = el('name').trim() || name.trim();
    const fPhone = (el('phone') || phone).replace(/\D/g, '');
    const fAddress = (el('address') || address).trim();
    const fNotes = el('notes') || notes;

    if (!fName) return Alert.alert('Missing details', 'Please enter your name.');
    if (fPhone.length !== 10) return Alert.alert('Invalid phone', 'Enter a valid 10-digit phone number.');
    if (fAddress.length < 6) {
      return Alert.alert('Address needed', 'Please enter where the order should be delivered (house or street, area and city).');
    }

    // Item ids and quantities only: the server looks up the real prices and checks stock.
    // Delivery details are sent alongside for when the backend starts storing them.
    const payload = {
      items: items.map((i) => ({ id: i._id, quantity: i.quantity })),
      paymentMethod,
      deliveryAddress: { name: fName, email: user.email, phone: fPhone, address: fAddress, notes: fNotes },
    };

    try {
      setLoading(true);

      if (paymentMethod === 'cod') {
        await ordersAPI.create(payload);
        finishOrderSuccess(fPhone, fAddress);
        return;
      }

      // Online: the server creates the Razorpay order; the real order is only stored once the payment verifies.
      const { data: rzpOrder } = await ordersAPI.createRazorpayOrder(payload);
      if (!rzpOrder?.id) throw new Error('Could not start the payment. Please try again.');

      let payment;
      try {
        payment = await openRazorpay(rzpOrder.id, rzpOrder.amount);
      } catch {
        Alert.alert('Payment not completed', 'Your payment was cancelled or failed. You have not been charged and no order was placed.');
        return;
      }

      try {
        await ordersAPI.verifyPayment(payment);
      } catch {
        Alert.alert('Payment received', 'We could not confirm your order automatically. Please contact us with your payment ID: ' + payment.razorpay_payment_id);
        return;
      }
      finishOrderSuccess(fPhone, fAddress);
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
        <hr />
        <div className="row-between"><span className="total-label">Total</span><span className="order-total">₹{total.toFixed(2)}</span></div>
      </div>

      <h3 className="section-h">Delivery details</h3>
      <div className="card form" ref={formRef}>
        <label>Account email</label>
        <input value={user?.email || ''} readOnly className="readonly" />
        <label>Full name</label>
        <input name="name" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
        <label>Phone number</label>
        <input name="phone" type="tel" inputMode="numeric" maxLength={10} placeholder="10-digit mobile number" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} />
        <label>Delivery address</label>
        <textarea name="address" rows={3} placeholder="House no., street, city, PIN" value={address} onChange={(e) => setAddress(e.target.value)} />
        <label>Order notes (optional)</label>
        <textarea name="notes" rows={2} placeholder="Any special instructions" value={notes} onChange={(e) => setNotes(e.target.value)} />
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
