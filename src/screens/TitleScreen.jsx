import { useEffect, useState } from 'react'
import { getStreak, getReviewList } from '../utils/storage'

export default function TitleScreen({ onStart, onReview }) {
  const [streak, setStreak] = useState(0)
  const [reviewCount, setReviewCount] = useState(0)

  useEffect(() => {
    setStreak(getStreak())
    setReviewCount(getReviewList().filter(w => !w.reviewed).length)
  }, [])

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      minHeight: '100dvh', padding: '32px 28px', gap: '16px',
    }}>
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: '8px' }}>
        <div style={{ fontSize: '72px', lineHeight: 1 }}>⚔️</div>
        <h1 style={{
          fontSize: '38px', fontWeight: '900',
          color: '#E94560', letterSpacing: '-1px', marginTop: '12px',
        }}>
          Word Quest
        </h1>
        <p style={{ fontSize: '17px', color: '#8892B0', marginTop: '4px', fontWeight: '600' }}>
          3 min
        </p>
      </div>

      {/* Streak */}
      <div style={{
        background: '#16213E', border: '1px solid #233554',
        borderRadius: '12px', padding: '12px 28px',
        textAlign: 'center', marginBottom: '4px',
      }}>
        <span style={{ fontSize: '16px' }}>
          🔥 連続プレイ:{' '}
          <strong style={{ color: '#E94560' }}>{streak}日</strong>
        </span>
      </div>

      {/* Buttons */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <button className="btn btn-primary" onClick={onStart}>
          ⚔️ はじめる
        </button>

        <button
          className="btn btn-secondary"
          onClick={onReview}
          style={{ position: 'relative' }}
        >
          📝 復習する
          {reviewCount > 0 && (
            <span style={{
              position: 'absolute', top: '50%', right: '14px',
              transform: 'translateY(-50%)',
              background: '#E94560', color: '#fff',
              borderRadius: '50%', width: '22px', height: '22px',
              fontSize: '12px', fontWeight: '700',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {reviewCount}
            </span>
          )}
        </button>
      </div>

      <p style={{ fontSize: '12px', color: '#8892B0', marginTop: '8px' }}>
        中学英語レベル · 1プレイ3分
      </p>
    </div>
  )
}
