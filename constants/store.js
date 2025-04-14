import { create } from 'zustand';

const useGlobalStore = create((set) => ({
  refreshVersion: 0,
  incrementRefresh: () =>
    set((state) => ({ refreshVersion: state.refreshVersion + 1 })),
}));

export default useGlobalStore;
