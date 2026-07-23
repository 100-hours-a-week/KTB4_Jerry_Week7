import { useEffect, useRef } from "react";

export default function useInfiniteScroll({ onLoadMore, hasMore, isLoading }) {
  const sentinelRef = useRef(null);
  const callbackRef = useRef(onLoadMore);

  useEffect(() => {
    callbackRef.current = onLoadMore;
  }, [onLoadMore]);

  useEffect(() => {
    if (!hasMore || isLoading) return;

    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        callbackRef.current();
      }
    });

    observer.observe(el);

    return () => observer.disconnect();
  }, [hasMore, isLoading]);

  return sentinelRef;
}
