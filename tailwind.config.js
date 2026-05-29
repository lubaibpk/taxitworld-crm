export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: '#1A2B6B', mid: '#243580', light: '#3a4fa0' },
        accent: { DEFAULT: '#F5C518', dark: '#d4a800' }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        mono: ['"DM Mono"', 'monospace']
      }
    }
  },
  plugins: []
}
