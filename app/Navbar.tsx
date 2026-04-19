"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const links = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Inventory", href: "/inventory" },
    { name: "Pre-Booking", href: "/pre-booking" },
    { name: "Stock Management", href: "/stock-management" },
  ];

  return (
    <nav className="w-full bg-white border-b border-gray-200">
      <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* Left Section: Logo & Links */}
        <div className="flex items-center gap-10">
          <Link href="/" className="font-extrabold text-xl tracking-wider text-gray-900">
            STOCKLINE
          </Link>
          
          <div className="hidden md:flex items-center gap-6 h-16">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`h-full flex items-center text-[15px] font-medium transition-colors ${
                    isActive 
                      ? "text-gray-900 border-b-[3px] border-gray-900" 
                      : "text-gray-500 hover:text-gray-900 border-b-[3px] border-transparent"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right Section: Search & Profile */}
        <div className="flex items-center gap-6">
          
          {/* Search Bar */}
          <div className="relative hidden lg:block">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input 
              type="text" 
              className="pl-10 pr-4 py-2 w-64 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-gray-200 focus:bg-white transition-all text-gray-900 placeholder-gray-400"
              placeholder="Search resources..."
            />
          </div>

          {/* Notification Bell */}
          <button className="text-gray-400 hover:text-gray-600 transition-colors relative">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full ring-2 ring-white bg-red-400"></span>
          </button>

          {/* Profile Avatar placeholder */}
          <Link href="/login" className="h-9 w-9 rounded-full bg-gray-200 border-2 border-white shadow-sm overflow-hidden flex items-center justify-center hover:ring-2 hover:ring-gray-200 cursor-pointer transition">
             <div className="bg-gray-800 w-full h-full flex items-center justify-center text-white text-xs font-bold">
                Me
             </div>
          </Link>
          
        </div>

      </div>
    </nav>
  );
}
