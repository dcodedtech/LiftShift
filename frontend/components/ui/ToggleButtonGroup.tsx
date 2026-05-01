import React from 'react';
import { SegmentControl } from './SegmentControl';

export interface ToggleOption<T extends string = string> {
  value: T;
  label: string;
}

interface ToggleButtonGroupProps<T extends string = string> {
  options: readonly ToggleOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

export function ToggleButtonGroup<T extends string = string>({
  options,
  value,
  onChange,
}: ToggleButtonGroupProps<T>): React.ReactElement {
  return (
    <SegmentControl
      options={options.map((opt) => ({ value: opt.value, label: opt.label }))}
      value={value}
      onChange={onChange}
    />
  );
}

export default ToggleButtonGroup;