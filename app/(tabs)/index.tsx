import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  Animated,
  ImageBackground,
  Pressable,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { Theme } from '../../constants/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const HERO_IMAGES = [
  { uri: 'https://res.cloudinary.com/drj7t97rd/image/upload/v1766638884/WhatsApp_Image_2025-12-05_at_11.20.171_rsdmwn.jpg', tag: '' },
  { uri: 'https://res.cloudinary.com/drj7t97rd/image/upload/v1766638885/WhatsApp_Image_2025-12-05_at_11.42.50_lh3or7.jpg', tag: '' },
  { uri: 'https://res.cloudinary.com/drj7t97rd/image/upload/v1766638884/WhatsApp_Image_2025-12-05_at_11.20.16_xhcfgq.jpg', tag: '' },
  { uri: 'https://res.cloudinary.com/drj7t97rd/image/upload/v1766638883/WhatsApp_Image_2025-12-05_at_10.43.551_x2y2k6.jpg', tag: '' },
];

const FEATURES = [
  { emoji: '🌱', title: 'Explore', subtitle: 'Flora & Fauna', route: '/explore', color: '#D4EDDA' },
  { emoji: '🖼️', title: 'Gallery', subtitle: 'Curated Moments', route: '/gallery', color: '#D1E8F7' },
  { emoji: '🛒', title: 'Shop', subtitle: 'Fresh From Farm', route: '/menu', color: '#FFF3CD' },
  { emoji: '⭐', title: 'Reviews', subtitle: 'Our Guests Say', route: '/reviews', color: '#F8D7DA' },
  { emoji: '🏡', title: 'About Us', subtitle: 'Our Story', route: '/about', color: '#E2D9F3' },
  { emoji: '👤', title: 'Your Profile', subtitle: 'View account history', route: '/profile', color: '#D4EDDA' },
];

const MARQUEE_ITEMS = [
  '🌿 Organic Farming', '🐟 Pisciculture', '🌸 Seasonal Flowers', '🥬 Fresh Vegetables',
  '🌳 100+ Tree Species', '🦋 Wildlife Habitat', '☀️ Solar Powered', '💧 Rainwater Harvesting',
];

function HeroCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<FlatList>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 12, useNativeDriver: true }),
    ]).start();

    const timer = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % HERO_IMAGES.length;
        scrollRef.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  return (
    <View style={styles.heroContainer}>
      <FlatList
        ref={scrollRef}
        data={HERO_IMAGES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, i) => String(i)}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
          setActiveIndex(index);
        }}
        renderItem={({ item }) => (
          <ImageBackground source={{ uri: item.uri }} style={styles.heroImage} imageStyle={{ resizeMode: 'cover' }}>
            <LinearGradient colors={['transparent', 'rgba(26,43,26,0.7)', 'rgba(26,43,26,0.9)']} style={styles.heroGradient}>
              <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                <Text style={styles.heroTag}>{item.tag}</Text>
              </Animated.View>
            </LinearGradient>
          </ImageBackground>
        )}
      />

      <Animated.View style={[styles.heroTextContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <Text style={styles.heroTitle}>Serenity</Text>
        <Text style={styles.heroTitleAccent}>Gardens</Text>
        <Text style={styles.heroSubtitle}>A tranquil farmhouse retreat — nature, nourishment & peace</Text>
      </Animated.View>

      <View style={styles.dotsContainer}>
        {HERO_IMAGES.map((_, i) => (
          <View key={i} style={[styles.dot, i === activeIndex && styles.dotActive]} />
        ))}
      </View>
    </View>
  );
}

function MarqueeRow() {
  const scrollX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const totalWidth = MARQUEE_ITEMS.length * 160;
    const anim = Animated.loop(Animated.timing(scrollX, { toValue: -totalWidth, duration: totalWidth * 20, useNativeDriver: true }));
    anim.start();
    return () => anim.stop();
  }, []);

  return (
    <View style={styles.marqueeContainer}>
      <Animated.View style={[styles.marqueeInner, { transform: [{ translateX: scrollX }] }]}>
        {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
          <View key={i} style={styles.marqueeItem}>
            <Text style={styles.marqueeText}>{item}</Text>
            <Text style={styles.marqueeDivider}>·</Text>
          </View>
        ))}
      </Animated.View>
    </View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const cardAnims = useRef(FEATURES.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const anims = cardAnims.map((anim, i) =>
      Animated.spring(anim, { toValue: 1, delay: 300 + i * 80, tension: 60, friction: 12, useNativeDriver: true })
    );
    Animated.parallel(anims).start();
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} bounces>
        <HeroCarousel />

        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeEyebrow}>Welcome to</Text>
          <Text style={styles.welcomeTitle}>Your Green Sanctuary</Text>
          <Text style={styles.welcomeBody}>
            Nestled in nature, Serenity Gardens is a working farmhouse that grows organic produce, houses pisciculture ponds, and opens its doors to visitors seeking calm amidst greenery.
          </Text>
          <Pressable 
            style={({ pressed }) => [
              styles.ctaButton, 
              { transform: [{ scale: pressed ? 0.95 : 1 }], opacity: pressed ? 0.9 : 1 }
            ]} 
            onPress={() => router.push('/about')}
          >
            <LinearGradient colors={[Colors.primaryLight, Colors.primary]} style={styles.ctaGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Text style={styles.ctaText}>Discover Our Story →</Text>
            </LinearGradient>
          </Pressable>
        </View>

        <MarqueeRow />

        <View style={styles.featuresSection}>
          <Text style={styles.sectionLabel}>Explore</Text>
          <Text style={styles.sectionTitle}>Everything We Offer</Text>
          <View style={styles.featuresGrid}>
            {FEATURES.map((feature, i) => (
              <Animated.View
                key={feature.title}
                style={{
                  opacity: cardAnims[i],
                  transform: [{ translateY: cardAnims[i].interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
                  width: '48%',
                }}
              >
                <Pressable
                  style={({ pressed }) => [styles.featureCard, { backgroundColor: feature.color }, pressed && styles.featureCardPressed]}
                  onPress={() => router.push(feature.route as any)}
                >
                  <Text style={styles.featureEmoji}>{feature.emoji}</Text>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureSubtitle}>{feature.subtitle}</Text>
                  <Text style={styles.featureArrow}>→</Text>
                </Pressable>
              </Animated.View>
            ))}
          </View>
        </View>

        <View style={styles.quoteBanner}>
          <LinearGradient colors={[Colors.primaryDark, Colors.primary]} style={styles.quoteBannerInner}>
            <Text style={styles.quoteText}>"In every walk with nature, one receives far more than he seeks."</Text>
            <Text style={styles.quoteAuthor}>— John Muir</Text>
          </LinearGradient>
        </View>
        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  heroContainer: { height: SCREEN_HEIGHT * 0.52, position: 'relative' },
  heroImage: { width: SCREEN_WIDTH, height: SCREEN_HEIGHT * 0.52 },
  heroGradient: { flex: 1, justifyContent: 'flex-end', paddingBottom: 80, paddingHorizontal: 24 },
  heroTag: { color: Colors.accentLight, fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', fontWeight: '700', marginBottom: 8 },
  heroTextContainer: { position: 'absolute', bottom: 60, left: 24, right: 24 },
  heroTitle: { fontSize: 44, fontWeight: '300', color: Colors.white, letterSpacing: -0.5, lineHeight: 48 },
  heroTitleAccent: { fontSize: 44, fontWeight: '800', color: Colors.accentLight, letterSpacing: -0.5, lineHeight: 50 },
  heroSubtitle: { color: 'rgba(255,255,255,0.82)', fontSize: 14, marginTop: 8, lineHeight: 21, maxWidth: '80%' },
  dotsContainer: { position: 'absolute', bottom: 16, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.4)' },
  dotActive: { backgroundColor: Colors.accentLight, width: 20 },
  welcomeSection: { padding: 24, paddingTop: 32 },
  welcomeEyebrow: { fontSize: 12, color: Colors.secondary, letterSpacing: 2, textTransform: 'uppercase', fontWeight: '700', marginBottom: 6 },
  welcomeTitle: { fontSize: 28, fontWeight: '800', color: Colors.text, letterSpacing: -0.5, marginBottom: 12 },
  welcomeBody: { fontSize: 15, color: Colors.textSecondary, lineHeight: 24, marginBottom: 20 },
  ctaButton: { borderRadius: Theme.borderRadius.full, overflow: 'hidden', alignSelf: 'flex-start' },
  ctaGradient: { paddingHorizontal: 24, paddingVertical: 13 },
  ctaText: { color: Colors.white, fontWeight: '700', fontSize: 15 },
  marqueeContainer: { overflow: 'hidden', backgroundColor: Colors.primary, paddingVertical: 12 },
  marqueeInner: { flexDirection: 'row', alignItems: 'center' },
  marqueeItem: { flexDirection: 'row', alignItems: 'center' },
  marqueeText: { color: Colors.accentLight, fontWeight: '600', fontSize: 13, letterSpacing: 0.5, paddingHorizontal: 8 },
  marqueeDivider: { color: Colors.sageMuted, fontSize: 16, opacity: 0.5 },
  featuresSection: { paddingHorizontal: 20, paddingTop: 32 },
  sectionLabel: { fontSize: 11, color: Colors.secondary, letterSpacing: 2.5, textTransform: 'uppercase', fontWeight: '700', marginBottom: 4 },
  sectionTitle: { fontSize: 24, fontWeight: '800', color: Colors.text, marginBottom: 20, letterSpacing: -0.4 },
  featuresGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  featureCard: { borderRadius: Theme.borderRadius.lg, padding: 20, marginBottom: 4, ...Theme.shadow.sm },
  featureCardPressed: { opacity: 0.88, transform: [{ scale: 0.95 }] },
  featureEmoji: { fontSize: 30, marginBottom: 10 },
  featureTitle: { fontSize: 16, fontWeight: '800', color: Colors.text, marginBottom: 2 },
  featureSubtitle: { fontSize: 12, color: Colors.textSecondary, marginBottom: 12 },
  featureArrow: { fontSize: 16, color: Colors.primary, fontWeight: '700' },
  quoteBanner: { margin: 20, borderRadius: Theme.borderRadius.xl, overflow: 'hidden', ...Theme.shadow.md },
  quoteBannerInner: { padding: 28 },
  quoteText: { color: Colors.white, fontSize: 17, fontStyle: 'italic', lineHeight: 26, marginBottom: 12, fontWeight: '400' },
  quoteAuthor: { color: Colors.accentLight, fontSize: 13, fontWeight: '700', letterSpacing: 0.5 },
});