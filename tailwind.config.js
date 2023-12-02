const os = require('os-browserify/browser');

module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      spacing: {
        51: '51px',
        185: '185px',
        230: '230px',
        393: '393px',
        427: '427px',
      },
    },
  },
  resolve: {
    alias: {
      os: os,
    },
  },
  plugins: [],
};
