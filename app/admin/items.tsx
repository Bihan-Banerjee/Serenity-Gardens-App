import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Modal, TextInput, Alert, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '../../constants/colors';
import { Theme } from '../../constants/theme';
import { adminItemsAPI } from '../../lib/api';

export default function AdminItems() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', price: '', stock: '', description: '' });
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await adminItemsAPI.getAllAdmin();
      setItems(res.data);
    } catch (err) {
      Alert.alert('Error', 'Could not load items.');
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  const openAddModal = () => {
    setEditingId(null);
    setForm({ name: '', price: '', stock: '', description: '' });
    setImageUri(null);
    setModalVisible(true);
  };

  const openEditModal = (item: any) => {
    setEditingId(item._id);
    // Backend PATCH only accepts stock and price
    setForm({ name: item.name, price: item.price.toString(), stock: item.stock.toString(), description: item.description });
    setImageUri(item.image);
    setModalVisible(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      if (editingId) {
        // Edit flow (Backend only supports price & stock updates)
        await adminItemsAPI.update(editingId, { 
          price: Number(form.price), 
          stock: Number(form.stock) 
        });
      } else {
        // Create flow (Requires multipart/form-data)
        if (!form.name || !form.price || !form.stock) {
          return Alert.alert('Missing Fields', 'Name, price, and stock are required.');
        }

        const formData = new FormData();
        formData.append('name', form.name);
        formData.append('price', form.price);
        formData.append('stock', form.stock);
        formData.append('description', form.description);

        if (imageUri) {
          const filename = imageUri.split('/').pop();
          const match = /\.(\w+)$/.exec(filename || '');
          const type = match ? `image/${match[1]}` : `image`;
          formData.append('image', { uri: imageUri, name: filename, type } as any);
        }

        await adminItemsAPI.create(formData);
      }
      
      setModalVisible(false);
      fetchItems();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Could not save item.');
    } finally {
      setSaving(false);
    }
  };

  const handleFinalize = async (id: string) => {
    try {
      await adminItemsAPI.finalize(id);
      fetchItems();
    } catch (err) {
      Alert.alert('Error', 'Failed to finalize item.');
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Item', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await adminItemsAPI.delete(id);
            fetchItems();
          } catch (err) { Alert.alert('Error', 'Could not delete item.'); }
        }
      }
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Manage Items</Text>
        <Pressable style={styles.addBtn} onPress={openAddModal}>
          <Text style={styles.addBtnText}>+ Add New</Text>
        </Pressable>
      </View>

      {loading ? (
        <ActivityIndicator color={Colors.primary} size="large" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          renderItem={({ item }) => (
            <View style={styles.itemCard}>
              <Image source={{ uri: item.image }} style={styles.itemImage} />
              <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.itemPrice}>₹{item.price} | Stock: {item.stock}</Text>
                
                <View style={styles.badgeRow}>
                  {!item.finalized && (
                    <Pressable style={styles.finalizeBtn} onPress={() => handleFinalize(item._id)}>
                      <Text style={styles.finalizeText}>Finalize</Text>
                    </Pressable>
                  )}
                  {item.finalized && <Text style={{ fontSize: 11, color: Colors.success, fontWeight: '700' }}>✓ Finalized</Text>}
                </View>
              </View>

              <View style={styles.actions}>
                <Pressable style={styles.actionBtn} onPress={() => openEditModal(item)}><Text>✏️</Text></Pressable>
                <Pressable style={[styles.actionBtn, { backgroundColor: '#fee2e2' }]} onPress={() => handleDelete(item._id)}><Text>🗑️</Text></Pressable>
              </View>
            </View>
          )}
        />
      )}

      {/* ADD / EDIT MODAL */}
      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{editingId ? 'Edit Stock/Price' : 'Add New Item'}</Text>
            <Pressable onPress={() => setModalVisible(false)}><Text style={styles.closeBtn}>✕</Text></Pressable>
          </View>
          
          <FlatList
            data={[{}]}
            renderItem={() => (
              <View style={styles.form}>
                {!editingId && (
                  <>
                    <Text style={styles.label}>Name</Text>
                    <TextInput style={styles.input} value={form.name} onChangeText={(t) => setForm({...form, name: t})} />
                    
                    <Text style={styles.label}>Description</Text>
                    <TextInput style={[styles.input, { height: 80 }]} multiline value={form.description} onChangeText={(t) => setForm({...form, description: t})} />
                  </>
                )}

                <Text style={styles.label}>Price (₹)</Text>
                <TextInput style={styles.input} keyboardType="numeric" value={form.price} onChangeText={(t) => setForm({...form, price: t})} />
                
                <Text style={styles.label}>Stock Quantity</Text>
                <TextInput style={styles.input} keyboardType="numeric" value={form.stock} onChangeText={(t) => setForm({...form, stock: t})} />
                
                {!editingId && (
                  <Pressable style={styles.imagePicker} onPress={pickImage}>
                    {imageUri ? (
                      <Image source={{ uri: imageUri }} style={styles.previewImg} />
                    ) : (
                      <Text style={styles.imagePickerText}>📷 Tap to Upload Image</Text>
                    )}
                  </Pressable>
                )}

                <Pressable style={styles.saveBtn} onPress={handleSave} disabled={saving}>
                  <LinearGradient colors={[Colors.primaryLight, Colors.primary]} style={styles.saveGradient}>
                    {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Save Item</Text>}
                  </LinearGradient>
                </Pressable>
              </View>
            )}
          />
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: Colors.text },
  addBtn: { backgroundColor: Colors.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  addBtnText: { color: Colors.white, fontWeight: '700', fontSize: 13 },
  itemCard: { flexDirection: 'row', backgroundColor: Colors.card, padding: 12, borderRadius: Theme.borderRadius.lg, borderWidth: 1, borderColor: Colors.cardBorder, alignItems: 'center' },
  itemImage: { width: 60, height: 60, borderRadius: Theme.borderRadius.md, marginRight: 12 },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 15, fontWeight: '700', color: Colors.text },
  itemPrice: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  badgeRow: { flexDirection: 'row', marginTop: 6 },
  finalizeBtn: { backgroundColor: Colors.accent, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  finalizeText: { color: Colors.white, fontSize: 10, fontWeight: 'bold' },
  actions: { flexDirection: 'row', gap: 8 },
  actionBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' },
  modalContainer: { flex: 1, backgroundColor: Colors.background },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderColor: Colors.cardBorder },
  modalTitle: { fontSize: 20, fontWeight: '800', color: Colors.text },
  closeBtn: { fontSize: 20, color: Colors.textMuted },
  form: { padding: 20 },
  label: { fontSize: 13, fontWeight: '700', color: Colors.textSecondary, marginBottom: 6, marginTop: 12 },
  input: { backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.cardBorder, borderRadius: Theme.borderRadius.md, padding: 12, fontSize: 15, color: Colors.text },
  imagePicker: { height: 120, backgroundColor: Colors.card, borderWidth: 1, borderStyle: 'dashed', borderColor: Colors.primary, borderRadius: Theme.borderRadius.md, alignItems: 'center', justifyContent: 'center', marginTop: 20, overflow: 'hidden' },
  imagePickerText: { color: Colors.primary, fontWeight: '600' },
  previewImg: { width: '100%', height: '100%' },
  saveBtn: { borderRadius: Theme.borderRadius.full, overflow: 'hidden', marginTop: 30, marginBottom: 40 },
  saveGradient: { paddingVertical: 16, alignItems: 'center' },
  saveBtnText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
});