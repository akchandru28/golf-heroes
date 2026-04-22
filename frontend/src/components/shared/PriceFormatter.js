import React from 'react';

/**
 * Utility to format numbers as Indian Rupee (₹)
 * Uses Intl.NumberFormat('en-IN') for standard Indian comma grouping (1,00,000)
 */
export const formatPrice = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount).replace('INR', '₹').trim();
};

const PriceFormatter = ({ amount, className = '' }) => {
  return <span className={className}>{formatPrice(amount)}</span>;
};

export default PriceFormatter;
