import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  Pressable, Animated, Alert, ActivityIndicator, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/colors';
import { Theme } from '../constants/theme';
import { reviewsAPI } from '../lib/api';
import { useAuthStore } from '../store/useAuthStore';

const { width: W } = Dimensions.get('window');

interface Review {
  _id?: string;
  name: string;
  review: string;   // backend field is "review", not "message"
  rating: number;
  createdAt?: string;
}

const SEED: Review[] = [
  { _id: 's1', name: 'Priya Sharma',   rating: 5, review: 'An absolute gem! The lotus pond at dawn was the most peaceful thing I\'ve ever experienced. Freshest fish I\'ve ever had.', createdAt: '2024-11-10' },
  { _id: 's2', name: 'Rohan Ghosh',    rating: 5, review: 'Visited last monsoon — the entire place transformed into something magical. The organic vegetables are exceptional quality.', createdAt: '2024-08-22' },
  { _id: 's3', name: 'Ananya Bose',    rating: 4, review: 'Ordered the rose bouquet for my anniversary — delivered fresh and fragrant. Highly recommend the weekend tours!', createdAt: '2024-12-01' },
  { _id: 's4', name: 'Subhajit Das',   rating: 5, review: 'The pisciculture setup is fascinating. Got to see the whole process. Kids loved it. Will definitely come back.', createdAt: '2025-01-15' },
  { _id: 's5', name: 'Meera Patel',    rating: 5, review: 'Serenity by name, serenity by nature. I left feeling lighter than I had in months. The chai and picnic experience is unmissable.', createdAt: '2025-02-08' },
];

// ── Marquee ───────────────────────────────────────────────
function Marquee({ reviews }: { reviews: Review[] }) {
  const scrollX = useRef(new Animated.Value(0)).current;
  const CARD_W = 260 + 16;
  const total = reviews.length * CARD_W;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.timing(scrollX, {
        toValue: -total,
        duration: total * 40,
        useNativeDriver: true,
      })
    );
    anim.start();
    return () => anim.stop();
  }, [reviews.length]);

  const all = [...reviews, ...reviews];
  return (
    <View style={mq.wrap}>
      <Animated.View style={[mq.track, { transform: [{ translateX: scrollX }] }]}>
        {all.map((r, i) => (
          <View key={`${r._id}-${i}`} style={[mq.card, { width: 260 }]}>
            <View style={mq.stars}>
              {Array.from({ length: 5 }).map((_, si) => (
                <Text key={si} style={si < r.rating ? mq.starOn : mq.starOff}>★</Text>
              ))}
            </View>
            <Text style={mq.msg} numberOfLines={4}>"{r.review}"</Text>
            <View style={mq.foot}>
              <View style={mq.avatar}>
                <Text style={mq.avatarTxt}>{r.name[0].toUpperCase()}</Text>
              </View>
              <Text style={mq.name}>{r.name}</Text>
            </View>
          </View>
        ))}
      </Animated.View>
    </View>
  );
}

// ── Star Picker ───────────────────────────────────────────
function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <View style={{ flexDirection: 'row', gap: 10, marginBottom: 4 }}>
      {[1,2,3,4,5].map(s => (
        <Pressable key={s} onPress={() => onChange(s)}>
          <Text style={{ fontSize: 34, color: s <= value ? Colors.accent : Colors.cardBorder }}>★</Text>
        </Pressable>
      ))}
    </View>
  );
}

// ── Review Card ───────────────────────────────────────────
function ReviewCard({ r, idx }: { r: Review; idx: number }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(anim, { toValue: 1, delay: idx * 70, tension: 55, friction: 11, useNativeDriver: true }).start();
  }, []);

  const date = r.createdAt
    ? new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : '';

  return (
    <Animated.View style={[rc.card, { opacity: anim, transform: [{ translateY: anim.interpolate({ inputRange: [0,1], outputRange: [16,0] }) }] }]}>
      <View style={rc.header}>
        <View style={rc.avatar}>
          <Text style={rc.avatarTxt}>{r.name[0].toUpperCase()}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={rc.name}>{r.name}</Text>
          {date ? <Text style={rc.date}>{date}</Text> : null}
        </View>
        <View style={rc.badge}>
          <Text style={rc.badgeTxt}>{'★'.repeat(r.rating)}</Text>
        </View>
      </View>
      <Text style={rc.msg}>"{r.review}"</Text>
    </Animated.View>
  );
}

// ── Main ──────────────────────────────────────────────────
export default function ReviewsScreen() {
  const user = useAuthStore(s => s.user);
  const [reviews, setReviews]     = useState<Review[]>(SEED);
  const [name, setName]           = useState(user?.name || '');
  const [message, setMessage]     = useState('');
  const [rating, setRating]       = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);

  const fetchReviews = () => {
    reviewsAPI.getAll()
      .then(res => { if (res.data?.length) setReviews(res.data); })
      .catch(() => {});
  };

  useEffect(() => { fetchReviews(); }, []);

  const handleSubmit = async () => {
    if (!name.trim() || !message.trim())
      return Alert.alert('Missing Fields', 'Please enter your name and review.');
    if (message.trim().length < 10)
      return Alert.alert('Too Short', 'Write at least 10 characters.');
    try {
      setSubmitting(true);
      // IMPORTANT: backend field is "review" not "message"
      await reviewsAPI.create({ name: name.trim(), review: message.trim(), rating });
      setSubmitted(true);
      setMessage('');
      setRating(5);
      fetchReviews();
    } catch (err: any) {
      Alert.alert('Failed', err.message || 'Could not submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  const avg = (reviews.reduce((s,r) => s + r.rating, 0) / (reviews.length || 1)).toFixed(1);

  return (
    <ScrollView style={s.container} showsVerticalScrollIndicator={false}>
      {/* Banner */}
      <LinearGradient colors={[Colors.primary, Colors.primaryDark]} style={s.banner}>
        <Text style={s.bannerEmoji}>⭐</Text>
        <Text style={s.bannerTitle}>Guest Reviews</Text>
        <Text style={s.bannerSub}>What visitors say about Serenity Gardens</Text>
        <View style={s.statsRow}>
          {[
            { label: 'Reviews',   value: reviews.length },
            { label: 'Avg Rating',value: `${avg} ★` },
            { label: '5-Star',    value: reviews.filter(r => r.rating === 5).length },
          ].map(stat => (
            <View key={stat.label} style={s.stat}>
              <Text style={s.statVal}>{stat.value}</Text>
              <Text style={s.statLbl}>{stat.label}</Text>
            </View>
          ))}
        </View>
      </LinearGradient>

      {/* Marquee */}
      <Marquee reviews={reviews} />

      {/* Submit form */}
      <View style={s.section}>
        <Text style={s.eyebrow}>Share Your Experience</Text>
        <Text style={s.sectionTitle}>Leave a Review</Text>
        {submitted ? (
          <View style={s.successBox}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>🙏</Text>
            <Text style={s.successTitle}>Thank you!</Text>
            <Text style={s.successSub}>Your review was submitted successfully.</Text>
            <Pressable style={s.anotherBtn} onPress={() => setSubmitted(false)}>
              <Text style={s.anotherBtnTxt}>Write another →</Text>
            </Pressable>
          </View>
        ) : (
          <View style={s.formCard}>
            <Text style={s.lbl}>Your Name</Text>
            <TextInput
              style={s.input}
              placeholder="Full name"
              placeholderTextColor={Colors.textMuted}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
            <Text style={s.lbl}>Rating</Text>
            <StarPicker value={rating} onChange={setRating} />
            <Text style={[s.lbl, { marginTop: 14 }]}>Your Review</Text>
            <TextInput
              style={[s.input, { height: 120, textAlignVertical: 'top' }]}
              placeholder="Tell us about your visit or order..."
              placeholderTextColor={Colors.textMuted}
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={5}
            />
            <Pressable style={s.submitBtn} onPress={handleSubmit} disabled={submitting}>
              <LinearGradient
                colors={[Colors.primaryLight, Colors.primary]}
                style={s.submitGrad}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {submitting
                  ? <ActivityIndicator color={Colors.white} />
                  : <Text style={s.submitTxt}>Submit Review ★</Text>
                }
              </LinearGradient>
            </Pressable>
          </View>
        )}
      </View>

      {/* All reviews list */}
      <View style={s.section}>
        <Text style={s.eyebrow}>All Reviews</Text>
        <Text style={s.sectionTitle}>What Our Guests Say</Text>
        {reviews.map((r, i) => <ReviewCard key={r._id || i} r={r} idx={i} />)}
      </View>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  banner:    { padding: 28, paddingTop: 36, alignItems: 'center' },
  bannerEmoji: { fontSize: 44, marginBottom: 10 },
  bannerTitle: { fontSize: 28, fontWeight: '800', color: Colors.white, marginBottom: 6 },
  bannerSub:   { fontSize: 14, color: 'rgba(255,255,255,0.75)', textAlign: 'center', marginBottom: 20, lineHeight: 20 },
  statsRow: { flexDirection: 'row', gap: 28 },
  stat:     { alignItems: 'center' },
  statVal:  { fontSize: 22, fontWeight: '800', color: Colors.accentLight },
  statLbl:  { fontSize: 11, color: 'rgba(255,255,255,0.65)', marginTop: 2, fontWeight: '600' },

  section:      { padding: 20, paddingTop: 28 },
  eyebrow:      { fontSize: 11, color: Colors.secondary, letterSpacing: 2.5, textTransform: 'uppercase', fontWeight: '700', marginBottom: 4 },
  sectionTitle: { fontSize: 22, fontWeight: '800', color: Colors.text, letterSpacing: -0.4, marginBottom: 16 },

  formCard: { backgroundColor: Colors.card, borderRadius: Theme.borderRadius.xl, padding: 20, borderWidth: 1, borderColor: Colors.cardBorder, shadowColor: Colors.text, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 5 },
  lbl:      { fontSize: 12, fontWeight: '700', color: Colors.textSecondary, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.4 },
  input:    { backgroundColor: Colors.background, borderWidth: 1.5, borderColor: Colors.cardBorder, borderRadius: Theme.borderRadius.md, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: Colors.text, marginBottom: 4 },
  submitBtn:  { borderRadius: Theme.borderRadius.full, overflow: 'hidden', marginTop: 16 },
  submitGrad: { paddingVertical: 15, alignItems: 'center' },
  submitTxt:  { color: Colors.white, fontSize: 16, fontWeight: '700' },

  successBox:   { backgroundColor: Colors.card, borderRadius: Theme.borderRadius.xl, padding: 32, alignItems: 'center', borderWidth: 1, borderColor: Colors.cardBorder },
  successTitle: { fontSize: 22, fontWeight: '800', color: Colors.text, marginBottom: 6 },
  successSub:   { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  anotherBtn:   { borderWidth: 1.5, borderColor: Colors.primary, borderRadius: Theme.borderRadius.full, paddingHorizontal: 24, paddingVertical: 10 },
  anotherBtnTxt:{ color: Colors.primary, fontWeight: '700' },
});

const mq = StyleSheet.create({
  wrap:   { overflow: 'hidden', paddingVertical: 20, backgroundColor: Colors.backgroundDark },
  track:  { flexDirection: 'row', paddingHorizontal: 16 },
  card:   { backgroundColor: Colors.card, borderRadius: Theme.borderRadius.lg, padding: 18, marginRight: 16, borderWidth: 1, borderColor: Colors.cardBorder },
  stars:  { flexDirection: 'row', gap: 3, marginBottom: 10 },
  starOn: { fontSize: 15, color: Colors.accent },
  starOff:{ fontSize: 15, color: Colors.cardBorder },
  msg:    { fontSize: 13, color: Colors.textSecondary, lineHeight: 19, fontStyle: 'italic', marginBottom: 12 },
  foot:   { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { width: 30, height: 30, borderRadius: 15, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  avatarTxt: { color: Colors.white, fontWeight: '800', fontSize: 13 },
  name:   { fontSize: 13, fontWeight: '700', color: Colors.text },
});

const rc = StyleSheet.create({
  card:   { backgroundColor: Colors.card, borderRadius: Theme.borderRadius.lg, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: Colors.cardBorder },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  avatarTxt:{ color: Colors.white, fontWeight: '800', fontSize: 16 },
  name:   { fontSize: 14, fontWeight: '800', color: Colors.text },
  date:   { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  badge:  { backgroundColor: Colors.accent + '22', borderRadius: Theme.borderRadius.full, paddingHorizontal: 8, paddingVertical: 3 },
  badgeTxt:{ color: Colors.accent, fontSize: 12, fontWeight: '700' },
  msg:    { fontSize: 14, color: Colors.textSecondary, lineHeight: 21, fontStyle: 'italic' },
});
