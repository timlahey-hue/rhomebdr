import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['Outfit', 'system-ui', 'sans-serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        highlight: {
          DEFAULT: "hsl(var(--highlight))",
          foreground: "hsl(var(--highlight-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        column: {
          competitor: "hsl(var(--column-competitor))",
          research: "hsl(var(--column-research))",
          identified: "hsl(var(--column-identified))",
          contact: "hsl(var(--column-contact))",
          active: "hsl(var(--column-active))",
          warm: "hsl(var(--column-warm))",
          ready: "hsl(var(--column-ready))",
          dormant: "hsl(var(--column-dormant))",
          new: "hsl(var(--column-new))",
          healthy: "hsl(var(--column-healthy))",
          underengaged: "hsl(var(--column-underengaged))",
          advocate: "hsl(var(--column-advocate))",
          risk: "hsl(var(--column-risk))",
          paused: "hsl(var(--column-paused))",
        },
        strength: {
          1: "hsl(var(--strength-1))",
          2: "hsl(var(--strength-2))",
          3: "hsl(var(--strength-3))",
          4: "hsl(var(--strength-4))",
          5: "hsl(var(--strength-5))",
        },
        priority: {
          high: "hsl(var(--priority-high))",
          medium: "hsl(var(--priority-medium))",
          low: "hsl(var(--priority-low))",
        },
        tier: {
          1: "hsl(var(--tier-1))",
          "1-foreground": "hsl(var(--tier-1-foreground))",
          "1-ring": "hsl(var(--tier-1-ring))",
          "1-bg": "hsl(var(--tier-1-bg))",
          2: "hsl(var(--tier-2))",
          "2-foreground": "hsl(var(--tier-2-foreground))",
          3: "hsl(var(--tier-3))",
          "3-foreground": "hsl(var(--tier-3-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in": {
          from: { opacity: "0", transform: "translateX(-8px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out forwards",
        "slide-in": "slide-in 0.3s ease-out forwards",
      },
      boxShadow: {
        card: "0 1px 3px 0 hsl(220 20% 15% / 0.04), 0 1px 2px -1px hsl(220 20% 15% / 0.03)",
        "card-hover": "0 4px 12px 0 hsl(220 20% 15% / 0.08), 0 2px 4px -1px hsl(220 20% 15% / 0.04)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
