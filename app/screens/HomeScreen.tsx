import React, { use, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import firestore from '@react-native-firebase/firestore';

export default function HomeScreen({ navigation }: any) {

    const [catalogue, setCatalogue] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const getData = async () => {
        const catalogueList = await firestore().collection('catalogue').get();
        setCatalogue(catalogueList.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }

    useEffect(() => {
        getData()
    }, []);
    
    return (
        <View style={styles.container}>
            <Text style={styles.title}>{catalogue[1]?.title}</Text>
            <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.navigate('SignIn')}>
                <Text style={styles.buttonText}>Go to Sign In</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.navigate('SignUp')}>
                <Text style={styles.buttonText}>Go to Sign Up</Text>
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
});
