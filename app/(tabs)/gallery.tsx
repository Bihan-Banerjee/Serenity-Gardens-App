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
  { id: '1', uri: 'https://res.cloudinary.com/drj7t97rd/image/upload/v1766638884/WhatsApp_Image_2025-12-05_at_11.20.16_xhcfgq.jpg', label: 'Main Garden', height: 180 },
  { id: '2', uri: 'https://res.cloudinary.com/drj7t97rd/image/upload/v1766638883/WhatsApp_Image_2025-12-05_at_10.43.551_x2y2k6.jpg', label: 'Aerial View', height: 120 },
  { id: '3', uri: 'https://res.cloudinary.com/drj7t97rd/image/upload/v1766638884/WhatsApp_Image_2025-12-05_at_11.20.171_rsdmwn.jpg', label: 'Lotus Pond', height: 140 },
  { id: '4', uri: 'https://res.cloudinary.com/drj7t97rd/image/upload/v1766638885/WhatsApp_Image_2025-12-05_at_11.42.50_lh3or7.jpg', label: 'Flower Lane', height: 160 },
  { id: '5', uri: 'https://res.cloudinary.com/drj7t97rd/image/upload/v1766638883/WhatsApp_Image_2025-12-05_at_10.43.561_l3nbq1.jpg', label: 'Greenhouse', height: 130 },
  { id: '6', uri: 'https://res.cloudinary.com/drj7t97rd/image/upload/v1766638883/WhatsApp_Image_2025-12-05_at_10.43.541_k2inwr.jpg', label: 'Bird Bath', height: 170 },
  { id: '7', uri: 'https://res.cloudinary.com/drj7t97rd/image/upload/v1766638883/WhatsApp_Image_2025-12-05_at_10.43.57_ubxoev.jpg', label: 'Nursery', height: 150 },
  { id: '8', uri: 'https://res.cloudinary.com/drj7t97rd/image/upload/v1766638883/WhatsApp_Image_2025-12-05_at_10.43.56_knjd4t.jpg', label: 'Meadow', height: 135 },
  { id: '9', uri: 'https://res.cloudinary.com/drj7t97rd/image/upload/v1748434175/wallll_fcuggx.jpg', label: 'Gazebo', height: 155 },
  { id: '10', uri: 'https://res.cloudinary.com/drj7t97rd/image/upload/v1748433095/wall_ifwhmk.jpg', label: 'Garden Path', height: 140 },
  { id: '11', uri: 'https://res.cloudinary.com/drj7t97rd/image/upload/v1748433094/sky_xxvhhs.jpg', label: 'Main Garden', height: 180 },
  { id: '12', uri: 'https://res.cloudinary.com/drj7t97rd/image/upload/v1748433094/harvest_rqjuhc.jpg', label: 'Aerial View', height: 120 },
  { id: '13', uri: 'https://res.cloudinary.com/drj7t97rd/image/upload/v1748433094/peace_qqvkoi.jpg', label: 'Lotus Pond', height: 140 },
  { id: '14', uri: 'https://res.cloudinary.com/drj7t97rd/image/upload/v1748433091/big_smdo3o.jpg', label: 'Flower Lane', height: 160 },
  { id: '15', uri: 'https://res.cloudinary.com/drj7t97rd/image/upload/v1748433090/lilypad_vvchdi.jpg', label: 'Greenhouse', height: 130 },
  { id: '16', uri: 'https://res.cloudinary.com/drj7t97rd/image/upload/v1766638883/WhatsApp_Image_2025-12-05_at_10.43.541_k2inwr.jpg', label: 'Bird Bath', height: 170 },
  { id: '17', uri: 'https://res.cloudinary.com/drj7t97rd/image/upload/v1748433090/beforestorm_udqr99.jpg', label: 'Nursery', height: 150 },
  { id: '18', uri: 'https://res.cloudinary.com/drj7t97rd/image/upload/v1748433089/aerial_bfphyz.jpg', label: 'Meadow', height: 135 },
  { id: '19', uri: 'https://res.cloudinary.com/drj7t97rd/image/upload/v1748433091/mabollo_vdgkiz.jpg', label: 'Gazebo', height: 155 },
  { id: '20', uri: 'https://res.cloudinary.com/drj7t97rd/image/upload/v1748433091/cabbage_a4ioam.jpg', label: 'Garden Path', height: 140 },
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