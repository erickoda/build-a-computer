export type Accent = {
  rgb: string;
  text: string;
  border: string;
};

export const BLUE: Accent = {
  rgb: '56,152,236',
  text: 'text-sky-600 dark:text-sky-300',
  border: 'group-hover:border-sky-500/40',
};

export const AMBER: Accent = {
  rgb: '236,168,56',
  text: 'text-amber-600 dark:text-amber-300',
  border: 'group-hover:border-amber-500/40',
};

export const DOT_GRID =
  'radial-gradient(circle, currentColor 1px, transparent 1.5px)';
export const DOT_GRID_FADE =
  'radial-gradient(ellipse 75% 70% at 50% 45%, black 30%, transparent 100%)';
