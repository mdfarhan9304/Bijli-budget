import type { Config } from 'tailwindcss';
const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: { extend: { colors: { ink: '#0b3558', signal: '#006bff', slate: '#476788', mist: '#a6bbd1', cloud: '#f8f9fb', paper: '#ffffff', pebble: '#f0f3f8', hairline: '#d4e0ed', cobalt: '#004eba' }, boxShadow: { product: '0 4px 5px rgba(71,103,136,.04), 0 8px 15px rgba(71,103,136,.03), 0 30px 50px rgba(71,103,136,.08)' } } },
  plugins: []
};
export default config;
