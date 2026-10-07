import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type SetStateAction,
} from 'react';

import { inferStatusTone, type StatusTone } from './statusTone';

export type ShowToast = (message: string, tone?: StatusTone) => void;

export const ToastContext = createContext<ShowToast | null>(null);

const noop: ShowToast = () => undefined;

/** Shows a floating notification that stays visible wherever the page is scrolled. */
export function useToast(): ShowToast {
  return useContext(ToastContext) ?? noop;
}

/**
 * A drop-in replacement for a page's `useState` message: it keeps the value
 * for the inline banner and also shows a toast every time a message is set,
 * even when it is the same text as before.
 */
export function useToastState<T extends string | null>(initial: T, tone?: StatusTone) {
  const show = useToast();
  const [message, setState] = useState<T>(initial);

  const setMessage = useCallback(
    (value: SetStateAction<T>) => {
      setState(value);
      if (typeof value === 'string' && value) show(value, tone ?? inferStatusTone(value));
    },
    [show, tone],
  );

  return [message, setMessage] as const;
}

/**
 * Shows a toast for message objects such as `{ text, type }` that are
 * replaced with a new object on every update, so repeats show again too.
 */
export function useToastMessage(message: { text: string; type?: StatusTone } | null) {
  const show = useToast();

  useEffect(() => {
    if (message?.text) show(message.text, message.type ?? inferStatusTone(message.text));
  }, [message, show]);
}
