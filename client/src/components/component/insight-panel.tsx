import { Insights } from "@/lib/domains";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import IssueTracker from "./issue-tracker";
import { useState } from "react";
import { generateInsights } from "@/lib/server-actions";
import Placeholder from "./placeholder";
import Switch from "./switch";

export default function InsightPanel({ transcript, insights, setInsights, isMeetingReadonly, meetingId }: { transcript: string[], insights?: Insights, setInsights: (insights: Insights) => void, isMeetingReadonly: boolean, meetingId: string }) {
    const [isGenerating, setIsGenerating] = useState<boolean>(false);
    const [isTrainEnabled, setIsTrainEnabled] = useState<boolean>(false);

    const onGenerateClick = async () => {
        if (transcript.length == 0) return

        try {
            setIsGenerating(true)
            const insights = await generateInsights(transcript.join(""), isTrainEnabled, meetingId)
            if (insights) setInsights(insights)
            setIsGenerating(false)
        } catch (error) {
            setIsGenerating(false)
            console.error('Generate Insights error', error)
        }
    }

    return (
        <div>
            {insights ? (
                <div className="flex-grow space-y-4">
                    {/* Topics */}
                    <div className="flex flex-col space-y-2">
                        <label className="bg-white font-medium" htmlFor="summary">
                            Topics
                        </label>
                        <div className="flex flex-row flex-wrap overflow-x-auto">
                            {
                                insights?.topics?.map((t, tid) => (
                                    <p key={tid} className="flex justify-center items-center flex-nowrap rounded-full border border-gray-200 px-2 py-1 text-xs mr-2 mb-2">{t}</p>
                                ))
                            }
                        </div>
                    </div>

                    {/* Summary  */}
                    <div className="flex flex-col space-y-2">
                        <label className="bg-white font-medium" htmlFor="summary">
                            Summary
                        </label>
                        <ScrollArea className="flex-grow rounded-md border border-gray-200 p-4">
                            <p className="text-xs md:text-sm">{insights?.summary}</p>
                        </ScrollArea>
                        {/* <Textarea id="summary" placeholder="Summary of the meeting." /> */}
                    </div>

                    {/* Issue tracker */}
                    <div className="flex flex-col space-y-2">
                        <label className="bg-white font-medium" htmlFor="issues">
                            Issue Tracker
                        </label>
                        <div className="flex-grow rounded-md border border-gray-200">
                            <IssueTracker issues={insights?.issue_tracker} />
                        </div>
                    </div>

                    {/* Action items */}
                    <div className="flex flex-col space-y-2">
                        <label className="font-medium" htmlFor="issues">
                            Action Items
                        </label>
                        <ScrollArea className="flex-grow rounded-md border border-gray-200 p-4">
                            {insights?.action_items?.map((item, id) => (
                                <p key={id} className="mt-1"> • {item}</p>
                            ))}
                        </ScrollArea>
                    </div>
                </div >
            ) : (
                <Placeholder text="Your Meeting Insights will appear here" />
            )}
            {!isMeetingReadonly && (<div className="flex w-100 flex-col sm:flex-row sm:items-center justify-center mt-3">
                <Switch onCheckedChange={(checked) => setIsTrainEnabled(checked)} className="flex-2 sm:mr-1" />
                <Button disabled={!transcript || isGenerating} className="bg-gray-900 hover:bg-gray-900/80 h-5 flex-1" onClick={onGenerateClick}>Generate</Button>
            </div>)}

        </div>
    )
}