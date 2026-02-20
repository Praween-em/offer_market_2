export interface Category {
    id: string;
    name: string;
    icon: string; // Emoji for now, can be replaced with image URL
    subCategories: string[];
    color: string;
}

export const CATEGORIES: Category[] = [
    {
        id: '1',
        name: 'Fashion',
        icon: '👗',
        color: '#FF6B6B',
        subCategories: [
            'Men\'s Wear', 'Women\'s Wear', 'Kids\' Wear', 'Footwear', 'Watches',
            'Accessories', 'Bags & Luggage', 'Jewelry', 'Winter Wear', 'Ethnic Wear'
        ]
    },
    {
        id: '2',
        name: 'Electronics',
        icon: '📱',
        color: '#4ECDC4',
        subCategories: [
            'Mobiles', 'Laptops', 'Tablets', 'Televisions', 'Cameras',
            'Headphones', 'Speakers', 'Smart Watches', 'Gaming Consoles', 'Computer Accessories'
        ]
    },
    {
        id: '3',
        name: 'Home & Living',
        icon: '🏠',
        color: '#45B7D1',
        subCategories: [
            'Furniture', 'Home Decor', 'Kitchenware', 'Bedding', 'Lighting',
            'Storage', 'Bathroom Accessories', 'Gardening', 'Tools & Hardware', 'Pet Supplies'
        ]
    },
    {
        id: '4',
        name: 'Beauty & Personal Care',
        icon: '💄',
        color: '#FF8ED4',
        subCategories: [
            'Makeup', 'Skincare', 'Haircare', 'Fragrances', 'Men\'s Grooming',
            'Bath & Body', 'Oral Care', 'Health & Wellness', 'Feminine Hygiene', 'Baby Care'
        ]
    },
    {
        id: '5',
        name: 'Grocery',
        icon: '🥦',
        color: '#96CEB4',
        subCategories: [
            'Fruits & Vegetables', 'Dairy & Bakery', 'Staples', 'Snacks & Beverages',
            'Household Care', 'Personal Care', 'Baby Food', 'Instant Food', 'Organic Products', 'Frozen Food'
        ]
    },
    {
        id: '6',
        name: 'Sports & Outdoors',
        icon: '⚽',
        color: '#FFCC5C',
        subCategories: [
            'Cricket', 'Football', 'Badminton', 'Cycling', 'Camping',
            'Fitness Equipment', 'Sportfolio', 'Running', 'Swimming', 'Yoga'
        ]
    },
    {
        id: '7',
        name: 'Toys & Baby',
        icon: '🧸',
        color: '#88D8B0',
        subCategories: [
            'Toys', 'Diapers', 'Baby Gear', 'Baby Feeding', 'Maternity Care',
            'Educational Toys', 'Remote Control Toys', 'Dolls', 'Board Games', 'Outdoor Play'
        ]
    },
    {
        id: '8',
        name: 'Automotive',
        icon: '🚗',
        color: '#FF9F68',
        subCategories: [
            'Car Accessories', 'Bike Accessories', 'Helmets', 'Car Electronics',
            'Oils & Lubricants', 'Car Care', 'Spare Parts', 'Tyres', 'Tools', 'Riding Gear'
        ]
    },
    {
        id: '9',
        name: 'Books & Stationery',
        icon: '📚',
        color: '#A8E6CF',
        subCategories: [
            'Fiction', 'Non-Fiction', 'Academic', 'Children\'s Books', 'Stationery',
            'Office Supplies', 'Art & Craft', 'Diaries', 'Calculators', 'Pens'
        ]
    },
    {
        id: '10',
        name: 'Health Products',
        icon: '🏥',
        color: '#4DB6AC',
        subCategories: [
            'Medicines', 'Supplements', 'Personal Care', 'Wellness & Fitness', 'First Aid', 'Medical Equipment'
        ]
    }
];


export type OfferType = 'PERCENTAGE' | 'BOGO' | 'BUY_X_GET_Y' | 'CASHBACK' | 'FLAT_OFF';

export interface Offer {
    id: string;
    type: OfferType;
    title: string;
    description: string;
    shopName: string;
    image: string;
    badgeText: string;
    validUntil: string;
    terms?: string;
    originalPrice?: string;
    discountedPrice?: string;
}

export const HOT_DEALS: Offer[] = [
    {
        id: '1',
        type: 'PERCENTAGE',
        title: 'Mega Summer Sale',
        description: 'Get flat 50% off on all summer collections',
        shopName: 'Fashion Hub',
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
        badgeText: '50% OFF',
        validUntil: '2025-12-31',
        originalPrice: '₹2999',
        discountedPrice: '₹1499'
    },
    {
        id: '2',
        type: 'BOGO',
        title: 'Buy 1 Get 1 Free',
        description: 'On all casual t-shirts',
        shopName: 'Trendz Style',
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80',
        badgeText: 'BUY 1 GET 1',
        validUntil: '2025-12-31',
        terms: 'Lowest priced item will be free'
    },
    {
        id: '3',
        type: 'CASHBACK',
        title: 'Cashback Bonanza',
        description: 'Spend ₹2000 and get ₹500 cashback',
        shopName: 'Electronics World',
        image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&q=80',
        badgeText: '₹500 CASHBACK',
        validUntil: '2025-12-31',
        terms: 'Min purchase ₹2000'
    },
    {
        id: '4',
        type: 'BUY_X_GET_Y',
        title: 'Buy Laptop Get Bag',
        description: 'Free premium laptop bag with every laptop purchase',
        shopName: 'Tech Zone',
        image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80',
        badgeText: 'FREE GIFT',
        validUntil: '2025-12-31'
    },
    {
        id: '5',
        type: 'FLAT_OFF',
        title: 'Flat ₹200 Off',
        description: 'On orders above ₹999',
        shopName: 'Home Essentials',
        image: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=800&q=80',
        badgeText: 'FLAT ₹200 OFF',
        validUntil: '2025-12-31'
    },
    {
        id: '6',
        type: 'PERCENTAGE',
        title: 'Clearance Sale',
        description: 'Up to 70% off on old stock',
        shopName: 'Shoe Factory',
        image: 'https://images.unsplash.com/photo-1560769629-975e13f0c470?w=800&q=80',
        badgeText: '70% OFF',
        validUntil: '2025-12-31',
        originalPrice: '₹4999',
        discountedPrice: '₹1499'
    },
    {
        id: '7',
        type: 'BOGO',
        title: 'Pizza Festival',
        description: 'Buy 1 Medium Pizza Get 1 Small Pizza Free',
        shopName: 'Pizza Paradise',
        image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80',
        badgeText: 'BOGO',
        validUntil: '2025-12-31'
    }
];

export const getAllCategories = (): Category[] => {
    // In a real app, this might merge data from multiple sources
    return CATEGORIES;
};

export const getHotDeals = (): Offer[] => {
    return HOT_DEALS;
};

