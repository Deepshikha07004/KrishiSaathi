import React, { useState, useEffect, useContext } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { AppContext } from '../context/AppContext';
import styles from '../styles/globalStyles';

const CropAdvisoryScreen = () => {
    const { t, lang, setChatType, setChatVisible, setPinnedMessage } = useContext(AppContext);
    const [step, setStep] = useState(0);
    const [form, setForm] = useState({ name: '', date: '', fertilizer: '', pest: '', soil: '' });

    const speak = (msg) => {
        Speech.stop();
        Speech.speak(msg, { rate: 1.05, pitch: 1.3, language: lang });
    };

    useEffect(() => {
        if (step === 0) speak(t.advIntro);
        else if (step === 1) speak(t.advQ1);
        else if (step === 2) speak(t.advQ2);
        else if (step === 3) speak(t.advQ3);
        else if (step === 4) speak(t.advQ4);
        else if (step === 5) speak(t.advQ5);
        else if (step === 6) speak(t.advSummary);
    }, [step]);

    const getAdvisory = () => {
        const summary = `**Crop Details for Advice**\n\n- **Crop**: ${form.name}\n- **Sowing Date**: ${form.date}\n- **Fertilizer**: ${form.fertilizer}\n- **Issue**: ${form.pest}\n- **Soil**: ${form.soil}`;
        setPinnedMessage(summary);
        setChatType('Advisory');
        setChatVisible(true);
    };

    const renderStep = () => {
        switch (step) {
            case 0:
                return (
                    <View style={styles.containerCenter}>
                        <MaterialCommunityIcons name="chat-question" size={80} color="#2E7D32" />
                        <Text style={styles.questionText}>{t.advIntro}</Text>
                        <TouchableOpacity style={styles.primaryBtn} onPress={() => setStep(1)}>
                            <Text style={styles.btnText}>{t.continue}</Text>
                        </TouchableOpacity>
                    </View>
                );
            case 1:
                return (
                    <View style={styles.p10}>
                        <Text style={styles.questionText}>{t.advQ1}</Text>
                        <TextInput style={styles.input} placeholder="e.g. Rice" value={form.name} onChangeText={v => setForm({ ...form, name: v })} />
                        <TouchableOpacity style={styles.primaryBtn} onPress={() => setStep(2)}>
                            <Text style={styles.btnText}>{t.continue}</Text>
                        </TouchableOpacity>
                    </View>
                );
            case 2:
                return (
                    <View style={styles.p10}>
                        <Text style={styles.questionText}>{t.advQ2}</Text>
                        <TextInput style={styles.input} placeholder="e.g. 1st Aug" value={form.date} onChangeText={v => setForm({ ...form, date: v })} />
                        <TouchableOpacity style={styles.primaryBtn} onPress={() => setStep(3)}>
                            <Text style={styles.btnText}>{t.continue}</Text>
                        </TouchableOpacity>
                    </View>
                );
            case 3:
                return (
                    <View style={styles.p10}>
                        <Text style={styles.questionText}>{t.advQ3}</Text>
                        <TextInput style={styles.input} placeholder="e.g. Urea" value={form.fertilizer} onChangeText={v => setForm({ ...form, fertilizer: v })} />
                        <TouchableOpacity style={styles.primaryBtn} onPress={() => setStep(4)}>
                            <Text style={styles.btnText}>{t.continue}</Text>
                        </TouchableOpacity>
                    </View>
                );
            case 4:
                return (
                    <View style={styles.p10}>
                        <Text style={styles.questionText}>{t.advQ4}</Text>
                        <TextInput style={[styles.input, { height: 100 }]} multiline placeholder="Describe issues..." value={form.pest} onChangeText={v => setForm({ ...form, pest: v })} />
                        <TouchableOpacity style={styles.primaryBtn} onPress={() => setStep(5)}>
                            <Text style={styles.btnText}>{t.continue}</Text>
                        </TouchableOpacity>
                    </View>
                );
            case 5:
                return (
                    <View style={styles.p10}>
                        <Text style={styles.questionText}>{t.advQ5}</Text>
                        <TextInput style={styles.input} placeholder="e.g. Clay" value={form.soil} onChangeText={v => setForm({ ...form, soil: v })} />
                        <TouchableOpacity style={styles.primaryBtn} onPress={() => setStep(6)}>
                            <Text style={styles.btnText}>{t.continue}</Text>
                        </TouchableOpacity>
                    </View>
                );
            case 6:
                return (
                    <View style={styles.p10}>
                        <View style={styles.pinnedBox}>
                            <Text style={styles.pinnedTitle}>Crop Details</Text>
                            <Text>Crop: {form.name}</Text>
                            <Text>Sowing: {form.date}</Text>
                            <Text>Fertilizer: {form.fertilizer}</Text>
                            <Text>Issues: {form.pest}</Text>
                            <Text>Soil: {form.soil}</Text>
                        </View>
                        <Text style={styles.questionText}>{t.advSummary}</Text>
                        <TouchableOpacity style={styles.primaryBtn} onPress={getAdvisory}>
                            <Text style={styles.btnText}>{t.openChatbot}</Text>
                            <Ionicons name="chatbubbles" size={20} color="#fff" style={{ marginLeft: 10 }} />
                        </TouchableOpacity>
                    </View>
                );
        }
    };

    return (
        <View style={styles.container}>
            {renderStep()}
            {step > 0 && (
                <TouchableOpacity style={{ position: 'absolute', bottom: 20, left: 20 }} onPress={() => setStep(prev => prev - 1)}>
                    <Ionicons name="arrow-back-circle" size={50} color="#666" />
                </TouchableOpacity>
            )}
        </View>
    );
};

export default CropAdvisoryScreen;
