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
  emoji: string;
  image: string;
  highlight?: string;
}

const ITEMS: ExploreItem[] = [
  {
    id: '1',
    name: 'Rose Garden',
    category: 'Flora',
    description: 'Over 40 varieties of roses blooming across the estate.',
    emoji: '🌹',
    image: 'https://images.unsplash.com/photo-1490750967868-88df5691cc91?w=400&q=75',
    highlight: 'Over 40 varieties',
  },
  {
    id: '2',
    name: 'Kingfisher',
    category: 'Fauna',
    description: 'Common kingfishers nest near the eastern pond.',
    emoji: '🐦',
    image: 'https://images.unsplash.com/photo-1444464666168-49d633b86797?w=400&q=75',
    highlight: 'Resident bird',
  },
  {
    id: '3',
    name: 'Lotus Pond',
    category: 'Ponds',
    description: 'A serene pond carpeted with pink and white lotus.',
    emoji: '🪷',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=75',
    highlight: 'Year-round blooms',
  },
  {
    id: '4',
    name: 'Vegetable Beds',
    category: 'Farm',
    description: 'Organically farmed cabbages, tomatoes, greens, and herbs.',
    emoji: '🥬',
    image: 'https://images.unsplash.com/photo-1416879107082-7dd74f3d32f6?w=400&q=75',
    highlight: 'Chemical-free',
  },
  {
    id: '5',
    name: 'Mushroom Grove',
    category: 'Flora',
    description: 'Wild and cultivated mushrooms thrive in the damp corners.',
    emoji: '🍄',
    image: 'https://images.unsplash.com/photo-1504708001879-c57d2c8b7f0e?w=400&q=75',
  },
  {
    id: '6',
    name: 'Rohu & Catla',
    category: 'Ponds',
    description: 'Our fish ponds are home to rohu, catla, and mrigal.',
    emoji: '🐟',
    image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&q=75',
    highlight: 'Pisciculture',
  },
  {
    id: '7',
    name: 'Purple Martin',
    category: 'Fauna',
    description: 'Purple martins are spotted near the herb garden at dusk.',
    emoji: '🐝',
    image: 'https://images.unsplash.com/photo-1444464666168-49d633b86797?w=400&q=75',
  },
  {
    id: '8',
    name: 'Solar Array',
    category: 'Farm',
    description: 'Our rooftop solar panels power 80% of the estate\'s needs.',
    emoji: '☀️',
    image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&q=75',
    highlight: '80% renewable',
  },
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
      <Image
        source={{ uri: item.image }}
        style={styles.cardImage}
        resizeMode="cover"
      />
      <LinearGradient
        colors={['transparent', 'rgba(26,43,26,0.75)']}
        style={styles.cardGradient}
      />
      <View style={styles.cardContent}>
        <Text style={styles.cardEmoji}>{item.emoji}</Text>
        {item.highlight && (
          <View style={styles.highlightBadge}>
            <Text style={styles.highlightText}>{item.highlight}</Text>
          </View>
        )}
        <Text style={styles.cardName}>{item.name}</Text>
        <Text style={styles.cardDesc} numberOfLines={2}>
          {item.description}
        </Text>
      </View>
    </Animated.View>
  );
}

export default function ExploreScreen() {
  const [active, setActive] = useState<Category>('All');
  const headerAnim = useRef(new Animated.Value(0)).current;

  const filtered =
    active === 'All' ? ITEMS : ITEMS.filter((i) => i.category === active);

  useEffect(() => {
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <Animated.View style={[styles.header, { opacity: headerAnim }]}>
        <Text style={styles.headerLabel}>Serenity Gardens</Text>
        <Text style={styles.headerTitle}>Explore the Estate</Text>
      </Animated.View>

      {/* Category Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0, maxHeight: 60, marginBottom: 10 }}
        contentContainerStyle={{ 
          gap: 12,               // Adds space BETWEEN tabs
          paddingHorizontal: 16, // Adds space at the start and end of the list
          alignItems: 'center'   // Centers them vertically
        }}
      >
        {CATEGORIES.map((cat) => (
          <Pressable
            key={cat}
            onPress={() => setActive(cat)}
            style={[styles.tab, active === cat && styles.tabActive]}
          >
            <Text style={styles.tabEmoji}>{CATEGORY_EMOJI[cat]}</Text>
            <Text style={[styles.tabText, active === cat && styles.tabTextActive]}>
              {cat}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Cards Grid */}
      <ScrollView
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
      >
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
  headerLabel: {
    fontSize: 11,
    color: Colors.secondary,
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    fontWeight: '700',
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.4,
  },

  tabsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Theme.borderRadius.full,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    ...Theme.shadow.sm,
  },
  tabActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  tabEmoji: { fontSize: 14 },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  tabTextActive: { color: Colors.white },

  grid: { paddingHorizontal: 16 },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },

  card: {
    width: CARD_W,
    height: 200,
    borderRadius: Theme.borderRadius.lg,
    overflow: 'hidden',
    marginBottom: 4,
    ...Theme.shadow.md,
  },
  cardImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  cardGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '65%',
  },
  cardContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
  },
  cardEmoji: { fontSize: 20, marginBottom: 4 },
  highlightBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.accent,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginBottom: 4,
  },
  highlightText: {
    color: Colors.white,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  cardName: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 2,
  },
  cardDesc: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 11,
    lineHeight: 15,
  },
});
