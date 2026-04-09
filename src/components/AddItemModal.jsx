import { useState } from 'react';
import { uuid, UNIT_OPTIONS } from '../utils';

export default function AddItemModal({ onAdd, onClose }) {
  const [name, setName] = useState('');
  const [type, setType] = useState('quantity');
  const [category, setCategory] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd({
      id: uuid(),
      name: name.trim(),
      type,
      category: category.trim(),
      defaultUnit: UNIT_OPTIONS[type][0],
      purchases: [],
    });
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>Add Item</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Item Name
            <input
              autoFocus
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Milk, Apple, Sugar"
              required
            />
          </label>
          <label>
            Category <span className="optional">(optional)</span>
            <input
              value={category}
              onChange={e => setCategory(e.target.value)}
              placeholder="e.g. Dairy, Produce, Baking"
            />
          </label>
          <label>
            Measurement Type
            <select value={type} onChange={e => setType(e.target.value)}>
              <option value="quantity">Quantity (each)</option>
              <option value="volume">Volume (liquid)</option>
              <option value="weight">Weight</option>
            </select>
          </label>
          <div className="type-hint">
            {type === 'quantity' && 'Tracks price per unit. Great for apples, cans, packages.'}
            {type === 'volume' && 'Tracks price per fl oz. Enter in gallons, liters, cups, etc.'}
            {type === 'weight' && 'Tracks price per pound. Enter in lbs, oz, kg, etc.'}
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary">Add Item</button>
          </div>
        </form>
      </div>
    </div>
  );
}
