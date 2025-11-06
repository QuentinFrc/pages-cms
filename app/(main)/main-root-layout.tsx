import { About } from "@/components/about";
import { User } from "@/components/user";

export function MainRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen flex-col">
      <main className="w-full flex-1 overflow-auto">{children}</main>
      <footer className="mt-auto flex items-center gap-2 border-t px-2 py-2 lg:px-4 lg:py-3">
        <User className="mr-auto" />
        <About />
      </footer>
    </div>
  );
}
