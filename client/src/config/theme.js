// THE place to change the look of the app: colors, fonts, corner roundness and shadows.
// Tailwind reads this file, so a change here updates the whole website.

const theme = {
  colors: {
    primary: {
      DEFAULT: '#4F46E5', // indigo – main brand color
      hover: '#4338CA',
      soft: '#EEF2FF',
    },
    surface: {
      DEFAULT: '#FFFFFF', // cards & page background
      muted: '#F8FAFC',   // soft gray sections
      border: '#E5E7EB',
    },
    text: {
      DEFAULT: '#0F172A', // main text
      muted: '#64748B',   // secondary text
    },
    // Status colors (success, warning, danger, info) will be added here.
  },
  fonts: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
  },
  radius: {
    card: '1rem', // rounded-2xl
  },
  shadows: {
    soft: '0 1px 3px rgba(15, 23, 42, 0.06), 0 1px 2px rgba(15, 23, 42, 0.04)',
    card: '0 4px 24px rgba(15, 23, 42, 0.06)',
  },
};

export default theme;
