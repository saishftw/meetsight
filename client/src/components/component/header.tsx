import { saveInsights } from "@/lib/utils";
import { Button } from "../ui/button";
import ImportButton from "./import-button";
import { ImportMetadata } from "@/lib/domains";
import { MagnifyingGlassIcon, ReloadIcon, ResetIcon, Share1Icon } from "@radix-ui/react-icons";
import { Download, DownloadCloudIcon, DownloadIcon, Share, Share2Icon } from "lucide-react";

export default function Header({ onReset, onShare, onImport, meetingTitle, isMeetingReadonly }: { onReset: () => void, onShare: () => void, onImport: (meeting: ImportMetadata) => void, meetingTitle: string, isMeetingReadonly: boolean }) {
    return (
        <div className="dashboard-header p-3 font-bold border flex flex-row w-full justify-between items-center">
            <div className="flex-1 flex justify-start overflow-hidden">
                <p className="border-2 border-black antialiased text-xs md:text-sm py-1 pr-1"> <span className="bg-black text-white mr-1 py-2 px-1">Meet</span> Sight</p>
            </div>
            <div className="flex-1 justify-center text-xs md:text-sm hidden md:flex">
                <p>{meetingTitle}</p>
            </div>
            <div className="flex-1 flex justify-end">
                {!isMeetingReadonly && <Button className="hover:bg-red-100 h-4 mr-2 bg-white text-red-600 text-xs md:text-base p-2 md:p-3" onClick={onReset} title="Reset"><ReloadIcon width="18" height="18" /></Button>}
                {!isMeetingReadonly && <ImportButton onImport={onImport} className="mr-2" btnClass="hover:bg-blue-100 bg-white text-black hover:text-blue-500 text-xs md:text-base p-2 md:p-3" />}
                <Button className="hover:bg-orange-100 hover:text-orange-600 h-4 mr-2 bg-white text-black text-xs md:text-base p-2 md:p-3" onClick={onShare} title="Share"><Share2Icon width="18" height="18" /></Button>
                <Button className="hover:bg-green-100 hover:text-green-600 bg-white text-black h-4 text-xs md:text-base p-2 md:p-3" onClick={saveInsights} title="Download"><DownloadIcon width="18" height="18" /></Button>
            </div>
        </div>
    )
}