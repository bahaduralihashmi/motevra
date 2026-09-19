"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  image: string;
  price: number;
  salePrice: number;
  qty: number;
};

type CartState = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "qty">) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clear: () => void;
  subtotal: number;
  totalQty: number;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const existing = get().items.find((cartItem) => cartItem.id === item.id);

        set({
          items: existing
            ? get().items.map((cartItem) =>
                cartItem.id === item.id
                  ? { ...cartItem, qty: cartItem.qty + 1 }
                  : cartItem,
              )
            : [...get().items, { ...item, qty: 1 }],
        });
      },
      removeItem: (id) => set({ items: get().items.filter((item) => item.id !== id) }),
      updateQty: (id, qty) => {
        set({
          items: get().items
            .map((item) => (item.id === id ? { ...item, qty: Math.max(0, qty) } : item))
            .filter((item) => item.qty > 0),
        });
      },
      clear: () => set({ items: [] }),
      get subtotal() {
        return get().items.reduce((sum, item) => sum + item.salePrice * item.qty, 0);
      },
      get totalQty() {
        return get().items.reduce((sum, item) => sum + item.qty, 0);
      },
    }),
    {
      name: "motevra-cart",
    },
  ),
);
