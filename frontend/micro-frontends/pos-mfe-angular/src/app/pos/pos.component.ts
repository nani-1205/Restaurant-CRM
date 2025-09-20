import { Component, OnInit } from '@angular/core';

interface Product { id: number; name: string; price: number; image_url: string; }
interface CartItem { product: Product; quantity: number; }

@Component({
  selector: 'app-pos',
  templateUrl: './pos.component.html',
  // You can add styles in a separate file if needed
})
export class PosComponent implements OnInit {
  products: Product[] = [];
  cart: CartItem[] = [];
  subTotal = 0;
  total = 0;

  ngOnInit(): void {
    // In a real app, this would be from an API call
    this.products = [
      { id: 1, name: 'Shrimp Basil Salad', price: 12.50, image_url: 'https://i.imgur.com/gC5aIuK.png' },
      { id: 2, name: 'Onion Rings', price: 6.00, image_url: 'https://i.imgur.com/Y43qP6N.png' },
      { id: 3, name: 'Smoked Bacon', price: 8.00, image_url: 'https://i.imgur.com/k2Aa551.png' },
      { id: 4, name: 'Fresh Tomatoes', price: 4.50, image_url: 'https://i.imgur.com/yO8zW8D.png' },
      { id: 5, name: 'Chicken Burger', price: 14.00, image_url: 'https://i.imgur.com/1G2xv2u.png' },
      { id: 6, name: 'Red Onion Rings', price: 6.50, image_url: 'https://i.imgur.com/tL44G7A.png' },
      { id: 7, name: 'Beef Burger', price: 15.50, image_url: 'https://i.imgur.com/WlO3611.png' },
      { id: 8, name: 'Grilled Burger', price: 15.00, image_url: 'https://i.imgur.com/V9K242O.png' },
    ];
  }

  addToCart(product: Product): void {
    const existingItem = this.cart.find(item => item.product.id === product.id);
    if (existingItem) {
      existingItem.quantity++;
    } else {
      this.cart.push({ product, quantity: 1 });
    }
    this.calculateTotals();
  }

  updateQuantity(item: CartItem, change: number): void {
    item.quantity += change;
    if (item.quantity <= 0) {
      this.cart = this.cart.filter(cartItem => cartItem.product.id !== item.product.id);
    }
    this.calculateTotals();
  }

  calculateTotals(): void {
    this.subTotal = this.cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
    this.total = this.subTotal; // Add tax/discount logic here
  }
}