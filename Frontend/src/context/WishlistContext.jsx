import React, { createContext, useContext, useState, useEffect } from 'react';

// the ip address
const address = "192.168.1.6"

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchWishlist = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');

      if (!userId || !token) return;

      const res = await fetch(
        `http://${address}:8080/api/wishlist/get/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (!res.ok) return;

      const data = await res.json();

      const baseItems = data.wishlistItems || [];

      // 🔥 FETCH PRODUCT DETAILS FOR EACH ITEM
      const enriched = await Promise.all(
        baseItems.map(async (item) => {
          try {
            const pRes = await fetch(
              `http://${address}:8080/api/products/get/${item.pId}`,
              {
                headers: { Authorization: `Bearer ${token}` }
              }
            );

            if (!pRes.ok) return null;

            const p = await pRes.json();

            return {
              wItemId: item.wItemId,
              id: p.pId,
              name: p.pName,
              price: p.pPrice,
              image: p.images?.[0]?.pImageUrl || ''
            };
          } catch {
            return null;
          }
        })
      );

      setWishlistItems(enriched.filter(Boolean));
    } catch (err) {
      console.error('wishlist fetch error', err);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const removeFromWishlist = async (productId) => {
    try {
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');

      const item = wishlistItems.find(i => i.id === productId);
      if (!item) return;

      await fetch(
        `http://${address}:8080/api/wishlist/remove/${userId}/${item.wItemId}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setWishlistItems(prev =>
        prev.filter(i => i.id !== productId)
      );
    } catch (err) {
      console.error(err);
    }
  };

  const isInWishlist = (productId) =>
    wishlistItems.some(i => i.id === productId);

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        fetchWishlist,
        removeFromWishlist,
        isInWishlist
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};