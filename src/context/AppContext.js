import React, { createContext, useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { Platform } from 'react-native';
import translations from '../translations/translations';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [lang, setLang] = useState('en');
    const [user, setUser] = useState(null);
    const [location, setLocation] = useState(null);
    const [isChatVisible, setChatVisible] = useState(false);
    const [chatType, setChatType] = useState('General');
    const [pinnedMessage, setPinnedMessage] = useState(null);
    const [isManualLocation, setIsManualLocation] = useState(false);

    const digitsMap = {
        hi: ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"],
        bn: ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"],
    };

    const convertDigits = (val) => {
        if (!val && val !== 0) return "";
        const str = val.toString();
        if (lang === "en" || !digitsMap[lang]) return str;
        return str.split("").map(c =>
            (c >= "0" && c <= "9" ? digitsMap[lang][parseInt(c)] : c)
        ).join("");
    };

    // Defensive translation lookup
    const t = translations[lang] || translations['en'] || {};

    useEffect(() => {
        let watcher;
        const startTracking = async () => {
            try {
                if (isManualLocation || Platform.OS === 'web') {
                    // Default location for web/manual to avoid common geocoding crashes
                    if (!location && !isManualLocation) {
                        updateAddress(22.5726, 88.3639);
                    }
                    return;
                }

                let { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') return;

                watcher = await Location.watchPositionAsync(
                    {
                        accuracy: Location.Accuracy.High,
                        timeInterval: 10000,
                        distanceInterval: 15,
                    },
                    (loc) => {
                        updateAddress(loc.coords.latitude, loc.coords.longitude);
                    }
                );
            } catch (err) {
                console.log("Tracking error:", err);
            }
        };

        const updateAddress = async (lat, lon) => {
            let addressInfo = {
                placeName: "Kisan Nagar Main",
                fullAddress: "Street 42, Green Farm Zone",
                district: "North 24 Parganas",
                state: "West Bengal",
                pinCode: "700123"
            };

            try {
                if (Platform.OS !== 'web') {
                    let geo = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lon });
                    if (geo && geo.length > 0) {
                        addressInfo.placeName = geo[0].name || geo[0].city || geo[0].district || "My Village";
                        addressInfo.fullAddress = `${geo[0].street ? geo[0].street + ', ' : ''}${geo[0].subregion || ''} ${geo[0].city || ''}`;
                        addressInfo.district = geo[0].district || geo[0].city || "Bongaon";
                        addressInfo.state = geo[0].region || "West Bengal";
                        addressInfo.pinCode = geo[0].postalCode || "743235";
                    }
                }
            } catch (e) {
                console.log("Geocoding failed, using fallback");
            }

            setLocation(prev => ({
                ...(prev || {}),
                latitude: lat,
                longitude: lon,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
                ...addressInfo
            }));
        };

        startTracking();
        return () => {
            if (watcher && watcher.remove) watcher.remove();
        };
    }, [isManualLocation, lang]);

    return (
        <AppContext.Provider value={{
            lang, setLang, t, user, setUser, location, setLocation,
            isChatVisible, setChatVisible, chatType, setChatType,
            pinnedMessage, setPinnedMessage,
            isManualLocation, setIsManualLocation, convertDigits
        }}>
            {children}
        </AppContext.Provider>
    );
};
