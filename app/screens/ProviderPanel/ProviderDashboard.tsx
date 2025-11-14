import { useTheme } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    ScrollView,
    StyleSheet,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { COLORS } from '../../constants/theme';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/RootStackParamList';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useUser, User } from '../../context/UserContext';

type ProviderDashboardScreenProps = StackScreenProps<RootStackParamList, 'ProviderDashboard'>;

const ProviderDashboard = ({ navigation }: ProviderDashboardScreenProps) => {
    const theme = useTheme();
    const { colors }: { colors: any } = theme;

    const { user } = useUser();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [lendings, setLendings] = useState<any[]>([]);

    const tips = [
        {
            imageUri: 'https://firebasestorage.googleapis.com/v0/b/settisfy-2c8ca.firebasestorage.app/o/placeholders%2F44129.jpg?alt=media&token=d72b1e02-5d69-43bc-a67d-c5ff3f274823',
            title: 'Help Your Service Stand Out',
            description: 'Learn how to maximize your earnings by updating your registered services profile.',
        },
        {
            imageUri: 'https://firebasestorage.googleapis.com/v0/b/settisfy-2c8ca.firebasestorage.app/o/placeholders%2F5862.jpg?alt=media&token=24c91e8b-8e39-4127-89b0-47f83168d25e',
            title: 'Understand the Pricing Model',
            description: 'Get to know how Settisfy pays you and the fee structure involved.',
        },
    ];

    const fetchData = async () => {
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, [user?.uid]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchData().then(() => setRefreshing(false));
    }, []);

    const handleChat = async (user: User, otherUser: User) => { };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    {user?.isActive ? (
                        <>
                            <Text style={styles.locationText}>{user.currentAddress?.addressName}</Text>
                            <Text style={styles.headerTitle}>Settler Dashboard</Text>
                        </>
                    ) : (
                        <>
                            <Text style={styles.headerTitle}>BorrowNest</Text>
                            <Text style={styles.headerSub}>Borrow & lend items around you.</Text>
                        </>
                    )}
                </View>

                <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
                    <Image
                        source={{ uri: user?.profileImageUrl || 'https://via.placeholder.com/150' }}
                        style={styles.profileImage}
                    />
                </TouchableOpacity>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {/* Earnings Section */}
                <View style={styles.cardRow}>
                    <View style={styles.statCard}>
                        <Ionicons name="wallet-outline" size={32} color={COLORS.primary} />
                        <Text style={styles.statTitle}>Total Earnings</Text>
                        <Text style={styles.statValue}>RMXXX.XX</Text>
                    </View>

                    <View style={styles.statCard}>
                        <Ionicons name="time-outline" size={32} color={COLORS.primary} />
                        <Text style={styles.statTitle}>Pending Balance</Text>
                        <Text style={styles.statValue}>RMXXX.XX</Text>
                    </View>
                </View>
                {/* Inactive Requests Note */}
                <View
                    style={{
                        backgroundColor: colors.card,
                        padding: 16,
                        borderRadius: 16,
                        flexDirection: "row",
                        alignItems: "flex-start",
                        elevation: 4,
                        marginVertical: 16,
                        borderWidth: 1,
                        borderColor: colors.border,
                    }}
                >
                    <Ionicons
                        name="information-circle-outline"
                        size={28}
                        color={COLORS.primary}
                        style={{ marginTop: 2 }}
                    />

                    <View style={{ flex: 1, marginLeft: 14 }}>
                        <Text style={{ fontSize: 16, fontWeight: "700", color: COLORS.primary }}>
                            Payment Status Updates
                        </Text>

                        <Text style={{ fontSize: 14, marginTop: 6, color: "#555", lineHeight: 20 }}>
                            Check your inactive requests to see services marked with a{" "}
                            <Text style={{ fontWeight: "600", color: COLORS.primary }}>PAID</Text> badge — these
                            indicate completed payments.
                        </Text>
                    </View>
                </View>


                {/* Tips Section */}
                <Text style={styles.sectionTitle}>Service Provider Resources</Text>

                {tips.map((tip, index) => (
                    <View key={index} style={styles.tipCard}>
                        <Image source={{ uri: tip.imageUri }} style={styles.tipImage} />
                        <View style={{ flex: 1 }}>
                            <Text style={styles.tipTitle}>{tip.title}</Text>
                            <Text style={styles.tipDescription}>{tip.description}</Text>
                        </View>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 18,
        paddingTop: 50,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    /* Header */
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.title,
    },
    headerSub: {
        fontSize: 15,
        color: COLORS.title,
        marginTop: 2,
    },
    locationText: {
        fontSize: 13,
        color: COLORS.title,
        marginBottom: 4,
    },
    profileImage: {
        width: 58,
        height: 58,
        borderRadius: 60,
    },

    /* Stats Cards */
    cardRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    statCard: {
        backgroundColor: COLORS.card,
        borderRadius: 18,
        paddingVertical: 20,
        paddingHorizontal: 15,
        flex: 1,
        marginHorizontal: 5,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#EFEFEF',
    },
    statTitle: {
        fontSize: 15,
        color: COLORS.title,
        marginTop: 10,
    },
    statValue: {
        fontSize: 17,
        fontWeight: 'bold',
        color: COLORS.title,
        marginTop: 2,
    },

    /* Lending Cards */
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.title,
        marginVertical: 15,
        marginTop: 25,
    },
    emptyText: {
        color: COLORS.title,
        opacity: 0.6,
        fontSize: 14,
        marginBottom: 10,
    },
    lendingCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderWidth: 1,
        borderColor: '#EFEFEF',
        borderRadius: 12,
        backgroundColor: COLORS.card,
        marginBottom: 15,
    },
    lendingImage: {
        height: 55,
        width: 55,
        borderRadius: 10,
        marginRight: 12,
    },
    lendingTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.title,
    },
    lendingBorrower: {
        fontSize: 14,
        color: COLORS.title,
        opacity: 0.8,
    },
    lendingDate: {
        fontSize: 13,
        color: COLORS.title,
        marginTop: 2,
    },
    chatButton: {
        padding: 10,
        borderWidth: 1,
        borderColor: COLORS.blackLight,
        borderRadius: 10,
        marginLeft: 10,
    },

    /* Tips */
    tipCard: {
        flexDirection: 'row',
        backgroundColor: COLORS.card,
        borderWidth: 1,
        borderColor: '#EFEFEF',
        borderRadius: 12,
        padding: 12,
        marginBottom: 15,
    },
    tipImage: {
        width: 90,
        height: 90,
        borderRadius: 10,
        marginRight: 12,
    },
    tipTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.title,
    },
    tipDescription: {
        fontSize: 14,
        color: COLORS.title,
        opacity: 0.8,
        marginTop: 2,
    },
});

export default ProviderDashboard;
