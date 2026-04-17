import { ALL_DOCS } from "@/data/nav";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export function useDocNavigation() {
  const { slug } = useParams<{ slug?: string }>();
  const navigate = useNavigate();
  const [activeSlug, setActiveSlug] = useState(
    slug ?? ALL_DOCS[0]?.slug ?? "introduction"
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (slug && slug !== activeSlug) {
      setActiveSlug(slug);
    }
  }, [slug, activeSlug]);

  function handleSelect(newSlug: string) {
    setActiveSlug(newSlug);
    setSidebarOpen(false);
    void navigate(`/docs/${newSlug}`);
    document.getElementById("doc-scroll")?.scrollTo({ top: 0, behavior: "smooth" });
  }

  return {
    activeSlug,
    sidebarOpen,
    setSidebarOpen,
    handleSelect,
  };
}
