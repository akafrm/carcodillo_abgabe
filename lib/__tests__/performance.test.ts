/**
 * Real System Performance Tests
 * 
 * Diese Tests messen echte Performance-Metriken:
 * - Response Times unter Last
 * - Concurrent Request Handling
 * - Database Performance
 * - Memory Usage
 * - Throughput Benchmarks
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

describe('Real System Performance Tests', () => {
  let testVehicleIds: string[] = []

  beforeAll(async () => {
    await prisma.$connect()
    
    // Create performance test data
    const vehicles = Array.from({ length: 100 }, (_, i) => ({
      name: `Next Vehicle ${i + 1}`,
      type: i % 2 === 0 ? 'Sedan' : 'Compact',
      category: (i % 3 === 0 ? 'PREMIUM' : 'STANDARD') as 'PREMIUM' | 'STANDARD',
      description: `PTV ${i + 1}`,
      pricePerDay: 50.00 + (i * 2),
      location: `Mercedes Dealership ${i % 5}`,
      available: true
    }))

    await prisma.vehicle.createMany({ data: vehicles })
    
    const createdVehicles = await prisma.vehicle.findMany({
      where: { name: { startsWith: 'Next Vehicle' } }
    })
    testVehicleIds = createdVehicles.map(v => v.id)
  })

  afterAll(async () => {
    // Cleanup smth
    await prisma.vehicle.deleteMany({
      where: { name: { startsWith: 'Next Vehicle' } }
    })
    await prisma.$disconnect()
  })

  describe('API Response Time Performance', () => {
    it('should handle single vehicle requests under 2s', async () => {
      const vehicleId = testVehicleIds[0]
      const startTime = performance.now()
      
      const response = await fetch(`${BASE_URL}/api/vehicles/${vehicleId}`)
      
      const endTime = performance.now()
      const responseTime = endTime - startTime

      expect(response.status).toBe(200)

      expect(responseTime).toBeLessThan(2000) // Allowing up to 2 seconds for initial load, not fast but just testing
    })

    it('should handle vehicle list requests under 400ms', async () => {
      const startTime = performance.now()
      
      const response = await fetch(`${BASE_URL}/api/vehicles`)
      
      const endTime = performance.now()
      const responseTime = endTime - startTime

      expect(response.status).toBe(200)
      expect(responseTime).toBeLessThan(400)

      const data = await response.json()
      expect(data.length).toBeGreaterThan(0)
    })
  })

  describe('Request Performance', () => {
    it('should handle 50 concurrent vehicle requests', async () => {
      const concurrentRequests = 50
      const requests = Array.from({ length: concurrentRequests }, () =>
        fetch(`${BASE_URL}/api/vehicles`)
      )

      const startTime = performance.now()
      
      const responses = await Promise.all(requests)
      
      const endTime = performance.now()
      const totalTime = endTime - startTime

      // All requests should succeed
      expect(responses.every(r => r.status === 200)).toBe(true)
      
      // Total time should be reasonable (under 2 seconds for 50 requests)
      expect(totalTime).toBeLessThan(2000)
      
      // Average response time per request
      const avgResponseTime = totalTime / concurrentRequests
      expect(avgResponseTime).toBeLessThan(150)
    })

    it('should handle concurrent registration requests without conflicts', async () => {
      const concurrentUsers = Array.from({ length: 10 }, (_, i) => ({
        name: `CU ${i}`,
        email: `con${i}@carcoooo.com`,
        password: 'qwei3ii3ii',
        birthDate: '1999-01-01',
        driversLicenseNumber: `PERF${i.toString().padStart(6, '0')}`
      }))

      const requests = concurrentUsers.map(user =>
        fetch(`${BASE_URL}/api/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(user)
        })
      )

      const startTime = performance.now()
      
      const responses = await Promise.all(requests)
      
      const endTime = performance.now()
      const totalTime = endTime - startTime

      // All registrations should succeed
      const successfulRequests = responses.filter(r => r.status === 201).length
      expect(successfulRequests).toBe(10)
      
      expect(totalTime).toBeLessThan(3000)
    })
  })

  describe('Database Performance', () => {
    it('should perform complex DB queries efficiently', async () => {
      const startTime = performance.now()
      const complexQuery = await prisma.vehicle.findMany({
        where: {
          AND: [
            { available: true },
            { pricePerDay: { gte: 60.00, lte: 120.00 } },
            { category: { in: ['PREMIUM', 'STANDARD'] } }
          ]
        },
        include: {
          reservations: {
            where: {
              status: 'CONFIRMED'
            },
            include: {
              user: {
                select: {
                  name: true,
                  email: true
                }
              }
            }
          }
        },
        orderBy: [
          { category: 'desc' },
          { pricePerDay: 'asc' }
        ],
        take: 20
      })

      const endTime = performance.now()
      const queryTime = endTime - startTime

      expect(queryTime).toBeLessThan(500) // Complex query under 500ms
      expect(complexQuery.length).toBeGreaterThan(0)
    })

    it('should handle bulk inserts efficiently', async () => {
      const bulkData = Array.from({ length: 200 }, (_, i) => ({
        name: `BPU ${i}`,
        email: `bulk${i}@carcoooo.com`,
        password: 'hhhhhhhh',
        role: 'MEMBER' as const,
        birthDate: new Date('1999-01-01'),
        driversLicenseNumber: `BULK${i.toString().padStart(6, '0')}`
      }))

      const startTime = performance.now()

      await prisma.user.createMany({
        data: bulkData
      })

      const endTime = performance.now()
      const insertTime = endTime - startTime

      expect(insertTime).toBeLessThan(1000) // 200 inserts under 1 second

      // Cleanup
      await prisma.user.deleteMany({
        where: {
          email: { startsWith: 'bulk' }
        }
      })
    })

  describe('Memory and Resource Usage', () => {
    it('should not create memory leaks with repeated requests', async () => {
      const initialMemory = process.memoryUsage().heapUsed

      //  100 requests to check for memory leaks
      for (let i = 0; i < 100; i++) {
        const response = await fetch(`${BASE_URL}/api/vehicles`)
        await response.json() // Consume response
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc()
      }

      const finalMemory = process.memoryUsage().heapUsed
      const memoryIncrease = finalMemory - initialMemory

      // Memory increase should be reasonable (under 50MB)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024)
    })

    it('should handle database connections efficiently', async () => {
      const startTime = performance.now()

      // Test multiple concurrent database operations
      const operations = Array.from({ length: 20 }, async () => {
        const user = await prisma.user.findFirst()
        const vehicleCount = await prisma.vehicle.count()
        const reservations = await prisma.reservation.findMany({
          take: 5
        })
        return { user, vehicleCount, reservations }
      })

      const results = await Promise.all(operations)

      const endTime = performance.now()
      const operationTime = endTime - startTime

      expect(operationTime).toBeLessThan(1000) // 20 concurrent ops under 1 second
      expect(results.length).toBe(20)
    })
  })

  describe('Stress Testing', () => {
    it('should survive rapid requests', async () => {
      const rapidRequests = Array.from({ length: 100 }, (_, i) => 
        fetch(`${BASE_URL}/api/vehicles/${testVehicleIds[i % testVehicleIds.length]}`)
      )

      const startTime = performance.now()
      
      const responses = await Promise.allSettled(rapidRequests)
      
      const endTime = performance.now()
      const totalTime = endTime - startTime

      const successful = responses.filter(r => r.status === 'fulfilled').length
      const failed = responses.filter(r => r.status === 'rejected').length

      // Most requests should succeed
      expect(successful).toBeGreaterThan(90)
      expect(failed).toBeLessThan(10)
      
      expect(totalTime).toBeLessThan(5000)
    })
  })
}) 
})
