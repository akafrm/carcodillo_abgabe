// ============================================================================
// VEHICLE CONSTANTS
// ============================================================================


// Available vehicle features
export const VEHICLE_FEATURES = [
  'A/C',
  'Radio', 
  'USB',
  'Navigation',
  'Bluetooth',
  'Cruise Control',
  'Parking Sensors',
  'Backup Camera', 
  'Seat Heating',
  'Full Leather',
  'Apple CarPlay',
  'Android Auto'
] as const


 // Vehicle category display names
export const VEHICLE_CATEGORY_LABELS = {
  ECONOMY: 'Economy',
  COMPACT: 'Compact',
  INTERMEDIATE: 'Intermediate',
  STANDARD: 'Standard',
  FULLSIZE: 'Full Size',
  PREMIUM: 'Premium',
  LUXURY: 'Luxury',
  SUV: 'SUV',
  VAN: 'Van',
  TRUCK: 'Truck',
  CONVERTIBLE: 'Convertible',
  SPORTS: 'Sports'
} as const

// Fuel type display names
export const FUEL_TYPE_LABELS = {
  Gasoline: 'Gasoline',
  Diesel: 'Diesel',
  Electric: 'Electric',
  Hybrid: 'Hybrid'
} as const

// Transmission type display names
export const TRANSMISSION_LABELS = {
  Manual: 'Manual',
  Automatic: 'Automatic'
} as const

// ============================================================================
// RESERVATION CONSTANTS
// ============================================================================

// Available time slots for pickups/returns
export const TIME_SLOTS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
  '20:00'
] as const

// Reservation status colors for UI
export const RESERVATION_STATUS_COLORS = {
  PENDING: 'bg-yellow-500',
  CONFIRMED: 'bg-green-500',
  CANCELLED: 'bg-red-500',
  COMPLETED: 'bg-blue-500'
} as const

// Reservation status display labels
export const RESERVATION_STATUS_LABELS = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed', 
  CANCELLED: 'Cancelled',
  COMPLETED: 'Completed'
} as const

// ============================================================================
// PRICING & PAYMENT CONSTANTS
// ============================================================================

// Available tariff configurations
export const TARIFFS = [
  { 
    id: 'BASIC' as const, 
    name: 'Basic', 
    description: 'Standard', 
    discount: 0 
  },
  { 
    id: 'DISCOUNTED' as const, 
    name: 'Discounted', 
    description: 'For Students', 
    discount: 0.15 
  },
  { 
    id: 'EXCLUSIVE' as const, 
    name: 'Exclusive', 
    description: 'Premium-Service', 
    discount: -0.25 
  }
] as const

// Available payment methods
export const PAYMENT_METHODS = [
  { 
    id: 'CREDIT_CARD' as const, 
    name: 'Credit-Card', 
    icon: '💳' 
  },
  { 
    id: 'PAYPAL' as const, 
    name: 'PayPal', 
    icon: '🅿️' 
  },
  { 
    id: 'BANK_TRANSFER' as const, 
    name: 'Bank-transfer', 
    icon: '🏦' 
  }
] as const

// Payment status colors for UI
export const PAYMENT_STATUS_COLORS = {
  PENDING: 'bg-yellow-500',
  COMPLETED: 'bg-green-500',
  FAILED: 'bg-red-500',
  REFUNDED: 'bg-blue-500',
  CANCELLED: 'bg-gray-500'
} as const

// ============================================================================
// LOCATION & INTERNATIONALIZATION
// ============================================================================

// Supported countries with flags
export const COUNTRIES = [
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'AT', name: 'Austria', flag: '🇦🇹' },
  { code: 'CH', name: 'Switzerland', flag: '🇨🇭' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱' },
  { code: 'BE', name: 'Belgium', flag: '🇧🇪' },
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' }
] as const

// ============================================================================
// USER & ROLE CONSTANTS
// ============================================================================

// User role display labels
export const USER_ROLE_LABELS = {
  MEMBER: 'Member',
  EMPLOYEE: 'Employee',
  ADMIN: 'Admin'
} as const

// User role colors for UI
export const USER_ROLE_COLORS = {
  MEMBER: 'bg-blue-500',
  EMPLOYEE: 'bg-green-500', 
  ADMIN: 'bg-red-500'
} as const

// ============================================================================
// UI CONSTANTS
// ============================================================================

// Common UI messages and labels
export const UI_CONSTANTS = {
  LOADING_MESSAGES: {
    VEHICLES: 'Loading vehicles...',
    RESERVATIONS: 'Loading reservations...',
    USERS: 'Loading users...',
    GENERAL: 'Loading...'
  },
  
  ERROR_MESSAGES: {
    NETWORK: 'Network error. Please try again.',
    UNAUTHORIZED: 'You are not authorized to perform this action.',
    NOT_FOUND: 'The requested resource was not found.',
    VALIDATION: 'Please check your input and try again.',
    GENERAL: 'An error occurred. Please try again.'
  },
  
  SUCCESS_MESSAGES: {
    SAVED: 'Changes saved successfully.',
    CREATED: 'Created successfully.',
    UPDATED: 'Updated successfully.',
    DELETED: 'Deleted successfully.'
  },
  
  FORM_LABELS: {
    SAVE: 'Save',
    CANCEL: 'Cancel',
    DELETE: 'Delete',
    EDIT: 'Edit',
    CREATE: 'Create',
    UPDATE: 'Update'
  }
} as const

// ============================================================================
// API CONSTANTS
// ============================================================================

// Common HTTP status codes and messages
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
} as const

// API endpoints base paths
export const API_ENDPOINTS = {
  VEHICLES: '/api/vehicles',
  RESERVATIONS: '/api/reservations',
  USERS: '/api/users',
  AUTH: '/api/auth',
  LOCATIONS: '/api/locations',
  PROFILE: '/api/profile'
} as const
