export default function ResultScreen({ result, onRetry, onReview, onHome }) {
  const {
    victory, defeat,
    score = 0, maxCombo = 0,
    correctCount = 0, wrongCount = 0,
    wrongWords = [], learnedWords = [],
  } = result

  const total = correctCount + wrongCount
  const accuracy = total > 0 ? Math.round((correctCount / total) * 100) : 0

  const headerData = victory
    ? { icon: '🎉', label: 'クリア！',    color: '#4CAF50' }
    : defeat
    ? { icon: '💀', label: 'GAME OVER', color: '#F44336' }
    : { icon: '⏰', label: '時間切れ',   color: '#FF9800' }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      minHeight: '100dvh', padding: '24px 20px 32px',
      gap: '16px', overflowY: 'auto',
    }}>
      {/* Result heading */}
      <div style={{ textAlign: 'center', padding: '8px 0 4px' }}>
        <div style={{ fontSize: '52px', lineHeight: 1 }}>{headerData.icon}</div>
        <h2 style={{
          fontSize: '28px', fontWeight: '900',
          color: headerData.color, marginTop: '10px',
        }}>
          {headerData.label}
        </h2>
        {defeat && (
          <p style={{ color: '#8892B0', marginTop: '4px', fontSize: '14px' }}>HPがなくなった…</p>
        )}
      </div>

      {/* Stats grid */}
      <div style={{
        background: '#16213E', borderRadius: '16px',
        padding: '20px', display: 'grid',
        gridTemplateColumns: '1fr 1fr', gap: '16px',
      }}>
        <Stat label="スコア"     value={`${score.toLocaleString()}pt`} color="#E94560" />
        <Stat label="正答率"     value={`${accuracy}%`}               color="#4CAF50" />
        <Stat label="最大コンボ" value={`x${maxCombo}`}               color="#FF9800" />
        <Stat label="正解数"     value={`${correctCount}問`}          color="#2196F3" />
      </div>

      {/* Learned words */}
      {learnedWords.length > 0 && (
        <WordCard title="📚 今日覚えた単語" words={learnedWords} accent="#4CAF50" />
      )}

      {/* Review words */}
      {wrongWords.length > 0 && (
        <div style={{ background: '#16213E', borderRadius: '16px', padding: '16px' }}>
          <h3 style={{ fontSize: '13px', color: '#8892B0', marginBottom: '10px' }}>
            📝 要復習 ({wrongWords.length}語)
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {wrongWords.map(w => (
              <span key={w.id} style={{
                background: '#233554', borderRadius: '8px',
                padding: '4px 10px', fontSize: '13px',
              }}>
                {w.en}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: 'auto', paddingTop: '4px' }}>
        <button className="btn btn-primary" onClick={onRetry}>🔄 もう一度</button>
        {wrongWords.length > 0 && (
          <button className="btn btn-secondary" onClick={onReview}>📝 復習する</button>
        )}
        <button className="btn btn-secondary" onClick={onHome}>🏠 ホームへ</button>
      </div>
    </div>
  )
}

function Stat({ label, value, color }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '22px', fontWeight: '900', color }}>{value}</div>
      <div style={{ fontSize: '12px', color: '#8892B0', marginTop: '3px' }}>{label}</div>
    </div>
  )
}

function WordCard({ title, words }) {
  return (
    <div style={{ background: '#16213E', borderRadius: '16px', padding: '16px' }}>
      <h3 style={{ fontSize: '13px', color: '#8892B0', marginBottom: '10px' }}>{title}</h3>
      {words.map((w, i) => (
        <div key={w.id ?? i} style={{
          display: 'flex', justifyContent: 'space-between',
          padding: '8px 0',
          borderBottom: i < words.length - 1 ? '1px solid #233554' : 'none',
        }}>
          <span style={{ fontWeight: '700' }}>{w.en}</span>
          <span style={{ color: '#8892B0' }}>{w.ja}</span>
        </div>
      ))}
    </div>
  )
}
