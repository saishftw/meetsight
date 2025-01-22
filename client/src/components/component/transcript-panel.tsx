import { WordRecognized } from "@/lib/domains";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { useEffect, useRef, useState } from "react";
import * as io from "socket.io-client";
import { audioWorkletUrl, speechToTextApi } from "@/lib/config";
import { userMediaConfig } from "@/lib/speechrecognizer";
import clsx from "clsx";

export default function TranscriptPanel(
    { transcript, currentTranscript, onStart, onNewTranscript, setCurrentTranscript, isMeetingReadonly }:
        {
            transcript: string[],
            currentTranscript: string,
            onStart: () => void,
            onNewTranscript: (transcript: string) => void,
            setCurrentTranscript: (transcript: string) => void,
            isMeetingReadonly: boolean
        }
) {

    const [isConnectingToSocket, setIsConnectingToSocket] = useState<boolean>(false)
    const [connection, setConnection] = useState<io.Socket>();
    const [isRecording, setIsRecording] = useState<boolean>(false);
    const [recorder, setRecorder] = useState<any>();
    const processorRef = useRef<any>();
    const audioContextRef = useRef<any>();
    const audioInputRef = useRef<any>();

    const speechRecognized = (data: WordRecognized) => {
        if (data.isFinal) {
            setCurrentTranscript("...");
            onNewTranscript(data.text);
        } else setCurrentTranscript(data.text + "...");
    };

    const connect = () => {
        setIsConnectingToSocket(true)
        connection?.disconnect();
        const socket = io.connect(speechToTextApi.baseUrl, {
            path: speechToTextApi.socketPath
        });

        socket.on("connect", () => {
            console.log("connected", socket.id);
            setConnection(socket);
            setIsConnectingToSocket(false)
            onStart()
        })

        // socket.emit("send_message", "hello world");

        socket.emit("startGoogleCloudStream");

        socket.on("receive_message", (data: any) => {
            console.log("received message", data);
        });

        socket.on("receive_audio_text", (data: WordRecognized) => {
            speechRecognized(data);
            console.log("received audio text", data);
        });

        socket.on("disconnect", () => {
            setIsConnectingToSocket(false)
            console.log("disconnected", socket.id);
        });
    };

    const disconnect = () => {
        if (!connection) return;
        connection?.emit("endGoogleCloudStream");
        connection?.disconnect();
        processorRef.current?.disconnect();
        audioInputRef.current?.disconnect();
        audioContextRef.current?.close();
        setConnection(undefined);
        setRecorder(undefined);
        setIsRecording(false);
    };

    useEffect(() => {
        const handleRecording = async () => {
            if (!connection || isRecording) return;

            try {
                const stream = await navigator.mediaDevices.getUserMedia(userMediaConfig);
                console.log(stream)
                audioContextRef.current = new window.AudioContext();
                await audioContextRef.current.audioWorklet.addModule(`${audioWorkletUrl}/recorderWorkletProcessor.js`);
                audioContextRef.current.resume();

                audioInputRef.current = audioContextRef.current.createMediaStreamSource(stream);
                processorRef.current = new AudioWorkletNode(audioContextRef.current, "recorder.worklet");

                processorRef.current.connect(audioContextRef.current.destination);
                audioContextRef.current.resume();
                audioInputRef.current.connect(processorRef.current);

                processorRef.current.port.onmessage = (event: any) => {
                    const audioData = event.data;
                    connection.emit("receiveAudioData", { audio: audioData });
                };

                setIsRecording(true);
            } catch (error) {
                console.error("Error getting microphone access:", error);
                // Handle permission denied or other errors (e.g., display error message)
            }
        };

        handleRecording();

        return () => {
            if (isRecording) {
                processorRef.current?.disconnect();
                audioInputRef.current?.disconnect();
                if (audioContextRef.current?.state !== "closed") {
                    audioContextRef.current?.close();
                }
            }
        };
    }, [connection, isRecording, recorder]);

    return (
        <div className="flex w-1/2 flex-col space-y-4 p-4">
            <h2 className="text-md md:text-lg font-semibold">Transcript</h2>
            <ScrollArea className="flex-grow rounded-md border border-gray-200 p-4">
                {transcript.map((tx, idx) => (
                    <p data-key={idx} key={idx} className="text-sm">{tx}</p>
                ))}
                {/* <MarkdownRenderer content={recognitionHistory.join("\n")} /> */}
                <p className="text-sm" >{currentTranscript}</p>
            </ScrollArea>
            {!isMeetingReadonly && (<Button onClick={!isRecording ? connect : disconnect} isLoading={isConnectingToSocket} className={clsx('hover:bg-opacity-90 h-5', {
                "bg-red-500": isRecording,
                "bg-blue-500": !isRecording
            })} >{!isRecording ? 'Start' : 'Stop'}</Button>)}

        </div>
    )
}