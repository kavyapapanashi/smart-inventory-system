"use client";

import React, { useState, useRef, useEffect } from "react";
import { Plus, Search, Edit2, Upload, BookOpen, ImageOff, X, Loader2 } from "lucide-react";
import Image from "next/image";
import { isStaff, inventory, Item } from "@/lib/api";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// ── Book Cover component ──────────────────────────────────────────────────────
function BookCover({ url, name, size = 40 }: { url: string; name: string; size?: number }) {
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });
  const coverRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!coverRef.current) return;
    
    // Get bounding box of the book cover
    const rect = coverRef.current.getBoundingClientRect();
    
    // Calculate cursor position relative to the center of the cover (-1 to +1)
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    
    // Max rotation is 15 degrees
    setRotation({ x: -y * 15, y: x * 15 });
    
    // Set glare position based on cursor relative position (0 to 100%)
    setGlare({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
      opacity: 0.15
    });
  };

  const handleMouseLeave = () => {
    setRotation({ x: 0, y: 0 });
    setGlare(prev => ({ ...prev, opacity: 0 }));
  };

  const fullUrl = url ? (url.startsWith("http") ? url : `${BASE_URL}${url}`) : "";
  
  if (!fullUrl) {
    return (
      <div
        className="rounded-lg bg-brand-bg border border-brand-border flex items-center justify-center flex-shrink-0"
        style={{ width: size, height: size + 12 }}
      >
        <BookOpen className="w-5 h-5 text-slate-600" />
      </div>
    );
  }
  return (
    <div 
      className="perspective-1000 group cursor-pointer flex-shrink-0"
      style={{ width: size, height: size + 12 }}
    >
      <div 
        ref={coverRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative w-full h-full rounded-lg overflow-hidden border border-brand-border shadow-md transition-transform duration-200 ease-out preserve-3d group-hover:shadow-[0_10px_20px_rgba(74,158,255,0.15)] group-hover:border-[#4a9eff]/40"
        style={{ 
          transform: `perspective(400px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
          transformStyle: "preserve-3d" 
        }}
      >
        {/* Book Texture / Overlay */}
        <div 
          className="absolute inset-0 z-10 pointer-events-none transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,${glare.opacity}) 0%, rgba(255,255,255,0) 60%)`,
            borderLeft: "2px solid rgba(255,255,255,0.1)",
          }}
        />
        <Image
          src={fullUrl}
          alt={`Cover of ${name}`}
          fill
          className="object-cover relative z-0"
          unoptimized
        />
      </div>
    </div>
  );
}

// ── Image Dropzone ────────────────────────────────────────────────────────────
function ImageDropzone({ value, onChange }: { value: File | null; onChange: (f: File | null) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const previewUrl = value ? URL.createObjectURL(value) : null;

  return (
    <div className="flex flex-col gap-2">
      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">
        Book Cover Image
      </label>
      {previewUrl ? (
        <div className="relative w-full h-36 rounded-xl overflow-hidden border border-brand-border">
          <Image src={previewUrl} alt="Preview" fill className="object-contain" unoptimized />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute top-2 right-2 w-6 h-6 bg-brand-danger/80 rounded-full flex items-center justify-center hover:bg-brand-danger transition-colors"
          >
            <X className="w-3 h-3 text-white" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full h-36 rounded-xl border-2 border-dashed border-brand-border hover:border-[#4a9eff]/50 bg-brand-bg/50 hover:bg-brand-bg flex flex-col items-center justify-center gap-2 transition-all group"
        >
          <Upload className="w-6 h-6 text-slate-600 group-hover:text-[#4a9eff] transition-colors" />
          <span className="text-xs text-slate-500 group-hover:text-slate-300 transition-colors">
            Click to upload cover image
          </span>
          <span className="text-[10px] text-slate-600">PNG, JPG, WEBP · max 10 MB</span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
      />
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [canEdit, setCanEdit] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    const { data } = await inventory.list(1, 100);
    if (data) setItems(data.items);
    setLoading(false);
  };

  useEffect(() => {
    setCanEdit(isStaff());
    fetchItems();
  }, []);

  // Form state
  const [formName, setFormName] = useState("");
  const [formAuthor, setFormAuthor] = useState("");
  const [formCategory, setFormCategory] = useState("Stationery");
  const [formPrice, setFormPrice] = useState("");
  const [formQty, setFormQty] = useState(1);
  const [formSku, setFormSku] = useState("");
  const [formImage, setFormImage] = useState<File | null>(null);

  const openAdd = () => {
    setFormName(""); setFormAuthor(""); setFormCategory("Stationery");
    setFormPrice(""); setFormQty(1); setFormImage(null); setFormSku("");
    setEditingItem(null);
    setIsAddModalOpen(true);
  };

  const openEdit = (item: Item) => {
    setFormName(item.name); setFormAuthor(""); // backend does not strictly have author but we adapt
    setFormCategory(item.category || "Stationery"); setFormPrice(item.price || "");
    setFormQty(item.quantity); setFormImage(null); setFormSku(item.id);
    setEditingItem(item);
    setIsAddModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      name: formName,
      category: formCategory,
      quantity: formQty,
      price: formPrice || "₹0.00",
      id: formSku || undefined
    };

    if (editingItem) {
      const { error } = await inventory.update(editingItem.id, payload);
      if (error) alert(error);
    } else {
      const { error } = await inventory.create(payload);
      if (error) alert(error);
    }
    
    setSaving(false);
    setIsAddModalOpen(false);
    setEditingItem(null);
    fetchItems();
  };

  const filtered = items.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto relative z-10 px-8 py-6">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 pb-4 border-b border-brand-border">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
            <span>Stockline</span>
            <span className="text-slate-600">/</span>
            <span className="text-white font-medium text-gradient">Inventory</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">Inventory Details</h1>
            <div className="px-3 py-1 bg-slate-800/80 border border-slate-700/50 rounded-full text-xs font-semibold text-slate-300">
              {items.length} items
            </div>
          </div>
        </div>
        {canEdit && (
          <button
            onClick={openAdd}
            className="hidden sm:flex items-center gap-2 px-6 py-3 bg-gradient-primary rounded-lg text-white font-semibold text-sm btn-glow mt-4 sm:mt-0 transition-transform hover:scale-105 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            ADD INVENTORY
          </button>
        )}
      </header>

      {/* ── Table ───────────────────────────────────────────────────────────── */}
      <div className="bg-[#0b1121]/40 backdrop-blur-xl border border-brand-border/60 rounded-xl flex flex-col hover:border-[#4a9eff]/30 transition-colors duration-500 mb-8 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.4)]">
        <div className="p-6 border-b border-brand-border/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-transparent relative z-10">
          <h3 className="text-lg font-semibold">Manage Inventory</h3>
          <div className="relative w-full sm:w-auto">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search items, ID, or author..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 flex-grow bg-[#080b14] border border-brand-border rounded-lg text-sm focus:outline-none focus:border-[#4a9eff] focus:ring-1 focus:ring-[#4a9eff] transition-all w-full sm:w-72"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-brand-bg/40">
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-widest border-b border-brand-border">Cover</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-widest border-b border-brand-border">Book / Product</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-widest border-b border-brand-border">Author</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-widest border-b border-brand-border">SKU / ID</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-widest border-b border-brand-border">Category</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-widest border-b border-brand-border text-right">Price</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-widest border-b border-brand-border text-right">Stock</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-widest border-b border-brand-border text-center">Status</th>
                {canEdit && <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-widest border-b border-brand-border text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/30 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                       <Loader2 className="w-5 h-5 animate-spin"/> Fetching complete inventory...
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-slate-400">No matching items found.</td>
                </tr>
              ) : filtered.map((item) => (
                <tr key={item.id} className="hover:bg-white/[0.03] transition-all duration-300 group">

                  {/* Cover thumbnail */}
                  <td className="px-6 py-3">
                    <BookCover url={""} name={item.name} size={44} />
                  </td>

                  {/* Name */}
                  <td className="px-6 py-3 font-semibold text-slate-200 max-w-[180px]">
                    <span className="line-clamp-2">{item.name}</span>
                  </td>

                  {/* Author */}
                  <td className="px-6 py-3 text-slate-400 italic text-xs">
                    <span className="text-slate-600 not-italic">—</span>
                  </td>

                  {/* SKU */}
                  <td className="px-6 py-3 font-mono text-slate-400 group-hover:text-[#4a9eff] transition-colors">
                    {item.id}
                  </td>

                  {/* Category */}
                  <td className="px-6 py-3 text-slate-400">
                    <span className="px-2.5 py-1 bg-slate-800 border border-slate-700 text-slate-300 rounded-md text-[11px] font-medium tracking-wide">
                      {item.category || "Misc."}
                    </span>
                  </td>

                  {/* Price */}
                  <td className="px-6 py-3 font-mono font-medium text-right text-slate-300">{item.price || "-"}</td>

                  {/* Stock */}
                  <td className="px-6 py-3 font-mono font-bold text-right text-white">{item.quantity}</td>

                  {/* Status */}
                  <td className="px-6 py-3 text-center">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold tracking-wide border ${
                      item.quantity > 5
                        ? "bg-brand-success/10 text-brand-success border-brand-success/20"
                        : item.quantity === 0
                        ? "bg-red-500/10 text-red-400 border-red-500/20"
                        : "bg-brand-warning/10 text-brand-warning border-brand-warning/20"
                    }`}>
                      {item.quantity > 5 ? "IN STOCK" : item.quantity === 0 ? "OUT OF STOCK" : "LOW STOCK"}
                    </span>
                  </td>

                  {/* Actions */}
                  {canEdit && (
                    <td className="px-6 py-3 text-right">
                      <button
                        onClick={() => openEdit(item)}
                        className="p-1.5 text-slate-400 hover:text-[#7c3aed] hover:bg-[#7c3aed]/10 rounded-lg transition-all border border-transparent hover:border-[#7c3aed]/30"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-brand-border/50 bg-transparent flex justify-between items-center text-xs text-slate-400 font-medium relative z-10">
          <p>Showing {filtered.length} visible items out of {items.length} total active items</p>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 hover:text-white transition-colors">Previous</button>
            <button className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 hover:text-white transition-colors">Next</button>
          </div>
        </div>
      </div>

      {/* ── Add / Edit Modal ─────────────────────────────────────────────────── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="bg-brand-card border border-brand-border rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border-gradient-top">

            {/* Modal header */}
            <div className="px-6 py-4 border-b border-brand-border flex justify-between items-center bg-brand-bg/60">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                {editingItem
                  ? <><Edit2 className="w-4 h-4 text-[#4a9eff]" /> Edit Item</>
                  : <><Plus className="w-5 h-5 text-[#4a9eff]" /> Add New Inventory Item</>
                }
              </h3>
              <button
                onClick={() => { setIsAddModalOpen(false); setEditingItem(null); }}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal body */}
            <form onSubmit={handleSave} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">

              {/* Image upload */}
              <ImageDropzone value={formImage} onChange={setFormImage} />

              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Product / Book Name *</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-brand-bg border border-brand-border rounded-lg text-sm text-white focus:outline-none focus:border-[#4a9eff] focus:ring-1 focus:ring-[#4a9eff] transition-all"
                  placeholder="e.g. Advanced Mathematics"
                  required
                />
              </div>

              {/* Author */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Author Name</label>
                <input
                  type="text"
                  value={formAuthor}
                  onChange={(e) => setFormAuthor(e.target.value)}
                  className="w-full px-4 py-2.5 bg-brand-bg border border-brand-border rounded-lg text-sm text-white focus:outline-none focus:border-[#4a9eff] focus:ring-1 focus:ring-[#4a9eff] transition-all"
                  placeholder="e.g. R.D. Sharma"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* SKU */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">SKU / ID</label>
                  <input
                    type="text"
                    value={formSku}
                    onChange={(e) => setFormSku(e.target.value)}
                    disabled={!!editingItem} // ID cannot be changed once created
                    className="w-full px-4 py-2.5 bg-brand-bg border border-brand-border rounded-lg text-sm text-white focus:outline-none focus:border-[#4a9eff] focus:ring-1 focus:ring-[#4a9eff] transition-all font-mono disabled:opacity-50"
                    placeholder="PRD-123"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-4 py-2.5 bg-brand-bg border border-brand-border rounded-lg text-sm text-white focus:outline-none focus:border-[#4a9eff] focus:ring-1 focus:ring-[#4a9eff] transition-all appearance-none cursor-pointer"
                  >
                    <option>Stationery</option>
                    <option>Books</option>
                    <option>Record Books</option>
                    <option>Assignment Books</option>
                    <option>Office Supplies</option>
                    <option>Equipment</option>
                  </select>
                </div>

                {/* Price */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Price (₹)</label>
                  <input
                    type="text"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    className="w-full px-4 py-2.5 bg-brand-bg border border-brand-border rounded-lg text-sm text-white focus:outline-none focus:border-[#4a9eff] focus:ring-1 focus:ring-[#4a9eff] transition-all font-mono"
                    placeholder="0.00"
                  />
                </div>

                {/* Qty */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Stock Level</label>
                  <input
                    type="number"
                    min={0}
                    value={formQty}
                    onChange={(e) => setFormQty(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-brand-bg border border-brand-border rounded-lg text-sm text-white focus:outline-none focus:border-[#4a9eff] focus:ring-1 focus:ring-[#4a9eff] transition-all font-mono"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => { setIsAddModalOpen(false); setEditingItem(null); }}
                  className="flex-1 px-4 py-2.5 border border-brand-border bg-slate-800/50 hover:bg-slate-800 text-white rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2.5 bg-gradient-primary text-white rounded-lg font-semibold btn-glow transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin"/> : null}
                  {saving ? "Saving..." : editingItem ? "Save Changes" : "Create Item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
