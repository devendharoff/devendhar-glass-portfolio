import { Wave } from "@/components/ui/wave";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#f8f9fa] backdrop-blur-sm">
      <Wave className="w-16 h-8 text-zinc-800" />
    </div>
  );
}
