import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import LoadingOverlay from "./loading-overlay";

describe("LoadingOverlay", () => {
    it("shows the overlay when loading", () => {
        const { container } = render(<LoadingOverlay isLoading />);

        expect(container.firstChild).toHaveClass("scale-100", "opacity-100");
    });

    it("hides the overlay when not loading", () => {
        const { container } = render(<LoadingOverlay isLoading={false} />);

        expect(container.firstChild).toHaveClass("scale-0", "opacity-0");
    });
});