import { useState } from 'react'
import TitleScreen  from './screens/TitleScreen'
import StageSelect  from './screens/StageSelect'
import BattleScreen from './screens/BattleScreen'
import ResultScreen from './screens/ResultScreen'
import ReviewList   from './screens/ReviewList'
import { updateStreak } from './utils/storage'

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
