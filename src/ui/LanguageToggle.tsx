import { content } from '../content/content';
import { useLocalized } from '../content/useLocalized';
import { useAppStore } from '../core/store';
import type { Lang } from '../core/types';

const LANGS: readonly Lang[] = ['mr', 'en'];

/** Marathi / English switch. Persists to localStorage; avoids backdrop-blur over WebGL. */
export function LanguageToggle() {
  const language = useAppStore((s) => s.language);
  const setLanguage = useAppStore((s) => s.setLanguage);
  const l = useLocalized();

  return (
    <div
      role="group"
      aria-label={l(content.ui.language)}
      className="pointer-events-auto flex overflow-hidden rounded-lg border border-gold/45 bg-[#0F1B3A]"
    >
      {LANGS.map((lang) => {
        const selected = lang === language;
        return (
          <button
            key={lang}
            type="button"
            lang={lang}
            aria-pressed={selected}
            onClick={() => setLanguage(lang)}
            className={`min-h-[44px] min-w-[44px] px-3.5 text-sm font-medium transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gold ${
              selected ? 'bg-gold text-midnight' : 'text-cream hover:text-gold'
            }`}
          >
            {content.languages[lang]}
          </button>
        );
      })}
    </div>
  );
}
