import React from 'react';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: () => void;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ checked, onChange }) => (
    <label className="relative inline-block w-[50px] h-[26px] shrink-0 cursor-pointer">
        <input
            type="checkbox"
            className="peer sr-only"
            checked={checked}
            onChange={onChange}
        />
        {/* Slider Track */}
        <span className="absolute inset-0 rounded-[50px] bg-zinc-600 peer-checked:bg-studio-accent transition-colors duration-300"></span>
        {/* Slider Knob */}
        <span className="absolute top-[3px] left-[3px] h-[20px] w-[20px] bg-white rounded-full transition-transform duration-300 peer-checked:translate-x-[24px]"></span>
    </label>
);
