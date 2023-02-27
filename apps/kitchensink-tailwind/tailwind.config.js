// const path = require('path')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{ts,tsx,jsx,js}'
    // TODO import dependend components so
    // their classnames are included in generated css
    // path.join(path.dirname(require.resolve('@i-vresse/wb-core')), 'dist/**/*.js'),
    // path.join(path.dirname(require.resolve('@i-vresse/wb-form')), 'dist/**/*.js'),
    // path.join(path.dirname(require.resolve('@rjsf/bootstrap-4')), 'dist/**/*.js'),
  ],
  theme: {
    extend: {}
  },
  plugins: [require('@tailwindcss/forms')]
}
