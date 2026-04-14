import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

const CartContext = createContext(null);
const STORAGE_KEY = 'waves_cart';

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : { restaurantId: null, restaurantName: '', items: [] };
    } catch {
      return { restaurantId: null, restaurantName: '', items: [] };
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  const addItem = useCallback((item, restaurant) => {
    setCart((prev) => {
      // Clear cart if switching restaurants
      if (prev.restaurantId && prev.restaurantId !== restaurant.id) {
        if (!window.confirm(`Your cart has items from ${prev.restaurantName}. Clear cart and switch to ${restaurant.name}?`)) {
          return prev;
        }
        return {
          restaurantId: restaurant.id,
          restaurantName: restaurant.name,
          items: [{ ...item, quantity: 1 }],
        };
      }

      const existing = prev.items.findIndex(
        (i) => i._id === item._id && JSON.stringify(i.selectedOptions) === JSON.stringify(item.selectedOptions)
      );

      if (existing >= 0) {
        const items = [...prev.items];
        items[existing] = { ...items[existing], quantity: items[existing].quantity + 1 };
        return { ...prev, items };
      }

      return {
        ...prev,
        restaurantId: restaurant.id,
        restaurantName: restaurant.name,
        items: [...prev.items, { ...item, quantity: 1 }],
      };
    });
  }, []);

  const removeItem = useCallback((index) => {
    setCart((prev) => {
      const items = prev.items.filter((_, i) => i !== index);
      return items.length === 0
        ? { restaurantId: null, restaurantName: '', items: [] }
        : { ...prev, items };
    });
  }, []);

  const updateQuantity = useCallback((index, delta) => {
    setCart((prev) => {
      const items = [...prev.items];
      const newQty = items[index].quantity + delta;
      if (newQty <= 0) {
        items.splice(index, 1);
        return items.length === 0
          ? { restaurantId: null, restaurantName: '', items: [] }
          : { ...prev, items };
      }
      items[index] = { ...items[index], quantity: newQty };
      return { ...prev, items };
    });
  }, []);

  const clearCart = useCallback(() => {
    setCart({ restaurantId: null, restaurantName: '', items: [] });
  }, []);

  const subtotal = cart.items.reduce((sum, item) => {
    const optCost = (item.selectedOptions || []).reduce((s, o) => s + (o.additionalCost || 0), 0);
    return sum + (item.price + optCost) * item.quantity;
  }, 0);

  const itemCount = cart.items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addItem, removeItem, updateQuantity, clearCart, subtotal, itemCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
