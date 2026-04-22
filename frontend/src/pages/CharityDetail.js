// CharityDetail.js
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import * as api from '../services/api';
import PriceFormatter from '../components/shared/PriceFormatter';

export function CharityDetail() {
  const { id } = useParams();
  const [charity, setCharity] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getCharity(id)
      .then(r => setCharity(r.data.charity))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="spinner" />;
  if (!charity) return <div className="page container"><p>Charity not found.</p></div>;

  return (
    <div className="page">
      <div className="container-sm">
        <Link to="/charities" style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'block', marginBottom: '1.5rem' }}>
          ← Back to Charities
        </Link>

        {charity.image && (
          <div style={{ height: '260px', backgroundImage: `url(${charity.image})`, backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: 'var(--radius)', marginBottom: '2rem' }} />
        )}

        <h1 style={{ marginBottom: '0.75rem' }}>{charity.name}</h1>
        <p style={{ color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: '1.5rem' }}>{charity.description}</p>

        {charity.website && (
          <a href={charity.website} target="_blank" rel="noreferrer" className="btn btn-outline" style={{ marginBottom: '2rem', display: 'inline-flex' }}>
            Visit {charity.name} ↗
          </a>
        )}

        {charity.events?.length > 0 && (
          <div>
            <h2 style={{ marginBottom: '1rem' }}>Upcoming Events</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {charity.events.map((e, i) => (
                <div key={i} className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ background: 'var(--accent-dim)', borderRadius: '8px', padding: '0.5rem 0.75rem', textAlign: 'center', minWidth: '56px' }}>
                    <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--accent)', lineHeight: 1 }}>
                      {format(new Date(e.date), 'dd')}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--accent)', textTransform: 'uppercase' }}>
                      {format(new Date(e.date), 'MMM')}
                    </div>
                  </div>
                  <div>
                    <strong>{e.title}</strong>
                    {e.description && <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>{e.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ marginTop: '2.5rem', padding: '1.5rem', background: 'var(--bg-card)', border: '1px solid var(--accent)', borderRadius: 'var(--radius)' }}>
          <h3 style={{ marginBottom: '0.5rem' }}>Support this charity</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.9rem' }}>
            Subscribe to GolfHeroes and choose this charity to receive a portion of your monthly subscription.
          </p>
          <Link to="/subscribe" className="btn btn-primary">Subscribe & Support →</Link>
        </div>
      </div>
    </div>
  );
}

// DrawsPage.js
export function DrawsPage() {
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
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>Draw Results</h1>
          <p style={{ color: 'var(--text-muted)' }}>Monthly draws matching your Stableford scores.</p>
        </div>

        {draws.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <h3 style={{ marginBottom: '0.75rem' }}>No draws published yet</h3>
            <p style={{ color: 'var(--text-muted)' }}>Check back after the first monthly draw.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {draws.map(d => (
              <div key={d._id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div>
                    <h2 style={{ marginBottom: '0.25rem' }}>
                      {new Date(d.year, d.month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </h2>
                    <span className="badge badge-green">Published</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Total Prize Pool</div>
                    <div style={{ fontFamily: 'Bebas Neue', fontSize: '1.6rem', color: 'var(--accent)' }}><PriceFormatter amount={d.prizePool?.total || 0} /></div>
                  </div>
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Winning Numbers</div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {d.drawNumbers.map(n => (
                      <span key={n} style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: 44, height: 44, background: 'var(--accent)', color: '#0a0a0f',
                        borderRadius: '50%', fontWeight: 700, fontSize: '0.95rem'
                      }}>{n}</span>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1rem' }}>
                  {['5-match', '4-match', '3-match'].map(type => {
                    const w = d.winners?.filter(w => w.matchType === type) || [];
                    const pool = type === '5-match' ? d.prizePool?.fiveMatch : type === '4-match' ? d.prizePool?.fourMatch : d.prizePool?.threeMatch;
                    return (
                      <div key={type} style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', padding: '0.875rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.25rem' }}>{type}</div>
                        <div style={{ fontFamily: 'Bebas Neue', fontSize: '1.4rem', color: type === '5-match' ? 'var(--gold)' : 'var(--text)' }}><PriceFormatter amount={pool || 0} /></div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{w.length} winner{w.length !== 1 ? 's' : ''}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
