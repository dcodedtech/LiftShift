import React, { useRef } from 'react';
import type { BodyMapGender } from '../../bodyMap/BodyMap';
import type { WeightUnit } from '../../../utils/storage/localStorage';
import { CSVExportHelp } from '../csvImport/CSVExportHelp';
import { CSVImportBodyTypeSelector } from '../csvImport/CSVImportBodyTypeSelector';
import { CSVImportDropzone } from '../csvImport/CSVImportDropzone';
import { CSVImportErrorNotice } from '../csvImport/CSVImportErrorNotice';
import { CSVImportUnitSelector } from '../csvImport/CSVImportUnitSelector';
import { useCsvImportState } from '../csvImport/useCsvImportState';

interface CsvContentProps {
  platform: 'hevy' | 'strong' | 'lyfta' | 'other' | 'motra';
  onFileSelect: (file: File, gender: BodyMapGender, unit: WeightUnit) => void;
  onGenderChange: (gender: BodyMapGender) => void;
  onUnitChange: (unit: WeightUnit) => void;
  bodyMapGender: BodyMapGender;
  weightUnit: WeightUnit;
  isLoading: boolean;
  errorMessage?: string | null;
  showExportHelp: boolean;
  onToggleExportHelp: () => void;
  hideBodyTypeAndUnit?: boolean;
}

export function CsvContent({
  platform,
  onFileSelect,
  onGenderChange,
  onUnitChange,
  bodyMapGender,
  weightUnit,
  isLoading,
  errorMessage,
  showExportHelp,
  onToggleExportHelp,
  hideBodyTypeAndUnit = false,
}: CsvContentProps): React.ReactElement {
  const fileInputRef = useRef<HTMLInputElement>(null!);

  const {
    selectedGender,
    selectedUnit,
    handleGenderSelect,
    handleUnitSelect,
    canUploadCsv,
    handleFileChange,
    handleDragOver,
    handleDrop,
  } = useCsvImportState({
    platform,
    initialGender: bodyMapGender,
    initialUnit: weightUnit,
    onFileSelect,
    onGenderChange,
    onUnitChange,
  });

  const showBodyTypeAndUnitSelectors = !hideBodyTypeAndUnit;

  return (
    <div className="flex flex-col h-full min-h-0">
      <CSVImportErrorNotice errorMessage={errorMessage} />

      {showBodyTypeAndUnitSelectors ? (
        <div className="flex-shrink-0">
          <CSVImportBodyTypeSelector
            selectedGender={selectedGender}
            onSelectGender={handleGenderSelect}
          />
          <CSVImportUnitSelector
            selectedUnit={selectedUnit}
            onSelectUnit={handleUnitSelect}
          />
        </div>
      ) : null}

      <div className="flex-1 min-h-0 flex flex-col">
        <CSVImportDropzone
          fileInputRef={fileInputRef}
          platform={platform}
          hideBodyTypeAndUnit={hideBodyTypeAndUnit}
          canUploadCsv={canUploadCsv}
          isLoading={isLoading}
          onFileChange={handleFileChange}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        />

        {platform !== 'other' && platform !== 'motra' && showExportHelp ? (
          <div className="w-full mt-4 flex-shrink-0">
            <CSVExportHelp platform={platform} />
          </div>
        ) : null}

        {isLoading ? (
          <p className="text-slate-400 text-xs sm:text-sm text-center flex-shrink-0 mt-3">
            Importing your data...
          </p>
        ) : null}
      </div>
    </div>
  );
}

export default CsvContent;
