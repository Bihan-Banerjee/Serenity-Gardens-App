import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/colors';
import { Theme } from '../constants/theme';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import { ordersAPI } from '../lib/api';
import RazorpayCheckout from 'react-native-razorpay';

const PAYMENT_METHODS = [
  { id: 'cod', label: 'Cash on Delivery', emoji: '💵', desc: 'Pay when you receive' },
  { id: 'upi', label: 'UPI / QR Pay', emoji: '📱', desc: 'GPay, PhonePe, Paytm' },
  { id: 'razorpay', label: 'Card / Net Banking', emoji: '💳', desc: 'Secure via Razorpay' },
];

function SectionHeader({ emoji, title }: { emoji: string; title: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionEmoji}>{emoji}</Text>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

function PaymentOption({
  method,
  selected,
  onSelect,
}: {
  method: (typeof PAYMENT_METHODS)[0];
  selected: boolean;
  onSelect: () => void;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 0.96, tension: 300, friction: 10, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 200, friction: 8, useNativeDriver: true }),
    ]).start();
    onSelect();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        onPress={handlePress}
        style={[styles.paymentOption, selected && styles.paymentOptionSelected]}
      >
        <View style={styles.paymentRadio}>
          {selected && <View style={styles.paymentRadioInner} />}
        </View>
        <Text style={styles.paymentEmoji}>{method.emoji}</Text>
        <View style={styles.paymentInfo}>
          <Text style={[styles.paymentLabel, selected && styles.paymentLabelSelected]}>
            {method.label}
          </Text>
          <Text style={styles.paymentDesc}>{method.desc}</Text>
        </View>
        {selected && <Text style={styles.paymentCheck}>✓</Text>}
      </Pressable>
    </Animated.View>
  );
}

export default function CheckoutScreen() {
  const router = useRouter();
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

  const successAnim = useRef(new Animated.Value(0)).current;
  const [ordered, setOrdered] = useState(false);

  useEffect(() => {
    if (items.length === 0 && !ordered) router.back();
  }, [items]);

  const subtotal = totalPrice;
  const delivery = subtotal > 500 ? 0 : 40;
  const total = subtotal + delivery;

  // --- ADDED HELPER FUNCTION ---
  const finishOrderSuccess = () => {
    setOrdered(true);
    clearCart();
    Animated.spring(successAnim, {
      toValue: 1,
      tension: 50,
      friction: 10,
      useNativeDriver: true,
    }).start();
  };

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
      Alert.alert(
        'Sign in Required',
        'Please sign in to place an order.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign In', onPress: () => router.push('/login') },
        ]
      );
      return;
    }

    try {
      setLoading(true);
      
      // 1. Create order on YOUR backend first (which returns Razorpay order_id)
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
    
      // 2. Open Razorpay Native UI
      const options = {
        description: 'Serenity Gardens Order',
        image: 'https://yourwebsite.com/logo.jpg', // Replace with your hosted logo
        currency: 'INR',
        key: process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID, // Replace with your test/live key
        amount: total * 100, // Amount in paise
        name: 'Serenity Gardens',
        order_id: orderRes.data.razorpayOrderId, // The ID from your backend
        prefill: { email: user?.email, contact: phone, name: name },
        theme: { color: Colors.primary }
      };
    
      RazorpayCheckout.open(options).then(async (data:any) => {
        // 3. Verify payment on your backend
        await ordersAPI.verifyPayment({
          razorpay_payment_id: data.razorpay_payment_id,
          razorpay_order_id: data.razorpay_order_id,
          razorpay_signature: data.razorpay_signature
        });
        finishOrderSuccess(); 
      }).catch((err:any) => {
        console.log("Razorpay Checkout Error:", err);
        Alert.alert("Payment Failed", "Your transaction was cancelled or failed.");
      });
    
    } catch (err: any) {
      Alert.alert('Checkout Error', err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  if (ordered) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center' }]}>
        <Animated.View
          style={[
            styles.successContainer,
            {
              opacity: successAnim,
              transform: [
                {
                  scale: successAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1],
                  }),
                },
              ],
            },
          ]}
        >
          <LinearGradient
            colors={[Colors.primaryDark, Colors.primary]}
            style={styles.successBanner}
          >
            <Text style={styles.successEmoji}>🎉</Text>
            <Text style={styles.successTitle}>Order Placed!</Text>
            <Text style={styles.successSub}>
              Thank you{name ? `, ${name.split(' ')[0]}` : ''}! Your fresh produce is on its way.
            </Text>
          </LinearGradient>
          <View style={styles.successCard}>
            <View style={styles.successRow}>
              <Text style={styles.successRowLabel}>Total Paid</Text>
              <Text style={styles.successRowValue}>₹{total.toFixed(2)}</Text>
            </View>
            <View style={styles.successRow}>
              <Text style={styles.successRowLabel}>Payment</Text>
              <Text style={styles.successRowValue}>
                {PAYMENT_METHODS.find((p) => p.id === paymentMethod)?.label}
              </Text>
            </View>
            <View style={styles.successRow}>
              <Text style={styles.successRowLabel}>Deliver to</Text>
              <Text style={[styles.successRowValue, { flex: 1, textAlign: 'right' }]}
                numberOfLines={2}>
                {address}
              </Text>
            </View>
          </View>
          <Pressable
            style={styles.backHomeBtn}
            onPress={() => router.replace('/(tabs)')}
          >
            <LinearGradient
              colors={[Colors.primaryLight, Colors.primary]}
              style={styles.backHomeGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.backHomeBtnText}>Back to Home 🌿</Text>
            </LinearGradient>
          </Pressable>
          <Pressable
            style={styles.viewOrdersBtn}
            onPress={() => router.replace('/(tabs)/profile')}
          >
            <Text style={styles.viewOrdersBtnText}>View My Orders →</Text>
          </Pressable>
        </Animated.View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Order Summary */}
        <SectionHeader emoji="🛒" title="Order Summary" />
        <View style={styles.card}>
          {items.map((item) => (
            <View key={item._id} style={styles.summaryItem}>
              <Text style={styles.summaryItemName} numberOfLines={1}>
                {item.quantity}× {item.name}
              </Text>
              <Text style={styles.summaryItemPrice}>
                ₹{(item.price * item.quantity).toFixed(0)}
              </Text>
            </View>
          ))}
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>₹{subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Delivery</Text>
            <Text
              style={[
                styles.summaryValue,
                delivery === 0 && { color: Colors.success },
              ]}
            >
              {delivery === 0 ? 'FREE' : `₹${delivery}`}
            </Text>
          </View>
          {delivery === 0 && (
            <Text style={styles.freeDeliveryHint}>
              🎉 Free delivery on orders above ₹500
            </Text>
          )}
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>₹{total.toFixed(2)}</Text>
          </View>
        </View>

        {/* Delivery Details */}
        <SectionHeader emoji="📍" title="Delivery Details" />
        <View style={styles.card}>
          <Text style={styles.inputLabel}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Your name"
            placeholderTextColor={Colors.textMuted}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />

          <Text style={styles.inputLabel}>Phone Number</Text>
          <TextInput
            style={styles.input}
            placeholder="10-digit mobile number"
            placeholderTextColor={Colors.textMuted}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            maxLength={10}
          />

          <Text style={styles.inputLabel}>Delivery Address</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="House no., Street, City, PIN"
            placeholderTextColor={Colors.textMuted}
            value={address}
            onChangeText={setAddress}
            multiline
            numberOfLines={3}
          />

          <Text style={styles.inputLabel}>Order Notes (optional)</Text>
          <TextInput
            style={[styles.input, { height: 72 }]}
            placeholder="Any special instructions..."
            placeholderTextColor={Colors.textMuted}
            value={notes}
            onChangeText={setNotes}
            multiline
          />
        </View>

        {/* Payment Method */}
        <SectionHeader emoji="💳" title="Payment Method" />
        <View style={styles.paymentList}>
          {PAYMENT_METHODS.map((method) => (
            <PaymentOption
              key={method.id}
              method={method}
              selected={paymentMethod === method.id}
              onSelect={() => setPaymentMethod(method.id)}
            />
          ))}
        </View>

        {/* Place Order */}
        <Pressable
          style={styles.placeOrderBtn}
          onPress={handlePlaceOrder}
          disabled={loading}
        >
          <LinearGradient
            colors={[Colors.primaryLight, Colors.primaryDark]}
            style={styles.placeOrderGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {loading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <>
                <Text style={styles.placeOrderText}>Place Order</Text>
                <Text style={styles.placeOrderAmount}>₹{total.toFixed(2)}</Text>
              </>
            )}
          </LinearGradient>
        </Pressable>

        <Text style={styles.secureNote}>
          🔒 Your order details are encrypted and secure
        </Text>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 16 },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 20,
    marginBottom: 12,
  },
  sectionEmoji: { fontSize: 20 },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: Colors.text, letterSpacing: -0.3 },

  card: {
    backgroundColor: Colors.card,
    borderRadius: Theme.borderRadius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    ...Theme.shadow.sm,
  },

  // Summary
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
  },
  summaryItemName: {
    fontSize: 14,
    color: Colors.textSecondary,
    flex: 1,
    marginRight: 8,
  },
  summaryItemPrice: { fontSize: 14, fontWeight: '600', color: Colors.text },
  summaryDivider: { height: 1, backgroundColor: Colors.cardBorder, marginVertical: 10 },
  summaryLabel: { fontSize: 14, color: Colors.textSecondary },
  summaryValue: { fontSize: 14, fontWeight: '600', color: Colors.text },
  freeDeliveryHint: {
    fontSize: 12,
    color: Colors.success,
    marginTop: -4,
    marginBottom: 4,
    textAlign: 'right',
  },
  totalLabel: { fontSize: 16, fontWeight: '700', color: Colors.text },
  totalValue: { fontSize: 20, fontWeight: '800', color: Colors.primary },

  // Inputs
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 6,
    marginTop: 10,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: Colors.background,
    borderWidth: 1.5,
    borderColor: Colors.cardBorder,
    borderRadius: Theme.borderRadius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: Colors.text,
    marginBottom: 4,
  },
  textArea: { height: 80, textAlignVertical: 'top' },

  // Payment
  paymentList: { gap: 10 },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.card,
    borderRadius: Theme.borderRadius.lg,
    padding: 16,
    borderWidth: 1.5,
    borderColor: Colors.cardBorder,
    ...Theme.shadow.sm,
  },
  paymentOptionSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.sageMuted + '33',
  },
  paymentRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentRadioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  paymentEmoji: { fontSize: 22 },
  paymentInfo: { flex: 1 },
  paymentLabel: { fontSize: 14, fontWeight: '700', color: Colors.text },
  paymentLabelSelected: { color: Colors.primary },
  paymentDesc: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  paymentCheck: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '800',
  },

  // CTA
  placeOrderBtn: {
    borderRadius: Theme.borderRadius.full,
    overflow: 'hidden',
    marginTop: 28,
    ...Theme.shadow.md,
  },
  placeOrderGradient: {
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  placeOrderText: { color: Colors.white, fontSize: 18, fontWeight: '700' },
  placeOrderAmount: {
    color: Colors.accentLight,
    fontSize: 18,
    fontWeight: '800',
  },

  secureNote: {
    textAlign: 'center',
    color: Colors.textMuted,
    fontSize: 12,
    marginTop: 14,
  },

  // Success state
  successContainer: {
    padding: 20,
  },
  successBanner: {
    borderRadius: Theme.borderRadius.xl,
    padding: 36,
    alignItems: 'center',
    marginBottom: -20,
    ...Theme.shadow.lg,
  },
  successEmoji: { fontSize: 60, marginBottom: 14 },
  successTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: Colors.white,
    marginBottom: 8,
  },
  successSub: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: 22,
  },
  successCard: {
    backgroundColor: Colors.card,
    borderRadius: Theme.borderRadius.xl,
    padding: 24,
    paddingTop: 36,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    gap: 12,
    marginBottom: 20,
  },
  successRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  successRowLabel: { fontSize: 14, color: Colors.textSecondary },
  successRowValue: { fontSize: 14, fontWeight: '700', color: Colors.text },
  backHomeBtn: {
    borderRadius: Theme.borderRadius.full,
    overflow: 'hidden',
    marginBottom: 12,
    ...Theme.shadow.sm,
  },
  backHomeGradient: { paddingVertical: 16, alignItems: 'center' },
  backHomeBtnText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
  viewOrdersBtn: {
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: Theme.borderRadius.full,
    paddingVertical: 14,
    alignItems: 'center',
  },
  viewOrdersBtnText: { color: Colors.primary, fontWeight: '700', fontSize: 15 },
});