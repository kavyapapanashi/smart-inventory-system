"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Plus, Search, Edit2, Trash2, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { inventory, type Item, isAdmin } from "@/lib/api";

export default function InventoryPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [admin, setAdmin] = useState(false);

  // Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [formName, setFormName] = useState("");
  const [formQty, setFormQty] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  // Delete state
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const LIMIT = 10;

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError("");
    const { data, error: err } = await inventory.list(page, LIMIT);
    if (err || !data) {
      setError(err || "Failed to load items");
    } else {
      setItems(data.items);
      setTotalPages(data.pagination.pages || 1);
      setTotal(data.pagination.total);
    }
    setLoading(false);
  }, [page]);

  useEffect(() => {
    setAdmin(isAdmin());
    fetchItems();
  }, [fetchItems]);

  const openAddModal = () => {
    setFormName(""); setFormQty(""); setFormDesc(""); setFormError("");
    setEditingItem(null);
    setIsAddModalOpen(true);
  };

  const openEditModal = (item: Item) => {
    setFormName(item.name); setFormQty(String(item.quantity)); setFormDesc(item.description); setFormError("");
    setEditingItem(item);
    setIsAddModalOpen(true);
  };

  const closeModal = () => { setIsAddModalOpen(false); setEditingItem(null); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormLoading(true);

    const qty = parseInt(formQty);
    if (!formName.trim()) { setFormError("Name is required"); setFormLoading(false); return; }
    if (isNaN(qty) || qty < 0) { setFormError("Quantity must be a non-negative number"); setFormLoading(false); return; }

    const { error: err } = editingItem
      ? await inventory.update(editingItem.id, formName.trim(), qty, formDesc.trim())
      : await inventory.add(formName.trim(), qty, formDesc.trim());

    if (err) { setFormError(err); setFormLoading(false); return; }
    closeModal();
    fetchItems();
    setFormLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this item permanently?")) return;
    setDeletingId(id);
    await inventory.delete(id);
    setDeletingId(null);
    fetchItems();
  };

  const filtered = items.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto relative z-10 px-8 py-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 pb-4 border-b border-brand-border">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
            <span>Stockline</span>
            <span className="text-slate-600">/</span>
            <span className="text-white font-medium text-gradient">Inventory</span>
          </div>
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-bold tracking-tight">Inventory Details</h2>
            <div className="px-3 py-1 bg-slate-800/80 border border-slate-700/50 rounded-full text-xs font-semibold text-slate-300">
              {total} items
            </div>
          </div>
        </div>
        <div className="flex gap-2 mt-4 sm:mt-0">
          <button
            onClick={fetchItems}
            className="flex items-center gap-2 px-4 py-3 bg-slate-800 hover:bg-slate-700 border border-brand-border rounded-lg text-white font-semibold text-sm transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          {admin && (
            <button
              onClick={openAddModal}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-primary rounded-lg text-white font-semibold text-sm btn-glow transition-transform hover:scale-105 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              ADD INVENTORY
            </button>
          )}
        </div>
      </header>

      {/* Error State */}
      {error && (
        <div className="mb-6 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-2 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Inventory Table */}
      <div className="bg-brand-card border border-brand-border rounded-xl flex flex-col glow-hover mb-8 overflow-hidden border-gradient-top">
        <div className="p-6 border-b border-brand-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-brand-bg/20">
          <h3 className="text-lg font-semibold">Manage Inventory</h3>
          <div className="relative w-full sm:w-auto">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-[#080b14] border border-brand-border rounded-lg text-sm focus:outline-none focus:border-[#4a9eff] focus:ring-1 focus:ring-[#4a9eff] transition-all w-full sm:w-64"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16 gap-3 text-slate-400">
              <Loader2 className="w-5 h-5 animate-spin" />
              Loading inventory...
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex items-center justify-center py-16 text-slate-500 text-sm">
              No items found. {admin && <button onClick={openAddModal} className="ml-2 text-[#4a9eff] hover:underline">Add the first one →</button>}
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-brand-bg/40">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-widest border-b border-brand-border">Product Name</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-widest border-b border-brand-border">Description</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-widest border-b border-brand-border text-right">Stock</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-widest border-b border-brand-border text-center">Status</th>
                  {admin && <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-widest border-b border-brand-border text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/50 text-sm">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-brand-bg/60 transition-colors group">
                    <td className="px-6 py-4 font-semibold text-slate-200">{item.name}</td>
                    <td className="px-6 py-4 text-slate-400 max-w-[200px] truncate">{item.description || "—"}</td>
                    <td className="px-6 py-4 font-mono font-bold text-right text-white">{item.quantity}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold tracking-wide border ${
                        item.quantity > 10
                          ? "bg-brand-success/10 text-brand-success border-brand-success/20"
                          : item.quantity > 0
                          ? "bg-brand-warning/10 text-brand-warning border-brand-warning/20"
                          : "bg-brand-danger/10 text-brand-danger border-brand-danger/20"
                      }`}>
                        {item.quantity > 10 ? "IN STOCK" : item.quantity > 0 ? "LOW STOCK" : "OUT OF STOCK"}
                      </span>
                    </td>
                    {admin && (
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(item)}
                            className="p-1.5 text-slate-400 hover:text-[#7c3aed] hover:bg-[#7c3aed]/10 rounded-lg transition-all border border-transparent hover:border-[#7c3aed]/30"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            disabled={deletingId === item.id}
                            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all border border-transparent hover:border-red-400/30 disabled:opacity-50"
                            title="Delete"
                          >
                            {deletingId === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-brand-border bg-brand-bg/40 flex justify-between items-center text-xs text-slate-400 font-medium">
          <p>Showing page {page} of {totalPages} ({total} total items)</p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 hover:text-white transition-colors disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 hover:text-white transition-colors disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="bg-brand-card border border-brand-border rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border-gradient-top">
            <div className="px-6 py-4 border-b border-brand-border flex justify-between items-center bg-brand-bg/60">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                {editingItem ? <Edit2 className="w-4 h-4 text-[#4a9eff]" /> : <Plus className="w-5 h-5 text-[#4a9eff]" />}
                {editingItem ? "Edit Item" : "Add New Inventory Item"}
              </h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-5">
              {formError && (
                <div className="px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {formError}
                </div>
              )}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Product Name *</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-brand-bg border border-brand-border rounded-lg text-sm text-white focus:outline-none focus:border-[#4a9eff] focus:ring-1 focus:ring-[#4a9eff] transition-all"
                  placeholder="e.g. Lab Coat"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Stock Quantity *</label>
                <input
                  type="number"
                  value={formQty}
                  onChange={(e) => setFormQty(e.target.value)}
                  className="w-full px-4 py-2.5 bg-brand-bg border border-brand-border rounded-lg text-sm text-white font-mono focus:outline-none focus:border-[#4a9eff] focus:ring-1 focus:ring-[#4a9eff] transition-all"
                  placeholder="0"
                  min="0"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Description</label>
                <input
                  type="text"
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full px-4 py-2.5 bg-brand-bg border border-brand-border rounded-lg text-sm text-white focus:outline-none focus:border-[#4a9eff] focus:ring-1 focus:ring-[#4a9eff] transition-all"
                  placeholder="Optional description"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={closeModal} className="flex-1 px-4 py-2.5 border border-brand-border bg-slate-800/50 hover:bg-slate-800 text-white rounded-lg font-semibold transition-colors">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 px-4 py-2.5 bg-gradient-primary text-white rounded-lg font-semibold btn-glow transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {formLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : editingItem ? "Save Changes" : "Create Item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
