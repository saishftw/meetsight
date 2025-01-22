import { Textarea } from "../ui/textarea"
import { useEffect, useState } from "react"
import { BotResponse, Message, Sender } from "@/lib/domains"
import { getConversationIdFromLocalStorage, getMessagesFromLocalStorage, saveConversationIdToLocalStorage, saveMessagesToLocalStorage } from "@/lib/utils"
import { v4 as uuidv4 } from 'uuid';
import { sendUserQuery, startConversation } from "@/lib/server-actions"
import ChatMessage from "../ui/chat-message"
import Placeholder from "./placeholder";

export default function Chat({ messages, onReferenceClick, meetingId, addMessage }: { messages: Message[], onReferenceClick: (docContent: string) => void, meetingId: string, addMessage: (message: Message) => void }) {
    const [conversationId, setConversationId] = useState<string | null>()
    // const [messages, setMessages] = useState<Message[]>([])
    const [isBotResponding, setIsBotResponding] = useState<boolean>(false)
    const [userQuery, setUserQuery] = useState<string>("")

    const handleKeyDown = (event: any) => {
        if (event.keyCode === 13 && userQuery.trim() !== "")
            onUserMessageSend()
    }

    const onUserMessageSend = async () => {
        //save user response
        const userMessage: Message = {
            id: uuidv4(),
            body: userQuery,
            sender: Sender.HUMAN
        }
        addMessage(userMessage)
        // setMessages((prevMessages: any) => [...prevMessages, userMessage]);
        setUserQuery("")

        setIsBotResponding(true)
        try {
            let conversationIdRes = null
            if (conversationId == null) {
                conversationIdRes = await startConversation()
                setConversationId(conversationIdRes)
            }
            else {
                conversationIdRes = conversationId
            }

            let botResponse: BotResponse | null = null
            if (conversationIdRes != null) {
                botResponse = await sendUserQuery(userQuery, conversationIdRes, meetingId)

                //save bot response
                let botMessage: Message = {
                    id: uuidv4(),
                    body: botResponse.response,
                    sender: Sender.BOT,
                    metadata: botResponse.metadata
                }
                console.log(messages)
                addMessage(botMessage)
                // setMessages((prevMessages) => [...prevMessages, botMessage]);

                setIsBotResponding(false)
            }
            else setIsBotResponding(false)
        } catch (error) {
            setIsBotResponding(false)
            console.error(error)
        }

    }

    // useEffect(() => {
    //     // setConversationId(getConversationIdFromLocalStorage())
    //     setMessages(getMessagesFromLocalStorage())
    // }, [])

    useEffect(() => {
        if (conversationId != null)
            saveConversationIdToLocalStorage(conversationId)
    }, [conversationId])

    useEffect(() => {
        saveMessagesToLocalStorage(messages)
    }, [messages])

    return (
        <div id="chat-section" className="flex flex-col space-y-4">
            {messages.length !== 0 ? (messages.map(m => (
                <ChatMessage key={m.id} message={m} onReferenceClick={onReferenceClick} />
            ))) : (
                <Placeholder text="Your chat messages will appear here" />
            )}
            {isBotResponding && (
                <ChatMessage message={{ body: 'typing...', sender: Sender.BOT }} bodyClassName="italic" />
            )}
            <Textarea placeholder="Enter you query..." disabled={isBotResponding} className="self-center" value={userQuery} onChange={(e) => setUserQuery(e.target.value)} onKeyDown={handleKeyDown} />
        </div>
    )

}