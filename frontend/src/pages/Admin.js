import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import * as api from '../services/api';
import PriceFormatter from '../components/shared/PriceFormatter';
import Modal from '../components/shared/Modal';
import './Admin.css';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [draws, setDraws] = useState([]);
  const [charities, setCharities] = useState([]);
  const [pending, setPending] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [drawConfig, setDrawConfig] = useState({ month: new Date().getMonth() + 1, year: new Date().getFullYear(), drawLogic: 'random' });
  const [simResult, setSimResult] = useState(null);
  const [userSearch, setUserSearch] = useState('');
  const [charityForm, setCharityForm] = useState({ name: '', description: '', image: '', website: '', featured: false });
  const [editCharity, setEditCharity] = useState(null);
  const [adminModal, setAdminModal] = useState(null); // 'publish' | 'deleteCharity'
  const [charityToDelete, setCharityToDelete] = useState(null);

  const load = async () => {
    try {
      const [s, u, d, ch, p] = await Promise.all([
        api.getAdminStats(),
        api.getAdminUsers(),
        api.getAdminDraws(),
        api.getCharities(),
        api.getPendingVerifications(),
      ]);
      setStats(s.data.stats);
      setUsers(u.data.users);
      setDraws(d.data.draws);
      setCharities(ch.data.charities);
      setPending(p.data.draws);
    } catch (err) {
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSimulate = async () => {
    try {
      const res = await api.simulateDraw(drawConfig);
      setSimResult(res.data.draw);
      toast.success('Simulation complete! Review before publishing.');
      await load();
    } catch (err) { toast.error(err.response?.data?.message || 'Simulation failed'); }
  };

  const handlePublish = async () => {
    try {
      await api.publishDraw({ month: drawConfig.month, year: drawConfig.year });
      toast.success('Draw published!');
      setSimResult(null);
      await load();
    } catch (err) { toast.error(err.response?.data?.message || 'Publish failed'); }
    setAdminModal(null);
  };

  const handleVerify = async (drawId, winnerId, status) => {
    try {
      await api.verifyWinner({ drawId, winnerId, status });
      toast.success(`Winner ${status}`);
      await load();
    } catch (err) { toast.error('Verification failed'); }
  };

  const handleUpdateUserStatus = async (userId, status) => {
    try {
      await api.updateAdminUser(userId, { subscriptionStatus: status });
      toast.success('User updated');
      await load();
    } catch (err) { toast.error('Update failed'); }
  };

  const handleSaveCharity = async () => {
    try {
      if (editCharity) {
        await api.updateCharityAdmin(editCharity._id, charityForm);
        toast.success('Charity updated');
      } else {
        await api.createCharity(charityForm);
        toast.success('Charity created');
      }
      setCharityForm({ name: '', description: '', image: '', website: '', featured: false });
      setEditCharity(null);
      await load();
    } catch (err) { toast.error('Failed to save charity'); }
  };

  const handleDeleteCharity = async () => {
    if (!charityToDelete) return;
    try {
      await api.deleteCharity(charityToDelete);
      toast.success('Charity deactivated');
      await load();
    } catch (err) { toast.error('Failed'); }
    setAdminModal(null);
    setCharityToDelete(null);
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  if (loading) return <div className="spinner" />;

  const TABS = ['overview', 'users', 'draws', 'charities', 'winners'];

  return (
    <div className="admin-page page">
      <div className="container">
        <div className="admin-header">
          <div>
            <span className="badge badge-gold" style={{ marginBottom: '0.5rem' }}>Admin Panel</span>
            <h1>Control Centre</h1>
          </div>
        </div>

        <div className="dash-tabs">
          {TABS.map(t => (
            <button key={t} className={`dash-tab ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
              {t === 'winners' && pending.length > 0 && <span className="tab-badge">{pending.length}</span>}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === 'overview' && stats && (
          <div className="admin-content">
            <div className="stats-grid">
              {[
                { label: 'Total Users', val: stats.totalUsers, color: 'var(--text)' },
                { label: 'Active Subscribers', val: stats.activeSubscribers, color: 'var(--accent)' },
                { label: 'Est. Prize Pool', val: <PriceFormatter amount={stats.totalPrizePool || 0} />, color: 'var(--gold)' },
                { label: 'Charity Total', val: <PriceFormatter amount={stats.totalCharityContributions || 0} />, color: 'var(--green)' },
                { label: 'Charities', val: stats.totalCharities, color: 'var(--text)' },
                { label: 'Draws Published', val: stats.publishedDraws, color: 'var(--text)' },
              ].map(s => (
                <div className="stat-card" key={s.label}>
                  <div className="stat-label">{s.label}</div>
                  <div className="stat-val" style={{ color: s.color }}>{s.val}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Users */}
        {activeTab === 'users' && (
          <div className="admin-content">
            <div className="admin-toolbar">
              <input
                placeholder="Search by name or email…"
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                style={{ maxWidth: '320px' }}
              />
              <span className="admin-count">{filteredUsers.length} users</span>
            </div>
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr><th>Name</th><th>Email</th><th>Plan</th><th>Status</th><th>Charity</th><th>Won</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(u => (
                      <tr key={u._id}>
                        <td>{u.name}</td>
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{u.email}</td>
                        <td>{u.plan || '—'}</td>
                        <td>
                          <span className={`badge ${u.subscriptionStatus === 'active' ? 'badge-green' : 'badge-red'}`}>
                            {u.subscriptionStatus || 'inactive'}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.82rem' }}>{u.selectedCharity?.name || '—'}</td>
                        <td><PriceFormatter amount={u.totalWon || 0} /></td>
                        <td>
                          <select
                            value={u.subscriptionStatus || 'inactive'}
                            onChange={e => handleUpdateUserStatus(u._id, e.target.value)}
                            style={{ width: 'auto', padding: '0.3rem 0.6rem', fontSize: '0.78rem' }}
                          >
                            <option value="active">Set Active</option>
                            <option value="inactive">Set Inactive</option>
                            <option value="expired">Set Expired</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Draws */}
        {activeTab === 'draws' && (
          <div className="admin-content">
            <div className="grid-2" style={{ marginBottom: '2rem' }}>
              <div className="card">
                <h3 className="card-title">Run Draw</h3>
                <div className="form-group">
                  <label className="form-label">Month</label>
                  <select value={drawConfig.month} onChange={e => setDrawConfig({ ...drawConfig, month: parseInt(e.target.value) })}>
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>{new Date(2024, i).toLocaleString('default', { month: 'long' })}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Year</label>
                  <input type="number" value={drawConfig.year} onChange={e => setDrawConfig({ ...drawConfig, year: parseInt(e.target.value) })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Draw Logic</label>
                  <select value={drawConfig.drawLogic} onChange={e => setDrawConfig({ ...drawConfig, drawLogic: e.target.value })}>
                    <option value="random">Random</option>
                    <option value="algorithmic">Algorithmic (frequency-weighted)</option>
                  </select>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <button className="btn btn-outline" onClick={handleSimulate}>▶ Simulate</button>
                  {simResult && simResult.status !== 'published' && (
                    <button className="btn btn-primary" onClick={() => setAdminModal('publish')}>✓ Publish Draw</button>
                  )}
                </div>
              </div>

              {simResult && (
                <div className="card sim-result">
                  <h3 className="card-title">Simulation Result</h3>
                  <div className="draw-numbers">
                    {simResult.drawNumbers.map(n => (
                      <span className="draw-num" key={n}>{n}</span>
                    ))}
                  </div>
                  <div className="sim-stats">
                    <div><span>Subscribers:</span> <strong>{simResult.activeSubscribers}</strong></div>
                    <div><span>Prize Pool:</span> <strong><PriceFormatter amount={simResult.prizePool?.total || 0} /></strong></div>
                    <div><span>5-Match Pool:</span> <strong><PriceFormatter amount={simResult.prizePool?.fiveMatch || 0} /></strong></div>
                    <div><span>4-Match Pool:</span> <strong><PriceFormatter amount={simResult.prizePool?.fourMatch || 0} /></strong></div>
                    <div><span>3-Match Pool:</span> <strong><PriceFormatter amount={simResult.prizePool?.threeMatch || 0} /></strong></div>
                    <div><span>Winners:</span> <strong>{simResult.winners?.length || 0}</strong></div>
                  </div>
                  <div className={`badge ${simResult.status === 'published' ? 'badge-green' : 'badge-accent'}`} style={{ marginTop: '0.75rem' }}>
                    {simResult.status}
                  </div>
                </div>
              )}
            </div>

            {/* Draw History */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)' }}>
                <h3 className="card-title" style={{ margin: 0 }}>Draw History</h3>
              </div>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Month/Year</th><th>Numbers</th><th>Logic</th><th>Subscribers</th><th>Pool</th><th>Winners</th><th>Status</th></tr></thead>
                  <tbody>
                    {draws.map(d => (
                      <tr key={d._id}>
                        <td>{new Date(d.year, d.month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                            {d.drawNumbers.map(n => <span className="draw-num-sm" key={n}>{n}</span>)}
                          </div>
                        </td>
                        <td style={{ fontSize: '0.8rem' }}>{d.drawLogic}</td>
                        <td>{d.activeSubscribers}</td>
                        <td><PriceFormatter amount={d.prizePool?.total || 0} /></td>
                        <td>{d.winners?.length || 0}</td>
                        <td><span className={`badge ${d.status === 'published' ? 'badge-green' : d.status === 'simulated' ? 'badge-accent' : 'badge-muted'}`}>{d.status}</span></td>
                      </tr>
                    ))}
                    {draws.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No draws yet</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Charities */}
        {activeTab === 'charities' && (
          <div className="admin-content">
            <div className="grid-2" style={{ marginBottom: '2rem' }}>
              <div className="card">
                <h3 className="card-title">{editCharity ? 'Edit Charity' : 'Add Charity'}</h3>
                <div className="form-group">
                  <label className="form-label">Name</label>
                  <input value={charityForm.name} onChange={e => setCharityForm({ ...charityForm, name: e.target.value })} placeholder="Charity name" />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea rows={3} value={charityForm.description} onChange={e => setCharityForm({ ...charityForm, description: e.target.value })} placeholder="What do they do?" style={{ resize: 'vertical' }} />
                </div>
                <div className="form-group">
                  <label className="form-label">Image URL</label>
                  <input value={charityForm.image} onChange={e => setCharityForm({ ...charityForm, image: e.target.value })} placeholder="https://…" />
                </div>
                <div className="form-group">
                  <label className="form-label">Website</label>
                  <input value={charityForm.website} onChange={e => setCharityForm({ ...charityForm, website: e.target.value })} placeholder="https://…" />
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', cursor: 'pointer', marginBottom: '1rem' }}>
                  <input type="checkbox" checked={charityForm.featured} onChange={e => setCharityForm({ ...charityForm, featured: e.target.checked })} style={{ width: 'auto' }} />
                  Featured on homepage
                </label>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button className="btn btn-primary" onClick={handleSaveCharity}>{editCharity ? 'Update' : 'Create'}</button>
                  {editCharity && <button className="btn btn-outline" onClick={() => { setEditCharity(null); setCharityForm({ name: '', description: '', image: '', website: '', featured: false }); }}>Cancel</button>}
                </div>
              </div>

              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)' }}>
                  <h3 className="card-title" style={{ margin: 0 }}>Charities ({charities.length})</h3>
                </div>
                <div className="charity-admin-list">
                  {charities.map(c => (
                    <div className="charity-admin-row" key={c._id}>
                      {c.image && <img src={c.image} alt={c.name} style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }} />}
                      <div style={{ flex: 1 }}>
                        <strong style={{ fontSize: '0.9rem' }}>{c.name}</strong>
                        {c.featured && <span className="badge badge-accent" style={{ marginLeft: '0.5rem', fontSize: '0.65rem' }}>Featured</span>}
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-outline btn-sm" onClick={() => { setEditCharity(c); setCharityForm({ name: c.name, description: c.description, image: c.image || '', website: c.website || '', featured: c.featured }); }}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => { setCharityToDelete(c._id); setAdminModal('deleteCharity'); }}>Del</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Winners */}
        {activeTab === 'winners' && (
          <div className="admin-content">
            <h3 style={{ marginBottom: '1rem' }}>Pending Verifications</h3>
            {pending.length === 0 ? (
              <div className="card"><p className="empty-msg">No pending verifications.</p></div>
            ) : (
              pending.map(draw => (
                <div className="card" key={draw._id} style={{ marginBottom: '1rem' }}>
                  <h4 style={{ marginBottom: '1rem' }}>
                    {new Date(draw.year, draw.month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
                  </h4>
                  <div className="table-wrap">
                    <table>
                      <thead><tr><th>User</th><th>Match</th><th>Prize</th><th>Proof</th><th>Actions</th></tr></thead>
                      <tbody>
                        {draw.winners.filter(w => w.proofSubmitted && w.verificationStatus === 'pending').map(w => (
                          <tr key={w._id}>
                            <td>{w.user?.name || '—'}<br /><small style={{ color: 'var(--text-muted)' }}>{w.user?.email}</small></td>
                            <td><span className="badge badge-gold">{w.matchType}</span></td>
                            <td><PriceFormatter amount={w.prizeAmount || 0} /></td>
                            <td>
                              {w.proofUrl ? (
                                <a href={w.proofUrl} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">View Proof ↗</a>
                              ) : 'No URL'}
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button className="btn btn-primary btn-sm" onClick={() => handleVerify(draw._id, w._id, 'approved')}>Approve</button>
                                <button className="btn btn-danger btn-sm" onClick={() => handleVerify(draw._id, w._id, 'rejected')}>Reject</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))
            )}

            <h3 style={{ margin: '2rem 0 1rem' }}>All Draw Winners</h3>
            {draws.filter(d => d.winners?.length > 0).map(d => (
              <div className="card" key={d._id} style={{ marginBottom: '1rem' }}>
                <h4 style={{ marginBottom: '1rem' }}>
                  {new Date(d.year, d.month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
                  <span className="badge badge-muted" style={{ marginLeft: '0.75rem' }}>{d.status}</span>
                </h4>
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>User</th><th>Match</th><th>Prize</th><th>Payment</th><th>Verification</th></tr></thead>
                    <tbody>
                      {d.winners.map(w => (
                        <tr key={w._id}>
                          <td>{w.user?.name || 'Unknown'}</td>
                          <td><span className="badge badge-gold">{w.matchType}</span></td>
                          <td><PriceFormatter amount={w.prizeAmount || 0} /></td>
                          <td><span className={`badge ${w.paymentStatus === 'paid' ? 'badge-green' : 'badge-muted'}`}>{w.paymentStatus}</span></td>
                          <td><span className={`badge ${w.verificationStatus === 'approved' ? 'badge-green' : w.verificationStatus === 'rejected' ? 'badge-red' : 'badge-muted'}`}>{w.verificationStatus}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Admin Modals */}
      <Modal
        isOpen={adminModal === 'publish'}
        onClose={() => setAdminModal(null)}
        onConfirm={handlePublish}
        title="Publish Draw?"
        message="Publishing this draw is permanent and cannot be undone. Winners will be notified and prizes allocated."
        confirmText="Publish"
        type="primary"
      />

      <Modal
        isOpen={adminModal === 'deleteCharity'}
        onClose={() => { setAdminModal(null); setCharityToDelete(null); }}
        onConfirm={handleDeleteCharity}
        title="Deactivate Charity?"
        message="This charity will be deactivated and hidden from users. Existing selections will remain."
        confirmText="Deactivate"
        type="danger"
      />
    </div>
  );
}
