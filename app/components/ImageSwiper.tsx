import React, { useState } from "react";
import { View, Image, TouchableOpacity, Platform, Text } from "react-native";
import Swiper from "react-native-swiper";
import Modal from "react-native-modal";
import ImageViewer from "react-native-image-zoom-viewer";
import Ionicons from "@react-native-vector-icons/ionicons";
import { COLORS } from "./../constants/theme";

export default function ImageSwiper({ imageUrls = [] }: { imageUrls?: string[] }) {
  const [isPreviewVisible, setPreviewVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const isPdf = (uri: string) => uri.toLowerCase().endsWith(".pdf");

  return (
    <View style={{ height: '100%' }}>
      {/* Swiper View */}
      <Swiper
        dotColor={COLORS.primaryLight}
        activeDotColor={COLORS.primary}
        autoplay={false}
        showsPagination={Platform.OS === "android"}
        loop={false}
      >
        {imageUrls.map((uri, i) => (
          <TouchableOpacity
            key={i}
            activeOpacity={0.9}
            onPress={() => {
              setCurrentIndex(i);
              setPreviewVisible(true);
            }}
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            {isPdf(uri) ? (
              <View
                style={{
                  width: "90%",
                  height: "90%",
                  backgroundColor: COLORS.card,
                  borderRadius: 10,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Ionicons name="document-text-outline" size={64} color={COLORS.blackLight} />
                <Text style={{ marginTop: 6, color: COLORS.blackLight }}>
                  {uri.split("/").pop()}
                </Text>
              </View>
            ) : (
              <Image
                source={{ uri }}
                style={{
                  width: "90%",
                  height: "90%",
                  borderRadius: 12,
                }}
                resizeMode="cover"
              />
            )}
          </TouchableOpacity>
        ))}
      </Swiper>

      {/* Full-Screen Preview Modal */}
      <Modal
        isVisible={isPreviewVisible}
        onBackdropPress={() => setPreviewVisible(false)}
        onBackButtonPress={() => setPreviewVisible(false)}
        style={{ margin: 0 }}
      >
        <View style={{ flex: 1, backgroundColor: "black" }}>
          {/* PDF */}
          {isPdf(imageUrls[currentIndex]) ? (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Ionicons name="document-text-outline" size={120} color="white" />
              <Text style={{ marginTop: 10, color: "white", fontSize: 18 }}>
                {imageUrls[currentIndex].split("/").pop()}
              </Text>

              <TouchableOpacity
                onPress={() => setPreviewVisible(false)}
                style={{
                  position: "absolute",
                  top: 50,
                  right: 20,
                }}
              >
                <Ionicons name="close" size={35} color="white" />
              </TouchableOpacity>
            </View>
          ) : (
            <ImageViewer
              imageUrls={imageUrls.map((u) => ({ url: u }))}
              index={currentIndex}
              enableSwipeDown
              onSwipeDown={() => setPreviewVisible(false)}
              onCancel={() => setPreviewVisible(false)}
              renderIndicator={() => <></>}
              backgroundColor="black"
            />
          )}
        </View>
      </Modal>
    </View>
  );
}
