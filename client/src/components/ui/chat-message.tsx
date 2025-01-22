import { AvatarImage, AvatarFallback, Avatar } from "@/components/ui/avatar"
import MarkdownRenderer from "../component/markdown-renderer"
import { Message, Sender } from "@/lib/domains"
import { imgBasePath } from "@/lib/config"

import '../ui/chat-message.css'

export default function ChatMessage({ message, bodyClassName, onReferenceClick }: { message: Message, bodyClassName?: string, onReferenceClick?: (docContent: string) => void }) {
    return (
        <div className="flex items-start space-x-4">
            <Avatar className="h-8 w-8 md:h-10 md:w-10 border hidden md:block">
                <AvatarImage alt="@shadcn" src={message.sender == Sender.HUMAN ? `${imgBasePath}/placeholder-user.jpg` : `${imgBasePath}/placeholder-bot.jpg`} />
                <AvatarFallback>AC</AvatarFallback>
            </Avatar>
            <div className="flex flex-col space-y-2">
                <p className="font-semibold">{message.sender == Sender.HUMAN ? "@user" : "@bot"}</p>
                <MarkdownRenderer content={message?.body} className={bodyClassName} />
                {/* <p className="text-sm">{message.body}</p> */}
                {message.metadata?.sources && onReferenceClick && (
                    <div className="mt-2">
                        <div className="flex flex-row items-center mb-2">
                            <p className="text-sm font-semibold mr-2">References:</p>
                            {message.metadata?.sources?.map((s, sid) => (
                                <p key={sid} onClick={() => onReferenceClick(s.docContent)} className="text-xs md:text-sm flex justify-center items-center flex-nowrap rounded-full border border-gray-300 px-2 py-1 text-xs mr-2 hover:border-gray-500 px-4 cursor-pointer">{sid + 1}</p>
                            ))}

                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}