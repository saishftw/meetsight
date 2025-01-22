import { Button } from "@/components/ui/button"
import { ImportMetadata } from "@/lib/domains"
import { Import, ImportIcon, UploadIcon } from "lucide-react"
import { useRef } from "react"

export default function ImportButton({ className, btnClass, onImport }: { className?: string, btnClass?: string, onImport: (meeting: ImportMetadata) => void }) {
    const fileInputRef = useRef<HTMLInputElement>(null)

    const onButtonClick = () => fileInputRef.current?.click()

    const onFileSelect = async () => {
        if (!fileInputRef.current || !fileInputRef.current.files || !fileInputRef.current.files[0]) {
            window.alert('Please select a JSON file.');
            return;
        }

        const file = fileInputRef.current.files[0];

        if (!file.type.match('application/json')) {
            window.alert('Selected meeting is not a valid file.');
            return;
        }

        try {
            const reader = new FileReader();
            reader.readAsText(file);
            reader.onload = () => {
                try {
                    const meetingDetails: ImportMetadata = JSON.parse(reader.result as string);

                    if (!(meetingDetails.insights || meetingDetails.messages || meetingDetails.transcript)) {

                        window.alert("Imported file is not supported")
                        return
                    }

                    onImport(meetingDetails)

                } catch (error) {
                    window.alert(`Error parsing JSON data: ${error}`);
                }
            };
            reader.onerror = (error) => {
                window.alert(`Error reading file: ${error}`);
            };
        } catch (error) {
            window.alert(`Error creating file reader: ${error}`);
        }
    };

    return (
        <div className={`inline-flex items-center justify-center ${className}`}>
            <Button className={`h-4 ${btnClass}`} onClick={onButtonClick} title="Import"><UploadIcon width="18" height="18" /></Button>
            <input onChange={onFileSelect} ref={fileInputRef} className="hidden" type="file" id="fileInput" accept=".json" />
        </div>
    )
}