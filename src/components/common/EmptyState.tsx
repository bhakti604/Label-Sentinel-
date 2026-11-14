import React from 'react';
import { LucideIcon, Inbox } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon: Icon = Inbox,
  action,
}) => {
  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #E4EBEA',
        borderRadius: '8px',
        padding: '48px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          backgroundColor: '#F6F8F8',
          color: '#6B7A7A',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px',
        }}
      >
        <Icon size={26} strokeWidth={1.8} />
      </div>

      <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1C2526', marginBottom: '6px' }}>
        {title}
      </h3>

      <p style={{ fontSize: '13px', color: '#6B7A7A', maxWidth: '420px', lineHeight: 1.5, marginBottom: action ? '20px' : '0' }}>
        {description}
      </p>

      {action && (
        <button
          type="button"
          className="btn btn-primary"
          onClick={action.onClick}
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

