export function createStore(initialState) {
  let state = structuredClone(initialState);
  const listeners = new Set();

  return {
    getState() {
      return state;
    },
    setState(updater) {
      state = typeof updater === 'function' ? updater(state) : updater;
      listeners.forEach((listener) => listener(state));
    },
    patchState(patch) {
      state = {
        ...state,
        ...patch
      };
      listeners.forEach((listener) => listener(state));
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    }
  };
}