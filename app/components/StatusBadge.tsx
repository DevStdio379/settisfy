import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { getStatusBadgeClass, getStatusLabel } from '../constants/status';

export type BookingStatus =
    | 0.1
    | 0
    | 0.2
    | 1
    | 2
    | 3
    | 4
    | 5
    | 6
    | 7
    | 8
    | 8.1
    | 8.2
    | 9
    | 9.1
    | 9.2
    | 10
    | 11
    | 12
    | number


interface Props {
    status: BookingStatus
}

export default function StatusBadge({ status }: Props) {
    const badgeClass = getStatusBadgeClass(status);
    const label = getStatusLabel(status);

    return (
        <View style={[styles.badge, badgeStyles[badgeClass] || badgeStyles.default]}>
            <Text style={styles.text}>{label}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    text: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 12,
    }
});

// Map your Bootstrap-like classes to RN styles
const badgeStyles: any = {
    'bg-warning': { backgroundColor: '#f0ad4e' },
    'bg-secondary': { backgroundColor: '#6c757d' },
    'bg-success': { backgroundColor: '#28a745' },
    'bg-danger': { backgroundColor: '#dc3545' },
    'bg-light text-dark': { backgroundColor: '#f8f9fa' },
    default: { backgroundColor: '#999' }
};
