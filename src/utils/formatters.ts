/**
 * Formats a number to Indian currency format (e.g. ₹10,000 or ₹10 Lakhs or ₹1 Crore)
 */
export const formatCurrency = (amount: number, compact: boolean = false): string => {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';

  if (compact) {
    if (amount >= 10000000) {
      const cr = amount / 10000000;
      return `₹${cr % 1 === 0 ? cr : cr.toFixed(1)} Cr`;
    }
    if (amount >= 100000) {
      const lakh = amount / 100000;
      return `₹${lakh % 1 === 0 ? lakh : lakh.toFixed(1)} Lakh`;
    }
    if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(0)}k`;
    }
  }

  // Indian number format (en-IN)
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `₹${amount.toLocaleString()}`;
  }
};

/**
 * Format waiting period in human readable string
 */
export const formatWaitingPeriod = (months: number): string => {
  if (months <= 0) return 'Immediate (Day 1)';
  if (months === 1) return '30 Days';
  if (months < 12) return `${months} Months`;
  const years = months / 12;
  return `${years % 1 === 0 ? years : years.toFixed(1)} Year${years > 1 ? 's' : ''}`;
};

/**
 * Masks phone number for display e.g. +91 98*** **210
 */
export const maskPhoneNumber = (phone: string): string => {
  if (!phone || phone.length < 10) return phone;
  const clean = phone.replace(/\D/g, '');
  if (clean.length === 10) {
    return `+91 ${clean.slice(0, 2)}*** ***${clean.slice(-2)}`;
  }
  return phone;
};

/**
 * Formats date string to friendly readable string
 */
export const formatDate = (dateStr: string): string => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
};
