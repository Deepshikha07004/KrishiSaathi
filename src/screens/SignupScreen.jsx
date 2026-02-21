import React, { useState, useEffect, useContext } from "react";
import {
  Text,
  ScrollView,
  StatusBar,
  Image,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  ImageBackground,
  Keyboard,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppContext } from "../context/AppContext";

const SignupScreen = ({ navigation }) => {
  const { setUser, t, convertDigits } = useContext(AppContext);
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validatePhone = (num) => {
    const clean = num.replace(/\D/g, "");
    if (clean.length !== 10) return t.invalidPhone;
    if (!["6", "7", "8", "9"].includes(clean.charAt(0))) return t.invalidPhone;
    return "";
  };

  const handleSignup = async () => {
    Keyboard.dismiss();
    if (!fullName.trim()) return Alert.alert("Error", t.fullName);
    const err = validatePhone(phoneNumber);
    if (err) return Alert.alert("Error", err);

    setIsLoading(true);
    try {
      const userData = { phone: phoneNumber, name: fullName };
      setUser(userData);
      await AsyncStorage.setItem("user", JSON.stringify(userData));
      navigation.replace("Location");
    } catch (e) {
      Alert.alert("Error", "Signup failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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
            backgroundColor: "rgba(223, 239, 192, 0.6)",
          }}
        />
        <SafeAreaView style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, paddingBottom: 30 }}
            showsVerticalScrollIndicator={false}
          >
            <View style={{ alignItems: "center", marginTop: 30 }}>
              <Image
                source={require("../assets/main-icon.png")}
                style={{ height: 150, width: 150, resizeMode: "contain" }}
              />
            </View>
            <View style={{ paddingHorizontal: 30, flex: 1 }}>
              <Text
                style={{
                  color: "#1b5e20",
                  fontSize: 28,
                  fontWeight: "900",
                  textAlign: "center",
                  marginTop: 10,
                }}
              >
                {t.createAccount}
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: "#19630f",
                  textAlign: "center",
                  marginBottom: 25,
                  opacity: 0.8,
                }}
              >
                {t.signupDetails}
              </Text>

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  borderWidth: 1.5,
                  borderColor: "#a5d6a7",
                  borderRadius: 12,
                  backgroundColor: "rgba(255,255,255,0.9)",
                  marginBottom: 15,
                  paddingHorizontal: 15,
                }}
              >
                <Ionicons
                  name="person"
                  size={20}
                  color="#156b18"
                  style={{ marginRight: 10 }}
                />
                <TextInput
                  placeholder={t.fullName}
                  value={fullName}
                  onChangeText={(v) =>
                    setFullName(v.replace(/[^a-zA-Z\s]/g, ""))
                  }
                  style={{ flex: 1, paddingVertical: 15, fontSize: 16 }}
                />
              </View>

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  borderWidth: 1.5,
                  borderColor: phoneError ? "#f44" : "#a5d6a7",
                  borderRadius: 12,
                  backgroundColor: "rgba(255,255,255,0.9)",
                  paddingHorizontal: 15,
                }}
              >
                <Ionicons
                  name="call"
                  size={20}
                  color="#156b18"
                  style={{ marginRight: 10 }}
                />
                <Text
                  style={{
                    marginRight: 5,
                    color: "#1b5e20",
                    fontWeight: "700",
                  }}
                >
                  {convertDigits("+91")}
                </Text>
                <TextInput
                  placeholder={t.phoneNumber}
                  keyboardType="number-pad"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  maxLength={10}
                  style={{ flex: 1, paddingVertical: 15, fontSize: 16 }}
                />
              </View>
              {phoneError ? (
                <Text style={{ color: "#ff4444", fontSize: 12, marginTop: 5 }}>
                  {phoneError}
                </Text>
              ) : null}

              <TouchableOpacity
                onPress={handleSignup}
                style={{ marginTop: 30, borderRadius: 15, overflow: "hidden" }}
              >
                <LinearGradient
                  colors={["#ff9800", "#f57c00"]}
                  style={{ paddingVertical: 18, alignItems: "center" }}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text
                      style={{
                        color: "#fff",
                        fontWeight: "bold",
                        fontSize: 18,
                      }}
                    >
                      {t.signup}
                    </Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => navigation.navigate("Login")}
                style={{ marginTop: 25, alignItems: "center" }}
              >
                <Text style={{ color: "#d36b03", fontWeight: "700" }}>
                  {t.alreadyHaveAccount}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </ImageBackground>
    </TouchableWithoutFeedback>
  );
};

export default SignupScreen;
