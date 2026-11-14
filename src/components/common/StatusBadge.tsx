import React from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  MinusCircle,
  Clock,
  ShieldCheck,
  FileCheck,
} from 'lucide-react';
import { ComplianceStatus } from '@/types/compliance';

type ExtendedStatus =
  | ComplianceStatus
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'INSPECTION_ORDERED'
  | 'RESOLVED'
  | 'DISMISSED'
  | 'SCHEDULED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'NOTICE_ISSUED'
  | 'DRAFT'
  | 'NOTICE_SERVED'
  | 'COMPOUNDED'
  | 'PROSECUTION_INITIATED'
  | 'CLOSED'
  | 'ACTIVE'
  | 'SUSPENDED'
  | 'INVITED';

interface StatusBadgeProps {
  status: ExtendedStatus;
  size?: 'sm' | 'md';
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true,
}) => {
  let bg = '#F6F8F8';
  let color = '#6B7A7A';
  let border = '#E4EBEA';
  let label = status.replace(/_/g, ' ');
  let IconComponent = Clock;

  switch (status) {
    case 'PASS':
    case 'RESOLVED':
    case 'COMPLETED':
    case 'ACTIVE':
    case 'COMPOUNDED':
      bg = '#EAF5F0';
      color = '#23845B';
      border = '#B7E1CD';
      IconComponent = CheckCircle2;
      break;

    case 'FAIL':
    case 'DISMISSED':
    case 'SUSPENDED':
    case 'PROSECUTION_INITIATED':
      bg = '#FDF1F1';
      color = '#C44747';
      border = '#F8C7C7';
      IconComponent = XCircle;
      break;

    case 'NEEDS_REVIEW':
    case 'UNDER_REVIEW':
    case 'SCHEDULED':
    case 'NOTICE_ISSUED':
    case 'NOTICE_SERVED':
      bg = '#FEF7EC';
      color = '#B7791F';
      border = '#F7DDB6';
      IconComponent = AlertTriangle;
      break;

    case 'NOT_APPLICABLE':
    case 'DRAFT':
    case 'CLOSED':
    case 'INVITED':
      bg = '#F6F8F8';
      color = '#6B7A7A';
      border = '#E4EBEA';
      IconComponent = MinusCircle;
      break;

    case 'SUBMITTED':
    case 'IN_PROGRESS':
    case 'INSPECTION_ORDERED':
      bg = '#E7F3F2';
      color = '#0F5F59';
      border = '#BDE0DC';
      IconComponent = ShieldCheck;
      break;
  }

  const padding = size === 'sm' ? '2px 6px' : '3px 8px';
  const fontSize = size === 'sm' ? '11px' : '12px';
  const iconSize = size === 'sm' ? 12 : 13;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding,
        backgroundColor: bg,
        color,
        border: `1px solid ${border}`,
        borderRadius: '4px',
        fontSize,
        fontWeight: 600,
        letterSpacing: '0.02em',
        lineHeight: 1.2,
        whiteSpace: 'nowrap',
      }}
    >
      {showIcon && <IconComponent size={iconSize} strokeWidth={2.2} />}
      {label}
    </span>
  );
};
