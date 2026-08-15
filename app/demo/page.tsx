"use client";

import dynamic from "next/dynamic";

const IconCloudDemo = dynamic(() => import("@/components/ui/demo"), { ssr: false });

export default function Page() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-[#080510] text-white p-6">
      <h1 className="text-3xl font-light tracking-tight mb-8">Interactive Icon Cloud Demo</h1>
      <IconCloudDemo />
    </div>
  );
}
