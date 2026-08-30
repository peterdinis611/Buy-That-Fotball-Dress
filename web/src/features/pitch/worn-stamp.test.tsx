import { render, screen } from "@testing-library/react";
import { WornStamp, hasWornStamp } from "@/features/pitch/worn-stamp";
import { kane, salah } from "@/stories/fixtures";
import { describe, expect, it } from "vitest";

describe("hasWornStamp", () => {
  it("needs match, opponent and date", () => {
    expect(hasWornStamp(salah)).toBe(true);
    expect(hasWornStamp(kane)).toBe(false);
    expect(hasWornStamp({ match: "El Clasico", opponent: "Barcelona" })).toBe(false);
  });
});

describe("WornStamp", () => {
  it("stays off a shirt with no grass story", () => {
    const { container } = render(<WornStamp row={kane} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("inks Worn vs the opponent", () => {
    render(<WornStamp row={salah} />);
    expect(screen.getByLabelText("Worn vs Manchester City")).toBeInTheDocument();
    expect(screen.getByText("Worn")).toBeInTheDocument();
    expect(screen.getByText("vs Manchester City")).toBeInTheDocument();
    expect(screen.getByText("10 Mar 2024")).toBeInTheDocument();
  });

  it("compacts on a peg", () => {
    const { container } = render(<WornStamp row={salah} compact />);
    expect(container.firstElementChild).toHaveClass("worn-stamp-sm");
  });
});
