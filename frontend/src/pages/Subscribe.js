import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import * as api from '../services/api';
import PricingSection from '../components/pricing/PricingSection';
import HowItWorks from '../components/shared/HowItWorks';
import Modal from '../components/shared/Modal';

const PLANS = {
  free: { label: 'Public' },
  monthly: { label: 'Monthly' },
  yearly: { label: 'Yearly' },
};

export default function Subscribe() {
  const { user, isSubscribed, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [selected, setSelected] = useState('monthly');
  const [loading, setLoading] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  const handleSubscribe = async (planId) => {
    const targetPlan = planId || selected;
    if (!user) {
      navigate('/register');
      return;
    }

    if (targetPlan === 'free') {
      navigate('/dashboard');
      return;
    }

    setLoading(true);
    try {
      const res = await api.activateSubscription(targetPlan);
      await refreshUser();
      const endDate = new Date(res.data.user.subscriptionEndDate).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'long', year: 'numeric',
      });
      toast.success(`🎉 ${PLANS[targetPlan].label} plan activated! Valid until ${endDate}`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not activate subscription. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    try {
      await api.cancelSubscription();
      await refreshUser();
      toast.info('Subscription cancelled.');
    } catch (err) {
      toast.error('Could not cancel subscription.');
    }
    setIsCancelModalOpen(false);
  };

  return (
    <div className="subscribe-page page bg-primary-dark">
      <div className="container">
        <div className="sub-header mb-12">
          <div className="section-label">Membership</div>
          <h1 className="text-white">Choose your plan</h1>
          <p className="text-gray-400">Every subscription enters you into monthly draws and funds your chosen charity.</p>
        </div>

        {isSubscribed() && (
          <div className="card sub-active-notice glow-green mb-12 bg-bg-card border-accent/20">
            <span className="badge badge-green">✓ Active Subscriber</span>
            <p className="text-white mt-2">
              You are currently on the <strong>{user.plan}</strong> plan.
              Valid until{' '}
              <strong>
                {new Date(user.subscriptionEndDate).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'long', year: 'numeric',
                })}
              </strong>.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', flexWrap: 'wrap' }}>
              <button className="btn btn-outline btn-sm" onClick={() => navigate('/dashboard')}>
                Go to Dashboard
              </button>
              <button className="btn btn-danger btn-sm" onClick={() => setIsCancelModalOpen(true)}>
                Cancel Subscription
              </button>
            </div>
          </div>
        )}

        {/* New Pricing Section */}
        <PricingSection 
          selected={selected} 
          onSelect={setSelected} 
          currentPlan={isSubscribed() ? user.plan : 'free'}
          onSubscribe={handleSubscribe}
          loading={loading}
        />

        <div className="mt-24">
          <HowItWorks />
        </div>

        <div className="sub-breakdown card mt-24 bg-bg-card border-white/5">
          <h3 className="text-white mb-6">Where your subscription goes</h3>
          <div className="breakdown-items">
            <div className="breakdown-item flex justify-between mb-2">
              <span className="text-gray-400">Prize Pool</span>
              <span className="text-accent font-bold">90%</span>
            </div>
            <div className="progress-container bg-white/10">
              <div className="progress-fill shadow-[0_0_10px_rgba(200,241,53,0.5)]" style={{ width: '90%' }} />
            </div>
            <div className="breakdown-item flex justify-between mt-6 mb-2">
              <span className="text-gray-400">Charity Contribution</span>
              <span className="text-gold font-bold">10%</span>
            </div>
            <div className="progress-container bg-white/10">
              <div className="progress-fill" style={{ width: '10%', background: 'var(--gold)', boxShadow: '0 0 10px var(--gold)' }} />
            </div>
          </div>
        </div>

        <p className="sub-note text-gray-500 text-center mt-12 mb-20 italic">
          Instant activation. No payment required during hackathon preview.
        </p>
      </div>

      <Modal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleCancel}
        title="Cancel Subscription?"
        message="You will retain access until your current period ends. Are you sure you want to proceed?"
        confirmText="Yes, Cancel"
        type="danger"
      />
    </div>
  );
}
