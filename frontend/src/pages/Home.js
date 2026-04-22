import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as api from '../services/api';
import './Home.css';

export default function Home() {
  const { user, isSubscribed } = useAuth();
  const [charities, setCharities] = useState([]);
  useEffect(() => {
    api.getCharities({ featured: 'true' }).then(r => setCharities(r.data?.charities ?? [])).catch(() => {});
  }, [user]);

  return (
    <div className="home">
      {/* Hero */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="container hero-content">
          <div className="hero-tag">Golf · Giving · Winning</div>
          <h1 className="hero-title">
            Play with<br />
            <em>purpose.</em><br />
            Win with<br />heart.
          </h1>
          <p className="hero-sub">
            Track your Stableford scores. Enter monthly prize draws.
            Support a charity that matters to you. Every subscription does all three.
          </p>
          <div className="hero-ctas">
            {!user ? (
              <>
                <Link to="/register" className="btn btn-primary btn-lg">Start Playing →</Link>
                <Link to="/draws" className="btn btn-outline btn-lg">See Draw Results</Link>
              </>
            ) : !isSubscribed() ? (
              <Link to="/subscribe" className="btn btn-primary btn-lg">Activate Subscription →</Link>
            ) : (
              <Link to="/dashboard" className="btn btn-primary btn-lg">Go to Dashboard →</Link>
            )}
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <span className="hero-stat-num">₹100</span>
              <span className="hero-stat-label">per month</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <span className="hero-stat-num">3</span>
              <span className="hero-stat-label">draw tiers</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <span className="hero-stat-num">10%+</span>
              <span className="hero-stat-label">to charity</span>
            </div>
          </div>
        </div>
        <div className="hero-scroll-hint">↓</div>
      </section>

      {/* How it Works */}
      <section className="section">
        <div className="container">
          <div className="section-label">How It Works</div>
          <h2 className="section-title">Three steps. Real impact.</h2>
          <div className="steps">
            {[
              { num: '01', title: 'Subscribe', desc: 'Monthly or yearly — your subscription fuels the prize pool and charity fund.' },
              { num: '02', title: 'Log Scores', desc: 'Enter your latest Stableford scores. We keep your best 5, always up to date.' },
              { num: '03', title: 'Win & Give', desc: 'Monthly draws match your scores to win prizes. Part of every subscription goes to your chosen charity.' },
            ].map(s => (
              <div className="step-card" key={s.num}>
                <div className="step-num">{s.num}</div>
                <h3 className="step-title">{s.title}</h3>
                <p className="step-desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Draw Tiers */}
      <section className="section section-dark">
        <div className="container">
          <div className="section-label">Prize Structure</div>
          <h2 className="section-title">Match more. Win more.</h2>
          <div className="tiers">
            {[
              { match: '5 Number', pool: '40%', tier: 'Jackpot', rollover: true, glow: true },
              { match: '4 Number', pool: '35%', tier: 'Major', rollover: false, glow: false },
              { match: '3 Number', pool: '25%', tier: 'Entry', rollover: false, glow: false },
            ].map(t => (
              <div className={`tier-card ${t.glow ? 'tier-jackpot' : ''}`} key={t.match}>
                {t.rollover && <div className="tier-ribbon">Jackpot Rolls Over</div>}
                <div className="tier-match">{t.match} Match</div>
                <div className="tier-pool">{t.pool}</div>
                <div className="tier-label">of prize pool</div>
                <div className="tier-name">{t.tier} Prize</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Charity Spotlight */}
      {charities.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-label">Giving Back</div>
            <h2 className="section-title">Featured charities</h2>
            <p className="section-sub">Choose who receives your contribution — or donate independently.</p>
            <div className="charity-grid">
              {charities.slice(0, 3).map(c => (
                <Link to={`/charities/${c._id}`} className="charity-preview" key={c._id}>
                  {c.image && <div className="charity-img" style={{ backgroundImage: `url(${c.image})` }} />}
                  <div className="charity-info">
                    <h4>{c.name}</h4>
                    <p>{c.description?.slice(0, 90)}…</p>
                  </div>
                </Link>
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <Link to="/charities" className="btn btn-outline">View All Charities</Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="section cta-section">
        <div className="container cta-inner">
          <h2>Ready to play with purpose?</h2>
          <p>Join a community where every putt powers change.</p>
          <Link to={user ? '/subscribe' : '/register'} className="btn btn-primary btn-lg">
            {user ? 'Activate Now →' : 'Get Started →'}
          </Link>
        </div>
      </section>
    </div>
  );
}
