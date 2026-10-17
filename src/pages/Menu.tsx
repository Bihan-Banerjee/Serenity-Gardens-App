import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/useCartStore';
import { itemsAPI } from '../lib/api';
import { Alert } from '../lib/dialog';
import { PLACEHOLDER_IMG } from '../lib/format';
import { tap } from '../lib/native';

export interface Item {
  _id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  stock: number;
  finalized: boolean;
  category?: string;
  unit?: string;
}

const CATEGORIES = ['All', 'Fish', 'Vegetables', 'Flowers'];

function Qty({ value, onMinus, onPlus }: { value: number; onMinus: () => void; onPlus: () => void }) {
  return (
    <div className="qty">
      <button className="qty-btn" onClick={onMinus}>−</button>
      <span className="qty-num">{value}</span>
      <button className="qty-btn" onClick={onPlus}>+</button>
    </div>
  );
}

function CartSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const total = useCartStore((s) => s.totalPrice());
  const navigate = useNavigate();

  return (
    <div className={`sheet-overlay ${visible ? 'open' : ''}`} onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle" />
        <div className="sheet-head">
          <h3>Your Cart 🛒</h3>
          <button className="icon-btn" onClick={onClose}>✕</button>
        </div>
        {items.length === 0 ? (
          <div className="empty">
            <div className="empty-emoji">🌿</div>
            <strong>Your cart is empty</strong>
            <span className="muted">Add some fresh products!</span>
          </div>
        ) : (
          <>
            <div className="sheet-items">
              {items.map((item) => (
                <div key={item._id} className="cart-item">
                  <img src={item.image || PLACEHOLDER_IMG} alt="" />
                  <div className="cart-item-info">
                    <strong>{item.name}</strong>
                    <span>₹{item.price} {item.unit || 'pc'}</span>
                  </div>
                  <Qty
                    value={item.quantity}
                    onMinus={() => updateQuantity(item._id, item.quantity - 1)}
                    onPlus={() => updateQuantity(item._id, item.quantity + 1)}
                  />
                </div>
              ))}
            </div>
            <div className="sheet-foot">
              <div className="total-row"><span>Total</span><b>₹{total.toFixed(2)}</b></div>
              <button className="btn btn-gradient" onClick={() => { onClose(); navigate('/checkout'); }}>
                Proceed to Checkout →
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ProductCard({ item }: { item: Item }) {
  const addItem = useCartStore((s) => s.addItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const inCart = useCartStore((s) => s.items.find((i) => i._id === item._id));
  const outOfStock = item.stock <= 0;

  const handleAdd = () => {
    if (outOfStock) return;
    tap();
    addItem({
      _id: item._id,
      name: item.name,
      price: item.price,
      image: item.image || PLACEHOLDER_IMG,
      category: item.category || 'Store',
      unit: item.unit || 'pc',
    });
  };

  return (
    <article className="product">
      <div className="product-img">
        <img src={item.image || PLACEHOLDER_IMG} alt={item.name} loading="lazy" />
        {outOfStock && <div className="oos">Out of Stock</div>}
        <span className="cat-badge">{item.category || 'Store'}</span>
      </div>
      <div className="product-info">
        <h4>{item.name}</h4>
        <p>{item.description || 'Freshly picked.'}</p>
        <div className="product-foot">
          <div>
            <div className="price">₹{item.price}</div>
            <div className="unit">{item.unit || 'pc'}</div>
          </div>
          {inCart ? (
            <Qty
              value={inCart.quantity}
              onMinus={() => updateQuantity(item._id, inCart.quantity - 1)}
              onPlus={() => {
                if (inCart.quantity >= item.stock) {
                  Alert.alert('Stock Limit', 'You have reached the maximum available stock for this item.');
                  return;
                }
                updateQuantity(item._id, inCart.quantity + 1);
              }}
            />
          ) : (
            <button className="add-btn" disabled={outOfStock} onClick={handleAdd}>+ Add</button>
          )}
        </div>
      </div>
    </article>
  );
}

export default function Menu() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [cartVisible, setCartVisible] = useState(false);
  const totalItems = useCartStore((s) => s.totalItems());

  useEffect(() => {
    (async () => {
      try {
        const res = await itemsAPI.getAll();
        if (res.data?.length) setItems(res.data);
      } catch {
        Alert.alert('Error', 'Could not load store items. Check your internet connection.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = activeCategory === 'All' ? items : items.filter((i) => i.category === activeCategory);

  return (
    <div className="screen">
      <header className="screen-header row-between">
        <div>
          <div className="eyebrow">Farm Fresh</div>
          <h1>Our Shop</h1>
        </div>
        <button className="cart-btn" onClick={() => setCartVisible(true)} aria-label="Open cart">
          🛒
          {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
        </button>
      </header>

      <div className="chips">
        {CATEGORIES.map((cat) => (
          <button key={cat} className={`chip ${activeCategory === cat ? 'on' : ''}`} onClick={() => setActiveCategory(cat)}>
            {cat}
          </button>
        ))}
      </div>

      <div className="screen-scroll">
        {loading ? (
          <div className="spinner" />
        ) : filtered.length === 0 ? (
          <p className="muted center pad">No items found in this category.</p>
        ) : (
          <div className="product-grid">
            {filtered.map((item) => <ProductCard key={item._id} item={item} />)}
          </div>
        )}
      </div>

      <CartSheet visible={cartVisible} onClose={() => setCartVisible(false)} />
    </div>
  );
}
