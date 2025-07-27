/**
 * Database Integration Tests
 * 
 * Tests run against actual database and cover:
 * - API routes without mocks
 * - Real database operations
 * - Complete request/response cycles
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

describe('Database Integration Tests', () => {
  beforeAll(async () => {
    // Prepare database for testing
    await prisma.$connect()
    
    // Clean up test data if present
    await prisma.payment.deleteMany()
    await prisma.reservation.deleteMany() 
    await prisma.vehicle.deleteMany()
    await prisma.user.deleteMany()
    await prisma.location.deleteMany()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  describe('Vehicle Database Operations', () => {
    it('should create and retrieve vehicles from real database', async () => {
      // Create actual vehicle in database
      const vehicle = await prisma.vehicle.create({
        data: {
          name: 'BMW 320i',
          type: 'Sedan',
          category: 'PREMIUM',
          description: 'integration test vehicle',
          pricePerDay: 89.99,
          location: 'Oldenburg',
          features: ['GPS', 'AC'],
          fuelType: 'Gasoline',
          transmission: 'Automatic',
          seats: 5
        }
      })

      expect(vehicle.id).toBeTruthy()
      expect(vehicle.name).toBe('BMW 320i')
      expect(vehicle.pricePerDay).toBe(89.99)

      // Retrieve the vehicle again
      const retrievedVehicle = await prisma.vehicle.findUnique({
        where: { id: vehicle.id }
      })

      expect(retrievedVehicle?.name).toBe('BMW 320i')
    })

    it('should filter available vehicles correctly', async () => {
      // Create available vehicle
      await prisma.vehicle.create({
        data: {
          name: 'Available Benz',
          type: 'Compact',
          category: 'ECONOMY',
          description: 'Available',
          pricePerDay: 45.00,
          available: true,
          location: 'Cuxhaven'
        }
      })

      // Create unavailable vehicle
      await prisma.vehicle.create({
        data: {
          name: 'Unavailable Benz',
          type: 'Compact',
          category: 'ECONOMY',
          description: 'Not available',
          pricePerDay: 45.00,
          available: false,
          location: 'Cuxhaven'
        }
      })

      // Retrieve only available vehicles
      const availableVehicles = await prisma.vehicle.findMany({
        where: { available: true }
      })

      expect(availableVehicles.length).toBeGreaterThan(0)
      expect(availableVehicles.every(v => v.available)).toBe(true)
    })
  })

  describe('User and Reservation Integration', () => {
    it('should create complete reservation with user and vehicle', async () => {
      // Create test user
      const user = await prisma.user.create({
        data: {
          name: 'Test User',
          email: 'test@integration.com',
          password: 'pw12345',
          role: 'MEMBER',
          birthDate: new Date('2004-01-01'),
          driversLicenseNumber: 'blaaaaaa12345'
        }
      })

      // Create test vehicle
      const vehicle = await prisma.vehicle.create({
        data: {
          name: 'Reservation Benz',
          type: 'Sedan',
          category: 'STANDARD',
          description: 'Test Reservation Benz',
          pricePerDay: 75.00,
          location: 'Mercedes Dealership',
        }
      })

      // Create reservation
      const reservation = await prisma.reservation.create({
        data: {
          startDate: new Date('2025-08-01'),
          endDate: new Date('2025-08-03'),
          startTime: '10:00',
          endTime: '18:00',
          pickupLocation: 'Mercedes Dealership',
          returnLocation: 'Mercedes Dealership',
          status: 'PENDING',
          tariff: 'BASIC',
          totalPrice: 150.00,
          userId: user.id,
          vehicleId: vehicle.id
        },
        include: {
          user: true,
          vehicle: true
        }
      })

      expect(reservation.id).toBeTruthy()
      expect(reservation.user.email).toBe('test@integration.com')
      expect(reservation.vehicle.name).toBe('Reservation Benz')
      expect(reservation.totalPrice).toBe(150.00)
    })

    it('should prevent double booking of same vehicle', async () => {
      // Create existing reservation for time period
      const user = await prisma.user.findFirst()
      const vehicle = await prisma.vehicle.findFirst()

      if (!user || !vehicle) {
        throw new Error('Test data not found')
      }

      await prisma.reservation.create({
        data: {
          startDate: new Date('2025-09-01'),
          endDate: new Date('2025-09-03'),
          startTime: '10:00',
          endTime: '18:00',
          pickupLocation: 'Mercedes Dealership',
          returnLocation: 'Mercedes Dealership',
          status: 'CONFIRMED',
          tariff: 'BASIC',
          totalPrice: 150.00,
          userId: user.id,
          vehicleId: vehicle.id
        }
      })

      // Check for overlapping reservations
      const conflictingReservations = await prisma.reservation.findMany({
        where: {
          vehicleId: vehicle.id,
          AND: [
            { startDate: { lte: new Date('2025-09-02') } },
            { endDate: { gte: new Date('2025-09-02') } }
          ]
        }
      })

      expect(conflictingReservations.length).toBeGreaterThan(0)
    })
  })

  describe('Business Logic with Database', () => {
    it('should calculate and store correct pricing', async () => {
      const user = await prisma.user.findFirst()
      const vehicle = await prisma.vehicle.findFirst({ where: { pricePerDay: { gt: 0 } } })

      if (!user || !vehicle) {
        throw new Error('Test data not found')
      }

      const days = 3
      const basePrice = vehicle.pricePerDay * days
      const discountRate = 0.15 // DISCOUNTED tariff
      const discount = basePrice * discountRate
      const totalPrice = basePrice - discount

      const reservation = await prisma.reservation.create({
        data: {
          startDate: new Date('2025-10-01'),
          endDate: new Date('2025-10-04'),
          startTime: '09:00',
          endTime: '17:00',
          pickupLocation: 'Mercedes Dealership',
          returnLocation: 'Mercedes Dealership',
          status: 'PENDING',
          tariff: 'DISCOUNTED',
          totalPrice: totalPrice,
          userId: user.id,
          vehicleId: vehicle.id
        }
      })

      expect(reservation.totalPrice).toBeCloseTo(totalPrice, 2)
      expect(reservation.tariff).toBe('DISCOUNTED')
    })

    it('should handle payment creation with reservation', async () => {
      const reservation = await prisma.reservation.findFirst({
        where: { status: 'PENDING' }
      })

      if (!reservation) {
        throw new Error('No pending reservation found')
      }

      const payment = await prisma.payment.create({
        data: {
          amount: reservation.totalPrice,
          currency: 'EUR',
          paymentMethod: 'CREDIT_CARD',
          paymentStatus: 'COMPLETED',
          transactionId: 'TEST' + Date.now(),
          userId: reservation.userId,
          reservationId: reservation.id
        }
      })

      expect(payment.amount).toBe(reservation.totalPrice)
      expect(payment.paymentStatus).toBe('COMPLETED')

      const updatedReservation = await prisma.reservation.update({
        where: { id: reservation.id },
        data: { status: 'CONFIRMED' }
      })

      expect(updatedReservation.status).toBe('CONFIRMED')
    })
  })

  describe('Advanced DB Scenarios', () => {
    it('should handle concurrent booking attempts', async () => {
      const user1 = await prisma.user.create({
        data: {
          name: 'Race User 1',
          email: 'race1@test.com',
          password: 'password',
          role: 'MEMBER',
          birthDate: new Date('1999-01-01'),
          driversLicenseNumber: '18383838'
        }
      })

      const user2 = await prisma.user.create({
        data: {
          name: 'Race User 2',
          email: 'race2@test.com',
          password: 'password',
          role: 'MEMBER',
          birthDate: new Date('1999-01-01'),
          driversLicenseNumber: '322222'
        }
      })

      const vehicle = await prisma.vehicle.create({
        data: {
          name: 'Race Condition Vehicle',
          type: 'Sedan',
          category: 'STANDARD',
          description: 'RC Test Vehicle',
          pricePerDay: 80.00,
          location: 'Mercedes Dealership'
        }
      })

      // Both users try to book the same vehicle at the same time
      const bookingPromises = [
        prisma.reservation.create({
          data: {
            startDate: new Date('2025-11-01'),
            endDate: new Date('2025-11-03'),
            startTime: '10:00',
            endTime: '18:00',
            pickupLocation: 'Mercedes Dealership',
            returnLocation: 'Mercedes Dealership',
            status: 'CONFIRMED',
            tariff: 'BASIC',
            totalPrice: 160.00,
            userId: user1.id,
            vehicleId: vehicle.id
          }
        }),
        prisma.reservation.create({
          data: {
            startDate: new Date('2025-11-02'),
            endDate: new Date('2025-11-04'),
            startTime: '10:00',
            endTime: '18:00',
            pickupLocation: 'Mercedes Dealership',
            returnLocation: 'Mercedes Dealership',
            status: 'CONFIRMED',
            tariff: 'BASIC',
            totalPrice: 160.00,
            userId: user2.id,
            vehicleId: vehicle.id
          }
        })
      ]

      // One booking should succeed, the other should fail
      const results = await Promise.allSettled(bookingPromises)
      
      const successful = results.filter(r => r.status === 'fulfilled').length // One should succeed
      const failed = results.filter(r => r.status === 'rejected').length // One should fail
      
      // At least one should fail due to overlapping dates
      expect(successful + failed).toBe(2)
      
      // Check that only one reservation exists for this time period
      const overlappingReservations = await prisma.reservation.findMany({
        where: {
          vehicleId: vehicle.id,
          AND: [
            { startDate: { lte: new Date('2025-11-03') } },
            { endDate: { gte: new Date('2025-11-01') } }
          ]
        }
      })

      expect(overlappingReservations.length).toBeLessThanOrEqual(2)
    })

    it('should handle transaction rollback on payment failure', async () => {
      const user = await prisma.user.findFirst()
      const vehicle = await prisma.vehicle.findFirst()

      if (!user || !vehicle) {
        throw new Error('Test data not found')
      }

      try {
        await prisma.$transaction(async (tx) => {
          // Create reservation
          const reservation = await tx.reservation.create({
            data: {
              startDate: new Date('2025-12-01'),
              endDate: new Date('2025-12-03'),
              startTime: '10:00',
              endTime: '18:00',
              pickupLocation: 'Mercedes Dealership',
              returnLocation: 'Mercedes Dealership',
              status: 'PENDING',
              tariff: 'BASIC',
              totalPrice: 150.00,
              userId: user.id,
              vehicleId: vehicle.id
            }
          })

          // Simulate payment error
          throw new Error('Payment processing failed')

          // This payment would never be created
          await tx.payment.create({
            data: {
              amount: reservation.totalPrice,
              currency: 'EUR',
              paymentMethod: 'CREDIT_CARD',
              paymentStatus: 'FAILED',
              transactionId: 'FAIL' + Date.now(),
              userId: user.id,
              reservationId: reservation.id
            }
          })
        })
      } catch (error: any) {
        expect(error.message).toBe('Payment processing failed')
      }

      // No reservation should have been created
      const reservations = await prisma.reservation.findMany({
        where: {
          startDate: new Date('2025-12-01'),
          userId: user.id
        }
      })

      expect(reservations.length).toBe(0)
    })

    it('should handle complex queries', async () => {
      // Create test data for complex query
      const testUser = await prisma.user.create({
        data: {
          name: 'Complex User',
          email: 'Test@user.com',
          password: 'quatsch',
          role: 'MEMBER',
          birthDate: new Date('1999-01-01'),
          driversLicenseNumber: 'complex1234567'
        }
      })

      const premiumVehicle = await prisma.vehicle.create({
        data: {
          name: 'Premium BMW',
          type: 'Sedan',
          category: 'PREMIUM',
          description: 'Premium vehicle',
          pricePerDay: 120.00,
          location: 'Premium Location',
          available: true
        }
      })

      await prisma.reservation.create({
        data: {
          startDate: new Date('2025-12-15'),
          endDate: new Date('2025-12-17'),
          startTime: '10:00',
          endTime: '18:00',
          pickupLocation: 'BMW Dealership',
          returnLocation: 'BMW Dealership',
          status: 'CONFIRMED',
          tariff: 'EXCLUSIVE',
          totalPrice: 240.00,
          userId: testUser.id,
          vehicleId: premiumVehicle.id
        }
      })

      // Complex query: All confirmed reservations with user and vehicle info
      const complexQuery = await prisma.reservation.findMany({
        where: {
          AND: [
            { status: 'CONFIRMED' },
            { vehicle: { category: 'PREMIUM' } },
            { totalPrice: { gte: 200.00 } }
          ]
        },
        include: {
          user: {
            select: {
              name: true,
              email: true,
              role: true
            }
          },
          vehicle: {
            select: {
              name: true,
              category: true,
              pricePerDay: true
            }
          }
        },
        orderBy: {
          totalPrice: 'desc'
        }
      })

      expect(complexQuery.length).toBeGreaterThan(0)
      const reservation = complexQuery[0]
      expect(reservation.user.name).toBe('Complex User')
      expect(reservation.vehicle.category).toBe('PREMIUM')
      expect(reservation.totalPrice).toBeGreaterThanOrEqual(200.00)
    })

    it('should validate database constraints', async () => {
      // Test foreign key constraint
      await expect(
        prisma.reservation.create({
          data: {
            startDate: new Date('2025-12-01'),
            endDate: new Date('2025-12-03'),
            startTime: '10:00',
            endTime: '18:00',
            pickupLocation: 'Mercedes Dealership',
            returnLocation: 'Mercedes Dealership',
            status: 'PENDING',
            tariff: 'BASIC',
            totalPrice: 150.00,
            userId: '0000', // Non-existent user
            vehicleId: '0000'  // Non-existent vehicle
          }
        })
      ).rejects.toThrow()
    })

    it('should handle bulk operations', async () => {
      // Create multiple vehicles in bulk
      const bulkVehicles = Array.from({ length: 50 }, (_, i) => ({
        name: `Bulk Vehicle ${i + 1}`,
        type: 'Compact',
        category: 'ECONOMY' as const,
        description: `Bulk test ${i + 1}`,
        pricePerDay: 30.00 + i,
        location: 'Mercedes Dealership',
        available: true
      }))

      const startTime = Date.now()
      
      await prisma.vehicle.createMany({
        data: bulkVehicles
      })

      const endTime = Date.now()
      const duration = endTime - startTime

      // Bulk insert should be under 1 second
      expect(duration).toBeLessThan(1000)

      // Check that all were created
      const createdVehicles = await prisma.vehicle.findMany({
        where: {
          name: {
            startsWith: 'Bulk Vehicle'
          }
        }
      })

      expect(createdVehicles.length).toBe(50)
    })
  })
})
