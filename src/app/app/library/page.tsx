import { LibraryPage } from "@/components/library-page";
import { Suspense } from "react";

export default function AppLibraryPage() {
  return (
    <Suspense>
      <LibraryPage />
    </Suspense>
  );
}
