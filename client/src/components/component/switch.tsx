import React from 'react';
import * as SwitchPrimitive from '@radix-ui/react-switch';
import '../ui/switch.css';

export default function Switch({ className, onCheckedChange, disabled = false }: { className?: string, onCheckedChange: (checked: boolean) => void, disabled?: boolean }) {
    return (
        <div className={`border-2 p-2 border-gray-200 rounded-lg cursor-pointer hover:bg-opacity-5 ${className}`} style={{ display: 'flex', alignItems: 'center' }}>
            <SwitchPrimitive.Root disabled={disabled} onCheckedChange={onCheckedChange} className="SwitchRoot mr-2 md:mr-3" id="airplane-mode">
                <SwitchPrimitive.Thumb className="SwitchThumb" />
            </SwitchPrimitive.Root>
            <label className="Label text-xs md:text-sm font-bold" htmlFor="airplane-mode">
                Train
            </label>
        </div>
    )
};
