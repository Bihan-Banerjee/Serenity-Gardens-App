import { useEffect, useState } from 'react';
import { adminItemsAPI } from '../../lib/api';
import { Alert } from '../../lib/dialog';
import { Colors } from '../../lib/colors';
import { PLACEHOLDER_IMG } from '../../lib/format';

const EMPTY_FORM = { name: '', price: '', stock: '', description: '' };

export default function AdminItems() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await adminItemsAPI.getAllAdmin();
      setItems(res.data);
    } catch {
      Alert.alert('Error', 'Could not load items.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, []);

  // Release the object URL whenever the preview changes or the screen unmounts.
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  const pickImage = (file: File | undefined) => {
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const openAddModal = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setImageFile(null);
    setPreview(null);
    setModalVisible(true);
  };

  const openEditModal = (item: any) => {
    setEditingId(item._id);
    // Backend PATCH only accepts stock and price
    setForm({ name: item.name, price: String(item.price), stock: String(item.stock), description: item.description || '' });
    setImageFile(null);
    setPreview(item.image || null);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!editingId && (!form.name || !form.price || !form.stock)) {
      Alert.alert('Missing Fields', 'Name, price, and stock are required.');
      return;
    }
    try {
      setSaving(true);
      if (editingId) {
        await adminItemsAPI.update(editingId, { price: Number(form.price), stock: Number(form.stock) });
      } else {
        const data = new FormData();
        data.append('name', form.name);
        data.append('price', form.price);
        data.append('stock', form.stock);
        data.append('description', form.description);
        if (imageFile) data.append('image', imageFile, imageFile.name);
        await adminItemsAPI.create(data);
      }
      setModalVisible(false);
      fetchItems();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not save item.');
    } finally {
      setSaving(false);
    }
  };

  const handleFinalize = async (id: string) => {
    try {
      await adminItemsAPI.finalize(id);
      fetchItems();
    } catch {
      Alert.alert('Error', 'Failed to finalize item.');
    }
  };

  const handleDelete = (id: string) =>
    Alert.alert('Delete Item', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await adminItemsAPI.delete(id);
            fetchItems();
          } catch {
            Alert.alert('Error', 'Could not delete item.');
          }
        },
      },
    ]);

  return (
    <div className="pad-x">
      <div className="row-between">
        <h2 className="page-h">Manage Items</h2>
        <button className="pill-btn" style={{ background: Colors.primary }} onClick={openAddModal}>+ Add New</button>
      </div>

      {loading ? (
        <div className="spinner" />
      ) : (
        <div className="stack-gap">
          {items.map((item) => (
            <div key={item._id} className="card item-row">
              <img src={item.image || PLACEHOLDER_IMG} alt="" />
              <div className="grow">
                <b className="ellipsis">{item.name}</b>
                <div className="muted small">₹{item.price} | Stock: {item.stock}</div>
                {item.finalized ? (
                  <span className="fin-ok">✓ Finalized</span>
                ) : (
                  <button className="fin-btn" onClick={() => handleFinalize(item._id)}>Finalize</button>
                )}
              </div>
              <div className="row-gap">
                <button className="sq-btn" onClick={() => openEditModal(item)} aria-label="Edit">✏️</button>
                <button className="sq-btn del" onClick={() => handleDelete(item._id)} aria-label="Delete">🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalVisible && (
        <div className="modal-page">
          <div className="modal-head">
            <h3>{editingId ? 'Edit Stock/Price' : 'Add New Item'}</h3>
            <button className="icon-btn" onClick={() => setModalVisible(false)}>✕</button>
          </div>
          <div className="form modal-body">
            {!editingId && (
              <>
                <label>Name</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                <label>Description</label>
                <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </>
            )}
            <label>Price (₹)</label>
            <input type="number" inputMode="decimal" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            <label>Stock Quantity</label>
            <input type="number" inputMode="numeric" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />

            {!editingId && (
              <label className="image-picker">
                {preview ? <img src={preview} alt="Preview" /> : <span>📷 Tap to Upload/Take Photo</span>}
                {/* Android's file chooser offers camera and gallery for image inputs */}
                <input type="file" accept="image/*" hidden onChange={(e) => pickImage(e.target.files?.[0])} />
              </label>
            )}

            <button className="btn btn-gradient" onClick={handleSave} disabled={saving}>
              {saving ? <span className="spinner small" /> : 'Save Item'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
