import React from 'react';
import { CheckIcon, StarIcon } from './Icons';

const plans = [
  {
    id: 'free',
    name: 'Free Plan',
    price: '₹0',
    period: '/ forever',
    description: 'Get started and explore GolfHeroes at no cost.',
    features: [
      'Browse featured charities',
      'View monthly draw results',
      'Basic golfer profile',
      'Limited access to platform features'
    ],
    cta: 'Start Free',
    highlight: false,
  },
  {
    id: 'monthly',
    name: 'Monthly Plan',
    price: '₹100',
    period: '/ month',
    description: 'Play, track, and enter monthly prize draws.',
    features: [
      'Automatic entry into monthly prize draws',
      'Track up to 5 golf scores per month',
      'Support your chosen charity',
      'Access premium features'
    ],
    cta: 'Subscribe Now',
    highlight: false,
  },
  {
    id: 'yearly',
    name: 'Yearly Plan',
    price: '₹1000',
    period: '/ year',
    subtext: '₹84/month billed annually',
    description: 'Best value for regular players who want full access.',
    features: [
      'All monthly plan features',
      'Unlimited score tracking',
      '365-day premium access',
      'Priority support',
      '2 months free (best value)'
    ],
    cta: 'Get Best Value',
    highlight: true,
    badge: '⭐ Most Popular'
  }
];

export default function PricingSection({ selected, onSelect, currentPlan, onSubscribe }) {
  return (
    <div className="py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-center max-w-7xl mx-auto px-4">
        {plans.map((plan) => {
          const isSelected = selected === plan.id;
          const isCurrent = currentPlan === plan.id;
          
          return (
            <div
              key={plan.id}
              onClick={() => onSelect(plan.id)}
              className={`relative flex flex-col p-8 rounded-2xl cursor-pointer transition-all duration-300 transform 
                ${plan.highlight ? 'scale-105 z-10 border-2 border-accent shadow-[0_0_40px_rgba(200,241,53,0.15)] bg-gradient-to-b from-gray-900 to-black' : 'border border-white/10 bg-bg-card hover:scale-105 hover:bg-white/5'}
                ${isSelected ? 'ring-2 ring-accent ring-offset-2 ring-offset-black' : ''}
              `}
            >
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-accent text-black px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-1 shadow-lg">
                  {plan.badge}
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-gray-400 text-sm">{plan.description}</p>
              </div>

              <div className="mb-8 flex items-baseline gap-1">
                <span className="text-5xl font-bold text-white font-serif">{plan.price}</span>
                <span className="text-gray-500 font-medium">{plan.period}</span>
              </div>
              
              {plan.subtext && (
                <div className="text-accent text-sm font-semibold mb-6">
                  {plan.subtext}
                </div>
              )}

              <ul className="space-y-4 mb-8 flex-1">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                    <CheckIcon className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSubscribe(plan.id);
                }}
                className={`w-full py-4 rounded-xl font-bold transition-all duration-200 
                  ${plan.id === 'yearly' ? 'bg-accent text-black hover:bg-accent-hover shadow-lg shadow-accent/20' : 'bg-white/5 text-white border border-white/10 hover:bg-white/10'}
                  ${isSelected ? 'ring-2 ring-accent' : ''}
                `}
              >
                {isCurrent ? 'Current Plan' : plan.cta}
              </button>
            </div>
          );
        })}
      </div>
      
      <div className="mt-16 flex flex-wrap justify-center gap-8 text-gray-500 text-sm">
        <div className="flex items-center gap-2">
          <CheckIcon className="w-4 h-4 text-accent" />
          Cancel anytime
        </div>
        <div className="flex items-center gap-2">
          <CheckIcon className="w-4 h-4 text-accent" />
          Secure payments
        </div>
        <div className="flex items-center gap-2">
          <CheckIcon className="w-4 h-4 text-accent" />
          No hidden charges
        </div>
      </div>
    </div>
  );
}
