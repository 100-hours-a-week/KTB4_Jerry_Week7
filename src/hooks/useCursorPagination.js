import { useState, useRef, useCallback } from "react";

export default function useCursorPagination({
  fetchPage,
  initialItems = [],
  initialCursor,
  getKey = (item) => item.id,
}) {
  const [items, setItems] = useState(initialItems);
  const [cursor, setCursor] = useState(initialCursor);
  const [isLoading, setIsLoading] = useState(false);
  const loadingRef = useRef(false);
  const fetchPageRef = useRef(fetchPage);
  const getKeyRef = useRef(getKey);

  fetchPageRef.current = fetchPage;
  getKeyRef.current = getKey;

  const loadMore = useCallback(async () => {
    if (loadingRef.current || cursor === null) return;
    loadingRef.current = true;
    setIsLoading(true);

    try {
      const { items: newItems, next_cursor } = await fetchPageRef.current(cursor);

      setItems((prev) => {
        const seen = new Set(prev.map(getKeyRef.current));
        const unique = newItems.filter((item) => !seen.has(getKeyRef.current(item)));
        return [...prev, ...unique];
      });
      setCursor(next_cursor ?? null);
    } finally {
      loadingRef.current = false;
      setIsLoading(false);
    }
  }, [cursor]);

  const hasMore = cursor !== null;

  return { items, setItems, hasMore, isLoading, loadMore };
}
