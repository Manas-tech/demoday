module.exports = {
  content: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        foreground: '#222222',
        background: '#ffffff',
        gray: {
          100: '#f7fafc',
          200: '#edf2f7',
          300: '#e2e8f0',
          400: '#cbd5e1',
          500: '#a0aec0',
          600: '#718096',
          700: '#4a5568',
          800: '#2d3748'
        },
        'gray-main': 'var(--gray)',
        'gray-base': 'var(--gray1)',
        secondary: 'var(--secondary-color)',
        sidebar: 'var(--sidebar)',
        brand: {
          100: '#FFD9B3',
          200: '#FFB066',
          300: '#FF7B00',
          400: '#CC6200'
        }
      },
      fontSize: {
        xxs: '10px',
        xs: 'var(--text-xs)',
        sm: 'var(--text-sm)',
        md: 'var(--text-md)',
        lg: 'var(--text-lg)',
        xl: 'var(--text-xl)'
      },
      minWidth: {
        btn: '160px'
      }
    }
  },
  plugins: []
};
