import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import API from "../services/api";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartLoading, setCartLoading] = useState(false);
  const [cartError, setCartError] = useState(null);
  const cartRequestId = useRef(0);

  // Fetch cart from backend
  const fetchCart = useCallback(async () => {
    const requestId = ++cartRequestId.current;
    try {
      setCartLoading(true);
      setCartError(null);
      const { data } = await API.get("/cart");
      if (requestId === cartRequestId.current) {
        setCartItems(data.cart || []);
      }
    } catch (error) {
      // Don't set error if user is not logged in
      if (requestId === cartRequestId.current) {
        if (error.response?.status !== 401) {
          setCartError("Failed to load cart");
        }
        setCartItems([]);
      }
    } finally {
      if (requestId === cartRequestId.current) {
        setCartLoading(false);
      }
    }
  }, []);

  // Hydrate persisted cart data when the app starts so the Navbar count is
  // correct after a refresh on any route.
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Add to cart
  const addToCart = async (productId) => {
    const { data } = await API.post(`/cart/${productId}`);
    await fetchCart(); // Refresh to get populated data
    return data;
  };

  // Update quantity
  const updateQuantity = async (productId, quantity) => {
    const { data } = await API.patch(`/cart/${productId}`, { quantity });
    await fetchCart();
    return data;
  };

  // Remove from cart
  const removeFromCart = async (productId) => {
    const { data } = await API.delete(`/cart/${productId}`);
    await fetchCart();
    return data;
  };

  // Clear cart (after order)
  const clearCart = () => {
    cartRequestId.current += 1;
    setCartItems([]);
    setCartLoading(false);
    setCartError(null);
  };

  // Derived values
  const cartCount = cartItems.reduce((total, item) => total + (item.quantity || 0), 0);
  const subtotal = cartItems.reduce(
    (total, item) => total + (item.product?.price || 0) * (item.quantity || 0),
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartLoading,
        cartError,
        cartCount,
        subtotal,
        fetchCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
