import { useEffect, useState } from 'react'

export interface AsyncState<T> {
  data: T | null
  loading: boolean
  error: Error | null
}

/**
 * Minimal dependency-free async loader hook. Cancels stale results on unmount or
 * when deps change. Pair with the promise-cached helpers in contentClient so
 * repeat loads are cheap.
 */
export function useAsyncData<T>(loader: () => Promise<T>, deps: readonly unknown[]): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T>>({ data: null, loading: true, error: null })

  useEffect(() => {
    let active = true
    setState({ data: null, loading: true, error: null })
    loader().then(
      (data) => {
        if (active) setState({ data, loading: false, error: null })
      },
      (error: unknown) => {
        if (active) {
          setState({
            data: null,
            loading: false,
            error: error instanceof Error ? error : new Error(String(error)),
          })
        }
      },
    )
    return () => {
      active = false
    }
    // deps are intentionally forwarded by the caller.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return state
}
