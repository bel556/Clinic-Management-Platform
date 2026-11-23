import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';

export default function ReceptionLayout() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="app-container">
      {/* Mobile Backdrop Overlay */}
      <div
        className={`sidebar-overlay ${isMobileSidebarOpen ? 'mobile-open' : ''}`}
        onClick={() => setIsMobileSidebarOpen(false)}
        aria-hidden="true"
      />

      {/* Sidebar with responsive mobile drawer support */}
      <Sidebar
        isMobileOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="main-content-wrapper">
        <Header
          onToggleMenu={() => setIsMobileSidebarOpen((prev) => !prev)}
        />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
