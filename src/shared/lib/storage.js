const REVIEW_KEY = 'wq_review'
const STREAK_KEY = 'wq_streak'

// ── Review list ────────────────────────────────────────
export function getReviewList() {
  try {
    return JSON.parse(localStorage.getItem(REVIEW_KEY) || '[]')
  } catch {
    return []
  }
}

export function addToReview(word) {
  const list = getReviewList()
  const idx = list.findIndex(w => w.id === word.id)
  const entry = { ...word, addedAt: Date.now(), reviewed: false }
  if (idx >= 0) {
    list[idx] = entry
  } else {
    list.push(entry)
  }
  localStorage.setItem(REVIEW_KEY, JSON.stringify(list))
}

export function markReviewed(wordId) {
  const list = getReviewList()
  const idx = list.findIndex(w => w.id === wordId)
  if (idx >= 0) {
    list[idx].reviewed = true
    list[idx].reviewedAt = Date.now()
    localStorage.setItem(REVIEW_KEY, JSON.stringify(list))
  }
}

// ── Streak ─────────────────────────────────────────────
export function getStreak() {
  try {
    const raw = localStorage.getItem(STREAK_KEY)
    if (!raw) return 0
    const data = JSON.parse(raw)
    const today = new Date().toDateString()
    const yesterday = new Date(Date.now() - 86_400_000).toDateString()
    if (data.lastDate === today || data.lastDate === yesterday) return data.count
    return 0
  } catch {
    return 0
  }
}

export function updateStreak() {
  try {
    const today = new Date().toDateString()
    const yesterday = new Date(Date.now() - 86_400_000).toDateString()
    const raw = localStorage.getItem(STREAK_KEY)
    const data = raw ? JSON.parse(raw) : { count: 0, lastDate: '' }
    if (data.lastDate === today) return
    const newCount = data.lastDate === yesterday ? data.count + 1 : 1
    localStorage.setItem(STREAK_KEY, JSON.stringify({ count: newCount, lastDate: today }))
  } catch { /* ignore */ }
}
