import React from 'react';
import { cls } from '../../utils/formatters.js';

export function badgeTone(tone) {
  if (tone === 'red') return 'bg-red-50 text-red-700 border-red-200';
  if (tone === 'amber') return 'bg-amber-50 text-amber-700 border-amber-200';
  if (tone === 'emerald') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  return 'bg-slate-50 text-slate-700 border-slate-200';
}

export function Card({ children, className = '' }) {
  return <div className={cls('rounded-3xl border-0 bg-white shadow-sm', className)}>{children}</div>;
}

export function Input({ className = '', ...props }) {
  return <input className={cls('w-full rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none focus:border-slate-400', className)} {...props} />;
}

export function Textarea({ className = '', ...props }) {
  return <textarea className={cls('w-full rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none focus:border-slate-400', className)} {...props} />;
}

export function Button({ children, variant = 'default', className = '', ...props }) {
  const variantClass = variant === 'outline'
    ? 'border border-slate-300 bg-white text-slate-800 hover:bg-slate-50'
    : 'border border-slate-900 bg-slate-900 text-white hover:bg-slate-800';

  return <button className={cls('inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm font-medium transition', variantClass, className)} {...props}>{children}</button>;
}

export function Badge({ children, tone = 'slate' }) {
  return <span className={cls('inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium', badgeTone(tone))}>{children}</span>;
}

export function Label({ children }) {
  return <label className="text-sm font-medium text-slate-700">{children}</label>;
}

export function SelectField({ value, onChange, options, placeholder }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none focus:border-slate-400"
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((option) => (
        <option
          key={typeof option === "object" ? option.value : option}
          value={typeof option === "object" ? option.value : option}
        >
          {typeof option === "object" ? option.label : option}
        </option>
      ))}
    </select>
  );
}
