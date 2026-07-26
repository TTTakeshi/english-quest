import { useState } from 'react'
import TitleScreen  from '@/features/title/components/TitleScreen'
import StageSelect  from '@/features/stage-select/components/StageSelect'
import BattleScreen from '@/features/battle/components/BattleScreen'
import ResultScreen from '@/features/results/components/ResultScreen'
import ReviewList   from '@/features/review/components/ReviewList'
import { updateStreak } from '@/shared/lib/storage'

export default function App() {
  const [screen,   setScreen]   = useState('title')
  const [category, setCategory] = useState('all')
  const [result,   setResult]   = useState(null)
  const [battleKey, setBattleKey] = useState(0)

  function goToStageSelect() { setScreen('stage-select') }
  function goToReview()      { setScreen('review') }
  function goToTitle()       { setScreen('title') }

  function handleStageSelect(categoryId) {
    setCategory(categoryId)
    setBattleKey(k => k + 1)
    setScreen('battle')
  }

  function handleGameEnd(gameResult) {
    if (gameResult.correctCount > 0) updateStreak()
    setResult(gameResult)
    setScreen('result')
  }

  function handleRetry() {
    setBattleKey(k => k + 1)
    setScreen('battle')
  }

  function handleReviewBattle() {
    setCategory('review')
    setBattleKey(k => k + 1)
    setScreen('battle')
  }

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', flex: 1 }}>
      {screen === 'title' && (
        <TitleScreen onStart={goToStageSelect} onReview={goToReview} />
      )}

      {screen === 'stage-select' && (
        <StageSelect onSelect={handleStageSelect} onBack={goToTitle} />
      )}

      {screen === 'battle' && (
        <BattleScreen
          key={battleKey}
          categoryId={category}
          onGameEnd={handleGameEnd}
        />
      )}

      {screen === 'result' && result && (
        <ResultScreen
          result={result}
          onRetry={handleRetry}
          onReview={goToReview}
          onHome={goToTitle}
        />
      )}

      {screen === 'review' && (
        <ReviewList onBack={goToTitle} onBattle={handleReviewBattle} />
      )}
    </div>
  )
}
