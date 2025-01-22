import express from "express";
import { startStream, stopStream, audioInputStreamTransform } from "./infiniteStreaming.js";
import logger from "morgan";
import pkg from 'body-parser';
const { json } = pkg;
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import { socketCorsConfig, socketPrefixPath, basePath } from "./config.js";

const port = process.env.PORT || 4000;

// init express app
const app = express();
app.use(cors());
app.use(logger("dev"));
app.use(json());

// init GCP credentials
// TODO: Create this file in the server directory of the project
// process.env.GOOGLE_APPLICATION_CREDENTIALS = "./speech-to-text-key.json";

// init socket server
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: socketCorsConfig.origin,
        methods: socketCorsConfig.methods,
    },
    path: socketPrefixPath
});
io.on("connection", (socket) => {
    console.log("** a user connected - " + socket.id + " **\n");

    socket.on("disconnect", () => {
        console.log("** user disconnected ** \n");
    });

    socket.on("startGoogleCloudStream", function (data) {
        startStream(this)
    });

    socket.on("endGoogleCloudStream", function () {
        console.log("** ending google cloud stream **\n");
        stopStream()
    });

    socket.on("receiveAudioData", async (audioData) => {
        io.emit("receive_message", "Got audio data");
        audioInputStreamTransform.write(audioData.audio)
    });
});

app.get(`${basePath}/`, (req, res) => {
    res.send('API loaded!');
});

server.listen(port, () => {
    console.log(`WebSocket server listening on port ${port}.`);
});