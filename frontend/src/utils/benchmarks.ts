export type Benchmark = {
  id: string
  name: string
  brand: string
  category: string
  price: number
  rating: number
  image: string
  inStock: boolean
}

export const categories = [
  "Audio",
  "Wearables",
  "Footwear",
  "Cameras",
  "Bags",
  "Accessories",
] as const

export const brands = [
  "Acme",
  "Northwind",
  "Globex",
  "Initech",
  "Umbrella",
] as const

export const benchmark: Benchmark[] = [
  {
    id: "1",
    name: "Studio Wireless Headphones",
    brand: "Acme",
    category: "Audio",
    price: 249,
    rating: 4.7,
    image: "/products/headphones.png",
    inStock: true,
  },
  {
    id: "2",
    name: "Pulse Smartwatch",
    brand: "Globex",
    category: "Wearables",
    price: 199,
    rating: 4.4,
    image: "/products/watch.png",
    inStock: true,
  },
  {
    id: "3",
    name: "Cloud Runner Sneakers",
    brand: "Northwind",
    category: "Footwear",
    price: 129,
    rating: 4.6,
    image: "/products/sneaker.png",
    inStock: false,
  },
  {
    id: "4",
    name: "Mirrorless Camera X",
    brand: "Initech",
    category: "Cameras",
    price: 899,
    rating: 4.8,
    image: "/products/camera.png",
    inStock: true,
  },
  {
    id: "5",
    name: "Trail Daypack",
    brand: "Umbrella",
    category: "Bags",
    price: 89,
    rating: 4.2,
    image: "/products/backpack.png",
    inStock: true,
  },
  {
    id: "6",
    name: "Portable Boom Speaker",
    brand: "Acme",
    category: "Audio",
    price: 79,
    rating: 4.1,
    image: "/products/speaker.png",
    inStock: true,
  },
  {
    id: "7",
    name: "Eclipse Sunglasses",
    brand: "Globex",
    category: "Accessories",
    price: 149,
    rating: 4.3,
    image: "/products/sunglasses.png",
    inStock: false,
  },
  {
    id: "8",
    name: "Compact Mechanical Keyboard",
    brand: "Initech",
    category: "Accessories",
    price: 119,
    rating: 4.9,
    image: "/products/keyboard.png",
    inStock: true,
  },
  {
    id: "9",
    name: "Bass Earbuds Pro",
    brand: "Northwind",
    category: "Audio",
    price: 159,
    rating: 4.5,
    image: "/products/headphones.png",
    inStock: true,
  },
  {
    id: "10",
    name: "Fit Band Lite",
    brand: "Umbrella",
    category: "Wearables",
    price: 59,
    rating: 3.9,
    image: "/products/watch.png",
    inStock: true,
  },
  {
    id: "11",
    name: "Street Low Sneakers",
    brand: "Acme",
    category: "Footwear",
    price: 99,
    rating: 4.0,
    image: "/products/sneaker.png",
    inStock: true,
  },
  {
    id: "12",
    name: "Voyager Camera Bag",
    brand: "Initech",
    category: "Bags",
    price: 69,
    rating: 4.4,
    image: "/products/backpack.png",
    inStock: true,
  },
]
