import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import PaletteSearch from "./palette-search";

vi.mock("@/components/containers/language-provider", () => ({
    useLanguage: () => ({ t: (key: string) => key }),
}));

describe("PaletteSearch", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("renders the translated placeholder", () => {
        render(<PaletteSearch onChange={() => undefined} />);

        expect(screen.getByPlaceholderText("search_node_placeholder")).toBeInTheDocument();
    });

    it("forwards search input changes through the debounced callback", () => {
        const onChange = vi.fn();

        render(<PaletteSearch onChange={onChange} />);

        fireEvent.change(screen.getByPlaceholderText("search_node_placeholder"), {
            target: { value: "email" },
        });

        expect(onChange).not.toHaveBeenCalled();

        act(() => {
            vi.advanceTimersByTime(500);
        });

        expect(onChange).toHaveBeenCalledWith("email");
    });
});