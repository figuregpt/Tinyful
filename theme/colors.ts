// Dark Theme Colors - Global color palette
// Change these values to update colors across the entire app

export const theme = {
  // Background colors
  bgPrimary: '#0d0d0d',      // Main background
  bgSecondary: '#1a1a1a',    // Cards, modals
  bgTertiary: '#252525',     // Inputs, buttons
  bgHover: '#2a2a2a',        // Hover states
  
  // Text colors
  textPrimary: '#ffffff',
  textSecondary: '#888888',
  textMuted: '#666666',
  
  // Border colors
  border: '#333333',
  borderLight: '#222222',
  
  // Brand colors
  primary: '#4CAF50',
  primaryDark: '#3d8b40',
  primaryLight: '#66bb6a',
  
  secondary: '#1CB0F6',
  secondaryDark: '#1899D6',
  
  warning: '#F59E0B',
  warningDark: '#E68900',
  
  error: '#EF4444',
  errorDark: '#EA2B2B',
  
  success: '#4CAF50',
  
  // Priority colors
  priorityHigh: '#EF4444',
  priorityMedium: '#F59E0B',
  priorityLow: '#10B981',
} as const;

// Legacy support - maps to new theme
export const colors = {
  primary: {
    DEFAULT: theme.primary,
    dark: theme.primaryDark,
    light: theme.primaryLight,
  },
  secondary: {
    DEFAULT: theme.secondary,
    dark: theme.secondaryDark,
    light: theme.primaryLight,
  },
  warning: {
    DEFAULT: theme.warning,
    dark: theme.warningDark,
  },
  error: {
    DEFAULT: theme.error,
    dark: theme.errorDark,
  },
  success: theme.success,
  background: theme.bgPrimary,
  surface: theme.bgSecondary,
  border: theme.border,
  text: {
    primary: theme.textPrimary,
    secondary: theme.textSecondary,
  },
  priority: {
    high: theme.priorityHigh,
    medium: theme.priorityMedium,
    low: theme.priorityLow,
  },
} as const;

// Flat colors for easier access - now uses theme values
export const flatColors = {
  primary: theme.primary,
  primaryDark: theme.primaryDark,
  primaryLight: theme.primaryLight,
  secondary: theme.secondary,
  secondaryDark: theme.secondaryDark,
  secondaryLight: theme.primaryLight,
  warning: theme.warning,
  warningDark: theme.warningDark,
  error: theme.error,
  errorDark: theme.errorDark,
  success: theme.success,
  background: theme.bgPrimary,
  surface: theme.bgSecondary,
  border: theme.border,
  textPrimary: theme.textPrimary,
  textSecondary: theme.textSecondary,
  priorityHigh: theme.priorityHigh,
  priorityMedium: theme.priorityMedium,
  priorityLow: theme.priorityLow,
} as const;

// Priority color helper
export const getPriorityColor = (priority: 'high' | 'medium' | 'low'): string => {
  const priorityColors = {
    high: theme.priorityHigh,
    medium: theme.priorityMedium,
    low: theme.priorityLow,
  };
  return priorityColors[priority];
};
