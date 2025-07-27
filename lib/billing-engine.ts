/**
 * Billing Engine Module
 * 
 * Handles price calculations for vehicle rentals including:
 * - Base rental price calculation based on duration
 * - Tariff-based discounts or surcharges 
 * - Itemized price breakdown
 * - Some interfaces not in the index.ts for logic/implementation reasons
 */

import type { TariffType } from "@/types"

 // Tariff configuration structure
export interface TariffConfig {
  id: TariffType
  name: string
  description: string
  discount: number // Positive = discount, Negative = surcharge
}

// Structured result of a billing calculation

export interface BillingCalculation {
  basePrice: number
  tariffAdjustment: number
  totalPrice: number
  breakdown: {
    description: string
    amount: number
  }[]
}

export class BillingEngine {
  /**
   * Predefined tariff options available in the system
   * Each with specific discount rates or surcharges
   */
  private tariffs: TariffConfig[] = [
    {
      id: "BASIC",
      name: "Basic",
      description: "Standard",
      discount: 0,
    },
    {
      id: "DISCOUNTED",
      name: "Discounted",
      description: "For students and seniors",
      discount: 0.15, // 15% discount
    },
    {
      id: "EXCLUSIVE",
      name: "Exclusive",
      description: "Premium-Service",
      discount: -0.25, // 25% add on surcharge
    },
  ]

  /**
   * Calculates rental price based on vehicle price, duration and selected tariff
   * 
   * @param pricePerDay - Daily rental rate for the vehicle
   * @param startDate - Rental start date
   * @param endDate - Rental end date
   * @param tariffId - Selected tariff identifier
   * @returns Complete price calculation with breakdown
   */
  calculatePrice(pricePerDay: number, startDate: Date, endDate: Date, tariffId: string): BillingCalculation {
    // Input validation
    if (!startDate || !endDate || isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return {
        basePrice: 0,
        tariffAdjustment: 0,
        totalPrice: 0,
        breakdown: []
      }
    }

    const timeDiff = endDate.getTime() - startDate.getTime()
    const days = Math.max(1, Math.ceil(timeDiff / (1000 * 60 * 60 * 24)))
    const tariff = this.tariffs.find((t) => t.id === tariffId) || this.tariffs[0]

    const basePrice = pricePerDay * days
    const breakdown: { description: string; amount: number }[] = []

    breakdown.push({
      description: `Base price (${days} days × €${pricePerDay})`,
      amount: basePrice,
    })

    let tariffAdjustment = 0
    if (tariff.discount !== 0) {
      tariffAdjustment = basePrice * tariff.discount
      if (tariff.discount > 0) {
        breakdown.push({
          description: `${tariff.name} discount (${(tariff.discount * 100).toFixed(0)}%)`,
          amount: -tariffAdjustment,
        })
      } else {
        breakdown.push({
          description: `${tariff.name} surcharge (${Math.abs(tariff.discount * 100).toFixed(0)}%)`,
          amount: Math.abs(tariffAdjustment),
        })
      }
    }

    const totalPrice = basePrice + (tariff.discount < 0 ? Math.abs(tariffAdjustment) : -tariffAdjustment)

    return {
      basePrice,
      tariffAdjustment,
      totalPrice,
      breakdown,
    }
  }

  // Returns all available tariff configurations
  getTariffs(): TariffConfig[] {
    return [...this.tariffs]
  }
}

// Singleton instance of the billing engine
export const billingEngine = new BillingEngine()