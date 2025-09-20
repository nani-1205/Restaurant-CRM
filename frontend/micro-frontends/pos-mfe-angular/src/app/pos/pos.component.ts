import { Component, OnInit } from '@angular/core';

// Interfaces for our data structures
interface Product {
  id: number;
  name: string;
  price: number;
  image_url: string;
}

interface CartItem {
  product: Product;
  quantity: number;
}

@Component({
  selector: 'app-pos',
  templateUrl: './pos.component.html',
  styleUrls: ['./pos.component.css']
})
export class PosComponent implements OnInit {
  products: Product[] = [];
  cart: CartItem[] = [];
  subTotal = 0;
  total = 0;

  ngOnInit(): void {
    // In a real app, this would come from an API call
    this.products = [
      { id: 1, name: 'Shrimp Basil Salad', price: 10.00, image_url: 'https://via.placeholder.com/150/FFC0CB/000000?Text=Salad' },
      { id: 2, name: 'Onion Rings', price: 10.00, image_url: 'https://via.placeholder.com/150/FFA500/000000?Text=Rings' },
      { id: 3, name: 'Chicken Burger', price: 10.00, image_url: 'https://via.placeholder.com/150/800080/FFFFFF?Text=Burger' },
      { id: 4, name: 'Beef Burger', price: 10.00, image_url: 'https://via.placeholder.com/150/A52A2A/FFFFFF?Text=Burger' },
      // ... Add more mock products
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
    // Add logic for tax, discounts etc. here
    this.total = this.subTotal;
  }
}