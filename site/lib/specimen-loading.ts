export interface ObserverEntryLike {
  isIntersecting: boolean;
}

export interface ObserverLike {
  disconnect(): void;
  observe(node: Element): void;
}

export type ObserverFactory = (
  callback: (entries: ObserverEntryLike[]) => void,
  options: IntersectionObserverInit,
) => ObserverLike;

interface SpecimenLoadingOptions {
  node: Element;
  viewportHeight: number;
  createObserver: ObserverFactory;
  onNearby(): void;
  onVisible(visible: boolean): void;
}

export function observeSpecimenLoading({
  node,
  viewportHeight,
  createObserver,
  onNearby,
  onVisible,
}: SpecimenLoadingOptions): () => void {
  const visibilityObserver = createObserver(([entry]) => onVisible(entry.isIntersecting), {
    rootMargin: "200px 0px",
  });
  const preloadObserver = createObserver(
    ([entry]) => {
      if (!entry.isIntersecting) return;
      onNearby();
      preloadObserver.disconnect();
    },
    { rootMargin: `${viewportHeight}px 0px` },
  );
  visibilityObserver.observe(node);
  preloadObserver.observe(node);
  return () => {
    visibilityObserver.disconnect();
    preloadObserver.disconnect();
  };
}
