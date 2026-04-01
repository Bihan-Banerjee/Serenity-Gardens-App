import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Pressable,
  Modal,
  Image,
  FlatList,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { Theme } from '../../constants/theme';

const { width: W, height: H } = Dimensions.get('window');

const GALLERY_ITEMS = [
  { id: '1', uri: 'https://images.unsplash.com/photo-1416879107082-7dd74f3d32f6?w=600&q=80', label: 'Main Garden', height: 180 },
  { id: '2', uri: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80', label: 'Aerial View', height: 120 },
  { id: '3', uri: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=600&q=80', label: 'Lotus Pond', height: 140 },
  { id: '4', uri: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80', label: 'Flower Lane', height: 160 },
  { id: '5', uri: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=600&q=80', label: 'Greenhouse', height: 130 },
  { id: '6', uri: 'https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?w=600&q=80', label: 'Bird Bath', height: 170 },
  { id: '7', uri: 'https://images.unsplash.com/photo-1477554193778-9562c28588c0?w=600&q=80', label: 'Nursery', height: 150 },
  { id: '8', uri: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=600&q=80', label: 'Meadow', height: 135 },
  { id: '9', uri: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=600&q=80', label: 'Gazebo', height: 155 },
  { id: '10', uri: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600&q=80', label: 'Garden Path', height: 140 },
];

const COL_W = (W - 48) / 2;

const leftCol = GALLERY_ITEMS.filter((_, i) => i % 2 === 0);
const rightCol = GALLERY_ITEMS.filter((_, i) => i % 2 !== 0);

interface GalleryTileProps {
  item: (typeof GALLERY_ITEMS)[0];
  delay: number;
  onPress: () => void;
}

function GalleryTile({ item, delay, onPress }: GalleryTileProps) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(anim, {
      toValue: 1,
      delay,
      tension: 50,
      friction: 10,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={{ opacity: anim, transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }) }], marginBottom: 12 }}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [{ opacity: pressed ? 0.88 : 1, transform: [{ scale: pressed ? 0.96 : 1 }] }]}
      >
        <View style={[styles.tile, { height: item.height, borderRadius: Theme.borderRadius.lg }]}>
          <Image source={{ uri: item.uri }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
          <LinearGradient colors={['transparent', 'rgba(26,43,26,0.6)']} style={styles.tileGradient}>
            <Text style={styles.tileLabel}>{item.label}</Text>
          </LinearGradient>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function GalleryScreen() {
  const [selected, setSelected] = useState<(typeof GALLERY_ITEMS)[0] | null>(null);
  const scaleAnim = useRef(new Animated.Value(0)).current;

  const openModal = (item: (typeof GALLERY_ITEMS)[0]) => {
    setSelected(item);
    Animated.spring(scaleAnim, { toValue: 1, tension: 70, friction: 12, useNativeDriver: true }).start();
  };

  const closeModal = () => {
    Animated.timing(scaleAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => setSelected(null));
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerLabel}>Serenity Gardens</Text>
        <Text style={styles.headerTitle}>Photo Gallery</Text>
        <Text style={styles.headerSub}>Moments captured across the estate</Text>
      </View>

      <FlatList
        data={[{ key: 'grid' }]}
        renderItem={() => (
          <View style={styles.masonryContainer}>
            <View style={{ width: COL_W }}>
              {leftCol.map((item, i) => (
                <GalleryTile key={item.id} item={item} delay={i * 80} onPress={() => openModal(item)} />
              ))}
            </View>
            <View style={{ width: COL_W }}>
              {rightCol.map((item, i) => (
                <GalleryTile key={item.id} item={item} delay={i * 80 + 40} onPress={() => openModal(item)} />
              ))}
            </View>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      />

      <Modal visible={!!selected} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={closeModal}>
          <Animated.View style={[styles.modalContent, { transform: [{ scale: scaleAnim }], opacity: scaleAnim }]}>
            {selected && (
              <>
                <Image source={{ uri: selected.uri }} style={styles.modalImage} resizeMode="cover" />
                <LinearGradient colors={['transparent', Colors.primaryDark]} style={styles.modalGradient}>
                  <Text style={styles.modalLabel}>{selected.label}</Text>
                  <Text style={styles.modalHint}>Tap anywhere to close</Text>
                </LinearGradient>
              </>
            )}
          </Animated.View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 4 },
  headerLabel: { fontSize: 11, color: Colors.secondary, letterSpacing: 2.5, textTransform: 'uppercase', fontWeight: '700', marginBottom: 2 },
  headerTitle: { fontSize: 26, fontWeight: '800', color: Colors.text, letterSpacing: -0.4, marginBottom: 4 },
  headerSub: { fontSize: 13, color: Colors.textMuted, marginBottom: 12 },
  masonryContainer: { flexDirection: 'row', paddingHorizontal: 16, gap: 12 },
  tile: { overflow: 'hidden', ...Theme.shadow.sm },
  tileGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%', justifyContent: 'flex-end', padding: 10 },
  tileLabel: { color: Colors.white, fontSize: 12, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.88)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalContent: { width: '100%', height: H * 0.65, borderRadius: Theme.borderRadius.xl, overflow: 'hidden', ...Theme.shadow.lg },
  modalImage: { width: '100%', height: '100%' },
  modalGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20 },
  modalLabel: { color: Colors.white, fontSize: 20, fontWeight: '800', marginBottom: 4 },
  modalHint: { color: 'rgba(255,255,255,0.55)', fontSize: 12 },
});