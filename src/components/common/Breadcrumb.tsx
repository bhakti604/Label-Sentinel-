import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  return (
    <nav
      aria-label="Breadcrumb"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '12px',
        color: '#6B7A7A',
        marginBottom: '16px',
      }}
    >
      <Link
        href="/"
        style={{
          display: 'flex',
          alignItems: 'center',
          color: '#6B7A7A',
          textDecoration: 'none',
        }}
      >
        <Home size={13} />
      </Link>

      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <React.Fragment key={idx}>
            <ChevronRight size={12} color="#CDD8D6" />
            {isLast || !item.href ? (
              <span
                style={{
                  fontWeight: 600,
                  color: isLast ? '#1C2526' : '#6B7A7A',
                }}
              >
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                style={{
                  color: '#6B7A7A',
                  textDecoration: 'none',
                }}
              >
                {item.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

