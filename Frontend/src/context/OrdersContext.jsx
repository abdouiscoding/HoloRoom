import React, { createContext, useContext, useState } from "react";
import { API, myFetch } from "../api";

const OrdersContext = createContext();

export const useOrders = () => useContext(OrdersContext);

export const OrdersProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  const fetchOrders = async () => {
    try {
      if (!userId) return;
      setLoading(true);
      const res = await myFetch(`${API}/api/orders/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        setOrders([]);
        return;
      }
      const data = await res.json();
      const sorted = data.sort(
        (a, b) => new Date(b.orderDate) - new Date(a.orderDate)
      );
      setOrders(sorted);
    } catch (err) {
      console.error("Orders fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async (orderItemId) => {
    try {
      const res = await myFetch(`${API}/api/orders/cancel/${orderItemId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to cancel order");
      await fetchOrders();
      return true;
    } catch (err) {
      console.error("Cancel order error:", err);
      alert("Failed to cancel order");
      return false;
    }
  };

  return (
    <OrdersContext.Provider value={{ orders, loading, fetchOrders, cancelOrder }}>
      {children}
    </OrdersContext.Provider>
  );
};