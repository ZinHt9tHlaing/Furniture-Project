import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { createJSONStorage, persist } from "zustand/middleware";

export enum Status {
  otp = "otp",
  confirm = "confirm",
  verify = "verify", // for forgot password
  reset = "reset", // for forgot password
  none = "none",
}

type State = {
  phone: string | null;
  token: string | null;
  status: Status;
};

type Actions = {
  setAuth: (phone: string, token: string, status: Status) => void;
  clearAuth: () => void;
};

const initialState: State = {
  phone: null,
  token: null,
  status: Status.none,
};

const useAuthStore = create<State & Actions>()(
  persist(
    immer((set) => ({
      ...initialState,
      setAuth: (phone, token, status) =>
        set((state) => {
          state.phone = phone;
          state.token = token;
          state.status = status;
        }),
      clearAuth: () => set(initialState),
    })),
    {
      name: "auth-credential",
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);

export default useAuthStore;
