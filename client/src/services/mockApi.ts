import { v4 as uuidv4 } from 'uuid';

// ============= PERSISTENT STORAGE UTILITY FUNCTIONS =============

// Function to load data from localStorage with fallback to default
const loadFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn(`Failed to load ${key} from localStorage:`, error);
  }
  return defaultValue;
};

// CRITICAL FIX: Enhanced function to save data to localStorage with proper event dispatching
const saveToStorage = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));

    // Dispatch multiple events to ensure dashboard updates immediately
    window.dispatchEvent(new CustomEvent('localStorageChanged', {
      detail: { key, data }
    }));

    // Also dispatch specific events based on data type
    if (key.includes('projects')) {
      window.dispatchEvent(new CustomEvent('projectDataChanged', {
        detail: { key, data, timestamp: Date.now() }
      }));
    }
    if (key.includes('sections')) {
      window.dispatchEvent(new CustomEvent('sectionDataChanged', {
        detail: { key, data, timestamp: Date.now() }
      }));
    }
    if (key.includes('spendings')) {
      window.dispatchEvent(new CustomEvent('spendingDataChanged', {
        detail: { key, data, timestamp: Date.now() }
      }));
    }

    console.log(`💾 localStorage saved: ${key} with ${Array.isArray(data) ? data.length : 'data'} items`);
    console.log(`📡 Events dispatched for ${key} data change`);
  } catch (error) {
    console.warn(`Failed to save ${key} to localStorage:`, error);
  }
};

// Clear all app data from localStorage
export const clearAllStoredData = () => {
  const keys = ['helaly_users', 'helaly_egypt_projects', 'helaly_libya_projects',
    'helaly_egypt_sections', 'helaly_libya_sections', 'helaly_egypt_spendings',
    'helaly_libya_spendings', 'helaly_inventory'];
  keys.forEach(key => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn(`Failed to remove ${key} from localStorage:`, error);
    }
  });
};

// Initialize default data on first app load (actual init happens later)
const shouldInitialize = () => {
  return !localStorage.getItem('helaly_data_initialized');
};

const markAsInitialized = () => {
  localStorage.setItem('helaly_data_initialized', 'true');
  localStorage.setItem('helaly_data_initialized_date', new Date().toISOString());
};

// ============= DATA VERSION RESET =============
// Bump DATA_VERSION whenever default data changes to force a fresh reset
const DATA_VERSION = '4';

const checkAndMigrateData = (): void => {
  try {
    const storedVersion = localStorage.getItem('helaly_data_version');
    if (storedVersion !== DATA_VERSION) {
      console.log(`🔄 Data version changed (${storedVersion} → ${DATA_VERSION}), resetting to latest defaults...`);
      const keysToReset = [
        'helaly_users',
        'helaly_egypt_projects', 'helaly_libya_projects',
        'helaly_egypt_sections', 'helaly_libya_sections',
        'helaly_egypt_spendings', 'helaly_libya_spendings',
        'helaly_inventory', 'helaly_data_initialized',
      ];
      keysToReset.forEach(key => localStorage.removeItem(key));
      // Reset language to English default
      localStorage.removeItem('language');
      localStorage.setItem('helaly_data_version', DATA_VERSION);
      console.log('✅ Data reset complete — fresh English defaults will be loaded');
    }
  } catch (e) {
    console.warn('Failed to check data version:', e);
  }
};
checkAndMigrateData();

// ============= DEFAULT DATA =============

// Default Users Data
const defaultUsers = [
  {
    id: '1',
    name: 'Admin User (Egypt)',
    email: 'admin@helaly.com',
    password: 'admin123',
    role: 'admin',
    position: 'System Administrator',
    country: 'egypt',
  },
  {
    id: '2',
    name: 'Admin User (Libya)',
    email: 'admin@helaly.com',
    password: 'admin123',
    role: 'admin',
    position: 'System Administrator',
    country: 'libya',
  }
];

// Load users from localStorage or use defaults
let users = loadFromStorage('helaly_users', defaultUsers);

// Default Projects Data - Road Construction Projects (Egypt)
const defaultEgyptProjects = [
  {
    id: 'eg-1',
    name: 'Cairo-Alexandria Desert Highway (Phase 1)',
    description: 'Construction and development of 50 km of the new desert highway between Cairo and Alexandria',
    startDate: '2024-06-01',
    endDate: '2025-06-01',
    status: 'in_progress',
    budget: 2500000,
    manager: 'Ahmed Mohamed Ali',
    totalLength: 50,
    unit: 'km',
    progress: 44,
    location: 'Cairo - Alexandria',
    clientName: 'Egyptian Roads and Bridges Authority',
    clientEmail: 'info@roads.gov.eg',
    clientPhone: '+201234567890',
    country: 'egypt',
    createdAt: '2023-06-01T08:00:00Z'
  },
  {
    id: 'eg-2',
    name: 'New North Coast Road',
    description: 'Construction of a new 120 km coastal road with bridges and service stations',
    startDate: '2024-04-15',
    endDate: '2025-12-31',
    status: 'in_progress',
    budget: 6000000,
    manager: 'Sara Ahmed Hassan',
    totalLength: 120,
    unit: 'km',
    progress: 30,
    location: 'Egyptian North Coast',
    clientName: 'Egyptian Ministry of Transport',
    clientEmail: 'contact@transport.gov.eg',
    clientPhone: '+201234567891',
    country: 'egypt',
    createdAt: '2023-04-15T08:00:00Z'
  },
  {
    id: 'eg-3',
    name: 'Aswan - Abu Simbel Road Development',
    description: 'Development and widening of the tourist road from Aswan to Abu Simbel',
    startDate: '2024-08-01',
    endDate: '2025-08-01',
    status: 'not_started',
    budget: 1800000,
    manager: 'Mohamed Abdel Rahman',
    totalLength: 80,
    unit: 'km',
    progress: 0, // Auto-calculated from sections
    location: 'Aswan',
    clientName: 'Egyptian Ministry of Tourism and Antiquities',
    clientEmail: 'info@tourism.gov.eg',
    clientPhone: '+201234567892',
    country: 'egypt',
    createdAt: '2023-08-01T08:00:00Z'
  },
  {
    id: 'eg-4',
    name: 'Al-Obour City Internal Road Network',
    description: 'Construction of an internal road network for Al-Obour City with a total length of 25 km',
    startDate: '2024-01-01',
    endDate: '2024-10-31',
    status: 'completed',
    budget: 1200000,
    manager: 'Fatima Al-Zahra',
    totalLength: 25,
    unit: 'km',
    progress: 100, // Auto-calculated from sections
    location: 'Al-Obour City',
    clientName: 'Egyptian New Urban Communities Authority',
    clientEmail: 'info@newcities.gov.eg',
    clientPhone: '+201234567893',
    country: 'egypt',
    createdAt: '2023-01-01T08:00:00Z'
  }
];

// Load Egypt projects from localStorage or use defaults
let egyptProjects = loadFromStorage('helaly_egypt_projects', defaultEgyptProjects);

// Default Projects Data — Libya Branch (clearly distinct from Egypt)
const defaultLibyaProjects = [
  {
    id: 'ly-1',
    name: 'Misrata Port Access Highway',
    description: 'Construction of a dual-carriageway highway connecting Misrata port to the national road network, including 4 interchanges and 2 bridges',
    startDate: '2024-03-01',
    endDate: '2026-03-01',
    status: 'in_progress',
    budget: 12000000,
    manager: 'Khalid Al-Misrati',
    totalLength: 65,
    unit: 'km',
    progress: 18,
    location: 'Misrata',
    clientName: 'Misrata Municipal Council',
    clientEmail: 'projects@misrata.gov.ly',
    clientPhone: '+218514321001',
    country: 'libya',
    createdAt: '2023-12-01T08:00:00Z'
  },
  {
    id: 'ly-2',
    name: 'Benghazi Ring Road Phase II',
    description: 'Second phase of the Benghazi outer ring road — 90 km bypass to reduce city-centre congestion and serve new industrial zones',
    startDate: '2024-06-01',
    endDate: '2025-11-30',
    status: 'in_progress',
    budget: 7400000,
    manager: 'Nour Al-Barasi',
    totalLength: 90,
    unit: 'km',
    progress: 35,
    location: 'Benghazi',
    clientName: 'Benghazi Infrastructure Authority',
    clientEmail: 'roads@benghazi.gov.ly',
    clientPhone: '+218614321002',
    country: 'libya',
    createdAt: '2024-01-15T08:00:00Z'
  },
  {
    id: 'ly-3',
    name: 'Sebha - Ubari Desert Crossing',
    description: 'New 280 km desert road connecting Sebha to Ubari across the Fezzan region — upgrading a track to a paved two-lane highway',
    startDate: '2024-09-01',
    endDate: '2026-06-30',
    status: 'not_started',
    budget: 4800000,
    manager: 'Ibrahim Al-Fezzani',
    totalLength: 280,
    unit: 'km',
    progress: 0,
    location: 'Fezzan — Sebha to Ubari',
    clientName: 'Libyan Roads & Bridges General Authority',
    clientEmail: 'info@lrba.gov.ly',
    clientPhone: '+218714321003',
    country: 'libya',
    createdAt: '2024-04-01T08:00:00Z'
  },
  {
    id: 'ly-4',
    name: 'Tripoli Coastal Corniche Rehabilitation',
    description: 'Full rehabilitation and widening of 18 km of the Tripoli coastal corniche road, including new pedestrian walkways, lighting, and drainage',
    startDate: '2023-10-01',
    endDate: '2024-10-31',
    status: 'completed',
    budget: 2100000,
    manager: 'Amira Al-Tajoura',
    totalLength: 18,
    unit: 'km',
    progress: 100,
    location: 'Tripoli',
    clientName: 'Tripoli Municipality',
    clientEmail: 'works@tripoli.gov.ly',
    clientPhone: '+218214321004',
    country: 'libya',
    createdAt: '2023-08-01T08:00:00Z'
  }
];

// Load Libya projects from localStorage or use defaults
let libyaProjects = loadFromStorage('helaly_libya_projects', defaultLibyaProjects);

// Helper function to get user's country from token
const getUserCountryFromToken = (): 'egypt' | 'libya' => {
  const token = localStorage.getItem('token');
  if (!token || !token.startsWith('mock-jwt-token-')) {
    return 'egypt'; // Default to egypt
  }

  // Extract user ID from token
  const userId = token.split('-')[3];
  const user = users.find(u => u.id === userId);
  return (user?.country as 'egypt' | 'libya') || 'egypt';
};

// Helper function to get projects by country - always reads fresh data from localStorage
const getProjectsByCountry = (country: 'egypt' | 'libya') => {
  // Always get fresh data from localStorage to ensure we have the latest data
  const freshEgyptProjects = loadFromStorage('helaly_egypt_projects', defaultEgyptProjects);
  const freshLibyaProjects = loadFromStorage('helaly_libya_projects', defaultLibyaProjects);

  console.log(`🔄 Getting fresh ${country} projects: ${country === 'egypt' ? freshEgyptProjects.length : freshLibyaProjects.length} found`);

  return (country === 'egypt' ? freshEgyptProjects : freshLibyaProjects) as Project[];
};

// Function to rebuild combined projects array
const rebuildProjectsArray = () => {
  projects = [...egyptProjects, ...libyaProjects];
};

// Combined projects array (for backward compatibility, but will be filtered by country)
let projects = [...egyptProjects, ...libyaProjects];

// Default Sections Data - Egypt
const defaultEgyptSections = [
  // Project eg-1: Cairo-Alexandria Desert Road sections
  {
    id: 'eg-s-1',
    name: 'Excavation and Grading Works',
    description: 'Excavating and grading the road surface and removing obstacles',
    status: 'in_progress',
    manager: 'Ahmed Mohamed Ali',
    budget: 300000,
    employees: 25,
    details: 'Includes soil excavation, rock removal, and slope grading',
    notes: '60% of work completed with high quality',
    projectId: 'eg-1',
    targetQuantity: 30,
    completedQuantity: 18,
    progress: 60,
    country: 'egypt',
    createdAt: '2023-06-01T08:00:00Z'
  },
  {
    id: 'eg-s-2',
    name: 'Backfill and Compaction Works',
    description: 'Backfilling the road with appropriate materials and compacting to specifications',
    status: 'in_progress',
    manager: 'Mahmoud Al-Sayed',
    budget: 250000,
    employees: 20,
    details: 'Using approved backfill materials and compacting with heavy equipment',
    notes: 'Work is progressing according to the scheduled timeline',
    projectId: 'eg-1',
    targetQuantity: 25, // km
    completedQuantity: 7, // km
    progress: 28, // (7/25) * 100
    country: 'egypt',
    createdAt: '2023-06-05T08:00:00Z'
  },
  // Project 2: North Coast Road sections
  {
    id: 'eg-s-3',
    name: 'Excavation and Trenching Works',
    description: 'Excavating and trenching the coastal road considering geological conditions',
    status: 'in_progress',
    manager: 'Sara Ahmed Hassan',
    budget: 800000,
    employees: 40,
    details: 'Specialized excavation for sandy soil and coastal silt',
    notes: 'Challenge of working with coastal soil conditions',
    projectId: 'eg-2',
    targetQuantity: 60, // km
    completedQuantity: 18, // km
    progress: 30, // (18/60) * 100
    country: 'egypt',
    createdAt: '2023-04-20T08:00:00Z'
  },
  {
    id: 'eg-s-4',
    name: 'Backfill and Base Layer Works',
    description: 'Backfilling and constructing the base layer of the coastal road',
    status: 'in_progress',
    manager: 'Ali Hassan',
    budget: 900000,
    employees: 35,
    details: 'Water and sea-salt resistant base layer',
    notes: 'Using corrosion-resistant materials',
    projectId: 'eg-2',
    targetQuantity: 60, // km
    completedQuantity: 18, // km
    progress: 30, // (18/60) * 100
    country: 'egypt',
    createdAt: '2023-04-25T08:00:00Z'
  },
  // Project eg-4: Obour City Internal Roads (Completed project)
  {
    id: 'eg-s-5',
    name: 'Primary Excavation Works',
    description: 'Excavating and preparing internal roads for Al-Obour City',
    status: 'completed',
    manager: 'Fatima Al-Zahra',
    budget: 200000,
    employees: 15,
    details: 'All excavation works completed successfully',
    notes: 'Work completed ahead of the scheduled deadline',
    projectId: 'eg-4',
    targetQuantity: 25, // km
    completedQuantity: 25, // km
    progress: 100, // (25/25) * 100
    country: 'egypt',
    createdAt: '2023-01-15T08:00:00Z'
  },
  {
    id: 'eg-s-6',
    name: 'Backfill and Paving Works',
    description: 'Backfilling and paving internal roads with asphalt',
    status: 'completed',
    manager: 'Khaled Abdullah',
    budget: 180000,
    employees: 12,
    details: 'High-quality paving with rubberized asphalt',
    notes: 'Modern paving techniques were employed',
    projectId: 'eg-4',
    targetQuantity: 25,
    completedQuantity: 25,
    progress: 100,
    country: 'egypt',
    createdAt: '2023-02-01T08:00:00Z'
  }
];

// Load Egypt sections from localStorage or use defaults
let egyptSections = loadFromStorage('helaly_egypt_sections', defaultEgyptSections);

// Default Sections Data — Libya Branch (distinct from Egypt)
const defaultLibyaSections = [
  // Project ly-1: Misrata Port Access Highway
  {
    id: 'ly-s-1',
    name: 'Earthworks & Sub-Base Preparation',
    description: 'Land clearing, earthworks, and sub-base layer preparation for the dual-carriageway',
    status: 'in_progress',
    manager: 'Khalid Al-Misrati',
    budget: 3200000,
    employees: 55,
    details: 'Heavy earthmoving equipment deployed; 18 km of sub-base already completed',
    notes: 'Sandy coastal soil requires extra stabilisation layers',
    projectId: 'ly-1',
    targetQuantity: 65,
    completedQuantity: 12,
    progress: 18,
    country: 'libya',
    createdAt: '2023-12-05T08:00:00Z'
  },
  {
    id: 'ly-s-2',
    name: 'Bridges & Interchange Structures',
    description: 'Design and construction of 2 river bridges and 4 grade-separated interchanges',
    status: 'not_started',
    manager: 'Yusuf Al-Misrati',
    budget: 4500000,
    employees: 40,
    details: 'Structural designs approved; procurement of steel girders in progress',
    notes: 'Awaiting completion of earthworks before pile-driving begins',
    projectId: 'ly-1',
    targetQuantity: 6,
    completedQuantity: 0,
    progress: 0,
    country: 'libya',
    createdAt: '2024-01-10T08:00:00Z'
  },
  // Project ly-2: Benghazi Ring Road Phase II
  {
    id: 'ly-s-3',
    name: 'Northern Arc — Grading & Drainage',
    description: 'Grading, storm-water drainage trenches, and culvert installation for the northern 45 km arc',
    status: 'in_progress',
    manager: 'Nour Al-Barasi',
    budget: 2000000,
    employees: 38,
    details: 'Drainage network layout complete; grading at 60% on the northern arc',
    notes: 'Rock outcrops require blasting — additional 2 weeks for permits',
    projectId: 'ly-2',
    targetQuantity: 45,
    completedQuantity: 32,
    progress: 71,
    country: 'libya',
    createdAt: '2024-02-01T08:00:00Z'
  },
  {
    id: 'ly-s-4',
    name: 'Southern Arc — Asphalt Paving',
    description: 'Base course and asphalt wearing course for the southern 45 km arc of the ring road',
    status: 'in_progress',
    manager: 'Ramzi Al-Zawawi',
    budget: 2600000,
    employees: 30,
    details: 'Modified bitumen asphalt mix used to handle high summer temperatures',
    notes: 'Paving operations run at night to avoid heat warping',
    projectId: 'ly-2',
    targetQuantity: 45,
    completedQuantity: 4,
    progress: 9,
    country: 'libya',
    createdAt: '2024-03-15T08:00:00Z'
  },
  // Project ly-4: Tripoli Corniche (completed)
  {
    id: 'ly-s-5',
    name: 'Road Rehabilitation & Widening',
    description: 'Full milling, pavement rehabilitation, and widening from 2 to 4 lanes along the corniche',
    status: 'completed',
    manager: 'Amira Al-Tajoura',
    budget: 1200000,
    employees: 20,
    details: 'All 18 km rehabilitated and handed over to the municipality',
    notes: 'Completed 3 weeks ahead of schedule',
    projectId: 'ly-4',
    targetQuantity: 18,
    completedQuantity: 18,
    progress: 100,
    country: 'libya',
    createdAt: '2023-10-05T08:00:00Z'
  },
  {
    id: 'ly-s-6',
    name: 'Pedestrian Walkways & Landscaping',
    description: 'New 3-metre-wide pedestrian walkways, palm tree planting, benches, and solar lighting',
    status: 'completed',
    manager: 'Salwa Al-Warfali',
    budget: 580000,
    employees: 14,
    details: 'Landscaping and lighting fully installed; area open to public',
    notes: 'Positive public reception; municipality requested 2 km extension',
    projectId: 'ly-4',
    targetQuantity: 18,
    completedQuantity: 18,
    progress: 100,
    country: 'libya',
    createdAt: '2023-10-20T08:00:00Z'
  }
];

// Load Libya sections from localStorage or use defaults
let libyaSections = loadFromStorage('helaly_libya_sections', defaultLibyaSections);

// Helper function to get sections by country - always reads fresh data from localStorage
const getSectionsByCountry = (country: 'egypt' | 'libya') => {
  // Always get fresh data from localStorage to ensure we have the latest data
  const freshEgyptSections = loadFromStorage('helaly_egypt_sections', defaultEgyptSections);
  const freshLibyaSections = loadFromStorage('helaly_libya_sections', defaultLibyaSections);

  console.log(`🔄 Getting fresh ${country} sections: ${country === 'egypt' ? freshEgyptSections.length : freshLibyaSections.length} found`);

  return (country === 'egypt' ? freshEgyptSections : freshLibyaSections);
};



// Combined sections array (for backward compatibility, but will be filtered by country)
let sections = [...egyptSections, ...libyaSections];

// Default Spendings Data - Egypt
const defaultEgyptSpendings = [
  {
    id: 'eg-sp-1',
    projectId: 'eg-1',
    projectName: 'Cairo-Alexandria Desert Highway',
    sectionId: 'eg-s-1',
    sectionName: 'Excavation and Grading Works',
    amount: 75000,
    category: 'Materials',
    description: 'Construction materials and reinforced concrete',
    date: '2023-08-05',
    approvedBy: 'Ahmed Mohamed Ali',
    country: 'egypt',
    createdAt: '2023-08-05T10:00:00Z'
  },
  {
    id: 'eg-sp-2',
    projectId: 'eg-1',
    projectName: 'Cairo-Alexandria Desert Highway',
    sectionId: 'eg-s-2',
    sectionName: 'Backfill and Compaction Works',
    amount: 25000,
    category: 'Labor',
    description: 'Labor wages for the first week',
    date: '2023-08-08',
    approvedBy: 'Mahmoud Al-Sayed',
    country: 'egypt',
    createdAt: '2023-08-08T10:00:00Z'
  },
  {
    id: '3',
    projectId: '2',
    projectName: 'Al-Yasmin Residential Complex',
    sectionId: '2',
    sectionName: 'Electrical and Mechanical Section',
    amount: 120000,
    category: 'equipment',
    description: 'Electrical equipment and air conditioning systems',
    date: '2023-08-15',
    approvedBy: 'Sara Ahmed Hassan',
    createdAt: '2023-08-15T10:00:00Z'
  },
  {
    id: '4',
    projectId: '2',
    projectName: 'Al-Yasmin Residential Complex',
    sectionId: '1',
    sectionName: 'Civil Engineering Section',
    amount: 180000,
    category: 'materials',
    description: 'Steel and cement for foundations',
    date: '2023-08-20',
    approvedBy: 'Sara Ahmed Hassan',
    createdAt: '2023-08-20T10:00:00Z'
  },
  {
    id: '5',
    projectId: '4',
    projectName: 'Al-Nakheel Commercial Center',
    sectionId: '3',
    sectionName: 'Finishing and Decor Section',
    amount: 90000,
    category: 'materials',
    description: 'Premium finishing materials and decor',
    date: '2023-07-10',
    approvedBy: 'Fatima Al-Zahra',
    createdAt: '2023-07-10T10:00:00Z'
  },
  {
    id: '6',
    projectId: '4',
    projectName: 'Al-Nakheel Commercial Center',
    sectionId: '4',
    sectionName: 'Safety and Quality Section',
    amount: 15000,
    category: 'consulting',
    description: 'Technical consultations and quality auditing',
    date: '2023-07-15',
    approvedBy: 'Fatima Al-Zahra',
    createdAt: '2023-07-15T10:00:00Z'
  },
  {
    id: '7',
    projectId: '1',
    projectName: 'Administrative Offices Development Project',
    sectionId: '2',
    sectionName: 'Electrical and Mechanical Section',
    amount: 45000,
    category: 'equipment',
    description: 'Electrical devices and backup generators',
    date: '2023-08-25',
    approvedBy: 'Ahmed Mohamed Ali',
    createdAt: '2023-08-25T10:00:00Z'
  },
  {
    id: '8',
    projectId: '2',
    projectName: 'Al-Yasmin Residential Complex',
    sectionId: '3',
    sectionName: 'Finishing and Decor Section',
    amount: 65000,
    category: 'Labor',
    description: 'Wages for finishing and decor workers',
    date: '2023-08-30',
    approvedBy: 'Sara Ahmed Hassan',
    country: 'egypt',
    createdAt: '2023-08-30T10:00:00Z'
  }
];

// Load Egypt spendings from localStorage or use defaults
let egyptSpendings = loadFromStorage('helaly_egypt_spendings', defaultEgyptSpendings);

// Default Spendings Data — Libya Branch
const defaultLibyaSpendings = [
  {
    id: 'ly-sp-1',
    projectId: 'ly-1',
    projectName: 'Misrata Port Access Highway',
    sectionId: 'ly-s-1',
    sectionName: 'Earthworks & Sub-Base Preparation',
    amount: 420000,
    category: 'Materials',
    description: 'Aggregate, sub-base material, and geotextile fabric',
    date: '2024-01-10',
    approvedBy: 'Khalid Al-Misrati',
    country: 'libya',
    createdAt: '2024-01-10T10:00:00Z'
  },
  {
    id: 'ly-sp-2',
    projectId: 'ly-1',
    projectName: 'Misrata Port Access Highway',
    sectionId: 'ly-s-1',
    sectionName: 'Earthworks & Sub-Base Preparation',
    amount: 180000,
    category: 'Labor',
    description: 'Operator wages and site labour — January',
    date: '2024-01-31',
    approvedBy: 'Khalid Al-Misrati',
    country: 'libya',
    createdAt: '2024-01-31T10:00:00Z'
  },
  {
    id: 'ly-sp-3',
    projectId: 'ly-2',
    projectName: 'Benghazi Ring Road Phase II',
    sectionId: 'ly-s-3',
    sectionName: 'Northern Arc — Grading & Drainage',
    amount: 310000,
    category: 'Equipment',
    description: 'Motor grader and compactor hire — Q1 2024',
    date: '2024-02-15',
    approvedBy: 'Nour Al-Barasi',
    country: 'libya',
    createdAt: '2024-02-15T10:00:00Z'
  },
  {
    id: 'ly-sp-4',
    projectId: 'ly-2',
    projectName: 'Benghazi Ring Road Phase II',
    sectionId: 'ly-s-4',
    sectionName: 'Southern Arc — Asphalt Paving',
    amount: 650000,
    category: 'Materials',
    description: 'Modified bitumen asphalt mix — first delivery',
    date: '2024-04-01',
    approvedBy: 'Ramzi Al-Zawawi',
    country: 'libya',
    createdAt: '2024-04-01T10:00:00Z'
  },
  {
    id: 'ly-sp-5',
    projectId: 'ly-4',
    projectName: 'Tripoli Coastal Corniche Rehabilitation',
    sectionId: 'ly-s-5',
    sectionName: 'Road Rehabilitation & Widening',
    amount: 880000,
    category: 'Materials',
    description: 'Milling, asphalt, and kerb stones for full 18 km',
    date: '2023-11-20',
    approvedBy: 'Amira Al-Tajoura',
    country: 'libya',
    createdAt: '2023-11-20T10:00:00Z'
  }
];

// Load Libya spendings from localStorage or use defaults
let libyaSpendings = loadFromStorage('helaly_libya_spendings', defaultLibyaSpendings);

// Helper function to get spendings by country - always reads fresh data from localStorage
const getSpendingsByCountry = (country: 'egypt' | 'libya') => {
  // Always get fresh data from localStorage to ensure we have the latest data
  const freshEgyptSpendings = loadFromStorage('helaly_egypt_spendings', defaultEgyptSpendings);
  const freshLibyaSpendings = loadFromStorage('helaly_libya_spendings', defaultLibyaSpendings);

  console.log(`🔄 Getting fresh ${country} spendings: ${country === 'egypt' ? freshEgyptSpendings.length : freshLibyaSpendings.length} found`);

  return (country === 'egypt' ? freshEgyptSpendings : freshLibyaSpendings) as Spending[];
};

// Function to rebuild combined spendings array
const rebuildSpendingsArray = () => {
  spendings = [...egyptSpendings, ...libyaSpendings];
};

// Combined spendings array (for backward compatibility, but will be filtered by country)
let spendings = [...egyptSpendings, ...libyaSpendings];

// --- Authentication ---

export const mockLogin = async (email: string, password: string, country?: 'egypt' | 'libya') => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // If country is provided, find user with email, password, and country
  // Otherwise, find the first user with email and password (backward compatibility)
  const user = country
    ? users.find(u => u.email === email && u.password === password && u.country === country)
    : users.find(u => u.email === email && u.password === password);

  if (!user) {
    const errorMsg = country
      ? `Invalid email, password, or country selection`
      : 'Invalid email or password';
    throw new Error(errorMsg);
  }

  // Create mock token
  const token = `mock-jwt-token-${user.id}-${Date.now()}`;

  // Return user data without password
  const { password: _, ...userData } = user;

  return { token, user: userData };
};

export const mockGetUserProfile = async (token: string) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));

  if (!token.startsWith('mock-jwt-token-')) {
    throw new Error('Invalid token');
  }

  // Extract user ID from token
  const userId = token.split('-')[3];
  const user = users.find(u => u.id === userId);

  if (!user) {
    throw new Error('User not found');
  }

  // Return user data without password
  const { password: _, ...userData } = user;
  return userData;
};

// --- Projects ---

// Helper function to calculate project progress from sections
const calculateProjectProgress = (projectId: string) => {
  const userCountry = getUserCountryFromToken();
  const countrySections = getSectionsByCountry(userCountry);
  const projectSections = countrySections.filter(s => s.projectId === projectId);
  if (projectSections.length === 0) return 0;

  const totalProgress = projectSections.reduce((sum, section) => sum + (section.progress || 0), 0);
  return Math.round(totalProgress / projectSections.length);
};

export const mockGetProjects = async () => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));

  console.log('🔄 mockGetProjects: Starting to fetch projects...');

  // Get user's country and filter projects - ALWAYS read fresh from localStorage
  const userCountry = getUserCountryFromToken();
  console.log('🔄 mockGetProjects: User country:', userCountry);

  // Force fresh read from localStorage each time
  const freshEgyptProjects = loadFromStorage('helaly_egypt_projects', defaultEgyptProjects);
  const freshLibyaProjects = loadFromStorage('helaly_libya_projects', defaultLibyaProjects);

  const countryProjects = userCountry === 'egypt' ? freshEgyptProjects : freshLibyaProjects;
  console.log(`🔄 mockGetProjects: Found ${countryProjects.length} projects for ${userCountry}`);

  // Update project progress based on sections
  const updatedProjects = countryProjects.map(project => ({
    ...project,
    progress: calculateProjectProgress(project.id)
  }));

  console.log('✅ mockGetProjects: Returning projects:', updatedProjects.map(p => ({ name: p.name, status: p.status })));
  return updatedProjects;
};

export const mockGetProjectById = async (id: string) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 200));

  console.log(`🔍 Looking for project with ID: ${id}`);

  // Get user's country and search in country-specific array for fresh data
  const userCountry = getUserCountryFromToken();
  const countryProjects = getProjectsByCountry(userCountry);

  const project = countryProjects.find(p => p.id === id);

  if (!project) {
    console.error(`❌ Project ${id} not found in ${userCountry} projects`);
    throw new Error('Project not found');
  }

  console.log(`✅ Found project: ${project.name}`);

  // Get sections for this project
  const countrySections = getSectionsByCountry(userCountry);
  const projectSections = countrySections.filter(s => s.projectId === id);

  // Get spendings for this project
  const countrySpendings = getSpendingsByCountry(userCountry);
  const projectSpendings = countrySpendings.filter(s => s.projectId === id);

  // Return project with sections, updated progress and spendings
  return {
    ...project,
    progress: calculateProjectProgress(id),
    sections: projectSections,
    spendings: projectSpendings
  };
};

export const mockCreateProject = async (project: any) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Get current user's country to add project to correct country-specific array
  const userCountry = getUserCountryFromToken();

  const newProject = {
    ...project,
    id: uuidv4(),
    country: userCountry,
    createdAt: new Date().toISOString()
  };

  // Add to the combined projects array
  projects.push(newProject);

  // IMPORTANT: Also add to the appropriate country-specific array
  // so that getProjectsByCountry can find it
  if (userCountry === 'egypt') {
    egyptProjects.push(newProject);
    // Save Egypt projects to localStorage
    saveToStorage('helaly_egypt_projects', egyptProjects);
  } else {
    libyaProjects.push(newProject);
    // Save Libya projects to localStorage
    saveToStorage('helaly_libya_projects', libyaProjects);
  }

  // Update in-memory arrays from localStorage
  if (userCountry === 'egypt') {
    egyptProjects.length = 0;
    egyptProjects.push(...loadFromStorage('helaly_egypt_projects', defaultEgyptProjects));
  } else {
    libyaProjects.length = 0;
    libyaProjects.push(...loadFromStorage('helaly_libya_projects', defaultLibyaProjects));
  }

  // Rebuild combined projects array
  rebuildProjectsArray();

  // Save users to localStorage (in case user data was updated)
  saveToStorage('helaly_users', users);

  // Automatically update sections cache if any sections reference this project
  // This ensures that when sections are queried, they will include the new project

  return newProject;
};

export const mockUpdateProject = async (id: string, projectData: any) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  console.log(`✏️ Updating project with ID: ${id}`);

  // Get user's country to update in correct country-specific array
  const userCountry = getUserCountryFromToken();

  let updatedProject;

  // Find and update in country-specific arrays
  if (userCountry === 'egypt') {
    const index = egyptProjects.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error('Project not found in Egypt projects');
    }

    // Update Egypt project
    egyptProjects[index] = {
      ...egyptProjects[index],
      ...projectData,
      updatedAt: new Date().toISOString()
    };

    updatedProject = egyptProjects[index];

    // Save updated Egypt projects to localStorage
    saveToStorage('helaly_egypt_projects', egyptProjects);
    console.log(`✅ Project updated in Egypt projects. Total: ${egyptProjects.length}`);

  } else {
    const index = libyaProjects.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error('Project not found in Libya projects');
    }

    // Update Libya project
    libyaProjects[index] = {
      ...libyaProjects[index],
      ...projectData,
      updatedAt: new Date().toISOString()
    };

    updatedProject = libyaProjects[index];

    // Save updated Libya projects to localStorage
    saveToStorage('helaly_libya_projects', libyaProjects);
    console.log(`✅ Project updated in Libya projects. Total: ${libyaProjects.length}`);
  }

  // Update combined projects array
  rebuildProjectsArray();

  console.log(`✅ Project ${id} updated successfully!`);
  return updatedProject;
};

export const mockDeleteProject = async (id: string) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 400));

  console.log(`🗑️ Deleting project with ID: ${id}`);

  // Get user's country to delete from correct country-specific array
  const userCountry = getUserCountryFromToken();

  // Find and delete from country-specific arrays
  if (userCountry === 'egypt') {
    const index = egyptProjects.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error('Project not found in Egypt projects');
    }

    // Remove from Egypt projects array
    egyptProjects.splice(index, 1);

    // Save updated Egypt projects to localStorage
    saveToStorage('helaly_egypt_projects', egyptProjects);
    console.log(`✅ Project deleted from Egypt projects. Remaining: ${egyptProjects.length}`);

  } else {
    const index = libyaProjects.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error('Project not found in Libya projects');
    }

    // Remove from Libya projects array
    libyaProjects.splice(index, 1);

    // Save updated Libya projects to localStorage
    saveToStorage('helaly_libya_projects', libyaProjects);
    console.log(`✅ Project deleted from Libya projects. Remaining: ${libyaProjects.length}`);
  }

  // Update combined projects array
  rebuildProjectsArray();

  // Delete associated spendings
  if (userCountry === 'egypt') {
    const beforeCount = egyptSpendings.length;
    egyptSpendings = egyptSpendings.filter(s => s.projectId !== id);
    saveToStorage('helaly_egypt_spendings', egyptSpendings);
    console.log(`🧹 Deleted ${beforeCount - egyptSpendings.length} associated spendings from Egypt`);
  } else {
    const beforeCount = libyaSpendings.length;
    libyaSpendings = libyaSpendings.filter(s => s.projectId !== id);
    saveToStorage('helaly_libya_spendings', libyaSpendings);
    console.log(`🧹 Deleted ${beforeCount - libyaSpendings.length} associated spendings from Libya`);
  }

  // Rebuild combined spendings array
  rebuildSpendingsArray();

  console.log(`✅ Project ${id} deleted successfully!`);
  return { success: true };
};

// --- Sections ---

export const mockGetSections = async (projectId?: string) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));

  // Get user's country and filter sections
  const userCountry = getUserCountryFromToken();
  const countrySections = getSectionsByCountry(userCountry);
  const countryProjects = getProjectsByCountry(userCountry);

  // Enhance sections with project names
  const sectionsWithProjectNames = countrySections.map(section => {
    const project = countryProjects.find(p => p.id === section.projectId);
    return {
      ...section,
      projectName: project?.name || 'Unspecified Project'
    };
  });

  // If projectId is provided, filter by projectId as well
  if (projectId) {
    return sectionsWithProjectNames.filter(section => section.projectId === projectId);
  }

  return sectionsWithProjectNames;
};

export const mockGetSectionById = async (id: string) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 200));

  // Get user's country and filter sections
  const userCountry = getUserCountryFromToken();
  const countrySections = getSectionsByCountry(userCountry);

  const section = countrySections.find(s => s.id === id);

  if (!section) {
    throw new Error('Section not found');
  }

  // Get project information if section has projectId
  let projectName = '';
  if (section.projectId) {
    const countryProjects = getProjectsByCountry(userCountry);
    const project = countryProjects.find(p => p.id === section.projectId);
    projectName = project?.name || '';
  }

  return {
    ...section,
    projectName
  };
};

export const mockCreateSection = async (sectionData: any) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 400));

  // Calculate progress automatically from quantities
  const progress = sectionData.targetQuantity && sectionData.targetQuantity > 0
    ? Math.round((sectionData.completedQuantity / sectionData.targetQuantity) * 100)
    : 0;

  // Get user's country to add to correct sections array
  const userCountry = getUserCountryFromToken();

  const newSection = {
    id: uuidv4(),
    name: sectionData.name,
    description: sectionData.description,
    status: sectionData.status || 'not_started',
    manager: sectionData.manager || sectionData.assignedTo || '',
    budget: sectionData.budget || 0,
    employees: sectionData.employees || 0,
    details: sectionData.details || '',
    notes: sectionData.notes || '',
    projectId: sectionData.projectId,
    targetQuantity: sectionData.targetQuantity || 0,
    completedQuantity: sectionData.completedQuantity || 0,
    progress: progress,
    country: userCountry,
    createdAt: new Date().toISOString()
  };

  // Add to correct country-specific sections array and save to localStorage
  if (userCountry === 'egypt') {
    egyptSections.push(newSection);
    // Save Egypt sections to localStorage
    saveToStorage('helaly_egypt_sections', egyptSections);
  } else {
    libyaSections.push(newSection);
    // Save Libya sections to localStorage
    saveToStorage('helaly_libya_sections', libyaSections);
  }

  // Also add to combined array for backward compatibility
  sections.push(newSection);

  console.log(`✅ Section created and saved to localStorage for ${userCountry}. Total: ${userCountry === 'egypt' ? egyptSections.length : libyaSections.length}`);

  return newSection;
};

export const mockUpdateSection = async (id: string, sectionData: any) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 400));

  // Get user's country and find section in country-specific array
  const userCountry = getUserCountryFromToken();
  const countrySections = getSectionsByCountry(userCountry);
  const countryIndex = countrySections.findIndex(s => s.id === id);

  if (countryIndex === -1) {
    throw new Error('Section not found');
  }

  // Find in combined array too
  const index = sections.findIndex(s => s.id === id);

  // Calculate progress automatically from quantities if they are being updated
  const currentSection = countrySections[countryIndex];
  const targetQuantity = sectionData.targetQuantity !== undefined ? sectionData.targetQuantity : currentSection.targetQuantity;
  const completedQuantity = sectionData.completedQuantity !== undefined ? sectionData.completedQuantity : currentSection.completedQuantity;

  const progress = targetQuantity && targetQuantity > 0
    ? Math.round((completedQuantity / targetQuantity) * 100)
    : 0;

  // Update section data
  const updatedSection = {
    ...currentSection,
    ...sectionData,
    progress: progress,
    manager: sectionData.manager || sectionData.assignedTo || currentSection.manager,
    updatedAt: new Date().toISOString()
  };

  // Update in country-specific array
  countrySections[countryIndex] = updatedSection;

  // Update in combined array if found
  if (index !== -1) {
    sections[index] = updatedSection;
  }

  // Save to localStorage based on country
  if (userCountry === 'egypt') {
    // Update the actual egyptSections array reference
    egyptSections[countryIndex] = updatedSection;
    saveToStorage('helaly_egypt_sections', egyptSections);
  } else {
    // Update the actual libyaSections array reference
    libyaSections[countryIndex] = updatedSection;
    saveToStorage('helaly_libya_sections', libyaSections);
  }

  console.log(`✅ Section updated and saved to localStorage for ${userCountry}. Total: ${userCountry === 'egypt' ? egyptSections.length : libyaSections.length}`);

  return updatedSection;
};

export const mockDeleteSection = async (id: string) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));

  // Get user's country and find section in country-specific array
  const userCountry = getUserCountryFromToken();
  const countrySections = getSectionsByCountry(userCountry);
  const countryIndex = countrySections.findIndex(s => s.id === id);

  if (countryIndex === -1) {
    throw new Error('Section not found');
  }

  // Delete from country-specific array
  if (userCountry === 'egypt') {
    egyptSections.splice(countryIndex, 1);
    // Save updated Egypt sections to localStorage
    saveToStorage('helaly_egypt_sections', egyptSections);
  } else {
    libyaSections.splice(countryIndex, 1);
    // Save updated Libya sections to localStorage
    saveToStorage('helaly_libya_sections', libyaSections);
  }

  // Delete from combined array
  sections = sections.filter(s => s.id !== id);

  console.log(`✅ Section deleted and localStorage updated for ${userCountry}. Total: ${userCountry === 'egypt' ? egyptSections.length : libyaSections.length}`);

  return { success: true };
};

// --- Spendings ---

export const mockGetSpendings = async (projectId?: string) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));

  // Get user's country and filter spendings
  const userCountry = getUserCountryFromToken();
  const countrySpendings = getSpendingsByCountry(userCountry);

  if (projectId) {
    return countrySpendings.filter(s => s.projectId === projectId);
  }

  return [...countrySpendings];
};

export const mockCreateSpending = async (spendingData: any) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 400));

  // Get user's country to add to correct spendings array
  const userCountry = getUserCountryFromToken();

  const newSpending = {
    id: uuidv4(),
    ...spendingData,
    country: userCountry,
    createdAt: new Date().toISOString()
  };

  // Add to correct country-specific spendings array
  if (userCountry === 'egypt') {
    egyptSpendings.push(newSpending);
    // Save Egypt spendings to localStorage
    saveToStorage('helaly_egypt_spendings', egyptSpendings);
  } else {
    libyaSpendings.push(newSpending);
    // Save Libya spendings to localStorage
    saveToStorage('helaly_libya_spendings', libyaSpendings);
  }

  // Rebuild combined spendings array
  rebuildSpendingsArray();

  return newSpending;
};

export const mockUpdateSpending = async (id: string, spendingData: any) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 400));

  // Get user's country and find spending in country-specific array
  const userCountry = getUserCountryFromToken();
  const countrySpendings = getSpendingsByCountry(userCountry);
  const countryIndex = countrySpendings.findIndex(s => s.id === id);

  if (countryIndex === -1) {
    throw new Error('Spending not found');
  }

  // Find in combined array too
  const index = spendings.findIndex(s => s.id === id);

  // Update spending data
  const updatedSpending = {
    ...countrySpendings[countryIndex],
    ...spendingData
  };

  // Update in country-specific array
  countrySpendings[countryIndex] = updatedSpending;

  // Update in combined array if found
  if (index !== -1) {
    spendings[index] = updatedSpending;
  }

  // Save to localStorage based on country
  if (userCountry === 'egypt') {
    // Update the actual egyptSpendings array reference
    egyptSpendings[countryIndex] = updatedSpending;
    saveToStorage('helaly_egypt_spendings', egyptSpendings);
  } else {
    // Update the actual libyaSpendings array reference
    libyaSpendings[countryIndex] = updatedSpending;
    saveToStorage('helaly_libya_spendings', libyaSpendings);
  }

  console.log(`✅ Spending ${id} updated and saved to localStorage for ${userCountry}. Total: ${userCountry === 'egypt' ? egyptSpendings.length : libyaSpendings.length}`);

  return updatedSpending;
};

export const mockDeleteSpending = async (id: string) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));

  // Get user's country and find spending in country-specific array
  const userCountry = getUserCountryFromToken();
  const countrySpendings = getSpendingsByCountry(userCountry);
  const countryIndex = countrySpendings.findIndex(s => s.id === id);

  if (countryIndex === -1) {
    throw new Error('Spending not found');
  }

  // Delete from country-specific array and save to localStorage
  if (userCountry === 'egypt') {
    egyptSpendings.splice(countryIndex, 1);
    // Save updated Egypt spendings to localStorage
    saveToStorage('helaly_egypt_spendings', egyptSpendings);
  } else {
    libyaSpendings.splice(countryIndex, 1);
    // Save updated Libya spendings to localStorage
    saveToStorage('helaly_libya_spendings', libyaSpendings);
  }

  // Delete from combined array
  spendings = spendings.filter(s => s.id !== id);

  console.log(`✅ Spending ${id} deleted and localStorage updated for ${userCountry}. Total: ${userCountry === 'egypt' ? egyptSpendings.length : libyaSpendings.length}`);

  return { success: true };
};

// --- Employees ---

// Default Employees Data - Egypt
const defaultEgyptEmployees = [
  {
    id: 'eg-emp-1',
    name: 'Ahmed Mohamed Ali',
    email: 'ahmed@helaly.com',
    phone: '+201234567001',
    employeeType: 'monthly',
    position: 'Civil Engineer',
    monthlySalary: 15000,
    dailyRate: 0,
    currency: 'EGP',
    hireDate: '2023-01-15',
    notes: 'Civil engineer with 10 years of experience',
    projectId: 'eg-1',
    sectionId: 'eg-s-1',
    active: true,
    totalEarned: 180000,
    totalPaid: 165000,
    balance: 15000,
    country: 'egypt',
    payments: [],
    createdAt: '2023-01-15T08:00:00Z',
    createdBy: 'admin',
    updatedAt: '2023-01-15T08:00:00Z'
  },
  {
    id: 'eg-emp-2',
    name: 'Sara Ahmed Hassan',
    email: 'sara@helaly.com',
    phone: '+201234567002',
    employeeType: 'monthly',
    position: 'Architectural Engineer',
    monthlySalary: 12000,
    dailyRate: 0,
    currency: 'EGP',
    hireDate: '2023-03-01',
    notes: 'Architectural engineer specializing in design',
    projectId: 'eg-2',
    sectionId: 'eg-s-3',
    active: true,
    totalEarned: 120000,
    totalPaid: 120000,
    balance: 0,
    country: 'egypt',
    payments: [],
    createdAt: '2023-03-01T08:00:00Z',
    createdBy: 'admin',
    updatedAt: '2023-03-01T08:00:00Z'
  },
  {
    id: 'eg-emp-3',
    name: 'Mohamed Abdel Rahman',
    email: 'mohamed@helaly.com',
    phone: '+201234567003',
    employeeType: 'daily',
    position: 'Construction Worker',
    monthlySalary: 0,
    dailyRate: 300,
    currency: 'EGP',
    hireDate: '2023-06-01',
    notes: 'Skilled construction worker',
    projectId: 'eg-1',
    sectionId: 'eg-s-2',
    active: true,
    totalEarned: 45000,
    totalPaid: 42000,
    balance: 3000,
    country: 'egypt',
    payments: [],
    createdAt: '2023-06-01T08:00:00Z',
    createdBy: 'admin',
    updatedAt: '2023-06-01T08:00:00Z'
  },
  {
    id: 'eg-emp-4',
    name: 'Fatima Al-Zahra',
    email: 'fatima@helaly.com',
    phone: '+201234567004',
    employeeType: 'monthly',
    position: 'Project Manager',
    monthlySalary: 20000,
    dailyRate: 0,
    currency: 'EGP',
    hireDate: '2022-11-01',
    notes: 'Project manager with 15 years of experience',
    projectId: 'eg-4',
    sectionId: 'eg-s-5',
    active: true,
    totalEarned: 260000,
    totalPaid: 260000,
    balance: 0,
    country: 'egypt',
    payments: [],
    createdAt: '2022-11-01T08:00:00Z',
    createdBy: 'admin',
    updatedAt: '2022-11-01T08:00:00Z'
  }
];

// Default Employees Data - Libya
const defaultLibyaEmployees = [
  {
    id: 'ly-emp-1',
    name: 'Abdullah Al-Libi',
    email: 'abdullah@helaly.ly',
    phone: '+218123456001',
    employeeType: 'monthly',
    position: 'Project Manager',
    monthlySalary: 5000,
    dailyRate: 0,
    currency: 'USD',
    hireDate: '2023-05-01',
    notes: 'Senior project manager',
    projectId: 'ly-1',
    sectionId: 'ly-s-1',
    active: true,
    totalEarned: 45000,
    totalPaid: 40000,
    balance: 5000,
    country: 'libya',
    payments: [],
    createdAt: '2023-05-01T08:00:00Z',
    createdBy: 'admin',
    updatedAt: '2023-05-01T08:00:00Z'
  },
  {
    id: 'ly-emp-2',
    name: 'Fatima Al-Sarraj',
    email: 'fatima@helaly.ly',
    phone: '+218123456002',
    employeeType: 'monthly',
    position: 'Civil Engineer',
    monthlySalary: 4000,
    dailyRate: 0,
    currency: 'USD',
    hireDate: '2023-07-15',
    notes: 'Civil engineer specializing in roads',
    projectId: 'ly-2',
    sectionId: 'ly-s-3',
    active: true,
    totalEarned: 28000,
    totalPaid: 28000,
    balance: 0,
    country: 'libya',
    payments: [],
    createdAt: '2023-07-15T08:00:00Z'
  },
  {
    id: 'ly-emp-3',
    name: 'Mohamed Al-Turki',
    email: 'turkii@helaly.ly',
    phone: '+218123456003',
    employeeType: 'daily',
    position: 'Labor Supervisor',
    monthlySalary: 0,
    dailyRate: 150,
    currency: 'USD',
    hireDate: '2023-08-01',
    notes: 'Experienced labor supervisor',
    projectId: 'ly-2',
    sectionId: 'ly-s-3',
    active: true,
    totalEarned: 15000,
    totalPaid: 12000,
    balance: 3000,
    country: 'libya',
    payments: [],
    createdAt: '2023-08-01T08:00:00Z'
  }
];

// Load employees from localStorage or use defaults
let egyptEmployees = loadFromStorage('helaly_egypt_employees', defaultEgyptEmployees);
let libyaEmployees = loadFromStorage('helaly_libya_employees', defaultLibyaEmployees);

// Helper function to get employees by country
const getEmployeesByCountry = (country: 'egypt' | 'libya') => {
  const freshEgyptEmployees = loadFromStorage('helaly_egypt_employees', defaultEgyptEmployees);
  const freshLibyaEmployees = loadFromStorage('helaly_libya_employees', defaultLibyaEmployees);
  return country === 'egypt' ? freshEgyptEmployees : freshLibyaEmployees;
};

export const mockGetEmployees = async (country: 'egypt' | 'libya') => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const employees = getEmployeesByCountry(country);
  console.log(`🔄 mockGetEmployees: Found ${employees.length} employees for ${country}`);
  return employees;
};

export const mockGetEmployeeById = async (country: 'egypt' | 'libya', id: string) => {
  await new Promise(resolve => setTimeout(resolve, 200));
  const employees = getEmployeesByCountry(country);
  const employee = employees.find((e: any) => e.id === id);
  if (!employee) throw new Error('Employee not found');
  return employee;
};

export const mockCreateEmployee = async (country: 'egypt' | 'libya', employeeData: any) => {
  await new Promise(resolve => setTimeout(resolve, 500));

  const newEmployee = {
    ...employeeData,
    id: uuidv4(),
    country,
    active: true,
    totalEarned: 0,
    totalPaid: 0,
    balance: 0,
    payments: [],
    createdAt: new Date().toISOString()
  };

  if (country === 'egypt') {
    egyptEmployees = [...egyptEmployees, newEmployee];
    saveToStorage('helaly_egypt_employees', egyptEmployees);
  } else {
    libyaEmployees = [...libyaEmployees, newEmployee];
    saveToStorage('helaly_libya_employees', libyaEmployees);
  }

  console.log(`✅ Employee created for ${country}: ${newEmployee.name}`);
  return newEmployee;
};

export const mockUpdateEmployee = async (country: 'egypt' | 'libya', id: string, employeeData: any) => {
  await new Promise(resolve => setTimeout(resolve, 500));

  if (country === 'egypt') {
    const index = egyptEmployees.findIndex((e: any) => e.id === id);
    if (index === -1) throw new Error('Employee not found');
    egyptEmployees[index] = { ...egyptEmployees[index], ...employeeData };
    saveToStorage('helaly_egypt_employees', egyptEmployees);
    return egyptEmployees[index];
  } else {
    const index = libyaEmployees.findIndex((e: any) => e.id === id);
    if (index === -1) throw new Error('Employee not found');
    libyaEmployees[index] = { ...libyaEmployees[index], ...employeeData };
    saveToStorage('helaly_libya_employees', libyaEmployees);
    return libyaEmployees[index];
  }
};

export const mockDeleteEmployee = async (country: 'egypt' | 'libya', id: string) => {
  await new Promise(resolve => setTimeout(resolve, 300));

  if (country === 'egypt') {
    egyptEmployees = egyptEmployees.filter((e: any) => e.id !== id);
    saveToStorage('helaly_egypt_employees', egyptEmployees);
  } else {
    libyaEmployees = libyaEmployees.filter((e: any) => e.id !== id);
    saveToStorage('helaly_libya_employees', libyaEmployees);
  }

  console.log(`✅ Employee ${id} deleted from ${country}`);
  return { success: true };
};

export const mockGetEmployeeStats = async (country: 'egypt' | 'libya') => {
  await new Promise(resolve => setTimeout(resolve, 200));
  const employees = getEmployeesByCountry(country);

  const totalEmployees = employees.length;
  const activeEmployees = employees.filter((e: any) => e.active).length;
  const monthlyEmployees = employees.filter((e: any) => e.employeeType === 'monthly').length;
  const dailyEmployees = employees.filter((e: any) => e.employeeType === 'daily').length;
  const totalMonthlySalary = employees
    .filter((e: any) => e.employeeType === 'monthly')
    .reduce((sum: number, e: any) => sum + (e.monthlySalary || 0), 0);

  return {
    totalEmployees,
    activeEmployees,
    monthlyEmployees,
    dailyEmployees,
    totalMonthlySalary
  };
};


// --- Payments ---

// Default Payments Data - Egypt
const defaultEgyptPayments = [
  {
    id: 'eg-pay-1',
    employeeId: 'eg-emp-1',
    employeeName: 'Ahmed Mohamed Ali',
    paymentType: 'salary',
    amount: 15000,
    currency: 'EGP',
    amountEGP: 15000,
    amountUSD: 0,
    paymentMethod: 'bank_transfer',
    receiptNumber: 'REC-EG-001',
    description: 'January 2024 salary',
    paymentDate: '2024-01-31',
    projectId: 'eg-1',
    projectName: 'Cairo-Alexandria Desert Highway',
    sectionId: 'eg-s-1',
    approvedBy: 'Egypt Manager',
    country: 'egypt',
    createdAt: '2024-01-31T10:00:00Z'
  },
  {
    id: 'eg-pay-2',
    employeeId: 'eg-emp-2',
    employeeName: 'Sara Ahmed Hassan',
    paymentType: 'salary',
    amount: 12000,
    currency: 'EGP',
    amountEGP: 12000,
    amountUSD: 0,
    paymentMethod: 'bank_transfer',
    receiptNumber: 'REC-EG-002',
    description: 'January 2024 salary',
    paymentDate: '2024-01-31',
    projectId: 'eg-2',
    projectName: 'New North Coast Road',
    sectionId: 'eg-s-3',
    approvedBy: 'Egypt Manager',
    country: 'egypt',
    createdAt: '2024-01-31T10:00:00Z'
  },
  {
    id: 'eg-pay-3',
    employeeId: 'eg-emp-1',
    employeeName: 'Ahmed Mohamed Ali',
    paymentType: 'advance',
    amount: 5000,
    currency: 'EGP',
    amountEGP: 5000,
    amountUSD: 0,
    paymentMethod: 'cash',
    receiptNumber: 'REC-EG-003',
    description: 'Emergency advance',
    paymentDate: '2024-01-15',
    projectId: 'eg-1',
    projectName: 'Cairo-Alexandria Desert Highway',
    sectionId: 'eg-s-1',
    approvedBy: 'Egypt Manager',
    country: 'egypt',
    createdAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 'eg-pay-4',
    employeeId: 'eg-emp-3',
    employeeName: 'Mohamed Abdel Rahman',
    paymentType: 'daily',
    amount: 3000,
    currency: 'EGP',
    amountEGP: 3000,
    amountUSD: 0,
    paymentMethod: 'cash',
    receiptNumber: 'REC-EG-004',
    description: 'Wages for 10 working days',
    paymentDate: '2024-01-20',
    workQuantity: 10,
    workUnit: 'day',
    projectId: 'eg-1',
    projectName: 'Cairo-Alexandria Desert Highway',
    sectionId: 'eg-s-2',
    approvedBy: 'Egypt Manager',
    country: 'egypt',
    createdAt: '2024-01-20T10:00:00Z'
  }
];

// Default Payments Data - Libya
const defaultLibyaPayments = [
  {
    id: 'ly-pay-1',
    employeeId: 'ly-emp-1',
    employeeName: 'Abdullah Al-Libi',
    paymentType: 'salary',
    amount: 5000,
    currency: 'USD',
    amountEGP: 0,
    amountUSD: 5000,
    paymentMethod: 'bank_transfer',
    receiptNumber: 'REC-LY-001',
    description: 'January 2024 salary',
    paymentDate: '2024-01-31',
    projectId: 'ly-1',
    projectName: 'Tripoli - Benghazi Coastal Road',
    sectionId: 'ly-s-1',
    approvedBy: 'Libya Manager',
    country: 'libya',
    createdAt: '2024-01-31T10:00:00Z'
  },
  {
    id: 'ly-pay-2',
    employeeId: 'ly-emp-2',
    employeeName: 'Fatima Al-Sarraj',
    paymentType: 'salary',
    amount: 4000,
    currency: 'USD',
    amountEGP: 0,
    amountUSD: 4000,
    paymentMethod: 'bank_transfer',
    receiptNumber: 'REC-LY-002',
    description: 'January 2024 salary',
    paymentDate: '2024-01-31',
    projectId: 'ly-2',
    projectName: 'Sabha - Kufra Desert Road',
    sectionId: 'ly-s-3',
    approvedBy: 'Libya Manager',
    country: 'libya',
    createdAt: '2024-01-31T10:00:00Z'
  },
  {
    id: 'ly-pay-3',
    employeeId: 'ly-emp-3',
    employeeName: 'Mohamed Al-Turki',
    paymentType: 'daily',
    amount: 1500,
    currency: 'USD',
    amountEGP: 0,
    amountUSD: 1500,
    paymentMethod: 'cash',
    receiptNumber: 'REC-LY-003',
    description: 'Wages for 10 working days',
    paymentDate: '2024-01-20',
    workQuantity: 10,
    workUnit: 'day',
    projectId: 'ly-2',
    projectName: 'Sabha - Kufra Desert Road',
    sectionId: 'ly-s-3',
    approvedBy: 'Libya Manager',
    country: 'libya',
    createdAt: '2024-01-20T10:00:00Z'
  }
];

// Load payments from localStorage or use defaults
let egyptPayments = loadFromStorage('helaly_egypt_payments', defaultEgyptPayments);
let libyaPayments = loadFromStorage('helaly_libya_payments', defaultLibyaPayments);

// ============= INITIALIZE DEFAULT DATA ON FIRST LOAD =============
// This runs after all defaults are defined
if (shouldInitialize()) {
  console.log('🎉 First time loading Helaly ERP! Initializing default data...');

  // Save all default datasets to localStorage
  const datasetsToInit = [
    { key: 'helaly_users', data: defaultUsers },
    { key: 'helaly_egypt_projects', data: defaultEgyptProjects },
    { key: 'helaly_libya_projects', data: defaultLibyaProjects },
    { key: 'helaly_egypt_sections', data: defaultEgyptSections },
    { key: 'helaly_libya_sections', data: defaultLibyaSections },
    { key: 'helaly_egypt_spendings', data: defaultEgyptSpendings },
    { key: 'helaly_libya_spendings', data: defaultLibyaSpendings },
    { key: 'helaly_egypt_employees', data: defaultEgyptEmployees },
    { key: 'helaly_libya_employees', data: defaultLibyaEmployees },
    { key: 'helaly_egypt_payments', data: defaultEgyptPayments },
    { key: 'helaly_libya_payments', data: defaultLibyaPayments },
  ];

  datasetsToInit.forEach(({ key, data }) => {
    const existing = localStorage.getItem(key);
    if (!existing) {
      saveToStorage(key, data);
      console.log(`  ✓ Initialized ${key} with ${Array.isArray(data) ? data.length : 'default'} items`);
    }
  });

  // Mark as initialized
  markAsInitialized();
  console.log('✅ Default data initialization complete!');
} else {
  console.log('✓ App already initialized, using existing localStorage data');
}

// Helper function to get payments by country
const getPaymentsByCountry = (country: 'egypt' | 'libya') => {
  const freshEgyptPayments = loadFromStorage('helaly_egypt_payments', defaultEgyptPayments);
  const freshLibyaPayments = loadFromStorage('helaly_libya_payments', defaultLibyaPayments);
  return country === 'egypt' ? freshEgyptPayments : freshLibyaPayments;
};

export const mockGetPayments = async (country: 'egypt' | 'libya') => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const payments = getPaymentsByCountry(country);
  console.log(`🔄 mockGetPayments: Found ${payments.length} payments for ${country}`);
  return payments;
};

export const mockCreatePayment = async (country: 'egypt' | 'libya', paymentData: any) => {
  await new Promise(resolve => setTimeout(resolve, 500));

  // Get employee name
  const employees = getEmployeesByCountry(country);
  const employee = employees.find((e: any) => e.id === paymentData.employeeId);

  const newPayment = {
    ...paymentData,
    id: uuidv4(),
    employeeName: employee?.name || 'Unknown',
    country,
    createdAt: new Date().toISOString()
  };

  if (country === 'egypt') {
    egyptPayments = [...egyptPayments, newPayment];
    saveToStorage('helaly_egypt_payments', egyptPayments);
  } else {
    libyaPayments = [...libyaPayments, newPayment];
    saveToStorage('helaly_libya_payments', libyaPayments);
  }

  console.log(`✅ Payment created for ${country}: ${newPayment.amount} ${newPayment.currency}`);
  return newPayment;
};

export const mockUpdatePayment = async (country: 'egypt' | 'libya', id: string, paymentData: any) => {
  await new Promise(resolve => setTimeout(resolve, 500));

  if (country === 'egypt') {
    const index = egyptPayments.findIndex((p: any) => p.id === id);
    if (index === -1) throw new Error('Payment not found');
    egyptPayments[index] = { ...egyptPayments[index], ...paymentData };
    saveToStorage('helaly_egypt_payments', egyptPayments);
    return egyptPayments[index];
  } else {
    const index = libyaPayments.findIndex((p: any) => p.id === id);
    if (index === -1) throw new Error('Payment not found');
    libyaPayments[index] = { ...libyaPayments[index], ...paymentData };
    saveToStorage('helaly_libya_payments', libyaPayments);
    return libyaPayments[index];
  }
};

export const mockDeletePayment = async (country: 'egypt' | 'libya', id: string) => {
  await new Promise(resolve => setTimeout(resolve, 300));

  if (country === 'egypt') {
    egyptPayments = egyptPayments.filter((p: any) => p.id !== id);
    saveToStorage('helaly_egypt_payments', egyptPayments);
  } else {
    libyaPayments = libyaPayments.filter((p: any) => p.id !== id);
    saveToStorage('helaly_libya_payments', libyaPayments);
  }

  console.log(`✅ Payment ${id} deleted from ${country}`);
  return { success: true };
};

export const mockGetPaymentStats = async (country: 'egypt' | 'libya') => {
  await new Promise(resolve => setTimeout(resolve, 200));
  const payments = getPaymentsByCountry(country);

  const totalPayments = payments.length;
  const totalAmountEGP = payments.reduce((sum: number, p: any) => sum + (p.amountEGP || (p.currency === 'EGP' ? p.amount : 0) || 0), 0);
  const totalAmountUSD = payments.reduce((sum: number, p: any) => sum + (p.amountUSD || (p.currency === 'USD' ? p.amount : 0) || 0), 0);
  const salaryPayments = payments.filter((p: any) => p.paymentType === 'salary').length;
  const advancePayments = payments.filter((p: any) => p.paymentType === 'advance').length;
  const loanPayments = payments.filter((p: any) => p.paymentType === 'loan').length;
  const dailyPayments = payments.filter((p: any) => p.paymentType === 'daily').length;

  return {
    totalPayments,
    totalAmountEGP,
    totalAmountUSD,
    salaryPayments,
    advancePayments,
    loanPayments,
    dailyPayments
  };
};

// --- Users ---

export const mockGetUsers = async () => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));

  return users.map(user => {
    const { password, ...userData } = user;
    return userData;
  });
};

export const mockCreateUser = async (userData: any) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 400));

  const newUser = {
    id: uuidv4(),
    ...userData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  users.push(newUser);

  // Save users to localStorage
  saveToStorage('helaly_users', users);

  // Return user data without password
  const { password, ...newUserData } = newUser;
  return newUserData;
};

export const mockUpdateUser = async (id: string, userData: any) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 400));

  const index = users.findIndex(u => u.id === id);

  if (index === -1) {
    throw new Error('User not found');
  }

  // Do not allow updating the first admin user (essential for login)
  if (id === '1' && users[index].role === 'admin') {
    // Allow updating some fields but not critical ones
    const safeUpdate = {
      name: userData.name,
      position: userData.position,
      updatedAt: new Date().toISOString()
    };

    users[index] = {
      ...users[index],
      ...safeUpdate
    };
  } else {
    // Update user
    users[index] = {
      ...users[index],
      ...userData,
      updatedAt: new Date().toISOString()
    };
  }

  // Return user data without password
  const { password, ...updatedUserData } = users[index];
  return updatedUserData;
};

export const mockDeleteUser = async (id: string) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));

  const index = users.findIndex(u => u.id === id);

  if (index === -1) {
    throw new Error('User not found');
  }

  // Do not allow deleting the first admin user (essential for login)
  if (id === '1') {
    throw new Error('Cannot delete system admin user');
  }

  // Delete user
  users = users.filter(u => u.id !== id);

  return { success: true };
};

// --- Inventory ---

export let sharedInventoryItems: any[] = [
  { id: '1', name: 'Portland Cement', category: 'materials', quantity: 500, unit: 'bag', unitPrice: 65, totalValue: 32500, minQuantity: 50, status: 'in_stock', projectId: 'eg-1', lastUpdated: new Date().toISOString() },
  { id: '2', name: 'Reinforcement Steel 12mm', category: 'materials', quantity: 15, unit: 'ton', unitPrice: 18500, totalValue: 277500, minQuantity: 5, status: 'in_stock', projectId: 'eg-2', lastUpdated: new Date().toISOString() },
  { id: '3', name: 'Water Hose 2 Inch', category: 'equipment', quantity: 2, unit: 'meter', unitPrice: 25, totalValue: 50, minQuantity: 10, status: 'low_stock', projectId: 'eg-1', lastUpdated: new Date().toISOString() },
  { id: '4', name: 'Electric Drill', category: 'tools', quantity: 8, unit: 'piece', unitPrice: 450, totalValue: 3600, minQuantity: 3, status: 'in_stock', projectId: 'eg-3', lastUpdated: new Date().toISOString() },
  { id: '5', name: 'Hydraulic Oil', category: 'consumables', quantity: 0, unit: 'liter', unitPrice: 35, totalValue: 0, minQuantity: 20, status: 'out_of_stock', projectId: 'eg-2', lastUpdated: new Date().toISOString() },
  { id: '6', name: 'Washed Natural Sand', category: 'materials', quantity: 45, unit: 'cubic meter', unitPrice: 120, totalValue: 5400, minQuantity: 10, status: 'in_stock', projectId: 'eg-1', lastUpdated: new Date().toISOString() },
  { id: '7', name: 'Graded Gravel 2/4', category: 'materials', quantity: 35, unit: 'cubic meter', unitPrice: 150, totalValue: 5250, minQuantity: 8, status: 'in_stock', projectId: 'eg-1', lastUpdated: new Date().toISOString() },
  { id: '8', name: 'Hot Mix Asphalt', category: 'materials', quantity: 120, unit: 'ton', unitPrice: 850, totalValue: 102000, minQuantity: 20, status: 'in_stock', projectId: 'eg-2', lastUpdated: new Date().toISOString() },
  { id: '9', name: 'Komatsu PC200 Excavator', category: 'equipment', quantity: 3, unit: 'piece', unitPrice: 1500000, totalValue: 4500000, minQuantity: 1, status: 'in_stock', projectId: 'eg-1', lastUpdated: new Date().toISOString() },
  { id: '10', name: 'Vibratory Compactor', category: 'equipment', quantity: 4, unit: 'piece', unitPrice: 85000, totalValue: 340000, minQuantity: 2, status: 'in_stock', projectId: 'eg-2', lastUpdated: new Date().toISOString() },
  { id: '11', name: 'Traffic Warning Signs', category: 'materials', quantity: 45, unit: 'piece', unitPrice: 280, totalValue: 12600, minQuantity: 20, status: 'in_stock', projectId: 'eg-2', lastUpdated: new Date().toISOString() },
  { id: '12', name: '100 kW Generator', category: 'equipment', quantity: 6, unit: 'piece', unitPrice: 120000, totalValue: 720000, minQuantity: 2, status: 'in_stock', projectId: 'eg-3', lastUpdated: new Date().toISOString() },
  { id: '13', name: 'Concrete Saw', category: 'tools', quantity: 3, unit: 'piece', unitPrice: 15000, totalValue: 45000, minQuantity: 2, status: 'in_stock', projectId: 'eg-2', lastUpdated: new Date().toISOString() },
  { id: '14', name: 'Slaked Lime', category: 'materials', quantity: 8, unit: 'ton', unitPrice: 180, totalValue: 1440, minQuantity: 5, status: 'low_stock', projectId: 'eg-2', lastUpdated: new Date().toISOString() },
  { id: '15', name: 'Pressure-Resistant Water Hoses', category: 'equipment', quantity: 12, unit: 'meter', unitPrice: 45, totalValue: 540, minQuantity: 20, status: 'low_stock', projectId: 'eg-1', lastUpdated: new Date().toISOString() },
  { id: '16', name: 'Reflective Traffic Cones', category: 'materials', quantity: 150, unit: 'piece', unitPrice: 25, totalValue: 3750, minQuantity: 50, status: 'in_stock', projectId: 'eg-2', lastUpdated: new Date().toISOString() },
  { id: '17', name: 'Safety Helmets', category: 'tools', quantity: 85, unit: 'piece', unitPrice: 35, totalValue: 2975, minQuantity: 30, status: 'in_stock', projectId: 'eg-1', lastUpdated: new Date().toISOString() },
  { id: '18', name: 'Reflective Safety Vests', category: 'tools', quantity: 95, unit: 'piece', unitPrice: 28, totalValue: 2660, minQuantity: 40, status: 'in_stock', projectId: 'eg-3', lastUpdated: new Date().toISOString() },
  { id: '19', name: 'Diesel Fuel', category: 'consumables', quantity: 2500, unit: 'liter', unitPrice: 8.5, totalValue: 21250, minQuantity: 500, status: 'in_stock', projectId: 'eg-1', lastUpdated: new Date().toISOString() },
  { id: '20', name: 'M16 Bolts and Nuts', category: 'materials', quantity: 450, unit: 'piece', unitPrice: 12, totalValue: 5400, minQuantity: 100, status: 'in_stock', projectId: 'eg-3', lastUpdated: new Date().toISOString() },
];

export const mockGetInventoryItems = async () => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return [...sharedInventoryItems];
};

// --- Dashboard ---

export const mockGetDashboardData = async (timeRange: string) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  console.log('📊 Dashboard data calculation started...');

  // Get user's country and get fresh data from localStorage
  const userCountry = getUserCountryFromToken();

  // Load fresh data from localStorage (this ensures we get the latest data)
  const freshEgyptProjects = loadFromStorage('helaly_egypt_projects', defaultEgyptProjects);
  const freshLibyaProjects = loadFromStorage('helaly_libya_projects', defaultLibyaProjects);
  const freshEgyptSpendings = loadFromStorage('helaly_egypt_spendings', defaultEgyptSpendings);
  const freshLibyaSpendings = loadFromStorage('helaly_libya_spendings', defaultLibyaSpendings);
  const freshEgyptSections = loadFromStorage('helaly_egypt_sections', defaultEgyptSections);
  const freshLibyaSections = loadFromStorage('helaly_libya_sections', defaultLibyaSections);

  // Get country-specific data
  const countryProjects = userCountry === 'egypt' ? freshEgyptProjects : freshLibyaProjects;
  const countrySpendings = userCountry === 'egypt' ? freshEgyptSpendings : freshLibyaSpendings;
  const countrySections = userCountry === 'egypt' ? freshEgyptSections : freshLibyaSections;

  console.log(`🗂️ Found ${countryProjects.length} projects for ${userCountry}`);
  console.log(`📋 Found ${countrySections.length} sections for ${userCountry}`);
  console.log(`💰 Found ${countrySpendings.length} spendings for ${userCountry}`);

  // Calculate project statistics
  const totalProjects = countryProjects.length;
  const activeProjects = countryProjects.filter(p => p.status === 'in_progress' || p.status === 'active').length;
  const completedProjects = countryProjects.filter(p => p.status === 'completed').length;
  const notStartedProjects = countryProjects.filter(p => p.status === 'not_started' || p.status === 'pending').length;

  // Calculate financial statistics (include both projects and sections budgets)
  const projectsBudget = countryProjects.reduce((sum, project) => sum + (project.budget || 0), 0);
  const sectionsBudget = countrySections.reduce((sum, section) => sum + (section.budget || 0), 0);
  const totalBudget = projectsBudget + sectionsBudget;
  const totalSpending = countrySpendings.reduce((sum, spending) => sum + (spending.amount || 0), 0);
  const totalRemaining = totalBudget - totalSpending;

  // Calculate monthly trend (last 6 months)
  const monthlyTrend = [0, 0, 0, 0, 0, 0];
  const now = new Date();
  for (let i = 0; i < 6; i++) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

    const monthSpending = countrySpendings
      .filter(s => {
        const spendingDate = new Date(s.date);
        return spendingDate >= monthStart && spendingDate <= monthEnd;
      })
      .reduce((sum, s) => sum + (s.amount || 0), 0);

    monthlyTrend[5 - i] = monthSpending;
  }

  // Get recent projects (latest 5)
  const recentProjects = countryProjects
    .sort((a, b) => new Date(b.createdAt || b.startDate).getTime() - new Date(a.createdAt || a.startDate).getTime())
    .slice(0, 5)
    .map(project => ({
      id: project.id,
      name: project.name,
      budget: project.budget,
      status: project.status,
      startDate: project.startDate,
      manager: project.manager
    }));

  const dashboardData = {
    projectStats: {
      total: totalProjects,
      active: activeProjects,
      completed: completedProjects,
      notStarted: notStartedProjects,
      percentChange: totalProjects > 0 ? Math.round(((activeProjects / totalProjects) * 100)) : 0
    },
    financialStats: {
      totalBudget: totalBudget,
      totalSpending: totalSpending,
      totalRemaining: totalRemaining,
      monthlyTrend: monthlyTrend,
      percentChange: totalBudget > 0 ? Math.round(((totalSpending / totalBudget) * 100)) : 0
    },
    recentProjects: recentProjects,
    recentActivity: countrySpendings
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)
      .map(spending => ({
        id: spending.id,
        type: 'spending',
        description: spending.description,
        amount: spending.amount,
        date: spending.date,
        projectId: spending.projectId
      }))
  };

  console.log('📊 Dashboard data calculated:', dashboardData);
  return dashboardData;
};

// --- Reports ---

export const mockGetReportData = async (reportType: string, dateRange: string) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 400));

  // Calculate date ranges
  const now = new Date();
  let startDate: Date;
  let endDate = new Date(now);

  switch (dateRange) {
    case 'month':
      // Last month (previous month, not last 30 days)
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      endDate = new Date(now.getFullYear(), now.getMonth(), 0); // Last day of previous month
      break;
    case 'quarter':
      // Last quarter (previous quarter)
      const currentQuarter = Math.floor(now.getMonth() / 3);
      const lastQuarterStart = currentQuarter === 0 ? 9 : (currentQuarter - 1) * 3; // Handle year transition
      const lastQuarterYear = currentQuarter === 0 ? now.getFullYear() - 1 : now.getFullYear();
      startDate = new Date(lastQuarterYear, lastQuarterStart, 1);
      endDate = new Date(lastQuarterYear, lastQuarterStart + 3, 0); // Last day of quarter
      break;
    case 'year':
      // Last year (previous calendar year)
      startDate = new Date(now.getFullYear() - 1, 0, 1);
      endDate = new Date(now.getFullYear() - 1, 11, 31);
      break;
    default:
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      endDate = new Date(now.getFullYear(), now.getMonth(), 0);
  }

  // Filter data based on the date range
  const filteredProjects = projects.filter(project => {
    const projectDate = new Date(project.createdAt || project.startDate || now);
    return projectDate >= startDate && projectDate <= endDate;
  });

  const filteredSpendings = spendings.filter(spending => {
    const spendingDate = new Date(spending.date || spending.createdAt || now);
    return spendingDate >= startDate && spendingDate <= endDate;
  });

  // Generate comprehensive ERP report data
  switch (reportType) {
    case 'overview':
      return {
        totalRevenue: 2500000,
        totalExpenses: 1800000,
        netProfit: 700000,
        activeProjects: 12,
        completedProjects: 28,
        totalEmployees: 145,
        activeSections: 8,
        monthlyGrowth: 12.5,
        profitMargin: 28,
        customerSatisfaction: 94
      };

    case 'financial':
      return {
        revenue: [120000, 135000, 150000, 140000, 165000, 180000, 195000, 175000, 210000, 225000, 240000, 260000],
        expenses: [80000, 95000, 110000, 105000, 120000, 130000, 140000, 125000, 150000, 160000, 170000, 185000],
        categories: {
          materials: 850000,
          labor: 650000,
          equipment: 200000,
          overhead: 100000
        },
        cashFlow: 15000,
        accountsReceivable: 320000,
        accountsPayable: 180000,
        profitMargin: 28
      };

    case 'projects':
      return {
        statusDistribution: [15, 8, 5], // completed, in_progress, not_started
        budgetUtilization: 78,
        averageCompletion: 67,
        onTimeDelivery: 85,
        projectsByCategory: {
          construction: 12,
          renovation: 8,
          maintenance: 8
        }
      };

    case 'sections':
      return {
        performance: [92, 88, 95, 78, 85, 90, 87, 93],
        workload: [85, 92, 78, 88, 90, 82, 95, 87],
        efficiency: 88,
        activeSections: 8
      };

    case 'employees':
      return {
        totalCount: 145,
        departments: {
          engineering: 35,
          construction: 45,
          administration: 20,
          finance: 15,
          hr: 12,
          procurement: 18
        },
        attendance: 96,
        productivity: 89,
        satisfaction: 87
      };

    case 'performance':
      return {
        kpis: {
          efficiency: 88,
          quality: 92,
          customerSatisfaction: 94,
          employeeSatisfaction: 87
        },
        trends: {
          efficiency: [85, 86, 87, 88, 89, 88, 87, 88, 89, 90, 88, 89],
          quality: [90, 91, 92, 91, 93, 92, 91, 92, 93, 94, 92, 93]
        }
      };

    // Legacy report types for backward compatibility
    case 'project-status':
      const completedProjects = filteredProjects.filter(p => p.status === 'completed').length;
      const inProgressProjects = filteredProjects.filter(p => p.status === 'in_progress').length;
      const notStartedProjects = filteredProjects.filter(p => p.status === 'not_started').length;
      const totalProjects = filteredProjects.length;

      return {
        labels: ['Completed', 'In Progress', 'Not Started'],
        data: [completedProjects, inProgressProjects, notStartedProjects],
        total: totalProjects,
        details: {
          completed: completedProjects,
          inProgress: inProgressProjects,
          notStarted: notStartedProjects,
          completionRate: totalProjects ? ((completedProjects / totalProjects) * 100).toFixed(1) : 0
        }
      };

    case 'spending-category':
      const categoryTotals = {
        materials: 0,
        labor: 0,
        equipment: 0,
        permits: 0,
        consulting: 0,
        other: 0
      };

      filteredSpendings.forEach(spending => {
        const category = spending.category?.toLowerCase() || 'other';
        if (category in categoryTotals) {
          categoryTotals[category as keyof typeof categoryTotals] += spending.amount || 0;
        } else {
          categoryTotals.other += spending.amount || 0;
        }
      });

      const totalSpending = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0);

      return {
        labels: ['Materials', 'Labor', 'Equipment', 'Permits', 'Consulting', 'Other'],
        data: Object.values(categoryTotals),
        total: totalSpending,
        details: categoryTotals
      };

    case 'spending-timeline':
      // Create monthly data for the date range
      const monthlyData = [];
      const monthLabels = [];

      if (dateRange === 'year') {
        // For yearly data, show all 12 months of that year
        for (let i = 0; i < 12; i++) {
          const monthStart = new Date(startDate.getFullYear(), i, 1);
          const monthEnd = new Date(startDate.getFullYear(), i + 1, 0);
          const monthlySpending = filteredSpendings
            .filter(s => {
              const spendingDate = new Date(s.date || s.createdAt || now);
              return spendingDate >= monthStart && spendingDate <= monthEnd;
            })
            .reduce((sum, s) => sum + (s.amount || 0), 0);

          monthlyData.push(monthlySpending);
          monthLabels.push(new Date(startDate.getFullYear(), i, 1).toLocaleString('default', { month: 'short' }));
        }
      } else if (dateRange === 'quarter') {
        // For quarterly data, show 3 months
        for (let i = 0; i < 3; i++) {
          const monthStart = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1);
          const monthEnd = new Date(startDate.getFullYear(), startDate.getMonth() + i + 1, 0);
          const monthlySpending = filteredSpendings
            .filter(s => {
              const spendingDate = new Date(s.date || s.createdAt || now);
              return spendingDate >= monthStart && spendingDate <= monthEnd;
            })
            .reduce((sum, s) => sum + (s.amount || 0), 0);

          monthlyData.push(monthlySpending);
          monthLabels.push(monthStart.toLocaleString('default', { month: 'short' }));
        }
      } else {
        // For monthly data, show daily data for that month
        const daysInMonth = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0).getDate();
        for (let i = 1; i <= Math.min(daysInMonth, 10); i++) { // Show max 10 days for readability
          const dayStart = new Date(startDate.getFullYear(), startDate.getMonth(), i);
          const dayEnd = new Date(startDate.getFullYear(), startDate.getMonth(), i + 1);
          const dailySpending = filteredSpendings
            .filter(s => {
              const spendingDate = new Date(s.date || s.createdAt || now);
              return spendingDate >= dayStart && spendingDate < dayEnd;
            })
            .reduce((sum, s) => sum + (s.amount || 0), 0);

          monthlyData.push(dailySpending);
          monthLabels.push(`Day ${i}`);
        }
      }

      const totalTimelineSpending = monthlyData.reduce((sum, amount) => sum + amount, 0);
      const averageSpending = monthlyData.length ? totalTimelineSpending / monthlyData.length : 0;
      const maxSpending = Math.max(...monthlyData);
      const minSpending = Math.min(...monthlyData);

      return {
        labels: monthLabels,
        data: monthlyData,
        total: totalTimelineSpending,
        details: {
          average: averageSpending,
          highest: { month: monthLabels[monthlyData.indexOf(maxSpending)] || 'None', amount: maxSpending },
          lowest: { month: monthLabels[monthlyData.indexOf(minSpending)] || 'None', amount: minSpending }
        }
      };

    case 'progress-timeline':
      // Create progress datasets for filtered projects
      const progressDatasets = filteredProjects.map((project, index) => {
        const colors = ['#3B82F6', '#10B981', '#F97316', '#8B5CF6', '#06B6D4', '#EAB308'];
        const color = colors[index % colors.length];

        // Generate mock progress data over time
        const progressData = [];
        const currentProgress = project.progress || 0;

        // Generate 12 data points showing progress over time
        for (let i = 0; i < 12; i++) {
          const progressPoint = Math.min(currentProgress, (currentProgress / 12) * (i + 1));
          progressData.push(Math.round(progressPoint));
        }

        return {
          label: project.name,
          data: progressData,
          borderColor: color,
          backgroundColor: `${color}50`, // Add transparency
          tension: 0.4,
        };
      });

      const avgProgress = filteredProjects.length ?
        filteredProjects.reduce((sum, p) => sum + (p.progress || 0), 0) / filteredProjects.length : 0;
      const completedCount = filteredProjects.filter(p => (p.progress || 0) >= 100).length;
      const inProgressCount = filteredProjects.filter(p => (p.progress || 0) > 0 && (p.progress || 0) < 100).length;

      return {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: progressDatasets,
        details: {
          averageProgress: Math.round(avgProgress),
          completedProjects: completedCount,
          inProgressProjects: inProgressCount
        }
      };

    default:
      throw new Error('Invalid report type');
  }
}; 