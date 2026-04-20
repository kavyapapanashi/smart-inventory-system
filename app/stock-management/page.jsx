"use client";

import React from "react";
import { AlertTriangle, Clock, Truck, PackageCheck, Save, Box } from "lucide-react";

export default function StockManagementPage() {
  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto relative z-10 px-8 py-6">
      
      {/* Header Section */}
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 pb-4 border-b border-brand-border">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
            <span>Stockline</span>
            <span className="text-slate-600">/</span>
            <span className="text-white font-medium text-gradient">Administration</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight mt-1">Stock Management</h2>
        </div>
      </header>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
        
        {/* Left Column - Low Stock Alerts & Updates */}
        <div className="space-y-8">
          
          <div className="bg-brand-card border border-brand-danger/30 rounded-xl p-6 glow-hover flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-danger/5 blur-[50px] rounded-full pointer-events-none" />
            
            <h3 className="text-xl font-semibold mb-6 flex items-center justify-between z-10">
              <span className="flex items-center gap-2 text-brand-danger">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                Critical Stock Resolution
              </span>
              <span className="bg-brand-danger/10 text-brand-danger text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider border border-brand-danger/20">Action Required</span>
            </h3>

            <div className="space-y-4 z-10">
              {/* Alert Item 1 */}
              <div className="p-5 bg-[#080b14] border border-brand-border rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all hover:bg-brand-bg/80">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-slate-800/80 border border-slate-700 flex items-center justify-center flex-shrink-0">
                    <Box className="w-5 h-5 text-slate-300" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-100">Wireless Headphones</p>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">ID: PRD-102</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="flex flex-col items-end mr-2">
                    <p className="text-brand-danger font-bold text-sm">3 left</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">Min: 10</p>
                  </div>
                  <div className="flex gap-2 flex-1 sm:flex-initial">
                    <input type="number" defaultValue="7" className="w-16 px-2 py-1.5 bg-[#080b14] border border-brand-border rounded-lg text-sm text-center text-white focus:outline-none focus:border-[#4a9eff] focus:ring-1 focus:ring-[#4a9eff] font-mono" />
                    <button className="p-2 bg-gradient-primary rounded-lg text-white hover:scale-105 active:scale-95 transition-transform shadow-lg btn-glow flex-shrink-0" title="Restock">
                      <Save className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

               {/* Alert Item 2 */}
              <div className="p-5 bg-[#080b14] border border-brand-border rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all hover:bg-brand-bg/80">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-slate-800/80 border border-slate-700 flex items-center justify-center flex-shrink-0">
                    <Box className="w-5 h-5 text-slate-300" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-100">Engineering Kit</p>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">ID: PRD-045</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="flex flex-col items-end mr-2">
                    <p className="text-brand-danger font-bold text-sm">5 left</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">Min: 15</p>
                  </div>
                  <div className="flex gap-2 flex-1 sm:flex-initial">
                    <input type="number" defaultValue="10" className="w-16 px-2 py-1.5 bg-[#080b14] border border-brand-border rounded-lg text-sm text-center text-white focus:outline-none focus:border-[#4a9eff] focus:ring-1 focus:ring-[#4a9eff] font-mono" />
                    <button className="p-2 bg-gradient-primary rounded-lg text-white hover:scale-105 active:scale-95 transition-transform shadow-lg btn-glow flex-shrink-0" title="Restock">
                      <Save className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
        </div>

        {/* Right Column - Fulfillment & Deliveries */}
        <div className="space-y-8">

          {/* Pending Pre-Booking Collections */}
          <div className="bg-brand-card border border-brand-border rounded-xl p-6 glow-hover border-gradient-top flex flex-col relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-[#4a9eff]/5 blur-[50px] rounded-full pointer-events-none" />
             
             <h3 className="text-xl font-semibold mb-6 flex items-center justify-between z-10">
              <span className="flex items-center gap-2 text-white">
                <PackageCheck className="w-5 h-5 text-[#4a9eff] flex-shrink-0" />
                Manage Pre-Bookings
              </span>
            </h3>

            <div className="space-y-3 z-10">
              <div className="p-4 bg-[#080b14] border border-brand-border rounded-xl flex justify-between items-center group hover:bg-brand-bg/60 transition-colors">
                <div>
                  <p className="font-bold text-sm text-slate-200">Logitech MX Master 3</p>
                  <p className="text-[11px] text-slate-500 mt-1">Booked by: <span className="text-white font-medium">Alex User</span> · Qty: 2</p>
                </div>
                <button className="px-4 py-2 bg-brand-success/10 text-brand-success border border-brand-success/20 hover:bg-brand-success hover:text-white rounded-lg text-xs font-bold uppercase tracking-widest transition-colors flex flex-shrink-0 items-center justify-center">
                  Mark Collected
                </button>
              </div>

               <div className="p-4 bg-[#080b14] border border-brand-border rounded-xl flex justify-between items-center group hover:bg-brand-bg/60 transition-colors">
                <div>
                  <p className="font-bold text-sm text-slate-200">Herman Miller Aeron</p>
                  <p className="text-[11px] text-slate-500 mt-1">Booked by: <span className="text-white font-medium">Emma Wilson</span> · Qty: 1</p>
                </div>
                <button className="px-4 py-2 bg-brand-success/10 text-brand-success border border-brand-success/20 hover:bg-brand-success hover:text-white rounded-lg text-xs font-bold uppercase tracking-widest transition-colors flex flex-shrink-0 items-center justify-center">
                  Mark Collected
                </button>
              </div>
            </div>
          </div>

          {/* Incoming Deliveries Countdown */}
          <div className="bg-brand-card border border-brand-border rounded-xl p-6 glow-hover border-gradient-top flex flex-col">
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2 text-white">
              <Truck className="w-5 h-5 text-[#7c3aed] flex-shrink-0" />
              Incoming Deliveries
            </h3>

            <div className="space-y-4">
              <div className="p-5 bg-gradient-to-r from-[#080b14] to-[#161f33] border border-[#7c3aed]/20 rounded-xl flex justify-between items-center">
                <div>
                  <p className="font-bold text-slate-100">Mechanical Keyboards</p>
                  <p className="text-xs font-medium text-[#4a9eff] mt-1">+50 units expected directly from vendor</p>
                </div>
                
                <div className="flex gap-2 text-center">
                  <div className="bg-[#080b14] border border-[#7c3aed]/30 p-2 rounded-lg min-w-[50px] shadow-inner flex flex-col items-center justify-center">
                    <p className="font-bold text-xl leading-none text-white font-mono">02</p>
                    <p className="text-[9px] text-[#7c3aed] uppercase tracking-widest font-bold mt-1">Days</p>
                  </div>
                  <div className="bg-[#080b14] border border-[#7c3aed]/30 p-2 rounded-lg min-w-[50px] shadow-inner flex flex-col items-center justify-center">
                    <p className="font-bold text-xl leading-none text-white font-mono">14</p>
                    <p className="text-[9px] text-[#7c3aed] uppercase tracking-widest font-bold mt-1">Hrs</p>
                  </div>
                </div>
              </div>
              
              {/* Manual Update Delivery Form */}
              <div className="flex gap-3 pt-2">
                 <input type="text" placeholder="Incoming item ID..." className="flex-1 px-4 py-2.5 bg-[#080b14] border border-brand-border rounded-lg text-sm text-white focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed] transition-all" />
                 <input type="date" className="w-40 px-4 py-2.5 bg-[#080b14] border border-brand-border rounded-lg text-sm text-slate-400 focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed] transition-all" />
                 <button className="px-5 py-2.5 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition">Update</button>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
