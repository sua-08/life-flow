import { useRef, useState, type KeyboardEvent } from 'react';
import { validateName } from './flow';

export function NameInput({ initial = '', label, placeholder = '할 일 추가하고 Enter', onSave, onCancel, autoFocus = false }: {
  initial?: string; label: string; placeholder?: string; onSave: (name: string) => void; onCancel?: () => void; autoFocus?: boolean;
}) {
  const [value, setValue] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const composing = useRef(false);
  function submit(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Escape' && !composing.current) { onCancel?.(); return; }
    if (event.key !== 'Enter' || composing.current || event.nativeEvent.isComposing || event.keyCode === 229) return;
    event.preventDefault();
    const result = validateName(value);
    setError(result.error);
    if (!result.error) { onSave(result.name); setValue(''); }
  }
  return <div className="input-wrap">
    <input aria-label={label} aria-invalid={!!error} value={value} placeholder={placeholder}
      autoFocus={autoFocus} onFocus={e => autoFocus && e.target.select()}
      onChange={e => { setValue(e.target.value); setError(null); }} onKeyDown={submit}
      onCompositionStart={() => { composing.current = true; }} onCompositionEnd={() => { composing.current = false; }} />
    {error && <span className="input-error" role="alert">{error}</span>}
  </div>;
}


