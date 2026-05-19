import { CATEGORY_SLUGS } from '@/constants/categories'
import { MAX_TRANSACTIONS_PER_BATCH, MAX_CATEGORY_OVERRIDES_IN_PROMPT } from '@/constants/limits'

const API_URL = 'https://api.anthropic.com/v1/messages'
const MODEL   = 'claude-haiku-4-5-20251001'

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
- South African context: "SPAR", "PNP", "WOOLWORTHS FOOD" → groceries; "ENGEN", "SHELL", "BP", "SASOL" → fuel; "UBER", "BOLT" → transport; "NETFLIX", "DSTV", "SPOTIFY" → subscriptions
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
 * Categorize all transactions in batches of MAX_TRANSACTIONS_PER_BATCH.
 * Calls onProgress(0–100) after each completed batch.
 * Returns a Map<id, category>. Any transaction that Claude doesn't return a
 * category for keeps its existing category (falls back to 'other').
 */
export async function categorizeAll(transactions, overrides = [], onProgress) {
  const results = new Map()
  const batches = []

  for (let i = 0; i < transactions.length; i += MAX_TRANSACTIONS_PER_BATCH) {
    batches.push(transactions.slice(i, i + MAX_TRANSACTIONS_PER_BATCH))
  }

  for (let i = 0; i < batches.length; i++) {
    const batchMap = await categorizeBatch(batches[i], overrides)
    for (const [id, category] of batchMap) {
      results.set(id, category)
    }
    onProgress?.(Math.round(((i + 1) / batches.length) * 100))
  }

  return results
}
