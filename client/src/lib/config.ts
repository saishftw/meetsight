const env = process.env.NODE_ENV;
export const imgBasePath = env === "production" ? "/InsightsBot/app/" : "" // chat avatar image
export const audioWorkletUrl = env === "production" ? "http://localhost:8080/worklets" : ""

export const gptApiBaseUrl = 'http://localhost:8081'

export const speechToTextApi = {
    baseUrl: "http://localhost:4005", // should be site URL (Eg. https://example.com/)
    socketPath: "/socket.io" // should be subpath (Eg. /subpath/socket.io/ for https://example.com/subpath//socket.io/) -> same as the prefixPath is SpeechToTextAPI
}
