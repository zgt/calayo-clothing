"use client";

import { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { Flip } from "gsap/Flip";
import { UnifiedFormLayout } from "./UnifiedFormLayout";
import type { CommissionFormData, MeasurementKey } from "../types";

// Register GSAP plugins
gsap.registerPlugin(Flip);

interface GSAPFormContainerProps {
  formData: CommissionFormData;
  errors: Record<string, string>;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSelectChange: (value: string, field: keyof CommissionFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  onLoadMeasurements: () => void;
  isLoadingMeasurements: boolean;
  isSubmitting: boolean;
  currentMeasurement: MeasurementKey | null;
  onMeasurementChange: (measurement: MeasurementKey | null) => void;
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
}: GSAPFormContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    // Set initial states for hidden elements
    const expandedGrid = containerRef.current.querySelector("#expanded-grid");
    const commissionRequestTarget = containerRef.current.querySelector("#commission-request-target");
    const additionalDetailsCard = containerRef.current.querySelector("#additional-details-card");
    const garmentPreviewCard = containerRef.current.querySelector("#garment-preview-card");
    const measurementGuideCard = containerRef.current.querySelector("#measurement-guide-card");
    const measurementNavigatorCard = containerRef.current.querySelector("#measurement-navigator-card");
    const submitButtonContainer = containerRef.current.querySelector("#submit-button-container");
    const budgetTimelineSection = containerRef.current.querySelector("#budget-timeline-section");

    // Set initial states
    gsap.set([
      expandedGrid,
      commissionRequestTarget,
      additionalDetailsCard,
      garmentPreviewCard,
      measurementGuideCard,
      measurementNavigatorCard,
      submitButtonContainer,
      budgetTimelineSection
    ], {
      opacity: 0
    });

    // Set transform for cards that will slide in
    gsap.set([additionalDetailsCard, garmentPreviewCard, measurementGuideCard, measurementNavigatorCard, submitButtonContainer], {
      y: 30,
      scale: 0.9
    });

    // Cleanup function
    return () => {
      if (timelineRef.current) {
        timelineRef.current.kill();
      }
    };
  }, []);

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current || !timelineRef.current) return;

      const mainCard = containerRef.current.querySelector("#main-form-card");
      if (!mainCard) return;

      const isMobile = window.innerWidth < 1024;
      
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

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isExpanded]);

  const handleExpand = () => {
    if (isExpanded || !containerRef.current) return;

    setIsExpanded(true);

    // Get all the elements we need to animate
    const mainCard = containerRef.current.querySelector("#main-form-card");
    const commissionRequestTarget = containerRef.current.querySelector("#commission-request-target");
    const expandedGrid = containerRef.current.querySelector("#expanded-grid");
    const initialPosition = containerRef.current.querySelector("#initial-position");
    const additionalDetailsCard = containerRef.current.querySelector("#additional-details-card");
    const garmentPreviewCard = containerRef.current.querySelector("#garment-preview-card");
    const measurementGuideCard = containerRef.current.querySelector("#measurement-guide-card");
    const measurementNavigatorCard = containerRef.current.querySelector("#measurement-navigator-card");
    const submitButtonContainer = containerRef.current.querySelector("#submit-button-container");
    const budgetTimelineSection = containerRef.current.querySelector("#budget-timeline-section");

    // Capture the initial state for Flip
    const flipState = Flip.getState(mainCard);

    // Move the card to the target position and make target visible
    if (commissionRequestTarget && mainCard && expandedGrid && initialPosition) {
      // Hide the initial position container
      gsap.set(initialPosition, { display: "none" });
      
      // Show the expanded grid and target
      gsap.set(expandedGrid, { opacity: 1, display: "grid" });
      gsap.set(commissionRequestTarget, { opacity: 1 });
      
      // Move the card to the target position in DOM
      commissionRequestTarget.appendChild(mainCard);

      // Animate the flip
      Flip.from(flipState, {
        duration: 0.8,
        ease: "power2.out",
        absolute: true,
        onStart: () => {
          // Update styling during flip
          const cardHeader = mainCard?.querySelector("#card-header");
          const cardSubtitle = mainCard?.querySelector("#card-subtitle");
          const cardContent = mainCard?.querySelector(".bg-gradient-to-br");
          
          // if (cardHeader) {
          //   gsap.to(cardHeader, {
          //     textAlign: "left",
          //     marginBottom: "1rem",
          //     duration: 0.4,
          //     ease: "power2.out"
          //   });
          // }
          
          // if (cardSubtitle) {
          //   gsap.to(cardSubtitle, {
          //     opacity: 0,
          //     height: 0,
          //     marginBottom: 0,
          //     duration: 0.3,
          //     ease: "power2.out"
          //   });
          // }
          
          // if (cardContent) {
          //   gsap.to(cardContent, {
          //     padding: "1.5rem",
          //     duration: 0.4,
          //     ease: "power2.out"
          //   });
          // }
          
          // // Update heading size
          // const heading = cardHeader?.querySelector("h2");
          // if (heading) {
          //   gsap.to(heading, {
          //     fontSize: "1.25rem",
          //     lineHeight: "1.75rem",
          //     duration: 0.4,
          //     ease: "power2.out"
          //   });
          // }
        },
        onComplete: () => {
          // Show budget/timeline section after flip
          gsap.to(budgetTimelineSection, {
            opacity: 1,
            duration: 0.5,
            ease: "power2.out"
          });
        }
      });

      // Animate other elements in sequence
      const tl = gsap.timeline({ delay: 0.3 });
      
      // Additional details card
      tl.to(additionalDetailsCard, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.6,
        ease: "power2.out"
      })
      // Garment preview card
      .to(garmentPreviewCard, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.6,
        ease: "power2.out"
      }, "")
      // Right column elements
      .to(measurementGuideCard, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.5,
        ease: "power2.out"
      }, "")
      .to(measurementNavigatorCard, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.5,
        ease: "power2.out"
      }, "")
      .to(submitButtonContainer, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.5,
        ease: "power2.out"
      }, "");
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
        onExpand={handleExpand}
      />
    </div>
  );
}