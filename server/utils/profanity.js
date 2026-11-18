// Checks text for abusive words: English (bad-words package) + our Urdu/Roman Urdu list in config/badWords.js.
import { Filter } from 'bad-words';
import { CUSTOM_BAD_WORDS } from '../config/badWords.js';

const englishFilter = new Filter();

// Multi-word entries (like "bay ghairat") are checked as phrases; single words as whole tokens.
// Collapses repeated letters ("kuttaaa" → "kuta") so stretched spellings still match.
const collapse = (word) => word.replace(/(.)\1+/gu, '$1');

const singleWords = new Set(CUSTOM_BAD_WORDS.filter((w) => !/\s/.test(w)).map((w) => collapse(w.toLowerCase())));
const phrases = CUSTOM_BAD_WORDS.filter((w) => /\s/.test(w)).map((w) => w.toLowerCase());

// Splits on anything that is not a letter or number (works for Urdu script too).
const tokenize = (text) => text.toLowerCase().split(/[^\p{L}\p{M}\p{N}-]+/u).filter(Boolean);

const hasCustomWord = (text) => {
  const lower = text.toLowerCase();
  if (phrases.some((p) => lower.includes(p))) return true;
  return tokenize(text).some((t) => singleWords.has(collapse(t)));
};

export const isAbusive = (...texts) =>
  texts.filter(Boolean).some((t) => hasCustomWord(t) || englishFilter.isProfane(t));
