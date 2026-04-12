import { NextResponse } from 'next/server';
import { db } from '@/firebase/config';
import { collection, addDoc } from 'firebase/firestore';

export async function GET() {
  try {
    const pets = [
      { name: "Max", type: "Dog", breed: "Golden Retriever", age: "1-3 years", price: 0, location: "New York, NY", phone: "+15551234567", image: "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=800", description: "Friendly and energetic Golden Retriever.", createdAt: new Date().toISOString() },
      { name: "Luna", type: "Cat", breed: "Persian", age: "0-6 months", price: 50, location: "Los Angeles, CA", phone: "+15559876543", image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=800", description: "Sweet Persian kitten.", createdAt: new Date().toISOString() },
      { name: "Bella", type: "Dog", breed: "Husky", age: "6-12 months", price: 200, location: "Chicago, IL", phone: "+15551112222", image: "https://images.unsplash.com/photo-1605568420125-4eb84e4f55db?auto=format&fit=crop&q=80&w=800", description: "Beautiful Husky with blue eyes.", createdAt: new Date().toISOString() },
      { name: "Milo", type: "Cat", breed: "Siamese", age: "3+ years", price: 0, location: "Miami, FL", phone: "+15553334444", image: "https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?auto=format&fit=crop&q=80&w=800", description: "Very vocal and affectionate Siamese.", createdAt: new Date().toISOString() },
      { name: "Charlie", type: "Dog", breed: "Mixed", age: "1-3 years", price: 100, location: "Austin, TX", phone: "+15555556666", image: "https://images.unsplash.com/photo-1534361960057-19889db9621e?auto=format&fit=crop&q=80&w=800", description: "Loyal mixed breed looking for a home.", createdAt: new Date().toISOString() },
      { name: "Lucy", type: "Bird", breed: "Other", age: "1-3 years", price: 75, location: "Denver, CO", phone: "+15557778888", image: "https://images.unsplash.com/photo-1552728089-57105a2599d0?auto=format&fit=crop&q=80&w=800", description: "Colorful parrot.", createdAt: new Date().toISOString() },
    ];

    const supplies = [
      { name: "Premium Dog Food", category: "Food", price: 45, description: "Grain-free salmon recipe.", createdAt: new Date().toISOString() },
      { name: "Squeaky Toy", category: "Toys", price: 12, description: "Durable rubber squeak toy.", createdAt: new Date().toISOString() },
      { name: "Cat Tree Tower", category: "Accessories", price: 85, description: "Multi-level cat tree with scratching posts.", createdAt: new Date().toISOString() },
      { name: "Flea & Tick Treatment", category: "Medical", price: 30, description: "Monthly preventative treatment.", createdAt: new Date().toISOString() },
    ];

    const clinics = [
      { name: "Happy Paws Clinic", location: "New York, NY", rating: "4.9", createdAt: new Date().toISOString() },
      { name: "Downtown Vet Care", location: "Los Angeles, CA", rating: "4.7", createdAt: new Date().toISOString() },
      { name: "Riverside Pet Hospital", location: "Chicago, IL", rating: "4.8", createdAt: new Date().toISOString() },
    ];

    const hostels = [
      { name: "Cozy Pet Retreat", location: "Miami, FL", price: 35, createdAt: new Date().toISOString() },
      { name: "The Wagging Tail Inn", location: "Denver, CO", price: 45, createdAt: new Date().toISOString() },
      { name: "Purrfect Stay", location: "Austin, TX", price: 30, createdAt: new Date().toISOString() },
    ];

    for (const pet of pets) await addDoc(collection(db, "pets"), pet);
    for (const supply of supplies) await addDoc(collection(db, "supplies"), supply);
    for (const clinic of clinics) await addDoc(collection(db, "clinics"), clinic);
    for (const hostel of hostels) await addDoc(collection(db, "hostels"), hostel);

    return NextResponse.json({ message: "Database seeded successfully!" });

  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
