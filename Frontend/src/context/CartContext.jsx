import React, { createContext, useState, useContext } from 'react';

const CartContext = createContext();

export const useCart = () => {
  return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([
  ]);

  // Calculate totals
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const cartSubtotal = cartItems.reduce((total, item) => {
    // Basic price parsing, assumes price strings like "$299" or "$19.99"
    const numericPrice = parseFloat(item.price.replace(/[^0-9.]/g, ''));
    return total + (numericPrice * item.quantity);
  }, 0);

  const addToCart = (product, quantity = 1, color = null) => {
    setCartItems(prevItems => {
      // Check if item with same id and color exists
      const existingItemIndex = prevItems.findIndex(
        item => item.id === product.id && item.color === color
      );

      if (existingItemIndex >= 0) {
        // Update quantity of existing item
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += quantity;
        return updatedItems;
      } else {
        // Add new item
        return [...prevItems, { ...product, quantity, color }];
      }
    });
  };

  const removeFromCart = (productId, color) => {
    setCartItems(prevItems => prevItems.filter(
      item => !(item.id === productId && item.color === color)
    ));
  };

  const updateQuantity = (productId, color, delta) => {
    setCartItems(prevItems => prevItems.map(item => {
      if (item.id === productId && item.color === color) {
        const newQuantity = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      cartCount,
      cartSubtotal,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart
    }}>
      {children}
    </CartContext.Provider>
  );
};
