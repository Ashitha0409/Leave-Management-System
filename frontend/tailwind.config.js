/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    '50': '#fafafa', // warm gray
                    '100': '#f4f4f5',
                    '200': '#e4e4e7',
                    '300': '#d4d4d8',
                    '400': '#a1a1aa',
                    '500': '#71717a',
                    '600': '#52525b',
                    '700': '#3f3f46',
                    '800': '#27272a',
                    '900': '#18181b', // Zinc 900
                    '950': '#09090b',
                },
                primary: {
                    light: '#3b82f6',
                    DEFAULT: '#0052cc', // More 'Jira/Atlassian' corporate blue
                    dark: '#0747a6',
                },
                accent: {
                    DEFAULT: '#0052cc', // Added as semantic alias
                }
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
            },
            boxShadow: {
                'soft': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
            }
        },
    },
    plugins: [],
}
