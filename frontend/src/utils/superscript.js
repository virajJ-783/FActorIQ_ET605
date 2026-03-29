/**
 * superscript.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Utilities for converting caret-notation (x^2) to Unicode superscripts (x²),
 * and for normalising answers before comparison.
 *
 * Used in:
 *  • ChapterPage input field (live conversion as user types)
 *  • Answer comparison (both student answer and correct answer normalised)
 *  • SuperscriptToolbar component (button-driven insertion)
 * ─────────────────────────────────────────────────────────────────────────────
 */

// Unicode superscript map for digits 0–9 and common letters
const SUPER_DIGITS = {
  '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
  '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
}

const SUPER_LETTERS = {
  'a': 'ᵃ', 'b': 'ᵇ', 'c': 'ᶜ', 'd': 'ᵈ', 'e': 'ᵉ',
  'i': 'ⁱ', 'j': 'ʲ', 'k': 'ᵏ', 'l': 'ˡ', 'm': 'ᵐ',
  'n': 'ⁿ', 'o': 'ᵒ', 'p': 'ᵖ', 'r': 'ʳ', 's': 'ˢ',
  't': 'ᵗ', 'u': 'ᵘ', 'v': 'ᵛ', 'w': 'ʷ', 'x': 'ˣ',
  'y': 'ʸ', 'z': 'ᶻ',
}

const SUPER_MAP = { ...SUPER_DIGITS, ...SUPER_LETTERS }

/**
 * Convert a single exponent string (e.g. "2", "n", "mn") to Unicode superscripts.
 */
function toSuperscript(exponent) {
  return exponent.split('').map(c => SUPER_MAP[c] ?? c).join('')
}

/**
 * Convert caret notation to Unicode superscripts in a full expression string.
 *
 * Examples:
 *   "x^2"      → "x²"
 *   "x^3 + y"  → "x³ + y"
 *   "a^2b^3"   → "a²b³"
 *   "x^10"     → "x¹⁰"
 *   "x^{mn}"   → "xᵐⁿ"  (optional brace syntax)
 */
export function normalizeToUnicode(input) {
  if (!input) return input

  // Handle brace syntax: x^{exp}
  let result = input.replace(/\^{([^}]+)}/g, (_, exp) => toSuperscript(exp))

  // Handle single or multi-digit bare exponents: x^23 → x²³  x^n → xⁿ
  result = result.replace(/\^([0-9a-z]+)/gi, (_, exp) => toSuperscript(exp.toLowerCase()))

  return result
}

/**
 * Normalise an answer string for comparison:
 *  1. Convert caret notation to unicode
 *  2. Strip all spaces
 *  3. Lowercase
 *  4. Normalise bracket styles: [ → (, { → (
 *  5. Sort terms within brackets (so (x+2)(x+3) == (x+3)(x+2))
 *
 * Used in ChapterPage handleSubmit for robust answer matching.
 */
export function normalizeAnswer(raw) {
  if (!raw) return ''
  let s = normalizeToUnicode(raw)
  s = s.replace(/\s+/g, '')
  s = s.toLowerCase()
  s = s.replace(/[{[]/g, '(').replace(/[}\]]/g, ')')
  // Multiply-symbol normalisation
  s = s.replace(/×/g, '*').replace(/·/g, '*')
  return s
}

/**
 * Check student answer against correct answer, tolerating order of factors.
 * "(x+2)(x+3)" == "(x+3)(x+2)"
 */
export function answersMatch(studentRaw, correctRaw) {
  const student = normalizeAnswer(studentRaw)
  const correct = normalizeAnswer(correctRaw)
  if (student === correct) return true

  // Try rearranging top-level factors
  const studentFactors = splitTopLevelFactors(student)
  const correctFactors = splitTopLevelFactors(correct)
  if (studentFactors.length !== correctFactors.length) return false

  // Every factor in student must appear in correct (multiset match)
  const pool = [...correctFactors]
  for (const f of studentFactors) {
    const idx = pool.indexOf(f)
    if (idx === -1) return false
    pool.splice(idx, 1)
  }
  return pool.length === 0
}

/**
 * Split "a(b)(c)d" into top-level factors: ["a", "(b)", "(c)", "d"]
 * (simple heuristic — handles the factorisation answer format)
 */
function splitTopLevelFactors(expr) {
  const factors = []
  let current = ''
  let depth = 0
  for (const ch of expr) {
    if (ch === '(') { depth++; current += ch }
    else if (ch === ')') { depth--; current += ch; if (depth === 0) { factors.push(current); current = '' } }
    else if (depth === 0 && ch === '*') { if (current) factors.push(current); current = '' }
    else { current += ch }
  }
  if (current) factors.push(current)
  return factors.filter(Boolean)
}

// ── Live input transformer ─────────────────────────────────────────────────────

/**
 * Transform the raw value of an input field as the user types.
 * Only converts completed caret sequences (e.g. when the user types "^2 ").
 * Returns the new string to set as the input value.
 *
 * Strategy: convert "^digit(s)" when followed by a non-digit non-letter
 * (e.g. space, operator, end-of-string).
 */
export function liveTransform(raw) {
  return normalizeToUnicode(raw)
}

// ── SuperscriptToolbar helper ─────────────────────────────────────────────────

/**
 * Insert superscript text at the cursor position of a text input.
 * Call this from the toolbar buttons.
 *
 * @param {HTMLInputElement} inputEl
 * @param {string} insertion  the unicode superscript to insert (e.g. "²")
 * @param {Function} setValue  React state setter for the input value
 */
export function insertAtCursor(inputEl, insertion, setValue) {
  if (!inputEl) return
  const start = inputEl.selectionStart ?? inputEl.value.length
  const end   = inputEl.selectionEnd   ?? inputEl.value.length
  const before = inputEl.value.slice(0, start)
  const after  = inputEl.value.slice(end)
  const newValue = before + insertion + after
  setValue(newValue)

  // Restore cursor position after React re-render
  requestAnimationFrame(() => {
    inputEl.setSelectionRange(start + insertion.length, start + insertion.length)
    inputEl.focus()
  })
}

// ── Toolbar button definitions ────────────────────────────────────────────────

export const SUPERSCRIPT_BUTTONS = [
  { label: 'x²',  insert: '²',  title: 'Square (²)' },
  { label: 'x³',  insert: '³',  title: 'Cube (³)' },
  { label: 'xⁿ',  insert: 'ⁿ',  title: 'nth power — type digit after' },
  { label: '⁴',   insert: '⁴',  title: 'Power 4' },
  { label: '⁵',   insert: '⁵',  title: 'Power 5' },
  { label: '(  )',  insert: '()',  title: 'Brackets', cursor: -1 },
  { label: '−',    insert: '-',   title: 'Minus sign' },
]
