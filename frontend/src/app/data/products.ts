export interface Product {
  id: number;
  name: string;
  tagline: string;
  description: string;
  image: string;
  category: string;
  affiliateLink: string;
  badge?: string;
  rating?: number;
}

export const products: Product[] = [
  {
    id: 1,
    name: 'Premium Wireless Headphones',
    tagline: 'Studio-quality sound in a wireless package',
    description: 'Experience crystal-clear audio with our premium wireless headphones. Featuring active noise cancellation, 30-hour battery life, and premium leather cushioning for all-day comfort.',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aXJlbGVzcyUyMGhlYWRwaG9uZXN8ZW58MXx8fHwxNzY3ODA4NzQyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    category: 'Audio',
    affiliateLink: 'https://example.com/product/1',
    badge: 'Creator Pick',
    rating: 4.8
  },
  {
    id: 2,
    name: 'Smart Watch Series X',
    tagline: 'Your health companion on your wrist',
    description: 'Track your fitness goals, monitor your health, and stay connected with the latest Smart Watch Series X. Features include heart rate monitoring, GPS, and 7-day battery life.',
    image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbWFydCUyMHdhdGNofGVufDF8fHx8MTc2Nzg4MTI4NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    category: 'Wearables',
    affiliateLink: 'https://example.com/product/2',
    badge: 'Best Deal',
    rating: 4.6
  },
  {
    id: 3,
    name: 'Ultra Thin Laptop',
    tagline: 'Power meets portability',
    description: 'Ultra-portable laptop with blazing-fast performance. Features the latest processors, stunning display, and all-day battery life in a sleek aluminum chassis.',
    image: 'https://images.unsplash.com/photo-1511385348-a52b4a160dc2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYXB0b3AlMjBjb21wdXRlcnxlbnwxfHx8fDE3Njc4NTExMTV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    category: 'Computing',
    affiliateLink: 'https://example.com/product/3',
    rating: 4.9
  },
  {
    id: 4,
    name: 'Next-Gen Smartphone',
    tagline: 'Photography redefined',
    description: 'Capture life in stunning detail with our next-generation smartphone. Features pro-grade camera system, 5G connectivity, and revolutionary display technology.',
    image: 'https://images.unsplash.com/photo-1741061963569-9d0ef54d10d2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbWFydHBob25lJTIwbW9iaWxlfGVufDF8fHx8MTc2Nzg1MTExNXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    category: 'Mobile',
    affiliateLink: 'https://example.com/product/4',
    badge: 'Creator Pick',
    rating: 4.7
  },
  {
    id: 5,
    name: 'Professional DSLR Camera',
    tagline: 'Professional imaging for everyone',
    description: 'Take your photography to the next level with professional-grade image quality. Features full-frame sensor, 4K video, and advanced autofocus system.',
    image: 'https://images.unsplash.com/photo-1693208056529-03702201669e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYW1lcmElMjBkaWdpdGFsfGVufDF8fHx8MTc2Nzg4MTQ2MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    category: 'Camera',
    affiliateLink: 'https://example.com/product/5',
    rating: 4.9
  },
  {
    id: 6,
    name: 'Gaming Console Pro',
    tagline: 'Next-level gaming experience',
    description: 'Immerse yourself in 4K gaming with ray tracing, ultra-fast SSD storage, and exclusive game titles. The ultimate gaming machine for serious gamers.',
    image: 'https://images.unsplash.com/photo-1604846887565-640d2f52d564?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnYW1pbmclMjBjb25zb2xlfGVufDF8fHx8MTc2NzgxMjYzNnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    category: 'Gaming',
    affiliateLink: 'https://example.com/product/6',
    badge: 'Best Deal',
    rating: 4.8
  },
  {
    id: 7,
    name: 'Premium Tablet Device',
    tagline: 'Productivity on the go',
    description: 'Work and play with our premium tablet. Features stunning display, powerful performance, and all-day battery life. Perfect for creative professionals.',
    image: 'https://images.unsplash.com/photo-1760708369071-e8a50a8979cb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0YWJsZXQlMjBkZXZpY2V8ZW58MXx8fHwxNzY3NzcyNzY2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    category: 'Computing',
    affiliateLink: 'https://example.com/product/7',
    rating: 4.6
  },
  {
    id: 8,
    name: 'Portable Bluetooth Speaker',
    tagline: 'Music anywhere, anytime',
    description: 'Take your music everywhere with our waterproof Bluetooth speaker. Features 360-degree sound, 20-hour battery life, and rugged design.',
    image: 'https://images.unsplash.com/photo-1589256469067-ea99122bbdc4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibHVldG9vdGglMjBzcGVha2VyfGVufDF8fHx8MTc2Nzc5OTYxN3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    category: 'Audio',
    affiliateLink: 'https://example.com/product/8',
    rating: 4.5
  },
  {
    id: 9,
    name: 'Advanced Fitness Tracker',
    tagline: 'Track every move, every day',
    description: 'Monitor your fitness journey with precision. Features advanced health tracking, sleep monitoring, and smartphone notifications.',
    image: 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaXRuZXNzJTIwdHJhY2tlcnxlbnwxfHx8fDE3Njc4MDk2Mjh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    category: 'Wearables',
    affiliateLink: 'https://example.com/product/9',
    rating: 4.4
  },
  {
    id: 10,
    name: 'Mechanical Gaming Keyboard',
    tagline: 'Precision typing at its finest',
    description: 'Experience ultimate typing and gaming performance with mechanical switches, RGB lighting, and programmable keys.',
    image: 'https://images.unsplash.com/photo-1705488387173-b3e4890259ab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrZXlib2FyZCUyMG1lY2hhbmljYWx8ZW58MXx8fHwxNzY3ODg5NDI4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    category: 'Gaming',
    affiliateLink: 'https://example.com/product/10',
    badge: 'Creator Pick',
    rating: 4.7
  },
  {
    id: 11,
    name: 'Wireless Gaming Mouse',
    tagline: 'Precision gaming without the wire',
    description: 'Dominate the competition with our wireless gaming mouse. Features ultra-low latency, high-precision sensor, and customizable RGB lighting.',
    image: 'https://images.unsplash.com/photo-1628832307345-7404b47f1751?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnYW1pbmclMjBtb3VzZXxlbnwxfHx8fDE3Njc4MjIxMjB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    category: 'Gaming',
    affiliateLink: 'https://example.com/product/11',
    rating: 4.6
  },
  {
    id: 12,
    name: '4K Monitor Display',
    tagline: 'Visual excellence redefined',
    description: 'Stunning 4K resolution with HDR support and ultra-wide color gamut. Perfect for creative work and entertainment.',
    image: 'https://images.unsplash.com/photo-1585792180666-f7347c490ee2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb25pdG9yJTIwc2NyZWVufGVufDF8fHx8MTc2Nzg4Nzc4MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    category: 'Computing',
    affiliateLink: 'https://example.com/product/12',
    rating: 4.8
  },
  {
    id: 13,
    name: 'Noise Cancelling Earbuds',
    tagline: 'Premium sound, zero distractions',
    description: 'Block out the world with active noise cancellation. Features premium sound quality, touch controls, and wireless charging case.',
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlYXJidWRzfGVufDF8fHx8MTc2Nzg5NjA4NHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    category: 'Audio',
    affiliateLink: 'https://example.com/product/13',
    badge: 'Best Deal',
    rating: 4.7
  },
  {
    id: 14,
    name: 'Power Bank 20000mAh',
    tagline: 'Power when you need it most',
    description: 'Never run out of battery with our high-capacity power bank. Features fast charging, multiple ports, and ultra-portable design.',
    image: 'https://images.unsplash.com/photo-1585995603413-eb35b5f4a50b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3dlciUyMGJhbmt8ZW58MXx8fHwxNzY3ODQ0NjQ5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    category: 'Accessories',
    affiliateLink: 'https://example.com/product/14',
    rating: 4.5
  },
  {
    id: 15,
    name: 'HD Webcam Pro',
    tagline: 'Crystal-clear video calls',
    description: 'Look your best in every video call with 1080p HD webcam. Features auto-focus, built-in microphone, and low-light correction.',
    image: 'https://images.unsplash.com/photo-1623949556303-b0d17d198863?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWJjYW18ZW58MXx8fHwxNzY3ODk2MDg0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    category: 'Accessories',
    affiliateLink: 'https://example.com/product/15',
    rating: 4.6
  }
];

export const categories = [
  'All',
  'Audio',
  'Gaming',
  'Computing',
  'Mobile',
  'Camera',
  'Wearables',
  'Accessories'
];
