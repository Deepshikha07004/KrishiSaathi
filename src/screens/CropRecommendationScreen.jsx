import React, { useState, useContext } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppContext } from '../context/AppContext';
import styles from '../styles/globalStyles';
import { MOCK_CROP_REC } from '../utils/constants';

const CropRecommendationScreen = ({ navigation }) => {
    const { t, setChatType, setChatVisible, setPinnedMessage } = useContext(AppContext);
    const [step, setStep] = useState(1);
    const [soil, setSoil] = useState('');
    const [season, setSeason] = useState('');

    const handleSownAlready = (val) => {
        if (val === 'yes') {
            navigation.navigate('CropAdv');
        } else {
            setStep(3); // Ask for soil/season for new recommendations
        }
    };

    const getDynamicRec = (cropName = null) => {
        let summary = "";
        if (cropName) {
            summary = `**Existing Crop Context**\n- **Crop**: ${cropName}\n- **Goal**: Optimize yield and health.`;
        } else {
            summary = `**New Sowing Recommendation**\n- **Soil**: ${soil}\n- **Season**: ${season}\n- **Goal**: Select best crop for maximum profit.`;
        }

        setPinnedMessage(summary);
        setChatType('Recommendation');
        setChatVisible(true);
    };

    return (
        <View style={styles.container}>
            {step === 1 ? (
                <View style={[styles.containerCenter, { padding: 20 }]}>
                    <Ionicons name="help-circle-outline" size={80} color="#2E7D32" />
                    <Text style={styles.questionText}>{t.sownAlready}</Text>
                    <TouchableOpacity style={styles.primaryBtn} onPress={() => handleSownAlready('yes')}>
                        <Text style={styles.btnText}>{t.yes}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: '#FF8F00' }]} onPress={() => handleSownAlready('no')}>
                        <Text style={styles.btnText}>{t.no}</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={styles.p10}>
                    <Text style={styles.sectionTitle}>{t.soilTypeLabel}</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. Clay, Sandy"
                        value={soil}
                        onChangeText={setSoil}
                    />

                    <Text style={styles.sectionTitle}>{t.seasonLabel}</Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 }}>
                        <TouchableOpacity style={[styles.miniBtn, season === 'Summer' && { backgroundColor: '#FF8F00' }]} onPress={() => setSeason('Summer')}>
                            <Text style={styles.miniBtnText}>{t.summer}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.miniBtn, season === 'Monsoon' && { backgroundColor: '#1976D2' }]} onPress={() => setSeason('Monsoon')}>
                            <Text style={styles.miniBtnText}>{t.monsoon}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.miniBtn, season === 'Winter' && { backgroundColor: '#0097A7' }]} onPress={() => setSeason('Winter')}>
                            <Text style={styles.miniBtnText}>{t.winter}</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={styles.primaryBtn} onPress={() => getDynamicRec()}>
                        <Text style={styles.btnText}>{t.getRecBtn}</Text>
                    </TouchableOpacity>
                </View>
            )}
            {step > 1 && (
                <TouchableOpacity style={{ position: 'absolute', bottom: 20, left: 20 }} onPress={() => setStep(1)}>
                    <Ionicons name="arrow-back-circle" size={50} color="#666" />
                </TouchableOpacity>
            )}
        </View>
    );
};

export default CropRecommendationScreen;
