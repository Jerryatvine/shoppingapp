import { useState, useEffect, useCallback } from 'react';
import { supabase, missingConfig } from './supabase';

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
      // Sort purchases oldest → newest inside each item
      const sorted = (data || []).map(item => ({
        ...item,
        purchases: (item.purchases || []).sort(
          (a, b) => new Date(a.date) - new Date(b.date)
        ),
      }));
      setItems(sorted);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  // ── Items ──────────────────────────────────────────────────────────────
  async function addItem(item) {
    const { id, purchases, ...rest } = item; // strip client-generated id/purchases
    const { data, error: err } = await supabase
      .from('items')
      .insert([{ ...rest }])
      .select('*, purchases(*)')
      .single();

    if (err) { setError(err.message); return; }
    setItems(prev => [...prev, { ...data, purchases: [] }]
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
