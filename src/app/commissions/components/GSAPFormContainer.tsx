"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { Flip } from "gsap/Flip";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { UnifiedFormLayout } from "./UnifiedFormLayout";
import { useMobile } from "~/context/mobile-provider";
import type { CommissionFormData, MeasurementKey } from "../types";
import type { CommissionDesign } from "~/lib/commission-design";
import { MEASUREMENT_GUIDE_ITEMS } from "../measurementGuideData";

// Register GSAP plugins
gsap.registerPlugin(Flip, ScrambleTextPlugin);

// Panels revealed by the expansion, in cascade order: the center column rises
// first (nearest the request card's landing spot), then the right column.
const CENTER_CARD_SELECTORS = [
  "#budget-timeline-section",
  "#garment-preview-card",
  "#design-card",
];
const RIGHT_CARD_SELECTORS = [
  "#measurement-guide-card",
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
    [
      ...queryAll(container, CENTER_CARD_SELECTORS),
      ...queryAll(container, RIGHT_CARD_SELECTORS),
    ],
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

  const handleExpand = () => {
    const container = containerRef.current;
    if (isExpandedRef.current || !container || !isDesktop) return;

    const mainCard = container.querySelector("#main-form-card");
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

    const centerCards = queryAll(container, CENTER_CARD_SELECTORS);
    const rightCards = queryAll(container, RIGHT_CARD_SELECTORS);

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

    Flip.from(state, {
      duration: 0.6,
      ease: "power1.inOut",
      absolute: true,
      zIndex: 2000,
    });

    // A brief swell as the card travels — an echo of the old full-grid
    // expansion, kept to one self-reversing tween so it can never strand
    // the layout mid-state the way the double Flip.fit did.
    gsap.to(mainCard, {
      scale: 1.02,
      duration: 0.3,
      ease: "power1.inOut",
      yoyo: true,
      repeat: 1,
    });

    // Cascade the remaining panels up into place, radiating outward from
    // the card's landing column while the flip is still settling.
    const tl = gsap.timeline({ delay: 0.25 });
    tl.fromTo(
      centerCards,
      { autoAlpha: 0, y: 24 },
      { autoAlpha: 1, y: 0, duration: 0.5, ease: "power2.out", stagger: 0.08 },
    ).fromTo(
      rightCards,
      { autoAlpha: 0, y: 24 },
      { autoAlpha: 1, y: 0, duration: 0.5, ease: "power2.out", stagger: 0.08 },
      "-=0.35",
    );
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
