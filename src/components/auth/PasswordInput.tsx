'use client'

import { useState } from 'react';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { BsCheck, BsX } from 'react-icons/bs';
import { getPasswordChecks, PASSWORD_MIN } from '@/src/lib/utils/validators';

interface PasswordInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  showValidation?: boolean; 
  [key: string]: any;
}

export function PasswordInput({ value, onChange, showValidation = false, ...props }: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);

  const checks = showValidation ? getPasswordChecks(value) : null;

  const togglePasswordVisibility = () => {
    console.log('Toggle clicked:', !showPassword); // Debug log
    setShowPassword(!showPassword);
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <input
          {...props}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full px-3 py-2 border rounded-md pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500"
          minLength={showValidation ? PASSWORD_MIN : undefined}
          type={showPassword ? 'text' : 'password'}
        />
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 z-10"
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
      
      {focused && value && checks && showValidation && (
        <div className="space-y-1 text-sm">
          <Rule ok={checks.length}>≥ {PASSWORD_MIN} characters</Rule>
          <Rule ok={checks.upper}>Uppercase A–Z</Rule>
          <Rule ok={checks.lower}>Lowercase a–z</Rule>
          <Rule ok={checks.number}>Number 0–9</Rule>
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