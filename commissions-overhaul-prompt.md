# Task: Overhaul the Commissions page

You are Fable 5 working in the **calayo-clothing** repo (T3 stack: Next.js 15 App
Router, tRPC, Better-Auth, Supabase/Postgres, TailwindCSS 4 + MUI, React Three
Fiber + Drei, GSAP [Flip, ScrambleText, ScrollTo] + Framer Motion). Read
`CLAUDE.md` before starting. This is a long-horizon task — plan deeply, work in
phases, and don't stop at the first idea. I want your judgment, not just
execution.

## Goal

Reimagine and rebuild the custom-clothing **commissions experience** so it feels
like a genuine made-to-order design tool, not a form. The commission flow is the
core conversion path of the business; treat it as the product, not a page.

I want three things from you, in order, and I care about the thinking as much as
the code:

1. **Divergent ideation** — propose several distinct directions for what this
   experience could become. Not variations on the current form; actually
   different concepts (e.g. a guided "design studio" wizard, a live 3D
   configurator, a conversational intake, a measurement-confidence system).
2. **Honest feasibility breakdown** — for each idea, say what would work, what
   probably won't, what's expensive, what's risky given the current
   architecture, and what you'd cut. Push back on my ideas where warranted.
3. **Plan then build** — converge on a recommended direction, write a phased
   implementation plan, then execute it to a working, verified state.

## Deep-dive direction: make the form go further

The current form collects garmentType, 25 measurement fields, budget, timeline,
and a freeform details textarea. That's shallow for bespoke clothing. Explore
how the intake could capture real design intent, for example:

- **Color / fabric / material** selection (see the seed idea below).
- Fit preferences (slim/relaxed, rise, break, ease amounts).
- Style/detail options that vary per garment type (collar, cuffs, pleats,
  lining, pockets, closures) — a dynamic option tree keyed on garment.
- Reference images / inspiration upload (UploadThing is already in the stack).
- Measurement confidence & guidance: flag implausible values, offer "measure
  from a garment you own" flows, derive/estimate secondary measurements.
- Progressive disclosure so the depth doesn't overwhelm — the form should feel
  light but be capable of capturing a lot.

Decide which of these actually improve conversion and craft vs. which add
friction. Depth is only worth it if it's guided.

## Seed idea to design around: live 3D color picker

I want users to change the color of the displayed 3D garment live, and have that
choice carried into the commission. Use this as a concrete worked example of
"deeper intake wired to the 3D viewer." Work out the full path, including the
parts that don't exist yet:

- **State**: there is currently no color state anywhere. You'll need to lift a
  color (and probably fabric/material params) into the form state
  (`CommissionFormData` in `src/app/commissions/types.ts`) and thread it through
  `GarmentViewer → Scene3D → GarmentModel` into each model.
- **3D materials**: each model
  (`src/app/_components/3d/{Shirt,Dress,Jacket,Pants}Model.tsx`) currently news
  up a `MeshStandardMaterial` inline per render. `ShirtModel` passes
  `color: "grey-300"`, which is **not a valid three.js color** — fix this as
  part of the work. Design a clean, shared way for models to accept a color so
  the picker updates them efficiently (no per-frame material churn).
- **Persistence**: the Zod input schema and Supabase insert in
  `src/server/api/routers/commissions.ts` have no color field, and neither does
  the DB. A real color choice must survive submission — plan the schema change +
  migration (`src/server/migrations/`), tRPC input, and insert mapping.
- **Fallback**: `GarmentViewer` renders a 2D fallback for low-end/mobile
  devices — the color choice should still be represented there.
- **UX questions to answer**: curated swatch presets vs. free HSV picker (or
  both)? How do you keep perceived color honest under the scene's three-point
  lighting? Does color apply to the whole garment or per-panel? Accessibility of
  the picker? Mobile behavior?
- Note that `skirt` and `other` have **no 3D model** (placeholder only) — decide
  how color/preview behaves for them.

## Map of what exists (start here)

- `src/app/commissions/page.tsx` → `CommissionsForm.tsx` → `GSAPFormContainer.tsx`
  (GSAP Flip expand animation + ScrambleText on the measurement guide) →
  `UnifiedFormLayout.tsx` (a 3-column grid where each column uses
  `.grid-column-inline-grid` = `display: inline-grid`; column-1 = garment select,
  column-2 = budget/timeline + `GarmentViewer`, column-3 = measurement guide +
  `MeasurementNavigator` + submit).
- Measurement UX: `MeasurementNavigator.tsx` (dot carousel, one field at a time),
  `MeasurementGuideDisplay.tsx`, `measurementGuideData.ts`, `constants.ts`
  (`REQUIRED_MEASUREMENTS`, `MEASUREMENT_GROUPS`).
- 3D: `GarmentViewer.tsx` (device-capability gating, 2D fallback, Canvas) →
  `Scene3D.tsx` (camera, lighting, OrbitControls) → `GarmentModel.tsx` (switch on
  garmentType) → GLTF models under `public/3d-assets/`.
- Validation lives twice: client (`utils.ts` `validateCommissionForm`) and server
  (Zod in `commissions.ts`) — keep them in sync.

## Constraints & conventions

- Keep the existing visual language (emerald/dark glass, rounded-2xl, subtle
  GSAP/Framer motion). Elevate it; don't replace the brand.
- Respect the mobile path everywhere — read `~/context/mobile-provider`
  (`isMobile/isTablet/isDesktop`) and the low-end-device fallback logic; 3D and
  heavy interactions must degrade gracefully.
- Type-safe end to end (strict TS, Zod). No `any`, no stubs, no TODOs left in
  core paths — finish what you start.
- Path alias `~/*` → `src/*`.
- Do NOT run `pnpm dev`/`pnpm build` (a dev server is already running). Use
  `pnpm typecheck` / `tsc --noEmit` to validate. Don't run `pnpm lint` after
  every change (it tends to time out) — run it once near the end.
- Commit in logical increments with descriptive messages. Do not mention Claude,
  Fable, or AI authorship anywhere in commits or code.
- Work on the current feature branch; don't touch `main` directly.

## Workflow I want you to follow

1. **Discover** — read the files above and confirm your mental model. Note any
   other bugs/dead code you find (e.g. the `grey-300` color, inline material
   creation, commented-out code).
2. **Ideate** — present 3–5 distinct directions with a short pitch each.
3. **Evaluate** — for each, a candid works / doesn't-work / cost / risk
   breakdown. Recommend one (or a phased combination) and say why.
4. **Plan** — write a phased implementation plan (data model + migration →
   3D/color plumbing → deeper form fields → UX polish), with what's verifiable at
   each phase. Surface any decisions you genuinely need from me; otherwise pick
   sensible defaults and note them.
5. **Build** — implement phase by phase. After each phase, typecheck and
   describe how you verified it actually works (drive the flow, not just
   compile). Keep going until the recommended scope is working end to end,
   including persistence and the mobile/2D fallback.
6. **Report** — summarize what changed, what you deferred, and what you'd do
   next.

Use extended thinking for the ideation, feasibility, and planning phases — I want
the reasoning to be thorough. Start with Discovery and Ideation; pause for my
input only if a decision materially changes the architecture. Otherwise, run.
