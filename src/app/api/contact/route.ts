import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export async function POST(request: Request) {
  try {
    const { name, phone, message } = await request.json();

    if (!name || !phone || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Save directly to Firebase Firestore
    await addDoc(collection(db, 'contactMessages'), {
      name,
      phone,
      message,
      createdAt: serverTimestamp(),
      status: 'new' 
    });

    return NextResponse.json(
      { success: true, message: 'Message saved to Firebase successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error saving message to Firebase:', error);
    return NextResponse.json(
      { error: 'Failed to save message' },
      { status: 500 }
    );
  }
}
