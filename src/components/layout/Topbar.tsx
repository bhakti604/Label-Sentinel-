'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, ShieldCheck, User, Bell, ChevronDown, CheckCircle2, RotateCcw, LogOut } from 'lucide-react';
import { useSentinel } from '@/lib/storage/context';
import { PortalType } from './Sidebar';

interface TopbarProps {
  portal: PortalType;
  onOpenMobileSidebar: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  portal,
  onOpenMobileSidebar,
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { currentUser, logout, resetToDefaults } = useSentinel();
  const router = useRouter();

  const userLabels = {
    citizen: {
      name: 'Consumer Session',
      role: 'Public Verification Access',
      badge: 'CITIZEN',
      department: 'Public Citizen Portal',
    },
    officer: {
      name: 'Inspector Vikram Anand',
      role: 'Legal Metrology Officer',
      badge: 'LMO-DEL-409',
      department: 'Central District Zone, Delhi',
    },
    admin: {
      name: 'Directorate Administrator',
      role: 'National Metrology Directorate',
      badge: 'SYS-ADMIN',
      department: 'Regulatory IT Operations',
    },
  };

  const defaultProfile = userLabels[portal];
  const currentProfile = {
    name: currentUser ? currentUser.name : defaultProfile.name,
    role: currentUser ? currentUser.role : defaultProfile.role,
    badge: currentUser?.badgeNumber || defaultProfile.badge,
    department: currentUser?.jurisdictionName || defaultProfile.department,
  };

  return (
    <header
      style={{
        height: '64px',
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #E4EBEA',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 800,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={onOpenMobileSidebar}
          style={{
            display: 'none',
            padding: '6px',
            borderRadius: '6px',
            color: '#1C2526',
            backgroundColor: '#F6F8F8',
            border: '1px solid #E4EBEA',
          }}
          className="topbar-mobile-menu-btn"
          aria-label="Toggle navigation menu"
        >
          <Menu size={20} />
        </button>
        <style>{`
          @media (max-width: 900px) {
            .topbar-mobile-menu-btn {
              display: flex !important;
            }
          }
        `}</style>

        {/* Regulatory Act reference chip */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '4px 10px',
            borderRadius: '4px',
            backgroundColor: '#F6F8F8',
            border: '1px solid #E4EBEA',
            fontSize: '12px',
          }}
          className="hide-xs"
        >
          <ShieldCheck size={14} color="#14857D" />
          <span style={{ fontWeight: 600, color: '#1C2526' }}>
            The Legal Metrology (Packaged Commodities) Rules, 2011
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* System Health / Operational Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            borderRadius: '4px',
            backgroundColor: '#EAF5F0',
            border: '1px solid #B7E1CD',
            fontSize: '11px',
            fontWeight: 600,
            color: '#23845B',
          }}
          title="Rule engine operational: PCR-2024.1.0"
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: '#23845B',
            }}
          />
          <span>Compliance Engine: Active</span>
        </div>

        {/* User Identity Pill with Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setShowProfileMenu((prev) => !prev)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '4px 10px 4px 6px',
              borderRadius: '20px',
              border: '1px solid #E4EBEA',
              backgroundColor: '#FFFFFF',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: portal === 'officer' ? '#0F5F59' : portal === 'admin' ? '#1C2526' : '#14857D',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <User size={15} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#1C2526', lineHeight: 1.2 }}>
                {currentProfile.name}
              </span>
              <span style={{ fontSize: '10px', color: '#6B7A7A' }}>
                {currentProfile.badge}
              </span>
            </div>
            <ChevronDown size={14} color="#6B7A7A" />
          </button>

          {showProfileMenu && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '6px',
                width: '240px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E4EBEA',
                borderRadius: '8px',
                boxShadow: '0 10px 15px -3px rgba(28, 37, 38, 0.1)',
                padding: '12px',
                zIndex: 1000,
              }}
            >
              <div style={{ paddingBottom: '8px', borderBottom: '1px solid #F6F8F8', marginBottom: '8px' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#1C2526' }}>
                  {currentProfile.name}
                </div>
                <div style={{ fontSize: '11px', color: '#6B7A7A' }}>
                  {currentProfile.role}
                </div>
                <div style={{ fontSize: '11px', color: '#14857D', marginTop: '2px', fontWeight: 500 }}>
                  {currentProfile.department}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px', color: '#6B7A7A' }}>
                <div>Session Security: TLS 1.3 Verified</div>
                <div>Storage Mode: Local Persistent</div>
              </div>

              <button
                type="button"
                onClick={() => {
                  resetToDefaults();
                  setShowProfileMenu(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '6px 8px',
                  borderRadius: '4px',
                  backgroundColor: '#F6F8F8',
                  color: '#6B7A7A',
                  fontSize: '11px',
                  fontWeight: 500,
                  marginTop: '10px',
                  width: '100%',
                  cursor: 'pointer',
                  border: '1px solid #E4EBEA',
                }}
                title="Restore default mock records and clear localStorage changes"
              >
                <RotateCcw size={12} /> Reset to Demo Records
              </button>

              <button
                type="button"
                onClick={() => {
                  logout();
                  setShowProfileMenu(false);
                  router.push('/');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '7px 8px',
                  borderRadius: '4px',
                  backgroundColor: '#FDF1F1',
                  color: '#C44747',
                  fontSize: '11px',
                  fontWeight: 600,
                  marginTop: '6px',
                  width: '100%',
                  cursor: 'pointer',
                  border: '1px solid #F8C7C7',
                }}
                title="Sign out of active session and return to portal selection"
              >
                <LogOut size={12} /> Sign Out & Switch Portal
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
