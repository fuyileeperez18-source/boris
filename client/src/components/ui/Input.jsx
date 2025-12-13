import { forwardRef } from 'react';

const Input = forwardRef(({
  label,
  error,
  helperText,
  className = '',
  id,
  required,
  ...props
}, ref) => {
  const inputId = id || props.name;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <input
        ref={ref}
        id={inputId}
        className={`
          w-full px-3 py-2
          border rounded-lg
          focus:outline-none focus:ring-2 focus:border-transparent
          transition-colors duration-200
          ${error
            ? 'border-red-500 focus:ring-red-500'
            : 'border-gray-300 focus:ring-primary-500'
          }
          ${props.disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
          ${className}
        `}
        {...props}
      />

      {(error || helperText) && (
        <p className={`mt-1 text-sm ${error ? 'text-red-500' : 'text-gray-500'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
