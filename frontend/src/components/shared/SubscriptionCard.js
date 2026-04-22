import React from 'react';
import './SubscriptionCard.css';

const SubscriptionCard = ({ 
  plan, 
  isSelected, 
  onSelect, 
  price, 
  period, 
  total, 
  saving, 
  days, 
  features = [],
  isCurrent = false
}) => {
  // Hide redundant billed text for monthly if it matches the main price
  const showBilled = price && total && !total.includes(price);

  return (
    <div 
      className={`plan-card-refined ${isSelected ? 'selected' : ''} ${isCurrent ? 'current' : ''}`} 
      onClick={onSelect}
    >
      {isCurrent && <div className="plan-badge-refined current-badge">Current Plan</div>}
      {saving && <div className="plan-badge-refined">{saving}</div>}
      
      <div className="plan-card-content">
        <div className="plan-info">
          <div className="plan-name-refined">{plan}</div>
          <div className="plan-price-refined">
            {price}<span>{period}</span>
          </div>
          {showBilled && (
            <div className="plan-total-refined">
              {total}
            </div>
          )}
          <ul className="plan-features-refined">
            {features.map((feature, index) => {
              const isExcluded = feature.startsWith('✕');
              return (
                <li key={index} className={isExcluded ? 'feature-excluded' : 'feature-included'}>
                  {isExcluded ? feature : `✓ ${feature}`}
                </li>
              );
            })}
          </ul>
        </div>
        
        <div className="selection-indicator">
          <div className={`radio-dot ${isSelected ? 'checked' : ''}`} />
        </div>
      </div>
    </div>
  );
};

export default SubscriptionCard;
