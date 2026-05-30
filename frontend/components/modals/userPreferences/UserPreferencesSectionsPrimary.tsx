import React from 'react';
import { Scale, Users } from 'lucide-react';
import { WeightUnit } from '../../../utils/storage/localStorage';
import { BodyMapGender } from '../../bodyMap/BodyMap';
import { Select } from '../../ui/Select';

interface WeightUnitSectionProps {
  weightUnit: WeightUnit;
  onWeightUnitChange: (unit: WeightUnit) => void;
}

const WEIGHT_OPTIONS = [
  { value: 'kg' as const, label: 'kg' },
  { value: 'lbs' as const, label: 'lbs' },
] as const;

export const WeightUnitSection: React.FC<WeightUnitSectionProps> = ({ weightUnit, onWeightUnitChange }) => (
  <Select
    options={WEIGHT_OPTIONS}
    value={weightUnit}
    onChange={onWeightUnitChange}
    label="Weight Unit"
    subtitle="How weights are displayed across the app"
    icon={<Scale className="w-3.5 h-3.5 text-slate-500" />}
  />
);

interface BodyMapGenderSectionProps {
  bodyMapGender: BodyMapGender;
  onBodyMapGenderChange: (gender: BodyMapGender) => void;
}

const GENDER_OPTIONS = [
  { value: 'male' as const, label: 'Male' },
  { value: 'female' as const, label: 'Female' },
] as const;

export const BodyMapGenderSection: React.FC<BodyMapGenderSectionProps> = ({
  bodyMapGender,
  onBodyMapGenderChange,
}) => (
  <Select
    options={GENDER_OPTIONS}
    value={bodyMapGender}
    onChange={onBodyMapGenderChange}
    label="Body Map Style"
    subtitle="Male or female muscle map visualization"
    icon={<Users className="w-3.5 h-3.5 text-slate-500" />}
  />
);
