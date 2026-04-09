import { useState } from 'react';
import { avgCost, formatCurrency, formatSmallCurrency, baseUnitLabel, formatDate } from '../utils';

export default function ItemCard({ item, onAddPurchase, onDelete, onDeletePurchase }) {
  const [expanded, setExpanded] = useState(false);
  const avg = avgCost(item.purchases, item.type);
  const latest = item.purchases.length > 0
    ? item.purchases[item.purchases.length - 1]
    : null;
  const baseLabel = baseUnitLabel(item.type);

  const typeIcon = {
    quantity: '📦',
    volume: '🧴',
    weight: '⚖️',
  }[item.type];

  const typeTag = {
    quantity: 'qty',
    volume: 'vol',
    weight: 'wt',
  }[item.type];

  return (
    <div className="item-card">
      <div className="item-header" onClick={() => setExpanded(e => !e)}>
        <div className="item-title-row">
          <span className="item-icon">{typeIcon}</span>
          <div className="item-name-group">
            <span className="item-name">{item.name}</span>
            {item.category && <span className="item-category">{item.category}</span>}
          </div>
          <span className={`type-badge type-${item.type}`}>{typeTag}</span>
        </div>
        <div className="item-stats">
          <div className="stat">
            <span className="stat-label">Avg</span>
            <span className="stat-value">
              {avg !== null
                ? item.type === 'quantity'
                  ? formatCurrency(avg) + '/unit'
                  : formatSmallCurrency(avg) + '/' + baseLabel
                : '—'}
            </span>
          </div>
          <div className="stat">
            <span className="stat-label">Last</span>
            <span className="stat-value">
              {latest ? formatCurrency(latest.totalPrice) : '—'}
            </span>
          </div>
          <div className="stat">
            <span className="stat-label">Purchases</span>
            <span className="stat-value">{item.purchases.length}</span>
          </div>
          <button
            className="btn-icon add-btn"
            onClick={e => { e.stopPropagation(); onAddPurchase(item); }}
            title="Record purchase"
          >+</button>
          <span className={`chevron ${expanded ? 'open' : ''}`}>›</span>
        </div>
      </div>

      {expanded && (
        <div className="item-body">
          {item.purchases.length === 0 ? (
            <p className="no-data">No purchases yet. Click + to record one.</p>
          ) : (
            <table className="purchase-table">
              <thead>
                <tr>
                  <th>Date</th>
                  {item.type !== 'quantity' && <th>Amount</th>}
                  <th>Total</th>
                  <th>{item.type === 'quantity' ? 'Per Unit' : `Per ${baseLabel}`}</th>
                  {item.purchases.some(p => p.store) && <th>Store</th>}
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {[...item.purchases].reverse().map(p => (
                  <tr key={p.id}>
                    <td>{formatDate(p.date)}</td>
                    {item.type !== 'quantity' && (
                      <td>{p.amount} {p.unit}</td>
                    )}
                    <td>{formatCurrency(p.totalPrice)}</td>
                    <td className="price-per">
                      {item.type === 'quantity'
                        ? formatCurrency(p.totalPrice / p.amount)
                        : formatSmallCurrency(p.pricePerBase)}
                    </td>
                    {item.purchases.some(pub => pub.store) && (
                      <td className="store-cell">{p.store || '—'}</td>
                    )}
                    <td>
                      <button
                        className="btn-icon delete-btn"
                        onClick={() => onDeletePurchase(item.id, p.id)}
                        title="Delete purchase"
                      >×</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <div className="item-footer">
            <button className="btn-danger-sm" onClick={() => onDelete(item.id)}>
              Delete Item
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
