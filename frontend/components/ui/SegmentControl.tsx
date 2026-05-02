import React from 'react';

export interface SegmentOption<T extends string = string> {
  value: T;
  label?: string;
  icon?: React.ReactNode;
  title?: string;
}

interface SegmentControlProps<T extends string = string> {
  options: readonly SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

const ACTIVE_CLASS = 'bg-blue-500/20 text-blue-400';

const INACTIVE_CLASS = 'text-slate-400/80 hover:text-slate-200';

export function SegmentControl<T extends string = string>({
  options,
  value,
  onChange,
}: SegmentControlProps<T>): React.ReactElement {
  return (
    <div
      className="p-0.5 rounded-sm inline-flex gap-0.5 shrink-0"
      style={{ backgroundColor: 'rgba(128, 128, 128, 0.08)', padding: '0.2rem 0.2rem' }}
    >
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          title={option.title}
          aria-label={option.title}
          className={`h-5 flex items-center justify-center gap-1 rounded cursor-pointer transition-all duration-200 ${
            value === option.value ? ACTIVE_CLASS : INACTIVE_CLASS
          } ${
            option.icon ? 'px-1.5' : 'px-1 text-[8px] font-bold leading-none whitespace-nowrap'
          }`}
        >
          {option.icon && <span className="w-3 h-3 flex-shrink-0">{option.icon}</span>}
          {option.label && <span className="text-[8px] font-bold leading-none whitespace-nowrap">{option.label}</span>}
        </button>
      ))}
    </div>
  );
}

export default SegmentControl;