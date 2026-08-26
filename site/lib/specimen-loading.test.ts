import { describe, expect, it, vi } from "vitest";

import {
  observeSpecimenLoading,
  type ObserverEntryLike,
  type ObserverFactory,
} from "./specimen-loading";

function observerHarness() {
  const observers: Array<{
    callback: (entries: ObserverEntryLike[]) => void;
    disconnect: ReturnType<typeof vi.fn>;
    observe: ReturnType<typeof vi.fn>;
    options: IntersectionObserverInit;
  }> = [];
  const createObserver: ObserverFactory = (callback, options) => {
    const observer = { callback, disconnect: vi.fn(), observe: vi.fn(), options };
    observers.push(observer);
    return observer;
  };
  return { createObserver, observers };
}

describe("specimen loading observers", () => {
  it("preloads CSS one viewport ahead without marking the specimen visible", () => {
    const { createObserver, observers } = observerHarness();
    const onNearby = vi.fn();
    const onVisible = vi.fn();
    observeSpecimenLoading({
      node: {} as Element,
      viewportHeight: 768,
      createObserver,
      onNearby,
      onVisible,
    });

    expect(observers[0].options.rootMargin).toBe("200px 0px");
    expect(observers[1].options.rootMargin).toBe("768px 0px");
    observers[1].callback([{ isIntersecting: true }]);

    expect(onNearby).toHaveBeenCalledOnce();
    expect(onVisible).not.toHaveBeenCalled();
    expect(observers[1].disconnect).toHaveBeenCalledOnce();
  });

  it("applies the font only while the specimen is within the visibility margin", () => {
    const { createObserver, observers } = observerHarness();
    const onVisible = vi.fn();
    observeSpecimenLoading({
      node: {} as Element,
      viewportHeight: 768,
      createObserver,
      onNearby: vi.fn(),
      onVisible,
    });

    observers[0].callback([{ isIntersecting: true }]);
    observers[0].callback([{ isIntersecting: false }]);
    expect(onVisible.mock.calls).toEqual([[true], [false]]);
  });

  it("disconnects both observers on teardown", () => {
    const { createObserver, observers } = observerHarness();
    const destroy = observeSpecimenLoading({
      node: {} as Element,
      viewportHeight: 768,
      createObserver,
      onNearby: vi.fn(),
      onVisible: vi.fn(),
    });

    destroy();
    expect(observers.every((observer) => observer.disconnect.mock.calls.length === 1)).toBe(true);
  });
});
