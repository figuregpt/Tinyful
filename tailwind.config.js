/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Background colors
        'bg-primary': '#0d0d0d',
        'bg-secondary': '#1a1a1a',
        'bg-tertiary': '#252525',
        
        // Brand colors
        primary: {
          DEFAULT: '#4CAF50',
          dark: '#3d8b40',
          light: '#66bb6a',
        },
        secondary: {
          DEFAULT: '#1CB0F6',
          dark: '#1899D6',
          light: '#4FC3F7',
        },
        warning: {
          DEFAULT: '#F59E0B',
          dark: '#E68900',
        },
        error: {
          DEFAULT: '#EF4444',
          dark: '#EA2B2B',
        },
        success: '#4CAF50',
        
        // Legacy mappings (for existing code)
        surface: '#1a1a1a',
        border: '#333333',
        'text-primary': '#ffffff',
        'text-secondary': '#888888',
      },
      fontFamily: {
        sans: ['SpaceMono', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
