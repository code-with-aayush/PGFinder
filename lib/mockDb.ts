// In-memory mock database fallback for PGFinder
// Used when MongoDB Atlas connection fails or is not configured.

export interface MockListing {
  _id: string;
  ownerId: string;
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
  ownerPhone?: string;
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

const PHOTOS = [
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800&h=600&fit=crop",
];

// Initialize mock data globally to persist changes in dev reload
// eslint-disable-next-line no-var
declare global {
  var mockListings: MockListing[] | undefined;
  var mockInquiries: MockInquiry[] | undefined;
  var mockSaved: MockSaved[] | undefined;
}

if (!global.mockListings) {
  global.mockListings = [
    {
      _id: "64ba3c690a2c918a5e000001",
      ownerId: "seed_owner_001",
      title: "Sunshine PG for Girls",
      description: "Well-maintained girls PG with home-cooked meals. Located near DTU campus. Spacious rooms with attached bathrooms. 24/7 security and CCTV surveillance. Walking distance to metro station.",
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
      ownerId: "seed_owner_001",
      title: "Royal Boys Hostel",
      description: "Premium boys hostel with modern amenities. AC rooms, high-speed WiFi, and gym access. Located in the heart of South Delhi with excellent connectivity.",
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
      ownerId: "seed_owner_001",
      title: "Green Valley PG",
      description: "Budget-friendly PG for students. Clean rooms, filtered water, home-style food. Close to North Campus DU colleges.",
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
      ownerId: "seed_owner_001",
      title: "Koramangala Student Hub",
      description: "Modern co-living space in Koramangala, 5th Block. Perfect for students of Christ University and PES. Fully furnished rooms with study tables.",
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
      ownerId: "seed_owner_001",
      title: "BTM Layout Girls PG",
      description: "Safe and secure girls PG in BTM Layout. Homelike atmosphere with strict security. Near Silk Board junction with bus connectivity to all tech parks.",
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
      ownerId: "seed_owner_001",
      title: "HSR Layout Boys Hostel",
      description: "Affordable boys hostel in HSR Layout. Triple and double sharing available. Walking distance to HSR BDA Complex for food and shopping.",
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
      ownerId: "seed_owner_001",
      title: "Indiranagar Premium PG",
      description: "Premium PG accommodation in Indiranagar. Walking distance to 100 Feet Road. Fully furnished rooms with AC and premium interiors.",
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
      ownerId: "seed_owner_001",
      title: "Kothrud Student PG",
      description: "Affordable PG near MIT Pune and Cummins College. Home-cooked Maharashtrian meals. Spacious rooms with balcony.",
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
  ];
}

if (!global.mockInquiries) {
  global.mockInquiries = [
    {
      _id: "64ba3d780a2c918a5e000001",
      listingId: "64ba3c690a2c918a5e000001",
      listingTitle: "Sunshine PG for Girls",
      studentId: "seed_student_001",
      ownerId: "seed_owner_001",
      message: "Hi, I am interested in this PG. Is it available for next month?",
      status: "pending",
      createdAt: new Date().toISOString(),
    },
  ];
}

if (!global.mockSaved) {
  global.mockSaved = [];
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
    return inquiries.filter(
      (i) => i.ownerId === userId || (!userId && i.ownerId === "seed_owner_001")
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
      i._id === id && i.ownerId === ownerId ? { ...i, status: "responded" } : i
    );
    return true;
  },
};
