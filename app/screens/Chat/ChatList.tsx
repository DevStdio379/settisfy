import React, { useEffect, useState, useCallback } from 'react';
import { View, Button, FlatList, RefreshControl, TouchableOpacity, Text, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/RootStackParamList';
import { User, useUser } from '../../context/UserContext';
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import { auth, db } from '../../services/firebaseConfig';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { COLORS } from '../../constants/theme';
import { Booking, fetchSelectedBooking } from '../../services/BookingServices';

type ChatListScreenProps = StackScreenProps<RootStackParamList, 'ChatList'>

export const ChatList = ({ navigation }: ChatListScreenProps) => {
    const { user } = useUser();
    const [chats, setChats] = useState<{ id: string; participants: string[]; otherParticipantDetails?: User; lastMessage?: string; booking?: Booking; product?: Booking; updatedAt?: any; }[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    const fetchUsersByIds = async (userIds: string[]): Promise<User[]> => {
        const usersQuery = query(collection(db, "users"), where("uid", "in", userIds));
        const snapshot = await getDocs(usersQuery);
        return snapshot.docs.map((doc) => doc.data() as User);
    };

    const fetchChats = async () => {
        if (!user) return;
        const chatQuery = query(
            collection(db, "chats"),
            where("participants", "array-contains", user?.uid)
        );

        const snapshot = await getDocs(chatQuery);
        const chatList = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                participants: data.participants || [],
                bookingId: data.bookingId || null,
                updatedAt: data.updatedAt || null,
                ...data,
            };
        });

        if (!user) return;
        const users = await fetchUsersByIds(chatList.map((chat) => chat.participants.find((uid: string) => uid !== user.uid)));
        const chatListWithOtherUserDetails = await Promise.all(chatList.map(async (chat) => {
            const otherParticipantId = chat.participants.find((uid: string) => uid !== user.uid);
            const otherParticipantDetails = users.find((user) => user.uid === otherParticipantId);
            let product: Booking | undefined = undefined;
            if (chat.bookingId) {
                const fetchedBooking = await fetchSelectedBooking(chat.bookingId);
                product = fetchedBooking === null ? undefined : fetchedBooking;
            }
            return {
                ...chat,
                otherParticipantDetails,
                product
            };
        }));
        setChats(chatListWithOtherUserDetails);
    };

    useEffect(() => {
        fetchChats();
    }, []);

    if (!user || !user.isActive) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ marginVertical: 10, fontSize: 14 }}>User is not active. Please sign in.</Text>
                <TouchableOpacity
                    style={{ padding: 10, paddingHorizontal: 30, backgroundColor: COLORS.primary, borderRadius: 20 }}
                    onPress={() => navigation.navigate('SignIn')}
                >
                    <Text style={{ color: COLORS.white, fontSize: 16 }}>Sign In</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchChats().then(() => setRefreshing(false));
    }, []);

    return (
        <View style={{ backgroundColor: COLORS.background, flex: 1 }}>
            <View style={{ height: 60, borderBottomColor: COLORS.card, borderBottomWidth: 1 }}>
                <View
                    style={[GlobalStyleSheet.container, {
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingTop: 8,
                        paddingHorizontal: 5,
                    }]}>
                    <View style={{ flex: 1, alignItems: 'flex-start' }}>
                        {/* left header element */}
                    </View>
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ fontSize: 18, fontWeight: 'bold', color: COLORS.title, textAlign: 'center', marginVertical: 10 }}>Chat</Text>
                    </View>
                    <View style={{ flex: 1, alignItems: 'flex-end' }}>
                        {/* right header element */}
                    </View>
                </View>
            </View>
            <FlatList
                data={chats}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        onPress={() => navigation.navigate("Chat", { chatId: item.id })}
                        style={{ 
                            flexDirection: 'row', 
                            alignItems: 'center', 
                            padding: 16, 
                            marginHorizontal: 12,
                            marginVertical: 6,
                            backgroundColor: COLORS.card,
                            borderRadius: 12,
                            shadowColor: '#000',
                            borderWidth: 1,
                            borderColor: COLORS.placeholder,
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.1,
                            shadowRadius: 4,
                            elevation: 3,
                        }}
                    >
                        <Image 
                            source={{ uri: item.otherParticipantDetails?.profileImageUrl || 'https://via.placeholder.com/50' }} 
                            style={{ 
                                height: 50, 
                                width: 50, 
                                borderRadius: 25,
                                borderWidth: 2,
                                borderColor: COLORS.placeholder,
                            }} 
                        />
                        <View style={{ flex: 1, marginLeft: 12, marginRight: 8 }}>
                            <Text 
                                style={{ fontSize: 16, fontWeight: '600', color: COLORS.title }}
                                numberOfLines={1}
                            >
                                {item.otherParticipantDetails?.firstName} {item.otherParticipantDetails?.lastName}
                            </Text>
                            <Text 
                                style={{ color: COLORS.title, opacity: 0.7, marginTop: 4, fontSize: 14 }}
                                numberOfLines={1}
                            >
                                {item.lastMessage || 'No messages yet'}
                            </Text>
                            <Text style={{ fontSize: 11, color: COLORS.title, opacity: 0.5, marginTop: 2 }}>
                                {item.updatedAt?.toDate().toLocaleString() || 'Unknown date'}
                            </Text>
                        </View>
                        <Image 
                            source={{ uri: item.product?.catalogueService?.imageUrls?.[0] || 'https://via.placeholder.com/60' }} 
                            style={{ 
                                height: 60, 
                                width: 60, 
                                borderRadius: 8,
                                borderWidth: 1,
                                borderColor: COLORS.placeholder,
                            }} 
                        />
                    </TouchableOpacity>
                )}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            />
        </View>
    );
};

export default ChatList;