import React from 'react';
import { LucideIcon } from 'lucide-react';

interface SummaryCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive?: boolean;
    isNeutral?: boolean;
  };
  accentColor?: string;
  onClick?: () => void;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  value,
  subtext,
  icon: Icon,
  trend,
  accentColor = '#14857D',
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #E4EBEA',
        borderRadius: '8px',
        padding: '20px',
        boxShadow: '0 1px 3px rgba(28, 37, 38, 0.04)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 150ms ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
        <div>
          <span
            style={{
              fontSize: '12px',
              fontWeight: 600,
              color: '#6B7A7A',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            {title}
          </span>
          <div
            style={{
              fontSize: '26px',
              fontWeight: 700,
              color: '#1C2526',
              marginTop: '4px',
              lineHeight: 1.2,
            }}
          >
            {value}
          </div>
        </div>

        <div
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '8px',
            backgroundColor: `${accentColor}14`,
            color: accentColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon size={22} strokeWidth={2} />
        </div>
      </div>

      {(subtext || trend) && (
        <div
          style={{
            marginTop: '16px',
            paddingTop: '12px',
            borderTop: '1px solid #F6F8F8',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '12px',
          }}
        >
          {trend && (
            <span
              style={{
                fontWeight: 600,
                color: trend.isNeutral
                  ? '#6B7A7A'
                  : trend.isPositive
                  ? '#23845B'
                  : '#C44747',
              }}
            >
              {trend.value}
            </span>
          )}
          {subtext && (
            <span style={{ color: '#6B7A7A' }}>
              {subtext}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

