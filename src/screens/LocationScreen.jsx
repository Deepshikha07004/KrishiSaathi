/**
 * LocationScreen.jsx
 *
 * ARCHITECTURE:
 * - Frontend: collects lat/lng from device GPS only.
 * - Backend: handles ALL reverse geocoding, place search, and address formatting.
 * - No API keys stored on frontend.
 * - No business logic on frontend.
 *
 * BACKEND ENDPOINTS USED:
 *   POST /api/get-location       → { latitude, longitude, language } → { placeName, fullAddress, city, district, state, pinCode, country }
 *   POST /api/search-place       → { query, language, limit }        → { places: [{ id, name, description, latitude, longitude }] }
 *   POST /api/geocode-address    → { address, language }             → { latitude, longitude, placeName, fullAddress, ... }
 *
 * TO CONNECT YOUR BACKEND: update BACKEND_API_URL below.
 */

import React, { useState, useContext, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  TextInput,
  Platform,
  Vibration,
  Keyboard,
  ImageBackground,
  KeyboardAvoidingView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import * as Speech from "expo-speech";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppContext } from "../context/AppContext";

// ─── Backend Base URL ─────────────────────────────────────────────────────────
// Replace with your actual backend URL before connecting.
const BACKEND_API_URL = "https://your-backend-api.com/api";
// ─────────────────────────────────────────────────────────────────────────────

// ─── API Helper ───────────────────────────────────────────────────────────────
const callBackend = async (endpoint, body) => {
  const response = await fetch(`${BACKEND_API_URL}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Backend error (${response.status}): ${err}`);
  }
  return response.json();
};
// ─────────────────────────────────────────────────────────────────────────────

const LocationScreen = ({ navigation }) => {
  const {
    t,
    setLocation,
    lang,
    isManualLocation,
    setIsManualLocation,
    convertDigits,
  } = useContext(AppContext);

  // ── UI State ──
  const [mode, setMode] = useState("auto"); // "auto" | "manual"
  const [loadingState, setLoadingState] = useState("idle"); // "idle" | "gps" | "backend" | "searching" | "geocoding"
  const [error, setError] = useState(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // ── Location Data ──
  const [rawCoords, setRawCoords] = useState(null); // { latitude, longitude }
  const [locationData, setLocationData] = useState(null); // Response from backend
  const [mapRegion, setMapRegion] = useState(null);

  // ── Manual Mode ──
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [manualAddress, setManualAddress] = useState("");

  const speechRef = useRef(false);
  const searchDebounce = useRef(null);

  // ── Localized UI Labels ───────────────────────────────────────────────────
  const labels = {
    en: {
      title: "Select Your Location",
      auto: "Detect Automatically",
      manual: "Enter Manually",
      gettingGPS: "Getting GPS coordinates...",
      sendingToBackend: "Fetching location details...",
      searching: "Searching...",
      geocoding: "Finding location on map...",
      confirmLocation: "Confirm Location",
      detectAgain: "Detect Again",
      retry: "Retry",
      permissionDenied: "Location permission denied. Please enable in settings.",
      locationFailed: "Failed to get location. Please try again.",
      backendFailed: "Could not reach server. Please check your connection.",
      speaking: "Speaking...",
      live: "LIVE",
      latitude: "Latitude",
      longitude: "Longitude",
      accuracy: "Accuracy",
      meters: "meters",
      placeName: "Place / Landmark",
      fullAddress: "Full Address",
      city: "City",
      district: "District",
      state: "State",
      pinCode: "PIN Code",
      country: "Country",
      searchPlaceholder: "Search for a place...",
      orEnterAddress: "Or enter full address manually",
      findOnMap: "Find on Map",
      noResults: "No results found. Try a different search.",
      locationDetails: "Location Details",
      errorTitle: "Error",
      enterAddress: "Enter address or landmark to search",
    },
    hi: {
      title: "अपना स्थान चुनें",
      auto: "स्वचालित रूप से पता लगाएं",
      manual: "मैन्युअल दर्ज करें",
      gettingGPS: "GPS निर्देशांक प्राप्त किए जा रहे हैं...",
      sendingToBackend: "स्थान विवरण प्राप्त किए जा रहे हैं...",
      searching: "खोज की जा रही है...",
      geocoding: "मानचित्र पर स्थान ढूंढा जा रहा है...",
      confirmLocation: "स्थान की पुष्टि करें",
      detectAgain: "फिर से पता लगाएं",
      retry: "पुनः प्रयास करें",
      permissionDenied: "स्थान अनुमति अस्वीकृत। कृपया सेटिंग्स में सक्षम करें।",
      locationFailed: "स्थान प्राप्त करने में विफल। कृपया पुनः प्रयास करें।",
      backendFailed: "सर्वर से संपर्क नहीं हो सका। कृपया अपना कनेक्शन जांचें।",
      speaking: "बोल रहा है...",
      live: "लाइव",
      latitude: "अक्षांश",
      longitude: "देशांतर",
      accuracy: "सटीकता",
      meters: "मीटर",
      placeName: "स्थान / लैंडमार्क",
      fullAddress: "पूरा पता",
      city: "शहर",
      district: "जिला",
      state: "राज्य",
      pinCode: "पिन कोड",
      country: "देश",
      searchPlaceholder: "स्थान खोजें...",
      orEnterAddress: "या पूरा पता मैन्युअल दर्ज करें",
      findOnMap: "मानचित्र पर खोजें",
      noResults: "कोई परिणाम नहीं मिला। अलग से खोजें।",
      locationDetails: "स्थान विवरण",
      errorTitle: "त्रुटि",
      enterAddress: "खोजने के लिए पता या लैंडमार्क दर्ज करें",
    },
    bn: {
      title: "আপনার অবস্থান নির্বাচন করুন",
      auto: "স্বয়ংক্রিয়ভাবে সনাক্ত করুন",
      manual: "ম্যানুয়ালি লিখুন",
      gettingGPS: "GPS স্থানাঙ্ক পাওয়া হচ্ছে...",
      sendingToBackend: "অবস্থানের বিবরণ আনা হচ্ছে...",
      searching: "অনুসন্ধান করা হচ্ছে...",
      geocoding: "মানচিত্রে অবস্থান খুঁজছে...",
      confirmLocation: "অবস্থান নিশ্চিত করুন",
      detectAgain: "আবার সনাক্ত করুন",
      retry: "পুনরায় চেষ্টা করুন",
      permissionDenied: "অবস্থানের অনুমতি অস্বীকৃত। সেটিংসে সক্ষম করুন।",
      locationFailed: "অবস্থান পাওয়া যায়নি। আবার চেষ্টা করুন।",
      backendFailed: "সার্ভারে পৌঁছানো যায়নি। আপনার সংযোগ পরীক্ষা করুন।",
      speaking: "বলছে...",
      live: "লাইভ",
      latitude: "অক্ষাংশ",
      longitude: "দ্রাঘিমাংশ",
      accuracy: "সঠিকতা",
      meters: "মিটার",
      placeName: "স্থান / ল্যান্ডমার্ক",
      fullAddress: "সম্পূর্ণ ঠিকানা",
      city: "শহর",
      district: "জেলা",
      state: "রাজ্য",
      pinCode: "পিন কোড",
      country: "দেশ",
      searchPlaceholder: "স্থান অনুসন্ধান করুন...",
      orEnterAddress: "অথবা সম্পূর্ণ ঠিকানা ম্যানুয়ালি লিখুন",
      findOnMap: "মানচিত্রে খুঁজুন",
      noResults: "কোন ফলাফল পাওয়া যায়নি। ভিন্নভাবে অনুসন্ধান করুন।",
      locationDetails: "অবস্থানের বিবরণ",
      errorTitle: "ত্রুটি",
      enterAddress: "অনুসন্ধানের জন্য ঠিকানা বা ল্যান্ডমার্ক লিখুন",
    },
  };

  const L = labels[lang] || labels.en;

  // ── Speech ─────────────────────────────────────────────────────────────────
  const speak = async (text) => {
    if (speechRef.current) return;
    speechRef.current = true;
    setIsSpeaking(true);
    try {
      await Speech.speak(text, {
        language: lang === "hi" ? "hi-IN" : lang === "bn" ? "bn-IN" : "en-US",
        rate: 0.85,
        onDone: () => { setIsSpeaking(false); speechRef.current = false; },
        onError: () => { setIsSpeaking(false); speechRef.current = false; },
      });
    } catch {
      setIsSpeaking(false);
      speechRef.current = false;
    }
  };

  // ── Format helpers ─────────────────────────────────────────────────────────
  const fmtCoord = (v) => v ? convertDigits(v.toFixed(6)) : "";
  const fmtAccuracy = (v) => v ? `${convertDigits(v.toFixed(0))} ${L.meters}` : "";

  // ═══════════════════════════════════════════════════════════════════════════
  // AUTO MODE — Step 1: Get GPS, Step 2: Send to backend
  // ═══════════════════════════════════════════════════════════════════════════
  const detectLocation = async () => {
    if (Platform.OS !== "web") Vibration.vibrate(30);
    setError(null);
    setPermissionDenied(false);
    setLocationData(null);
    setRawCoords(null);
    setMapRegion(null);

    // Step 1: Get GPS coords from device
    setLoadingState("gps");
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setPermissionDenied(true);
        setLoadingState("idle");
        speak(L.permissionDenied);
        return;
      }

      const locData = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeout: 15000,
      });

      const { latitude, longitude, accuracy } = locData.coords;
      setRawCoords({ latitude, longitude, accuracy });

      setMapRegion({ latitude, longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 });

      // Step 2: Send coords to backend for reverse geocoding
      setLoadingState("backend");
      const result = await callBackend("/get-location", {
        latitude,
        longitude,
        language: lang,
      });

      setLocationData({ ...result, latitude, longitude, accuracy });
      setLocation({ ...result, latitude, longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 });

      await AsyncStorage.setItem("user-location", JSON.stringify({
        ...result, latitude, longitude, accuracy, timestamp: Date.now(),
      }));

      speak(result.placeName || "Location found");
    } catch (err) {
      console.log("[LocationScreen] auto detect error:", err.message);
      setError(err.message.includes("Backend") ? L.backendFailed : L.locationFailed);
      speak(L.locationFailed);
    } finally {
      setLoadingState("idle");
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // MANUAL MODE — Search by name → backend returns lat/lng + details
  // ═══════════════════════════════════════════════════════════════════════════
  const searchPlace = async (query) => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    setLoadingState("searching");
    try {
      const result = await callBackend("/search-place", {
        query,
        language: lang,
        limit: 5,
      });
      setSuggestions(result.places || []);
      setShowSuggestions(true);
    } catch (err) {
      console.log("[LocationScreen] search error:", err.message);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setLoadingState("idle");
    }
  };

  const onSearchChange = (text) => {
    setSearchQuery(text);
    if (searchDebounce.current) clearTimeout(searchDebounce.current);
    searchDebounce.current = setTimeout(() => searchPlace(text), 500);
  };

  const selectSuggestion = (place) => {
    setShowSuggestions(false);
    Keyboard.dismiss();
    const { latitude, longitude } = place;
    setRawCoords({ latitude, longitude, accuracy: null });
    setLocationData(place);
    setMapRegion({ latitude, longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 });
    setSearchQuery(place.name || place.placeName || "");
    speak(place.placeName || place.name || "Location selected");
  };

  // Manual address geocoding: user types full address → backend returns lat/lng
  const geocodeManualAddress = async () => {
    if (!manualAddress.trim()) {
      Alert.alert(L.errorTitle, L.enterAddress);
      return;
    }
    setLoadingState("geocoding");
    setError(null);
    try {
      const result = await callBackend("/geocode-address", {
        address: manualAddress,
        language: lang,
      });
      const { latitude, longitude } = result;
      setRawCoords({ latitude, longitude, accuracy: null });
      setLocationData(result);
      setMapRegion({ latitude, longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 });
      speak(result.placeName || "Location found");
    } catch (err) {
      console.log("[LocationScreen] geocode error:", err.message);
      setError(L.backendFailed);
    } finally {
      setLoadingState("idle");
    }
  };

  // ── Confirm ────────────────────────────────────────────────────────────────
  const confirmLocation = () => {
    if (!locationData || !rawCoords) return;
    setIsManualLocation(mode === "manual");
    setLocation({ ...locationData, latitude: rawCoords.latitude, longitude: rawCoords.longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 });
    speak(L.confirmLocation);
    navigation.replace("Home");
  };

  // ── Mode switch ────────────────────────────────────────────────────────────
  const switchMode = (newMode) => {
    setMode(newMode);
    setLocationData(null);
    setRawCoords(null);
    setMapRegion(null);
    setError(null);
    setPermissionDenied(false);
    setSuggestions([]);
    setShowSuggestions(false);
    setSearchQuery("");
    setManualAddress("");
    if (newMode === "auto") detectLocation();
  };

  // Init
  useEffect(() => {
    if (!isManualLocation) detectLocation();
    return () => {
      Speech.stop();
      if (searchDebounce.current) clearTimeout(searchDebounce.current);
    };
  }, []);

  // ── Loading label ──────────────────────────────────────────────────────────
  const loadingLabel = {
    gps: L.gettingGPS,
    backend: L.sendingToBackend,
    searching: L.searching,
    geocoding: L.geocoding,
  }[loadingState] || "";

  const isLoading = loadingState !== "idle";

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // RENDER
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  return (
    <ImageBackground
      source={require("../assets/locationbg.jpg")}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      {/* Overlay */}
      <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(223, 239, 192, 0.72)" }} />

      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={{ paddingBottom: 50 }} keyboardShouldPersistTaps="handled">

            {/* ── Header ── */}
            <View style={{ alignItems: "center", marginTop: 25, marginBottom: 20 }}>
              <LinearGradient
                colors={["#2E7D32", "#1B5E20"]}
                style={{ padding: 15, borderRadius: 50, marginBottom: 12, elevation: 8 }}
              >
                <Ionicons name="location" size={40} color="#fff" />
              </LinearGradient>
              <Text style={{ fontSize: 24, fontWeight: "bold", color: "#1B5E20" }}>
                {L.title}
              </Text>
            </View>

            {/* ── Loading Banner ── */}
            {isLoading && (
              <View style={{ marginHorizontal: 20, marginBottom: 12 }}>
                <View style={{ backgroundColor: "#E3F2FD", padding: 12, borderRadius: 12, flexDirection: "row", alignItems: "center" }}>
                  <ActivityIndicator size="small" color="#1976D2" />
                  <Text style={{ marginLeft: 10, color: "#1976D2", fontWeight: "600", flex: 1 }}>
                    {loadingLabel}
                  </Text>
                </View>
              </View>
            )}

            {/* ── Error Banner ── */}
            {error && !isLoading && (
              <View style={{ marginHorizontal: 20, marginBottom: 12 }}>
                <View style={{ backgroundColor: "#FFEBEE", padding: 14, borderRadius: 12, flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#EF9A9A" }}>
                  <Ionicons name="warning" size={22} color="#C62828" />
                  <Text style={{ marginLeft: 10, color: "#C62828", flex: 1, fontSize: 13 }}>{error}</Text>
                  <TouchableOpacity onPress={mode === "auto" ? detectLocation : geocodeManualAddress} style={{ backgroundColor: "#C62828", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 }}>
                    <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 12 }}>{L.retry}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* ── Permission Denied ── */}
            {permissionDenied && (
              <View style={{ marginHorizontal: 20, marginBottom: 12 }}>
                <View style={{ backgroundColor: "#FFEBEE", padding: 20, borderRadius: 16, alignItems: "center", borderWidth: 1, borderColor: "#EF9A9A" }}>
                  <Ionicons name="lock-closed" size={40} color="#C62828" />
                  <Text style={{ color: "#C62828", textAlign: "center", marginTop: 10, fontWeight: "600" }}>
                    {L.permissionDenied}
                  </Text>
                  <TouchableOpacity onPress={detectLocation} style={{ marginTop: 15, backgroundColor: "#2196F3", paddingHorizontal: 24, paddingVertical: 10, borderRadius: 10 }}>
                    <Text style={{ color: "#fff", fontWeight: "bold" }}>{L.retry}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* ── Mode Toggle ── */}
            <View style={{ paddingHorizontal: 20, marginBottom: 18 }}>
              <View style={{ flexDirection: "row", backgroundColor: "#fff", borderRadius: 15, padding: 5, elevation: 3 }}>
                {["auto", "manual"].map((m) => (
                  <TouchableOpacity
                    key={m}
                    onPress={() => switchMode(m)}
                    style={{
                      flex: 1, paddingVertical: 12, borderRadius: 12,
                      backgroundColor: mode === m ? "#2E7D32" : "transparent",
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ fontWeight: "bold", color: mode === m ? "#fff" : "#666" }}>
                      {m === "auto" ? L.auto : L.manual}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* ════════════════════════════════════════════════
                AUTO MODE
            ════════════════════════════════════════════════ */}
            {mode === "auto" && (
              <View style={{ paddingHorizontal: 20 }}>
                {/* Loading spinner card */}
                {isLoading && !mapRegion && (
                  <View style={{ backgroundColor: "rgba(255,255,255,0.95)", borderRadius: 20, padding: 50, alignItems: "center", elevation: 4, borderWidth: 1, borderColor: "#4CAF50" }}>
                    <ActivityIndicator size="large" color="#2E7D32" />
                    <Text style={{ marginTop: 18, color: "#1B5E20", fontWeight: "600" }}>{loadingLabel}</Text>
                    <Text style={{ marginTop: 6, color: "#888", fontSize: 12, textAlign: "center" }}>
                      {loadingState === "gps" ? "Getting coordinates from your device..." : "Contacting backend for address details..."}
                    </Text>
                  </View>
                )}

                {/* Map */}
                {mapRegion && (
                  <View style={{ height: 260, borderRadius: 22, overflow: "hidden", marginBottom: 16, elevation: 8, borderWidth: 2, borderColor: "#4CAF50" }}>
                    <MapView style={{ flex: 1 }} provider={PROVIDER_GOOGLE} region={mapRegion} showsUserLocation={true}>
                      <Marker coordinate={{ latitude: mapRegion.latitude, longitude: mapRegion.longitude }}>
                        <View style={{ alignItems: "center" }}>
                          <View style={{ backgroundColor: "#E53935", width: 24, height: 24, borderRadius: 12, borderWidth: 3, borderColor: "#fff", elevation: 5 }} />
                          <View style={{ width: 2, height: 8, backgroundColor: "#E53935", marginTop: -1 }} />
                        </View>
                      </Marker>
                    </MapView>
                    {/* LIVE badge */}
                    <View style={{ position: "absolute", top: 10, right: 10, backgroundColor: "rgba(255,255,255,0.93)", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 14, flexDirection: "row", alignItems: "center" }}>
                      <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: "#4CAF50", marginRight: 5 }} />
                      <Text style={{ fontSize: 10, fontWeight: "bold", color: "#333" }}>{L.live}</Text>
                    </View>
                  </View>
                )}

                {/* GPS coordinates (raw, from device) */}
                {rawCoords && (
                  <View style={{ flexDirection: "row", marginBottom: 14 }}>
                    {[{ label: L.latitude, val: rawCoords.latitude }, { label: L.longitude, val: rawCoords.longitude }].map((item, i) => (
                      <View key={i} style={{ flex: 1, marginRight: i === 0 ? 8 : 0 }}>
                        <Text style={{ fontSize: 11, color: "#888", fontWeight: "bold", marginBottom: 4 }}>{item.label}</Text>
                        <View style={{ backgroundColor: "#C8E6C9", borderRadius: 10, padding: 10 }}>
                          <Text style={{ fontSize: 13, color: "#2E7D32", fontWeight: "bold" }}>{fmtCoord(item.val)}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                )}

                {/* Backend location details card */}
                {locationData && !isLoading && (
                  <LocationDetailsCard data={locationData} labels={L} fmtAccuracy={fmtAccuracy} />
                )}

                {/* Confirm & Detect Again buttons */}
                {locationData && !isLoading && (
                  <View style={{ marginTop: 6 }}>
                    <TouchableOpacity onPress={confirmLocation} style={{ borderRadius: 15, overflow: "hidden", marginBottom: 10 }}>
                      <LinearGradient colors={["#2E7D32", "#1B5E20"]} style={{ paddingVertical: 18, alignItems: "center" }}>
                        <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 18 }}>{L.confirmLocation}</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={detectLocation} style={{ padding: 14, alignItems: "center" }}>
                      <Text style={{ color: "#2E7D32", fontWeight: "600" }}>{L.detectAgain}</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}

            {/* ════════════════════════════════════════════════
                MANUAL MODE
            ════════════════════════════════════════════════ */}
            {mode === "manual" && (
              <View style={{ paddingHorizontal: 20 }}>
                <View style={{ backgroundColor: "rgba(255,255,255,0.97)", borderRadius: 22, padding: 22, elevation: 6, borderWidth: 1, borderColor: "#4CAF50" }}>

                  {/* ── Search by place name ── */}
                  <Text style={{ fontSize: 13, color: "#888", fontWeight: "bold", marginBottom: 5 }}>
                    {L.searchPlaceholder}
                  </Text>
                  <View style={{ position: "relative", marginBottom: 4 }}>
                    <TextInput
                      style={{ backgroundColor: "#F5F5F5", borderRadius: 10, padding: 12, fontSize: 15, color: "#333", paddingRight: 40 }}
                      placeholder={L.searchPlaceholder}
                      placeholderTextColor="#999"
                      value={searchQuery}
                      onChangeText={onSearchChange}
                    />
                    {loadingState === "searching" && (
                      <ActivityIndicator size="small" color="#2E7D32" style={{ position: "absolute", right: 12, top: 14 }} />
                    )}
                  </View>

                  {/* Suggestions */}
                  {showSuggestions && suggestions.length > 0 && (
                    <View style={{ backgroundColor: "#fff", borderRadius: 10, marginBottom: 12, elevation: 4, maxHeight: 200 }}>
                      <ScrollView keyboardShouldPersistTaps="handled">
                        {suggestions.map((place, idx) => (
                          <TouchableOpacity
                            key={place.id || idx}
                            onPress={() => selectSuggestion(place)}
                            style={{ padding: 12, borderBottomWidth: 1, borderBottomColor: "#f0f0f0", flexDirection: "row", alignItems: "center" }}
                          >
                            <Ionicons name="location-outline" size={16} color="#2E7D32" style={{ marginRight: 8 }} />
                            <Text style={{ color: "#333", flex: 1, fontSize: 13 }}>{place.description || place.name}</Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}

                  {suggestions.length === 0 && showSuggestions && searchQuery.length >= 3 && loadingState === "idle" && (
                    <Text style={{ color: "#999", fontSize: 12, marginBottom: 12 }}>{L.noResults}</Text>
                  )}

                  {/* ── Divider ── */}
                  <View style={{ flexDirection: "row", alignItems: "center", marginVertical: 14 }}>
                    <View style={{ flex: 1, height: 1, backgroundColor: "#E0E0E0" }} />
                    <Text style={{ marginHorizontal: 10, color: "#999", fontSize: 12 }}>{L.orEnterAddress}</Text>
                    <View style={{ flex: 1, height: 1, backgroundColor: "#E0E0E0" }} />
                  </View>

                  {/* ── Full address input → send to backend ── */}
                  <Text style={{ fontSize: 13, color: "#888", fontWeight: "bold", marginBottom: 5 }}>
                    {L.fullAddress}
                  </Text>
                  <TextInput
                    style={{ backgroundColor: "#F5F5F5", borderRadius: 10, padding: 12, fontSize: 15, color: "#333", minHeight: 80, textAlignVertical: "top", marginBottom: 14 }}
                    placeholder="e.g. Village Rampur, Tehsil Sadar, District Fatehpur, UP 212601"
                    placeholderTextColor="#bbb"
                    multiline
                    value={manualAddress}
                    onChangeText={setManualAddress}
                  />

                  <TouchableOpacity
                    onPress={geocodeManualAddress}
                    disabled={isLoading}
                    style={{ backgroundColor: "#FF9800", padding: 14, borderRadius: 12, flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: 16, opacity: isLoading ? 0.6 : 1 }}
                  >
                    <Ionicons name="search" size={18} color="#fff" />
                    <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 15, marginLeft: 8 }}>{L.findOnMap}</Text>
                  </TouchableOpacity>

                  {/* ── GPS coordinates once fetched ── */}
                  {rawCoords && (
                    <View style={{ flexDirection: "row", marginBottom: 14 }}>
                      {[{ label: L.latitude, val: rawCoords.latitude }, { label: L.longitude, val: rawCoords.longitude }].map((item, i) => (
                        <View key={i} style={{ flex: 1, marginRight: i === 0 ? 8 : 0 }}>
                          <Text style={{ fontSize: 11, color: "#888", fontWeight: "bold", marginBottom: 4 }}>{item.label}</Text>
                          <View style={{ backgroundColor: "#C8E6C9", borderRadius: 10, padding: 10 }}>
                            <Text style={{ fontSize: 13, color: "#2E7D32", fontWeight: "bold" }}>{fmtCoord(item.val)}</Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* ── Map ── */}
                  {mapRegion && (
                    <View style={{ height: 180, borderRadius: 18, overflow: "hidden", marginBottom: 14, borderWidth: 2, borderColor: "#4CAF50" }}>
                      <MapView style={{ flex: 1 }} provider={PROVIDER_GOOGLE} region={mapRegion} scrollEnabled={false}>
                        <Marker coordinate={{ latitude: mapRegion.latitude, longitude: mapRegion.longitude }}>
                          <View style={{ alignItems: "center" }}>
                            <View style={{ backgroundColor: "#E53935", width: 24, height: 24, borderRadius: 12, borderWidth: 3, borderColor: "#fff", elevation: 5 }} />
                            <View style={{ width: 2, height: 8, backgroundColor: "#E53935", marginTop: -1 }} />
                          </View>
                        </Marker>
                      </MapView>
                    </View>
                  )}

                  {/* ── Backend location details ── */}
                  {locationData && !isLoading && (
                    <LocationDetailsCard data={locationData} labels={L} fmtAccuracy={fmtAccuracy} />
                  )}

                  {/* ── Confirm button ── */}
                  <TouchableOpacity
                    onPress={confirmLocation}
                    disabled={!locationData || isLoading}
                    style={{ borderRadius: 15, overflow: "hidden", marginTop: 14, opacity: !locationData ? 0.5 : 1 }}
                  >
                    <LinearGradient colors={["#2E7D32", "#1B5E20"]} style={{ paddingVertical: 18, alignItems: "center" }}>
                      <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 18 }}>{L.confirmLocation}</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            )}

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* Voice indicator */}
      {isSpeaking && (
        <View style={{ position: "absolute", bottom: 28, right: 20, backgroundColor: "#2196F3", padding: 12, borderRadius: 28, flexDirection: "row", alignItems: "center", elevation: 6 }}>
          <Ionicons name="volume-high" size={18} color="#fff" />
          <Text style={{ color: "#fff", marginLeft: 6, fontSize: 12 }}>{L.speaking}</Text>
        </View>
      )}
    </ImageBackground>
  );
};

// ─── Location Details Card (shared by auto & manual) ─────────────────────────
const LocationDetailsCard = ({ data, labels: L, fmtAccuracy }) => {
  const fields = [
    { label: L.placeName, val: data.placeName },
    { label: L.fullAddress, val: data.fullAddress },
  ];
  const rowFields = [
    [{ label: L.city, val: data.city }, { label: L.district, val: data.district }],
    [{ label: L.state, val: data.state }, { label: L.pinCode, val: data.pinCode }],
    [{ label: L.country, val: data.country }, data.accuracy ? { label: L.accuracy, val: fmtAccuracy(data.accuracy), accent: true } : null],
  ];

  return (
    <View style={{ backgroundColor: "rgba(232,245,233,0.6)", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#A5D6A7", marginBottom: 14 }}>
      <Text style={{ fontSize: 16, fontWeight: "bold", color: "#1B5E20", marginBottom: 12, textAlign: "center" }}>
        {L.locationDetails}
      </Text>

      {fields.map(({ label, val }) => val ? (
        <View key={label} style={{ marginBottom: 10 }}>
          <Text style={{ fontSize: 11, color: "#777", fontWeight: "bold", marginBottom: 3 }}>{label}</Text>
          <View style={{ backgroundColor: "#fff", borderRadius: 8, padding: 10, borderWidth: 0.5, borderColor: "#C8E6C9" }}>
            <Text style={{ fontSize: 14, color: "#333" }}>{val}</Text>
          </View>
        </View>
      ) : null)}

      {rowFields.map((row, ri) => (
        <View key={ri} style={{ flexDirection: "row", marginBottom: 10 }}>
          {row.map((item, ci) => item ? (
            <View key={ci} style={{ flex: 1, marginRight: ci === 0 ? 8 : 0 }}>
              <Text style={{ fontSize: 11, color: "#777", fontWeight: "bold", marginBottom: 3 }}>{item.label}</Text>
              <View style={{ backgroundColor: item.accent ? "#E3F2FD" : "#fff", borderRadius: 8, padding: 10, borderWidth: 0.5, borderColor: item.accent ? "#90CAF9" : "#C8E6C9" }}>
                <Text style={{ fontSize: 13, color: item.accent ? "#1565C0" : "#333", fontWeight: item.accent ? "bold" : "normal" }}>
                  {item.val || "—"}
                </Text>
              </View>
            </View>
          ) : <View key={ci} style={{ flex: 1 }} />)}
        </View>
      ))}
    </View>
  );
};

export default LocationScreen;