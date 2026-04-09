import { useState, useMemo } from 'react';
import { useStore } from './useStore';
import { missingConfig } from './supabase';
import ItemCard from './components/ItemCard';
import AddItemModal from './components/AddItemModal';
import AddPurchaseModal from './components/AddPurchaseModal';
import './App.css';

export default function App() {
  const { items, loading, error, clearError, addItem, deleteItem, addPurchase, deletePurchase } = useStore();
  const [showAddItem, setShowAddItem]     = useState(false);
  const [purchaseTarget, setPurchaseTarget] = useState(null);
  const [search, setSearch]               = useState('');
  const [filterType, setFilterType]       = useState('all');
  const [sortBy, setSortBy]               = useState('name');

  const filtered = useMemo(() => {
    let list = items;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(i =>
        i.name.toLowerCase().includes(q) ||
        (i.category && i.category.toLowerCase().includes(q))
      );
    }
    if (filterType !== 'all') {
      list = list.filter(i => i.type === filterType);
    }
    if (sortBy === 'name') {
      list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'category') {
      list = [...list].sort((a, b) => (a.category || '').localeCompare(b.category || ''));
    } else if (sortBy === 'recent') {
      list = [...list].sort((a, b) => {
        const aDate = a.purchases.length ? a.purchases[a.purchases.length - 1].date : '';
        const bDate = b.purchases.length ? b.purchases[b.purchases.length - 1].date : '';
        return bDate.localeCompare(aDate);
      });
    }
    return list;
  }, [items, search, filterType, sortBy]);

  if (missingConfig) {
    return (
      <div className="app">
        <div className="config-error">
          <p className="config-error-icon">⚙️</p>
          <h2>Missing Configuration</h2>
          <p>The Supabase environment variables are not set.</p>
          <p className="config-error-sub">
            Add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> to your
            Vercel project's Environment Variables, then redeploy.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-title">
          <h1>Shopping Tracker</h1>
          {!loading && (
            <span className="item-count">{items.length} item{items.length !== 1 ? 's' : ''}</span>
          )}
        </div>
        <button className="btn-primary" onClick={() => setShowAddItem(true)} disabled={loading}>
          + Add Item
        </button>
      </header>

      {error && (
        <div className="error-banner">
          <span>⚠️ {error}</span>
          <button onClick={clearError}>×</button>
        </div>
      )}

      <div className="toolbar">
        <input
          className="search-input"
          placeholder="Search items..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option value="all">All types</option>
          <option value="quantity">Quantity</option>
          <option value="volume">Volume</option>
          <option value="weight">Weight</option>
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="name">Sort: Name</option>
          <option value="category">Sort: Category</option>
          <option value="recent">Sort: Recent</option>
        </select>
      </div>

      <main className="item-list">
        {loading ? (
          <div className="loading-state">
            <div className="spinner" />
            <p>Loading...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            {items.length === 0
              ? <>
                  <p className="empty-icon">🛒</p>
                  <p>No items yet.</p>
                  <p className="empty-sub">Add items to start tracking prices.</p>
                  <button className="btn-primary" onClick={() => setShowAddItem(true)}>
                    + Add Your First Item
                  </button>
                </>
              : <p>No items match your search.</p>
            }
          </div>
        ) : (
          filtered.map(item => (
            <ItemCard
              key={item.id}
              item={item}
              onAddPurchase={setPurchaseTarget}
              onDelete={deleteItem}
              onDeletePurchase={deletePurchase}
            />
          ))
        )}
      </main>

      {showAddItem && (
        <AddItemModal
          onAdd={addItem}
          onClose={() => setShowAddItem(false)}
        />
      )}
      {purchaseTarget && (
        <AddPurchaseModal
          item={purchaseTarget}
          onAdd={addPurchase}
          onClose={() => setPurchaseTarget(null)}
        />
      )}
    </div>
  );
}
