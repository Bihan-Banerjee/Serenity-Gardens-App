import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  Pressable, Animated, Alert, ActivityIndicator, Dimensions,
  FlatList, LayoutAnimation, UIManager, Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/colors';
import { Theme } from '../constants/theme';
import { reviewsAPI } from '../lib/api';
import { useAuthStore } from '../store/useAuthStore';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width: W } = Dimensions.get('window');

interface Review {
  _id?: string;
  name: string;
  review: string;
  rating: number;
  createdAt?: string;
}

const hardcodedTestimonials = [
  { name: "Suvankar Chakraborty", review: "We visited this Serenity gardens for our get together with old friends. The ambience is too good. The hospitality by the caretaker was amazing and food served was tasty and hygienic.", rating: 5 },
  { name: "Soma Gupta", review: "Excellent farm house with lot of places for children to play, colorful snaps and adda. Food and hospitality served needs special mention... really too tasty.", rating: 5 },
  { name: "Parna Banerjee", review: "My recent visit at Serenity Gardens was delightful. Nestled in serene green environment, perfect escape from daily life. Blend of modern amenities with tranquil nature.", rating: 5 },
  { name: "Kankani Mukherjee", review: "Mesmerising atmosphere, eye soothing greenery with fruits, vegetables and flower plants. Ideal place for get together with all amenities. Must visit!", rating: 5 },
  { name: "Sutreyi", review: "It is B-E-A-U-T-I-F-U-L...💚", rating: 5 },
  { name: "Madhumita Chatterjee", review: "Serenity Garden - huge tranquil plot beautified with flowers, fruits, vegetables and decorative planters. Worth spending a whole day for relaxation.", rating: 5 },
  { name: "SRABANI CHAKRABORTY", review: "The scenic beauty of this place is amazing, every part full of greenery.", rating: 5 },
  { name: "Paramita Roy", review: "Aesthetically decorated, neat and well maintained Farm House. Food was amazing. Worth a visit.", rating: 5 },
  { name: "Moupriya Das", review: "Excellent place to spend quality time with friends and family... Great space for picnic... Organic veggies to fishing ...clean ac room... Amazing food... We had a great time....", rating: 5 },
  { name: "Rana Paul", review: "Nice place", rating: 5 },
  { name: "Amarnath Mahalanobish", review: "Nice place, clean rooms, homely but tasty food. Good place for family/friends hangout.", rating: 4 },
  { name: "Kamal Chattopadhyay", review: "We Active Seniors of our closely held club of Greenwood had a wonderful time y'tday out at Deepa-Shubhankar's calm cool sunny Serenity Gardens. Amidst greens & colorful environ we enjoyed thoroughly, with snacks, wholesome lunch & endless adda that put the 'spirits'high! A few snaps of the day..", rating: 5 },
  { name: "Arup Chakraborty", review: "This place is amazing...quite and calm, and overall the hospitality is quite appreciable", rating: 5 },
  { name: "Xpert Dental Clinic", review: "Very nice garden and feels like close to nature ..keep it subhankar sir ....very nice and beautiful farm house", rating: 5 },
  { name: "Soma Dasgupta", review: "Very nice place & very large area. I would highly recommend it for a family picnic . Enjoyed a lot with my buddies.", rating: 5 },
  { name: "Tamali Ghosh", review: "I wanted to take a moment to express my heartfelt gratitude for hosting us at your beautiful farmhouse. The entire experience was absolutely wonderful and truly unforgettable! From the moment we arrived, we were captivated by the picturesque surroundings. The serene landscape, lush greenery, and charming farmhouse created the perfect setting for a relaxing day out. It felt like a hidden gem tucked away from the hustle and bustle of everyday life. The food was simply delightful! Every dish was prepared with such care and love, and it showed. The flavors were exceptional, and we couldn't stop raving about the delicious spread you provided. It was clear that a lot of thought and effort went into making sure we had the best dining experience possible. Your farmhouse is truly a haven of peace and beauty. Whether it was lounging by the garden, exploring the scenic trails, or simply enjoying each other's company in such a welcoming space, every moment was a joy. It’s the perfect place for a day out with family and friends. Thank you once again for your incredible hospitality. Your farmhouse is a treasure, and I can't wait to share our wonderful experience with others. I highly recommend it to anyone looking for a memorable and relaxing getaway.", rating: 5 },
  { name: "Munmun Basu", review: "Excellent food,superb hospitality, beauty and peace of nature prevail everywhere in this place", rating: 5 },
  { name: "Dola Ray", review: "A fantastic experience at Serenity Gardens. Exceptional arrangements and tasty food, surrounded by pristine greens. A walk down the gardens and pond was pure joy. An island of peace and serenity indeed.", rating: 5 },
  { name: "Arun Thakur", review: "Very good place...", rating: 5 },
  { name: "Soumen Chakraborty", review: "Honestly, this place is a hidden gem! Perfectly planned and decorated, it's the ultimate chill spot just outside Kolkata 😊. Unmatched hospitality is there strength...", rating: 5 },
  { name: "DR ARINDAM MANDAL", review: "What a wonderful place surrounded by nature,play ground ,water body and a beautiful bunglow❤️", rating: 5 },
];

// Map hardcoded testimonials to match the Review interface
const SEED: Review[] = hardcodedTestimonials.map((t, i) => ({
  _id: `hardcoded-${i}`,
  name: t.name,
  review: t.review,
  rating: t.rating,
  createdAt: new Date().toISOString(),
}));

// ── Swipeable Auto-Scrolling Marquee ──────────────────────
function Marquee({ reviews }: { reviews: Review[] }) {
  const scrollRef = useRef<FlatList>(null);
  const activeIndex = useRef(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Exact math: 260px width + 16px right margin = 276px total space per card
  const CARD_W = 276; 
  const all = [...reviews, ...reviews, ...reviews];

  const startAutoScroll = () => {
    stopAutoScroll();
    timerRef.current = setInterval(() => {
      if (all.length === 0) return;
      activeIndex.current = (activeIndex.current + 1) % all.length;
      try {
        scrollRef.current?.scrollToIndex({ index: activeIndex.current, animated: true });
      } catch (e) {}
    }, 1500); // Scrolls every 1.5 seconds
  };

  const stopAutoScroll = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  useEffect(() => {
    if (all.length > 0) startAutoScroll();
    return () => stopAutoScroll();
  }, [reviews.length]);

  if (reviews.length === 0) return null;

  return (
    <View style={mq.wrap}>
      <FlatList
        ref={scrollRef}
        data={all}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_W}
        decelerationRate="fast"
        contentContainerStyle={{ paddingLeft: 16 }}
        onScrollBeginDrag={stopAutoScroll} // Stop auto-play when user touches
        onScrollEndDrag={startAutoScroll}  // Resume when user lets go
        onMomentumScrollEnd={(e) => {
          // Sync index if user swiped manually
          const newIndex = Math.round(e.nativeEvent.contentOffset.x / CARD_W);
          activeIndex.current = newIndex;
        }}
        getItemLayout={(_, index) => ({
          length: CARD_W,
          offset: CARD_W * index,
          index,
        })}
        keyExtractor={(_, i) => String(i)}
        renderItem={({ item: r }) => (
          <View style={[mq.card, { width: 260, marginRight: 16 }]}>
            <View style={mq.stars}>
              {Array.from({ length: 5 }).map((_, si) => (
                <Text key={si} style={si < r.rating ? mq.starOn : mq.starOff}>★</Text>
              ))}
            </View>
            <Text style={mq.msg} numberOfLines={4}>"{r.review}"</Text>
            <View style={mq.foot}>
              <View style={mq.avatar}>
                <Text style={mq.avatarTxt}>{r.name[0]?.toUpperCase()}</Text>
              </View>
              <Text style={mq.name}>{r.name}</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

// ── Star Picker ───────────────────────────────────────────
function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <View style={{ flexDirection: 'row', gap: 10, marginBottom: 4 }}>
      {[1,2,3,4,5].map(s => (
        <Pressable 
          key={s} 
          onPress={() => onChange(s)}
          style={({ pressed }) => [{ transform: [{ scale: pressed ? 0.75 : 1 }] }]}
        >
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
          <Text style={rc.avatarTxt}>{r.name[0]?.toUpperCase()}</Text>
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
      .then(res => { 
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        if (res.data?.length) {
          // Combine Backend DB reviews with hardcoded testimonials
          setReviews([...res.data, ...SEED]); 
        } else {
          setReviews(SEED);
        }
      })
      .catch(() => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setReviews(SEED);
      });
  };

  useEffect(() => { fetchReviews(); }, []);

  const handleSubmit = async () => {
    if (!name.trim() || !message.trim())
      return Alert.alert('Missing Fields', 'Please enter your name and review.');
    if (message.trim().length < 10)
      return Alert.alert('Too Short', 'Write at least 10 characters.');
    try {
      setSubmitting(true);
      await reviewsAPI.create({ name: name.trim(), review: message.trim(), rating });
      
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
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
    <ScrollView style={s.container} showsVerticalScrollIndicator={false} bounces={true}>
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

      {/* Swipeable Marquee */}
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
            <Pressable 
              style={({ pressed }) => [
                s.anotherBtn,
                { opacity: pressed ? 0.6 : 1, transform: [{ scale: pressed ? 0.94 : 1 }] }
              ]} 
              onPress={() => {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                setSubmitted(false);
              }}
            >
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
            {/* Highly responsive submit button */}
            <Pressable 
              style={({ pressed }) => [
                { borderRadius: Theme.borderRadius.full, overflow: 'hidden', marginTop: 16 },
                { opacity: pressed ? 0.75 : 1, transform: [{ scale: pressed ? 0.94 : 1 }] }
              ]} 
              onPress={handleSubmit} 
              disabled={submitting}
            >
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
  card:   { backgroundColor: Colors.card, borderRadius: Theme.borderRadius.lg, padding: 18, borderWidth: 1, borderColor: Colors.cardBorder },
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