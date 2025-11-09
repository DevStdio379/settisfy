import React, { useState } from 'react'
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, Platform, Linking } from 'react-native'
import { useTheme } from '@react-navigation/native';
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import { COLORS, SIZES } from '../../constants/theme';
import { useUser } from '../../context/UserContext';
import Ionicons from '@react-native-vector-icons/ionicons';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/RootStackParamList';
import AsyncStorage from '@react-native-async-storage/async-storage';

type AccountDeletionScreenProps = StackScreenProps<RootStackParamList, 'AccountDeletion'>;

const AccountDeletion = ({ navigation }: AccountDeletionScreenProps) => {

    const theme = useTheme();
    const { colors }: { colors: any } = theme;
    const { user, deleteUserAccount } = useUser();
    const [loading, setLoading] = useState(false);

    return (
        <View style={{ backgroundColor: colors.background, flex: 1 }}>
            <View>
                <View style={{ zIndex: 1, height: 60, backgroundColor: COLORS.background, borderBottomColor: COLORS.card, borderBottomWidth: 1 }}>
                    <View style={{ height: '100%', backgroundColor: COLORS.background, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, paddingHorizontal: 10 }}>
                        <View style={{ flex: 1, alignItems: 'flex-start' }}>
                            <TouchableOpacity
                                onPress={() => navigation.goBack()}
                                style={{
                                    height: 40,
                                    width: 40,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <Ionicons size={30} color={COLORS.black} name='chevron-back-outline' />
                            </TouchableOpacity>
                        </View>
                        <View style={{ flex: 1, alignItems: 'center' }}>
                            <Text style={{ width: 200, fontSize: 18, fontWeight: 'bold', color: COLORS.title, textAlign: 'center' }}>Account Deletion</Text>
                        </View>
                        <View style={{ flex: 1, alignItems: 'flex-end' }}>
                        </View>
                    </View>
                </View>
            </View>
            <ScrollView contentContainerStyle={{ width: SIZES.width, marginBottom: 50, }}>
                <View style={{ marginTop: 50, paddingHorizontal: 15 }}>
                    <Text style={{ fontSize: 14, color: colors.title, marginBottom: 20, lineHeight: 24 }}>
                        We're sorry to see you go. Deleting your account is a permanent action and cannot be undone. Please be aware of the following before proceeding:
                    </Text>
                    <View style={{ marginBottom: 15 }}>
                        <Text style={{ fontSize: 14, color: colors.title, fontWeight: 'bold', marginBottom: 5 }}>Data Loss:</Text>
                        <Text style={{ fontSize: 14, color: colors.title, lineHeight: 22 }}>
                            All your personal data, including profile information, preferences, and history, will be permanently deleted from our servers.
                        </Text>
                    </View>
                    <View style={{ marginBottom: 15 }}>
                        <Text style={{ fontSize: 14, color: colors.title, fontWeight: 'bold', marginBottom: 5 }}>Booked Service Status:</Text>
                        <Text style={{ fontSize: 14, color: colors.title, lineHeight: 22 }}>
                            Your active booking will be cancelled upon account deletion. Please ensure to complete any ongoing services before proceeding.
                        </Text>
                    </View>
                    <View style={{ marginBottom: 15 }}>
                        <Text style={{ fontSize: 14, color: colors.title, fontWeight: 'bold', marginBottom: 5 }}>Support:</Text>
                        <Text style={{ fontSize: 14, color: colors.title, lineHeight: 22 }}>
                            If you have any questions or need assistance, please contact our support team at {''}
                            <Text style={{ color: COLORS.primary }} onPress={() => {
                                Platform.OS === 'ios' || Platform.OS === 'android'
                                    ? Linking.openURL('mailto: support.settisfy@gmail.com')
                                    : Linking.openURL('mailto:support.settisfy@gmail.com');
                            }}>
                                support.settisfy@gmail.com
                            </Text>
                        </Text>
                    </View>
                    <TouchableOpacity
                        disabled={loading}
                        style={{ marginTop: 30, backgroundColor: COLORS.danger, paddingVertical: 15, borderRadius: 10, alignItems: 'center', justifyContent: 'center', opacity: loading ? 0.7 : 1 }}
                        onPress={async () => {
                            setLoading(true);
                            await deleteUserAccount(user!.uid);
                            await AsyncStorage.removeItem('userUID');
                            navigation.reset({
                                index: 0,
                                routes: [{ name: 'SignIn' }],
                            });
                        }}
                    >
                        <Text style={{ color: COLORS.white, fontSize: 16, fontWeight: 'bold' }}>{loading ? 'Deleting...' : 'Delete My Account'}</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    )
}

export default AccountDeletion