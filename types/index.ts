/**
 * 
 * All shared interfaces and types are defined here to ensure consistency
 * across the application and avoid duplication.
 */

// ============================================================================
// CORE ENTITY TYPES
// ============================================================================

// Vehicle entity with all properties
export interface Vehicle {
  id: string
  name: string
  type: string
  category: VehicleCategory
  description: string
  imageUrl: string | null
  available: boolean
  pricePerDay: number
  location: string
  features: string[]
  fuelType: FuelType
  transmission: TransmissionType
  seats: number
  createdAt?: string
  updatedAt?: string
}

// Location entity for pickup/return points
export interface Location {
  id: string
  name: string
  address: string
  city: string
  country: string
  coordinates: string
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
}

// User entity with authentication and profile data
export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  phone?: string
  address?: string
  city?: string
  country?: string
  birthDate?: string
  driversLicenseNumber?: string
  createdAt?: string
  updatedAt?: string
}

// Reservation entity with all booking details
export interface Reservation {
  id: string
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  pickupLocation: string
  returnLocation: string
  status: ReservationStatus
  tariff: TariffType
  totalPrice: number
  createdAt?: string
  updatedAt?: string
  userId: string
  vehicleId: string
  // Related entities
  vehicle: Vehicle
  user: Pick<User, 'id' | 'name' | 'email'>
  payment?: Payment
}

// Payment entity for financial transactions
export interface Payment {
  id: string
  amount: number
  currency: string
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
  transactionId?: string
  createdAt?: string
  updatedAt?: string
  userId: string
  reservationId: string
}

// ============================================================================
// ENUM TYPES
// ============================================================================
  // Vehicle categories for classification
  export type VehicleCategory =
    | 'ECONOMY'
    | 'COMPACT'
    | 'INTERMEDIATE'
  | 'STANDARD'
  | 'FULLSIZE'
  | 'PREMIUM'
  | 'LUXURY'
  | 'SUV'
  | 'VAN'
  | 'TRUCK'
  | 'CONVERTIBLE'
  | 'SPORTS'

// Fuel types for vehicles
export type FuelType = 
  | 'Gasoline'
  | 'Diesel'
  | 'Electric'
  | 'Hybrid'

// Transmission types
export type TransmissionType = 
  | 'Manual'
  | 'Automatic'

// User roles
export type UserRole = 
  | 'MEMBER'
  | 'EMPLOYEE'
  | 'ADMIN'

// Reservation status
export type ReservationStatus = 
  | 'PENDING'
  | 'CONFIRMED'
  | 'CANCELLED'
  | 'COMPLETED'

// Tariff types
export type TariffType = 
  | 'BASIC'
  | 'DISCOUNTED'
  | 'EXCLUSIVE'

// Payment methods supported
export type PaymentMethod = 
  | 'CREDIT_CARD'
  | 'PAYPAL'
  | 'BANK_TRANSFER'

// Payment status for transactions
export type PaymentStatus = 
  | 'PENDING'
  | 'COMPLETED'
  | 'FAILED'
  | 'REFUNDED'
  | 'CANCELLED'

// ============================================================================
// UTILITY TYPES
// ============================================================================

// API Response wrapper
export interface ApiResponse<T = any> {
  data?: T
  error?: string
  message?: string
}

// Form state for UI components
export interface FormState {
  isSubmitting: boolean
  errors: Record<string, string>
}

// Filter options for vehicle search
export interface VehicleFilters {
  category?: VehicleCategory | 'ALL'
  location?: string | 'ALL'
  startDate?: Date | null
  endDate?: Date | null
  startTime?: string
  endTime?: string
  minPrice?: number
  maxPrice?: number
}

// Availability check response
export interface AvailabilityData {
  [vehicleId: string]: boolean
}

// ============================================================================
// FORM DATA TYPES
// ============================================================================

// Vehicle form data for create/update
export interface VehicleFormData {
  name: string
  type: string
  category: VehicleCategory
  description: string
  imageUrl: string | null
  available: boolean
  pricePerDay: number
  location: string
  features: string[]
  fuelType: FuelType
  transmission: TransmissionType
  seats: number
}

// Reservation form data for create/update
export interface ReservationFormData {
  vehicleId: string
  startDate: Date
  endDate: Date
  startTime: string
  endTime: string
  pickupLocation: string
  returnLocation: string
  tariff: TariffType
  totalPrice: number
  paymentMethod: PaymentMethod
}

// User registration form data
export interface UserRegistrationData {
  name: string
  email: string
  password: string
  phone?: string
  address?: string
  city?: string
  country?: string
  birthDate?: string
  driversLicenseNumber?: string
}
