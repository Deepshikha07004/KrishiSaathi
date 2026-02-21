import React, { useState, useContext } from "react";
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
  ActivityIndicator
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppContext } from "../context/AppContext";

const LoginScreen = ({ navigation }) => {
  const { setUser, t, convertDigits } = useContext(AppContext);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validatePhoneNumber = (number) => {
    const cleanedNumber = number.replace(/\D/g, "");
    if (cleanedNumber.length !== 10) return t.invalidPhone || "Phone number must be 10 digits";
    if (!["6", "7", "8", "9"].includes(cleanedNumber.charAt(0))) return t.invalidPhone || "Invalid phone number";
    return "";
  };

  const handlePhoneChange = (text) => {
    const numericText = text.replace(/\D/g, "");
    if (numericText.length <= 10) {
      setPhoneNumber(numericText);
      if (numericText.length === 10) {
        setPhoneError(validatePhoneNumber(numericText));
      } else if (numericText.length > 0) {
        setPhoneError(t.invalidPhone || "Phone number must be 10 digits");
      } else {
        setPhoneError("");
      }
    }
  };

  const handleLogin = async () => {
    Keyboard.dismiss();
    const error = validatePhoneNumber(phoneNumber);
    if (error) {
      Alert.alert("Invalid Phone", error);
      return;
    }

    setIsLoading(true);
    try {
      // Simulate login and store user data
      const userData = { phone: phoneNumber, name: "Kisan Bhai" };
      setUser(userData);
      await AsyncStorage.setItem('user', JSON.stringify(userData));

      navigation.replace("Location");
    } catch (e) {
      Alert.alert("Error", "Login failed. Please try again.");
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
          <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

          <ScrollView
            contentContainerStyle={{ paddingBottom: 30, flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={{ alignItems: "center", marginTop: 50 }}>
              <Image
                source={require("../assets/main-icon.png")}
                style={{ height: 190, width: 190, marginBottom: -25 }}
              />
            </View>

            <Text style={{ fontSize: 30, color: "#1b5e20", textAlign: "center", fontWeight: "800", marginTop: 40, marginBottom: 8 }}>
              {t.loginTitle}
            </Text>

            <Text style={{ fontSize: 15, color: "#19630f", textAlign: "center", fontWeight: "700", marginBottom: 40 }}>
              {t.welcome}
            </Text>

            <View style={{ paddingHorizontal: 30 }}>
              <View style={{ flexDirection: "row", alignItems: "center", borderWidth: 1.5, borderColor: phoneError ? "#ff4444" : "#a5d6a7", borderRadius: 12, backgroundColor: "rgba(255, 255, 255, 0.95)", marginBottom: -5 }}>
                <Ionicons name="call" size={22} color={phoneError ? "#ff4444" : "#156b18"} style={{ marginLeft: 15, marginRight: 12 }} />
                <TextInput
                  placeholder={t.phoneNumber}
                  placeholderTextColor="#666"
                  keyboardType="phone-pad"
                  value={phoneNumber}
                  onChangeText={handlePhoneChange}
                  maxLength={10}
                  style={{ flex: 1, paddingVertical: 16, fontSize: 16, color: phoneError ? "#ff4444" : "#000" }}
                />
                {phoneNumber.length > 0 && (
                  <Text style={{ marginRight: 15, color: phoneError ? "#ff4444" : "#4caf50", fontWeight: "bold", fontSize: 14 }}>
                    {convertDigits(phoneNumber.length)}/{convertDigits(10)}
                  </Text>
                )}
              </View>

              {phoneError ? (
                <View style={{ flexDirection: "row", alignItems: "center", marginTop: 8, marginBottom: 25, marginLeft: 5 }}>
                  <Ionicons name="alert-circle" size={16} color="#ff4444" />
                  <Text style={{ color: "#ff4444", fontSize: 13, marginLeft: 6, flex: 1 }}>{phoneError}</Text>
                </View>
              ) : phoneNumber.length === 10 ? (
                <View style={{ flexDirection: "row", alignItems: "center", marginTop: 8, marginBottom: 30, marginLeft: 5 }}>
                  <Ionicons name="checkmark-circle" size={16} color="#4caf50" />
                  <Text style={{ color: "#4caf50", fontSize: 13, marginLeft: 6, flex: 1 }}>Valid phone number ✓</Text>
                </View>
              ) : (
                <View style={{ marginBottom: 30, marginTop: 10 }} />
              )}

              <TouchableOpacity onPress={handleLogin} disabled={isLoading} style={{ borderRadius: 14, overflow: "hidden", elevation: 5, marginBottom: 20 }}>
                <LinearGradient colors={["#ff9800", "#f57c00"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ paddingVertical: 18, flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
                  {isLoading ? <ActivityIndicator color="#fff" /> : (
                    <>
                      <Ionicons name="arrow-forward" size={24} color="#fff" style={{ marginRight: 10 }} />
                      <Text style={{ color: "#fff", textAlign: "center", fontSize: 18, fontWeight: "bold" }}>{t.login}</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: 25, marginBottom: 15 }}>
                <Text style={{ fontSize: 16, color: "#1b5e20", fontWeight: "500" }}>{t.noAccount} </Text>
                <TouchableOpacity onPress={() => navigation.navigate("Signup")} style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={{ color: "#d36b03", fontWeight: "bold", fontSize: 16, textDecorationLine: "underline" }}>{t.signup}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={{ alignItems: "center", paddingHorizontal: 30, marginTop: "auto", marginBottom: 30 }}>
              <TouchableOpacity onPress={() => navigation.navigate("Language")} style={{ backgroundColor: "rgba(255, 255, 255, 0.95)", paddingHorizontal: 20, paddingVertical: 12, borderRadius: 20, borderWidth: 1, borderColor: "rgba(0, 150, 0, 0.3)", elevation: 3, flexDirection: "row", alignItems: "center" }}>
                <Ionicons name="language" size={18} color="#1b5e20" style={{ marginRight: 8 }} />
                <Text style={{ color: "#1b5e20", fontSize: 14, fontWeight: "600" }}>{t.changeLang}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </ImageBackground>
    </TouchableWithoutFeedback>
  );
};

export default LoginScreen;