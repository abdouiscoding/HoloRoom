import React, { createContext, useState, useContext } from 'react';

// the ip address
const address = "192.168.1.6"

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

      const res = await fetch(
        `http://${address}:8080/api/cart/getbyuser/${userId}`,
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

    } catch (err) {
      console.error("Cart fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ---------------- REMOVE ITEM ----------------
  const removeItem = async (cartId, cartItemId) => {
    try {
      const res = await fetch(
        `http://${address}:8080/api/cart/removeitem/${cartId}/${cartItemId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!res.ok) return;

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
            (sum, i) => sum + i.price * i.quantity,
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