import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  ImageBackground,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Speech from "expo-speech";
import { useLanguage } from "../hooks/useLanguage";

const LanguageScreen = ({ navigation }) => {
  const textInputRef = useRef(null);
  const [keyInput, setKeyInput] = useState("");

  const {
    selected: selectedLanguage,
    select: handleLanguageSelect,
    handleTextEntry,
    playFullSequence: replayVoice,
    languages,
    isSpeaking,
    isAnnouncementRunningRef,
  } = useLanguage();

  const handleTextInputChange = (val) => {
    setKeyInput(val);
    handleTextEntry(val);
    setTimeout(() => setKeyInput(""), 500);
  };

  useEffect(() => {
    if (textInputRef.current) textInputRef.current.focus();
  }, []);

  return (
    <ImageBackground
      source={require("../assets/bg.jpg")}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(223,239,192,0.6)",
        }}
      />

      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <TextInput
          ref={textInputRef}
          style={{ position: "absolute", width: 0, height: 0, opacity: 0 }}
          keyboardType="number-pad"
          value={keyInput}
          onChangeText={handleTextInputChange}
          maxLength={1}
          autoFocus
          onBlur={() => textInputRef.current?.focus()}
        />

        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            padding: 20,
            justifyContent: "center",
          }}
        >
          <View style={{ alignItems: "center", marginBottom: 20 }}>
            <Image
              source={require("../assets/main-icon.png")}
              style={{ width: 180, height: 180 }}
              resizeMode="contain"
            />
            <Text
              style={{
                fontSize: 28,
                fontWeight: "900",
                color: "#1b5e20",
                marginTop: 10,
                textAlign: "center",
              }}
            >
              SELECT LANGUAGE
            </Text>
          </View>

          <TouchableOpacity
            onPress={replayVoice}
            style={{
              alignSelf: "center",
              backgroundColor: isSpeaking ? "#95c68f" : "#66a85c",
              paddingVertical: 14,
              paddingHorizontal: 40,
              borderRadius: 40,
              borderWidth: 3,
              borderColor: "#2e7d32",
              marginBottom: 25,
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>
              {isSpeaking ? " SPEAKING..." : "🔊 REPLAY VOICE"}
            </Text>
          </TouchableOpacity>

          <Text
            style={{
              textAlign: "center",
              fontSize: 18,
              fontWeight: "600",
              marginBottom: 20,
              color: "#1b5e20",
            }}
          >
            Press 1, 2, or 3:
          </Text>

          {languages.map((language) => (
            <TouchableOpacity
              key={language.code}
              onPress={() => handleLanguageSelect(language.code)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor:
                  selectedLanguage === language.code
                    ? "rgba(137, 195, 43, 0.6)"
                    : "rgba(226, 247, 183, 0.6)",
                borderRadius: 12,
                padding: 15,
                marginBottom: 12,
                borderWidth: selectedLanguage === language.code ? 3 : 2,
                borderColor:
                  selectedLanguage === language.code ? "#0a6d0d" : "#129116",
              }}
            >
              <View
                style={{
                  width: 45,
                  height: 45,
                  borderRadius: 25,
                  backgroundColor: "#328c09",
                  justifyContent: "center",
                  alignItems: "center",
                  marginRight: 12,
                }}
              >
                <Text style={{ color: "white", fontWeight: "bold" }}>
                  {language.key}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{ fontSize: 18, fontWeight: "600", color: "#1b5e20" }}
                >
                  {language.name}
                </Text>
                <Text style={{ fontSize: 14, color: "#666" }}>
                  {language.voiceText}
                </Text>
              </View>
              {selectedLanguage === language.code && (
                <Ionicons name="checkmark-circle" size={28} color="#4caf50" />
              )}
            </TouchableOpacity>
          ))}

          {selectedLanguage && (
            <View
              style={{
                backgroundColor: "rgba(226, 247, 183, 0.6)",
                padding: 25,
                borderRadius: 20,
                borderWidth: 3,
                borderColor: "#1b5e20",
                marginTop: 20,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 20,
                }}
              >
                <Ionicons name="checkmark-circle" size={30} color="#2e7d32" />
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "bold",
                    color: "#1b5e20",
                    marginLeft: 10,
                    flex: 1,
                  }}
                >
                  {
                    languages.find((l) => l.code === selectedLanguage)
                      ?.selectedMessage
                  }
                </Text>
              </View>
              <TouchableOpacity
                onPress={async () => {
                  isAnnouncementRunningRef.current = false;
                  await Speech.stop();
                  navigation.replace("Login");
                }}
                style={{ borderRadius: 15, overflow: "hidden", elevation: 5 }}
              >
                <LinearGradient
                  colors={["#ff9800", "#f57c00"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{
                    paddingVertical: 18,
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      color: "white",
                      fontSize: 18,
                      fontWeight: "bold",
                      marginRight: 10,
                    }}
                  >
                    {
                      languages.find((l) => l.code === selectedLanguage)
                        ?.continueButtonText
                    }
                  </Text>
                  <Ionicons name="arrow-forward" size={22} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
};

export default LanguageScreen;
