import { Loader } from "@/components/loader";

export default function Loading() {
  return (
    <Loader className="absolute inset-0 rounded-md bg-background text-muted-foreground text-sm">
      Loading
    </Loader>
  );
}
