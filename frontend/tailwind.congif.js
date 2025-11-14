export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#8A2BE2",     // Electric Violet
        secondary: "#4F46E5",   // Indigo
        accent: "#DA00FF",      // Neon Magenta
        background: "#0B0014",  // Phantom black
        card: "#1A0B2E",        // Dark purple card
        textLight: "#F1F5F9",  
        textMuted: "#94A3B8",
      },
      boxShadow: {
        glow: "0 0 15px rgba(218, 0, 255, 0.5)", // neon glow
      }
    },
  },
  plugins: [],
}
