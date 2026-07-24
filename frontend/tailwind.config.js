export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        arcade: {
          black: '#050308',
          charcoal: '#14101f',
          panel: '#1c1628',
          purple: '#a855f7',
          purpledeep: '#7c1fd6',
          cyan: '#22e5ff',
          magenta: '#ff2fb0',
          amber: '#ffb020',
        },
      },
      fontFamily: {
        arcade: ['Bungee', 'cursive'],
        display: ['Rajdhani', 'sans-serif'],
      },
    },
  },
  plugins: [],
}