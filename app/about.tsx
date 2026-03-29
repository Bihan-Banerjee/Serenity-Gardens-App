import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  Pressable,
  Dimensions,
  Image,
  PanResponder,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Colors } from '../constants/colors';
import { Theme } from '../constants/theme';

const { width: W } = Dimensions.get('window');

// ── Types ─────────────────────────────────────────────────
interface Milestone {
  year: string;
  title: string;
  desc: string;
  emoji: string;
}

interface TeamMember {
  name: string;
  role: string;
  emoji: string;
  color: string;
}

// ── Data ──────────────────────────────────────────────────
const MILESTONES: Milestone[] = [
  { year: '2008', title: 'Founded', emoji: '🌱', desc: 'The garden started as a small backyard experiment.' },
  { year: '2012', title: 'First Harvest', emoji: '🌾', desc: 'First commercial harvest of organic vegetables.' },
  { year: '2016', title: 'Pisciculture', emoji: '🐟', desc: 'Fish farming added — rohu, catla and mrigal.' },
  { year: '2019', title: 'Solar Panels', emoji: '☀️', desc: 'Went 80% solar. Zero chemical farming certified.' },
  { year: '2022', title: 'Open to Visitors', emoji: '🚪', desc: 'Opened gates for guided tours and retreats.' },
  { year: '2024', title: 'Online Store', emoji: '🛒', desc: 'Launched Serenity Gardens online for fresh delivery.' },
];

const TEAM: TeamMember[] = [
  { name: 'Baba', role: 'Founder & Head Farmer', emoji: '👨‍🌾', color: '#D4EDDA' },
  { name: 'Ma', role: 'Garden Curator', emoji: '👩‍🌾', color: '#FFF3CD' },
  { name: 'Jeja', role: 'Pisciculture Manager', emoji: '🎣', color: '#D1E8F7' },
  { name: 'Jemma', role: 'Visitor Experience', emoji: '🌸', color: '#F8D7DA' },
];

const VALUES = [
  { emoji: '🌿', title: 'Organic Always', body: 'Zero pesticides. Zero chemicals. Always.' },
  { emoji: '💧', title: 'Water Wise', body: 'Rainwater harvesting feeds 100% of our irrigation.' },
  { emoji: '☀️', title: 'Solar Powered', body: '80% of energy comes from our rooftop solar array.' },
  { emoji: '🤝', title: 'Community First', body: 'Local employment and fair wages for all workers.' },
];

// ── Compare Slider ────────────────────────────────────────
function CompareSlider() {
  const [sliderX, setSliderX] = useState(W * 0.5 - 32);
  const panRef = useRef(new Animated.Value(0)).current;

  const SLIDER_W = W - 64;
  const BEFORE_URI = 'https://images.unsplash.com/photo-1558449907-298b08698b43?w=600&q=75';
  const AFTER_URI = 'https://images.unsplash.com/photo-1416879107082-7dd74f3d32f6?w=600&q=75';

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gs) => {
      const newX = Math.max(0, Math.min(SLIDER_W, sliderX + gs.dx));
      setSliderX(newX);
    },
  });

  const fraction = sliderX / SLIDER_W;

  return (
    <View style={compareStyles.container}>
      <Text style={compareStyles.label}>Before & After — Seasonal Transform</Text>
      <View style={[compareStyles.slider, { width: SLIDER_W }]}>
        {/* After (full) */}
        <Image source={{ uri: AFTER_URI }} style={compareStyles.image} resizeMode="cover" />
        {/* Before (clipped) */}
        <View style={[compareStyles.beforeClip, { width: sliderX }]}>
          <Image
            source={{ uri: BEFORE_URI }}
            style={[compareStyles.image, { width: SLIDER_W }]}
            resizeMode="cover"
          />
        </View>
        {/* Handle */}
        <View
          style={[compareStyles.handle, { left: sliderX - 20 }]}
          {...panResponder.panHandlers}
        >
          <View style={compareStyles.handleLine} />
          <View style={compareStyles.handleKnob}>
            <Text style={compareStyles.handleText}>⇔</Text>
          </View>
          <View style={compareStyles.handleLine} />
        </View>
        {/* Labels */}
        <View style={compareStyles.beforeLabel}>
          <Text style={compareStyles.labelText}>Before</Text>
        </View>
        <View style={compareStyles.afterLabel}>
          <Text style={compareStyles.labelText}>After</Text>
        </View>
      </View>
    </View>
  );
}

// ── Timeline ──────────────────────────────────────────────
function Timeline() {
  const anims = useRef(MILESTONES.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.stagger(
      120,
      anims.map((a) =>
        Animated.spring(a, { toValue: 1, tension: 55, friction: 11, useNativeDriver: true })
      )
    ).start();
  }, []);

  return (
    <View style={tlStyles.container}>
      {MILESTONES.map((m, i) => (
        <Animated.View
          key={m.year}
          style={[
            tlStyles.row,
            {
              opacity: anims[i],
              transform: [
                {
                  translateX: anims[i].interpolate({
                    inputRange: [0, 1],
                    outputRange: [i % 2 === 0 ? -30 : 30, 0],
                  }),
                },
              ],
            },
          ]}
        >
          {/* Left */}
          <View style={[tlStyles.side, { alignItems: 'flex-end' }]}>
            {i % 2 === 0 ? (
              <>
                <Text style={tlStyles.year}>{m.year}</Text>
                <Text style={tlStyles.milestoneTitle}>{m.title}</Text>
                <Text style={tlStyles.milestoneDesc}>{m.desc}</Text>
              </>
            ) : (
              <View style={{ width: 12 }} />
            )}
          </View>

          {/* Center */}
          <View style={tlStyles.center}>
            <View style={tlStyles.dot}>
              <Text style={tlStyles.dotEmoji}>{m.emoji}</Text>
            </View>
            {i < MILESTONES.length - 1 && <View style={tlStyles.line} />}
          </View>

          {/* Right */}
          <View style={tlStyles.side}>
            {i % 2 !== 0 ? (
              <>
                <Text style={tlStyles.year}>{m.year}</Text>
                <Text style={tlStyles.milestoneTitle}>{m.title}</Text>
                <Text style={tlStyles.milestoneDesc}>{m.desc}</Text>
              </>
            ) : (
              <View style={{ width: 12 }} />
            )}
          </View>
        </Animated.View>
      ))}
    </View>
  );
}

// ── Main Screen ───────────────────────────────────────────
export default function AboutScreen() {
  const headerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 700,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero Banner */}
      <View style={styles.heroBanner}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=800&q=80' }}
          style={StyleSheet.absoluteFillObject}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['rgba(26,43,26,0.35)', 'rgba(26,43,26,0.88)']}
          style={styles.heroGradient}
        >
          <Animated.View style={{ opacity: headerAnim }}>
            <Text style={styles.heroEyebrow}>Est. 2008 · West Bengal</Text>
            <Text style={styles.heroTitle}>About Serenity Gardens</Text>
            <Text style={styles.heroBody}>
              A family-run farmhouse retreat rooted in sustainable living,
              organic farming, and open hearts.
            </Text>
          </Animated.View>
        </LinearGradient>
      </View>

      {/* Our Story */}
      <View style={styles.section}>
        <Text style={styles.sectionEyebrow}>Our Story</Text>
        <Text style={styles.sectionTitle}>From Seed to Sanctuary</Text>
        <Text style={styles.bodyText}>
          What started as one family's love for the land has grown into a
          thriving ecosystem — 12 acres of organic gardens, fish ponds,
          flower beds, and forest patches that breathe life into everyone
          who walks through.
        </Text>
        <Text style={styles.bodyText}>
          We believe in farming as a way of life, not just an industry.
          Everything here — from the solar panels to the worm compost bins —
          exists to prove that beauty and sustainability aren't opposites.
        </Text>
      </View>

      {/* Compare Slider */}
      <CompareSlider />

      {/* Values */}
      <View style={styles.section}>
        <Text style={styles.sectionEyebrow}>What We Stand For</Text>
        <Text style={styles.sectionTitle}>Our Values</Text>
        <View style={styles.valuesGrid}>
          {VALUES.map((v) => (
            <View key={v.title} style={styles.valueCard}>
              <Text style={styles.valueEmoji}>{v.emoji}</Text>
              <Text style={styles.valueTitle}>{v.title}</Text>
              <Text style={styles.valueBody}>{v.body}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Timeline */}
      <View style={styles.section}>
        <Text style={styles.sectionEyebrow}>Our Journey</Text>
        <Text style={styles.sectionTitle}>Milestones</Text>
      </View>
      <Timeline />

      {/* Team */}
      <View style={styles.section}>
        <Text style={styles.sectionEyebrow}>The People</Text>
        <Text style={styles.sectionTitle}>Meet the Family</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 12, paddingRight: 20 }}
        >
          {TEAM.map((member) => (
            <View
              key={member.name}
              style={[styles.teamCard, { backgroundColor: member.color }]}
            >
              <Text style={styles.teamEmoji}>{member.emoji}</Text>
              <Text style={styles.teamName}>{member.name}</Text>
              <Text style={styles.teamRole}>{member.role}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Visit CTA */}
      <View style={[styles.section, { paddingBottom: 40 }]}>
        <LinearGradient
          colors={[Colors.primaryDark, Colors.primary]}
          style={styles.visitBanner}
        >
          <Text style={styles.visitEmoji}>📍</Text>
          <Text style={styles.visitTitle}>Come Visit Us</Text>
          <Text style={styles.visitBody}>
            Open to visitors on weekends. Guided tours, fresh produce
            pick, and nature walks available.
          </Text>
          <View style={styles.visitDetail}>
            <Text style={styles.visitDetailText}>📅 Sat & Sun · 9 AM – 5 PM</Text>
            <Text style={styles.visitDetailText}>📞 Contact us via the review form</Text>
          </View>
        </LinearGradient>
      </View>
    </ScrollView>
  );
}

// ── StyleSheets ───────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  heroBanner: { height: 300, position: 'relative' },
  heroGradient: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 24,
    paddingBottom: 30,
  },
  heroEyebrow: {
    color: Colors.accentLight,
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
    fontWeight: '700',
    marginBottom: 6,
  },
  heroTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: Colors.white,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  heroBody: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    lineHeight: 21,
  },

  section: { paddingHorizontal: 20, paddingTop: 28 },
  sectionEyebrow: {
    fontSize: 11,
    color: Colors.secondary,
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    fontWeight: '700',
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.4,
    marginBottom: 14,
  },
  bodyText: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 24,
    marginBottom: 12,
  },

  valuesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  valueCard: {
    width: (W - 52) / 2,
    backgroundColor: Colors.card,
    borderRadius: Theme.borderRadius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    ...Theme.shadow.sm,
  },
  valueEmoji: { fontSize: 28, marginBottom: 8 },
  valueTitle: { fontSize: 14, fontWeight: '800', color: Colors.text, marginBottom: 4 },
  valueBody: { fontSize: 12, color: Colors.textSecondary, lineHeight: 17 },

  teamCard: {
    width: 140,
    borderRadius: Theme.borderRadius.xl,
    padding: 20,
    alignItems: 'center',
    ...Theme.shadow.sm,
  },
  teamEmoji: { fontSize: 40, marginBottom: 10 },
  teamName: { fontSize: 15, fontWeight: '800', color: Colors.text, marginBottom: 3 },
  teamRole: { fontSize: 11, color: Colors.textSecondary, textAlign: 'center', lineHeight: 15 },

  visitBanner: {
    borderRadius: Theme.borderRadius.xl,
    padding: 28,
    ...Theme.shadow.md,
  },
  visitEmoji: { fontSize: 36, marginBottom: 10 },
  visitTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.white,
    marginBottom: 8,
  },
  visitBody: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.78)',
    lineHeight: 21,
    marginBottom: 16,
  },
  visitDetail: { gap: 6 },
  visitDetailText: {
    color: Colors.accentLight,
    fontSize: 13,
    fontWeight: '600',
  },
});

const compareStyles = StyleSheet.create({
  container: { paddingHorizontal: 20, paddingTop: 28 },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  slider: {
    height: 220,
    borderRadius: Theme.borderRadius.xl,
    overflow: 'hidden',
    position: 'relative',
    ...Theme.shadow.md,
  },
  image: { width: '100%', height: '100%', position: 'absolute' },
  beforeClip: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    overflow: 'hidden',
  },
  handle: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  handleLine: { flex: 1, width: 2, backgroundColor: Colors.white },
  handleKnob: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...Theme.shadow.md,
  },
  handleText: { fontSize: 16 },
  beforeLabel: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  afterLabel: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  labelText: { color: Colors.white, fontSize: 11, fontWeight: '700' },
});

const tlStyles = StyleSheet.create({
  container: { paddingVertical: 10, paddingHorizontal: 20 },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    minHeight: 90,
  },
  side: { flex: 1, paddingHorizontal: 8, paddingTop: 4 },
  center: { alignItems: 'center', width: 56 },
  dot: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.card,
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Theme.shadow.sm,
    zIndex: 2,
  },
  dotEmoji: { fontSize: 20 },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: Colors.sageMuted,
    marginVertical: 2,
    zIndex: 1,
  },
  year: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  milestoneTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 3,
  },
  milestoneDesc: {
    fontSize: 11,
    color: Colors.textSecondary,
    lineHeight: 15,
  },
});
