import { useEffect, useState } from 'react'
import { getReviewList } from '../utils/storage'

function formatAge(ts) {
  const diff = Date.now() - ts
  const h = Math.floor(diff / 3_600_000)
  if (h < 24) return `${h || 1}時間前`
  return `${Math.floor(diff / 86_400_000)}日前`
}

export default function ReviewList({ onBack, onBattle }) {
  const [list, setList] = useState([])

  useEffect(() => {
    setList([...getReviewList()].reverse())
  }, [])

  const pending = list.filter(w => !w.reviewed).length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px', background: '#16213E',
        borderBottom: '1px solid #233554',
        display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 0,
      }}>
        <button
          onClick={onBack}
          style={{ background: 'none', border: 'none', color: '#8892B0', fontSize: '22px', cursor: 'pointer' }}
        >
          ←
        </button>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '700' }}>📝 復習リスト</h2>
          <p style={{ fontSize: '12px', color: '#8892B0', marginTop: '2px' }}>
            要復習: {pending}語
          </p>
        </div>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        {list.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#8892B0', marginTop: '80px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>✨</div>
            <p style={{ fontSize: '16px' }}>復習リストは空です！</p>
            <p style={{ fontSize: '13px', marginTop: '8px' }}>
              バトルで間違えた単語がここに追加されます
            </p>
          </div>
        ) : (
          list.map(word => (
            <div
              key={word.id}
              style={{
                background: '#16213E',
                border: `1px solid ${word.reviewed ? '#233554' : '#0F3460'}`,
                borderRadius: '12px',
                padding: '14px 16px',
                marginBottom: '10px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <div>
                <div style={{ fontWeight: '700', fontSize: '16px' }}>{word.en}</div>
                <div style={{ color: '#8892B0', fontSize: '13px', marginTop: '2px' }}>{word.ja}</div>
                {word.addedAt && (
                  <div style={{ color: '#8892B0', fontSize: '11px', marginTop: '4px' }}>
                    ⏰ {formatAge(word.addedAt)}
                  </div>
                )}
              </div>
              {word.reviewed ? (
                <span style={{ fontSize: '20px', flexShrink: 0 }}>✅</span>
              ) : (
                <span style={{
                  background: '#E94560', color: '#fff',
                  borderRadius: '8px', padding: '4px 10px',
                  fontSize: '12px', fontWeight: '700', flexShrink: 0,
                }}>
                  要復習
                </span>
              )}
            </div>
          ))
        )}
      </div>

      {/* Battle button */}
      {pending > 0 && (
        <div style={{ padding: '12px 20px 28px', borderTop: '1px solid #233554', flexShrink: 0 }}>
          <button className="btn btn-primary" onClick={onBattle}>
            ⚔️ 復習バトル開始 ({pending}語)
          </button>
        </div>
      )}
    </div>
  )
}
