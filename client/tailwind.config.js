// Tailwind CSS settings. All design values come from src/config/theme.js — do not edit colors here.
import theme from './src/config/theme.js';

export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: theme.colors,
      fontFamily: theme.fonts,
      borderRadius: theme.radius,
      boxShadow: theme.shadows,
    },
  },
  plugins: [],
};
