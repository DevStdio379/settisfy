// EvidenceCard.tsx
import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import Modal from 'react-native-modal';
import ImageViewer from 'react-native-image-zoom-viewer';

type EvidenceCardProps = {
    title?: string;
    imageUrls?: string[];
    remark?: string;
};

export default function EvidenceCard({
    title = 'Evidence',
    imageUrls = [],
    remark = '',
}: EvidenceCardProps) {
    const [isPreviewVisible, setPreviewVisible] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    const handleOpenPreview = (index: number) => {
        setCurrentIndex(index);
        setPreviewVisible(true);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{title}</Text>

            {imageUrls?.length ? (
                <View style={styles.imageRow}>
                    {imageUrls.map((uri, i) => (
                        <TouchableOpacity key={i} onPress={() => handleOpenPreview(i)}>
                            <Image source={{ uri }} style={styles.thumb} />
                        </TouchableOpacity>
                    ))}
                </View>
            ) : (
                <Text style={styles.subtext}>No images</Text>
            )}

            <Text style={styles.subtext}>
                {remark?.trim() ? remark : 'No remarks provided.'}
            </Text>

            {/* Full-screen Preview Modal */}
            <Modal
                isVisible={isPreviewVisible}
                onBackdropPress={() => setPreviewVisible(false)}
                onBackButtonPress={() => setPreviewVisible(false)}
                style={{ margin: 0 }}
            >
                <View style={{ flex: 1, backgroundColor: 'black' }}>
                    <ImageViewer
                        imageUrls={imageUrls.map((url) => ({ url }))}
                        index={currentIndex}
                        enableSwipeDown
                        onSwipeDown={() => setPreviewVisible(false)}
                        onCancel={() => setPreviewVisible(false)}
                        renderIndicator={() => <></>}
                        backgroundColor="black"
                    />
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { marginTop: 6 },
    title: { fontWeight: '600', marginBottom: 4 },
    imageRow: { flexDirection: 'row', marginVertical: 4 },
    thumb: {
        width: 72,
        height: 54,
        borderRadius: 6,
        marginRight: 6,
        backgroundColor: '#f0f0f0',
    },
    subtext: { color: '#666', fontSize: 13 },
});
