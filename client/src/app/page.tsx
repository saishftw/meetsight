'use client'

/* eslint-disable react-hooks/exhaustive-deps */
import { default as React, useEffect, useState, useRef } from "react";
import clsx from "clsx";

import { AccordionTrigger, AccordionContent, AccordionItem, Accordion } from "@/components/ui/accordion"
import { ScrollArea } from "@/components/ui/scroll-area"
import Chat from "@/components/component/chat";
import { ImportMetadata, Insights, Message } from "@/lib/domains";

import { clearLocalStorage, copyLink, generateMeetingId, generateShareLink, getInsightsFromLocalStorage, getMeetingId, getMeetingIdFromLocalStorage, getMeetingIdUrlParam, getMeetingTitleFromLocalStorage, getMessagesFromLocalStorage, getReadonlyFromLocalStorage, getTranscriptsFromLocalStorage, prepareMeetingDetails, saveInsightsToLocalStorage, saveMeetingIdToLocalStorage, saveMeetingTitleToLocalStorage, saveReadonlyToLocalStorage, saveTranscriptsToLocalStorage } from "@/lib/utils";
import '../components/ui/dashboard.css';
import Header from "@/components/component/header";
import TranscriptPanel from "@/components/component/transcript-panel";
import InsightPanel from "@/components/component/insight-panel";
import { getMeetingFile, saveFile } from "@/lib/server-actions";


export default function Page() {
  const [currentTranscript, setCurrentTranscript] = useState<string>("");
  const [transcript, setTranscript] = useState<string[]>([]);
  const [insights, setInsights] = useState<Insights | undefined>()
  const [highlightParagraphIndices, setHighlightParagraphIndices] = useState<number[]>([])
  const [isMeetingReadonly, setIsMeetingReadonly] = useState<boolean>(false)
  const [meetingTitle, setMeetingTitle] = useState<string>("")
  const [meetingId, setMeetingId] = useState<string>("")
  const [messages, setMessages] = useState<Message[]>([])
  const [authenticated, setIsAuthenticated] = useState<boolean>(false)

  const onMeetingStart = () => {
    setMeetingId(generateMeetingId())
  }

  const reset = () => {
    const confirmation = window.confirm("This will clear the transcripts and generated insights. Do you wish to proceed?")
    if (confirmation) {

      setTranscript([])
      setInsights(undefined)
      clearLocalStorage()
      window.location.reload()
    }
  }

  const shareMeeting = async () => {
    const meetingDetails = prepareMeetingDetails()
    console.log(meetingDetails)
    const isSaved = saveFile(meetingDetails)

    if (isSaved) {
      const link = generateShareLink(meetingDetails.meetingId)
      await copyLink(link)
    }
    else {
      alert("Could not generate a shareable link")

    }
  }

  const importMeeting = (meeting: ImportMetadata) => {
    setTranscript(meeting.transcript)
    setInsights(meeting.insights)
    setIsMeetingReadonly(meeting.readonly)
    setMeetingId(meeting.meetingId)
    setMeetingTitle(meeting.meetingTitle)
    setMessages(meeting.messages)
  }

  const onBotResponseReferenceClick = (docContent: string) => {
    const filteredElements = transcript.filter(r => r.includes(docContent) || docContent.includes(r));
    const indices = [];

    for (const element of filteredElements) {
      indices.push(transcript.findIndex(el => el === element));
    }

    setHighlightParagraphIndices(indices)
  }

  useEffect(() => {
    if (insights) saveInsightsToLocalStorage(insights)
  }, [insights])

  useEffect(() => {
    saveTranscriptsToLocalStorage(transcript)
    document.getElementById('scrollViewport')?.children[0].scrollIntoView({ behavior: "smooth", block: "end" });
  }, [transcript])

  useEffect(() => {
    saveMeetingIdToLocalStorage(meetingId)
  }, [meetingId])

  useEffect(() => {
    saveMeetingTitleToLocalStorage(meetingTitle)
  }, [meetingTitle])

  useEffect(() => {
    saveReadonlyToLocalStorage(isMeetingReadonly)
  }, [isMeetingReadonly])

  useEffect(() => {
    saveReadonlyToLocalStorage(isMeetingReadonly)
  }, [isMeetingReadonly])

  useEffect(() => {
    // sets meeting properties to state
    const meetingIdUrlParam = getMeetingIdUrlParam()
    if (meetingIdUrlParam) {
      getMeetingFile(meetingIdUrlParam).then((meetingDetails) => {
        importMeeting(meetingDetails)
        return
      }).catch((err) => {
        console.error(err.message);
      });
    }
    else {
      setTranscript(getTranscriptsFromLocalStorage())
      setInsights(getInsightsFromLocalStorage())
      setIsMeetingReadonly(getReadonlyFromLocalStorage())
      setMeetingId(getMeetingIdFromLocalStorage() ?? "")
      setMeetingTitle(getMeetingTitleFromLocalStorage() ?? "")
      setMessages(getMessagesFromLocalStorage())
    }
  }, [])


  useEffect(() => {
    const scrollDiv = document.getElementById('scrollViewport')?.children[0]
    const allParaElements = scrollDiv?.querySelectorAll('p')
    allParaElements?.forEach(p => p.classList.remove('text-highlight'))
    // const firstAndLastIndex = [highlightParagraphIndices[0], highlightParagraphIndices[highlightParagraphIndices.length - 1]]
    if (scrollDiv && highlightParagraphIndices.length) {
      highlightParagraphIndices.forEach(i => {
        const targetParagraph = scrollDiv.querySelector(`p[data-key="${i}"]`);
        if (targetParagraph) {
          targetParagraph.classList.add('text-highlight');
          targetParagraph.scrollIntoView({ behavior: 'smooth' });
        } else {
          console.error(`Paragraph with key "${i}" not found`);
        }
      });
    }
  }, [highlightParagraphIndices]);

  return (
    <div className="flex flex-col bg-white text-black h-screen w-full">
      <Header isMeetingReadonly={isMeetingReadonly} meetingTitle={meetingTitle} onReset={reset} onShare={shareMeeting} onImport={importMeeting} />
      <div className="dashboard-container bg-white text-black flex flex-grow w-full items-center justify-center bg-gray-100 ">
        <div className="flex w-full h-full divide-x divide-gray-300 bg-white">
          {/* Transcripts Panel */}
          <TranscriptPanel
            isMeetingReadonly={isMeetingReadonly}
            onStart={onMeetingStart}
            transcript={transcript}
            currentTranscript={currentTranscript}
            onNewTranscript={(transcript: string) => setTranscript((old) => [...old, transcript])}
            setCurrentTranscript={(transcript: string) => setCurrentTranscript(transcript)}
          />
          {/* Insights Panel */}
          <div className="flex w-1/2 flex-col space-y-4">
            <ScrollArea className="flex-grow p-4">
              <Accordion className="flex-grow" collapsible type="single" defaultValue="insights">
                <AccordionItem value="insights">
                  <AccordionTrigger>
                    <h2 className="text-md md:text-lg font-semibold">Insights
                      {insights && (
                        <span className={clsx('rounded-full px-2 py-1 text-xs font-semibold font-mono ml-1 inline-block', {
                          'bg-green-300': insights?.sentiment >= 0.6,
                          'bg-yellow-300': insights?.sentiment < 0.6
                        })}>
                          Sentiment: {!isNaN(insights?.sentiment) ? (Math.abs(Number(insights?.sentiment?.toFixed(2)))) : 0}
                        </span>
                      )}
                    </h2>
                  </AccordionTrigger>
                  <AccordionContent>
                    <InsightPanel isMeetingReadonly={isMeetingReadonly} transcript={transcript} insights={insights} meetingId={meetingId} setInsights={setInsights} />
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="chat">
                  <AccordionTrigger>
                    <h2 className="text-md md:text-lg font-semibold">Chat</h2>
                  </AccordionTrigger>
                  <AccordionContent>
                    <Chat onReferenceClick={onBotResponseReferenceClick} messages={messages} meetingId={meetingId} addMessage={(message) => setMessages((prevMessages: any) => [...prevMessages, message])} />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </ScrollArea>
          </div >
        </div >
      </div >
    </div>

  );
};
