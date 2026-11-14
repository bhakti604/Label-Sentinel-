'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ScanLine,
  FileCheck2,
  History,
  FileWarning,
  Sparkles,
  ClipboardList,
  SearchCheck,
  Inbox,
  Briefcase,
  BarChart3,
  Users,
  Scale,
  MapPin,
  ShieldAlert,
  ArrowRightLeft,
  X,
  ExternalLink,
  LucideIcon,
} from 'lucide-react';
import { ApplicationLogo } from '../common/ApplicationLogo';
import { useSentinel } from '@/lib/storage/context';

export type PortalType = 'citizen' | 'officer' | 'admin';

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  countBadge?: number;
  badgeVariant?: 'warning' | 'teal';
}

interface SidebarProps {
  portal: PortalType;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  portal,
  isOpenMobile,
  onCloseMobile,
}) => {
  const pathname = usePathname();
  const { scans, complaints } = useSentinel();

  // Badges calculation
  const needsReviewCount = scans.flatMap((s) => s.evaluations).filter((e) => e.requiresOfficerReview || e.status === 'NEEDS_REVIEW').length;
  const pendingComplaintsCount = complaints.filter((c) => c.status === 'SUBMITTED' || c.status === 'UNDER_REVIEW').length;

  const citizenNav: NavItem[] = [
    { label: 'Dashboard', href: '/citizen', icon: LayoutDashboard },
    { label: 'Product Scan', href: '/citizen/scan', icon: ScanLine },
    { label: 'Compliance Results', href: '/citizen/results', icon: FileCheck2 },
    { label: 'Scan History', href: '/citizen/history', icon: History },
    { label: 'Complaints', href: '/citizen/complaints', icon: FileWarning },
    { label: 'Know More AI', href: '/citizen/know-more', icon: Sparkles, badge: 'Info Only' },
  ];

  const officerNav: NavItem[] = [
    { label: 'Dashboard', href: '/officer', icon: LayoutDashboard },
    {
      label: 'Review Queue',
      href: '/officer/review-queue',
      icon: SearchCheck,
      countBadge: needsReviewCount,
      badgeVariant: 'warning',
    },
    { label: 'Inspections', href: '/officer/inspections', icon: ClipboardList },
    {
      label: 'Complaint Inbox',
      href: '/officer/complaints',
      icon: Inbox,
      countBadge: pendingComplaintsCount,
      badgeVariant: 'teal',
    },
    { label: 'Cases & Compounding', href: '/officer/cases', icon: Briefcase },
    { label: 'Compliance Reports', href: '/officer/reports', icon: BarChart3 },
  ];

  const adminNav: NavItem[] = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Users & Roles', href: '/admin/users', icon: Users },
    { label: 'Rule Registry', href: '/admin/rules', icon: Scale },
    { label: 'Jurisdictions', href: '/admin/jurisdictions', icon: MapPin },
    { label: 'Audit Logs', href: '/admin/audit-logs', icon: ShieldAlert },
  ];

  const navItems =
    portal === 'citizen' ? citizenNav : portal === 'officer' ? officerNav : adminNav;

  const portalTitle =
    portal === 'citizen'
      ? 'Citizen Portal'
      : portal === 'officer'
      ? 'Legal Metrology Officer'
      : 'National Administration';

  const portalThemeColor =
    portal === 'citizen' ? '#14857D' : portal === 'officer' ? '#0F5F59' : '#1C2526';

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(28, 37, 38, 0.45)',
            zIndex: 900,
          }}
        />
      )}

      {/* Sidebar Container */}
      <aside
        style={{
          width: '260px',
          height: '100vh',
          backgroundColor: '#FFFFFF',
          borderRight: '1px solid #E4EBEA',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 950,
          transform: isOpenMobile ? 'translateX(0)' : undefined,
          transition: 'transform 200ms ease',
        }}
        className={isOpenMobile ? 'sidebar-mobile-open' : 'sidebar-desktop'}
      >
        <style>{`
          @media (max-width: 900px) {
            .sidebar-desktop:not(.sidebar-mobile-open) {
              transform: translateX(-100%);
            }
          }
        `}</style>

        {/* Brand & Portal Badge */}
        <div
          style={{
            padding: '20px 18px',
            borderBottom: '1px solid #E4EBEA',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <ApplicationLogo size="sm" showSubtitle={false} />
            {isOpenMobile && (
              <button
                type="button"
                onClick={onCloseMobile}
                aria-label="Close navigation sidebar"
                style={{
                  padding: '4px',
                  color: '#6B7A7A',
                  borderRadius: '4px',
                  display: 'flex',
                }}
              >
                <X size={18} />
              </button>
            )}
          </div>

          <div
            style={{
              padding: '6px 10px',
              backgroundColor: '#F6F8F8',
              borderRadius: '6px',
              border: '1px solid #E4EBEA',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: portalThemeColor,
                }}
              />
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#1C2526' }}>
                {portalTitle}
              </span>
            </div>
            <span
              style={{
                fontSize: '10px',
                fontWeight: 600,
                color: '#6B7A7A',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              ACTIVE
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <div style={{ padding: '16px 12px', flex: 1, overflowY: 'auto' }}>
          <div
            style={{
              fontSize: '11px',
              fontWeight: 600,
              color: '#8E9C9B',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              paddingLeft: '10px',
              marginBottom: '8px',
            }}
          >
            Navigation
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === `/citizen` || item.href === `/officer` || item.href === `/admin`
                  ? pathname === item.href
                  : pathname?.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onCloseMobile}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '9px 12px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? '#0F5F59' : '#1C2526',
                    backgroundColor: isActive ? '#E7F3F2' : 'transparent',
                    border: isActive ? '1px solid #BDE0DC' : '1px solid transparent',
                    textDecoration: 'none',
                    transition: 'all 120ms ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Icon
                      size={17}
                      color={isActive ? '#14857D' : '#6B7A7A'}
                      strokeWidth={isActive ? 2.2 : 1.8}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 600,
                        padding: '1px 5px',
                        borderRadius: '3px',
                        backgroundColor: '#FEF7EC',
                        color: '#B7791F',
                        border: '1px solid #F7DDB6',
                      }}
                    >
                      {item.badge}
                    </span>
                  )}

                  {item.countBadge !== undefined && item.countBadge > 0 && (
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '1px 6px',
                        borderRadius: '10px',
                        backgroundColor:
                          item.badgeVariant === 'warning' ? '#FEF7EC' : '#E7F3F2',
                        color:
                          item.badgeVariant === 'warning' ? '#B7791F' : '#0F5F59',
                        border: `1px solid ${
                          item.badgeVariant === 'warning' ? '#F7DDB6' : '#BDE0DC'
                        }`,
                      }}
                    >
                      {item.countBadge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Portal Switcher & Landing link */}
        <div
          style={{
            padding: '14px',
            borderTop: '1px solid #E4EBEA',
            backgroundColor: '#F9FAFA',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <div
            style={{
              fontSize: '11px',
              fontWeight: 600,
              color: '#8E9C9B',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            Switch Active Portal
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '4px' }}>
            <Link
              href="/citizen"
              style={{
                textAlign: 'center',
                padding: '6px 4px',
                fontSize: '11px',
                fontWeight: portal === 'citizen' ? 700 : 500,
                borderRadius: '4px',
                backgroundColor: portal === 'citizen' ? '#14857D' : '#FFFFFF',
                color: portal === 'citizen' ? '#FFFFFF' : '#1C2526',
                border: '1px solid #E4EBEA',
                textDecoration: 'none',
              }}
            >
              Citizen
            </Link>
            <Link
              href="/officer"
              style={{
                textAlign: 'center',
                padding: '6px 4px',
                fontSize: '11px',
                fontWeight: portal === 'officer' ? 700 : 500,
                borderRadius: '4px',
                backgroundColor: portal === 'officer' ? '#0F5F59' : '#FFFFFF',
                color: portal === 'officer' ? '#FFFFFF' : '#1C2526',
                border: '1px solid #E4EBEA',
                textDecoration: 'none',
              }}
            >
              Officer
            </Link>
            <Link
              href="/admin"
              style={{
                textAlign: 'center',
                padding: '6px 4px',
                fontSize: '11px',
                fontWeight: portal === 'admin' ? 700 : 500,
                borderRadius: '4px',
                backgroundColor: portal === 'admin' ? '#1C2526' : '#FFFFFF',
                color: portal === 'admin' ? '#FFFFFF' : '#1C2526',
                border: '1px solid #E4EBEA',
                textDecoration: 'none',
              }}
            >
              Admin
            </Link>
          </div>

          <Link
            href="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              fontSize: '11px',
              fontWeight: 500,
              color: '#6B7A7A',
              padding: '6px',
              borderRadius: '4px',
              textDecoration: 'none',
              marginTop: '4px',
            }}
          >
            <ArrowRightLeft size={12} />
            <span>Portal Selection</span>
          </Link>
        </div>
      </aside>
    </>
  );
};
