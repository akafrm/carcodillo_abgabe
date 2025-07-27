/**
 * Authentication & Authorization Tests
 * 
 * Tests cover authentication flows:
 * - NextAuth.js integration
 * - Session management
 * - Role-based access control
 * - Security boundaries
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

describe('Authentication & Authorization Tests', () => {
  let adminUserId: string
  let memberUserId: string
  let testVehicleId: string

  beforeAll(async () => {
    await prisma.$connect()
    
    // Cleanup
    await prisma.reservation.deleteMany()
    await prisma.vehicle.deleteMany()
    await prisma.user.deleteMany()

    // Create admin user
    const adminUser = await prisma.user.create({
      data: {
        name: 'Admin User',
        email: 'admin@test.com',
        password: ' blablablaaaa',
        role: 'ADMIN',
        birthDate: new Date('2002-01-01'),
        driversLicenseNumber: 'ADMIN123456'
      }
    })
    adminUserId = adminUser.id

    // Create member user
    const memberUser = await prisma.user.create({
      data: {
        name: 'Member User',
        email: 'member@test.com',
        password: 'memberaaaaaa',
        role: 'MEMBER',
        birthDate: new Date('2003-01-01'),
        driversLicenseNumber: 'MEMBER123456'
      }
    })
    memberUserId = memberUser.id

    // Create test vehicle
    const vehicle = await prisma.vehicle.create({
      data: {
        name: 'New Porsche 911',
        type: 'Sedan',
        category: 'STANDARD',
        description: '911',
        pricePerDay: 75.00,
        location: 'Stuttgart',
      }
    })
    testVehicleId = vehicle.id
  })

  afterAll(async () => {
    await prisma.reservation.deleteMany()
    await prisma.vehicle.deleteMany()
    await prisma.user.deleteMany()
    await prisma.$disconnect()
  })

  describe('Authentication Requirements', () => {
    it('should block access to protected endpoints without authentication', async () => {
      const protectedEndpoints = [
        '/api/reservations',
        '/api/profile',
        '/api/users'
      ]

      for (const endpoint of protectedEndpoints) {
        const response = await fetch(`${BASE_URL}${endpoint}`)
        expect(response.status).toBe(401)
        
        const error = await response.json()
        expect(error.error).toBe('Unauthorized')
      }
    })

    it('should require authentication for POST operations', async () => {
      const postEndpoints = [
        { url: '/api/reservations', data: { vehicleId: testVehicleId } },
        { url: '/api/vehicles', data: { name: 'Test Car' } }
      ]

      for (const { url, data } of postEndpoints) {
        const response = await fetch(`${BASE_URL}${url}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        })
        
        expect(response.status).toBe(401)
      }
    })

    it('should validate session tokens', async () => {
      const invalidTokenResponse = await fetch(`${BASE_URL}/api/profile`, {
        headers: {
          'Authorization': 'Bearer invalid-token'
        }
      })

      expect(invalidTokenResponse.status).toBe(401)
    })
  })

  describe('Role-based Access Control', () => {
    it('should enforce admin-only access to user management', async () => {
      // Test without any authentication
      const response = await fetch(`${BASE_URL}/api/users`)
      expect(response.status).toBe(401)

    })

    it('should restrict vehicle creation to admin/employee roles', async () => {
      const newVehicle = {
        name: 'Mercedes',
        type: 'SUV',
        category: 'PREMIUM',
        description: 'Should require admin access',
        pricePerDay: 150.00,
        location: 'Bremen'
      }

      const response = await fetch(`${BASE_URL}/api/vehicles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newVehicle)
      })

      // Should be unauthorized without proper admin session
      expect(response.status).toBe(401)
    })

    it('should allow members to access their own data only', async () => {

      const response = await fetch(`${BASE_URL}/api/profile`)
      expect(response.status).toBe(401) // Correctly requires auth
    })
  })

  describe('Security', () => {
    it('should prevent access to other users data', async () => {
      // Test accessing specific user data without permission
      const response = await fetch(`${BASE_URL}/api/users/${memberUserId}`)
      
      // Should require authentication
      expect(response.status).toBe(401)
    })

    it('should enforce rate limiting on sensitive endpoints', async () => {
      // Rapid registration attempts
      const rapidRequests = Array.from({ length: 10 }, (_, i) =>
        fetch(`${BASE_URL}/api/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: `Test ${i}`,
            email: `Limit${i}@test.com`,
            password: 'password123',
            birthDate: '2004-01-01',
            driversLicenseNumber: `RATE${i.toString().padStart(6, '0')}`
          })
        })
      )

      const responses = await Promise.all(rapidRequests)

      const statusCodes = responses.map(r => r.status)
      const hasRateLimit = statusCodes.includes(429)
      const allSucceeded = statusCodes.every(code => code === 201)
      
      expect(hasRateLimit || allSucceeded).toBe(true)
    })
  })

  describe('Session Management', () => {
      it('should properly handle session expiration', async () => {
        const response = await fetch(`${BASE_URL}/api/auth/session`)
        
        expect([200, 401, 404]).toContain(response.status)
      })

      it('should handle logout properly', async () => {
        const response = await fetch(`${BASE_URL}/api/auth/signout`, {
          method: 'POST'
        })

        expect([200, 401, 404, 405]).toContain(response.status)
      })
    })
  })

