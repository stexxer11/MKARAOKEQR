export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      keyframes: {
        stageZoom: {
          "0%": {
            transform: "scale(0.7)",
            opacity: "0",
            filter: "blur(10px)",
          },
          "100%": {
            transform: "scale(1)",
            opacity: "1",
            filter: "blur(0px)",
          },
        },

        swim: {
          "0%, 100%": { transform: "translate(0,0) scale(1)" },
          "25%": { transform: "translate(40px,-30px) scale(1.2)" },
          "50%": { transform: "translate(-30px,40px) scale(0.9)" },
          "75%": { transform: "translate(20px,20px) scale(1.1)" },
        },

        karaokePulse: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.06)" },
        }
      },

      animation: {
        stageZoom: "stageZoom 1s ease-out forwards",
        swim: "swim 10s ease-in-out infinite",
        karaokePulse: "karaokePulse 1.8s infinite",
      },
    },
  },
  plugins: [],
}