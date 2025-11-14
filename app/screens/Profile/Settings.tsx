import React, { useEffect, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, Platform } from 'react-native'
import { useTheme } from '@react-navigation/native'
import { COLORS } from '../../constants/theme'
import Ionicons from '@react-native-vector-icons/ionicons'
import { StackScreenProps } from '@react-navigation/stack'
import { RootStackParamList } from '../../navigation/RootStackParamList'

import {
    PERMISSIONS,
    request,
    check,
    openSettings,
    RESULTS,
    PermissionStatus,
} from 'react-native-permissions'

import messaging from '@react-native-firebase/messaging'

type Props = StackScreenProps<RootStackParamList, 'Settings'>

const Settings = ({ navigation }: Props) => {
    const theme = useTheme()
    const { colors } = theme

    const [cameraStatus, setCameraStatus] = useState<PermissionStatus | 'not-determined'>('not-determined')
    const [photoStatus, setPhotoStatus] = useState<PermissionStatus | 'not-determined'>('not-determined')
    const [locationStatus, setLocationStatus] = useState<PermissionStatus | 'not-determined'>('not-determined')
    const [notificationStatus, setNotificationStatus] = useState<'authorized' | 'denied' | 'not-determined'>('not-determined')

    const getPermissionLabel = (status: PermissionStatus | 'not-determined') => {
        switch (status) {
            case RESULTS.GRANTED:
                return 'Granted'
            case RESULTS.DENIED:
                return 'Denied'
            case RESULTS.BLOCKED:
                return 'Blocked'
            case RESULTS.LIMITED:
                return 'Limited'
            case RESULTS.UNAVAILABLE:
                return 'Not Available'
            default:
                return 'Not Determined'
        }
    }

    const getNotificationLabel = () => {
        switch (notificationStatus) {
            case 'authorized':
                return 'Granted'
            case 'denied':
                return 'Denied / Blocked'
            default:
                return 'Not Determined'
        }
    }

    const loadStatuses = async () => {
        const cam = await check(Platform.OS === 'ios' ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.ANDROID.CAMERA)
        const photos = await check(
            Platform.OS === 'ios' ? PERMISSIONS.IOS.PHOTO_LIBRARY : PERMISSIONS.ANDROID.READ_MEDIA_IMAGES
        )
        const loc = await check(
            Platform.OS === 'ios'
                ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
                : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
        )

        setCameraStatus(cam)
        setPhotoStatus(photos)
        setLocationStatus(loc)

        // Notifications
        const authStatus = await messaging().hasPermission()
        setNotificationStatus(
            authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
                authStatus === messaging.AuthorizationStatus.PROVISIONAL
                ? 'authorized'
                : authStatus === messaging.AuthorizationStatus.DENIED
                    ? 'denied'
                    : 'not-determined'
        )
    }

    const requestPermission = async (type: 'camera' | 'photo' | 'location' | 'notifications') => {
        let result: PermissionStatus

        switch (type) {
            case 'camera':
                result = await request(Platform.OS === 'ios' ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.ANDROID.CAMERA)
                setCameraStatus(result)
                break

            case 'photo':
                result = await request(
                    Platform.OS === 'ios' ? PERMISSIONS.IOS.PHOTO_LIBRARY : PERMISSIONS.ANDROID.READ_MEDIA_IMAGES
                )
                setPhotoStatus(result)
                break

            case 'location':
                result = await request(
                    Platform.OS === 'ios'
                        ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
                        : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
                )
                setLocationStatus(result)
                break

            case 'notifications':
                const notifStatus = await messaging().requestPermission()
                const enabled =
                    notifStatus === messaging.AuthorizationStatus.AUTHORIZED ||
                    notifStatus === messaging.AuthorizationStatus.PROVISIONAL

                setNotificationStatus(enabled ? 'authorized' : 'denied')
                break
        }
    }

    useEffect(() => {
        loadStatuses()
    }, [])

    const PermissionRow = ({
        title,
        description,
        status,
        onPress,
    }: {
        title: string
        description: string
        status: string
        onPress: () => void
    }) => (
        <View
            style={{
                padding: 15,
                marginVertical: 10,
                borderRadius: 12,
                backgroundColor: colors.card,
            }}
        >
            <View style={{ marginBottom: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>{title}</Text>
                    <View
                        style={{
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            borderRadius: 16,
                            backgroundColor: status === 'Granted' ? '#E8F5E9' : status === 'Denied' || status === 'Blocked' ? '#FFEBEE' : '#FFF3E0',
                        }}
                    >
                        <Text
                            style={{
                                fontSize: 12,
                                fontWeight: '600',
                                color: status === 'Granted' ? '#2E7D32' : status === 'Denied' || status === 'Blocked' ? '#C62828' : '#E65100',
                            }}
                        >
                            {status}
                        </Text>
                    </View>
                </View>
                <Text style={{ fontSize: 13, color: COLORS.black, marginTop: 4 }}>{description}</Text>
            </View>
        </View>
    )

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            {/* HEADER */}
            <View
                style={{
                    height: 60,
                    borderBottomColor: COLORS.card,
                    borderBottomWidth: 1,
                    backgroundColor: COLORS.background,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingHorizontal: 10,
                }}
            >
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={{ height: 40, width: 40, alignItems: 'center', justifyContent: 'center' }}
                >
                    <Ionicons name="chevron-back-outline" size={28} color={COLORS.black} />
                </TouchableOpacity>

                <Text style={{ fontSize: 18, fontWeight: 'bold', color: COLORS.title }}>Permission Settings</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={{ padding: 20 }}>
                {/* Top Notice */}
                <View
                    style={{
                        backgroundColor: COLORS.primary,
                        padding: 15,
                        borderRadius: 12,
                        marginBottom: 20,
                    }}
                >
                    <Text style={{ color: COLORS.white, fontWeight: '700', fontSize: 16 }}>Important</Text>
                    <Text style={{ color: COLORS.white, marginTop: 6 }}>
                        It is highly recommended to allow all permissions below to ensure the app works fully.
                    </Text>
                </View>

                <PermissionRow
                    title="Camera Access"
                    description="Needed for taking product photos and verifying your identity when listing items."
                    status={getPermissionLabel(cameraStatus)}
                    onPress={() => requestPermission('camera')}
                />

                <PermissionRow
                    title="Photo Library Access"
                    description="Allows you to upload photos from your gallery when creating or updating listings."
                    status={getPermissionLabel(photoStatus)}
                    onPress={() => requestPermission('photo')}
                />

                <PermissionRow
                    title="Location Access"
                    description="Used to show relevant items near you and ensure accurate pickup locations."
                    status={getPermissionLabel(locationStatus)}
                    onPress={() => requestPermission('location')}
                />

                <PermissionRow
                    title="Notifications"
                    description="Required for booking updates, chat messages, pickup reminders, and safety alerts."
                    status={getNotificationLabel()}
                    onPress={() => requestPermission('notifications')}
                />

                {/* Open settings */}
                <TouchableOpacity
                    onPress={() => openSettings()}
                    style={{
                        marginTop: 30,
                        padding: 15,
                        borderRadius: 12,
                        backgroundColor: COLORS.primary,
                        alignItems: 'center',
                    }}
                >
                    <Text style={{ color: '#fff', fontWeight: '600' }}>Open App Settings</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    )
}

export default Settings
