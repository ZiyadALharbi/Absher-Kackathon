import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                absher: {
                    primary: "#1a5f3f",
                    success: "#10b981",
                    warning: "#f59e0b",
                    critical: "#ef4444",
                },
            },
            fontFamily: {
                cairo: ["Cairo", "sans-serif"],
            },
        },
    },
    plugins: [],
};
export default config;
