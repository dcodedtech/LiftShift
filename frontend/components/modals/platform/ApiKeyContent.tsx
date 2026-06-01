import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { useTheme } from '../../theme/ThemeProvider';
import { UNIFORM_HEADER_BUTTON_CLASS } from '../../../utils/ui/uiConstants';
import { getHevyProApiKey, getLyftaApiKey } from '../../../utils/storage/hevyCredentialsStorage';

interface ApiKeyContentProps {
  platform: 'hevy' | 'lyfta';
  onLogin: (apiKey: string) => void;
  isLoading?: boolean;
  errorMessage?: string | null;
}

export function ApiKeyContent({
  platform,
  onLogin,
  isLoading = false,
  errorMessage,
}: ApiKeyContentProps): React.ReactElement {
  const { mode } = useTheme();
  const isLight = mode === 'light';

  const initialKey =
    platform === 'hevy'
      ? () => getHevyProApiKey() || ''
      : () => getLyftaApiKey() || '';

  const [apiKey, setApiKey] = useState(initialKey);
  const [touched, setTouched] = useState(false);

  const focusBorder =
    platform === 'hevy' ? 'focus:border-emerald-500/60' : 'focus:border-purple-500/60';

  const inputBg = isLight
    ? 'bg-white/80 border-slate-300'
    : 'bg-slate-900/20 border-slate-700/60';
  const inputText = isLight ? 'text-slate-800' : 'text-slate-200';
  const placeholderColor = isLight
    ? 'placeholder:text-slate-400'
    : 'placeholder:text-slate-500';
  const labelText = isLight ? 'text-slate-700' : 'text-slate-200';
  const errorBorder = 'border-rose-500/60';

  const label = platform === 'hevy' ? 'Hevy Pro API key' : 'Lyfta API Key';
  const placeholder =
    platform === 'hevy'
      ? 'Enter your Hevy API key'
      : 'Enter your Lyfta API key';
  const buttonLabel = isLoading ? 'Continue…' : 'Continue';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      setTouched(true);
      return;
    }
    onLogin(apiKey.trim());
  };

  return (
    <form className="space-y-3" onSubmit={handleSubmit}>
      <div>
        <label className={`block text-xs font-semibold ${labelText}`}>
          {label}
        </label>
        <input
          value={apiKey}
          onChange={(e) => {
            setApiKey(e.target.value);
            if (touched && e.target.value.trim()) setTouched(false);
          }}
          disabled={isLoading}
          className={`mt-1 w-full h-10 rounded-md border px-3 text-sm ${inputBg} ${inputText} ${placeholderColor} focus:placeholder:text-transparent outline-none ${focusBorder} ${
            touched && !apiKey.trim() ? errorBorder : ''
          }`}
          placeholder={placeholder}
          autoComplete="off"
        />
        {touched && !apiKey.trim() && (
          <p className="mt-1 text-xs text-rose-400">
            Enter your {platform === 'hevy' ? 'Hevy' : 'Lyfta'} API key to
            continue.
          </p>
        )}
      </div>

      {errorMessage ? (
        <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
          {errorMessage}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isLoading}
        className={`${UNIFORM_HEADER_BUTTON_CLASS} w-full h-10 text-sm font-semibold disabled:opacity-60 gap-1.5 justify-center`}
      >
        <span>{buttonLabel}</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </form>
  );
}

export default ApiKeyContent;
