"use client";

// Design intake UI: color swatches (curated + free picker), fabric presets,
// and the per-garment style option tree. Every choice is optional — the
// pickers toggle off when the selected value is clicked again.

import { motion } from "framer-motion";
import {
  COLOR_SWATCHES,
  fabricsForGarment,
  styleGroupsForGarment,
  swatchNameForHex,
} from "~/lib/commission-design";
import type { CommissionDesign } from "~/lib/commission-design";

interface DesignSectionProps {
  garmentType: string;
  design: CommissionDesign;
  onDesignChange: (design: Partial<CommissionDesign>) => void;
}

const CUSTOM_PICKER_DEFAULT = "#10b981";

export function ColorSwatchPicker({
  design,
  onDesignChange,
}: Omit<DesignSectionProps, "garmentType">) {
  const selectedHex = design.colorHex?.toLowerCase() ?? null;
  const isCustom =
    selectedHex !== null &&
    !COLOR_SWATCHES.some((s) => s.hex.toLowerCase() === selectedHex);

  const selectColor = (hex: string | null) => {
    onDesignChange({
      colorHex: hex,
      colorName: hex ? swatchNameForHex(hex) : null,
    });
  };

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <span className="block text-sm font-medium text-emerald-100">
          Color
        </span>
        <span className="text-xs text-emerald-200/60">
          {design.colorHex
            ? `${design.colorName ?? "Custom"} · ${design.colorHex}`
            : "Optional — tap to choose"}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {COLOR_SWATCHES.map((swatch) => {
          const isSelected = selectedHex === swatch.hex.toLowerCase();
          return (
            <motion.button
              key={swatch.hex}
              type="button"
              onClick={() => selectColor(isSelected ? null : swatch.hex)}
              aria-label={`Color ${swatch.name}`}
              aria-pressed={isSelected}
              title={swatch.name}
              className={`h-8 w-8 rounded-full border transition-shadow focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none ${
                isSelected
                  ? "border-white shadow-[0_0_0_3px_rgba(16,185,129,0.6)]"
                  : "border-white/20 hover:border-white/50"
              }`}
              style={{ backgroundColor: swatch.hex }}
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.94 }}
            />
          );
        })}

        {/* Free picker — native color input for keyboard/AT support */}
        <label
          title="Custom color"
          className={`relative h-8 w-8 cursor-pointer rounded-full border transition-shadow focus-within:ring-2 focus-within:ring-emerald-400 ${
            isCustom
              ? "border-white shadow-[0_0_0_3px_rgba(16,185,129,0.6)]"
              : "border-white/20 hover:border-white/50"
          }`}
          style={{
            background: isCustom
              ? (design.colorHex ?? undefined)
              : "conic-gradient(#f87171, #facc15, #4ade80, #38bdf8, #a78bfa, #f87171)",
          }}
        >
          <input
            type="color"
            value={design.colorHex ?? CUSTOM_PICKER_DEFAULT}
            onChange={(e) => selectColor(e.target.value)}
            aria-label="Custom color"
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
        </label>
      </div>
    </div>
  );
}

export function FabricPicker({
  garmentType,
  design,
  onDesignChange,
}: DesignSectionProps) {
  const fabrics = fabricsForGarment(garmentType);
  if (fabrics.length === 0) return null;

  const selected = fabrics.find((f) => f.id === design.fabric);

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <span className="block text-sm font-medium text-emerald-100">
          Fabric
        </span>
        <span className="text-xs text-emerald-200/60">
          {selected ? selected.label : "Optional"}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {fabrics.map((fabric) => {
          const isSelected = design.fabric === fabric.id;
          return (
            <button
              key={fabric.id}
              type="button"
              onClick={() =>
                onDesignChange({ fabric: isSelected ? null : fabric.id })
              }
              aria-pressed={isSelected}
              title={fabric.description}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none ${
                isSelected
                  ? "border-emerald-400 bg-emerald-500/30 text-white"
                  : "border-emerald-700/40 bg-emerald-950/40 text-emerald-200/80 hover:border-emerald-500/60 hover:text-emerald-100"
              }`}
            >
              {fabric.label}
            </button>
          );
        })}
      </div>
      {selected && (
        <p className="mt-2 text-xs text-emerald-200/60">
          {selected.description}
        </p>
      )}
    </div>
  );
}

export function StyleOptionsPicker({
  garmentType,
  design,
  onDesignChange,
}: DesignSectionProps) {
  const groups = styleGroupsForGarment(garmentType);
  if (groups.length === 0) return null;

  const setOption = (groupId: string, value: string | null) => {
    const next = { ...design.styleOptions };
    if (value === null) {
      delete next[groupId];
    } else {
      next[groupId] = value;
    }
    onDesignChange({ styleOptions: next });
  };

  return (
    <div className="space-y-4">
      {groups.map((group) => {
        const current = design.styleOptions[group.id] ?? null;
        return (
          <div key={group.id}>
            <span className="mb-2 block text-sm font-medium text-emerald-100">
              {group.label}
            </span>
            <div className="flex flex-wrap gap-2">
              {group.options.map((option) => {
                const isSelected = current === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      setOption(group.id, isSelected ? null : option.value)
                    }
                    aria-pressed={isSelected}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none ${
                      isSelected
                        ? "border-emerald-400 bg-emerald-500/30 text-white"
                        : "border-emerald-700/40 bg-emerald-950/40 text-emerald-200/80 hover:border-emerald-500/60 hover:text-emerald-100"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface DesignPanelProps extends DesignSectionProps {
  error?: string;
}

// Full design intake (used by the mobile tab; desktop splits the sections
// across columns).
export function DesignPanel({
  garmentType,
  design,
  onDesignChange,
  error,
}: DesignPanelProps) {
  return (
    <div className="space-y-6">
      <ColorSwatchPicker design={design} onDesignChange={onDesignChange} />
      <FabricPicker
        garmentType={garmentType}
        design={design}
        onDesignChange={onDesignChange}
      />
      <StyleOptionsPicker
        garmentType={garmentType}
        design={design}
        onDesignChange={onDesignChange}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
