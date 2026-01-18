'use client'

import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs'
import { useLanguage } from '../../lib/language-context'
import { useCart } from '../../lib/cart-context'
import Link from 'next/link'

function CartContent({ requireSignIn }: { requireSignIn: boolean }) {
  const { t } = useLanguage()
  const { cart, removeFromCart, getTotalPrice } = useCart()

  async function checkoutSession() {
    try {
      // Map cart items to backend format using cart item names
      const items = cart.map((item) => ({
        name: item.name
      }));

      // Backend expects the array wrapped in an object with 'items' key
      const requestBody = { items };
      
      console.log('Cart items:', cart);
      console.log('Sending request body:', requestBody);
      const bodyString = JSON.stringify(requestBody);
      console.log('Stringified body:', bodyString);
      console.log('Body length:', bodyString.length);

      // 1. Must be a POST request with cart array in body wrapped in { items: [...] }
      const response = await fetch('http://localhost:4000/api/payments/create-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        // Ensure body is sent as string
        body: bodyString,
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      // Check if response has content before trying to parse JSON
      const contentType = response.headers.get('content-type');
      console.log('Response content-type:', contentType);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error text:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }

      // Only parse as JSON if content-type indicates JSON
      let data;
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        throw new Error(`Expected JSON but got: ${contentType}`);
      }
      
      console.log('Response data:', data);
  
      if (data.url) {
        // 2. This line actually sends the user to Stripe!
        window.location.href = data.url; 
      } else {
        console.error("No URL received from backend", data);
        alert('No checkout URL received from server');
      }
    } catch (error) {
      console.error("Connection failed:", error);
      alert(`Checkout failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-24">
        <div className="text-center">
          <svg className="w-24 h-24 mx-auto text-gray-300 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.cart.empty}</h2>
          <p className="text-gray-600 mb-8">{t.cart.emptyDescription}</p>
          <Link href="/pricing" className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium px-6 py-3 transition cursor-pointer">
            {t.cart.browseProducts}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">{t.cart.title}</h1>
      
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mb-6">
        <div className="divide-y divide-gray-200">
          {cart.map((item) => (
            <div key={item.id} className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{item.name}</h3>
                <p className="text-gray-600 mb-3">{item.description}</p>
                <ul className="space-y-1 mb-4">
                  {item.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                      <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <div className="text-2xl font-bold text-emerald-600">${item.price}</div>
              </div>
              <button
                onClick={() => removeFromCart(item.id)}
                className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-medium transition flex items-center gap-2 cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                {t.cart.remove}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-emerald-50 rounded-xl p-6 border border-emerald-200">
        <div className="flex items-center justify-between mb-6">
          <span className="text-xl font-semibold text-gray-900">{t.cart.total}</span>
          <span className="text-3xl font-bold text-emerald-600">${getTotalPrice()}</span>
        </div>
        {requireSignIn ? (
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-amber-800 text-center">{t.cart.signInToCheckout}</p>
            </div>
            <SignInButton>
              <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium py-4 text-lg transition cursor-pointer">
                {t.cart.signInToCheckoutButton}
              </button>
            </SignInButton>
          </div>
        ) : (
          <button 
            onClick={checkoutSession}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium py-4 text-lg transition cursor-pointer"
          >
            {t.cart.checkout}
          </button>
        )}
      </div>
    </div>
  )
}

export default function CartPage() {
  return (
    <div className="bg-white font-sans min-h-screen">
      <SignedOut>
        <CartContent requireSignIn={true} />
      </SignedOut>
      <SignedIn>
        <CartContent requireSignIn={false} />
      </SignedIn>
    </div>
  )
}

