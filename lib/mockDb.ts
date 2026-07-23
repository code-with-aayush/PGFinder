// In-memory mock database fallback for PGFinder
// Used when MongoDB Atlas connection fails or is not configured.

export interface MockListing {
  _id: string;
  ownerId: string;
  ownerPhone?: string;
  title: string;
  description: string;
  price: number;
  type: "PG" | "Hostel" | "Flat Share";
  gender: "male" | "female" | "any";
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  location: {
    type: "Point";
    coordinates: [number, number];
  };
  amenities: {
    ac: boolean;
    wifi: boolean;
    meals: boolean;
    laundry: boolean;
    parking: boolean;
    hotWater: boolean;
    powerBackup: boolean;
    security: boolean;
  };
  rules: {
    vegOnly: boolean;
    noSmoking: boolean;
    noAlcohol: boolean;
    guestPolicy: string;
    curfewTime: string;
  };
  photos: string[];
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MockInquiry {
  _id: string;
  listingId: string;
  listingTitle: string;
  studentId: string;
  studentName?: string;
  studentEmail?: string;
  ownerId: string;
  message: string;
  status: "pending" | "responded";
  createdAt: string;
}

export interface MockSaved {
  _id: string;
  studentId: string;
  listingId: string;
  savedAt: string;
}

export interface MockConversation {
  _id: string;
  studentId: string;
  studentName?: string;
  studentEmail?: string;
  ownerId: string;
  listingId: string;
  listingTitle: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCountStudent: number;
  unreadCountOwner: number;
  createdAt: string;
}

export interface MockMessage {
  _id: string;
  conversationId: string;
  senderId: string;
  senderRole: "student" | "owner";
  content: string;
  read: boolean;
  createdAt: string;
}

const PHOTOS = [
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800&h=600&fit=crop",
];

const TEST_OWNER_ID = "owner_spidertech1515";
const TEST_OWNER_EMAIL = "spidertech1515@gmail.com";
const TEST_OWNER_PHONE = "9876543210";

// Initialize mock data globally to persist changes in dev reload
declare global {
  // eslint-disable-next-line no-var
  var mockListings: MockListing[] | undefined;
  // eslint-disable-next-line no-var
  var mockInquiries: MockInquiry[] | undefined;
  // eslint-disable-next-line no-var
  var mockSaved: MockSaved[] | undefined;
  // eslint-disable-next-line no-var
  var mockConversations: MockConversation[] | undefined;
  // eslint-disable-next-line no-var
  var mockMessages: MockMessage[] | undefined;
}

if (!global.mockConversations) {
  global.mockConversations = [];
}

if (!global.mockMessages) {
  global.mockMessages = [];
}

if (!global.mockInquiries) {
  global.mockInquiries = [];
}

if (!global.mockSaved) {
  global.mockSaved = [];
}

if (!global.mockListings) {
  global.mockListings = [
    {
      _id: "64ba3c690a2c918a5e000001",
      ownerId: TEST_OWNER_ID,
      ownerPhone: TEST_OWNER_PHONE,
      title: "Sunshine PG for Girls",
      description: "Well-maintained girls PG with home-cooked meals. Located near DTU campus. Spacious rooms with attached bathrooms, 24/7 security and CCTV surveillance.",
      price: 8500,
      type: "PG",
      gender: "female",
      address: { street: "A-45, Rohini Sector 7", city: "Delhi", state: "Delhi", pincode: "110085" },
      location: { type: "Point", coordinates: [77.1025, 28.7041] },
      amenities: { ac: true, wifi: true, meals: true, laundry: true, parking: false, hotWater: true, powerBackup: true, security: true },
      rules: { vegOnly: true, noSmoking: true, noAlcohol: true, guestPolicy: "Guests allowed till 8 PM", curfewTime: "10:00 PM" },
      photos: [PHOTOS[0], PHOTOS[1], PHOTOS[2]],
      isVerified: true,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: "64ba3c690a2c918a5e000002",
      ownerId: TEST_OWNER_ID,
      ownerPhone: TEST_OWNER_PHONE,
      title: "Royal Boys Hostel",
      description: "Premium boys hostel with modern amenities. AC rooms, high-speed WiFi, and gym access. Located in Hauz Khas with excellent metro connectivity.",
      price: 12000,
      type: "Hostel",
      gender: "male",
      address: { street: "C-12, Hauz Khas", city: "Delhi", state: "Delhi", pincode: "110016" },
      location: { type: "Point", coordinates: [77.2090, 28.5494] },
      amenities: { ac: true, wifi: true, meals: true, laundry: true, parking: true, hotWater: true, powerBackup: true, security: true },
      rules: { vegOnly: false, noSmoking: true, noAlcohol: false, guestPolicy: "No restrictions", curfewTime: "No curfew" },
      photos: [PHOTOS[1], PHOTOS[3], PHOTOS[4]],
      isVerified: true,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: "64ba3c690a2c918a5e000003",
      ownerId: TEST_OWNER_ID,
      ownerPhone: TEST_OWNER_PHONE,
      title: "Green Valley PG",
      description: "Budget-friendly PG for DU North Campus students. Clean rooms, filtered RO water, and home-style food.",
      price: 6000,
      type: "PG",
      gender: "any",
      address: { street: "University Road, Kamla Nagar", city: "Delhi", state: "Delhi", pincode: "110007" },
      location: { type: "Point", coordinates: [77.2065, 28.6824] },
      amenities: { ac: false, wifi: true, meals: true, laundry: false, parking: false, hotWater: true, powerBackup: false, security: true },
      rules: { vegOnly: true, noSmoking: true, noAlcohol: true, guestPolicy: "Guests allowed till 7 PM", curfewTime: "9:30 PM" },
      photos: [PHOTOS[2], PHOTOS[4]],
      isVerified: false,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: "64ba3c690a2c918a5e000004",
      ownerId: TEST_OWNER_ID,
      ownerPhone: TEST_OWNER_PHONE,
      title: "Koramangala Student Hub",
      description: "Modern co-living space in Koramangala 5th Block. Perfect for Christ University and PES students. Fully furnished rooms.",
      price: 9500,
      type: "Flat Share",
      gender: "any",
      address: { street: "5th Block, Koramangala", city: "Bangalore", state: "Karnataka", pincode: "560095" },
      location: { type: "Point", coordinates: [77.6245, 12.9352] },
      amenities: { ac: false, wifi: true, meals: false, laundry: true, parking: true, hotWater: true, powerBackup: true, security: true },
      rules: { vegOnly: false, noSmoking: true, noAlcohol: true, guestPolicy: "Guests allowed", curfewTime: "11:00 PM" },
      photos: [PHOTOS[3], PHOTOS[0]],
      isVerified: true,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: "64ba3c690a2c918a5e000005",
      ownerId: TEST_OWNER_ID,
      ownerPhone: TEST_OWNER_PHONE,
      title: "BTM Layout Girls PG",
      description: "Safe and secure girls PG in BTM Layout 2nd Stage. Strict biometric security and homely environment.",
      price: 7500,
      type: "PG",
      gender: "female",
      address: { street: "2nd Stage, BTM Layout", city: "Bangalore", state: "Karnataka", pincode: "560076" },
      location: { type: "Point", coordinates: [77.6101, 12.9166] },
      amenities: { ac: true, wifi: true, meals: true, laundry: true, parking: false, hotWater: true, powerBackup: true, security: true },
      rules: { vegOnly: true, noSmoking: true, noAlcohol: true, guestPolicy: "No male guests", curfewTime: "9:00 PM" },
      photos: [PHOTOS[4], PHOTOS[1]],
      isVerified: false,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: "64ba3c690a2c918a5e000006",
      ownerId: TEST_OWNER_ID,
      ownerPhone: TEST_OWNER_PHONE,
      title: "HSR Layout Boys Hostel",
      description: "Affordable boys hostel in HSR Sector 2. Double and triple sharing available with gaming lounge.",
      price: 6500,
      type: "Hostel",
      gender: "male",
      address: { street: "Sector 2, HSR Layout", city: "Bangalore", state: "Karnataka", pincode: "560102" },
      location: { type: "Point", coordinates: [77.6412, 12.9116] },
      amenities: { ac: false, wifi: true, meals: false, laundry: false, parking: true, hotWater: true, powerBackup: false, security: true },
      rules: { vegOnly: false, noSmoking: false, noAlcohol: false, guestPolicy: "No restrictions", curfewTime: "No curfew" },
      photos: [PHOTOS[0], PHOTOS[2]],
      isVerified: false,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: "64ba3c690a2c918a5e000007",
      ownerId: TEST_OWNER_ID,
      ownerPhone: TEST_OWNER_PHONE,
      title: "Indiranagar Premium Co-Living",
      description: "Luxury co-living accommodation in Indiranagar. Walking distance to 100 Feet Road with weekly room cleaning.",
      price: 15000,
      type: "PG",
      gender: "any",
      address: { street: "12th Main, Indiranagar", city: "Bangalore", state: "Karnataka", pincode: "560038" },
      location: { type: "Point", coordinates: [77.6408, 12.9716] },
      amenities: { ac: true, wifi: true, meals: true, laundry: true, parking: true, hotWater: true, powerBackup: true, security: true },
      rules: { vegOnly: false, noSmoking: true, noAlcohol: false, guestPolicy: "Guests allowed till 10 PM", curfewTime: "No curfew" },
      photos: [PHOTOS[1], PHOTOS[2], PHOTOS[3]],
      isVerified: true,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: "64ba3c690a2c918a5e000008",
      ownerId: TEST_OWNER_ID,
      ownerPhone: TEST_OWNER_PHONE,
      title: "Kothrud Student PG",
      description: "Affordable PG near MIT Pune and Cummins College. Authentic Maharashtrian meals included.",
      price: 5500,
      type: "PG",
      gender: "male",
      address: { street: "Paud Road, Kothrud", city: "Pune", state: "Maharashtra", pincode: "411038" },
      location: { type: "Point", coordinates: [73.8077, 18.5074] },
      amenities: { ac: false, wifi: true, meals: true, laundry: false, parking: true, hotWater: true, powerBackup: false, security: false },
      rules: { vegOnly: false, noSmoking: true, noAlcohol: true, guestPolicy: "Guests allowed till 8 PM", curfewTime: "10:00 PM" },
      photos: [PHOTOS[2], PHOTOS[3]],
      isVerified: false,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: "64ba3c690a2c918a5e000009",
      ownerId: TEST_OWNER_ID,
      ownerPhone: TEST_OWNER_PHONE,
      title: "Viman Nagar Executive PG",
      description: "Premium student accommodation near Symbiosis International University. High-speed 300Mbps WiFi and AC.",
      price: 11000,
      type: "PG",
      gender: "female",
      address: { street: "Near Symbiosis Campus, Viman Nagar", city: "Pune", state: "Maharashtra", pincode: "411014" },
      location: { type: "Point", coordinates: [73.9143, 18.5679] },
      amenities: { ac: true, wifi: true, meals: true, laundry: true, parking: true, hotWater: true, powerBackup: true, security: true },
      rules: { vegOnly: false, noSmoking: true, noAlcohol: true, guestPolicy: "Guests allowed till 9 PM", curfewTime: "10:30 PM" },
      photos: [PHOTOS[3], PHOTOS[4]],
      isVerified: true,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: "64ba3c690a2c918a5e000010",
      ownerId: TEST_OWNER_ID,
      ownerPhone: TEST_OWNER_PHONE,
      title: "Powai Lake View PG for Boys",
      description: "Scenic Lake view PG near IIT Bombay campus. Fully furnished rooms with balcony, desk, and daily housekeeping.",
      price: 14500,
      type: "PG",
      gender: "male",
      address: { street: "Hiranandani Gardens, Powai", city: "Mumbai", state: "Maharashtra", pincode: "400076" },
      location: { type: "Point", coordinates: [72.9116, 19.1176] },
      amenities: { ac: true, wifi: true, meals: true, laundry: true, parking: true, hotWater: true, powerBackup: true, security: true },
      rules: { vegOnly: false, noSmoking: true, noAlcohol: false, guestPolicy: "Guests allowed", curfewTime: "11:30 PM" },
      photos: [PHOTOS[0], PHOTOS[3]],
      isVerified: true,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: "64ba3c690a2c918a5e000011",
      ownerId: TEST_OWNER_ID,
      ownerPhone: TEST_OWNER_PHONE,
      title: "Andheri West Girls PG",
      description: "Prime location girls PG near Mithibai and NMIMS colleges. Modern security system with female warden.",
      price: 13000,
      type: "PG",
      gender: "female",
      address: { street: "JVPD Scheme, Andheri West", city: "Mumbai", state: "Maharashtra", pincode: "400049" },
      location: { type: "Point", coordinates: [72.8347, 19.1072] },
      amenities: { ac: true, wifi: true, meals: true, laundry: true, parking: false, hotWater: true, powerBackup: true, security: true },
      rules: { vegOnly: true, noSmoking: true, noAlcohol: true, guestPolicy: "No male guests", curfewTime: "10:00 PM" },
      photos: [PHOTOS[1], PHOTOS[4]],
      isVerified: true,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: "64ba3c690a2c918a5e000012",
      ownerId: TEST_OWNER_ID,
      ownerPhone: TEST_OWNER_PHONE,
      title: "Gachibowli Tech Hub PG",
      description: "Spacious PG accommodation near IIIT Hyderabad and ISB. Quiet study atmosphere with high-speed fiber internet.",
      price: 8000,
      type: "Hostel",
      gender: "male",
      address: { street: "Near IIIT Junction, Gachibowli", city: "Hyderabad", state: "Telangana", pincode: "500032" },
      location: { type: "Point", coordinates: [78.3489, 17.4435] },
      amenities: { ac: true, wifi: true, meals: true, laundry: true, parking: true, hotWater: true, powerBackup: true, security: true },
      rules: { vegOnly: false, noSmoking: true, noAlcohol: true, guestPolicy: "Guests allowed till 8 PM", curfewTime: "10:00 PM" },
      photos: [PHOTOS[2], PHOTOS[0]],
      isVerified: false,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: "64ba3c690a2c918a5e000013",
      ownerId: TEST_OWNER_ID,
      ownerPhone: TEST_OWNER_PHONE,
      title: "Madhapur Luxury Co-Living",
      description: "Modern co-living space near Hitech City metro. 3 times buffet meal plan included.",
      price: 10500,
      type: "Flat Share",
      gender: "any",
      address: { street: "Image Gardens Road, Madhapur", city: "Hyderabad", state: "Telangana", pincode: "500081" },
      location: { type: "Point", coordinates: [78.3888, 17.4483] },
      amenities: { ac: true, wifi: true, meals: true, laundry: true, parking: true, hotWater: true, powerBackup: true, security: true },
      rules: { vegOnly: false, noSmoking: true, noAlcohol: false, guestPolicy: "Guests allowed", curfewTime: "No curfew" },
      photos: [PHOTOS[3], PHOTOS[1]],
      isVerified: true,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: "64ba3c690a2c918a5e000014",
      ownerId: TEST_OWNER_ID,
      ownerPhone: TEST_OWNER_PHONE,
      title: "Noida Sector 62 Student PG",
      description: "Comfortable student PG near Jaypee Institute and Noida Electronic City metro station.",
      price: 7000,
      type: "PG",
      gender: "any",
      address: { street: "Block B, Sector 62", city: "Noida", state: "Uttar Pradesh", pincode: "201309" },
      location: { type: "Point", coordinates: [77.3639, 28.6270] },
      amenities: { ac: true, wifi: true, meals: true, laundry: true, parking: true, hotWater: true, powerBackup: true, security: true },
      rules: { vegOnly: true, noSmoking: true, noAlcohol: true, guestPolicy: "Guests allowed till 8 PM", curfewTime: "10:00 PM" },
      photos: [PHOTOS[4], PHOTOS[2]],
      isVerified: true,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: "64ba3c690a2c918a5e000015",
      ownerId: TEST_OWNER_ID,
      ownerPhone: TEST_OWNER_PHONE,
      title: "Cyber City Boys PG",
      description: "Premium boys PG near Cyber Hub and Phase 3 Rapid Metro. Gym, pool table, and delicious food.",
      price: 12500,
      type: "PG",
      gender: "male",
      address: { street: "DLF Phase 3, Near Cyber Hub", city: "Gurgaon", state: "Haryana", pincode: "122002" },
      location: { type: "Point", coordinates: [77.0882, 28.4950] },
      amenities: { ac: true, wifi: true, meals: true, laundry: true, parking: true, hotWater: true, powerBackup: true, security: true },
      rules: { vegOnly: false, noSmoking: true, noAlcohol: false, guestPolicy: "No restrictions", curfewTime: "No curfew" },
      photos: [PHOTOS[0], PHOTOS[4]],
      isVerified: true,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: "64ba3c690a2c918a5e000016",
      ownerId: TEST_OWNER_ID,
      ownerPhone: TEST_OWNER_PHONE,
      title: "Golf Course Road Co-Living",
      description: "Luxury student & professional co-living space on Golf Course Road. Fully serviced suites.",
      price: 16000,
      type: "Flat Share",
      gender: "any",
      address: { street: "Sector 54, Golf Course Road", city: "Gurgaon", state: "Haryana", pincode: "122011" },
      location: { type: "Point", coordinates: [77.1052, 28.4398] },
      amenities: { ac: true, wifi: true, meals: true, laundry: true, parking: true, hotWater: true, powerBackup: true, security: true },
      rules: { vegOnly: false, noSmoking: true, noAlcohol: false, guestPolicy: "Guests allowed", curfewTime: "No curfew" },
      photos: [PHOTOS[1], PHOTOS[3]],
      isVerified: true,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: "64ba3c690a2c918a5e000017",
      ownerId: TEST_OWNER_ID,
      ownerPhone: TEST_OWNER_PHONE,
      title: "Satya Niketan DU South Campus PG",
      description: "Popular PG in Satya Niketan for South Campus DU students (Venky, ARSD, RLA colleges).",
      price: 9000,
      type: "PG",
      gender: "female",
      address: { street: "Main Market, Satya Niketan", city: "Delhi", state: "Delhi", pincode: "110021" },
      location: { type: "Point", coordinates: [77.1691, 28.5885] },
      amenities: { ac: true, wifi: true, meals: true, laundry: true, parking: false, hotWater: true, powerBackup: true, security: true },
      rules: { vegOnly: true, noSmoking: true, noAlcohol: true, guestPolicy: "Guests allowed till 7 PM", curfewTime: "9:30 PM" },
      photos: [PHOTOS[2], PHOTOS[1]],
      isVerified: true,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: "64ba3c690a2c918a5e000018",
      ownerId: TEST_OWNER_ID,
      ownerPhone: TEST_OWNER_PHONE,
      title: "Electronic City Phase 1 PG",
      description: "Affordable PG near Infosys Gate 1 and Wipro. Clean rooms with attached balcony and food.",
      price: 6800,
      type: "PG",
      gender: "male",
      address: { street: "Phase 1, Electronic City", city: "Bangalore", state: "Karnataka", pincode: "560100" },
      location: { type: "Point", coordinates: [77.6648, 12.8452] },
      amenities: { ac: false, wifi: true, meals: true, laundry: true, parking: true, hotWater: true, powerBackup: true, security: true },
      rules: { vegOnly: false, noSmoking: true, noAlcohol: true, guestPolicy: "Guests allowed till 8 PM", curfewTime: "10:00 PM" },
      photos: [PHOTOS[3], PHOTOS[2]],
      isVerified: false,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: "64ba3c690a2c918a5e000019",
      ownerId: TEST_OWNER_ID,
      ownerPhone: TEST_OWNER_PHONE,
      title: "Baner Road Boys Hostel",
      description: "Budget boys hostel on Baner Road near Cummins and Indira college campuses.",
      price: 7200,
      type: "Hostel",
      gender: "male",
      address: { street: "Baner Road, Near Balewadi High Street", city: "Pune", state: "Maharashtra", pincode: "411045" },
      location: { type: "Point", coordinates: [73.7868, 18.5590] },
      amenities: { ac: false, wifi: true, meals: true, laundry: false, parking: true, hotWater: true, powerBackup: true, security: true },
      rules: { vegOnly: false, noSmoking: true, noAlcohol: true, guestPolicy: "Guests allowed till 9 PM", curfewTime: "10:30 PM" },
      photos: [PHOTOS[4], PHOTOS[0]],
      isVerified: false,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: "64ba3c690a2c918a5e000020",
      ownerId: TEST_OWNER_ID,
      ownerPhone: TEST_OWNER_PHONE,
      title: "Bandra West Luxury PG",
      description: "Exclusive luxury PG in Bandra West near St. Xavier's and National College. Fully serviced luxury apartment.",
      price: 18000,
      type: "PG",
      gender: "any",
      address: { street: "Hill Road, Bandra West", city: "Mumbai", state: "Maharashtra", pincode: "400050" },
      location: { type: "Point", coordinates: [72.8311, 19.0596] },
      amenities: { ac: true, wifi: true, meals: true, laundry: true, parking: true, hotWater: true, powerBackup: true, security: true },
      rules: { vegOnly: false, noSmoking: true, noAlcohol: false, guestPolicy: "Guests allowed", curfewTime: "No curfew" },
      photos: [PHOTOS[0], PHOTOS[1], PHOTOS[4]],
      isVerified: true,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
}

export const mockDb = {
  getListings: () => global.mockListings || [],
  getListingById: (id: string) =>
    (global.mockListings || []).find((l) => l._id === id) || null,
  createListing: (listing: Omit<MockListing, "_id" | "createdAt" | "updatedAt">) => {
    const timestamp = Math.floor(Date.now() / 1000).toString(16).padStart(8, "0");
    const randomHex = Math.floor(Math.random() * 0xffffffffffff)
      .toString(16)
      .padStart(16, "0");
    const newListing: MockListing = {
      ...listing,
      _id: (timestamp + randomHex).substring(0, 24),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    global.mockListings = [newListing, ...(global.mockListings || [])];
    return newListing;
  },
  updateListing: (id: string, updates: Partial<MockListing>) => {
    global.mockListings = (global.mockListings || []).map((l) =>
      l._id === id ? { ...l, ...updates, updatedAt: new Date().toISOString() } : l
    );
    return mockDb.getListingById(id);
  },
  deleteListing: (id: string) => {
    global.mockListings = (global.mockListings || []).filter((l) => l._id !== id);
    global.mockSaved = (global.mockSaved || []).filter((s) => s.listingId !== id);
    global.mockInquiries = (global.mockInquiries || []).filter((i) => i.listingId !== id);
    return true;
  },
  getSaved: (studentId: string) =>
    (global.mockSaved || []).filter((s) => s.studentId === studentId),
  saveListing: (studentId: string, listingId: string) => {
    const exists = (global.mockSaved || []).some(
      (s) => s.studentId === studentId && s.listingId === listingId
    );
    if (exists) throw new Error("Duplicate save");
    const newSaved: MockSaved = {
      _id: Math.random().toString(36).substring(2, 11),
      studentId,
      listingId,
      savedAt: new Date().toISOString(),
    };
    global.mockSaved = [newSaved, ...(global.mockSaved || [])];
    return newSaved;
  },
  unsaveListing: (studentId: string, listingId: string) => {
    global.mockSaved = (global.mockSaved || []).filter(
      (s) => !(s.studentId === studentId && s.listingId === listingId)
    );
    return true;
  },
  getInquiries: (role: "student" | "owner", userId: string) => {
    const inquiries = global.mockInquiries || [];
    if (role === "student") {
      return inquiries.filter((i) => i.studentId === userId);
    }
    // Any owner sees their listings or all test owner listings
    return inquiries.filter(
      (i) => i.ownerId === userId || i.ownerId === TEST_OWNER_ID || !userId
    );
  },
  createInquiry: (inquiry: Omit<MockInquiry, "_id" | "createdAt">) => {
    const newInquiry: MockInquiry = {
      ...inquiry,
      _id: Math.random().toString(36).substring(2, 11),
      createdAt: new Date().toISOString(),
    };
    global.mockInquiries = [newInquiry, ...(global.mockInquiries || [])];
    return newInquiry;
  },
  respondInquiry: (id: string, ownerId: string) => {
    global.mockInquiries = (global.mockInquiries || []).map((i) =>
      i._id === id ? { ...i, status: "responded" } : i
    );
    return true;
  },
  getConversations: (userId: string) => {
    return (global.mockConversations || []).filter(
      (c) => c.studentId === userId || c.ownerId === userId || c.ownerId === TEST_OWNER_ID || !userId
    );
  },
  getOrCreateConversation: (params: {
    studentId: string;
    studentName?: string;
    studentEmail?: string;
    ownerId: string;
    listingId: string;
    listingTitle: string;
    initialMessage?: string;
  }) => {
    let conv = (global.mockConversations || []).find(
      (c) => c.studentId === params.studentId && c.listingId === params.listingId
    );
    if (!conv) {
      conv = {
        _id: "conv_" + Math.random().toString(36).substring(2, 9),
        studentId: params.studentId,
        studentName: params.studentName || "Student User",
        studentEmail: params.studentEmail || "",
        ownerId: params.ownerId || TEST_OWNER_ID,
        listingId: params.listingId,
        listingTitle: params.listingTitle,
        lastMessage: params.initialMessage || "Chat started",
        lastMessageAt: new Date().toISOString(),
        unreadCountStudent: 0,
        unreadCountOwner: params.initialMessage ? 1 : 0,
        createdAt: new Date().toISOString(),
      };
      global.mockConversations = [conv, ...(global.mockConversations || [])];

      if (params.initialMessage) {
        const msg: MockMessage = {
          _id: "msg_" + Math.random().toString(36).substring(2, 9),
          conversationId: conv._id,
          senderId: params.studentId,
          senderRole: "student",
          content: params.initialMessage,
          read: false,
          createdAt: new Date().toISOString(),
        };
        global.mockMessages = [...(global.mockMessages || []), msg];
      }
    }
    return conv;
  },
  getMessages: (conversationId: string) => {
    return (global.mockMessages || []).filter(
      (m) => m.conversationId === conversationId
    );
  },
  sendMessage: (params: {
    conversationId: string;
    senderId: string;
    senderRole: "student" | "owner";
    content: string;
  }) => {
    const newMsg: MockMessage = {
      _id: "msg_" + Math.random().toString(36).substring(2, 9),
      conversationId: params.conversationId,
      senderId: params.senderId,
      senderRole: params.senderRole,
      content: params.content,
      read: false,
      createdAt: new Date().toISOString(),
    };
    global.mockMessages = [...(global.mockMessages || []), newMsg];

    // Update conversation last message
    global.mockConversations = (global.mockConversations || []).map((c) => {
      if (c._id === params.conversationId) {
        return {
          ...c,
          lastMessage: params.content,
          lastMessageAt: newMsg.createdAt,
        };
      }
      return c;
    });

    return newMsg;
  },
};
