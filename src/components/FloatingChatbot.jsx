import React, { useState, useEffect, useContext } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    ScrollView,
    ActivityIndicator,
    Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { AppContext } from '../context/AppContext';
import styles from '../styles/globalStyles';

import ChatMessage from './ChatMessage';

const FloatingChatbot = () => {
    const { lang, t, isChatVisible, setChatVisible, chatType, pinnedMessage, setPinnedMessage } = useContext(AppContext);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([]);
    const [isTyping, setIsTyping] = useState(false);

    useEffect(() => {
        if (isChatVisible) {
            const welcome = {
                id: Date.now(),
                text: chatType === 'Recommendation' ? t.cropRec : (chatType === 'Advisory' ? t.cropAdv : t.chatbotTitle),
                isUser: false
            };
            setMessages([welcome]);
        }
    }, [isChatVisible, chatType]);

    const handleSend = () => {
        if (!input.trim()) return;
        const userMsg = { id: Date.now(), text: input, isUser: true };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        // Dynamic AI Response based on User Data
        setTimeout(() => {
            let aiText = "";
            const context = pinnedMessage?.toLowerCase() || "";

            if (chatType === 'Recommendation') {
                const isRice = context.includes('rice');
                const isWheat = context.includes('wheat');

                aiText = `Based on your request for **${isRice ? 'Rice' : (isWheat ? 'Wheat' : 'your crop')}**:
                
- **Dynamic Plan**: Adjusting water level for your specific soil.
- **Action**: Use split-dose fertilizer as per your local schedule.
- **Caution**: Watch for pests in the upcoming high-humidity days.
- **Est. Yield**: Optimized based on your provided inputs.`;
            } else if (chatType === 'Advisory') {
                // Extract crop name from pinned message if possible
                const lines = pinnedMessage?.split('\n') || [];
                const cropLine = lines.find(l => l.includes('Crop:')) || '';
                const cropName = cropLine.split(': ')[1] || 'your crop';
                const issueLine = lines.find(l => l.includes('Issue:')) || '';
                const issueText = issueLine.split(': ')[1] || 'the reported issue';

                aiText = `I have analyzed the details for your **${cropName}**. 

Regarding **${issueText}**:
- **Diagnosis**: Likely nutrient deficiency or local pest activity.
- **Solution**: Apply the recommended treatment for ${cropName} immediately.
- **Monitoring**: Check leaves daily for further changes.`;
            } else {
                aiText = lang === 'en' ? `I'm here to help with your farming. You mentioned ${input.substring(0, 20)}...` : (lang === 'hi' ? "मैं आपकी खेती में मदद करने के लिए यहाँ हूँ।" : "আমি আপনার চাষাবাদে সাহায্য করতে এখানে আছি।");
            }

            setMessages(prev => [...prev, { id: Date.now() + 1, text: aiText, isUser: false }]);
            setIsTyping(false);
        }, 1500);
    };

    return (
        <Modal visible={isChatVisible} animationType="slide" transparent={true}>
            <View style={styles.modalOverlay}>
                <View style={styles.chatContainer}>
                    <View style={styles.chatHeader}>
                        <Text style={styles.chatHeaderText}>{t.chatbotTitle}</Text>
                        <TouchableOpacity onPress={() => setChatVisible(false)}>
                            <Ionicons name="close" size={28} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.chatBody} contentContainerStyle={{ paddingVertical: 10 }}>
                        {pinnedMessage && (
                            <View style={styles.pinnedBox}>
                                <View style={styles.pinnedHeader}>
                                    <Ionicons name="pin" size={16} color="#2E7D32" />
                                    <Text style={styles.pinnedTitle}>{t.pinnedAdvisory}</Text>
                                    <TouchableOpacity onPress={() => setPinnedMessage(null)}>
                                        <Ionicons name="close-circle" size={18} color="#666" />
                                    </TouchableOpacity>
                                </View>
                                <Text style={styles.pinnedText}>{pinnedMessage}</Text>
                            </View>
                        )}
                        {messages.map(m => (
                            <ChatMessage key={m.id} message={m} />
                        ))}
                        {isTyping && <ActivityIndicator size="small" color="#2E7D32" style={{ alignSelf: 'flex-start', marginLeft: 20 }} />}
                    </ScrollView>

                    <View style={styles.chatInputArea}>
                        <TextInput
                            style={styles.chatInput}
                            placeholder={t.typeMessage}
                            value={input}
                            onChangeText={setInput}
                        />
                        <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
                            <Ionicons name="send" size={20} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.micBtn} onPress={() => Speech.speak(t.typeMessage, { language: lang, rate: 1.05, pitch: 1.3 })}>
                            <Ionicons name="mic" size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default FloatingChatbot;
