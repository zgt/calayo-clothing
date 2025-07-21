// app/commissions/page.tsx

import type { Metadata } from "next";
import CommissionsForm from "./CommissionsForm";

export const metadata: Metadata = {
  title: "Commission Request | Calayo Clothing",
  description:
    "Request a custom clothing commission from Calayo Clothing. Tell us about your dream garment.",
};

export default function CommissionsPage() {
  return (
    <div>
      <CommissionsForm />
    </div>
  );
}
