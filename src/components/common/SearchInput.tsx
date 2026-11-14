import React from 'react';
import { Search, X } from 'lucide-react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  width?: string | number;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = 'Search records...',
  width = '280px',
}) => {
  return (
    <div
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        width,
      }}
    >
      <Search
        size={15}
        color="#8E9C9B"
        style={{
          position: 'absolute',
          left: '10px',
          pointerEvents: 'none',
        }}
      />
      <input
        type="text"
        aria-label={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '7px 28px 7px 32px',
          fontSize: '13px',
          borderRadius: '6px',
          border: '1px solid #E4EBEA',
          backgroundColor: '#FFFFFF',
          color: '#1C2526',
          outline: 'none',
          transition: 'all 120ms ease',
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = '#14857D';
          e.currentTarget.style.boxShadow = '0 0 0 2px rgba(20, 133, 125, 0.12)';
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = '#E4EBEA';
          e.currentTarget.style.boxShadow = 'none';
        }}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear search input"
          style={{
            position: 'absolute',
            right: '8px',
            color: '#8E9C9B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2px',
          }}
          title="Clear search"
        >
          <X size={13} />
        </button>
      )}
    </div>
  );
};

