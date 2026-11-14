'use client';

import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Modal } from './Modal';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'primary' | 'warning';
  isLoading?: boolean;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm Action',
  cancelLabel = 'Cancel',
  variant = 'primary',
  isLoading = false,
}) => {
  const confirmBtnClass =
    variant === 'danger'
      ? 'btn btn-danger'
      : variant === 'warning'
      ? 'btn'
      : 'btn btn-primary';

  const confirmBtnStyle =
    variant === 'warning'
      ? {
          backgroundColor: '#B7791F',
          color: '#FFFFFF',
        }
      : undefined;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth="460px"
      footer={
        <>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={confirmBtnClass}
            style={confirmBtnStyle}
            onClick={() => {
              onConfirm();
              onClose();
            }}
            disabled={isLoading}
          >
            {confirmLabel}
          </button>
        </>
      }
    >
      <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor:
              variant === 'danger'
                ? '#FDF1F1'
                : variant === 'warning'
                ? '#FEF7EC'
                : '#E7F3F2',
            color:
              variant === 'danger'
                ? '#C44747'
                : variant === 'warning'
                ? '#B7791F'
                : '#14857D',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <AlertCircle size={20} />
        </div>
        <div>
          <p style={{ fontSize: '13px', color: '#1C2526', lineHeight: 1.5 }}>
            {message}
          </p>
        </div>
      </div>
    </Modal>
  );
};

