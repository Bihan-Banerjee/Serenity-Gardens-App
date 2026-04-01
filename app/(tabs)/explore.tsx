import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions,
  Animated,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { Theme } from '../../constants/theme';

const { width: W } = Dimensions.get('window');
const CARD_W = (W - 48) / 2;

type Category = 'All' | 'Flora' | 'Fauna' | 'Ponds' | 'Farm';

interface ExploreItem {
  id: string;
  name: string;
  category: Exclude<Category, 'All'>;
  description: string;
  image: string;
  highlight?: string;
}

const ITEMS: ExploreItem[] = [
  { id: '1', name: 'Family Picnic', category: 'Farm', description: 'Perfect getaway spot for family picnics.', image: 'https://res.cloudinary.com/drj7t97rd/image/upload/v1775048793/picnic_vnwepx.jpg'},
  { id: '2', name: 'Evening Escapade', category: 'Flora', description: 'Escape the city buzz and enjoy an evening under the stars.', image: 'https://res.cloudinary.com/drj7t97rd/image/upload/v1775050378/lawn_vqkxlw.png' },
  { id: '3', name: 'Bird Haven', category: 'Fauna', description: 'Regular sightings of colorful songbirds, cormorants and majestic kingfishers.',  image: 'https://res.cloudinary.com/drj7t97rd/image/upload/v1748433091/bird_s4yydk.jpg', highlight: '30+ species' },
  { id: '4', name: 'Pond of Life', category: 'Ponds', description: 'Teeming with fish, crabs, etc., it offers a serene spot for reflection and relaxation.',  image: 'https://res.cloudinary.com/drj7t97rd/image/upload/v1775048803/pond_apy4sa.jpg' },
  { id: '5', name: 'Vermicompost Area', category: 'Fauna', description: 'Where organic waste is broken down into nutrient rich compost by earthworms.',  image: 'https://res.cloudinary.com/drj7t97rd/image/upload/v1775050769/worm_ja7k3q.png', highlight: 'Fertilizer sold too!' },
  { id: '6', name: 'Photoshoot Spot', category: 'Farm', description: 'A picturesque gazebo, lawn, and pond surrounded by vibrant flowers, ideal for memorable photoshoots.', image: 'https://res.cloudinary.com/drj7t97rd/image/upload/v1766638884/WhatsApp_Image_2025-12-05_at_11.20.171_rsdmwn.jpg'},
];

const CATEGORIES: Category[] = ['All', 'Flora', 'Fauna', 'Ponds', 'Farm'];

const CATEGORY_EMOJI: Record<Category, string> = {
  All: '🌍',
  Flora: '🌱',
  Fauna: '🦋',
  Ponds: '💧',
  Farm: '🚜',
};

function ExploreCard({ item, delay }: { item: ExploreItem; delay: number }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(anim, {
      toValue: 1,
      delay,
      tension: 55,
      friction: 11,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.card,
        {
          opacity: anim,
          transform: [
            {
              translateY: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [24, 0],
              }),
            },
          ],
        },
      ]}
    >
      <Image source={{ uri: item.image }} style={styles.cardImage} resizeMode="cover" />
      <LinearGradient colors={['transparent', 'rgba(26,43,26,0.75)']} style={styles.cardGradient} />
      <View style={styles.cardContent}>
        <Text style={styles.cardEmoji}>{item.emoji}</Text>
        {item.highlight && (
          <View style={styles.highlightBadge}>
            <Text style={styles.highlightText}>{item.highlight}</Text>
          </View>
        )}
        <Text style={styles.cardName}>{item.name}</Text>
        <Text style={styles.cardDesc} numberOfLines={4}>{item.description}</Text>
      </View>
    </Animated.View>
  );
}

export default function ExploreScreen() {
  const [active, setActive] = useState<Category>('All');
  const headerAnim = useRef(new Animated.Value(0)).current;

  const filtered = active === 'All' ? ITEMS : ITEMS.filter((i) => i.category === active);

  useEffect(() => {
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Animated.View style={[styles.header, { opacity: headerAnim }]}>
        <Text style={styles.headerLabel}>Serenity Gardens</Text>
        <Text style={styles.headerTitle}>Explore the Estate</Text>
      </Animated.View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0, flexShrink: 0, maxHeight: 60, marginBottom: 10 }}
        contentContainerStyle={{ gap: 12, paddingHorizontal: 16, alignItems: 'center' }}
      >
        {CATEGORIES.map((cat) => (
          <Pressable
            key={cat}
            onPress={() => setActive(cat)}
            style={({ pressed }) => [
              styles.tab,
              active === cat && styles.tabActive,
              { transform: [{ scale: pressed ? 0.95 : 1 }], opacity: pressed ? 0.8 : 1 }
            ]}
          >
            <Text style={styles.tabEmoji}>{CATEGORY_EMOJI[cat]}</Text>
            <Text style={[styles.tabText, active === cat && styles.tabTextActive]}>{cat}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
        <View style={styles.row}>
          {filtered.map((item, i) => (
            <ExploreCard key={item.id} item={item} delay={i * 60} />
          ))}
        </View>
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
  headerLabel: { fontSize: 11, color: Colors.secondary, letterSpacing: 2.5, textTransform: 'uppercase', fontWeight: '700', marginBottom: 2 },
  headerTitle: { fontSize: 26, fontWeight: '800', color: Colors.text, letterSpacing: -0.4 },
  tabsContainer: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  tab: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 14, paddingVertical: 8, borderRadius: Theme.borderRadius.full, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.cardBorder, ...Theme.shadow.sm },
  tabActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  tabEmoji: { fontSize: 14 },
  tabText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  tabTextActive: { color: Colors.white },
  grid: { paddingHorizontal: 16 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between' },
  card: { width: CARD_W, height: 200, borderRadius: Theme.borderRadius.lg, overflow: 'hidden', marginBottom: 4, ...Theme.shadow.md },
  cardImage: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' },
  cardGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '65%' },
  cardContent: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 12 },
  cardEmoji: { fontSize: 20, marginBottom: 4 },
  highlightBadge: { alignSelf: 'flex-start', backgroundColor: Colors.accent, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2, marginBottom: 4 },
  highlightText: { color: Colors.white, fontSize: 9, fontWeight: '800', letterSpacing: 0.5, textTransform: 'uppercase' },
  cardName: { color: Colors.white, fontSize: 14, fontWeight: '800', marginBottom: 2 },
  cardDesc: { color: 'rgba(255,255,255,0.78)', fontSize: 11, lineHeight: 15 },
});