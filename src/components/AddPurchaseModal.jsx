import { useState } from 'react';
import { uuid, UNIT_OPTIONS, pricePerBase, baseUnitLabel, formatSmallCurrency } from '../utils';

export default function AddPurchaseModal({ item, onAdd, onClose }) {
  const units = UNIT_OPTIONS[item.type];
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [totalPrice, setTotalPrice] = useState('');
  const [amount, setAmount] = useState('1');
  const [unit, setUnit] = useState(item.defaultUnit || units[0]);
  const [store, setStore] = useState('');

  const parsedPrice = parseFloat(totalPrice);
  const parsedAmount = parseFloat(amount);
  const ppu = (!isNaN(parsedPrice) && !isNaN(parsedAmount) && parsedAmount > 0)
    ? pricePerBase(parsedPrice, parsedAmount, unit, item.type)
    : null;

  function handleSubmit(e) {
    e.preventDefault();
    if (!totalPrice || !amount) return;
    onAdd(item.id, {
      id: uuid(),
      date,
      totalPrice: parsedPrice,
      amount: parsedAmount,
      unit,
      store: store.trim(),
      pricePerBase: ppu,
    });
    onClose();
  }

  const baseLabel = baseUnitLabel(item.type);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>Record Purchase</h2>
        <p className="modal-subtitle">{item.name}</p>
        <form onSubmit={handleSubmit}>
          <label>
            Date
            <input type="date" value={date} onChange={e => setDate(e.target.value)} required />
          </label>
          <label>
            Store <span className="optional">(optional)</span>
            <input value={store} onChange={e => setStore(e.target.value)} placeholder="e.g. Walmart, Kroger" />
          </label>
          <label>
            Total Price ($)
            <input
              type="number"
              min="0"
              step="0.01"
              value={totalPrice}
              onChange={e => setTotalPrice(e.target.value)}
              placeholder="0.00"
              required
              autoFocus
            />
          </label>
          {item.type !== 'quantity' && (
            <div className="amount-row">
              <label style={{ flex: 1 }}>
                Amount
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="1"
                  required
                />
              </label>
              <label style={{ flex: 1 }}>
                Unit
                <select value={unit} onChange={e => setUnit(e.target.value)}>
                  {units.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </label>
            </div>
          )}
          {item.type === 'quantity' && (
            <label>
              Quantity
              <input
                type="number"
                min="1"
                step="1"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="1"
                required
              />
            </label>
          )}
          {ppu !== null && (
            <div className="price-preview">
              {item.type !== 'quantity' ? (
                <><strong>{formatSmallCurrency(ppu)}</strong> per {baseLabel}</>
              ) : (
                <><strong>{formatSmallCurrency(parsedPrice / parsedAmount)}</strong> per unit</>
              )}
            </div>
          )}
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary">Save Purchase</button>
          </div>
        </form>
      </div>
    </div>
  );
}
