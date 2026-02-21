import React, { useContext } from 'react';
import {
    View,
    Text,
    ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { AppContext } from '../context/AppContext';
import styles from '../styles/globalStyles';
import { MOCK_WEATHER } from '../utils/constants';

const WeatherScreen = () => {
    const { t, location, convertDigits } = useContext(AppContext);
    const current = MOCK_WEATHER[0];
    const today = new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short' });

    return (
        <ScrollView style={styles.container}>
            <LinearGradient colors={['#1976D2', '#64B5F6']} style={styles.weatherHero}>
                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 15, paddingVertical: 5, borderRadius: 20, marginBottom: 15 }}>
                    <Ionicons name="location" size={16} color="#fff" />
                    <Text style={{ color: '#fff', marginLeft: 5, fontWeight: 'bold' }}>{location?.district || "Your Location"}</Text>
                </View>
                <View style={{ backgroundColor: '#FF5252', paddingHorizontal: 10, borderRadius: 5, marginBottom: 5 }}>
                    <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>LIVE</Text>
                </View>
                <Text style={styles.weatherDate}>{today}</Text>
                <Text style={styles.weatherTemp}>{convertDigits(current.temp)}°C</Text>
                <Text style={styles.weatherStatus}>{current.condition}</Text>
                <View style={styles.weatherStats}>
                    <View style={styles.statItem}>
                        <MaterialCommunityIcons name="water-percent" size={24} color="#fff" />
                        <Text style={styles.statVal}>{convertDigits(current.humidity)}%</Text>
                        <Text style={styles.statLabel}>{t.humidity}</Text>
                    </View>
                    <View style={styles.statItem}>
                        <MaterialCommunityIcons name="weather-windy" size={24} color="#fff" />
                        <Text style={styles.statVal}>{convertDigits(current.wind)} km/h</Text>
                        <Text style={styles.statLabel}>{t.wind}</Text>
                    </View>
                </View>
            </LinearGradient>

            <View style={styles.alertBox}>
                <Ionicons name="warning" size={24} color="#D32F2F" />
                <Text style={styles.alertText}>{t.extremeWeather}: High Heat Alert</Text>
            </View>

            <Text style={styles.sectionTitle}>{t.forecast}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.forecastScroll}>
                {MOCK_WEATHER.map((w, i) => (
                    <View key={i} style={styles.forecastCard}>
                        <Text style={styles.forecastDay}>{w.day}</Text>
                        <Ionicons name={w.condition === 'Rain' ? 'rainy' : 'sunny'} size={30} color="#1976D2" />
                        <Text style={styles.forecastTemp}>{convertDigits(w.temp)}°C</Text>
                    </View>
                ))}
            </ScrollView>
        </ScrollView>
    );
};

export default WeatherScreen;
