import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        carbon: '#0B0F19',
        slateCard: '#111827',
        slateElevated: '#1E293B',
        slateBorder: '#334155',
        byonBlue: '#2563EB',
        byonBlueLight: '#3B82F6',
        putriRed: '#E11D48',
        emeraldActive: '#10B981',
        bookNavy: '#1F3864',
        bookBlue: '#2E75B6',
        bookRed: '#C0504D',
        bookSum: '#D9E1F2'
      }
    },
  },
  plugins: [],
};
export default config;

