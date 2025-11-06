import firestore from '@react-native-firebase/firestore';
import { Booking } from './BookingServices';

export const getOrCreateChat = async (
  userId: string,
  otherUserId: string,
  booking?: Booking
): Promise<string | null> => {
  try {
    const chatRef = firestore().collection('chats');

    // 1️⃣ Query chats that include the current user
    const chatQuery = await chatRef
      .where('participants', 'array-contains', userId)
      .get();

    // 2️⃣ Check manually for matching participants and booking
    for (const docSnap of chatQuery.docs) {
      const data = docSnap.data();

      const sameParticipants =
        data.participants.includes(userId) &&
        data.participants.includes(otherUserId);

      const sameBooking =
        booking &&
        (data.booking?.id === booking.id || data.bookingId === booking.id);

      if (sameParticipants && sameBooking) {
        // ✅ Existing chat found
        return docSnap.id;
      }
    }

    // 3️⃣ Otherwise create new chat
    const newChat = {
      participants: [userId, otherUserId],
      createdAt: firestore.FieldValue.serverTimestamp(),
      updatedAt: firestore.FieldValue.serverTimestamp(),
      lastMessage: '',
      booking: booking || null,
      bookingId: booking?.id || null,
    };

    const newChatRef = await chatRef.add(newChat);
    console.log('💬 New chat created:', newChatRef.id);
    return newChatRef.id;
  } catch (error) {
    console.error('❌ Error creating or fetching chat:', error);
    return null;
  }
};
