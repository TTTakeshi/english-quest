import wordData from '@/shared/data/words'

const CATEGORIES = [
  { id: 'all',    name: 'ランダム全部', icon: '🎲', count: 80 },
  ...wordData.categories.map(c => ({
    id: c.id, name: c.name, icon: c.icon, count: c.words.length,
  })),
]

export default function StageSelect({ onSelect, onBack }) {
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
          style={{
            background: 'none', border: 'none', color: '#8892B0',
            fontSize: '22px', cursor: 'pointer', lineHeight: 1,
          }}
        >
          ←
        </button>
        <h2 style={{ fontSize: '18px', fontWeight: '700' }}>カテゴリを選ぼう</h2>
      </div>

      {/* Grid */}
      <div style={{
        padding: '20px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '14px',
        flex: 1,
        alignContent: 'start',
      }}>
        {CATEGORIES.map(cat => (
          <CategoryCard
            key={cat.id}
            cat={cat}
            onSelect={onSelect}
            wide={cat.id === 'all'}
          />
        ))}
      </div>
    </div>
  )
}

function CategoryCard({ cat, onSelect, wide }) {
  return (
    <button
      onClick={() => onSelect(cat.id)}
      style={{
        gridColumn: wide ? '1 / -1' : 'auto',
        background: '#16213E',
        border: '1px solid #233554',
        borderRadius: '16px',
        padding: wide ? '20px' : '24px 16px',
        color: '#fff',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: wide ? 'row' : 'column',
        alignItems: 'center',
        justifyContent: wide ? 'center' : 'center',
        gap: wide ? '14px' : '8px',
        transition: 'border-color 0.2s, background 0.2s',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = '#E94560'; e.currentTarget.style.background = '#1c2a4a' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = '#233554'; e.currentTarget.style.background = '#16213E' }}
    >
      <span style={{ fontSize: wide ? '32px' : '30px' }}>{cat.icon}</span>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '14px', fontWeight: '700' }}>{cat.name}</div>
        <div style={{ fontSize: '12px', color: '#8892B0', marginTop: '2px' }}>{cat.count}語</div>
      </div>
    </button>
  )
}
