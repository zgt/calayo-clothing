"use client";

import { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { Flip } from "gsap/Flip";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { UnifiedFormLayout } from "./UnifiedFormLayout";
import type { CommissionFormData, MeasurementKey } from "../types";
import type { CommissionDesign } from "~/lib/commission-design";
import { MEASUREMENT_GUIDE_ITEMS } from "../measurementGuideData";

// Register GSAP plugins
gsap.registerPlugin(Flip, ScrambleTextPlugin, ScrollToPlugin);

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
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    document.body.style.overflow = "hidden";

    // Set initial states for hidden elements
    const mainCard = containerRef.current.querySelector("#main-form-card");
    const commissionRequestTarget = containerRef.current.querySelector(
      "#commission-request-target",
    );
    const additionalDetailsCard = containerRef.current.querySelector(
      "#additional-details-card",
    );
    const garmentPreviewCard = containerRef.current.querySelector(
      "#garment-preview-card",
    );
    const designCard = containerRef.current.querySelector("#design-card");
    const styleOptionsCard = containerRef.current.querySelector(
      "#style-options-card",
    );
    const measurementGuideCard = containerRef.current.querySelector(
      "#measurement-guide-card",
    );
    const measurementNavigatorCard = containerRef.current.querySelector(
      "#measurement-navigator-card",
    );
    const submitButtonContainer = containerRef.current.querySelector(
      "#submit-button-container",
    );

    if (commissionRequestTarget && mainCard) {
      commissionRequestTarget.appendChild(mainCard);
    }
    gsap.set([additionalDetailsCard, garmentPreviewCard, designCard], {
      x: -500,
    });
    gsap.set(
      [
        measurementGuideCard,
        measurementNavigatorCard,
        styleOptionsCard,
        submitButtonContainer,
      ],
      {
        x: -1000,
      },
    );

    // Capture timeline ref for cleanup
    const currentTimeline = timelineRef.current;

    // Cleanup function
    return () => {
      if (currentTimeline) {
        currentTimeline.kill();
      }
      // Restore page scroll when leaving the commissions flow.
      document.body.style.overflow = "unset";
    };
  }, []);

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current || !timelineRef.current) return;

      const mainCard = containerRef.current.querySelector("#main-form-card");
      if (!mainCard) return;

      if (isExpanded) {
        // Adjust positioning for different screen sizes
        gsap.set(mainCard, {
          x: 0,
          y: 0,
          scale: 1,
        });
      } else {
        // Reset to centered position
        gsap.set(mainCard, {
          x: 0,
          y: 0,
          scale: 1,
        });
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isExpanded]);

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
      // text: guideItem.title,
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

  const handleMobileGarmentSelect = () => {
    if (!containerRef.current) return;

    gsap.to(window, {
      duration: 0.5,
      scrollTo: { y: "#measurements", offsetY: -200 },
    });
    document.body.style.overflow = "unset";
  };

  const handleExpand = () => {
    if (isExpanded || !containerRef.current || isMobile) return; // Skip GSAP animations on mobile

    setIsExpanded(true);

    // Get all the elements we need to animate
    const mainCard = containerRef.current.querySelector("#main-form-card");
    const commissionRequestTarget = containerRef.current.querySelector(
      "#commission-request-target",
    );
    const additionalDetailsCard = containerRef.current.querySelector(
      "#additional-details-card",
    );
    const garmentPreviewCard = containerRef.current.querySelector(
      "#garment-preview-card",
    );
    const designCard = containerRef.current.querySelector("#design-card");
    const styleOptionsCard = containerRef.current.querySelector(
      "#style-options-card",
    );
    const measurementGuideCard = containerRef.current.querySelector(
      "#measurement-guide-card",
    );
    const measurementNavigatorCard = containerRef.current.querySelector(
      "#measurement-navigator-card",
    );
    const submitButtonContainer = containerRef.current.querySelector(
      "#submit-button-container",
    );
    const budgetTimelineSection = containerRef.current.querySelector(
      "#budget-timeline-section",
    );
    const column1 = containerRef.current.querySelector("#column-1");
    const column3 = containerRef.current.querySelector("#column-3");
    const budgetTimelineTarget = containerRef.current.querySelector(
      "#budget-timeline-target",
    );

    if (
      mainCard &&
      column1 &&
      column3 &&
      budgetTimelineSection &&
      budgetTimelineTarget
    ) {
      // The expanded grid is taller than the viewport — give scroll back
      // before any animation so the page is never stuck.
      document.body.style.overflow = "unset";

      // Re-home the card into its column slot first, then animate from the
      // captured centered position with a single Flip. The final layout
      // exists in the DOM immediately, so even if the animation is starved
      // (low-end GPU, background tab) the page is laid out correctly and
      // the card returns to static positioning when the flip ends.
      const state = Flip.getState(mainCard);
      gsap.set([column1, column3], { opacity: 1 });
      column1.appendChild(mainCard);
      budgetTimelineTarget.appendChild(budgetTimelineSection);
      gsap.set(budgetTimelineSection, { opacity: 1 });
      commissionRequestTarget?.remove();

      Flip.from(state, {
        duration: 0.6,
        ease: "power1.inOut",
        absolute: true,
        zIndex: 2000,
      });

      // Animate other elements in sequence
      const tl = gsap.timeline({ delay: 0.3 });

      // Additional details card
      tl.to(additionalDetailsCard, {
        opacity: 1,
        x: 0,
        scale: 1,
        duration: 0.5,
        ease: "power2.out",
      })
        // Garment preview card
        .to(
          garmentPreviewCard,
          {
            opacity: 1,
            x: 0,
            scale: 1,
            duration: 0.5,
            ease: "power2.out",
          },
          "",
        )
        // Design card (color/fabric)
        .to(
          designCard,
          {
            opacity: 1,
            x: 0,
            scale: 1,
            duration: 0.5,
            ease: "power2.out",
          },
          "",
        )
        // Right column elements
        .to(
          measurementGuideCard,
          {
            opacity: 1,
            x: 0,
            scale: 1,
            duration: 0.5,
            ease: "power2.out",
          },
          "",
        )
        .to(
          measurementNavigatorCard,
          {
            opacity: 1,
            x: 0,
            scale: 1,
            duration: 0.5,
            ease: "power2.out",
          },
          "",
        )
        // Construction details card (right column)
        .to(
          styleOptionsCard,
          {
            opacity: 1,
            x: 0,
            scale: 1,
            duration: 0.5,
            ease: "power2.out",
          },
          "",
        )
        .to(
          submitButtonContainer,
          {
            opacity: 1,
            x: 0,
            scale: 1,
            duration: 0.5,
            ease: "power2.out",
          },
          "",
        );
    }
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
        onMobileGarmentSelect={handleMobileGarmentSelect}
      />
    </div>
  );
}
