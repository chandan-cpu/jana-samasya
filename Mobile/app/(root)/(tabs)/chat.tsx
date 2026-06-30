/**
 * app/(tabs)/chat.tsx
 * Jana Samasya — Chat / Support Tab
 */

import React, { useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";

// ─── Design Tokens ────────────────────────────────────────────────────────────
const COLORS = {
  primary: "#0d631b",
  primaryContainer: "#2e7d32",
  onPrimary: "#ffffff",
  onPrimaryContainer: "#cbffc2",
  surface: "#f8f9fa",
  surfaceContainerHigh: "#e7e8e9",
  surfaceContainerLow: "#f3f4f5",
  onSurface: "#191c1d",
  onSurfaceVariant: "#40493d",
  outline: "#707a6c",
  outlineVariant: "#bfcaba",
  white: "#ffffff",
};

// ─── Message Type ─────────────────────────────────────────────────────────────
type Message = {
  id: string;
  text: string;
  from: "user" | "bot";
  time: string;
};

const INITIAL_MESSAGES: Message[] = [
  { id: "1", text: "নমস্কাৰ! Welcome to Jana Samasya Support. How can I help you today?", from: "bot", time: "09:00 AM" },
  { id: "2", text: "You can ask about your grievance status, filing a new complaint, or any general query.", from: "bot", time: "09:00 AM" },
];

function getTime() {
  return new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

// ─── Chat Screen ──────────────────────────────────────────────────────────────
export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState("");
  const listRef = useRef<FlatList>(null);

  function handleSend() {
    const trimmed = inputText.trim();
    if (!trimmed) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: trimmed,
      from: "user",
      time: getTime(),
    };

    const botMsg: Message = {
      id: (Date.now() + 1).toString(),
      text: "Thank you for reaching out. A support officer will review your query shortly. Your grievance ID will be shared via SMS.",
      from: "bot",
      time: getTime(),
    };

    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInputText("");
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  }

  function renderMessage({ item }: { item: Message }) {
    const isUser = item.from === "user";
    return (
      <View style={[styles.messageRow, isUser ? styles.messageRowUser : styles.messageRowBot]}>
        {!isUser && (
          <View style={styles.botAvatar}>
            <MaterialIcons name="support-agent" size={18} color={COLORS.primary} />
          </View>
        )}
        <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleBot]}>
          <Text style={[styles.bubbleText, isUser ? styles.bubbleTextUser : styles.bubbleTextBot]}>
            {item.text}
          </Text>
          <Text style={[styles.bubbleTime, isUser ? styles.bubbleTimeUser : styles.bubbleTimeBot]}>
            {item.time}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerAvatar}>
          <MaterialIcons name="support-agent" size={24} color={COLORS.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Support Chat</Text>
          <Text style={styles.headerSubtitle}>Jana Samasya Help Desk</Text>
        </View>
        <View style={styles.onlineDot} />
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        />

        {/* Input Bar */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.textInput}
            placeholder="Type your message..."
            placeholderTextColor={COLORS.outlineVariant}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
            accessibilityLabel="Chat message input"
          />
          <Pressable
            style={({ pressed }) => [
              styles.sendBtn,
              pressed && styles.sendBtnPressed,
              !inputText.trim() && styles.sendBtnDisabled,
            ]}
            onPress={handleSend}
            disabled={!inputText.trim()}
            accessibilityRole="button"
            accessibilityLabel="Send message"
          >
            <MaterialIcons name="send" size={20} color={COLORS.onPrimary} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.surface },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceContainerHigh,
    gap: 12,
  },
  headerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#e8f5e9",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.onSurface,
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
  },
  onlineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#4caf50",
  },
  messagesList: {
    padding: 16,
    gap: 12,
    paddingBottom: 8,
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
  },
  messageRowUser: { justifyContent: "flex-end" },
  messageRowBot: { justifyContent: "flex-start" },
  botAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#e8f5e9",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  bubble: {
    maxWidth: "75%",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 4,
  },
  bubbleUser: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 4,
  },
  bubbleBot: {
    backgroundColor: COLORS.white,
    borderBottomLeftRadius: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  bubbleText: { fontSize: 14, lineHeight: 20 },
  bubbleTextUser: { color: COLORS.onPrimary },
  bubbleTextBot: { color: COLORS.onSurface },
  bubbleTime: { fontSize: 10, alignSelf: "flex-end" },
  bubbleTimeUser: { color: COLORS.onPrimaryContainer },
  bubbleTimeBot: { color: COLORS.outline },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceContainerHigh,
    gap: 10,
  },
  textInput: {
    flex: 1,
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.onSurface,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  sendBtnPressed: { backgroundColor: COLORS.primaryContainer },
  sendBtnDisabled: { backgroundColor: COLORS.outlineVariant, shadowOpacity: 0 },
});
