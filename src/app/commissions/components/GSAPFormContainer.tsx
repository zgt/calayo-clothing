"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { Flip } from "gsap/Flip";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { UnifiedFormLayout } from "./UnifiedFormLayout";
import { useMobile } from "~/context/mobile-provider";
import type { CommissionFormData, MeasurementKey } from "../types";
import type { CommissionDesign } from "~/lib/commission-design";
import { MEASUREMENT_GUIDE_ITEMS } from "../measurementGuideData";

// Register GSAP plugins
gsap.registerPlugin(Flip, ScrambleTextPlugin, useGSAP);

// Panels revealed by the expansion, ordered by distance from the request
// card's landing column so the cascade sweeps diagonally across the grid
// instead of column by column.
const REVEAL_PANEL_SELECTORS = [
  "#garment-preview-card",
  "#measurement-guide-card",
  "#design-card",
  "#measurement-navigator-card",
  "#additional-details-card",
  "#submit-button-container",
];

function queryAll(container: HTMLElement, selectors: string[]): Element[] {
  return selectors
    .map((selector) => container.querySelector(selector))
    .filter((el): el is Element => el !== null);
}

// Snap the layout straight to its expanded end-state with no animation. Used
// for reduced-motion users and when the desktop layout re-mounts after the
// form was already expanded (a resize round trip through the mobile layout
// recreates the DOM in its pre-expansion markup state).
function applyExpandedState(container: HTMLElement) {
  const commissionRequestTarget = container.querySelector(
    "#commission-request-target",
  );
  const budgetTimelineSection = container.querySelector(
    "#budget-timeline-section",
  );
  const budgetTimelineTarget = container.querySelector(
    "#budget-timeline-target",
  );
  const column1 = container.querySelector("#column-1");
  const column3 = container.querySelector("#column-3");

  if (budgetTimelineTarget && budgetTimelineSection) {
    budgetTimelineTarget.appendChild(budgetTimelineSection);
  }
  commissionRequestTarget?.remove();
  gsap.set([column1, column3], { autoAlpha: 1 });
  gsap.set(
    queryAll(container, [
      "#budget-timeline-section",
      ...REVEAL_PANEL_SELECTORS,
    ]),
    { autoAlpha: 1, y: 0 },
  );
}

interface GSAPFormContainerProps {
  formData: CommissionFormData;
  errors: Record<string, string>;
  onInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  onSelectChange: (value: string, field: keyof CommissionFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  onLoadMeasurements: () => void;
  isLoadingMeasurements: boolean;
  isSubmitting: boolean;
  currentMeasurement: MeasurementKey | null;
  onMeasurementChange: (measurement: MeasurementKey | null) => void;
  onDesignChange: (design: Partial<CommissionDesign>) => void;
}

export function GSAPFormContainer({
  formData,
  errors,
  onInputChange,
  onSelectChange,
  onSubmit,
  onLoadMeasurements,
  isLoadingMeasurements,
  isSubmitting,
  currentMeasurement,
  onMeasurementChange,
  onDesignChange,
}: GSAPFormContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const isExpandedRef = useRef(false);
  const { isDesktop } = useMobile();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    // The GSAP expansion (and its scroll lock) is desktop-only; the mobile
    // stepper scrolls normally and has none of these elements. `isDesktop`
    // is only the re-run trigger — the provider defaults to desktop before
    // it has measured, so check the real viewport here.
    if (window.innerWidth < 1024) return;

    if (isExpandedRef.current) {
      applyExpandedState(container);
      return;
    }

    document.body.style.overflow = "hidden";

    // Center the request card until a garment is chosen.
    const mainCard = container.querySelector("#main-form-card");
    const commissionRequestTarget = container.querySelector(
      "#commission-request-target",
    );
    if (commissionRequestTarget && mainCard) {
      commissionRequestTarget.appendChild(mainCard);
    }

    return () => {
      timelineRef.current?.kill();
      // Restore page scroll when leaving the commissions flow.
      document.body.style.overflow = "unset";
    };
  }, [isDesktop]);

  // Handle scramble text animation when measurement changes
  useEffect(() => {
    if (!containerRef.current || !currentMeasurement) return;

    const guideItemTitle =
      containerRef.current.querySelector("#guide-item-title");
    const guideItemDescription = containerRef.current.querySelector(
      "#guide-item-description",
    );

    if (!guideItemTitle || !guideItemDescription) return;

    const guideItem = MEASUREMENT_GUIDE_ITEMS[currentMeasurement];
    if (!guideItem) return;

    // Scramble animation for title
    gsap.to(guideItemTitle, {
      duration: 0.8,
      scrambleText: {
        text: guideItem.title,
        chars: "XO!@#$%",
        revealDelay: 0.1,
        speed: 0.1,
      },
    });

    // Scramble animation for description
    gsap.to(guideItemDescription, {
      duration: 1.2,
      scrambleText: {
        text: guideItem.description,
        chars: "XO!@#$%",
        revealDelay: 0.1,
        speed: 0.1,
      },
    });
  }, [currentMeasurement]);

  // Unfold the Details & Construction section when a garment is chosen.
  // It mounts after handleExpand has already captured the Flip, so it
  // animates from its own effect: collapsed to height 0 before paint, then
  // unfurled beneath the sliders with the heading scrambling in and the
  // option chips rippling into place. Switching garments later only
  // re-ripples the chips.
  const prevGarmentRef = useRef("");
  useGSAP(
    () => {
      const container = containerRef.current;
      const garment = formData.garmentType;
      const prev = prevGarmentRef.current;
      prevGarmentRef.current = garment;
      if (!container || !garment || garment === prev || !isDesktop) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
      }

      const section = container.querySelector<HTMLElement>(
        "#details-construction-section",
      );
      if (!section) return;
      const chips = section.querySelectorAll("button");

      if (prev !== "") {
        // Garment switched after expansion — refresh the new chip set only.
        if (chips.length) {
          gsap.fromTo(
            chips,
            { autoAlpha: 0, y: 8 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.3,
              ease: "power2.out",
              stagger: 0.02,
              clearProps: "all",
            },
          );
        }
        return;
      }

      // First reveal: measure before collapsing so the unfurl can tween to
      // the section's natural height (GSAP can't tween to "auto").
      const height = section.offsetHeight;
      gsap.set(section, { height: 0, overflow: "hidden", autoAlpha: 0 });

      const tl = gsap.timeline({ delay: 0.85 });
      tl.to(section, {
        height,
        autoAlpha: 1,
        duration: 0.5,
        ease: "power2.inOut",
      }).set(section, { clearProps: "all" });
      if (chips.length) {
        tl.fromTo(
          chips,
          { autoAlpha: 0, y: 10, scale: 0.85 },
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 0.35,
            ease: "back.out(1.7)",
            stagger: 0.025,
          },
          "-=0.2",
        ).set(chips, { clearProps: "all" });
      }

      const heading = section.querySelector("h3");
      if (heading?.textContent) {
        gsap.to(heading, {
          delay: 1,
          duration: 0.8,
          scrambleText: {
            text: heading.textContent,
            chars: "XO!@#$%",
            revealDelay: 0.1,
            speed: 0.1,
          },
        });
      }
    },
    { dependencies: [formData.garmentType, isDesktop], scope: containerRef },
  );

  const handleExpand = () => {
    const container = containerRef.current;
    if (isExpandedRef.current || !container || !isDesktop) return;

    const mainCard = container.querySelector("#main-form-card");
    const commissionRequestTarget = container.querySelector(
      "#commission-request-target",
    );
    const budgetTimelineSection = container.querySelector<HTMLElement>(
      "#budget-timeline-section",
    );
    const budgetTimelineTarget = container.querySelector(
      "#budget-timeline-target",
    );
    const column1 = container.querySelector("#column-1");
    const column3 = container.querySelector("#column-3");

    if (
      !mainCard ||
      !column1 ||
      !column3 ||
      !budgetTimelineSection ||
      !budgetTimelineTarget
    ) {
      return;
    }

    isExpandedRef.current = true;

    // The expanded grid is taller than the viewport — give scroll back
    // before any animation so the page is never stuck.
    document.body.style.overflow = "unset";

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      column1.appendChild(mainCard);
      applyExpandedState(container);
      return;
    }

    const panels = queryAll(container, REVEAL_PANEL_SELECTORS);

    // Re-home the card into its column slot first, then animate from the
    // captured centered position with a single Flip. The final layout
    // exists in the DOM immediately, so even if the animation is starved
    // (low-end GPU, background tab) the page is laid out correctly and
    // the card returns to static positioning when the flip ends.
    const state = Flip.getState(mainCard);
    gsap.set([column1, column3], { autoAlpha: 1 });
    column1.appendChild(mainCard);
    budgetTimelineTarget.appendChild(budgetTimelineSection);
    commissionRequestTarget?.remove();

    // Collapse the sliders before Flip measures its end state, so the card
    // lands compact and then grows in normal flow as its contents unfold.
    const budgetHeight = budgetTimelineSection.offsetHeight;
    gsap.set(budgetTimelineSection, {
      height: 0,
      overflow: "hidden",
      autoAlpha: 0,
    });

    Flip.from(state, {
      duration: 0.65,
      ease: "power3.inOut",
      absolute: true,
      zIndex: 2000,
    });

    // A brief swell as the card travels — an echo of the old full-grid
    // expansion, kept to one self-reversing tween so it can never strand
    // the layout mid-state the way the double Flip.fit did.
    gsap.to(mainCard, {
      scale: 1.02,
      duration: 0.32,
      ease: "power1.inOut",
      yoyo: true,
      repeat: 1,
    });

    // Satellite panels swing in like glass panes hinged on the edge facing
    // the card, in a diagonal wave ordered by distance from its landing
    // column; then the card interior unfolds (sliders first — Details &
    // Construction follows from its own effect once React mounts it).
    const tl = gsap.timeline();
    tl.fromTo(
      panels,
      {
        autoAlpha: 0,
        y: 36,
        scale: 0.96,
        rotationY: -12,
        transformPerspective: 600,
        transformOrigin: "left center",
      },
      {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        rotationY: 0,
        duration: 0.7,
        ease: "power3.out",
        stagger: 0.07,
      },
      0.15,
    )
      // Leave only opacity/visibility inline — panels keep their opacity-0
      // class, but residual transforms would break hover styles and create
      // stray containing blocks.
      .set(panels, { clearProps: "transform" })
      .to(
        budgetTimelineSection,
        {
          height: budgetHeight,
          autoAlpha: 1,
          duration: 0.45,
          ease: "power2.inOut",
        },
        0.7,
      )
      .set(budgetTimelineSection, { clearProps: "height,overflow" });
    timelineRef.current = tl;
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(e);
  };

  return (
    <div className="relative">
      <UnifiedFormLayout
        ref={containerRef}
        formData={formData}
        errors={errors}
        onInputChange={onInputChange}
        onSelectChange={onSelectChange}
        onSubmit={handleFormSubmit}
        onLoadMeasurements={onLoadMeasurements}
        isLoadingMeasurements={isLoadingMeasurements}
        isSubmitting={isSubmitting}
        currentMeasurement={currentMeasurement}
        onMeasurementChange={onMeasurementChange}
        onDesignChange={onDesignChange}
        onExpand={handleExpand}
      />
    </div>
  );
}
