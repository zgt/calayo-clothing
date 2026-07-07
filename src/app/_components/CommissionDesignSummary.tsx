// Renders a commission's design selections (color, fabric, style options)
// as rows for the order-detail definition lists. Shared by the user and
// admin views. Renders nothing for commissions submitted before design
// intake existed.

import { getFabricById, styleGroupsForGarment } from "~/lib/commission-design";

export interface CommissionDesignFields {
  garment_type: string;
  color_hex: string | null;
  color_name: string | null;
  fabric: string | null;
  design_options: Record<string, string> | null;
}

export function CommissionDesignSummary({
  commission,
}: {
  commission: CommissionDesignFields;
}) {
  const fabric = getFabricById(commission.fabric);
  const styleGroups = styleGroupsForGarment(commission.garment_type);
  const options = Object.entries(commission.design_options ?? {})
    .map(([groupId, value]) => {
      const group = styleGroups.find((g) => g.id === groupId);
      const option = group?.options.find((o) => o.value === value);
      // Fall back to raw values so older/edited data still displays.
      return {
        groupId,
        label: group?.label ?? groupId,
        value: option?.label ?? value,
      };
    })
    .sort((a, b) => a.label.localeCompare(b.label));

  if (!commission.color_hex && !fabric && options.length === 0) {
    return null;
  }

  return (
    <>
      {commission.color_hex && (
        <div className="flex justify-between">
          <dt className="text-emerald-200/70">Color:</dt>
          <dd className="flex items-center gap-2 text-white">
            <span
              className="h-4 w-4 rounded-full border border-white/30"
              style={{ backgroundColor: commission.color_hex }}
              aria-hidden
            />
            {commission.color_name ?? commission.color_hex}
          </dd>
        </div>
      )}
      {fabric && (
        <div className="flex justify-between">
          <dt className="text-emerald-200/70">Fabric:</dt>
          <dd className="text-white">{fabric.label}</dd>
        </div>
      )}
      {options.map((option) => (
        <div key={option.groupId} className="flex justify-between">
          <dt className="text-emerald-200/70">{option.label}:</dt>
          <dd className="text-white">{option.value}</dd>
        </div>
      ))}
    </>
  );
}
