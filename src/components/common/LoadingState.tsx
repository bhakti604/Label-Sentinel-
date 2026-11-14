import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  subtext?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading compliance records...',
  subtext = 'Connecting to Legal Metrology data registry',
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
      <Loader2
        size={32}
        color="#14857D"
        style={{
          animation: 'spin 1s linear infinite',
          marginBottom: '16px',
        }}
      />
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
      <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#1C2526', marginBottom: '4px' }}>
        {message}
      </h4>
      <p style={{ fontSize: '12px', color: '#6B7A7A' }}>
        {subtext}
      </p>
    </div>
  );
};

