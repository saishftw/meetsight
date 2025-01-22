// This script can be used capture and convert transcription generated from GCP Speech API
// into Meeting Insights Tool. 
// Following are the steps:
// 1. GCP get transcription from Speech API
//      - Go to https://console.cloud.google.com/speech/transcriptions
//      - Submit audio file for the recorded meeting
//      - New Transcription > Upload Audio > Select Configuration (V2 API, en-US, Chirp 2) > Submit
//      - Download JSON transcription file (transcriptsJSON)
// 2. Execute below script in Meeting Insights Tool console to import the meeting

localStorage.clear()
transcriptJSON = {} // copy the transcript JSON here
transcript = transcriptJson.results.map(t => t.alternatives[0].transcript + "\n")
localStorage.setItem('TRANSCRIPTS', JSON.stringify(transcript))
