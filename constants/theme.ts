export const Theme = {
  borderRadius: {
    sm: 8,
    md: 14,
    lg: 20,
    xl: 28,
    full: 999,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  shadow: {
    sm: {
      shadowColor: '#1C2B1C',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 6,
      elevation: 2,
    },
    md: {
      shadowColor: '#1C2B1C',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 12,
      elevation: 5,
    },
    lg: {
      shadowColor: '#1C2B1C',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.18,
      shadowRadius: 20,
      elevation: 10,
    },
  },
  // Garden-themed images (replace with your Cloudinary URLs if needed)
  images: {
    hero: [
      'https://images.unsplash.com/photo-1416879107082-7dd74f3d32f6?w=800&q=80',
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80',
      'https://images.unsplash.com/photo-1416879107082-7dd74f3d32f6?w=800&q=80',
      'https://images.unsplash.com/photo-1551524559-8af4e6624178?w=800&q=80',
    ],
    gallery: [
      'https://images.unsplash.com/photo-1416879107082-7dd74f3d32f6?w=600&q=80',
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80',
      'https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?w=600&q=80',
      'https://images.unsplash.com/photo-1416879107082-7dd74f3d32f6?w=600&q=80',
      'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=600&q=80',
      'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=600&q=80',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
      'https://images.unsplash.com/photo-1477554193778-9562c28588c0?w=600&q=80',
    ],
    about: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&q=80',
    explore: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&q=80',
      'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=500&q=80',
      'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=500&q=80',
      'https://images.unsplash.com/photo-1551085254-e96b210db58a?w=500&q=80',
    ],
  },
} as const;
