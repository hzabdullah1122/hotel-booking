"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "./api";

// const { data, error, loading, reload } = useApi("/api/hotels?city=Lahore")
// pass null as the path to skip fetching
export function useApi(path) {
  const [state, setState] = useState({ data: null, error: "", loading: !!path });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!path) {
      setState({ data: null, error: "", loading: false });
      return;
    }
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: "" }));
    api(path)
      .then((data) => !cancelled && setState({ data, error: "", loading: false }))
      .catch((e) => !cancelled && setState({ data: null, error: e.message, loading: false }));
    return () => {
      cancelled = true;
    };
  }, [path, tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { ...state, reload };
}
