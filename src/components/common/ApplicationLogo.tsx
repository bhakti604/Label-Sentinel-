import React from 'react';
import Link from 'next/link';
import { Scale } from 'lucide-react';

interface ApplicationLogoProps {
  variant?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  href?: string;
}

export const ApplicationLogo: React.FC<ApplicationLogoProps> = ({
  variant = 'dark',
  size = 'md',
  showSubtitle = true,
  href = '/',
}) => {
  const iconSize = size === 'sm' ? 18 : size === 'lg' ? 28 : 22;
  const isDark = variant === 'dark';

  const content = (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '12px',
        textDecoration: 'none',
        userSelect: 'none',
      }}
    >
      <div
        style={{
          width: size === 'sm' ? 32 : size === 'lg' ? 44 : 38,
          height: size === 'sm' ? 32 : size === 'lg' ? 44 : 38,
          borderRadius: '8px',
          backgroundColor: isDark ? '#14857D' : '#FFFFFF',
          color: isDark ? '#FFFFFF' : '#14857D',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          flexShrink: 0,
        }}
      >
        <Scale size={iconSize} strokeWidth={2.2} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              fontSize: size === 'sm' ? '14px' : size === 'lg' ? '18px' : '16px',
              fontWeight: 700,
              letterSpacing: '0.04em',
              color: isDark ? '#1C2526' : '#FFFFFF',
              fontFamily: 'var(--font-family)',
              lineHeight: 1.1,
            }}
          >
            LABEL SENTINEL
          </span>
          <span
            style={{
              fontSize: '10px',
              fontWeight: 600,
              padding: '1px 6px',
              borderRadius: '3px',
              backgroundColor: isDark ? '#E7F3F2' : 'rgba(255,255,255,0.2)',
              color: isDark ? '#0F5F59' : '#FFFFFF',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            Compliance
          </span>
        </div>
        {showSubtitle && (
          <span
            style={{
              fontSize: '11px',
              fontWeight: 500,
              color: isDark ? '#6B7A7A' : '#E4EBEA',
              letterSpacing: '0.02em',
              marginTop: '2px',
            }}
          >
            Legal Metrology Compliance Platform
          </span>
        )}
      </div>
    </div>
  );

  if (href) {
    return <Link href={href} style={{ textDecoration: 'none' }}>{content}</Link>;
  }

  return content;
};
