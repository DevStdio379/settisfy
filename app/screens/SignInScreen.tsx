import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import auth from '@react-native-firebase/auth';

export default function SignInScreen({ navigation }: any) {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const signInTestFn = () => {
        auth().signInWithEmailAndPassword(email, password).then(() => {
            Alert.alert("Success", "User signed in!");
            navigation.navigate('Home');

        }).catch((error: any) => {
            Alert.alert("Error", error.message);
        });
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>🔐 Sign In</Text>
            <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} />
            <TextInput style={styles.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
            <TouchableOpacity onPress={signInTestFn} style={styles.button}>
                <Text style={styles.buttonText}>Sign In</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 28,
        fontWeight: '600',
        marginBottom: 30,
    },
    input: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        padding: 12,
        marginBottom: 15,
    },
    button: {
        backgroundColor: '#4A90E2',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 10,
        marginVertical: 5,
    },
    buttonText: {
        color: '#fff',
        fontWeight: '500',
    },
    linkText: {
        marginTop: 10,
        color: '#4A90E2',
    },
});
