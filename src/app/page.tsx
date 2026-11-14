'use client';

import React from 'react';
import Link from 'next/link';
import {
  Users,
  ShieldCheck,
  Landmark,
  ArrowRight,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { ApplicationLogo } from '@/components/common/ApplicationLogo';

export default function PortalSelectionPage() {
  const portalCards = [
    {
      id: 'citizen',
      title: 'Citizen Portal',
      tag: 'Public Consumer Access',
      tagColor: '#14857D',
      tagBg: '#E7F3F2',
      tagBorder: '#BDE0DC',
      icon: Users,
      iconColor: '#14857D',
      iconBg: '#E7F3F2',
      accentColor: '#14857D',
      description: 'Verify product labels, track complaints and understand consumer rights.',
      highlights: [
        'Live package label verification (OCR & Barcode)',
        'Statutory grievance registration & tracking',
        'Consumer rights knowledge & legal guidance',
      ],
      href: '/login?portal=citizen',
      buttonLabel: 'Continue to Citizen Portal',
    },
    {
      id: 'officer',
      title: 'Officer Portal',
      tag: 'Enforcement Surveillance',
      tagColor: '#0F5F59',
      tagBg: '#E2EEEC',
      tagBorder: '#B5D8D4',
      icon: ShieldCheck,
      iconColor: '#0F5F59',
      iconBg: '#E2EEEC',
      accentColor: '#0F5F59',
      description: 'Review complaints, conduct inspections and manage compliance cases.',
      highlights: [
        'AI-quarantined review queue adjudication',
        'On-site field inspections & sampling audits',
        'Section 36 prosecution dockets & compounding',
      ],
      href: '/login?portal=officer',
      buttonLabel: 'Continue to Officer Portal',
    },
    {
      id: 'admin',
      title: 'Admin Portal',
      tag: 'National Directorate',
      tagColor: '#B7791F',
      tagBg: '#FEF7EC',
      tagBorder: '#F7DDB6',
      icon: Landmark,
      iconColor: '#B7791F',
      iconBg: '#FEF7EC',
      accentColor: '#0D2B28',
      description: 'Manage users, statutory rules, jurisdictions and system settings.',
      highlights: [
        'Rule registry versioning & regex amendments',
        'State & district territorial jurisdiction mapping',
        'Immutable cryptographic audit logging',
      ],
      href: '/login?portal=admin',
      buttonLabel: 'Continue to Admin Portal',
    },
  ];

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
      {/* Top Header / Branding */}
      <header
        style={{
          padding: '24px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #ECEEEA',
          backgroundColor: '#FFFFFF',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <ApplicationLogo size="lg" showSubtitle={true} />
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '5px 12px',
            borderRadius: '100px',
            backgroundColor: '#FAF5EA',
            border: '1px solid #EEDBBE',
            fontSize: '11px',
            fontWeight: 600,
            color: '#8A5D18',
          }}
          className="hide-xs"
        >
          <Lock size={12} color="#B7791F" />
          <span>Statutory Authority: PCR 2011</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main
        style={{
          flex: 1,
          maxWidth: '1200px',
          width: '100%',
          margin: '0 auto',
          padding: '48px 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          boxSizing: 'border-box',
        }}
      >
        {/* Title & Introduction */}
        <div style={{ textAlign: 'center', maxWidth: '640px', marginBottom: '40px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: '100px',
              backgroundColor: '#E7F3F2',
              color: '#14857D',
              fontSize: '12px',
              fontWeight: 600,
              marginBottom: '16px',
              border: '1px solid #BDE0DC',
            }}
          >
            <span>Legal Metrology Compliance Platform</span>
          </div>
          <h1
            style={{
              fontSize: '32px',
              fontWeight: 800,
              color: '#0D2B28',
              letterSpacing: '-0.8px',
              lineHeight: 1.2,
              margin: '0 0 12px 0',
            }}
          >
            Welcome to Label Sentinel
          </h1>
          <p
            style={{
              fontSize: '16px',
              color: '#5A6A69',
              lineHeight: 1.5,
              margin: 0,
            }}
          >
            Select your portal to continue.
          </p>
        </div>

        {/* Portal Selection Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px',
            width: '100%',
          }}
        >
          {portalCards.map((portal) => {
            const IconComponent = portal.icon;
            return (
              <div
                key={portal.id}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '14px',
                  border: '1px solid #E2E6E4',
                  boxShadow: '0 4px 16px rgba(13, 43, 40, 0.04)',
                  padding: '32px 28px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                className="portal-selection-card"
              >
                {/* Top card accent line */}
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

                <div>
                  {/* Badge & Icon header */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '20px',
                    }}
                  >
                    <div
                      style={{
                        width: '52px',
                        height: '52px',
                        borderRadius: '12px',
                        backgroundColor: portal.iconBg,
                        color: portal.iconColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <IconComponent size={26} />
                    </div>

                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        backgroundColor: portal.tagBg,
                        color: portal.tagColor,
                        border: `1px solid ${portal.tagBorder}`,
                      }}
                    >
                      {portal.tag}
                    </span>
                  </div>

                  {/* Card Title & Description */}
                  <h2
                    style={{
                      fontSize: '22px',
                      fontWeight: 700,
                      color: '#0D2B28',
                      marginBottom: '10px',
                      letterSpacing: '-0.4px',
                    }}
                  >
                    {portal.title}
                  </h2>
                  <p
                    style={{
                      fontSize: '14px',
                      color: '#5A6A69',
                      lineHeight: 1.55,
                      marginBottom: '24px',
                      minHeight: '44px',
                    }}
                  >
                    {portal.description}
                  </p>

                  {/* Feature Highlights */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                      paddingTop: '16px',
                      borderTop: '1px solid #F0F2F1',
                      marginBottom: '28px',
                    }}
                  >
                    {portal.highlights.map((item, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '8px',
                          fontSize: '12.5px',
                          color: '#435453',
                          lineHeight: 1.4,
                        }}
                      >
                        <CheckCircle2
                          size={14}
                          color={portal.iconColor}
                          style={{ marginTop: '2px', flexShrink: 0 }}
                        />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Continue Action Button */}
                <Link
                  href={portal.href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    width: '100%',
                    padding: '12px 18px',
                    borderRadius: '8px',
                    backgroundColor: portal.accentColor,
                    color: '#FFFFFF',
                    fontSize: '14px',
                    fontWeight: 600,
                    textDecoration: 'none',
                    transition: 'all 0.15s ease',
                    boxSizing: 'border-box',
                  }}
                  className="portal-continue-btn"
                >
                  <span>{portal.buttonLabel}</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            );
          })}
        </div>
      </main>

      {/* Simplified, Dignified Footer */}
      <footer
        style={{
          borderTop: '1px solid #ECEEEA',
          backgroundColor: '#FFFFFF',
          padding: '20px 32px',
          textAlign: 'center',
          fontSize: '12px',
          color: '#6B7A7A',
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <strong>The Legal Metrology Act, 2009</strong> & The Legal Metrology (Packaged Commodities) Rules, 2011 (PCR 2011)
          </div>
          <div style={{ color: '#8E9C9B' }}>
            Demo Environment • Client-Side Simulation Active
          </div>
        </div>
      </footer>

      {/* Responsive and Hover Micro-styles */}
      <style>{`
        .portal-selection-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 28px rgba(13, 43, 40, 0.08) !important;
          border-color: #CDD8D6 !important;
        }
        .portal-continue-btn:hover {
          opacity: 0.93;
          filter: brightness(1.05);
        }
        @media (max-width: 640px) {
          .hide-xs {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
