import React, { createContext, useState, useContext } from 'react';
import { API, address, myFetch, logAction } from "../api";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);

  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  // ---------------- FETCH CART ----------------
  const fetchCart = async () => {
    try {
      if (!userId) return;

      setLoading(true);

      const res = await myFetch(
        `${API}/api/cart/getbyuser/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!res.ok) {
        setCart(null);
        return;
      }

      const data = await res.json();
      setCart(data);
      localStorage.setItem("cartId", data.pCartId);

    } catch (err) {
      console.error("Cart fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ---------------- REMOVE ITEM ----------------
  const removeItem = async (cartId, cartItemId) => {
    try {
      const res = await myFetch(
        `${API}/api/cart/removeitem/${cartId}/${cartItemId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
        
      );

      if (!res.ok) return;
      logAction("REMOVE_FROM_CART", `User ${localStorage.getItem("userName")} removed cart item #${cartItemId}`);

      // update UI instantly (no refetch spam)
      setCart(prev => {
        if (!prev) return prev;

        const newItems = prev.items.filter(
          item => item.cartItemId !== cartItemId
        );

        return {
          ...prev,
          items: newItems,
          total: newItems.reduce(
            (sum, i) => sum + i.subtotal * i.quantity,
            0
          )
        };
      });

      return true;

    } catch (err) {
      console.error(err);
      return false;
    }
  };

  return (
    <CartContext.Provider value={{
      cart,
      loading,
      fetchCart,
      removeItem
    }}>
      {children}
    </CartContext.Provider>
  );
};