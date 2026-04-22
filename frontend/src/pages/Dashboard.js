import React, { useEffect, useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { format, differenceInDays } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import * as api from '../services/api';
import PriceFormatter from '../components/shared/PriceFormatter';
import Modal from '../components/shared/Modal';
import './Dashboard.css';

export default function Dashboard() {
  const { user, refreshUser, isSubscribed } = useAuth();
  const [searchParams] = useSearchParams();
  const [scores, setScores] = useState([]);
  const [draw, setDraw] = useState(null);
  const [myResults, setMyResults] = useState([]);
  const [allDraws, setAllDraws] = useState([]);
  const [charities, setCharities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scoreForm, setScoreForm] = useState({ score: '', date: '' });
  const [editingScore, setEditingScore] = useState(null);
  const [editForm, setEditForm] = useState({ score: '', date: '' });
  const [activeTab, setActiveTab] = useState('overview');

  // Modal states
  const [modalType, setModalType] = useState(null); // 'delete' or 'cancel'
  const [selectedScoreId, setSelectedScoreId] = useState(null);

  useEffect(() => {
    if (searchParams.get('subscribed') === 'true') {
      toast.success('Subscription activated! Welcome to GolfHeroes Pro!');
      refreshUser();
    }
  }, [searchParams, refreshUser]);

  useEffect(() => {
    const load = async () => {
      try {
        const [sc, ch] = await Promise.all([
          api.getMyScores(),
          api.getCharities(),
        ]);
        setScores(sc.data?.entries ?? []);
        setCharities(ch.data?.charities ?? []);
        if (isSubscribed()) {
          const [dr, mr, ad] = await Promise.all([
            api.getUpcomingDraw(), 
            api.getMyResults(),
            api.getDraws()
          ]);
          setDraw(dr.data?.draw ?? null);
          setMyResults(mr.data?.draws ?? []);
          setAllDraws(ad.data?.draws ?? []);
        }
      } catch (err) {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isSubscribed]);

  const handleAddScore = async (e) => {
    e.preventDefault();
    try {
      const res = await api.addScore({ score: parseInt(scoreForm.score), date: scoreForm.date });
      setScores(res.data.entries);
      setScoreForm({ score: '', date: '' });
      toast.success('Score added!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to add score'); }
  };

  const handleUpdateScore = async (entryId) => {
    try {
      const res = await api.updateScore(entryId, { score: parseInt(editForm.score), date: editForm.date });
      setScores(res.data.entries);
      setEditingScore(null);
      toast.success('Score updated!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to update score'); }
  };

  const handleDeleteScore = async () => {
    if (!selectedScoreId) return;
    try {
      const res = await api.deleteScore(selectedScoreId);
      setScores(res.data.entries);
      toast.success('Score deleted');
    } catch (err) { toast.error('Failed to delete score'); }
    setModalType(null);
  };

  const handleUpdateCharity = async (charityId, percentage) => {
    try {
      await api.updateCharity({ charityId, charityPercentage: parseInt(percentage) });
      await refreshUser();
      toast.success('Charity preference updated!');
    } catch (err) { toast.error('Failed to update charity'); }
  };

  const handleCancelSub = async () => {
    try {
      await api.cancelSubscription();
      await refreshUser();
      toast.success('Subscription cancelled. Access continues until billing period ends.');
    } catch (err) { toast.error('Failed to cancel subscription'); }
    setModalType(null);
  };

  const subStats = useMemo(() => {
    if (!user?.subscriptionEndDate || !isSubscribed()) return null;
    const end = new Date(user.subscriptionEndDate);
    const start = new Date(user.subscriptionStartDate || new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000));
    const total = differenceInDays(end, start);
    const left = differenceInDays(end, new Date());
    const pct = Math.max(0, Math.min(100, (left / total) * 100));
    return { left, pct, end };
  }, [user, isSubscribed]);

  if (loading) return <div className="spinner" />;

  const subStatus = user?.subscriptionStatus;

  return (
    <div className="dashboard page">
      <div className="container">
        <div className="dash-header">
          <div>
            <h1>Hello, {user?.name?.split(' ')[0]}</h1>
            <p className="dash-sub">
              {isSubscribed() ? 'You\'re in — track, draw, give.' : 'Subscribe to unlock all features.'}
            </p>
          </div>
          {!isSubscribed() && (
            <Link to="/subscribe" className="btn btn-primary glow-accent">Activate Subscription →</Link>
          )}
        </div>

        {/* Status strip */}
        <div className="status-strip">
          <div className="status-tile">
            <span className="status-label">Subscription</span>
            <span className={`badge ${isSubscribed() ? 'badge-green' : 'badge-red'}`}>
              {isSubscribed() ? 'Active' : subStatus || 'Inactive'}
            </span>
            {subStats && (
              <>
                <span className="status-date">Renews {format(subStats.end, 'dd MMM yyyy')}</span>
                <div className="progress-container">
                  <div className="progress-fill" style={{ width: `${subStats.pct}%` }} />
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{subStats.left} days left</span>
              </>
            )}
          </div>
          <div className="status-tile">
            <span className="status-label">Scores Logged</span>
            <span className="status-val">{scores.length} / 5</span>
          </div>
          <div className="status-tile">
            <span className="status-label">Total Won</span>
            <span className="status-val accent"><PriceFormatter amount={user?.totalWon || 0} /></span>
          </div>
          <div className="status-tile">
            <span className="status-label">Charity</span>
            <span className="status-val">{user?.selectedCharity?.name || 'Not selected'}</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="dash-tabs">
          {['overview', 'scores', 'draws', 'charity', 'settings'].map(tab => (
            <button key={tab} className={`dash-tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === 'overview' && (
          <div className="dash-content">
            <div className="grid-2">
              <div className="card">
                <h3 className="card-title">Recent Scores</h3>
                {scores.length === 0 ? (
                  <p className="empty-msg">No scores yet. {isSubscribed() ? 'Add your first score below.' : 'Subscribe to log scores.'}</p>
                ) : (
                  <div className="score-list">
                    {scores.slice(0, 3).map(s => (
                      <div className="score-row" key={s._id}>
                        <span className="score-date">{format(new Date(s.date), 'dd MMM yyyy')}</span>
                        <span className="score-val">{s.score} pts</span>
                      </div>
                    ))}
                  </div>
                )}
                <button className="btn btn-ghost btn-sm" style={{ marginTop: '0.75rem' }} onClick={() => setActiveTab('scores')}>
                  View all →
                </button>
              </div>

              <div className={`card ${!isSubscribed() ? 'locked-overlay' : ''}`}>
                <div className={!isSubscribed() ? 'blur-content' : ''}>
                  <h3 className="card-title">Next Draw</h3>
                  {draw ? (
                    <div>
                      <div className="draw-month">{new Date(draw.year, draw.month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}</div>
                      <div className="draw-pool">Est. Prize Pool: <strong><PriceFormatter amount={draw.prizePool?.total || 0} /></strong></div>
                      <div className={`badge ${draw.status === 'published' ? 'badge-green' : 'badge-accent'}`} style={{ marginTop: '0.5rem' }}>
                        {draw.status}
                      </div>
                    </div>
                  ) : (
                    <p className="empty-msg">No draw scheduled yet for this month.</p>
                  )}
                </div>
                {!isSubscribed() && (
                  <div className="locked-cta">
                    <div className="locked-marker">LOCKED FEATURE</div>
                    <div className="locked-text">Subscribe to view upcoming draws and prize pools.</div>
                    <Link to="/subscribe" className="btn btn-primary btn-sm">Subscribe to Unlock</Link>
                  </div>
                )}
              </div>

              {myResults.length > 0 && (
                <div className="card">
                  <h3 className="card-title">Your Winnings</h3>
                  {myResults.slice(0, 3).map(d => {
                    const win = d.winners.find(w => w.user === user._id || w.user?._id === user._id || w.user?.toString() === user._id);
                    return win ? (
                      <div className="win-row" key={d._id}>
                        <span>{new Date(d.year, d.month - 1).toLocaleString('default', { month: 'short', year: 'numeric' })}</span>
                        <span className="badge badge-gold">{win.matchType}</span>
                        <span><PriceFormatter amount={win.prizeAmount || 0} /></span>
                        <span className={`badge ${win.paymentStatus === 'paid' ? 'badge-green' : 'badge-muted'}`}>{win.paymentStatus}</span>
                      </div>
                    ) : null;
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Scores */}
        {activeTab === 'scores' && (
          <div className="dash-content">
            <div className="card">
              <h3 className="card-title">My Scores <span className="card-subtitle">(Latest 5 — Stableford format, 1–45)</span></h3>
              
              <div className={`score-add-section ${!isSubscribed() ? 'locked-overlay' : ''}`} style={{ paddingBottom: !isSubscribed() ? '2rem' : 0 }}>
                <div className={!isSubscribed() ? 'blur-content' : ''}>
                  <form className="score-add-form" onSubmit={handleAddScore}>
                    <div className="score-add-inputs">
                      <div className="form-group" style={{ margin: 0, flex: '0 0 120px' }}>
                        <label className="form-label">Score (1–45)</label>
                        <input type="number" min="1" max="45" value={scoreForm.score} onChange={e => setScoreForm({ ...scoreForm, score: e.target.value })} required placeholder="e.g. 32" disabled={!isSubscribed()} />
                      </div>
                      <div className="form-group" style={{ margin: 0, flex: 1 }}>
                        <label className="form-label">Date</label>
                        <input type="date" value={scoreForm.date} onChange={e => setScoreForm({ ...scoreForm, date: e.target.value })} required max={new Date().toISOString().split('T')[0]} disabled={!isSubscribed()} />
                      </div>
                      <button type="submit" className="btn btn-primary btn-sm" style={{ alignSelf: 'flex-end', marginBottom: '0.05rem' }} disabled={!isSubscribed()}>Add Score</button>
                    </div>
                    {scores.length >= 5 && <p className="form-note">⚠ You have 5 scores. Adding a new one will replace the oldest.</p>}
                  </form>
                </div>
                {!isSubscribed() && (
                  <div className="locked-cta">
                    <div className="locked-marker">LOCKED FEATURE</div>
                    <div className="locked-text">Active subscription required to log and track your scores.</div>
                    <Link to="/subscribe" className="btn btn-primary btn-sm">Subscribe to Unlock</Link>
                  </div>
                )}
              </div>

              <div className="score-table">
                {scores.length === 0 ? (
                  <p className="empty-msg">No scores yet.</p>
                ) : (
                  <table>
                    <thead><tr><th>#</th><th>Date</th><th>Score</th><th>Actions</th></tr></thead>
                    <tbody>
                      {scores.map((s, i) => (
                        <tr key={s._id}>
                          <td><span className="score-rank">{i + 1}</span></td>
                          <td>
                            {editingScore === s._id ? (
                              <input type="date" value={editForm.date} onChange={e => setEditForm({ ...editForm, date: e.target.value })} style={{ width: '140px' }} />
                            ) : format(new Date(s.date), 'dd MMM yyyy')}
                          </td>
                          <td>
                            {editingScore === s._id ? (
                              <input type="number" min="1" max="45" value={editForm.score} onChange={e => setEditForm({ ...editForm, score: e.target.value })} style={{ width: '80px' }} />
                            ) : <strong className="score-pts">{s.score}</strong>}
                          </td>
                          <td>
                            {isSubscribed() && (
                              editingScore === s._id ? (
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                  <button className="btn btn-primary btn-sm" onClick={() => handleUpdateScore(s._id)}>Save</button>
                                  <button className="btn btn-outline btn-sm" onClick={() => setEditingScore(null)}>Cancel</button>
                                </div>
                              ) : (
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                  <button className="btn btn-outline btn-sm" onClick={() => { setEditingScore(s._id); setEditForm({ score: s.score, date: s.date.slice(0, 10) }); }}>Edit</button>
                                  <button className="btn btn-danger btn-sm" onClick={() => { setSelectedScoreId(s._id); setModalType('delete'); }}>Delete</button>
                                </div>
                              )
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Draws */}
        {activeTab === 'draws' && (
          <div className="dash-content">
            <div className={`card ${!isSubscribed() ? 'locked-overlay' : ''}`}>
              <div className={!isSubscribed() ? 'blur-content' : ''}>
                <h3 className="card-title">Draw Participation</h3>
                
                {allDraws.length === 0 ? (
                  <p className="empty-msg">No draw results yet. Make sure you have scores logged!</p>
                ) : (
                  <div className="draw-history-container">
                    <div className="latest-draw-banner mb-8">
                      <h4>Latest Draw Numbers</h4>
                      <div className="draw-balls">
                        {allDraws[0]?.drawNumbers.map((n, i) => (
                          <span key={i} className="draw-ball">{n}</span>
                        ))}
                      </div>
                      <p className="text-sm text-gray-400 mt-2">
                        Drawn on {format(new Date(allDraws[0]?.publishedAt), 'dd MMM yyyy')}
                      </p>
                    </div>

                    <table className="participation-table">
                      <thead>
                        <tr>
                          <th>Month</th>
                          <th>Your Scores</th>
                          <th>Draw Result</th>
                          <th>Prize</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allDraws.map(d => {
                          const win = d.winners.find(w => w.user?._id === user._id || w.user === user._id);
                          // Check if user participated (had scores this month)
                          const participated = scores.some(s => {
                            const dDate = new Date(s.date);
                            return dDate.getMonth() + 1 === d.month && dDate.getFullYear() === d.year;
                          });

                          if (!participated && !win) return null;

                          return (
                            <tr key={d._id}>
                              <td>{new Date(d.year, d.month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}</td>
                              <td>
                                <div className="mini-scores">
                                  {scores.filter(s => {
                                    const dDate = new Date(s.date);
                                    return dDate.getMonth() + 1 === d.month && dDate.getFullYear() === d.year;
                                  }).map((s, i) => (
                                    <span key={i} className={`mini-score-tag ${d.drawNumbers.includes(s.score) ? 'match' : ''}`}>
                                      {s.score}
                                    </span>
                                  ))}
                                </div>
                              </td>
                              <td>
                                {win ? (
                                  <span className="badge badge-gold">{win.matchType}</span>
                                ) : (
                                  <span className="text-gray-500">No Match</span>
                                )}
                              </td>
                              <td>{win ? <PriceFormatter amount={win.prizeAmount} /> : '—'}</td>
                              <td>
                                {win ? (
                                  <span className={`badge ${win.paymentStatus === 'paid' ? 'badge-green' : 'badge-muted'}`}>
                                    {win.paymentStatus}
                                  </span>
                                ) : (
                                  <span className="text-dim">Completed</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              {!isSubscribed() && (
                <div className="locked-cta">
                  <div className="locked-marker">LOCKED FEATURE</div>
                  <div className="locked-text">Participate in monthly draws and win prizes based on your performance.</div>
                  <Link to="/subscribe" className="btn btn-primary btn-sm">Subscribe Now</Link>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Charity */}
        {activeTab === 'charity' && (
          <div className="dash-content">
            <CharitySelector
              charities={charities}
              selectedCharity={user?.selectedCharity}
              charityPercentage={user?.charityPercentage || 10}
              onUpdate={handleUpdateCharity}
            />
          </div>
        )}

        {/* Settings */}
        {activeTab === 'settings' && (
          <div className="dash-content">
            <div className="card">
              <h3 className="card-title">Subscription Management</h3>
              <div className="setting-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div>
                  <strong style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>PLAN</strong>
                  <div style={{ fontSize: '1.1rem', fontWeight: 600, textTransform: 'capitalize' }}>{user?.plan || 'None'}</div>
                </div>
                <div>
                  <strong style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>STATUS</strong>
                  <div>
                    <span className={`badge ${isSubscribed() ? 'badge-green' : 'badge-red'}`} style={{ marginTop: '0.2rem' }}>
                      {isSubscribed() ? 'ACTIVE' : user?.subscriptionStatus || 'INACTIVE'}
                    </span>
                  </div>
                </div>
                {user?.subscriptionEndDate && (
                  <div>
                    <strong style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{isSubscribed() ? 'EXPIRES' : 'EXPIRED'}</strong>
                    <div style={{ fontWeight: 600 }}>{format(new Date(user.subscriptionEndDate), 'dd MMM yyyy')}</div>
                  </div>
                )}
              </div>
              
              {isSubscribed() && subStats && (
                <div style={{ marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                    <span>Subscription Progress</span>
                    <span>{subStats.left} days remaining</span>
                  </div>
                  <div className="progress-container" style={{ height: '10px' }}>
                    <div className="progress-fill" style={{ width: `${subStats.pct}%` }} />
                  </div>
                </div>
              )}

              {isSubscribed() && (
                <button className="btn btn-danger btn-sm" onClick={() => setModalType('cancel')}>
                  Cancel Subscription
                </button>
              )}
              {!isSubscribed() && (
                <Link to="/subscribe" className="btn btn-primary" style={{ display: 'inline-flex' }}>Reactivate Now →</Link>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <Modal
        isOpen={modalType === 'delete'}
        onClose={() => setModalType(null)}
        onConfirm={handleDeleteScore}
        title="Delete Score?"
        message="This action cannot be undone. Are you sure you want to delete this score entry?"
        confirmText="Delete"
        type="danger"
      />

      <Modal
        isOpen={modalType === 'cancel'}
        onClose={() => setModalType(null)}
        onConfirm={handleCancelSub}
        title="Cancel Subscription?"
        message="You will retain access until the end of your current billing period. Access to draws and score logging will cease after that."
        confirmText="Confirm Cancellation"
        type="danger"
      />
    </div>
  );
}

function CharitySelector({ charities, selectedCharity, charityPercentage, onUpdate }) {
  const [chosenId, setChosenId] = useState(selectedCharity?._id || '');
  const [pct, setPct] = useState(charityPercentage);

  return (
    <div className="card">
      <h3 className="card-title">Charity Selection</h3>
      <p className="card-sub">Your contribution goes directly to your chosen charity each month.</p>

      <div className="charity-list">
        {charities.map(c => (
          <div key={c._id} className={`charity-option ${chosenId === c._id ? 'selected' : ''}`} onClick={() => setChosenId(c._id)}>
            {c.image && <img src={c.image} alt={c.name} className="charity-option-img" />}
            <div className="charity-option-info">
              <strong>{c.name}</strong>
              <span style={{ fontSize: '0.85rem', opacity: 0.8 }}>{c.description?.slice(0, 80)}…</span>
            </div>
            <div className={`radio-dot ${chosenId === c._id ? 'checked' : ''}`} />
          </div>
        ))}
      </div>

      <div className="form-group" style={{ marginTop: '1.5rem' }}>
        <label className="form-label">Contribution Percentage (min 10%)</label>
        <input type="range" min="10" max="100" value={pct} onChange={e => setPct(parseInt(e.target.value))} style={{ padding: 0, border: 'none', background: 'transparent' }} />
        <span className="charity-pct-val" style={{ color: 'var(--accent)', fontWeight: 600 }}>{pct}% of your subscription → charity</span>
      </div>

      <button className="btn btn-primary" onClick={() => onUpdate(chosenId, pct)} disabled={!chosenId}>
        Save Charity Preference
      </button>
    </div>
  );
}
