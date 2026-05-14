// Modern Earthy, Agricultural Color Palette for AgriSmart
// Enhanced with depth, better contrast, and modern accents

export const colors = {
  // Primary Brand Colors - Rich forest greens
  primary: '#1a5f2a',         // Deep Forest Green (darker, more elegant)
  primaryDark: '#0d4a1c',     // Darker Green
  primaryLight: '#2d8a45',    // Light Green
  primaryLighter: '#7bc88c',  // Very Light Green
  primaryMuted: '#e8f5eb',    // Muted green background
  
  // Secondary Colors - Warm earth tones
  secondary: '#6b4423',       // Rich Earthy Brown
  secondaryLight: '#9a7b5a',  // Light Brown
  secondaryDark: '#4a2f18',   // Dark Brown
  
  // Accent Colors - Warm harvest tones
  accent: '#e67e22',          // Warm Sunset Orange
  accentLight: '#fdebd0',     // Light Orange
  accentDark: '#d35400',      // Dark Orange
  accentGold: '#f1c40f',      // Golden Yellow
  
  // Soil/Sand Colors - Natural earth
  soil: '#7d5a50',            // Rich Soil Brown
  sand: '#e8dcd0',            // Warm Sand
  clay: '#c9b8a8',            // Clay Color
  
  // Leaf Colors - Fresh greens
  leaf: '#52b788',            // Fresh Leaf Green
  leafDark: '#2d6a4f',        // Dark Leaf Green
  leafLight: '#d8f3dc',       // Light Leaf Green
  
  // Status Colors - Modern, accessible
  success: '#27ae60',         // Growth Success
  successLight: '#d4efdf',    // Light Success
  warning: '#f39c12',         // Warning
  warningLight: '#fef5e7',    // Light Warning
  error: '#e74c3c',           // Error
  errorLight: '#fdedec',      // Light Error
  info: '#3498db',            // Info Blue
  infoLight: '#ebf5fb',       // Light Info
  
  // Harvest Colors
  harvest: '#f5b041',         // Harvest Gold
  ripe: '#ec7063',            // Ripe Red
  
  // Neutral Colors - Modern grays with warmth
  white: '#ffffff',
  offWhite: '#fafbfa',
  cream: '#f8f7f4',
  lightGray: '#f4f5f3',
  mediumGray: '#dde1db',
  gray: '#95a5a0',
  darkGray: '#5a6b65',
  charcoal: '#2c3e36',
  black: '#1a1f1c',
  
  // Background Colors - Warm and inviting
  background: '#f5f7f4',      // Warm off-white with green tint
  backgroundAlt: '#eef2ed',   // Alternative background
  cardBackground: '#ffffff',
  cardBackgroundAlt: '#fafcf9',
  inputBackground: '#ffffff',
  inputBackgroundFocused: '#f8fcf8',
  
  // Text Colors - Better contrast
  textPrimary: '#1a2e22',     // Dark green-black for primary text
  textSecondary: '#4a5d52',   // Muted green-gray for secondary text
  textTertiary: '#7a8d82',    // Lighter text
  textHint: '#9aab9f',        // Hint text color
  textLight: '#ffffff',       // White text
  textOnPrimary: '#ffffff',   // Text on primary color
  
  // Overlay Colors
  overlay: 'rgba(26, 47, 34, 0.6)',
  overlayLight: 'rgba(26, 47, 34, 0.3)',
  
  // Shadow Colors
  shadowLight: 'rgba(26, 47, 34, 0.06)',
  shadowMedium: 'rgba(26, 47, 34, 0.12)',
  shadowDark: 'rgba(26, 47, 34, 0.2)',
  
  // Gradient Presets (for reference in code)
  gradientPrimary: ['#1a5f2a', '#2d8a45'],
  gradientAccent: ['#e67e22', '#f39c12'],
  gradientCard: ['#ffffff', '#f8fcf8'],
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
};

export const borderRadius = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  xxl: 32,
  round: 999,
};

export const typography = {
  // Display - For hero sections
  display: { fontSize: 40, fontWeight: '800', letterSpacing: -0.5, lineHeight: 48 },
  
  // Headings
  h1: { fontSize: 32, fontWeight: '700', letterSpacing: -0.3, lineHeight: 40 },
  h2: { fontSize: 26, fontWeight: '700', letterSpacing: -0.2, lineHeight: 34 },
  h3: { fontSize: 22, fontWeight: '600', letterSpacing: -0.1, lineHeight: 30 },
  h4: { fontSize: 18, fontWeight: '600', lineHeight: 26 },
  h5: { fontSize: 16, fontWeight: '600', lineHeight: 24 },
  
  // Body text
  bodyLarge: { fontSize: 17, fontWeight: '400', lineHeight: 26 },
  body: { fontSize: 15, fontWeight: '400', lineHeight: 24 },
  bodySmall: { fontSize: 13, fontWeight: '400', lineHeight: 20 },
  
  // Supporting text
  caption: { fontSize: 12, fontWeight: '500', lineHeight: 16, letterSpacing: 0.2 },
  overline: { fontSize: 11, fontWeight: '700', lineHeight: 16, letterSpacing: 1, textTransform: 'uppercase' },
  
  // Interactive
  button: { fontSize: 15, fontWeight: '600', letterSpacing: 0.3 },
  buttonSmall: { fontSize: 13, fontWeight: '600', letterSpacing: 0.2 },
  link: { fontSize: 15, fontWeight: '500' },
};

// Shadow presets for different elevations
export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  xs: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
  },
  xl: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
};
