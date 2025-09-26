import { Loader2 } from "lucide-react";

const SuspenseFallback = () => {
  return (
    <div className="flex h-[70vh] flex-col items-center justify-center gap-6 text-gray-700">
      <Loader2 className="h-12 w-12 animate-spin text-blue-600" />

      <div className="space-y-1 text-center">
        <p className="animate-pulse text-lg font-semibold">
          Loading content...
        </p>
        <p className="text-sm text-gray-500">
          Please wait a moment while we prepare everything for you
        </p>
      </div>

      <div className="mt-6 w-full max-w-md space-y-3">
        <div className="h-5 w-3/4 animate-pulse rounded-md bg-gray-200"></div>
        <div className="h-4 w-full animate-pulse rounded-md bg-gray-200"></div>
        <div className="h-4 w-5/6 animate-pulse rounded-md bg-gray-200"></div>
        <div className="h-4 w-2/3 animate-pulse rounded-md bg-gray-200"></div>
      </div>
    </div>
  );
};

export default SuspenseFallback;
