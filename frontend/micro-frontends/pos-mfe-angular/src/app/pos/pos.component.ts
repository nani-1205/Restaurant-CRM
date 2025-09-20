import { Component, OnInit } from '@angular/core';

interface Product { id: number; name: string; price: number; image_url: string; }
interface CartItem { product: Product; quantity: number; }

@Component({
  selector: 'app-pos',
  templateUrl: './pos.component.html',
})
export class PosComponent implements OnInit {
  products: Product[] = [];
  cart: CartItem[] = [];
  subTotal = 0;
  total = 0;

  ngOnInit(): void {
    this.products = [
      { id: 1, name: 'Shrimp Basil Salad', price: 12.50, image_url: 'https://i.imgur.com/gC5aIuK.png' },
      { id: 2, name: 'Onion Rings', price: 6.00, image_url: 'https://i.imgur.com/Y43qP6N.png' },
      { id: 5, name: 'Chicken Burger', price: 14.00, image_url: 'https://i.imgur.com/1G2xv2u.png' },
      { id: 7, name: 'Beef Burger', price: 15.50, image_url: 'https://i.imgur.com/WlO3611.png' },
    ];
  }

  addToCart(product: Product): void {
    const item = this.cart.find(i => i.product.id === product.id);
    if (item) item.quantity++; else this.cart.push({ product, quantity: 1 });
    this.calculateTotals();
  }

  updateQuantity(item: CartItem, change: number): void {
    item.quantity += change;
    if (item.quantity <= 0) this.cart = this.cart.filter(i => i.product.id !== item.product.id);
    this.calculateTotals();
  }

  calculateTotals(): void {
    this.subTotal = this.cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
    this.total = this.subTotal;
  }
}