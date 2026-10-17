export type Category = 'All' | 'Flora' | 'Fauna' | 'Ponds' | 'Farm';
export interface ExploreItem { id: string; name: string; category: Exclude<Category, 'All'>; description: string; image: string; highlight?: string; }

export const ITEMS: ExploreItem[] = [
  { id: '1', name: 'Family Picnic', category: 'Farm', description: 'Perfect getaway spot for family picnics.', image: 'https://res.cloudinary.com/drj7t97rd/image/upload/v1775048793/picnic_vnwepx.jpg'},
  { id: '2', name: 'Evening Escapade', category: 'Flora', description: 'Escape the city buzz and enjoy an evening under the stars.', image: 'https://res.cloudinary.com/drj7t97rd/image/upload/v1775050378/lawn_vqkxlw.png' },
  { id: '3', name: 'Bird Haven', category: 'Fauna', description: 'Regular sightings of colorful songbirds, cormorants and majestic kingfishers.',  image: 'https://res.cloudinary.com/drj7t97rd/image/upload/v1748433091/bird_s4yydk.jpg', highlight: '30+ species' },
  { id: '4', name: 'Pond of Life', category: 'Ponds', description: 'Teeming with fish, crabs, etc., it offers a serene spot for reflection and relaxation.',  image: 'https://res.cloudinary.com/drj7t97rd/image/upload/v1775048803/pond_apy4sa.jpg' },
  { id: '5', name: 'Vermicompost Area', category: 'Fauna', description: 'Where organic waste is broken down into nutrient rich compost by earthworms.',  image: 'https://res.cloudinary.com/drj7t97rd/image/upload/v1775050769/worm_ja7k3q.png', highlight: 'Fertilizer sold too!' },
  { id: '6', name: 'Photoshoot Spot', category: 'Farm', description: 'A picturesque gazebo, lawn, and pond surrounded by vibrant flowers, ideal for memorable photoshoots.', image: 'https://res.cloudinary.com/drj7t97rd/image/upload/v1766638884/WhatsApp_Image_2025-12-05_at_11.20.171_rsdmwn.jpg'},
];
