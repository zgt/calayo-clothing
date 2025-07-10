'use client';

import { Tab } from "@headlessui/react";

type TabProps = {
  selected: boolean;
};

function MeasurementGuideItem({ title, description }: { title: string; description: string }) {
  return (
    <div className="border-b border-emerald-700/30 pb-3">
      <h3 className="text-sm font-medium text-emerald-200">{title}</h3>
      <p className="mt-1 text-sm text-emerald-200/70">{description}</p>
    </div>
  );
}

export default function MeasurementGuide() {
  return (
    <div className="rounded-lg bg-gradient-to-br from-emerald-900/30 to-emerald-950/80 backdrop-blur-sm p-6 shadow-2xl border border-emerald-700/20">
      <h2 className="mb-4 text-xl font-semibold text-white">Measurement Guide</h2>
      
      <Tab.Group>
        <Tab.List className="flex space-x-1 rounded-xl bg-emerald-900/50 p-1">
          <Tab className={({ selected }: TabProps) =>
            `w-full rounded-lg py-2.5 text-sm font-medium leading-5
            ${selected 
              ? 'bg-emerald-800 text-white shadow'
              : 'text-emerald-100 hover:bg-emerald-800/50 hover:text-white'
            }`
          }>
            Basic
          </Tab>
          <Tab className={({ selected }: TabProps) =>
            `w-full rounded-lg py-2.5 text-sm font-medium leading-5
            ${selected 
              ? 'bg-emerald-800 text-white shadow'
              : 'text-emerald-100 hover:bg-emerald-800/50 hover:text-white'
            }`
          }>
            Upper Body
          </Tab>
          <Tab className={({ selected }: TabProps) =>
            `w-full rounded-lg py-2.5 text-sm font-medium leading-5
            ${selected 
              ? 'bg-emerald-800 text-white shadow'
              : 'text-emerald-100 hover:bg-emerald-800/50 hover:text-white'
            }`
          }>
            Lower Body
          </Tab>
          <Tab className={({ selected }: TabProps) =>
            `w-full rounded-lg py-2.5 text-sm font-medium leading-5
            ${selected 
              ? 'bg-emerald-800 text-white shadow'
              : 'text-emerald-100 hover:bg-emerald-800/50 hover:text-white'
            }`
          }>
            Full Body
          </Tab>
          <Tab className={({ selected }: TabProps) =>
            `w-full rounded-lg py-2.5 text-sm font-medium leading-5
            ${selected 
              ? 'bg-emerald-800 text-white shadow'
              : 'text-emerald-100 hover:bg-emerald-800/50 hover:text-white'
            }`
          }>
            Formal
          </Tab>
          <Tab className={({ selected }: TabProps) =>
            `w-full rounded-lg py-2.5 text-sm font-medium leading-5
            ${selected 
              ? 'bg-emerald-800 text-white shadow'
              : 'text-emerald-100 hover:bg-emerald-800/50 hover:text-white'
            }`
          }>
            Preferences
          </Tab>
        </Tab.List>
        <Tab.Panels className="mt-4">
          <Tab.Panel className="rounded-xl bg-emerald-900/30 p-3">
            <div className="space-y-4">
              <MeasurementGuideItem 
                title="Chest" 
                description="Measure around the fullest part of your chest, keeping the tape measure parallel to the floor."
              />
              <MeasurementGuideItem 
                title="Waist" 
                description="Measure around your natural waistline, which is the narrowest part of your torso."
              />
              <MeasurementGuideItem 
                title="Hips" 
                description="Measure around the fullest part of your hips and buttocks."
              />
              <MeasurementGuideItem 
                title="Shoulders" 
                description="Measure across your back from the edge of one shoulder to the edge of the other shoulder."
              />
              <MeasurementGuideItem 
                title="Length" 
                description="For tops, measure from the highest point of your shoulder to the desired length down your torso. For jackets/coats, measure from the base of your collar to the desired length."
              />
              <MeasurementGuideItem 
                title="Inseam" 
                description="Measure from the crotch to the bottom of the ankle along the inside of your leg."
              />
            </div>
          </Tab.Panel>

          <Tab.Panel className="rounded-xl bg-emerald-900/30 p-3">
            <div className="space-y-4">
              <MeasurementGuideItem 
                title="Neck" 
                description="Measure around the base of your neck, where a collar would sit."
              />
              <MeasurementGuideItem 
                title="Sleeve Length" 
                description="Measure from the edge of your shoulder to your wrist with your arm slightly bent."
              />
              <MeasurementGuideItem 
                title="Bicep" 
                description="Measure around the fullest part of your bicep with your arm relaxed at your side."
              />
              <MeasurementGuideItem 
                title="Forearm" 
                description="Measure around the widest part of your forearm with your arm relaxed."
              />
              <MeasurementGuideItem 
                title="Wrist" 
                description="Measure around your wrist bone."
              />
              <MeasurementGuideItem 
                title="Armhole Depth" 
                description="Measure from the top of your shoulder down to where the armhole should end under your arm."
              />
              <MeasurementGuideItem 
                title="Back Width" 
                description="Measure across your back from armhole to armhole at the widest point of your shoulder blades."
              />
              <MeasurementGuideItem 
                title="Front Chest Width" 
                description="Measure across the front of your chest from armhole to armhole at the fullest part."
              />
            </div>
          </Tab.Panel>

          <Tab.Panel className="rounded-xl bg-emerald-900/30 p-3">
            <div className="space-y-4">
              <MeasurementGuideItem 
                title="Thigh" 
                description="Measure around the fullest part of your thigh."
              />
              <MeasurementGuideItem 
                title="Knee" 
                description="Measure around your knee at its widest point while standing."
              />
              <MeasurementGuideItem 
                title="Calf" 
                description="Measure around the widest part of your calf muscle."
              />
              <MeasurementGuideItem 
                title="Ankle" 
                description="Measure around your ankle bone."
              />
              <MeasurementGuideItem 
                title="Rise" 
                description="Measure from the crotch seam to the top of the waistband while seated."
              />
              <MeasurementGuideItem 
                title="Outseam" 
                description="Measure from the top of the waistband to the desired length along the outside of the leg."
              />
            </div>
          </Tab.Panel>

          <Tab.Panel className="rounded-xl bg-emerald-900/30 p-3">
            <div className="space-y-4">
              <MeasurementGuideItem 
                title="Height" 
                description="Stand against a wall without shoes and measure from the floor to the top of your head."
              />
              <MeasurementGuideItem 
                title="Weight" 
                description="Your current weight in pounds, measured on a standard scale."
              />
            </div>
          </Tab.Panel>

          <Tab.Panel className="rounded-xl bg-emerald-900/30 p-3">
            <div className="space-y-4">
              <MeasurementGuideItem 
                title="Torso Length" 
                description="Measure from the base of your neck at the center back to your natural waistline."
              />
              <MeasurementGuideItem 
                title="Shoulder Slope" 
                description="Measure the angle of your shoulder slope using a tailor's square or angle measuring tool."
              />
              <MeasurementGuideItem 
                title="Posture" 
                description="Describe your posture as 'Average', 'Erect', 'Stooped', or 'Forward Head'. For formal wear, this helps tailor the garment to your natural stance."
              />
            </div>
          </Tab.Panel>

          <Tab.Panel className="rounded-xl bg-emerald-900/30 p-3">
            <div className="space-y-4">
              <MeasurementGuideItem 
                title="Size Preference" 
                description="Your typical size category (XS, S, M, L, XL, XXL). This helps us understand how you generally prefer garments to fit."
              />
              <MeasurementGuideItem 
                title="Fit Preference" 
                description="Choose between Slim, Regular, Relaxed, or Oversized fit. This indicates your preferred style of garment fit beyond exact measurements."
              />
            </div>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>

      <div className="mt-6 rounded-md bg-emerald-900/50 p-4 border border-emerald-700/30">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-emerald-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-emerald-200">Measurement tips:</h3>
            <div className="mt-2 text-sm text-emerald-200/70">
              <ul className="list-disc space-y-1 pl-5">
                <li>Use a fabric measuring tape for accuracy</li>
                <li>Wear light, fitted clothing when measuring</li>
                <li>Stand naturally with feet shoulder-width apart</li>
                <li>Keep the measuring tape snug but not tight</li>
                <li>For best results, have someone help you measure</li>
                <li>Take multiple measurements for crucial areas to ensure accuracy</li>
                <li>Always measure in a consistent state (e.g., after exhaling)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 