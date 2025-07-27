/**
 * BillingEngine Tests
 */
import { describe, it, expect, vi } from 'vitest'
import { BillingEngine, billingEngine } from '../billing-engine'

describe('Advanced Tests', () => {
  describe('Input Validation and Edge Cases', () => {
    it('should handle null or undefined dates gracefully', () => {
      // @ts-expect-error - testing runtime behavior with invalid input
      const result = billingEngine.calculatePrice(50, null, new Date('2025-01-02'), 'BASIC')
      expect(result.basePrice).toBe(0)
      expect(result.totalPrice).toBe(0)
    })
    
    it('should correctly calculate leap year day counts', () => {
      // Testing leap year calculation: Feb 28 to Mar 1 (2 days)
      const startDate = new Date('2024-02-28')
      const endDate = new Date('2024-03-01')
      const pricePerDay = 100
      
      const result = billingEngine.calculatePrice(pricePerDay, startDate, endDate, 'BASIC')
      expect(result.basePrice).toBe(200)
      expect(result.breakdown[0].description).toContain('2 days')
    })
    
    it('should handle exact time to time', () => {
      const startDate = new Date('2025-01-01T00:00:00.000Z')
      const endDate = new Date('2025-01-02T00:00:00.000Z')
      const pricePerDay = 100
      
      const result = billingEngine.calculatePrice(pricePerDay, startDate, endDate, 'BASIC')
      expect(result.basePrice).toBe(100) // Exactly 1 day
    })
  })
  
  describe('Performance and Precision', () => {
    it('should maintain precision with float', () => {
      const startDate = new Date('2025-01-01')
      const endDate = new Date('2025-01-04')
      const pricePerDay = 33.33
      
      const result = billingEngine.calculatePrice(pricePerDay, startDate, endDate, 'DISCOUNTED')
      
      const expectedBase = 33.33 * 3
      const expectedDiscount = expectedBase * 0.15
      const expectedTotal = expectedBase - expectedDiscount
      
      expect(result.basePrice).toBeCloseTo(expectedBase, 2)
      expect(result.tariffAdjustment).toBeCloseTo(expectedDiscount, 2)
      expect(result.totalPrice).toBeCloseTo(expectedTotal, 2)
    })
    
    it('should handle calculations with many decimals', () => {
      const startDate = new Date('2025-01-01')
      const endDate = new Date('2025-01-02')
      const pricePerDay = 123.456789
      
      const result = billingEngine.calculatePrice(pricePerDay, startDate, endDate, 'EXCLUSIVE')
      
      expect(result.basePrice).toBeCloseTo(123.456789)
      expect(result.tariffAdjustment).toBeCloseTo(-123.456789 * 0.25, 5)
    })
  })

  describe('Custom Use Cases', () => {
    it('should handle extreme short rentals', () => {
      const startDate = new Date('2025-01-01T12:30:00')
      const endDate = new Date('2025-01-01T12:30:59')
      const pricePerDay = 50
      
      const result = billingEngine.calculatePrice(pricePerDay, startDate, endDate, 'BASIC')
      
      // Charge minimum one day
      expect(result.basePrice).toBe(50)
      expect(result.breakdown[0].description).toContain('1 day')
    })
    
    it('should calculate correct price for complex times', () => {
      // Test rental crossing month boundary
      const startDate = new Date('2025-01-30')
      const endDate = new Date('2025-02-02')
      const pricePerDay = 45
      
      const result = billingEngine.calculatePrice(pricePerDay, startDate, endDate, 'BASIC')
      
      expect(result.basePrice).toBe(45 * 3) // 3 days
      expect(result.breakdown[0].description).toContain('3 days')
    })
  })
})

describe('Base tests', () => {
  describe('calculatePrice', () => {
    it('should calculate basic price without adjustments for BASIC tariff', () => {
      const startDate = new Date('2025-01-01')
      const endDate = new Date('2025-01-04') // 3 days
      const pricePerDay = 50

      const result = billingEngine.calculatePrice(pricePerDay, startDate, endDate, 'BASIC')

      expect(result.basePrice).toBe(150)
      expect(result.tariffAdjustment).toBe(0)
      expect(result.totalPrice).toBe(150)
      expect(result.breakdown).toHaveLength(1)
      expect(result.breakdown[0].description).toBe('Base price (3 days × €50)')
      expect(result.breakdown[0].amount).toBe(150)
    })

  it('should apply discount for DISCOUNTED tariff', () => {
        const startDate = new Date('2025-01-01')        
        const endDate = new Date('2025-01-06')               
        const pricePerDay = 40                               

        const result = billingEngine.calculatePrice(pricePerDay, startDate, endDate, 'DISCOUNTED')  // Caltulate with DISCOUNTED tariff

        expect(result.basePrice).toBe(200)                    // 5 days × 40€ = 200€
        expect(result.tariffAdjustment).toBe(30)              // 15% of 200€ = 30€
        expect(result.totalPrice).toBe(170)                   // Resulting price: 200€ - 30€ = 170€
        expect(result.breakdown).toHaveLength(2)              
        expect(result.breakdown[1].description).toBe('Discounted discount (15%)')
        expect(result.breakdown[1].amount).toBe(-30) 
    })

    it('should apply surcharge for EXCLUSIVE tariff', () => {
      const startDate = new Date('2025-01-01')
      const endDate = new Date('2025-01-03') // 2 days
      const pricePerDay = 100

      const result = billingEngine.calculatePrice(pricePerDay, startDate, endDate, 'EXCLUSIVE')

      expect(result.basePrice).toBe(200)
      expect(result.tariffAdjustment).toBe(-50)
      expect(result.totalPrice).toBe(250)
      expect(result.breakdown).toHaveLength(2)
      expect(result.breakdown[1].description).toBe('Exclusive surcharge (25%)')
      expect(result.breakdown[1].amount).toBe(50)
    })

    it('should handle single day rentals', () => {
      const startDate = new Date('2025-01-01T10:00:00')
      const endDate = new Date('2025-01-01T15:00:00') // Same day
      const pricePerDay = 75

      const result = billingEngine.calculatePrice(pricePerDay, startDate, endDate, 'BASIC')

      expect(result.basePrice).toBe(75) // Charge for 1 day minimum
      expect(result.totalPrice).toBe(75)
    })

    it('should handle fractional days by rounding up', () => {
      const startDate = new Date('2025-01-01T10:00:00')
      const endDate = new Date('2025-01-02T15:00:00') // 1.2 days
      const pricePerDay = 60

      const result = billingEngine.calculatePrice(pricePerDay, startDate, endDate, 'BASIC')

      expect(result.basePrice).toBe(120) // Charge for 2 full days
      expect(result.breakdown[0].description).toBe('Base price (2 days × €60)')
    })

    it('should fallback to BASIC tariff for unknown tariff ID', () => {
      const startDate = new Date('2025-01-01')
      const endDate = new Date('2025-01-02')
      const pricePerDay = 50

      const result = billingEngine.calculatePrice(pricePerDay, startDate, endDate, 'UNKNOWN_TARIFF')

      expect(result.tariffAdjustment).toBe(0)
      expect(result.totalPrice).toBe(50)
      expect(result.breakdown).toHaveLength(1)
    })

    it('should handle zero price per day', () => {
      const startDate = new Date('2025-01-01')
      const endDate = new Date('2025-01-03')
      const pricePerDay = 0

      const result = billingEngine.calculatePrice(pricePerDay, startDate, endDate, 'DISCOUNTED')

      expect(result.basePrice).toBe(0)
      expect(result.tariffAdjustment).toBe(0)
      expect(result.totalPrice).toBe(0)
    })
  })

  describe('getTariffs', () => {
    it('should return all available tariffs', () => {
      const tariffs = billingEngine.getTariffs()

      expect(tariffs).toHaveLength(3)
      expect(tariffs[0].id).toBe('BASIC')
      expect(tariffs[1].id).toBe('DISCOUNTED')
      expect(tariffs[2].id).toBe('EXCLUSIVE')
    })

    it('should return tariffs with correct discount rates', () => {
      const tariffs = billingEngine.getTariffs()

      const basic = tariffs.find(t => t.id === 'BASIC')
      const discounted = tariffs.find(t => t.id === 'DISCOUNTED')
      const exclusive = tariffs.find(t => t.id === 'EXCLUSIVE')

      expect(basic?.discount).toBe(0)
      expect(discounted?.discount).toBe(0.15)
      expect(exclusive?.discount).toBe(-0.25)
    })
  })
})