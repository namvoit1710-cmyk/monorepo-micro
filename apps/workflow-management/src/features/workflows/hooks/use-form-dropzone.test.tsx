/* @vitest-environment jsdom */
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import useFormDropZone from "./use-form-dropzone";

const Harness = () => {
  const ref = useFormDropZone();

  return (
    <div ref={ref} data-testid="drop-zone">
      <input data-testid="drop-input" defaultValue="" />
      <div data-testid="non-input">non-input</div>
    </div>
  );
};

describe("useFormDropZone", () => {
  it("highlights droppable inputs on drag over and clears on drag leave", () => {
    render(<Harness />);

    const input = screen.getByTestId("drop-input");

    fireEvent.dragOver(input, {
      dataTransfer: {
        types: ["text/plain"],
        dropEffect: "none",
      },
    });

    expect((input as HTMLInputElement).style.border).toBe("2px solid rgb(59, 130, 246)");

    fireEvent.dragLeave(input, {
      relatedTarget: document.body,
      dataTransfer: {
        types: ["text/plain"],
      },
    });

    expect((input as HTMLInputElement).style.border).toBe("");
  });

  it("appends dropped text into input and ignores non droppable targets", () => {
    render(<Harness />);

    const input = screen.getByTestId("drop-input") as HTMLInputElement;
    const nonInput = screen.getByTestId("non-input");

    fireEvent.drop(input, {
      dataTransfer: {
        getData: () => "{{workflow.value}}",
      },
    });

    expect(input.value).toBe("{{workflow.value}}");

    fireEvent.drop(nonInput, {
      dataTransfer: {
        getData: () => "ignored",
      },
    });

    expect(input.value).toBe("{{workflow.value}}");
  });

  it("does not react to drag over without plain text payload", () => {
    render(<Harness />);

    const input = screen.getByTestId("drop-input");

    fireEvent.dragOver(input, {
      dataTransfer: {
        types: ["application/json"],
        dropEffect: "none",
      },
    });

    expect((input as HTMLInputElement).style.border).toBe("");
  });
});