export const UNIT_CONVERSIONS = {
  volume: {
    'fl oz': 1,
    'cup': 8,
    'pint': 16,
    'quart': 32,
    'half-gallon': 64,
    'gallon': 128,
    'ml': 0.033814,
    'liter': 33.814,
  },
  weight: {
    'oz': 0.0625,
    'lb': 1,
    'gram': 0.00220462,
    'kg': 2.20462,
  },
};

export const UNIT_OPTIONS = {
  volume: Object.keys(UNIT_CONVERSIONS.volume),
  weight: Object.keys(UNIT_CONVERSIONS.weight),
  quantity: ['each', 'pack', 'dozen'],
};

export function toBaseUnit(amount, unit, type) {
  if (type === 'quantity') return amount;
  return amount * UNIT_CONVERSIONS[type][unit];
}

export function pricePerBase(totalPrice, amount, unit, type) {
  const base = toBaseUnit(amount, unit, type);
  if (base === 0) return 0;
  return totalPrice / base;
}

export function baseUnitLabel(type) {
  if (type === 'volume') return 'fl oz';
  if (type === 'weight') return 'lb';
  return 'unit';
}

export function avgCost(purchases, type) {
  if (!purchases || purchases.length === 0) return null;
  const sum = purchases.reduce((acc, p) => acc + p.pricePerBase, 0);
  return sum / purchases.length;
}

export function formatCurrency(val) {
  if (val == null || isNaN(val)) return '—';
  return '$' + val.toFixed(2);
}

export function formatSmallCurrency(val) {
  if (val == null || isNaN(val)) return '—';
  if (val < 0.10) return '$' + val.toFixed(4);
  return '$' + val.toFixed(3);
}

export function uuid() {
  return crypto.randomUUID();
}

export function formatDate(isoDate) {
  const d = new Date(isoDate + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
