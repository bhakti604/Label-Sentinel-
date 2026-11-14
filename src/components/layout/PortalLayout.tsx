'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sidebar, PortalType } from './Sidebar';
import { Topbar } from './Topbar';
import { NotificationContainer } from '../common/Notification';
import { ShieldAlert, Info, Lock, ArrowRight, ArrowLeft, KeyRound } from 'lucide-react';
import { useSentinel } from '@/lib/storage/context';

interface PortalLayoutProps {
  portal: PortalType;
  children: React.ReactNode;
}

export const PortalLayout: React.FC<PortalLayoutProps> = ({
  portal,
  children,
}) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { currentUser, isHydrated, login } = useSentinel();
  const router = useRouter();

  // Validate user authorization for this portal
  const checkAuth = () => {
    if (!currentUser) return 'UNAUTHENTICATED';
    if (portal === 'citizen' && currentUser.role === 'CITIZEN') return 'AUTHORIZED';
    if (portal === 'officer' && (currentUser.role === 'OFFICER' || currentUser.role === 'CONTROLLER')) return 'AUTHORIZED';
    if (portal === 'admin' && currentUser.role === 'ADMIN') return 'AUTHORIZED';
    return 'UNAUTHORIZED';
  };

  const authStatus = isHydrated ? checkAuth() : 'CHECKING';

  const demoAccounts: Record<PortalType, { email: string; name: string; role: string }> = {
    citizen: { email: 'public.citizen@sentinel.org', name: 'Public Consumer User', role: 'CITIZEN' },
    officer: { email: 'v.anand@delhi.gov.in', name: 'Inspector Vikram Anand', role: 'OFFICER' },
    admin: { email: 'admin.sentinel@nic.in', name: 'Devraj Sen (System Admin)', role: 'ADMIN' },
  };

  const handleInstantDemoLogin = () => {
    const demo = demoAccounts[portal];
    login(demo.email, 'demo', portal);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', backgroundColor: '#F6F8F8' }}>
      {/* Sidebar */}
      <Sidebar
        portal={portal}
        isOpenMobile={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      {/* Main Content wrapper */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          marginLeft: '260px',
        }}
        className="portal-main-wrapper"
      >
        <style>{`
          @media (max-width: 900px) {
            .portal-main-wrapper {
              margin-left: 0 !important;
            }
          }
        `}</style>

        {/* Topbar */}
        <Topbar
          portal={portal}
          onOpenMobileSidebar={() => setIsMobileOpen(true)}
        />

        {/* Statutory Legal Disclaimer Banner */}
        <div
          style={{
            backgroundColor: '#E7F3F2',
            borderBottom: '1px solid #BDE0DC',
            padding: '8px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '12px',
            color: '#0F5F59',
            lineHeight: 1.4,
          }}
        >
          <Info size={15} style={{ flexShrink: 0 }} />
          <span>
            <strong>Statutory Compliance Notice:</strong> LABEL SENTINEL operates as an automated compliance-support
            decision system. OCR extractions and deterministic rule evaluations assist verification and do not substitute
            for statutory authority under The Legal Metrology Act, 2009. Uncertain findings are remanded for officer review.
          </span>
        </div>

        {/* Page Content Body / Access Control Gates */}
        <main style={{ flex: 1, padding: '24px', maxWidth: '1400px', width: '100%', boxSizing: 'border-box' }}>
          {authStatus === 'CHECKING' && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '80px 20px',
                color: '#0F5F59',
                fontSize: '14px',
                fontWeight: 600,
              }}
            >
              Verifying Portal Authorization...
            </div>
          )}

          {authStatus === 'UNAUTHENTICATED' && (
            <div
              style={{
                maxWidth: '560px',
                margin: '40px auto',
                backgroundColor: '#FFFFFF',
                borderRadius: '14px',
                border: '1px solid #E2E6E4',
                boxShadow: '0 8px 24px rgba(13, 43, 40, 0.05)',
                padding: '36px 32px',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '14px',
                  backgroundColor: '#E7F3F2',
                  color: '#14857D',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                  border: '1px solid #BDE0DC',
                }}
              >
                <Lock size={28} />
              </div>

              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.6px',
                  padding: '3px 10px',
                  borderRadius: '100px',
                  backgroundColor: '#FAF5EA',
                  color: '#8A5D18',
                  border: '1px solid #EEDBBE',
                  display: 'inline-block',
                  marginBottom: '10px',
                }}
              >
                Authentication Required
              </div>

              <h2
                style={{
                  fontSize: '22px',
                  fontWeight: 800,
                  color: '#0D2B28',
                  letterSpacing: '-0.4px',
                  margin: '0 0 10px 0',
                }}
              >
                {portal.toUpperCase()} PORTAL ACCESS REQUIRED
              </h2>

              <p
                style={{
                  fontSize: '14px',
                  color: '#5A6A69',
                  lineHeight: 1.5,
                  margin: '0 0 24px 0',
                }}
              >
                You are attempting to access the {portal.toUpperCase()} Portal. An authorized session with statutory credentials is required to continue.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <Link
                  href={`/login?portal=${portal}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '12px 18px',
                    borderRadius: '8px',
                    backgroundColor: portal === 'officer' ? '#0F5F59' : portal === 'admin' ? '#0D2B28' : '#14857D',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    fontWeight: 600,
                    textDecoration: 'none',
                  }}
                >
                  <span>Sign In to {portal.toUpperCase()} Portal</span>
                  <ArrowRight size={16} />
                </Link>

                <button
                  type="button"
                  onClick={handleInstantDemoLogin}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '10px 18px',
                    borderRadius: '8px',
                    backgroundColor: '#FAF5EA',
                    border: '1px solid #EEDBBE',
                    color: '#8A5D18',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <KeyRound size={14} color="#B7791F" />
                  <span>Instant Demo Sign-in ({demoAccounts[portal].email})</span>
                </button>

                <Link
                  href="/"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '10px 18px',
                    borderRadius: '8px',
                    backgroundColor: '#F6F8F8',
                    border: '1px solid #E4EBEA',
                    color: '#6B7A7A',
                    fontSize: '13px',
                    fontWeight: 500,
                    textDecoration: 'none',
                    marginTop: '4px',
                  }}
                >
                  <ArrowLeft size={14} />
                  <span>Return to Portal Selection</span>
                </Link>
              </div>
            </div>
          )}

          {authStatus === 'UNAUTHORIZED' && (
            <div
              style={{
                maxWidth: '600px',
                margin: '40px auto',
                backgroundColor: '#FFFFFF',
                borderRadius: '14px',
                border: '1px solid #F8C7C7',
                boxShadow: '0 8px 24px rgba(196, 71, 71, 0.08)',
                padding: '36px 32px',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '14px',
                  backgroundColor: '#FDF1F1',
                  color: '#C44747',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                  border: '1px solid #F8C7C7',
                }}
              >
                <ShieldAlert size={28} />
              </div>

              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.6px',
                  padding: '3px 10px',
                  borderRadius: '100px',
                  backgroundColor: '#FDF1F1',
                  color: '#C44747',
                  border: '1px solid #F8C7C7',
                  display: 'inline-block',
                  marginBottom: '10px',
                }}
              >
                HTTP 403 — UNAUTHORIZED PORTAL ACCESS
              </div>

              <h2
                style={{
                  fontSize: '22px',
                  fontWeight: 800,
                  color: '#0D2B28',
                  letterSpacing: '-0.4px',
                  margin: '0 0 10px 0',
                }}
              >
                Access Denied to {portal.toUpperCase()} Portal
              </h2>

              <p
                style={{
                  fontSize: '14px',
                  color: '#5A6A69',
                  lineHeight: 1.55,
                  margin: '0 0 24px 0',
                }}
              >
                Your active session is authenticated as <strong>{currentUser?.name}</strong> ({currentUser?.email}) with role <strong>{currentUser?.role}</strong>. This identity does not possess statutory authorization for the {portal.toUpperCase()} Portal.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <Link
                  href={`/login?portal=${portal}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '12px 18px',
                    borderRadius: '8px',
                    backgroundColor: '#C44747',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    fontWeight: 600,
                    textDecoration: 'none',
                  }}
                >
                  <span>Sign In with Authorized Credentials</span>
                  <ArrowRight size={16} />
                </Link>

                <Link
                  href={currentUser?.role === 'CITIZEN' ? '/citizen' : currentUser?.role === 'ADMIN' ? '/admin' : '/officer'}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '10px 18px',
                    borderRadius: '8px',
                    backgroundColor: '#FAF5EA',
                    border: '1px solid #EEDBBE',
                    color: '#8A5D18',
                    fontSize: '13px',
                    fontWeight: 600,
                    textDecoration: 'none',
                  }}
                >
                  <span>Return to My Authorized Dashboard ({currentUser?.role})</span>
                </Link>

                <Link
                  href="/"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '10px 18px',
                    borderRadius: '8px',
                    backgroundColor: '#F6F8F8',
                    border: '1px solid #E4EBEA',
                    color: '#6B7A7A',
                    fontSize: '13px',
                    fontWeight: 500,
                    textDecoration: 'none',
                    marginTop: '4px',
                  }}
                >
                  <ArrowLeft size={14} />
                  <span>Return to Portal Selection</span>
                </Link>
              </div>
            </div>
          )}

          {authStatus === 'AUTHORIZED' && children}
        </main>
      </div>

      {/* Toast Notification Container */}
      <NotificationContainer />
    </div>
  );
};
