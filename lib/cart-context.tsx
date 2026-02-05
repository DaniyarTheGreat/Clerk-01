'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface CartItem {
  id: string
  name: string
  price: number
  description: string
  features: string[]
}

interface CartContextType {
  cart: CartItem[]
  addToCart: (item: CartItem) => void
  removeFromCart: (id: string) => void
  clearCart: () => void
  getTotalPrice: () => number
  getCartCount: () => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(() => {
    // Initialize from storage without using an effect (avoids setState-in-effect lint).
    if (typeof window === 'undefined') return []

    // Requirement: when the user first opens the site (new browser session),
    // start with an empty cart.
    const sessionKey = 'cart_session_initialized'
    const isNewSession = !window.sessionStorage.getItem(sessionKey)

    if (isNewSession) {
      window.sessionStorage.setItem(sessionKey, '1')
      window.localStorage.removeItem('cart')
      return []
    }

    const savedCart = window.localStorage.getItem('cart')
    if (!savedCart) return []

    try {
      return JSON.parse(savedCart) as CartItem[]
    } catch (error) {
      // If storage is corrupted, reset so the cart doesn't get "stuck".
      console.error('Error loading cart from localStorage:', error)
      window.localStorage.removeItem('cart')
      return []
    }
  })

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart))
  }, [cart])

  const addToCart = (item: CartItem) => {
    setCart((prevCart) => {
      // Check if item already exists in cart
      const exists = prevCart.find((cartItem) => cartItem.id === item.id)
      if (exists) {
        return prevCart // Don't add duplicates
      }
      return [...prevCart, item]
    })
  }

  const removeFromCart = (id: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id))
  }

  const clearCart = () => {
    setCart([])
  }

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price, 0)
  }

  const getCartCount = () => {
    return cart.length
  }

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        getTotalPrice,
        getCartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}














