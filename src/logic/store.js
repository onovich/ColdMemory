export function createStore(initialState) {
  let state = structuredClone(initialState);
  const listeners = new Set();

  function notify() {
    listeners.forEach((listener) => listener(state));
  }

  function hasShallowChanges(nextState) {
    const currentKeys = Object.keys(state);
    const nextKeys = Object.keys(nextState);
    if (currentKeys.length !== nextKeys.length) {
      return true;
    }

    return nextKeys.some((key) => !Object.is(state[key], nextState[key]));
  }

  return {
    getState() {
      return state;
    },
    setState(updater) {
      const nextState = typeof updater === 'function' ? updater(state) : updater;
      if (!hasShallowChanges(nextState)) {
        return;
      }

      state = nextState;
      notify();
    },
    patchState(patch) {
      const nextState = {
        ...state,
        ...patch
      };
      if (!hasShallowChanges(nextState)) {
        return;
      }

      state = nextState;
      notify();
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    }
  };
}