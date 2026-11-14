'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Users,
  ShieldCheck,
  Landmark,
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  Info,
} from 'lucide-react';
import { ApplicationLogo } from '@/components/common/ApplicationLogo';
import { useSentinel } from '@/lib/storage/context';

type PortalParam = 'citizen' | 'officer' | 'admin';

interface PortalConfig {
  id: PortalParam;
  name: string;
  badge: string;
  subtitle: string;
  icon: React.ElementType;
  accentColor: string;
  badgeBg: string;
  badgeBorder: string;
  badgeColor: string;
  redirectUrl: string;
  allowedRolesDescription: string;
  demoUser: {
    name: string;
    email: string;
    role: string;
    badge?: string;
  };
}

const PORTAL_CONFIGS: Record<PortalParam, PortalConfig> = {
  citizen: {
    id: 'citizen',
    name: 'Citizen Portal',
    badge: 'Public Consumer Access',
    subtitle: 'Consumer Verification, Grievances & Rights Education',
    icon: Users,
    accentColor: '#14857D',
    badgeBg: '#E7F3F2',
    badgeBorder: '#BDE0DC',
    badgeColor: '#14857D',
    redirectUrl: '/citizen',
    allowedRolesDescription: 'CITIZEN',
    demoUser: {
      name: 'Public Consumer User',
      email: 'public.citizen@sentinel.org',
      role: 'CITIZEN',
    },
  },
  officer: {
    id: 'officer',
    name: 'Officer Portal',
    badge: 'Enforcement Surveillance',
    subtitle: 'Legal Metrology Surveillance, Inspections & Triage',
    icon: ShieldCheck,
    accentColor: '#0F5F59',
    badgeBg: '#E2EEEC',
    badgeBorder: '#B5D8D4',
    badgeColor: '#0F5F59',
    redirectUrl: '/officer',
    allowedRolesDescription: 'OFFICER / CONTROLLER',
    demoUser: {
      name: 'Inspector Vikram Anand',
      email: 'v.anand@delhi.gov.in',
      role: 'OFFICER',
      badge: 'LMO-DEL-409',
    },
  },
  admin: {
    id: 'admin',
    name: 'Admin Portal',
    badge: 'National Directorate',
    subtitle: 'Rule Registry, Users, Jurisdictions & System Audit',
    icon: Landmark,
    accentColor: '#0D2B28',
    badgeBg: '#FEF7EC',
    badgeBorder: '#F7DDB6',
    badgeColor: '#B7791F',
    redirectUrl: '/admin',
    allowedRolesDescription: 'ADMIN',
    demoUser: {
      name: 'Devraj Sen (System Admin)',
      email: 'admin.sentinel@nic.in',
      role: 'ADMIN',
    },
  },
};

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, currentUser } = useSentinel();

  const rawPortal = (searchParams.get('portal') || 'citizen').toLowerCase() as PortalParam;
  const activePortalKey: PortalParam = PORTAL_CONFIGS[rawPortal] ? rawPortal : 'citizen';
  const portal = PORTAL_CONFIGS[activePortalKey];

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // If already logged in with authorized role for this portal, offer auto-redirect
  useEffect(() => {
    if (currentUser) {
      if (
        (activePortalKey === 'citizen' && currentUser.role === 'CITIZEN') ||
        (activePortalKey === 'officer' && (currentUser.role === 'OFFICER' || currentUser.role === 'CONTROLLER')) ||
        (activePortalKey === 'admin' && currentUser.role === 'ADMIN')
      ) {
        // Pre-fill email with current user
        setEmail(currentUser.email);
        setPassword('••••••••••••');
      }
    }
  }, [currentUser, activePortalKey]);

  const handleFillDemo = () => {
    setEmail(portal.demoUser.email);
    setPassword('DemoSession@2026');
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Email or User ID is required.');
      return;
    }

    if (!password) {
      setError('Password is required.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const result = login(email, password, activePortalKey);

      if (!result.success) {
        setError(result.error || 'Authentication failed. Please verify credentials.');
        setIsLoading(false);
        return;
      }

      // Successful authentication: redirect to the authorized portal
      if (result.user?.role === 'CITIZEN') {
        router.push('/citizen');
      } else if (result.user?.role === 'OFFICER' || result.user?.role === 'CONTROLLER') {
        router.push('/officer');
      } else if (result.user?.role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push(portal.redirectUrl);
      }
    }, 350);
  };

  const IconComponent = portal.icon;

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#FAF9F6',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        color: '#1C2526',
        fontFamily: 'var(--font-family, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif)',
      }}
    >
      {/* Top Header */}
      <header
        style={{
          padding: '20px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #ECEEEA',
          backgroundColor: '#FFFFFF',
        }}
      >
        <Link
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            fontWeight: 600,
            color: '#0F5F59',
            textDecoration: 'none',
            padding: '6px 12px',
            borderRadius: '6px',
            backgroundColor: '#F6F8F8',
            border: '1px solid #E4EBEA',
            transition: 'background 0.15s ease',
          }}
          className="back-btn-hover"
        >
          <ArrowLeft size={16} />
          <span>Back to Portal Selection</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center' }}>
          <ApplicationLogo size="sm" showSubtitle={false} />
        </div>
      </header>

      {/* Main Login Card Container */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 20px',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '480px',
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E2E6E4',
            boxShadow: '0 8px 30px rgba(13, 43, 40, 0.06)',
            padding: '36px 32px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Portal Accent Line */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              backgroundColor: portal.accentColor,
            }}
          />

          {/* Portal Header */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '14px',
                backgroundColor: portal.badgeBg,
                color: portal.badgeColor,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '14px',
                border: `1px solid ${portal.badgeBorder}`,
              }}
            >
              <IconComponent size={28} />
            </div>

            <div style={{ marginBottom: '8px' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.6px',
                  padding: '3px 10px',
                  borderRadius: '100px',
                  backgroundColor: portal.badgeBg,
                  color: portal.badgeColor,
                  border: `1px solid ${portal.badgeBorder}`,
                }}
              >
                {portal.badge}
              </span>
            </div>

            <h1
              style={{
                fontSize: '24px',
                fontWeight: 800,
                color: '#0D2B28',
                letterSpacing: '-0.5px',
                margin: '0 0 6px 0',
              }}
            >
              {portal.name}
            </h1>
            <p
              style={{
                fontSize: '13px',
                color: '#6B7A7A',
                margin: 0,
                lineHeight: 1.4,
              }}
            >
              {portal.subtitle}
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                padding: '12px 14px',
                borderRadius: '8px',
                backgroundColor: '#FDF1F1',
                border: '1px solid #F8C7C7',
                color: '#C44747',
                fontSize: '13px',
                lineHeight: 1.45,
                marginBottom: '20px',
              }}
              role="alert"
            >
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Authorization Failure:</strong> {error}
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            {/* Email / User ID */}
            <div style={{ marginBottom: '18px' }}>
              <label
                htmlFor="user-email"
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#1C2526',
                  marginBottom: '6px',
                }}
              >
                Email Address / User ID
              </label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={16}
                  color="#6B7A7A"
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none',
                  }}
                />
                <input
                  id="user-email"
                  type="text"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder={portal.demoUser.email}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '11px 12px 11px 38px',
                    borderRadius: '8px',
                    border: '1px solid #CDD8D6',
                    fontSize: '14px',
                    color: '#1C2526',
                    backgroundColor: '#FFFFFF',
                    outline: 'none',
                    transition: 'border-color 0.15s ease',
                  }}
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: '18px' }}>
              <label
                htmlFor="user-password"
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#1C2526',
                  marginBottom: '6px',
                }}
              >
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={16}
                  color="#6B7A7A"
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none',
                  }}
                />
                <input
                  id="user-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="Enter your password"
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '11px 40px 11px 38px',
                    borderRadius: '8px',
                    border: '1px solid #CDD8D6',
                    fontSize: '14px',
                    color: '#1C2526',
                    backgroundColor: '#FFFFFF',
                    outline: 'none',
                    transition: 'border-color 0.15s ease',
                  }}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    padding: '4px',
                    cursor: 'pointer',
                    color: '#6B7A7A',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '22px',
              }}
            >
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '13px',
                  color: '#435453',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ cursor: 'pointer' }}
                />
                <span>Remember me on this browser</span>
              </label>

              <span
                style={{
                  fontSize: '12px',
                  color: portal.accentColor,
                  fontWeight: 600,
                }}
              >
                Role: {portal.allowedRolesDescription}
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '12px 18px',
                borderRadius: '8px',
                backgroundColor: portal.accentColor,
                color: '#FFFFFF',
                fontSize: '14px',
                fontWeight: 600,
                border: 'none',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                opacity: isLoading ? 0.75 : 1,
                transition: 'all 0.15s ease',
              }}
            >
              <span>{isLoading ? 'Verifying Authorization...' : `Sign In to ${portal.name}`}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Demo Mode Quick Access Assistant */}
          <div
            style={{
              marginTop: '28px',
              paddingTop: '20px',
              borderTop: '1px solid #ECEEEA',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '11px',
                fontWeight: 700,
                color: '#8A5D18',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '8px',
              }}
            >
              <Info size={12} color="#B7791F" />
              <span>Demo Mode Credentials Assistant</span>
            </div>

            <p
              style={{
                fontSize: '12px',
                color: '#6B7A7A',
                margin: '0 0 10px 0',
                lineHeight: 1.4,
              }}
            >
              This deployment is running in local demonstration mode. Click below to load authorized {portal.name} credentials:
            </p>

            <button
              type="button"
              onClick={handleFillDemo}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                borderRadius: '6px',
                backgroundColor: '#FAF5EA',
                border: '1px solid #EEDBBE',
                fontSize: '12px',
                color: '#8A5D18',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <KeyRound size={14} color="#B7791F" />
                <span>
                  <strong>{portal.demoUser.name}</strong> ({portal.demoUser.email})
                </span>
              </div>
              <span style={{ fontWeight: 600, color: '#0F5F59' }}>Use Demo</span>
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid #ECEEEA',
          backgroundColor: '#FFFFFF',
          padding: '16px 32px',
          textAlign: 'center',
          fontSize: '12px',
          color: '#6B7A7A',
        }}
      >
        <div>
          The Legal Metrology Act, 2009 & Packaged Commodities Rules, 2011 • Authenticated Portal Session
        </div>
      </footer>

      <style>{`
        .back-btn-hover:hover {
          background-color: #E2EEEC !important;
        }
      `}</style>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#FAF9F6',
            color: '#0F5F59',
            fontSize: '15px',
            fontWeight: 600,
          }}
        >
          Loading Portal Authentication...
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
