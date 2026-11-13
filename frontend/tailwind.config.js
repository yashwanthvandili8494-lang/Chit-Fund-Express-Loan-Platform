/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        fintech: {
          navy: {
            900: '#070F2B',
            800: '#0B192C',
            700: '#1E2E4F',
            600: '#2A4374',
            500: '#3D5A80',
          },
          gold: {
            50: '#FDFBF2',
            100: '#FAF4DC',
            200: '#F4E5B0',
            300: '#EBD17D',
            400: '#E0BC48',
            500: '#D4AF37', // Elegant metallic gold
            600: '#B89225',
            700: '#946E19',
          },
          slate: {
            50: '#F8FAFC',
            100: '#F1F5F9',
            200: '#E2E8F0',
            300: '#CBD5E1',
            600: '#475569',
            800: '#1E293B',
            900: '#0F172A',
          },
          emerald: {
            500: '#10B981',
            600: '#059669',
          }
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'fintech': '0 4px 20px -2px rgba(11, 25, 44, 0.08), 0 2px 6px -1px rgba(11, 25, 44, 0.04)',
        'fintech-lg': '0 10px 30px -4px rgba(11, 25, 44, 0.12), 0 4px 10px -2px rgba(11, 25, 44, 0.06)',
        'fintech-gold': '0 4px 20px -2px rgba(212, 175, 55, 0.25)',
      }
    },
  },
  plugins: [],
}

