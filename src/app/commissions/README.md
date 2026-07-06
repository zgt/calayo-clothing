# Commission Form Components

This directory contains the refactored commission form system, broken down into smaller, reusable components.

## 📁 Structure

```
commissions/
├── components/           # Reusable UI components
│   ├── FormSelect.tsx           # Generic select input
│   ├── FormTextarea.tsx         # Generic textarea input  
│   ├── MeasurementInput.tsx     # Specialized measurement input
│   ├── MeasurementSection.tsx   # Group of measurements
│   ├── MeasurementsForm.tsx     # Complete measurements form
│   ├── LoadMeasurementsButton.tsx # Load from profile button
│   ├── SubmitButton.tsx         # Form submit button
│   ├── MeasurementNavigator.tsx # One-at-a-time measurement carousel
│   ├── MeasurementGuideDisplay.tsx # How-to-measure guidance panel
│   ├── DesignPanel.tsx          # Color / fabric / style option pickers
│   ├── UnifiedFormLayout.tsx    # Desktop 3-column + mobile tabs layout
│   ├── GSAPFormContainer.tsx    # Flip/ScrambleText animation shell
│   └── index.ts                 # Component exports
├── hooks/               # Custom React hooks
│   └── useMeasurementLoader.ts  # Hook for loading user measurements
├── types.ts            # TypeScript type definitions
├── constants.ts        # Static data and configuration
├── utils.ts           # Utility functions
├── CommissionsForm.tsx # Main form component (refactored)
└── README.md          # This file
```

## 🧩 Components

### **Form Components**
- **`FormSelect`**: Reusable select dropdown with error handling
- **`FormTextarea`**: Reusable textarea with validation styling
- **`MeasurementInput`**: Specialized input for numeric measurements and text

### **Measurement Components**
- **`MeasurementSection`**: Groups related measurements (upper/lower/general body)
- **`MeasurementsForm`**: Complete measurements interface with conditional rendering
- **`LoadMeasurementsButton`**: Button to load saved measurements from profile

### **Design Components**
- **`DesignPanel`**: Composes the color swatch picker (curated palette plus
  free hex picker), fabric preset chips, and per-garment style option pills.
  Selections live-update the 3D garment via `GarmentViewer`'s
  `colorHex`/`fabric` props and are persisted on the commission.
- The shared design domain (palette, fabric presets, style option tree,
  measurement plausibility bounds) lives in `src/lib/commission-design.ts`
  and is imported by both this form and the tRPC router so client and
  server validation cannot drift.

### **Other Components**
- **`SubmitButton`**: Form submission button with loading states

## 🎣 Custom Hooks

### **`useMeasurementLoader`**
Custom hook that handles:
- Loading measurements from user profile
- Error handling and user feedback
- Loading states
- Authentication checks

## 🔧 Utilities

### **`utils.ts`**
- `shouldShowMeasurement()`: Conditional rendering logic
- `isMeasurementRequired()`: Validation logic
- `validateCommissionForm()`: Complete form validation (required fields,
  measurement plausibility bounds, design option tree)
- `handleNumberInput()`: Input event handling

### **`constants.ts`**
- `REQUIRED_MEASUREMENTS`: Validation rules by garment type
- `MEASUREMENT_GROUPS`: UI organization of measurement fields
- `getEmptyMeasurements()`: Default measurement values

## 📝 Types

### **`types.ts`**
- `CommissionFormData`: Main form interface
- `UserMeasurements`: Profile measurements interface
- `MeasurementKey`: Type-safe measurement field keys
- `MeasurementField`: UI field configuration

## ✨ Benefits of Refactoring

### **Before (695 lines)**
- Single massive component
- Duplicated logic
- Hard to test individual pieces
- Difficult to maintain

### **After (8 focused files)**
- ✅ **Reusable Components**: Each component has single responsibility
- ✅ **Type Safety**: Comprehensive TypeScript interfaces
- ✅ **Testability**: Small, focused units easy to test
- ✅ **Maintainability**: Changes isolated to specific components
- ✅ **Custom Hooks**: Reusable stateful logic
- ✅ **Performance**: Better tree-shaking and code splitting potential

## 🚀 Usage

The main `CommissionsForm` component now orchestrates smaller components:

```tsx
import { FormSelect, MeasurementsForm, SubmitButton } from "./components";
import { useMeasurementLoader } from "./hooks/useMeasurementLoader";
import { validateCommissionForm } from "./utils";

export default function CommissionsForm() {
  // Clean, focused component logic
  // Uses reusable components and hooks
}
```

## 🔄 Migration Notes

- Original 695-line component preserved functionality
- All existing props and behavior maintained
- tRPC integration preserved
- Form validation logic extracted but unchanged
- Measurement loading logic moved to custom hook
- UI components now reusable across the application