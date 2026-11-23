import React from 'react';

export default function Input({
  label,
  required = false,
  error,
  helperText,
  as = 'input',
  options = [],
  className = '',
  id,
  name,
  value,
  onChange,
  placeholder,
  disabled = false,
  readOnly = false,
  rows = 3,
  type = 'text',
  ...props
}) {
  const inputId = id || name || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`input-wrapper ${className}`}>
      {label && (
        <label htmlFor={inputId} className="input-label">
          {label} {required && <span className="input-req">*</span>}
        </label>
      )}

      {as === 'textarea' ? (
        <textarea
          id={inputId}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          rows={rows}
          className="form-control"
          {...props}
        />
      ) : as === 'select' ? (
        <select
          id={inputId}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className="form-control"
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt, idx) => (
            <option key={idx} value={typeof opt === 'object' ? opt.value : opt}>
              {typeof opt === 'object' ? opt.label : opt}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={inputId}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          className="form-control"
          {...props}
        />
      )}

      {helperText && !error && (
        <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{helperText}</span>
      )}
      {error && (
        <span style={{ fontSize: '11px', color: 'var(--color-danger)' }}>{error}</span>
      )}
    </div>
  );
}
