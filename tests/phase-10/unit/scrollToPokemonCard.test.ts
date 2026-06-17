import { describe, expect, it, vi } from "vitest";
import {
  isPokemonCardInViewport,
  scrollToPokemonCard,
} from "@/utils/scrollToPokemonCard";

function mockCard(rect: DOMRect, scrollIntoView = vi.fn()) {
  return {
    scrollIntoView,
    getBoundingClientRect: () => rect,
  };
}

describe("isPokemonCardInViewport", () => {
  it("returns false when the card is not in the document", () => {
    vi.stubGlobal("document", {
      querySelector: () => null,
    });

    expect(isPokemonCardInViewport(25)).toBe(false);
  });

  it("returns true when the card is fully visible", () => {
    vi.stubGlobal("document", {
      querySelector: () =>
        mockCard({
          top: 100,
          left: 10,
          bottom: 200,
          right: 150,
        } as DOMRect),
    });
    vi.stubGlobal("window", { innerHeight: 800, innerWidth: 1200 });

    expect(isPokemonCardInViewport(25)).toBe(true);
  });
});

describe("scrollToPokemonCard", () => {
  it("returns false when the card is not in the document", () => {
    vi.stubGlobal("document", {
      querySelector: () => null,
    });

    expect(scrollToPokemonCard(25)).toBe(false);
  });

  it("skips scrolling when the card is already in the viewport", () => {
    const scrollIntoView = vi.fn();
    vi.stubGlobal("document", {
      querySelector: (selector: string) =>
        selector === '[data-pokemon-id="25"]'
          ? mockCard(
              {
                top: 100,
                left: 10,
                bottom: 200,
                right: 150,
              } as DOMRect,
              scrollIntoView,
            )
          : null,
    });
    vi.stubGlobal("window", { innerHeight: 800, innerWidth: 1200 });

    expect(scrollToPokemonCard(25, { onlyIfNeeded: true })).toBe(false);
    expect(scrollIntoView).not.toHaveBeenCalled();
  });

  it("scrolls the matching card into view when it is outside the viewport", () => {
    const scrollIntoView = vi.fn();
    vi.stubGlobal("document", {
      querySelector: (selector: string) =>
        selector === '[data-pokemon-id="25"]'
          ? mockCard(
              {
                top: -20,
                left: 10,
                bottom: 80,
                right: 150,
              } as DOMRect,
              scrollIntoView,
            )
          : null,
    });
    vi.stubGlobal("window", { innerHeight: 800, innerWidth: 1200 });

    expect(scrollToPokemonCard(25, { behavior: "smooth", onlyIfNeeded: true })).toBe(
      true,
    );
    expect(scrollIntoView).toHaveBeenCalledWith({
      block: "nearest",
      behavior: "smooth",
    });
  });
});
