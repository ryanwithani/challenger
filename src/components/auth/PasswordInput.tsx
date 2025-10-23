'use client'

import { useState } from 'react';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { BsCheck, BsX } from 'react-icons/bs';
import { getPasswordChecks, PASSWORD_MIN } from '@/src/lib/utils/validators';
import { cn } from '@/src/lib/utils/cn';

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  showValidation?: boolean;
  error?: string;
}

export function PasswordInput({
  value,
  onChange,
  onBlur,
  showValidation = false,
  className,
  error,
  ...props
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);

  const checks = showValidation ? getPasswordChecks(value) : null;

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setFocused(false);
    onBlur?.(e);
  };

  return (
    <div className="space-y-1">
      <div className="relative">
        <input
          {...props}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={handleBlur}
          className={cn(
            'h-10 w-full rounded-xl border border-gray-300 bg-white px-3 pr-12 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-200',
            error && 'border-red-500 focus:ring-red-200',
            className
          )}
          minLength={showValidation ? PASSWORD_MIN : undefined}
          type={showPassword ? 'text' : 'password'}
        />
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-brand-200 z-10"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          tabIndex={0}
        >
          {showPassword ? (
            <AiOutlineEyeInvisible size={20} className="text-gray-600" />
          ) : (
            <AiOutlineEye size={20} className="text-gray-600" />
          )}
        </button>
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}

      {focused && value && checks && showValidation && (
        <div className="space-y-1 text-sm">
          <Rule ok={checks.length}>≥ {PASSWORD_MIN} characters</Rule>
          <Rule ok={checks.upper}>Uppercase A—Z</Rule>
          <Rule ok={checks.lower}>Lowercase a—z</Rule>
          <Rule ok={checks.number}>Number 0—9</Rule>
          <Rule ok={checks.symbol}>Symbol !@#…</Rule>
        </div>
      )}
    </div>
  );
}

function Rule({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <div className={`flex items-center gap-2 ${ok ? "text-green-600" : "text-gray-400"}`}>
      {ok ? <BsCheck size={16} /> : <BsX size={16} />}
      <span>{children}</span>
    </div>
  );
}