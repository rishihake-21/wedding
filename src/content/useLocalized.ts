import { useCallback } from 'react';
import { useAppStore } from '../core/store';
import type { L10n } from './content';

/**
 * Returns a resolver bound to the current language:
 *   const l = useLocalized();
 *   <p>{l(content.ui.enter)}</p>
 * Components re-render when the language changes.
 */
export function useLocalized(): (value: L10n) => string {
  const language = useAppStore((s) => s.language);
  return useCallback((value: L10n) => value[language], [language]);
}
