type TransitionState = {
  active: boolean;
  message: string;
};

const listeners: Set<(state: TransitionState) => void> = new Set();

let state: TransitionState = {
  active: false,
  message: "",
};

const emit = () => {
  listeners.forEach((l) => l(state));
};

export const transitionStore = {
  subscribe(listener: (state: TransitionState) => void) {
    listeners.add(listener);
    listener(state);

    return () => listeners.delete(listener);
  },

  getState() {
    return state;
  },

  start(message = "Loading...", duration?: number) {
    state = { active: true, message };
    emit();

    if (duration) {
      setTimeout(() => {
        state = { active: false, message: "" };
        emit();
      }, duration);
    }
  },

  stop() {
    state = { active: false, message: "" };
    emit();
  },
};
