import { ParsedSMS, SMSParseResult, Category } from './types'
import { generateId } from './expense-engine'

// Merchant to Category mapping
const MERCHANT_CATEGORY_MAP: Record<string, Category> = {
  // Food & Dining
  'restaurant': 'food', 'mcdonalds': 'food', 'subway': 'food', 'pizza': 'food',
  'cafe': 'food', 'coffee': 'food', 'bakery': 'food', 'zomato': 'food',
  'swiggy': 'food', 'blinkit': 'food', 'instamart': 'food', 'dunzo': 'food',
  
  // Transport
  'uber': 'transport', 'ola': 'transport', 'lyft': 'transport', 'taxi': 'transport',
  'fuel': 'transport', 'petrol': 'transport', 'parking': 'transport', 'metro': 'transport',
  'train': 'transport', 'bus': 'transport', 'airline': 'transport', 'flight': 'transport',
  
  // Entertainment
  'netflix': 'entertainment', 'spotify': 'entertainment', 'amazon': 'entertainment',
  'disney': 'entertainment', 'youtube': 'entertainment', 'prime': 'entertainment',
  'movie': 'entertainment', 'theater': 'entertainment', 'gaming': 'entertainment',
  'steam': 'entertainment', 'playstation': 'entertainment', 'xbox': 'entertainment',
  
  // Shopping
  'flipkart': 'shopping', 'amazon': 'shopping', 'myntra': 'shopping', 'ajio': 'shopping',
  'mall': 'shopping', 'store': 'shopping', 'shop': 'shopping', 'retail': 'shopping',
  
  // Health & Fitness
  'gym': 'health', 'hospital': 'health', 'pharmacy': 'health', 'clinic': 'health',
  'doctor': 'health', 'medical': 'health', 'fitness': 'health', 'yoga': 'health',
  
  // Utilities
  'electricity': 'utilities', 'water': 'utilities', 'gas': 'utilities', 'internet': 'utilities',
  'mobile': 'utilities', 'phone': 'utilities',
  
  // Bills
  'credit card': 'bills', 'insurance': 'bills', 'emi': 'bills', 'loan': 'bills'
}

// SMS patterns for amount extraction
const SMS_PATTERNS = [
  // "Paid ₹500 to Restaurant ABC"
  /paid\s+[₹\$]\s*(\d+(?:,\d+)*(?:\.\d+)?)/i,
  // "Transaction: ₹1200 debit"
  /transaction:\s*[₹\$]\s*(\d+(?:,\d+)*(?:\.\d+)?)/i,
  // "Amount: ₹500, Merchant: Restaurant"
  /amount:\s*[₹\$]\s*(\d+(?:,\d+)*(?:\.\d+)?)/i,
  // "₹500 spent at Café"
  /[₹\$]\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:spent|charged|debited)/i,
  // "₹500 on Groceries"
  /[₹\$]\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*on\s+([a-z\s]+)/i,
  // "Debit: ₹500"
  /(?:debit|credit|charge):\s*[₹\$]\s*(\d+(?:,\d+)*(?:\.\d+)?)/i,
  // Generic amount pattern
  /[₹\$]\s*(\d+(?:,\d+)*(?:\.\d+)?)/
]

export function parseSMS(smsText: string): SMSParseResult {
  try {
    const trimmedText = smsText.trim()

    if (!trimmedText) {
      return {
        success: false,
        error: 'SMS text is empty'
      }
    }

    // Extract amount
    let amount = 0
    let amountConfidence = 0

    for (const pattern of SMS_PATTERNS) {
      const match = trimmedText.match(pattern)
      if (match && match[1]) {
        const amountStr = match[1].replace(/,/g, '')
        amount = parseFloat(amountStr)
        if (!isNaN(amount)) {
          amountConfidence = 0.95
          break
        }
      }
    }

    if (amount === 0) {
      return {
        success: false,
        error: 'Could not extract amount from SMS'
      }
    }

    // Extract merchant name
    let merchant = 'Unknown'
    let merchantConfidence = 0.7

    // Look for "at Merchant", "to Merchant", "from Merchant" patterns
    const merchantPatterns = [
      /at\s+([a-z\s]+?)(?:\.|,|$)/i,
      /to\s+([a-z\s]+?)(?:\.|,|$)/i,
      /from\s+([a-z\s]+?)(?:\.|,|$)/i,
      /merchant:\s*([a-z\s]+?)(?:\.|,|$)/i
    ]

    for (const pattern of merchantPatterns) {
      const match = trimmedText.match(pattern)
      if (match && match[1]) {
        merchant = match[1].trim()
        merchantConfidence = 0.9
        break
      }
    }

    // Extract or infer category
    let category: Category = 'other'
    let categoryConfidence = 0.6

    const lowerText = trimmedText.toLowerCase() + ' ' + merchant.toLowerCase()

    for (const [keyword, cat] of Object.entries(MERCHANT_CATEGORY_MAP)) {
      if (lowerText.includes(keyword)) {
        category = cat
        categoryConfidence = 0.95
        break
      }
    }

    // Calculate overall confidence
    const confidence = Math.round((amountConfidence + merchantConfidence + categoryConfidence) / 3 * 100) / 100

    const parsedSMS: ParsedSMS = {
      id: generateId(),
      originalText: trimmedText,
      extractedAmount: amount,
      merchant,
      category,
      date: new Date(),
      confidence,
      createdAt: new Date()
    }

    return {
      success: true,
      data: parsedSMS,
      confidence
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to parse SMS'
    }
  }
}

export function extractMerchantCategory(merchant: string): Category {
  const lowerMerchant = merchant.toLowerCase()
  for (const [keyword, category] of Object.entries(MERCHANT_CATEGORY_MAP)) {
    if (lowerMerchant.includes(keyword)) {
      return category
    }
  }
  return 'other'
}

export function formatSMSForDisplay(sms: ParsedSMS): string {
  return `₹${sms.extractedAmount} spent at ${sms.merchant} (${Math.round(sms.confidence * 100)}% confidence)`
}
