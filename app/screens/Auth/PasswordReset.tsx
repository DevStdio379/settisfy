import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert
} from 'react-native';
import React, { useState } from 'react';
import { COLORS, SIZES } from '../../constants/theme';
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import { useTheme } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/RootStackParamList';
import Ionicons from '@react-native-vector-icons/ionicons';
import Input from '../../components/Input/Input';
import auth from '@react-native-firebase/auth';

type PasswordResetProps = StackScreenProps<RootStackParamList, 'PasswordReset'>;

const PasswordReset = ({ navigation }: PasswordResetProps) => {

    const theme = useTheme();
    const { colors } = theme;

    const [email, setEmail] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [loading, setLoading] = useState(false);

    const handlePasswordReset = async () => {
        if (!email.trim()) {
            Alert.alert("Error", "Please enter your email.");
            return;
        }

        setLoading(true);

        try {
            // 🔥 React Native Firebase
            await auth().sendPasswordResetEmail(email.trim());

            Alert.alert(
                "Success!",
                "A password reset email has been sent. Please check your inbox."
            );

            navigation.goBack();
        } catch (error: any) {
            switch (error.code) {
                case "auth/invalid-email":
                    Alert.alert("Error", "The email address is invalid.");
                    break;
                case "auth/user-not-found":
                    Alert.alert("Error", "No account is registered with this email.");
                    break;
                default:
                    Alert.alert("Error", "Something went wrong. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={{ backgroundColor: COLORS.background }} showsVerticalScrollIndicator={false}>
            <View style={[GlobalStyleSheet.container, { paddingHorizontal: 30, paddingTop: 0 }]}>

                {/* Close Button */}
                <TouchableOpacity
                    style={{
                        position: 'absolute',
                        top: 55,
                        right: 20,
                        zIndex: 10,
                        padding: 8,
                    }}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="close" size={28} color={COLORS.title} />
                </TouchableOpacity>

                <View style={{ paddingTop: 80, paddingBottom: 300 }}>
                    {/* Title */}
                    <Text style={{
                        color: COLORS.title,
                        fontWeight: 'bold',
                        fontSize: 30,
                        marginBottom: 10
                    }}>
                        Reset Password
                    </Text>

                    <Text style={{
                        fontSize: 15,
                        color: "#8A8A8A",
                        marginBottom: 25,
                        lineHeight: 22
                    }}>
                        Enter your email address and we’ll send you instructions to reset your password.
                    </Text>

                    {/* Email Input */}
                    <Text style={{ fontSize: 14, color: '#8A8A8A' }}>Email</Text>

                    <View style={{ marginBottom: 20 }}>
                        <Input
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            onChangeText={setEmail}
                            value={email}
                            isFocused={isFocused}
                        />
                    </View>

                    {/* Submit Button */}
                    <TouchableOpacity
                        onPress={handlePasswordReset}
                        style={{
                            backgroundColor: COLORS.primary,
                            borderRadius: 20,
                            padding: 15,
                            alignItems: 'center'
                        }}
                    >
                        <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
                            Send Reset Link
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Loading Overlay */}
            {loading && (
                <View style={[GlobalStyleSheet.loadingOverlay, { height: SIZES.height }]}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            )}
        </ScrollView>
    );
};

export default PasswordReset;
