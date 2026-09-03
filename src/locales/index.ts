import { mr } from './mr';
import { hi } from './hi';
import { en } from './en';
import { Language } from '../types';

export const locales: Record<Language, Record<string, string>> = {
  mr,
  hi,
  en,
};

export { mr, hi, en };
