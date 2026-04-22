import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as api from '../services/api';
import './Charities.css';

export default function Charities() {
  const [charities, setCharities] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getCharities()
      .then(r => setCharities(r.data.charities))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = charities.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="charities-page page">
      <div className="container">
        <div className="charities-header">
          <div className="section-label">Giving Back</div>
          <h1>Our Charity Partners</h1>
          <p>Every subscription supports a cause you care about. Choose yours in your dashboard.</p>
        </div>

        <div className="charities-search">
          <input
            placeholder="Search charities…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ maxWidth: '400px' }}
          />
        </div>

        {loading ? <div className="spinner" /> : (
          <>
            {/* Featured */}
            {!search && filtered.some(c => c.featured) && (
              <div className="charities-section">
                <h2 className="charities-section-title">⭐ Featured</h2>
                <div className="charity-cards">
                  {filtered.filter(c => c.featured).map(c => <CharityCard key={c._id} charity={c} />)}
                </div>
              </div>
            )}

            <div className="charities-section">
              {!search && <h2 className="charities-section-title">All Charities</h2>}
              <div className="charity-cards">
                {filtered.filter(c => search || !c.featured).map(c => <CharityCard key={c._id} charity={c} />)}
              </div>
              {filtered.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No charities match your search.</p>}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function CharityCard({ charity: c }) {
  return (
    <Link to={`/charities/${c._id}`} className="charity-card">
      {c.image && (
        <div className="charity-card-img" style={{ backgroundImage: `url(${c.image})` }} />
      )}
      <div className="charity-card-body">
        {c.featured && <span className="badge badge-accent" style={{ marginBottom: '0.5rem' }}>Featured</span>}
        <h3>{c.name}</h3>
        <p>{c.description.slice(0, 120)}{c.description.length > 120 ? '…' : ''}</p>
        {c.events?.length > 0 && (
          <div className="charity-events-hint">
            📅 {c.events.length} upcoming event{c.events.length > 1 ? 's' : ''}
          </div>
        )}
        {c.website && <span className="charity-link">Visit website ↗</span>}
      </div>
    </Link>
  );
}
