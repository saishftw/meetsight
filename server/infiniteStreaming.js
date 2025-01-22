/**
 * This application demonstrates how to perform infinite streaming using the
 * streamingRecognize operation with the Google Cloud Speech API.
 * Before the streaming time limit is met, the program uses the
 * 'result end time' parameter to calculate the last 'isFinal' transcription.
 * When the time limit is met, the unfinalized audio from the previous session
 * is resent all at once to the API, before continuing the real-time stream
 * and resetting the clock, so the process can repeat.
 * Incoming audio should not be dropped / lost during reset, and context from
 * previous sessions should be maintained as long the utterance returns an
 * isFinal response before 2 * streamingLimit has expired.
 * The output text is color-coded:
 *    red - unfinalized transcript
 *    green - finalized transcript
 *    yellow/orange - API request restarted
 */

'use strict';

const config = {
    encoding: 'LINEAR16',
    sampleRateHertz: 16000,
    languageCode: 'en-US',
    enableWordTimeOffsets: true,
    enableAutomaticPunctuation: true,
    enableWordConfidence: true,
    enableSpeakerDiarization: true,
    useEnhanced: true,
}

const streamingLimit = 290000 // 10000ms - set to low number for demo purposes

// Imports the Google Cloud client library
// Currently, only v1p1beta1 contains result-end-time
import { v1p1beta1 as speech } from '@google-cloud/speech';
import { Writable } from 'stream';

const speechClient = new speech.SpeechClient();

const request = {
    config,
    interimResults: true,
};

let recognizeStream = null;
let restartCounter = 0;
let audioInput = [];
let lastAudioInput = [];
let resultEndTime = 0;
let isFinalEndTime = 0;
let finalRequestEndTime = 0;
let newStream = true;
let bridgingOffset = 0;
let lastTranscriptWasFinal = false;
let restartTimer = null
// let client = null

function startStream(client) {
    // client = socketClient
    // Clear current audioInput
    audioInput = [];
    // Initiate (Reinitiate) a recognize stream
    recognizeStream = speechClient
        .streamingRecognize(request)
        .on('error', err => {
            if (err.code === 11) {
                // restartStream();
            } else {
                console.error('API request error ' + err);
            }
        })
        .on('data', (data) => speechCallback(client, data));

    // Restart stream when streamingLimit expires
    restartTimer = setTimeout(() => restartStream(client), streamingLimit);
}

function convertMsToTime(milliseconds) {
    // Check for invalid input
    if (typeof milliseconds !== 'number' || milliseconds < 0) {
        console.error('Invalid input: Please provide a non-negative number of milliseconds.');
        return
    }

    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);

    // Format the output string with leading zeros for consistency
    const formattedHours = hours.toString().padStart(2, '0');
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const formattedSeconds = seconds.toString().padStart(2, '0');

    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
}

const speechCallback = (client, stream) => {
    // Convert API result end time from seconds + nanoseconds to milliseconds
    resultEndTime =
        stream.results[0].resultEndTime.seconds * 1000 +
        Math.round(stream.results[0].resultEndTime.nanos / 1000000);

    // Calculate correct time based on offset from audio sent twice
    const correctedTime =
        (resultEndTime - bridgingOffset + streamingLimit * restartCounter);

    // process.stdout.clearLine();
    // process.stdout.cursorTo(0);
    let stdoutText = '';
    if (stream.results[0] && stream.results[0].alternatives[0]) {
        stdoutText =
            convertMsToTime(correctedTime) + ': ' + stream.results[0].alternatives[0].transcript;
    }

    if (stream.results[0].isFinal) {
        // process.stdout.write(chalk.green(`${stdoutText}\n`));

        isFinalEndTime = resultEndTime;
        lastTranscriptWasFinal = true;
    } else {
        // Make sure transcript does not exceed console character length
        // if (stdoutText.length > process.stdout.columns) {
        //     stdoutText =
        //         stdoutText.substring(0, process.stdout.columns - 4) + '...';
        // }
        // process.stdout.write(chalk.red(`${stdoutText}`));

        lastTranscriptWasFinal = false;
    }

    // emit transcription to client using stdoutText
    client.emit("receive_audio_text", {
        text: `${stdoutText}\n`,
        isFinal: stream.results[0].isFinal,
    });

};

const audioInputStreamTransform = new Writable({
    write(chunk, encoding, next) {
        if (newStream && lastAudioInput.length !== 0) {
            // Approximate math to calculate time of chunks
            const chunkTime = streamingLimit / lastAudioInput.length;
            if (chunkTime !== 0) {
                if (bridgingOffset < 0) {
                    bridgingOffset = 0;
                }
                if (bridgingOffset > finalRequestEndTime) {
                    bridgingOffset = finalRequestEndTime;
                }
                const chunksFromMS = Math.floor(
                    (finalRequestEndTime - bridgingOffset) / chunkTime
                );
                bridgingOffset = Math.floor(
                    (lastAudioInput.length - chunksFromMS) * chunkTime
                );

                for (let i = chunksFromMS; i < lastAudioInput.length; i++) {
                    recognizeStream.write(lastAudioInput[i]);
                }
            }
            newStream = false;
        }

        audioInput.push(chunk);

        if (recognizeStream) {
            recognizeStream.write(chunk);
        }

        next();
    },

    final() {
        if (recognizeStream) {
            recognizeStream.end();
        }
    },
});

function restartStream(client) {
    stopStream()

    lastAudioInput = audioInput;

    restartCounter++;

    if (!lastTranscriptWasFinal) {
        // process.stdout.write('\n');
    }
    // process.stdout.write(
    //     chalk.yellow(`${streamingLimit * restartCounter}: RESTARTING REQUEST\n`)
    // );

    newStream = true;

    startStream(client);
}

function stopStream() {
    if (recognizeStream) {
        recognizeStream.end();
        recognizeStream.removeListener('data', speechCallback);
        recognizeStream = null;
    }
    if (resultEndTime > 0) {
        finalRequestEndTime = isFinalEndTime;
    }

    if (restartTimer) clearTimeout(restartTimer)
    restartCounter = 0
    resultEndTime = 0;

    lastAudioInput = [];
}

export {
    startStream,
    stopStream,
    audioInputStreamTransform
}
// Start recording and send the microphone input to the Speech API
// recorder
//     .record({
//         sampleRateHertz: sampleRateHertz,
//         threshold: 0, // Silence threshold
//         silence: 1000,
//         keepSilence: true,
//         recordProgram: 'rec', // Try also "arecord" or "sox"
//     })
//     .stream()
//     .on('error', err => {
//         console.error('Audio recording error ' + err);
//     })
//     .pipe(audioInputStreamTransform);

// console.log('');
// console.log('Listening, press Ctrl+C to stop.');
// console.log('');
// console.log('End (ms)       Transcript Results/Status');
// console.log('=========================================================');

// startStream();
// [END speech_transcribe_infinite_streaming]