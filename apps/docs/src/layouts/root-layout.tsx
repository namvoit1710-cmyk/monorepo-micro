import { DocContent } from "@/components/doc-content";
import { DocSidebar } from "@/components/doc-sidebar";
import { useDocNavigation } from "@/hooks/use-doc-navigation";
import { Button } from "@ldc/ui/components/button";
import { Separator } from "@ldc/ui/components/separator";
import { Menu, X } from "lucide-react";

export default function DocsLayout() {
  const { activeSlug, sidebarOpen, setSidebarOpen, handleSelect } = useDocNavigation();

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen ? (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}

      {/* Sidebar — fixed on mobile, static on desktop */}
      <div
        className={[
          "fixed lg:static inset-y-0 left-0 z-40 lg:z-auto",
          "transition-transform duration-200 ease-in-out",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        ].join(" ")}
      >
        <DocSidebar activeSlug={activeSlug} onSelect={handleSelect} />
      </div>

      {/* Right side — topbar + scrollable content */}
      <div
        id="doc-scroll"
        className="flex flex-1 w-full flex-col overflow-y-auto min-w-0"
      >
        {/* Mobile topbar */}
        <header className="flex lg:hidden items-center gap-3 px-4 py-2.5 border-b border-border bg-background sticky top-0 z-20">
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={() => setSidebarOpen((v) => !v)}
          >
            {sidebarOpen ? <X size={17} /> : <Menu size={17} />}
          </Button>
          <Separator orientation="vertical" className="h-4" />
          <span className="text-sm font-medium text-muted-foreground">
            LDC Docs
          </span>
        </header>

        {/* Page content */}
        <DocContent slug={activeSlug} onNavigate={handleSelect} />
      </div>
    </div>
  );
}