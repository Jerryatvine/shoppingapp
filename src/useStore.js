import { useState, useEffect, useCallback } from 'react';
import { supabase, missingConfig } from './supabase';

// ── Shape helpers: JS (camelCase) ↔ DB (snake_case) ───────────────────────
function dbItemToJs(item) {
  return {
    ...item,
    defaultUnit: item.default_unit,
    purchases: (item.purchases || []).sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    ),
  };
}

function jsItemToDB({ id, purchases, defaultUnit, ...rest }) {
  return { ...rest, default_unit: defaultUnit };
}

export function useStore() {
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  // ── Fetch all items with nested purchases ─────────────────────────────
  const fetchItems = useCallback(async () => {
    if (missingConfig) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from('items')
      .select('*, purchases(*)')
      .order('name', { ascending: true });

    if (err) {
      setError(err.message);
    } else {
      // Normalize snake_case DB columns → camelCase, sort purchases oldest→newest
      const sorted = (data || []).map(dbItemToJs);
      setItems(sorted);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  // ── Items ──────────────────────────────────────────────────────────────
  async function addItem(item) {
    const { data, error: err } = await supabase
      .from('items')
      .insert([jsItemToDB(item)])
      .select('*, purchases(*)')
      .single();

    if (err) { setError(err.message); return; }
    setItems(prev => [...prev, dbItemToJs(data)]
      .sort((a, b) => a.name.localeCompare(b.name)));
  }

  async function deleteItem(id) {
    const { error: err } = await supabase
      .from('items')
      .delete()
      .eq('id', id);

    if (err) { setError(err.message); return; }
    setItems(prev => prev.filter(i => i.id !== id));
  }

  // ── Purchases ──────────────────────────────────────────────────────────
  async function addPurchase(itemId, purchase) {
    const { id, ...rest } = purchase; // strip client-generated id
    const { data, error: err } = await supabase
      .from('purchases')
      .insert([{ item_id: itemId, ...rest }])
      .select()
      .single();

    if (err) { setError(err.message); return; }
    setItems(prev => prev.map(item =>
      item.id === itemId
        ? {
            ...item,
            purchases: [...item.purchases, data].sort(
              (a, b) => new Date(a.date) - new Date(b.date)
            ),
          }
        : item
    ));
  }

  async function deletePurchase(itemId, purchaseId) {
    const { error: err } = await supabase
      .from('purchases')
      .delete()
      .eq('id', purchaseId);

    if (err) { setError(err.message); return; }
    setItems(prev => prev.map(item =>
      item.id === itemId
        ? { ...item, purchases: item.purchases.filter(p => p.id !== purchaseId) }
        : item
    ));
  }

  function clearError() { setError(null); }

  return { items, loading, error, clearError, addItem, deleteItem, addPurchase, deletePurchase };
}
