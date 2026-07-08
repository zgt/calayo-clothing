// Stepped range slider for ordered discrete choices (budget, timeline).
// Emits the enum bucket value for the selected step, so the shared
// client/server contract stays intact while giving a tactile picker UX.
// Until the user interacts, the thumb parks in the middle rendered "unset"
// (muted) so the required-field validation still fires on an untouched slider.
import React from "react";

interface StepOption {
  value: string;
  label: string;
}

interface StepSliderProps {
  id: string;
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly StepOption[];
  error?: string;
  required?: boolean;
  placeholder?: string;
}

export const StepSlider: React.FC<StepSliderProps> = ({
  id,
  name,
  label,
  value,
  onChange,
  options,
  error,
  required = false,
  placeholder = "Drag to choose",
}) => {
  const lastIndex = Math.max(options.length - 1, 0);
  const selectedIndex = options.findIndex((o) => o.value === value);
  const isSet = selectedIndex !== -1;
  // Park the thumb mid-track while unset; render it muted (see CSS).
  const thumbIndex = isSet ? selectedIndex : Math.round(lastIndex / 2);
  const percent = lastIndex === 0 ? 0 : (thumbIndex / lastIndex) * 100;

  const commit = (index: number) => {
    const opt = options[index];
    if (opt) onChange(opt.value);
  };

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <label
          htmlFor={id}
          className="block text-sm font-medium text-emerald-100"
        >
          {label}
          {required && <span className="ml-1 text-emerald-400">*</span>}
        </label>
        <span
          className={`text-sm font-semibold tabular-nums ${
            isSet ? "text-emerald-300" : "text-emerald-500/50"
          }`}
        >
          {isSet ? options[selectedIndex]?.label : placeholder}
        </span>
      </div>

      <div className="px-1 pt-1">
        <input
          id={id}
          name={name}
          type="range"
          min={0}
          max={lastIndex}
          step={1}
          value={thumbIndex}
          aria-valuetext={isSet ? options[selectedIndex]?.label : placeholder}
          onChange={(e) => commit(Number(e.target.value))}
          onPointerDown={() => {
            // A click that lands on the already-centred thumb won't fire
            // onChange, so commit the current position on first touch.
            if (!isSet) commit(thumbIndex);
          }}
          className={`commission-slider w-full ${
            isSet ? "commission-slider--set" : "commission-slider--unset"
          } ${error ? "commission-slider--error" : ""}`}
          style={{ "--slider-percent": `${percent}%` } as React.CSSProperties}
        />

        {/* Tick dots double as click targets for each tier */}
        <div className="mt-2 flex justify-between px-[3px]">
          {options.map((o, i) => (
            <button
              key={o.value}
              type="button"
              onClick={() => commit(i)}
              aria-label={o.label}
              className={`h-1.5 w-1.5 rounded-full transition-colors ${
                isSet && i <= selectedIndex
                  ? "bg-emerald-400"
                  : "bg-emerald-700/50 hover:bg-emerald-600"
              }`}
            />
          ))}
        </div>

        <div className="mt-1 flex justify-between text-[11px] text-emerald-200/50">
          <span>{options[0]?.label}</span>
          <span>{options[lastIndex]?.label}</span>
        </div>
      </div>

      {error && <p className="mt-1.5 ml-1 text-xs text-red-400">{error}</p>}
    </div>
  );
};
