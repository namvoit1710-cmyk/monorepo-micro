import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import ExecutionStatusBadge from "./execution-status-badge";

vi.mock("@/components/containers/language-provider", () => ({
    useLanguage: () => ({ t: (key: string) => key }),
}));

describe("ExecutionStatusBadge", () => {
    it.each([
        ["PROCESSING", "bg-yellow-100 text-yellow-700"],
        ["SUCCESS", "bg-green-100 text-green-700"],
        ["ERROR", "bg-red-100 text-red-700"],
        ["TIMEOUT", "bg-gray-100 text-gray-600"],
    ] as const)("renders %s with the expected label and classes", (status, className) => {
        render(<ExecutionStatusBadge status={status} />);

        const badge = screen.getByText(`log.status.${status}`);

        expect(badge).toHaveAttribute("title", `log.status.${status}`);
        expect(badge).toHaveClass(className);
    });
});