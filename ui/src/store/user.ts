import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";

type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
};

type UserState = {
  user: User | null;
  setUser: (user: User | null) => void;
};

export const useUserStore = create<UserState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        setUser: (user) => set({ user }),
      }),
      {
        name: "user-storage",
        storage: createJSONStorage(() => sessionStorage),
      }
    )
  )
);
