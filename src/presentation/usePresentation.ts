import { useCallback, useEffect, useReducer, useState } from 'react';
import { initialState, navigate, validState } from './navigation.js';
const KEY = 'mapna-presentation-v1';
function restore() { try { const saved = JSON.parse(sessionStorage.getItem(KEY) || 'null'); return validState(saved) ? saved : initialState; } catch { return initialState; } }
export function usePresentation() {
  const [state, dispatch] = useReducer(navigate, undefined, restore);
  const [fullscreenError, setFullscreenError] = useState(false);
  const fullscreen = useCallback(async () => { try { if (document.fullscreenElement) await document.exitFullscreen(); else await document.documentElement.requestFullscreen(); setFullscreenError(false); } catch { setFullscreenError(true); } }, []);
  useEffect(() => { try { sessionStorage.setItem(KEY, JSON.stringify(state)); } catch { /* Storage is optional. */ } }, [state]);
  useEffect(() => {
    function keydown(event: KeyboardEvent) {
      if (event.altKey || event.ctrlKey || event.metaKey || (event.target instanceof HTMLElement && event.target.closest('input,textarea,select,[contenteditable="true"]'))) return;
      const actions: Record<string,string> = { ArrowRight:'next', ' ':'next', ArrowLeft:'previous', Home:'home', End:'end', r:'restart', R:'restart' };
      if (actions[event.key]) { event.preventDefault(); if (!event.repeat) dispatch(actions[event.key]); }
      if (event.key.toLowerCase() === 'f') { event.preventDefault(); if (!event.repeat) void fullscreen(); }
    }
    window.addEventListener('keydown', keydown); return () => window.removeEventListener('keydown', keydown);
  }, [fullscreen]);
  return { ...state, dispatch, fullscreen, fullscreenError };
}
