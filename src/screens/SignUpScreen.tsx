import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import auth from '@react-native-firebase/auth';

export default function SignUpScreen({ navigation }: any) {

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const signUpTestFn = () => {
        auth().createUserWithEmailAndPassword(email, password).then(() => {
            Alert.alert("User created!. Please sign in.");
            navigation.navigate('SignIn');
        }).catch((error: any) => {
            Alert.alert("Error", error.message);
        });
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>📝 Sign Up</Text>
            <TextInput style={styles.input} placeholder="Name" onChangeText={setName} />
            <TextInput style={styles.input} placeholder="Email"  onChangeText={setEmail} />
            <TextInput style={styles.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
            <TouchableOpacity onPress={signUpTestFn} style={styles.button}>
                <Text style={styles.buttonText}>Create Account</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
                <Text style={styles.linkText}>Already have an account? Sign In</Text>
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
