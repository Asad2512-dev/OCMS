// THE place to change the look of the app: colors, fonts, corner roundness and shadows.
// Tailwind reads this file (tailwind.config.js), and the charts read it too,
// so a change here updates the whole website.

const theme = {
  colors: {
    // Main brand color (indigo). Buttons, links, active menu items.
    primary: {
      DEFAULT: '#4F46E5',
      hover: '#4338CA',
      dark: '#3730A3',
      soft: '#EEF2FF',
      muted: '#C7D2FE',
    },
    // Secondary accent used only in soft gradients.
    accent: {
      DEFAULT: '#7C3AED',
      soft: '#F5F3FF',
    },
    // Backgrounds, cards and borders.
    surface: {
      DEFAULT: '#FFFFFF',
      muted: '#F8FAFC',
      subtle: '#F1F5F9',
      border: '#E2E8F0',
      strong: '#CBD5E1',
    },
    // Text colors.
    ink: {
      DEFAULT: '#0F172A',
      soft: '#334155',
      muted: '#64748B',
      faint: '#94A3B8',
      inverse: '#FFFFFF',
    },
    // Status colors (also used by badges).
    success: { DEFAULT: '#059669', soft: '#ECFDF5', border: '#A7F3D0' },
    warning: { DEFAULT: '#B45309', soft: '#FFFBEB', border: '#FDE68A' },
    danger: { DEFAULT: '#DC2626', hover: '#B91C1C', soft: '#FEF2F2', border: '#FECACA' },
    info: { DEFAULT: '#0369A1', soft: '#F0F9FF', border: '#BAE6FD' },
    // Star rating color.
    star: { DEFAULT: '#F59E0B', empty: '#E2E8F0' },
    // Dark background used for the toast messages.
    overlay: 'rgba(15, 23, 42, 0.45)',
  },

  // Colors used by charts, in order.
  chart: ['#4F46E5', '#0EA5E9', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'],

  // Avatar background colors (picked by name).
  avatar: ['#4F46E5', '#0EA5E9', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6'],

  fonts: {
    sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
  },

  radius: {
    card: '1rem',     // rounded-card  (same as rounded-2xl)
    control: '0.75rem', // rounded-control (buttons, inputs)
  },

  shadows: {
    soft: '0 1px 2px rgba(15, 23, 42, 0.04), 0 1px 3px rgba(15, 23, 42, 0.06)',
    card: '0 1px 2px rgba(15, 23, 42, 0.04), 0 4px 16px rgba(15, 23, 42, 0.05)',
    lift: '0 8px 30px rgba(15, 23, 42, 0.08)',
    pop: '0 20px 50px rgba(15, 23, 42, 0.16)',
    glow: '0 10px 30px rgba(79, 70, 229, 0.25)',
  },
};

export default theme;
