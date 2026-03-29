import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Animated,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/colors';
import { Theme } from '../constants/theme';
import { reviewsAPI } from '../lib/api';

const { width: W } = Dimensions.get('window');

// ── Types ─────────────────────────────────────────────────
interface Review {
  _id?: string;
  name: string;
  message: string;
  rating: number;
  createdAt?: string;
}

// ── Seed reviews (shown when API unavailable) ─────────────
const SEED_REVIEWS: Review[] = [
  {
    _id: 's1',
    name: 'Priya Sharma',
    message:
      'An absolute gem! The lotus pond at dawn was the most peaceful thing I\'ve ever experienced. Freshest fish I\'ve ever had.',
    rating: 5,
    createdAt: '2024-11-10',
  },
  {
    _id: 's2',
    name: 'Rohan Ghosh',
    message:
      'Visited last monsoon — the entire place transformed into something magical. The organic vegetables are exceptional quality.',
    rating: 5,
    createdAt: '2024-08-22',
  },
  {
    _id: 's3',
    name: 'Ananya Bose',
    message:
      'Ordered the rose bouquet for my anniversary — delivered fresh and fragrant. Highly recommend the weekend tours!',
    rating: 4,
    createdAt: '2024-12-01',
  },
  {
    _id: 's4',
    name: 'Subhajit Das',
    message:
      'The pisciculture setup is fascinating. Got to see the whole process. Kids loved it. Will definitely come back.',
    rating: 5,
    createdAt: '2025-01-15',
  },
  {
    _id: 's5',
    name: 'Meera Patel',
    message:
      'Serenity by name, serenity by nature. I left feeling lighter than I had in months. The chai and garden picnic experience is unmissable.',
    rating: 5,
    createdAt: '2025-02-08',
  },
];

// ── Marquee Testimonials ──────────────────────────────────
function TestimonialMarquee({ reviews }: { reviews: Review[] }) {
  const scrollX = useRef(new Animated.Value(0)).current;
  const CARD_W = 260;
  const totalW = reviews.length * (CARD_W + 16);

  useEffect(() => {
    const anim = Animated.loop(
      Animated.timing(scrollX, {
        toValue: -totalW,
        duration: totalW * 35,
        useNativeDriver: true,
      })
    );
    anim.start();
    return () => anim.stop();
  }, [reviews]);

  const allReviews = [...reviews, ...reviews];

  return (
    <View style={marqueeStyles.container}>
      <Animated.View
        style={[
          marqueeStyles.track,
          { transform: [{ translateX: scrollX }] },
        ]}
      >
        {allReviews.map((review, i) => (
          <View key={`${review._id}-${i}`} style={[marqueeStyles.card, { width: CARD_W }]}>
            {/* Stars */}
            <View style={marqueeStyles.stars}>
              {Array.from({ length: 5 }).map((_, si) => (
                <Text
                  key={si}
                  style={[
                    marqueeStyles.star,
                    si < review.rating ? marqueeStyles.starFilled : marqueeStyles.starEmpty,
                  ]}
                >
                  ★
                </Text>
              ))}
            </View>
            <Text style={marqueeStyles.message} numberOfLines={4}>
              "{review.message}"
            </Text>
            <View style={marqueeStyles.footer}>
              <View style={marqueeStyles.avatar}>
                <Text style={marqueeStyles.avatarText}>
                  {review.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <Text style={marqueeStyles.name}>{review.name}</Text>
            </View>
          </View>
        ))}
      </Animated.View>
    </View>
  );
}

// ── Single Review Card ────────────────────────────────────
function ReviewCard({ review, index }: { review: Review; index: number }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(anim, {
      toValue: 1,
      delay: index * 80,
      tension: 55,
      friction: 11,
      useNativeDriver: true,
    }).start();
  }, []);

  const date = review.createdAt
    ? new Date(review.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '';

  return (
    <Animated.View
      style={[
        reviewStyles.card,
        {
          opacity: anim,
          transform: [
            {
              translateY: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [16, 0],
              }),
            },
          ],
        },
      ]}
    >
      <View style={reviewStyles.header}>
        <View style={reviewStyles.avatar}>
          <Text style={reviewStyles.avatarText}>
            {review.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={reviewStyles.headerInfo}>
          <Text style={reviewStyles.reviewerName}>{review.name}</Text>
          {date ? <Text style={reviewStyles.date}>{date}</Text> : null}
        </View>
        <View style={reviewStyles.ratingBadge}>
          <Text style={reviewStyles.ratingText}>
            {'★'.repeat(review.rating)}
          </Text>
        </View>
      </View>
      <Text style={reviewStyles.message}>"{review.message}"</Text>
    </Animated.View>
  );
}

// ── Star Rating Input ─────────────────────────────────────
function StarInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <View style={starStyles.row}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Pressable key={star} onPress={() => onChange(star)}>
          <Text style={[starStyles.star, star <= value && starStyles.starFilled]}>
            ★
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

// ── Main Screen ───────────────────────────────────────────
export default function ReviewsScreen() {
  const [reviews, setReviews] = useState<Review[]>(SEED_REVIEWS);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    reviewsAPI
      .getAll()
      .then((res) => {
        if (res.data?.length) setReviews(res.data);
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async () => {
    if (!name.trim() || !message.trim()) {
      Alert.alert('Missing Fields', 'Please enter your name and message.');
      return;
    }
    if (message.trim().length < 10) {
      Alert.alert('Too Short', 'Please write at least 10 characters.');
      return;
    }

    try {
      setSubmitting(true);
      await reviewsAPI.create({ name: name.trim(), message: message.trim(), rating });
    } catch {
      // Offline mode — add locally
    }

    const newReview: Review = {
      _id: Date.now().toString(),
      name: name.trim(),
      message: message.trim(),
      rating,
      createdAt: new Date().toISOString(),
    };
    setReviews((prev) => [newReview, ...prev]);
    setSubmitted(true);
    setName('');
    setMessage('');
    setRating(5);
    setSubmitting(false);
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      bounces
    >
      {/* Header Banner */}
      <LinearGradient
        colors={[Colors.primary, Colors.primaryDark]}
        style={styles.banner}
      >
        <Text style={styles.bannerEmoji}>⭐</Text>
        <Text style={styles.bannerTitle}>Guest Reviews</Text>
        <Text style={styles.bannerSub}>
          Hear what visitors say about Serenity Gardens
        </Text>
        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            { label: 'Reviews', value: reviews.length },
            {
              label: 'Avg Rating',
              value:
                (
                  reviews.reduce((s, r) => s + r.rating, 0) / (reviews.length || 1)
                ).toFixed(1) + ' ★',
            },
            { label: '5-Star', value: reviews.filter((r) => r.rating === 5).length },
          ].map((stat) => (
            <View key={stat.label} style={styles.stat}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>
      </LinearGradient>

      {/* Marquee */}
      <TestimonialMarquee reviews={reviews} />

      {/* Submit Review */}
      <View style={styles.formSection}>
        <Text style={styles.sectionEyebrow}>Share Your Experience</Text>
        <Text style={styles.sectionTitle}>Leave a Review</Text>

        {submitted ? (
          <View style={styles.successBox}>
            <Text style={styles.successEmoji}>🙏</Text>
            <Text style={styles.successTitle}>Thank you!</Text>
            <Text style={styles.successSub}>
              Your review has been submitted and will appear shortly.
            </Text>
            <Pressable
              style={styles.anotherBtn}
              onPress={() => setSubmitted(false)}
            >
              <Text style={styles.anotherBtnText}>Write another →</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.formCard}>
            <Text style={styles.formLabel}>Your Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Full name"
              placeholderTextColor={Colors.textMuted}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />

            <Text style={styles.formLabel}>Your Rating</Text>
            <StarInput value={rating} onChange={setRating} />

            <Text style={[styles.formLabel, { marginTop: 16 }]}>Your Review</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Tell us about your experience at Serenity Gardens..."
              placeholderTextColor={Colors.textMuted}
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />

            <Pressable
              style={styles.submitBtn}
              onPress={handleSubmit}
              disabled={submitting}
            >
              <LinearGradient
                colors={[Colors.primaryLight, Colors.primary]}
                style={styles.submitGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {submitting ? (
                  <ActivityIndicator color={Colors.white} />
                ) : (
                  <Text style={styles.submitBtnText}>Submit Review ★</Text>
                )}
              </LinearGradient>
            </Pressable>
          </View>
        )}
      </View>

      {/* All Reviews */}
      <View style={styles.allReviewsSection}>
        <Text style={styles.sectionEyebrow}>All Reviews</Text>
        <Text style={styles.sectionTitle}>What Our Guests Say</Text>
        {reviews.map((review, i) => (
          <ReviewCard key={review._id || i} review={review} index={i} />
        ))}
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

// ── StyleSheets ───────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  banner: {
    padding: 28,
    paddingTop: 36,
    alignItems: 'center',
  },
  bannerEmoji: { fontSize: 44, marginBottom: 10 },
  bannerTitle: { fontSize: 28, fontWeight: '800', color: Colors.white, marginBottom: 6 },
  bannerSub: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  statsRow: { flexDirection: 'row', gap: 24 },
  stat: { alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: '800', color: Colors.accentLight },
  statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.65)', marginTop: 2, fontWeight: '600' },

  formSection: { padding: 20, paddingTop: 28 },
  sectionEyebrow: {
    fontSize: 11,
    color: Colors.secondary,
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    fontWeight: '700',
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.4,
    marginBottom: 16,
  },
  formCard: {
    backgroundColor: Colors.card,
    borderRadius: Theme.borderRadius.xl,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    ...Theme.shadow.md,
  },
  formLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 8,
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
    fontSize: 15,
    color: Colors.text,
    marginBottom: 4,
  },
  textArea: { height: 120 },

  submitBtn: { borderRadius: Theme.borderRadius.full, overflow: 'hidden', marginTop: 16 },
  submitGradient: { paddingVertical: 15, alignItems: 'center' },
  submitBtnText: { color: Colors.white, fontSize: 16, fontWeight: '700' },

  successBox: {
    backgroundColor: Colors.card,
    borderRadius: Theme.borderRadius.xl,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    ...Theme.shadow.md,
  },
  successEmoji: { fontSize: 48, marginBottom: 12 },
  successTitle: { fontSize: 22, fontWeight: '800', color: Colors.text, marginBottom: 6 },
  successSub: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  anotherBtn: {
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: Theme.borderRadius.full,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  anotherBtnText: { color: Colors.primary, fontWeight: '700' },

  allReviewsSection: { paddingHorizontal: 20 },
});

const marqueeStyles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    paddingVertical: 20,
    backgroundColor: Colors.backgroundDark,
  },
  track: { flexDirection: 'row', paddingHorizontal: 16 },
  card: {
    backgroundColor: Colors.card,
    borderRadius: Theme.borderRadius.lg,
    padding: 18,
    marginRight: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    ...Theme.shadow.sm,
  },
  stars: { flexDirection: 'row', gap: 3, marginBottom: 10 },
  star: { fontSize: 15 },
  starFilled: { color: Colors.accent },
  starEmpty: { color: Colors.cardBorder },
  message: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
    fontStyle: 'italic',
    flex: 1,
    marginBottom: 12,
  },
  footer: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: Colors.white, fontWeight: '800', fontSize: 13 },
  name: { fontSize: 13, fontWeight: '700', color: Colors.text },
});

const reviewStyles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: Theme.borderRadius.lg,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    ...Theme.shadow.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: Colors.white, fontWeight: '800', fontSize: 16 },
  headerInfo: { flex: 1 },
  reviewerName: { fontSize: 14, fontWeight: '800', color: Colors.text },
  date: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  ratingBadge: {
    backgroundColor: Colors.accent + '22',
    borderRadius: Theme.borderRadius.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  ratingText: { color: Colors.accent, fontSize: 12, fontWeight: '700' },
  message: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 21,
    fontStyle: 'italic',
  },
});

const starStyles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8, marginBottom: 4 },
  star: { fontSize: 34, color: Colors.cardBorder },
  starFilled: { color: Colors.accent },
});
