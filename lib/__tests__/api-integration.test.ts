/**
 * API Integration Tests
 * 
 * Tests run against actual Next.js API routes:
 * - HTTP requests using fetch()
 * - Full request/response cycles
 * - Authentication and authorization flows
 * - Complete API integration testing
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/carcodillo_test'
    }
  }
})

const BASE_URL = 'http://localhost:3001'

describe('API Integration Tests', () => {
  let testUserId: string
  let testVehicleId: string

  beforeAll(async () => {
    await prisma.$connect()
    
    // Clean up test data
    await prisma.payment.deleteMany()
    await prisma.reservation.deleteMany() 
    await prisma.vehicle.deleteMany()
    await prisma.user.deleteMany()
    await prisma.location.deleteMany()

    // Create test user for authenticated requests
    const testUser = await prisma.user.create({
      data: {
        name: 'Test User',
        email: 'user@carcodillo.com',
        password: 'testpw',
        role: 'MEMBER',
        birthDate: new Date('1990-01-01'),
        driversLicenseNumber: '1234567890'
      }
    })
    testUserId = testUser.id

    // Create test vehicle
    const testVehicle = await prisma.vehicle.create({
      data: {
        name: 'BMW 320i',
        type: 'Sedan',
        category: 'PREMIUM',
        description: 'Vehicle for API endpoint testing',
        pricePerDay: 95.00,
        location: 'Hamburg',
        features: ['GPS', 'AC', 'Bluetooth'],
        fuelType: 'Gasoline',
        transmission: 'Automatic',
        seats: 5,
        available: true
      }
    })
    testVehicleId = testVehicle.id
  })

  afterAll(async () => {
    // Clean up after all tests
    await prisma.payment.deleteMany()
    await prisma.reservation.deleteMany() 
    await prisma.vehicle.deleteMany()
    await prisma.user.deleteMany()
    await prisma.location.deleteMany()
    await prisma.$disconnect()
  })

  describe('Vehicle API Endpoints', () => {
    it('GET /api/vehicles should return all vehicles', async () => {
      const response = await fetch(`${BASE_URL}/api/vehicles`)
      
      expect(response.status).toBe(200)
      
      const data = await response.json()
      expect(Array.isArray(data)).toBe(true)
      expect(data.length).toBeGreaterThan(0)
      
      const vehicle = data.find((v: any) => v.id === testVehicleId)
      expect(vehicle).toBeDefined()
      expect(vehicle.name).toBe('BMW 320i')
      expect(vehicle.pricePerDay).toBe(95.00)
      expect(vehicle.available).toBe(true)
    })

    it('GET /api/vehicles/[id] should return specific vehicle', async () => {
      const response = await fetch(`${BASE_URL}/api/vehicles/${testVehicleId}`)
      
      expect(response.status).toBe(200)
      
      const vehicle = await response.json()
      expect(vehicle.id).toBe(testVehicleId)
      expect(vehicle.name).toBe('BMW 320i')
      expect(vehicle.features).toContain('GPS')
    })

    it('GET /api/vehicles/[id] should return 404 for non-existent vehicle', async () => {
      const fakeId = '000000'
      const response = await fetch(`${BASE_URL}/api/vehicles/${fakeId}`)
      
      expect(response.status).toBe(404)
      
      const error = await response.json()
      expect(error.error).toBe('Vehicle not found')
    })
  })

  describe('User Registration API', () => {
    it('POST /api/register should create new user with valid data', async () => {
      const newUser = {
        name: 'User',
        email: 'newuser@carcodillo.com',
        password: 'qwertzuiop',
        birthDate: '2003-01-01',
        driversLicenseNumber: 'qwertzuiop'
      }

      const response = await fetch(`${BASE_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      })
      
      expect(response.status).toBe(201)
      
      const result = await response.json()
      // API returns user object directly
      expect(result.email).toBe(newUser.email)
      expect(result.name).toBe(newUser.name)
      expect(result.password).toBeUndefined() // Password should not be returned
    })
  })

  describe('Reservation API Endpoints', () => {
    it('GET /api/reservations should require authentication', async () => {
      const response = await fetch(`${BASE_URL}/api/reservations`)
      
      expect(response.status).toBe(401)
      
      const error = await response.json()
      expect(error.error).toBe('Unauthorized')
    })

    it('GET /api/reservations/availability should check vehicle availability', async () => {
      const params = new URLSearchParams({
        vehicleId: testVehicleId,
        startDate: '2025-12-01',
        endDate: '2025-12-03'
      })

      const response = await fetch(`${BASE_URL}/api/reservations/availability?${params}`)
      
      expect(response.status).toBe(200)
      
      const bookedVehicleIds = await response.json()
      // API returns array of booked vehicle IDs
      expect(Array.isArray(bookedVehicleIds)).toBe(true)
    })
  })

  describe('Error Handling and Validation', () => {
    it('should handle malformed JSON gracefully', async () => {
      const response = await fetch(`${BASE_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid json{{'
      })
      
      expect(response.status).toBe(500)
    })
  })
})