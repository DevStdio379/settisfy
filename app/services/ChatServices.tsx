import firestore from '@react-native-firebase/firestore';
import { Booking } from './BookingServices';

/**
 * Get existing chat between two users or create a new one.
 */
export const getOrCreateChat = async (
  userId: string,
  otherUserId: string,
  bookingId?: string,
): Promise<string | null> => {
  try {
    const chatRef = firestore().collection('chats');

    // 1️⃣ Find chats that include userId
    const snapshot = await chatRef.where('participants', 'array-contains', userId).get();

    // 2️⃣ Check manually for the correct pair + booking
    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();

      const sameParticipants =
        data.participants.includes(userId) &&
        data.participants.includes(otherUserId);

      const sameBooking =
        bookingId &&
        (data.bookingId === bookingId);

      if (sameParticipants && sameBooking) {
        // ✅ Chat already exists
        return docSnap.id;
      }
    }

    // 3️⃣ Otherwise, create a new chat
    const newChat = {
      participants: [userId, otherUserId],
      createdAt: firestore.FieldValue.serverTimestamp(),
      updatedAt: firestore.FieldValue.serverTimestamp(),
      lastMessage: '',
      bookingId: bookingId || null,
    };

    const newChatRef = await chatRef.add(newChat);
    return newChatRef.id;

  } catch (error) {
    console.error('Error creating or fetching chat: ', error);
    return null;
  }
};
