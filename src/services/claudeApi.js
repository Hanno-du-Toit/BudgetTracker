import { CATEGORY_SLUGS } from '@/constants/categories'

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const GROQ_BATCH_SIZE = 20

// ─── Internal transfer detection ─────────────────────────────────────────────

export function detectInternalTransfer(description, userAccountNumbers = []) {
  const lower = description.toLowerCase()
  const hasAccounts = userAccountNumbers.length > 0

  if (hasAccounts) {
    if (lower.includes('digital transf dt absa bank h') || lower.includes('digital transf cr absa bank h')) return true
    if (lower.includes('inetbnk trf credit absa bank h')) return true
  }

  const isTransfer = lower.includes('digital transf') || lower.includes('digital payment dt') || lower.includes('digital payment cr')
  if (!isTransfer) return false
  const normalizedDesc = lower.replace(/[-\s]/g, '')
  return userAccountNumbers.some((acc) => {
    const normalizedAcc = acc.replace(/[-\s]/g, '')
    return normalizedDesc.includes(normalizedAcc)
  })
}

// ─── Override matching ────────────────────────────────────────────────────────

function normalizeDesc(str) {
  return str.toLowerCase().replace(/\s+/g, ' ').trim()
}

function findOverrideMatch(description, overrides) {
  const desc = normalizeDesc(description)
  for (const o of overrides) {
    const pat = normalizeDesc(o.description_pattern)
    if (pat && (desc.includes(pat) || pat.includes(desc))) return o.category
  }
  return null
}

// ─── Groq AI batch categorization ────────────────────────────────────────────

async function categorizeWithGroq(transactions) {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY
  if (!apiKey || apiKey.includes('your-key-here')) return null

  const categories = CATEGORY_SLUGS

  try {
    console.log('Groq request:', JSON.stringify(transactions.map((t) => ({ description: t.description, amount: t.amount }))))
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: `You are a South African bank transaction categorizer.
Given a list of transactions, return a JSON array of category slugs in the same order.
Categories: ${categories.join(', ')}
If unsure, use "other". Reply with ONLY a valid JSON array, no other text.`,
          },
          {
            role: 'user',
            content: JSON.stringify(transactions.map((t) => ({ description: t.description, amount: t.amount }))),
          },
        ],
        temperature: 0,
        max_tokens: 200,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Groq API error:', response.status, errorText)
      return null
    }

    const data = await response.json()
    const text = data.choices?.[0]?.message?.content ?? ''
    const cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim()
    const parsed = JSON.parse(cleaned)
    if (!Array.isArray(parsed)) return null
    return parsed
  } catch {
    return null
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Categorize all transactions using a three-tier approach:
 *   Tier 0 — internal transfer detection (own account numbers)
 *   Tier 1 — user overrides (hard match — highest priority)
 *   Tier 2 — Groq AI batched categorization (up to 20 per call)
 *   Tier 3 — 'other' if Groq fails or returns nothing
 *
 * Calls onProgress(0–100) across the full pipeline.
 * Returns a Map<id, category>.
 */
export async function categorizeAll(transactions, overrides = [], onProgress, options = {}) {
  const results = new Map()

  // Tier 0 — internal transfer detection
  const ownAccounts = options?.userAccountNumbers ?? []
  const remaining = []
  for (const t of transactions) {
    if (detectInternalTransfer(t.description, ownAccounts)) {
      results.set(t.id, 'internal_transfer')
    } else {
      remaining.push(t)
    }
  }

  // Tier 1 — user overrides
  const forGroq = []
  for (const t of remaining) {
    const match = findOverrideMatch(t.description, overrides)
    if (match) {
      results.set(t.id, match)
    } else {
      forGroq.push(t)
    }
  }
  onProgress?.(10)

  // Tier 2 — Groq AI (batched, up to GROQ_BATCH_SIZE per call)
  if (forGroq.length > 0) {
    const batches = []
    for (let i = 0; i < forGroq.length; i += GROQ_BATCH_SIZE) {
      batches.push(forGroq.slice(i, i + GROQ_BATCH_SIZE))
    }

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i]
      const groqCategories = await categorizeWithGroq(batch)

      for (let j = 0; j < batch.length; j++) {
        const t = batch[j]
        const cat = groqCategories?.[j]
        // Tier 3 — fall back to 'other' if Groq failed or returned an invalid slug
        results.set(t.id, CATEGORY_SLUGS.includes(cat) ? cat : 'other')
      }

      onProgress?.(10 + Math.round(((i + 1) / batches.length) * 90))
    }
  } else {
    onProgress?.(100)
  }

  return results
}
