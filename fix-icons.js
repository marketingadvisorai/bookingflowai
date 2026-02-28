// Quick script to find correct icon mappings
const icons = require('@hugeicons/core-free-icons');

const keys = Object.keys(icons);

// Common icon patterns we need
const patterns = [
  'ArrowRight',
  'Checkmark',
  'Message',
  'SmartPhone',
  'Phone',
  'Calendar',
  'CreditCard',
  'BarChart',
  'Mail',
  'Code',
  'Shield',
  'Flash',
  'User',
  'Wallet',
  'File',
  'Globe',
  'Settings',
  'Book',
  'DollarCircle',
  'TrendingUp',
  'Location',
  'Clock',
  'Key',
  'Server',
  'View',
  'Cloud',
  'Alert',
  'Circle',
  'Favourite',
];

patterns.forEach(pattern => {
  const matches = keys.filter(k => k.includes(pattern) && k.length < 30);
  if (matches.length > 0) {
    console.log(`${pattern}:`, matches.slice(0, 3).join(', '));
  }
});
