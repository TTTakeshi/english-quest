import { useState, useEffect, useRef } from 'react'
import { generateQuestion } from '@/shared/utils/questions'
import { addToReview, getReviewList } from '@/shared/lib/storage'
import wordData, { allWords } from '@/shared/data/words'

// ── Constants ────────────────────────────────────────────
const TOTAL_TIME       = 180
const BOSS_TRIGGER     = 30
const PLAYER_MAX_HP    = 100
const ENEMY_MAX_HP     = 200
const DMG_ON_CORRECT   = 50
const DMG_ON_WRONG     = 20
const HEAL_AMOUNT      = 20

const COMBO_MULTIPLIER = { 3: 1.5, 5: 2.0, 8: 3.0, 10: 5.0 }

function getMultiplier(combo) {
  if (combo >= 10) return 5.0
  if (combo >= 8)  return 3.0
  if (combo >= 5)  return 2.0
  if (combo >= 3)  return 1.5
  return 1.0
}

function formatTime(secs) {
  return `${String(Math.floor(secs / 60)).padStart(2, '0')}:${String(secs % 60).padStart(2, '0')}`
}

// ── Sub-components ───────────────────────────────────────
function HPBar({ label, current, max, color }) {
  const pct = Math.max(0, Math.min(100, (current / max) * 100))
  return (
    <div style={{ marginBottom: '6px' }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        fontSize: '11px', color: '#8892B0', marginBottom: '4px',
      }}>
        <span>{label}</span>
        <span>{Math.round(current)}/{max}</span>
      </div>
      <div style={{ height: '8px', background: '#233554', borderRadius: '4px', overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${pct}%`,
          background: color, borderRadius: '4px',
          transition: 'width 0.35s ease',
        }} />
      </div>
    </div>
  )
}

// ── Main Component ───────────────────────────────────────
export default function BattleScreen({ categoryId, onGameEnd }) {
  // Build word pool
  const words = (() => {
    if (categoryId === 'all') return wordData.categories.flatMap(c => c.words)
    if (categoryId === 'review') {
      const pending = getReviewList().filter(w => !w.reviewed)
      return pending.length >= 4 ? pending : wordData.categories.flatMap(c => c.words)
    }
    return wordData.categories.find(c => c.id === categoryId)?.words
        ?? wordData.categories.flatMap(c => c.words)
  })()

  // ── State ──────────────────────────────────────────────
  const [playerHP, setPlayerHP]       = useState(PLAYER_MAX_HP)
  const [enemyHP,  setEnemyHP]        = useState(ENEMY_MAX_HP)
  const [timeLeft, setTimeLeft]       = useState(TOTAL_TIME)
  const [combo,    setCombo]          = useState(0)
  const [maxCombo, setMaxCombo]       = useState(0)
  const [score,    setScore]          = useState(0)
  const [question, setQuestion]       = useState(null)
  const [choices,  setChoices]        = useState([])
  const [feedback, setFeedback]       = useState(null)   // { type, damage, skill }
  const [hintsLeft, setHintsLeft]     = useState(1)
  const [skillEffect, setSkillEffect] = useState(null)   // 'fireSlash' | 'heal'
  const [isBoss,   setIsBoss]         = useState(false)
  const [gameEnded, setGameEnded]     = useState(false)
  const [bossAlert, setBossAlert]     = useState(false)

  // ── Refs (for use inside async callbacks) ──────────────
  const playerHPRef   = useRef(PLAYER_MAX_HP)
  const enemyHPRef    = useRef(ENEMY_MAX_HP)
  const scoreRef      = useRef(0)
  const maxComboRef   = useRef(0)
  const comboRef      = useRef(0)
  const timeLeftRef   = useRef(TOTAL_TIME)
  const gameEndedRef  = useRef(false)
  const wrongWordsRef = useRef([])
  const learnedRef    = useRef([])

  // ── Question loader ────────────────────────────────────
  function loadQuestion(bossPhase) {
    const q = generateQuestion(words, allWords, bossPhase)
    setQuestion(q)
    setChoices(q.choices)
  }

  // ── Mount ──────────────────────────────────────────────
  useEffect(() => { loadQuestion(false) }, [])

  // ── Timer ──────────────────────────────────────────────
  useEffect(() => {
    const id = setInterval(() => {
      setTimeLeft(t => {
        const next = t - 1
        timeLeftRef.current = next
        return next
      })
    }, 1000)
    return () => clearInterval(id)
  }, [])

  // ── Watch timeLeft ─────────────────────────────────────
  useEffect(() => {
    if (gameEndedRef.current) return
    if (timeLeft === 0) {
      endGame('timeout')
    } else if (timeLeft === BOSS_TRIGGER) {
      setIsBoss(true)
      setBossAlert(true)
      setTimeout(() => setBossAlert(false), 2500)
    }
  }, [timeLeft])

  // ── End game ───────────────────────────────────────────
  function endGame(status) {
    if (gameEndedRef.current) return
    gameEndedRef.current = true
    setGameEnded(true)

    setTimeout(() => {
      onGameEnd({
        victory:      status === 'victory',
        defeat:       status === 'defeat',
        score:        scoreRef.current,
        maxCombo:     maxComboRef.current,
        correctCount: learnedRef.current.length,
        wrongCount:   wrongWordsRef.current.length,
        wrongWords:   wrongWordsRef.current,
        learnedWords: learnedRef.current.slice(-3),
      })
    }, status === 'victory' ? 1200 : 700)
  }

  // ── Answer handler ─────────────────────────────────────
  function handleAnswer(choice) {
    if (feedback || gameEndedRef.current || !question) return

    const isCorrect = choice === question.answer

    if (isCorrect) {
      const newCombo   = comboRef.current + 1
      const mult       = getMultiplier(newCombo)
      const dmg        = Math.round(DMG_ON_CORRECT * mult)
      const newScore   = scoreRef.current + dmg * 10
      const newMaxC    = Math.max(maxComboRef.current, newCombo)
      const newEnemyHP = Math.max(0, enemyHPRef.current - dmg)

      comboRef.current   = newCombo
      scoreRef.current   = newScore
      maxComboRef.current = newMaxC
      enemyHPRef.current  = newEnemyHP

      setCombo(newCombo)
      setScore(newScore)
      setMaxCombo(newMaxC)
      setEnemyHP(newEnemyHP)

      // Track learned word
      if (question.wordData) {
        const already = learnedRef.current.find(w => w.id === question.wordData.id)
        if (!already) learnedRef.current = [...learnedRef.current, question.wordData]
      }

      // Skills
      let skillText = null
      if (newCombo === 3) {
        skillText = '🔥 Fire Slash!'
        setSkillEffect('fireSlash')
      } else if (newCombo === 5) {
        skillText = '💚 Heal!'
        setSkillEffect('heal')
        const healed = Math.min(PLAYER_MAX_HP, playerHPRef.current + HEAL_AMOUNT)
        playerHPRef.current = healed
        setPlayerHP(healed)
      }

      setFeedback({ type: 'correct', damage: dmg, combo: newCombo, skill: skillText, correct: question.answer })

      if (newEnemyHP <= 0) {
        setTimeout(() => endGame('victory'), 900)
        return
      }
    } else {
      comboRef.current = 0
      const newPlayerHP = Math.max(0, playerHPRef.current - DMG_ON_WRONG)
      playerHPRef.current = newPlayerHP

      setCombo(0)
      setPlayerHP(newPlayerHP)

      if (question.wordData) {
        addToReview(question.wordData)
        const already = wrongWordsRef.current.find(w => w.id === question.wordData.id)
        if (!already) wrongWordsRef.current = [...wrongWordsRef.current, question.wordData]
      }

      setFeedback({ type: 'wrong', damage: DMG_ON_WRONG, correct: question.answer })

      if (newPlayerHP <= 0) {
        setTimeout(() => endGame('defeat'), 700)
        return
      }
    }

    // Next question after delay
    setTimeout(() => {
      if (gameEndedRef.current) return
      setFeedback(null)
      setSkillEffect(null)
      loadQuestion(timeLeftRef.current <= BOSS_TRIGGER)
    }, 1300)
  }

  // ── Focus skill (reduce to 2 choices) ─────────────────
  function handleFocus() {
    if (hintsLeft <= 0 || !question || feedback || gameEndedRef.current) return
    setHintsLeft(0)
    const wrong = question.choices.find(c => c !== question.answer)
    if (!wrong) return
    const pair = [question.answer, wrong]
    if (Math.random() < 0.5) pair.reverse()
    setChoices(pair)
  }

  // ── Derived UI values ──────────────────────────────────
  const timerColor = timeLeft <= 30 ? '#E94560' : timeLeft <= 60 ? '#FF9800' : '#4CAF50'
  const enemyIcon  = isBoss ? '🐉' : '👾'
  const enemyName  = isBoss ? 'ドラゴン' : 'スライム'

  if (!question) {
    return (
      <div style={{
        display: 'flex', justifyContent: 'center',
        alignItems: 'center', minHeight: '100dvh', color: '#8892B0',
      }}>
        読み込み中...
      </div>
    )
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: '100dvh', overflow: 'hidden', userSelect: 'none',
    }}>
      {/* ── TOP: Timer + Score ────────────────────────── */}
      <div style={{
        padding: '10px 20px', background: '#16213E',
        borderBottom: '1px solid #233554',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexShrink: 0,
      }}>
        <span style={{
          fontSize: '22px', fontWeight: '900', color: timerColor,
          fontVariantNumeric: 'tabular-nums', transition: 'color 0.5s',
        }}>
          ⏱ {formatTime(timeLeft)}
        </span>
        <span style={{ fontSize: '14px', color: '#8892B0' }}>
          🏆 {score.toLocaleString()}pt
        </span>
      </div>

      {/* ── HP Bars ───────────────────────────────────── */}
      <div style={{
        padding: '10px 20px 8px', background: '#16213E',
        borderBottom: '1px solid #233554', flexShrink: 0,
      }}>
        <HPBar label="⚔️ じぶん" current={playerHP} max={PLAYER_MAX_HP} color="#4CAF50" />
        <HPBar label={`${enemyIcon} ${enemyName}`} current={enemyHP} max={ENEMY_MAX_HP} color="#E94560" />
      </div>

      {/* ── Boss alert banner ─────────────────────────── */}
      {(bossAlert || isBoss) && (
        <div style={{
          background: '#E94560', color: '#fff',
          textAlign: 'center', padding: '5px',
          fontSize: '12px', fontWeight: '700', letterSpacing: '3px',
          flexShrink: 0,
          animation: bossAlert ? 'pulse 0.6s ease infinite' : 'none',
        }}>
          ⚔️ BOSS BATTLE ⚔️
        </div>
      )}

      {/* ── Enemy + Feedback ──────────────────────────── */}
      <div style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '10px 20px', flexShrink: 0,
        minHeight: '130px', gap: '6px', position: 'relative',
      }}>
        {/* Skill flash */}
        {skillEffect === 'fireSlash' && (
          <div style={{
            position: 'absolute', top: '8px', left: 0, right: 0,
            textAlign: 'center',
            fontSize: '18px', fontWeight: '900', color: '#E94560',
            animation: 'bounceIn 0.4s ease',
          }}>
            🔥 Fire Slash! CRITICAL HIT!
          </div>
        )}
        {skillEffect === 'heal' && (
          <div style={{
            position: 'absolute', top: '8px', left: 0, right: 0,
            textAlign: 'center',
            fontSize: '16px', fontWeight: '900', color: '#4CAF50',
            animation: 'bounceIn 0.4s ease',
          }}>
            💚 Heal! +{HEAL_AMOUNT}HP
          </div>
        )}

        <span style={{
          fontSize: '52px', lineHeight: 1,
          filter: gameEnded ? 'grayscale(1)' : 'none',
          transition: 'filter 0.3s',
        }}>
          {enemyIcon}
        </span>

        {feedback ? (
          <div style={{ textAlign: 'center', animation: 'slideUp 0.3s ease' }}>
            {feedback.type === 'correct' ? (
              <>
                <div style={{ fontSize: '18px', fontWeight: '900', color: '#4CAF50' }}>
                  ✨ CORRECT! −{feedback.damage}dmg
                </div>
                {feedback.combo > 1 && (
                  <div style={{ fontSize: '13px', color: '#FF9800', marginTop: '2px' }}>
                    🔥 Combo x{feedback.combo}!
                  </div>
                )}
              </>
            ) : (
              <>
                <div style={{ fontSize: '18px', fontWeight: '900', color: '#F44336' }}>
                  ❌ WRONG! −{feedback.damage}HP
                </div>
                <div style={{ fontSize: '13px', color: '#8892B0', marginTop: '3px' }}>
                  正解: <strong style={{ color: '#fff' }}>{feedback.correct}</strong>
                </div>
              </>
            )}
          </div>
        ) : (
          <div style={{
            fontSize: '13px',
            color: combo > 1 ? '#FF9800' : 'transparent',
          }}>
            🔥 Combo x{combo}
          </div>
        )}
      </div>

      {/* ── Question ──────────────────────────────────── */}
      <div style={{
        padding: '10px 20px 12px', textAlign: 'center',
        borderTop: '1px solid #233554', flexShrink: 0,
      }}>
        <p style={{ fontSize: '20px', fontWeight: '700', lineHeight: 1.5 }}>
          {question.prompt}
        </p>
      </div>

      {/* ── Choices ───────────────────────────────────── */}
      <div style={{
        padding: '0 20px',
        display: 'grid',
        gridTemplateColumns: choices.length === 2 ? '1fr 1fr' : '1fr 1fr',
        gap: '10px',
        flex: 1,
        alignContent: 'start',
        overflow: 'hidden',
      }}>
        {choices.map((choice, i) => {
          const isCorrectHL = !!feedback && choice === question.answer
          return (
            <button
              key={`${choice}-${i}`}
              onClick={() => handleAnswer(choice)}
              disabled={!!feedback || gameEnded}
              style={{
                padding: '16px 12px',
                border: `1px solid ${isCorrectHL ? '#4CAF50' : '#233554'}`,
                borderRadius: '12px',
                background: isCorrectHL ? '#1B5E20' : '#16213E',
                color: isCorrectHL ? '#4CAF50' : '#fff',
                fontSize: '16px', fontWeight: '600',
                cursor: (feedback || gameEnded) ? 'not-allowed' : 'pointer',
                opacity: (feedback && !isCorrectHL) ? 0.45 : 1,
                transition: 'all 0.2s',
              }}
            >
              {choice}
            </button>
          )
        })}
      </div>

      {/* ── Bottom: MaxCombo + Focus ───────────────────── */}
      <div style={{
        padding: '10px 20px 20px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        borderTop: '1px solid #233554', flexShrink: 0,
      }}>
        <span style={{
          fontSize: '13px',
          color: maxCombo > 0 ? '#FF9800' : 'transparent',
        }}>
          MAX x{maxCombo}
        </span>

        <button
          onClick={handleFocus}
          disabled={hintsLeft <= 0 || !!feedback || gameEnded}
          style={{
            background: hintsLeft > 0 ? '#0F3460' : 'transparent',
            border: `1px solid ${hintsLeft > 0 ? '#2196F3' : '#233554'}`,
            borderRadius: '8px',
            color: hintsLeft > 0 ? '#2196F3' : '#8892B0',
            padding: '8px 16px', fontSize: '13px', fontWeight: '600',
            cursor: (hintsLeft <= 0 || feedback || gameEnded) ? 'not-allowed' : 'pointer',
            transition: 'opacity 0.2s',
          }}
        >
          💡 Focus {hintsLeft > 0 ? '×1' : '(使用済)'}
        </button>
      </div>
    </div>
  )
}
