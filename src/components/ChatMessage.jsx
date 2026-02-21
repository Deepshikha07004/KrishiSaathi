import React from 'react';
import { View, Text } from 'react-native';
import styles from '../styles/globalStyles';

const ChatMessage = ({ message }) => (
    <View style={[styles.msgBubble, message.isUser ? styles.msgUser : styles.msgAI]}>
        <Text style={[styles.msgText, message.isUser ? styles.msgTextUser : styles.msgTextAI]}>{message.text}</Text>
    </View>
);

export default ChatMessage;
