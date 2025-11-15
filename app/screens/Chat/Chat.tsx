import React, { useState, useEffect, useCallback } from 'react';
import { auth, db } from '../../services/firebaseConfig';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/RootStackParamList';
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  updateDoc,
  getDoc,
} from 'firebase/firestore';
import { fetchSelectedUser, User, useUser } from '../../context/UserContext';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { COLORS } from '../../constants/theme';
import { Booking } from '../../services/BookingServices';
import { Timestamp } from '@react-native-firebase/firestore';

type ChatScreenProps = StackScreenProps<RootStackParamList, 'Chat'>;

interface Message {
  _id: string;
  text: string;
  createdAt: Date;
  userId: string;
  userName: string;
}

export const Chat = ({ route, navigation }: ChatScreenProps) => {
  const { chatId } = route.params as { chatId: string };
  const { user } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [otherUser, setOtherUser] = useState<User | null>(null);
  const [booking, setBooking] = useState<Booking | null>(null);

  useEffect(() => {
    const fetchChatDetails = async () => {
      try {
        const chatDoc = await getDoc(doc(db, 'chats', chatId));
        if (chatDoc.exists()) {
          const chatData = chatDoc.data();
            const otherUserId = chatData.participants?.find((id: string) => id !== user?.uid);
          
          if (otherUserId) {
            const userData = await fetchSelectedUser(otherUserId);
            setOtherUser(userData);
          }

          if (chatData.bookingId) {
            const bookingDoc = await getDoc(doc(db, 'bookings', chatData.bookingId));
            if (bookingDoc.exists()) {
              setBooking(bookingDoc.data() as Booking);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching chat details:', error);
      }
    };

    fetchChatDetails();
  }, [chatId, user?.uid]);

  useEffect(() => {
    const messagesQuery = query(
      collection(db, 'chats', chatId, 'messages'),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const fetchedMessages = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          _id: doc.id,
          text: data.message,
          createdAt: data.timestamp?.toDate() || new Date(),
          userId: data.userId,
          userName: data.userName || 'User',
        };
      });
      setMessages(fetchedMessages);
    });

    return () => unsubscribe();
  }, [chatId]);

  const sendMessage = useCallback(async () => {
    if (!auth.currentUser || input.trim() === '') return;

    const newMessage = {
      userId: user?.uid || '',
      userName: auth.currentUser?.displayName || 'User',
      message: input.trim(),
      timestamp: serverTimestamp(),
    };

    await addDoc(collection(db, 'chats', chatId, 'messages'), newMessage);

    const chatDocRef = doc(db, 'chats', chatId);
    await updateDoc(chatDocRef, {
      lastMessage: input.trim(),
      updatedAt: serverTimestamp(),
    });

    setInput('');
  }, [input, chatId, user]);

  const renderItem = ({ item }: { item: Message }) => {
    const isMe = item.userId === user?.uid;
    return (
      <View style={[styles.messageContainer, isMe ? styles.myMessage : styles.theirMessage]}>
        <Text style={styles.userName}>{isMe ? 'You' : item.userName}</Text>
        <Text style={styles.messageText}>{item.text}</Text>
        <Text style={styles.timestamp}>
          {item.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        
        {otherUser?.profileImageUrl ? (
          <Image source={{ uri: otherUser.profileImageUrl }} style={styles.profileImage} />
        ) : (
          <View style={styles.profilePlaceholder}>
            <Text style={styles.placeholderText}>
              {otherUser?.firstName?.charAt(0).toUpperCase() || '?'}
            </Text>
          </View>
        )}
        
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerName}>{otherUser?.firstName} {otherUser?.lastName}</Text>
          {booking && (
            <Text style={styles.headerSubtitle}>
              {booking.catalogueService.title || 'Booking'} • {booking.status || 'Active'}
            </Text>
          )}
        </View>
      </View>

      {/* Booking Info Card */}
      {booking && (
        <View style={[styles.bookingCard, { flexDirection: 'row', alignItems: 'center' }]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.bookingTitle}>Booking Details</Text>
            <Text style={styles.bookingInfo}>
              Date: {typeof booking.selectedDate === 'string' 
          ? booking.selectedDate 
          : (booking.selectedDate as Timestamp)?.toDate?.()?.toLocaleDateString() || 'TBD'}
            </Text>
            <Text style={styles.bookingInfo}>Status: {booking.status}</Text>
          </View>
          {booking.catalogueService?.imageUrls && (
            <Image 
              source={{ uri: booking.catalogueService.imageUrls[0] }} 
              style={{ width: 60, height: 60, borderRadius: 8, marginLeft: 10 }} 
            />
          )}
        </View>
      )}

      {/* Messages */}
      <FlatList
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        inverted
        contentContainerStyle={styles.messagesList}
      />

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Type a message..."
          placeholderTextColor="#999"
          style={styles.input}
          multiline
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.backgroundColor },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: COLORS.primary,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingTop: 50,
  },
  backButton: { marginRight: 10 },
  backText: { fontSize: 24, color: '#fff', fontWeight: 'bold' },
  profileImage: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#fff',
  },
  profilePlaceholder: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  placeholderText: { fontSize: 20, fontWeight: 'bold', color: COLORS.primary },
  headerTextContainer: { flex: 1 },
  headerName: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  headerSubtitle: { fontSize: 13, color: '#f0f0f0', marginTop: 2 },
  bookingCard: {
    backgroundColor: '#fff',
    margin: 10,
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bookingTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 8, color: COLORS.primary },
  bookingInfo: { fontSize: 14, color: '#555', marginBottom: 4 },
  messagesList: { padding: 10, paddingBottom: 20 },
  messageContainer: {
    marginVertical: 4,
    padding: 12,
    borderRadius: 16,
    maxWidth: '75%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  myMessage: { backgroundColor: COLORS.primary, alignSelf: 'flex-end' },
  theirMessage: { backgroundColor: '#FFF', alignSelf: 'flex-start' },
  userName: { fontSize: 11, fontWeight: '600', marginBottom: 4, opacity: 0.7 },
  messageText: { fontSize: 15, lineHeight: 20 },
  timestamp: { fontSize: 10, opacity: 0.5, marginTop: 4, textAlign: 'right' },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 10,
    fontSize: 15,
    backgroundColor: '#f8f8f8',
    maxHeight: 100,
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
  },
  sendText: { color: '#fff', fontWeight: '600', fontSize: 15 },
});

export default Chat;

