import React, { useContext } from 'react';
import {
    Text,
    TouchableOpacity,
    ScrollView,
    View,
    Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppContext } from '../context/AppContext';
import styles from '../styles/globalStyles';
import { MOCK_STORAGES } from '../utils/constants';

import StorageCard from '../components/StorageCard';

const StorageScreen = () => {
    const { t, location } = useContext(AppContext);
    return (
        <ScrollView style={styles.p10}>
            <View style={{ backgroundColor: '#E3F2FD', padding: 15, borderRadius: 12, marginBottom: 10, flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="location" size={20} color="#1976D2" />
                <Text style={{ color: '#1976D2', fontWeight: 'bold', marginLeft: 10 }}>Showing Storages near {location?.district || "current area"}</Text>
            </View>
            <Text style={styles.sectionTitle}>{t.storage}</Text>
            {MOCK_STORAGES.map(s => (
                <StorageCard key={s.id} item={s} t={t} />
            ))}
        </ScrollView>
    );
};

export default StorageScreen;
