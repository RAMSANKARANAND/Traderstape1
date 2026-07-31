"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export function CancelButton() {
  const router = useRouter();

  return (
    <Button type="button" variant="secondary" onClick={() => router.push("/admin/levels")}>
      Cancel
    </Button>
  );
}