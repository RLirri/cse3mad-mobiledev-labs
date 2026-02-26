import React, { useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as SMS from "expo-sms";

type Params = { phone?: string };

export default function HomeScreen() {
    const router = useRouter();
    const { phone } = useLocalSearchParams<Params>();

    const [message, setMessage] = useState("Hello from Week 03 Lab!");
    const selectedPhone = typeof phone === "string" ? phone : "";

    const canSend = useMemo(() => selectedPhone.trim().length > 0 && message.trim().length > 0, [
        selectedPhone,
        message,
    ]);

    const handlePickContact = () => {
        router.push("/contacts");
    };

    const handleSendSms = async () => {
        if (!canSend) {
            Alert.alert("Missing info", "Please select a phone number and enter a message.");
            return;
        }

        const isAvailable = await SMS.isAvailableAsync();
        if (!isAvailable) {
            Alert.alert("Not supported", "SMS is not available on this device/emulator.");
            return;
        }

        try {
            // Opens native SMS composer (user confirms send)
            await SMS.sendSMSAsync([selectedPhone], message);
        } catch (e) {
            Alert.alert("Error", "Failed to open SMS composer.");
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Week 03 Lab: SMS Messenger</Text>

            <View style={styles.card}>
                <Text style={styles.label}>Selected phone number</Text>
                <Text style={styles.value}>{selectedPhone || "None selected"}</Text>

                <Pressable style={styles.btn} onPress={handlePickContact}>
                    <Text style={styles.btnText}>Get Phone Number</Text>
                </Pressable>
            </View>

            <View style={styles.card}>
                <Text style={styles.label}>Message</Text>
                <TextInput
                    style={styles.input}
                    value={message}
                    onChangeText={setMessage}
                    placeholder="Type your message..."
                    multiline
                />

                <Pressable
                    style={[styles.btn, !canSend && styles.btnDisabled]}
                    onPress={handleSendSms}
                    disabled={!canSend}
                >
                    <Text style={styles.btnText}>Send Message</Text>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, gap: 14, backgroundColor: "#fff" },
    title: { fontSize: 18, fontWeight: "800" },
    card: { borderWidth: 1, borderColor: "#111", borderRadius: 12, padding: 14, gap: 10 },
    label: { fontSize: 13, fontWeight: "700" },
    value: { fontSize: 14 },
    input: {
        borderWidth: 1,
        borderColor: "#111",
        borderRadius: 10,
        padding: 12,
        minHeight: 90,
        textAlignVertical: "top",
    },
    btn: {
        borderWidth: 1,
        borderColor: "#111",
        borderRadius: 10,
        paddingVertical: 12,
        alignItems: "center",
    },
    btnDisabled: { opacity: 0.4 },
    btnText: { fontWeight: "800" },
});