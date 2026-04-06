import { create } from 'zustand';

const useToastStore = create((set) => ({
  toasts: [],

  addToast: (toast) => {
    const id = typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID
      ? window.crypto.randomUUID()
      : Date.now() + '-' + Math.random().toString(36).substring(2);
    const newToast = {
      id,
      type: toast.type || 'info', // success, error, warning, info
      message: toast.message,
      duration: toast.duration || 5000,
    };

    set((state) => ({
      toasts: [...state.toasts, newToast],
    }));

    // Auto-remove toast after duration
    if (newToast.duration > 0) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      }, newToast.duration);
    }

    return id;
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  // Helper methods
  success: (message, duration) => {
    useToastStore.getState().addToast({ type: 'success', message, duration });
  },

  error: (message, duration) => {
    useToastStore.getState().addToast({ type: 'error', message, duration });
  },

  warning: (message, duration) => {
    useToastStore.getState().addToast({ type: 'warning', message, duration });
  },

  info: (message, duration) => {
    useToastStore.getState().addToast({ type: 'info', message, duration });
  },
}));

export default useToastStore;
