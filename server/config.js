const env = process.env.NODE_ENV;

export const basePath = env === "Production" ? "/InsightsBot/SpeechToTextAPI" : ""

export const socketPrefixPath = `${basePath}/socket.io/`

export const socketCorsConfig = {
    origin: "http://localhost:3000", // client deployed origin
    methods: ["GET", "POST"]
}