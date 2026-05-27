import { CATEGORY_SLUGS } from '@/constants/categories'

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const GROQ_BATCH_SIZE = 10

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// ─── Rule-based categorization ────────────────────────────────────────────────

const CATEGORY_RULES = [
  { category: 'groceries',     keywords: ['checkers', 'woolworths', 'pick n pay', 'pnp', 'shoprite', 'spar', 'food lover', 'sixty60', 'woollies', 'econofoods', 'superspar', 'mahems'] },
  { category: 'fuel',          keywords: ['engen', 'shell', 'bp ', 'caltex', 'sasol', 'total garage', 'astron', 'uber', 'bolt', 'taxi', 'gautrain', 'parking', 'e-toll', 'etoll', 'sanral', 'payshap ext credit', 'petrol', 'lift', 'karabo parking'] },
  { category: 'dining',        keywords: ['mcdonald', 'kfc', 'steers', 'nando', 'wimpy', 'debonairs', 'pizza', 'restaurant', 'cafe', 'coffee', 'spur', 'fishaways', 'galito', 'toro north', 'klipoog', 'kafeteria', 'draak', 'serv preto', 'texas rock', 'castle house', 'tightrope', 'door 1', 'music cafe', 'bakehouse', 'hennies', 'elgro', 'alan smith', 'padstal', 'ubunye', 'yoco'] },
  { category: 'shopping',      keywords: ['game store', 'makro', 'cum books', 'kloppers', 'balloon party', 'takealot', 'skinphd'] },
  { category: 'clothing',      keywords: ['mr price', 'mrp', 'zara', 'h&m', 'edgars', 'truworths', 'cotton on', 'markham', 'exact', 'identity', 'jet store', 'ackermans', 'pep store', 'jam clothing'] },
  { category: 'entertainment', keywords: ['netflix', 'showmax', 'spotify', 'dstv', 'steam', 'playstation', 'cinema', 'nu metro', 'ster kinekor', 'playtomic', 'padel', 'quicket', 'snowflake', 'menlo padel', 'techno padel', 'padel circle', 'oesdag'] },
  { category: 'healthcare',    keywords: ['clicks', 'dischem', 'pharmacy', 'doctor', 'hospital', 'mediclinic', 'netcare', 'dentist', 'medcross'] },
  { category: 'insurance',     keywords: ['outsurance', 'discovery life', 'momentum', 'sanlam', 'old mutual', 'hollard', 'miway', 'pps'] },
  { category: 'banking_fees',  keywords: ['monthly fee', 'bank charge', 'notific fee', 'notification fee', 'transaction fee', 'service fee', 'sms fee', 'notifyme', 'card fee', 'annual fee', 'monthly acc fee', 'acc fee', 'insufficient funds fee', 'insufficient funds', 'funds transfer fee', 'finance charge', 'airtime debit', 'decl pos tran fee'] },
  { category: 'utilities',     keywords: ['eskom', 'municipality', 'water ', 'electricity', 'vodacom', 'mtn', 'cell c', 'telkom', 'fibre', 'prepaid', 'airtime', 'rain', 'perfect water'] },
  { category: 'subscriptions', keywords: ['virgin active', 'virgin act', 'netcash', 'apple.com/bill', 'apple.com'] },
  { category: 'investments',   keywords: ['easy equities', 'ee-', 'ee-9763586', 'easyequities', 'etf', 'satrix'] },
  { category: 'haircut',       keywords: ['excellent barber', 'hpy*', 'barber shop', 'barber', 'hair salon', 'hairdresser'] },
  { category: 'home_repairs',  keywords: ['builders', 'cashbuild', 'hardware', 'plumber', 'electrician', 'leroy merlin', 'mica'] },
  { category: 'education',     keywords: ['university', 'school', 'college', 'ekrp', 'notes', 'books'] },
]

function ruleBasedCategorize(description) {
  const lower = description.toLowerCase()
  for (const rule of CATEGORY_RULES) {
    if (rule.keywords.some((k) => lower.includes(k))) return rule.category
  }
  return null
}

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

async function categorizeWithGroq(transactions, onRateLimit, retryCount = 0) {
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

      if (response.status === 429 && retryCount < 1) {
        const retryMatch = errorText.match(/try again in (\d+\.?\d*)s/)
        const waitMs = retryMatch ? Math.ceil(parseFloat(retryMatch[1])) * 1000 + 1000 : 10000
        onRateLimit?.(Math.ceil(waitMs / 1000))
        await sleep(waitMs)
        return categorizeWithGroq(transactions, onRateLimit, retryCount + 1)
      }

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
 * Categorize all transactions using a four-tier approach:
 *   Tier 0 — internal transfer detection (own account numbers)
 *   Tier 1 — user overrides (hard match — highest priority)
 *   Tier 2 — SA keyword rules (fast, no API quota)
 *   Tier 3 — Groq AI batched categorization for unmatched transactions
 *   Tier 4 — 'other' if Groq fails or returns nothing
 *
 * Calls onProgress(0–100) across the full pipeline.
 * Calls onRateLimit(seconds) when a 429 is hit and retried.
 * Returns a Map<id, category>.
 */
export async function categorizeAll(transactions, overrides = [], onProgress, options = {}, onRateLimit) {
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
  const afterOverrides = []
  for (const t of remaining) {
    const match = findOverrideMatch(t.description, overrides)
    if (match) {
      results.set(t.id, match)
    } else {
      afterOverrides.push(t)
    }
  }
  onProgress?.(10)

  // Tier 2 — keyword rules
  const forGroq = []
  for (const t of afterOverrides) {
    const category = ruleBasedCategorize(t.description)
    if (category) {
      results.set(t.id, category)
    } else {
      forGroq.push(t)
    }
  }
  onProgress?.(20)

  // Tier 3 — Groq AI for anything keywords couldn't match
  if (forGroq.length > 0) {
    const batches = []
    for (let i = 0; i < forGroq.length; i += GROQ_BATCH_SIZE) {
      batches.push(forGroq.slice(i, i + GROQ_BATCH_SIZE))
    }

    for (let i = 0; i < batches.length; i++) {
      if (i > 0) await sleep(1000)

      const batch = batches[i]
      const groqCategories = await categorizeWithGroq(batch, onRateLimit)

      for (let j = 0; j < batch.length; j++) {
        const t = batch[j]
        const cat = groqCategories?.[j]
        // Tier 4 — fall back to 'other' if Groq failed or returned an invalid slug
        results.set(t.id, CATEGORY_SLUGS.includes(cat) ? cat : 'other')
      }

      onProgress?.(20 + Math.round(((i + 1) / batches.length) * 80))
    }
  } else {
    onProgress?.(100)
  }

  return results
}
