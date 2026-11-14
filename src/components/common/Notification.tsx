'use client';

import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';
import { useSentinel } from '@/lib/storage/context';

export const NotificationContainer: React.FC = () => {
  const { notifications, dismissNotification } = useSentinel();

  if (notifications.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        maxWidth: '400px',
        width: '100%',
        pointerEvents: 'none',
      }}
    >
      {notifications.map((notif) => {
        let bg = '#FFFFFF';
        let border = '#E4EBEA';
        let iconColor = '#14857D';
        let Icon = Info;

        switch (notif.type) {
          case 'success':
            border = '#B7E1CD';
            iconColor = '#23845B';
            Icon = CheckCircle2;
            break;
          case 'warning':
            border = '#F7DDB6';
            iconColor = '#B7791F';
            Icon = AlertTriangle;
            break;
          case 'error':
            border = '#F8C7C7';
            iconColor = '#C44747';
            Icon = XCircle;
            break;
        }

        return (
          <div
            key={notif.id}
            style={{
              pointerEvents: 'auto',
              backgroundColor: bg,
              border: `1px solid ${border}`,
              borderLeft: `4px solid ${iconColor}`,
              borderRadius: '6px',
              padding: '14px 16px',
              boxShadow: '0 10px 15px -3px rgba(28, 37, 38, 0.1)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              animation: 'slideIn 200ms ease',
            }}
          >
            <style>{`
              @keyframes slideIn {
                from { transform: translateX(20px); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
              }
            `}</style>
            <Icon size={18} color={iconColor} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#1C2526' }}>
                {notif.title}
              </div>
              <div style={{ fontSize: '12px', color: '#6B7A7A', marginTop: '2px', lineHeight: 1.4 }}>
                {notif.message}
              </div>
            </div>
            <button
              onClick={() => dismissNotification(notif.id)}
              style={{
                color: '#8E9C9B',
                padding: '2px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
};

