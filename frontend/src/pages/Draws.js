import React, { useEffect, useState } from 'react';
import * as api from '../services/api';
import PriceFormatter from '../components/shared/PriceFormatter';

export default function Draws() {
  const [draws, setDraws] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getDraws()
      .then(r => setDraws(r.data.draws))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner" />;

  return (
    <div className="page">
      <div className="container">
        <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
          <div className="section-label">Results</div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>Monthly Draw Results</h1>
          <p style={{ color: 'var(--text-muted)' }}>Match your Stableford scores to win. Draws run every month.</p>
        </div>

        {draws.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <h3 style={{ marginBottom: '0.75rem' }}>No draws published yet</h3>
            <p style={{ color: 'var(--text-muted)' }}>Check back after the first monthly draw is published by our admin.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {draws.map(d => (
              <div key={d._id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div>
                    <h2 style={{ marginBottom: '0.25rem' }}>
                      {new Date(d.year, d.month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </h2>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <span className="badge badge-green">Published</span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{d.drawLogic} draw · {d.activeSubscribers} subscribers</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total Pool</div>
                    <div style={{ fontFamily: 'Bebas Neue', fontSize: '2rem', color: 'var(--accent)', lineHeight: 1 }}>
                      <PriceFormatter amount={d.prizePool?.total || 0} />
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Winning Numbers
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {d.drawNumbers.map(n => (
                      <span key={n} style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: 48, height: 48,
                        background: 'var(--accent)', color: '#0a0a0f',
                        borderRadius: '50%', fontWeight: 800, fontSize: '1rem',
                        boxShadow: '0 0 12px rgba(200,241,53,0.3)'
                      }}>{n}</span>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                  {[
                    { type: '5-match', label: 'Jackpot', pool: d.prizePool?.fiveMatch, color: 'var(--gold)' },
                    { type: '4-match', label: 'Major', pool: d.prizePool?.fourMatch, color: 'var(--text)' },
                    { type: '3-match', label: 'Entry', pool: d.prizePool?.threeMatch, color: 'var(--text)' },
                  ].map(({ type, label, pool, color }) => {
                    const winners = d.winners?.filter(w => w.matchType === type) || [];
                    return (
                      <div key={type} style={{
                        background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)',
                        padding: '1rem', textAlign: 'center',
                        border: type === '5-match' && winners.length > 0 ? '1px solid var(--gold)' : '1px solid transparent'
                      }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.3rem' }}>{label}</div>
                        <div style={{ fontFamily: 'Bebas Neue', fontSize: '1.5rem', color, lineHeight: 1, marginBottom: '0.25rem' }}>
                          <PriceFormatter amount={pool || 0} />
                        </div>
                        <div style={{ fontSize: '0.78rem', color: winners.length > 0 ? 'var(--green)' : 'var(--text-muted)' }}>
                          {winners.length > 0 ? `${winners.length} winner${winners.length > 1 ? 's' : ''}` : 'No winners'}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {d.prizePool?.rolledOver > 0 && (
                  <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'var(--gold-dim)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', color: 'var(--gold)' }}>
                    ⚡ <PriceFormatter amount={d.prizePool.rolledOver} /> jackpot rolled over from previous month
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
