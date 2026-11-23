import React from 'react';
import { Search, X } from 'lucide-react';

export default function SearchBar({
  value = '',
  onChange,
  onClear,
  placeholder = 'Search...',
  className = '',
  style
}) {
  return (
    <div
      className={`search-bar-container ${className}`}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        ...style
      }}
    >
      <Search
        size={16}
        style={{
          position: 'absolute',
          left: 12,
          color: 'var(--color-text-muted)',
          pointerEvents: 'none'
        }}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '9px 36px 9px 36px',
          fontSize: '13.5px',
          fontFamily: 'inherit',
          color: 'var(--color-text-main)',
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          outline: 'none',
          transition: 'all 0.15s ease'
        }}
      />
      {value && (
        <button
          type="button"
          onClick={onClear}
          style={{
            position: 'absolute',
            right: 10,
            background: 'none',
            border: 'none',
            color: 'var(--color-text-muted)',
            cursor: 'pointer',
            padding: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title="Clear search"
        >
          <X size={15} />
        </button>
      )}
    </div>
  );
}
