export interface Review { _id?: string; name: string; review: string; rating: number; createdAt?: string; }

export const hardcodedTestimonials: Review[] = [
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

export const SEED: Review[] = hardcodedTestimonials.map((t, i) => ({
  ...t,
  _id: `hardcoded-${i}`,
  createdAt: new Date().toISOString(),
}));
