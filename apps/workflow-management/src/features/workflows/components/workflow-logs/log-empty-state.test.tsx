import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import LogEmptyState from "./log-empty-state";

vi.mock("@/components/containers/language-provider", () => ({
    useLanguage: () => ({ t: (key: string) => key }),
}));

describe("LogEmptyState", () => {
    it("renders the empty logs message", () => {
        render(<LogEmptyState />);

        expect(screen.getByText("no_logs")).toBeInTheDocument();
        expect(screen.getByText("no_logs")).toHaveClass("select-none");
    });
});