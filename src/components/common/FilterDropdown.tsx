import React from 'react';
import { Filter } from 'lucide-react';

export interface FilterOption {
  label: string;
  value: string;
}

interface FilterDropdownProps {
  label?: string;
  options: FilterOption[];
  selectedValue: string;
  onChange: (value: string) => void;
  icon?: boolean;
}

export const FilterDropdown: React.FC<FilterDropdownProps> = ({
  label,
  options,
  selectedValue,
  onChange,
  icon = true,
}) => {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
      {icon && <Filter size={14} color="#6B7A7A" />}
      {label && (
        <span style={{ fontSize: '12px', fontWeight: 500, color: '#6B7A7A' }}>
          {label}:
        </span>
      )}
      <select
        aria-label={label || 'Filter options'}
        value={selectedValue}
        onChange={(e) => onChange(e.target.value)}
        style={{
          padding: '6px 28px 6px 10px',
          fontSize: '13px',
          fontWeight: 500,
          color: '#1C2526',
          backgroundColor: '#FFFFFF',
          border: '1px solid #E4EBEA',
          borderRadius: '6px',
          outline: 'none',
          cursor: 'pointer',
          appearance: 'none',
          backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236B7A7A' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 8px center',
          backgroundSize: '12px',
        }}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

