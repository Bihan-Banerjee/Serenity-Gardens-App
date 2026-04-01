import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  FlatList,
  Image,
  Animated,
  ActivityIndicator,
  Alert,
  Modal,
  LayoutAnimation,
  UIManager,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Theme } from '../../constants/theme';
import { useCartStore } from '../../store/useCartStore';
import { itemsAPI } from '../../lib/api';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

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

function CartSheet({ visible, onClose }: { visible: boolean; onClose: () => void; }) {
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const total = useCartStore((s) => s.totalPrice());
  const router = useRouter();
  const slideAnim = useRef(new Animated.Value(400)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: visible ? 0 : 400,
      tension: 70,
      friction: 14,
      useNativeDriver: true,
    }).start();
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="none">
      <Pressable style={styles.cartOverlay} onPress={onClose}>
        <Animated.View style={[styles.cartSheet, { transform: [{ translateY: slideAnim }] }]}>
          <Pressable>
            <View style={styles.cartHandle} />
            <View style={styles.cartHeader}>
              <Text style={styles.cartTitle}>Your Cart 🛒</Text>
              <Pressable onPress={onClose} style={({ pressed }) => [{ opacity: pressed ? 0.5 : 1 }]}>
                <Text style={styles.cartClose}>✕</Text>
              </Pressable>
            </View>

            {items.length === 0 ? (
              <View style={styles.emptyCart}>
                <Text style={styles.emptyCartEmoji}>🌿</Text>
                <Text style={styles.emptyCartText}>Your cart is empty</Text>
                <Text style={styles.emptyCartSub}>Add some fresh products!</Text>
              </View>
            ) : (
              <>
                <ScrollView style={styles.cartItems} showsVerticalScrollIndicator={false}>
                  {items.map((item) => (
                    <View key={item._id} style={styles.cartItem}>
                      <Image source={{ uri: item.image || 'https://via.placeholder.com/150' }} style={styles.cartItemImage} resizeMode="cover" />
                      <View style={styles.cartItemInfo}>
                        <Text style={styles.cartItemName}>{item.name}</Text>
                        <Text style={styles.cartItemPrice}>₹{item.price} {item.unit || 'pc'}</Text>
                      </View>
                      <View style={styles.qtyControl}>
                        <Pressable 
                          style={({ pressed }) => [styles.qtyBtn, { transform: [{ scale: pressed ? 0.9 : 1 }] }]} 
                          onPress={() => updateQuantity(item._id, item.quantity - 1)}
                        >
                          <Text style={styles.qtyBtnText}>−</Text>
                        </Pressable>
                        <Text style={styles.qtyNum}>{item.quantity}</Text>
                        <Pressable 
                          style={({ pressed }) => [styles.qtyBtn, { transform: [{ scale: pressed ? 0.9 : 1 }] }]} 
                          onPress={() => updateQuantity(item._id, item.quantity + 1)}
                        >
                          <Text style={styles.qtyBtnText}>+</Text>
                        </Pressable>
                      </View>
                    </View>
                  ))}
                </ScrollView>
                <View style={styles.cartFooter}>
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Total</Text>
                    <Text style={styles.totalAmount}>₹{total.toFixed(2)}</Text>
                  </View>
                  <Pressable
                    style={({ pressed }) => [styles.checkoutBtn, { opacity: pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] }]}
                    onPress={() => { onClose(); router.push('/checkout'); }}
                  >
                    <LinearGradient colors={[Colors.primaryLight, Colors.primary]} style={styles.checkoutBtnInner} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                      <Text style={styles.checkoutBtnText}>Proceed to Checkout →</Text>
                    </LinearGradient>
                  </Pressable>
                </View>
              </>
            )}
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

function ProductCard({ item }: { item: Item }) {
  const addItem = useCartStore((s) => s.addItem);
  const cartItems = useCartStore((s) => s.items);
  const inCart = cartItems.find((i) => i._id === item._id);
  const updateQuantity = useCartStore((s) => s.updateQuantity);

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const isOutOfStock = item.stock <= 0;

  const handleAdd = () => {
    if (isOutOfStock) return;
    
    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 0.94, tension: 300, friction: 10, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 200, friction: 8, useNativeDriver: true }),
    ]).start();
    
    addItem({
      _id: item._id, name: item.name, price: item.price, image: item.image || 'https://via.placeholder.com/150', category: item.category || 'Store', unit: item.unit || 'pc',
    });
  };

  return (
    <Animated.View style={[styles.productCard, { transform: [{ scale: scaleAnim }] }]}>
      <View style={styles.productImageContainer}>
        <Image source={{ uri: item.image || 'https://via.placeholder.com/150' }} style={styles.productImage} resizeMode="cover" />
        {isOutOfStock && (
          <View style={styles.outOfStockOverlay}>
            <Text style={styles.outOfStockText}>Out of Stock</Text>
          </View>
        )}
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryBadgeText}>{item.category || 'Store'}</Text>
        </View>
      </View>

      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.productDesc} numberOfLines={2}>{item.description || 'Freshly picked.'}</Text>
        <View style={styles.productFooter}>
          <View>
            <Text style={styles.productPrice}>₹{item.price}</Text>
            <Text style={styles.productUnit}>{item.unit || 'pc'}</Text>
          </View>

          {inCart ? (
            <View style={styles.qtyControl}>
              <Pressable style={({ pressed }) => [styles.qtyBtn, { transform: [{ scale: pressed ? 0.85 : 1 }] }]} onPress={() => updateQuantity(item._id, inCart.quantity - 1)}>
                <Text style={styles.qtyBtnText}>−</Text>
              </Pressable>
              <Text style={styles.qtyNum}>{inCart.quantity}</Text>
              <Pressable
                style={({ pressed }) => [styles.qtyBtn, { transform: [{ scale: pressed ? 0.85 : 1 }] }]}
                onPress={() => {
                  if (inCart.quantity >= item.stock) {
                     Alert.alert("Stock Limit", "You have reached the maximum available stock for this item.");
                     return;
                  }
                  updateQuantity(item._id, inCart.quantity + 1)
                }}
              >
                <Text style={styles.qtyBtnText}>+</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable
              style={({ pressed }) => [styles.addBtn, isOutOfStock && styles.addBtnDisabled, { transform: [{ scale: pressed && !isOutOfStock ? 0.9 : 1 }] }]}
              onPress={handleAdd}
              disabled={isOutOfStock}
            >
              <Text style={styles.addBtnText}>+ Add</Text>
            </Pressable>
          )}
        </View>
      </View>
    </Animated.View>
  );
}

export default function MenuScreen() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [cartVisible, setCartVisible] = useState(false);
  const totalItems = useCartStore((s) => s.totalItems());

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await itemsAPI.getAll();
      if (res.data?.length) setItems(res.data);
    } catch {
      Alert.alert("Error", "Could not load store items. Check your internet connection.");
    } finally {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setLoading(false);
    }
  };

  const filtered = activeCategory === 'All' ? items : items.filter((i) => i.category === activeCategory);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerLabel}>Farm Fresh</Text>
          <Text style={styles.headerTitle}>Our Shop</Text>
        </View>
        <Pressable 
          style={({ pressed }) => [styles.cartButton, { transform: [{ scale: pressed ? 0.9 : 1 }] }]} 
          onPress={() => setCartVisible(true)}
        >
          <Text style={styles.cartIcon}>🛒</Text>
          {totalItems > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{totalItems}</Text>
            </View>
          )}
        </Pressable>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsContainer} style={{ flexGrow: 0, flexShrink: 0, minHeight: 55, maxHeight: 55 }}>
        {CATEGORIES.map((cat) => (
          <Pressable
            key={cat}
            style={({ pressed }) => [styles.tab, activeCategory === cat && styles.tabActive, { transform: [{ scale: pressed ? 0.95 : 1 }] }]}
            onPress={() => setActiveCategory(cat)}
          >
            <Text style={[styles.tabText, activeCategory === cat && styles.tabTextActive]}>{cat}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {loading ? (
        <ActivityIndicator color={Colors.primary} size="large" style={{ marginTop: 60 }} />
      ) : (
        <FlatList
          data={filtered}
          numColumns={2}
          keyExtractor={(i) => i._id}
          contentContainerStyle={styles.productGrid}
          columnWrapperStyle={{ gap: 12 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => <ProductCard item={item} />}
          ListFooterComponent={<View style={{ height: 32 }} />}
          ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 40, color: Colors.textMuted }}>No items found in this category.</Text>}
        />
      )}

      <CartSheet visible={cartVisible} onClose={() => setCartVisible(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
  headerLabel: { fontSize: 11, color: Colors.secondary, letterSpacing: 2.5, textTransform: 'uppercase', fontWeight: '700', marginBottom: 2 },
  headerTitle: { fontSize: 26, fontWeight: '800', color: Colors.text, letterSpacing: -0.4 },
  cartButton: { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.card, alignItems: 'center', justifyContent: 'center', ...Theme.shadow.sm, borderWidth: 1, borderColor: Colors.cardBorder },
  cartIcon: { fontSize: 22 },
  cartBadge: { position: 'absolute', top: 0, right: 0, backgroundColor: Colors.accent, borderRadius: 999, width: 18, height: 18, alignItems: 'center', justifyContent: 'center' },
  cartBadgeText: { color: Colors.white, fontSize: 10, fontWeight: '800' },
  tabsContainer: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  tab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: Theme.borderRadius.full, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.cardBorder },
  tabActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  tabText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  tabTextActive: { color: Colors.white },
  productGrid: { paddingHorizontal: 16, paddingTop: 8 },
  productCard: { flex: 1, backgroundColor: Colors.card, borderRadius: Theme.borderRadius.lg, overflow: 'hidden', marginBottom: 12, ...Theme.shadow.sm, borderWidth: 1, borderColor: Colors.cardBorder },
  productImageContainer: { height: 130, position: 'relative' },
  productImage: { width: '100%', height: '100%' },
  outOfStockOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center' },
  outOfStockText: { color: Colors.white, fontWeight: '700', fontSize: 12 },
  categoryBadge: { position: 'absolute', top: 8, left: 8, backgroundColor: Colors.primary, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  categoryBadgeText: { color: Colors.white, fontSize: 9, fontWeight: '800' },
  productInfo: { padding: 12 },
  productName: { fontSize: 14, fontWeight: '800', color: Colors.text, marginBottom: 3 },
  productDesc: { fontSize: 11, color: Colors.textMuted, lineHeight: 15, marginBottom: 10 },
  productFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  productPrice: { fontSize: 16, fontWeight: '800', color: Colors.primary },
  productUnit: { fontSize: 10, color: Colors.textMuted },
  addBtn: { backgroundColor: Colors.primary, paddingHorizontal: 12, paddingVertical: 7, borderRadius: Theme.borderRadius.full },
  addBtnDisabled: { backgroundColor: Colors.textMuted },
  addBtnText: { color: Colors.white, fontSize: 12, fontWeight: '700' },
  qtyControl: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  qtyBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  qtyBtnText: { color: Colors.white, fontSize: 16, fontWeight: '700', lineHeight: 20 },
  qtyNum: { fontSize: 14, fontWeight: '700', color: Colors.text, minWidth: 20, textAlign: 'center' },
  cartOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  cartSheet: { backgroundColor: Colors.card, borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: '80%', ...Theme.shadow.lg },
  cartHandle: { width: 40, height: 4, backgroundColor: Colors.cardBorder, borderRadius: 2, alignSelf: 'center', marginTop: 12, marginBottom: 8 },
  cartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: Colors.cardBorder },
  cartTitle: { fontSize: 18, fontWeight: '800', color: Colors.text },
  cartClose: { fontSize: 18, color: Colors.textMuted },
  emptyCart: { alignItems: 'center', padding: 48 },
  emptyCartEmoji: { fontSize: 48, marginBottom: 12 },
  emptyCartText: { fontSize: 18, fontWeight: '700', color: Colors.text },
  emptyCartSub: { fontSize: 14, color: Colors.textMuted, marginTop: 4 },
  cartItems: { maxHeight: 320, padding: 16 },
  cartItem: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  cartItemImage: { width: 56, height: 56, borderRadius: Theme.borderRadius.md },
  cartItemInfo: { flex: 1 },
  cartItemName: { fontSize: 14, fontWeight: '700', color: Colors.text },
  cartItemPrice: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  cartFooter: { padding: 20, borderTopWidth: 1, borderTopColor: Colors.cardBorder },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  totalLabel: { fontSize: 16, color: Colors.textSecondary },
  totalAmount: { fontSize: 22, fontWeight: '800', color: Colors.primary },
  checkoutBtn: { borderRadius: Theme.borderRadius.full, overflow: 'hidden' },
  checkoutBtnInner: { paddingVertical: 15, alignItems: 'center' },
  checkoutBtnText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
});