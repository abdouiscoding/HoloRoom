import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { CartProvider } from './context/CartContext'
import { WishlistProvider } from './context/WishlistContext'
import { ReviewsProvider } from './context/ReviewsContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CartProvider>
      <WishlistProvider>
        <ReviewsProvider>
          <App />
        </ReviewsProvider>
      </WishlistProvider>
    </CartProvider>
  </StrictMode>,
)
