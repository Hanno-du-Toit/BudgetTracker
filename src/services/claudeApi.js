import { CATEGORY_SLUGS } from '@/constants/categories'
import { MAX_TRANSACTIONS_PER_BATCH, MAX_CATEGORY_OVERRIDES_IN_PROMPT } from '@/constants/limits'

const API_URL = 'https://api.anthropic.com/v1/messages'
const MODEL   = 'claude-haiku-4-5-20251001'

// ─── Rule-based categorization ────────────────────────────────────────────────

const CATEGORY_RULES = [
  { category: 'groceries',     keywords: ['checkers', 'woolworths', 'pick n pay', 'pnp', 'shoprite', 'spar', 'food lover', 'sixty60', 'woollies'] },
  { category: 'fuel',          keywords: ['engen', 'shell', 'bp ', 'caltex', 'sasol', 'total garage', 'astron'] },
  { category: 'dining',        keywords: ['mcdonald', 'kfc', 'steers', 'nando', 'wimpy', 'debonairs', 'pizza', 'restaurant', 'cafe', 'coffee', 'spur', 'fishaways', 'galito', 'draak', 'toro north', 'klipoog', 'kafeteria', 'serv preto'] },
  { category: 'transport',     keywords: ['uber', 'bolt', 'taxi', 'gautrain', 'parking', 'e-toll', 'etoll', 'sanral'] },
  { category: 'shopping',      keywords: ['mr price', 'mrp', 'zara', 'h&m', 'edgars', 'truworths', 'cotton on', 'game store', 'makro', 'builder', 'pep store', 'ackermans', 'cum books', 'kloppers'] },
  { category: 'entertainment', keywords: ['netflix', 'showmax', 'spotify', 'dstv', 'steam', 'playstation', 'cinema', 'nu metro', 'ster kinekor', 'playtomic', 'padel circle', 'padel'] },
  { category: 'healthcare',    keywords: ['clicks', 'dischem', 'pharmacy', 'doctor', 'hospital', 'mediclinic', 'netcare', 'dentist', 'medcross'] },
  { category: 'insurance',     keywords: ['outsurance', 'discovery life', 'momentum', 'sanlam', 'old mutual', 'hollard', 'miway', 'pps '] },
  { category: 'subscriptions', keywords: ['virgin active', 'virgin act', 'netcash'] },
  { category: 'banking_fees',  keywords: ['monthly fee', 'bank charge', 'notific fee', 'notification fee', 'transaction fee', 'service fee', 'sms fee', 'notifyme', 'card fee', 'annual fee', 'monthly acc fee', 'acc fee'] },
  { category: 'utilities',     keywords: ['eskom', 'municipality', 'water ', 'electricity', 'vodacom', 'mtn', 'cell c', 'telkom', 'fibre', 'prepaid', 'airtime', 'rain '] },
  { category: 'investments',   keywords: ['easy equities', 'ee-', 'easyequities', 'etf', 'satrix'] },
  { category: 'income',        keywords: ['salary', 'payroll', 'payment received', 'acb credit'] },
]

export function ruleBasedCategorize(description, amount) {
  const lower = description.toLowerCase()
  for (const rule of CATEGORY_RULES) {
    if (rule.category === 'income' && amount <= 0) continue
    if (rule.keywords.some((kw) => lower.includes(kw))) return rule.category
  }
  return null
}

// ─── Internal transfer detection ─────────────────────────────────────────────

export function detectInternalTransfer(description, userAccountNumbers = []) {
  const lower = description.toLowerCase()
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

// ─── Prompt ──────────────────────────────────────────────────────────────────

export function buildPrompt(transactions, overrides = []) {
  const categoryList = CATEGORY_SLUGS.join(', ')

  let knownMappings = ''
  if (overrides.length > 0) {
    const lines = overrides
      .slice(0, MAX_CATEGORY_OVERRIDES_IN_PROMPT)
      .map((o) => `  "${o.description_pattern}" → ${o.category}`)
      .join('\n')
    knownMappings = `\nKnown merchant mappings for this user (apply these exactly):\n${lines}\n`
  }

  const txnPayload = JSON.stringify(
    transactions.map((t) => ({ id: t.id, description: t.description, amount: t.amount }))
  )

  return `You are a bank transaction categorizer for South African transactions.

Categorize each transaction into exactly one of: ${categoryList}

Rules:
- Return ONLY a valid JSON array. No markdown, no explanation, no other text.
- Format: [{"id":"<id>","category":"<slug>"}]
- Positive amounts are credits/income → use "income" unless clearly a refund or reversal
- South African context: "SPAR", "PNP", "WOOLWORTHS FOOD" → groceries; "ENGEN", "SHELL", "BP", "SASOL" → fuel; "UBER", "BOLT" → transport; "NETFLIX", "DSTV", "SPOTIFY" → entertainment; "OUTSURANCE", "DISCOVERY", "SANLAM" → insurance; "SERVICE FEE", "BANK CHARGE" → banking_fees
- Use "other" only if genuinely uncertain
${knownMappings}
Transactions to categorize:
${txnPayload}`
}

// ─── Response parser ──────────────────────────────────────────────────────────

export function parseResponse(responseText) {
  try {
    const cleaned = responseText
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/g, '')
      .trim()
    const parsed = JSON.parse(cleaned)
    if (!Array.isArray(parsed)) return new Map()
    return new Map(
      parsed
        .filter((item) => item?.id && item?.category)
        .map((item) => [item.id, item.category])
    )
  } catch {
    return new Map()
  }
}

// ─── Single batch call ────────────────────────────────────────────────────────

async function categorizeBatch(transactions, overrides) {
  const apiKey = import.meta.env.VITE_CLAUDE_API_KEY

  // Graceful fallback when key is not configured
  if (!apiKey || apiKey.includes('your-key-here')) {
    return new Map(
      transactions.map((t) => [t.id, t.amount > 0 ? 'income' : 'other'])
    )
  }

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      // Required for legitimate browser-side usage
      'anthropic-dangerous-allow-browser': 'true',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 2048,
      messages: [{ role: 'user', content: buildPrompt(transactions, overrides) }],
    }),
  })

  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(body?.error?.message ?? `API error ${response.status}`)
  }

  const data = await response.json()
  const text = data.content?.[0]?.text ?? ''
  return parseResponse(text)
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Categorize all transactions using a three-tier approach:
 *   1. User's saved overrides (hard match — highest priority)
 *   2. Rule-based SA keyword matching
 *   3. Claude AI for anything remaining
 *
 * Calls onProgress(0–100) across the full pipeline.
 * Returns a Map<id, category>.
 */
export async function categorizeAll(transactions, overrides = [], onProgress, options = {}) {
  const results   = new Map()
  const forClaude = []

  // Tier 0 — internal transfer detection (own account numbers)
  const ownAccounts = options?.userAccountNumbers ?? []
  const remainingAfterTransfer = []
  for (const t of transactions) {
    if (detectInternalTransfer(t.description, ownAccounts)) {
      results.set(t.id, 'internal_transfer')
    } else {
      remainingAfterTransfer.push(t)
    }
  }

  // Tier 1 — user overrides (exact/partial normalised description match)
  for (const t of remainingAfterTransfer) {
    const match = findOverrideMatch(t.description, overrides)
    if (match) {
      results.set(t.id, match)
    } else {
      forClaude.push(t)
    }
  }
  onProgress?.(10)

  // Tier 2 — rule-based keyword matching
  const forAI = []
  for (const t of forClaude) {
    const category = ruleBasedCategorize(t.description, t.amount)
    if (category) {
      results.set(t.id, category)
    } else {
      forAI.push(t)
    }
  }
  onProgress?.(20)

  // Tier 3 — Claude AI for remaining transactions
  if (forAI.length > 0) {
    const batches = []
    for (let i = 0; i < forAI.length; i += MAX_TRANSACTIONS_PER_BATCH) {
      batches.push(forAI.slice(i, i + MAX_TRANSACTIONS_PER_BATCH))
    }

    for (let i = 0; i < batches.length; i++) {
      const batchMap = await categorizeBatch(batches[i], overrides)
      for (const [id, category] of batchMap) {
        results.set(id, category)
      }
      onProgress?.(20 + Math.round(((i + 1) / batches.length) * 80))
    }
  } else {
    onProgress?.(100)
  }

  return results
}
