import { useState } from "react";
import { View, Text, TextInput, StyleSheet, Pressable, Alert } from "react-native";
import { router } from "expo-router";
import { loginUser, logoutUser, registerUser, auth } from "../lib/firebase";

export default function AuthScreen() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleRegister = async () => {
        try {
            const user = await registerUser(email, password);
            Alert.alert("Success", `Registered: ${user.email}`);
            router.replace("/database");
        } catch (error: any) {
            Alert.alert("Registration failed", error.message ?? "Unknown error");
        }
    };

    const handleLogin = async () => {
        try {
            const user = await loginUser(email, password);
            Alert.alert("Success", `Logged in: ${user.email}`);
            router.replace("/database");
        } catch (error: any) {
            Alert.alert("Login failed", error.message ?? "Unknown error");
        }
    };

    const handleLogout = async () => {
        try {
            await logoutUser();
            Alert.alert("Success", "Logged out successfully.");
        } catch (error: any) {
            Alert.alert("Logout failed", error.message ?? "Unknown error");
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.heading}>Firebase Authentication</Text>

            <TextInput
                style={styles.input}
                placeholder="Enter email"
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
            />

            <TextInput
                style={styles.input}
                placeholder="Enter password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
            />

            <Pressable style={styles.button} onPress={handleRegister}>
                <Text style={styles.buttonText}>Sign Up</Text>
            </Pressable>

            <Pressable style={styles.button} onPress={handleLogin}>
                <Text style={styles.buttonText}>Sign In</Text>
            </Pressable>

            <Pressable style={[styles.button, styles.logoutButton]} onPress={handleLogout}>
                <Text style={styles.buttonText}>Logout</Text>
            </Pressable>

            <View style={styles.statusBox}>
                <Text style={styles.statusTitle}>Current User</Text>
                <Text style={styles.statusText}>
                    {auth.currentUser?.email ?? "No user is signed in"}
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        padding: 20,
    },
    heading: {
        fontSize: 24,
        fontWeight: "700",
        marginBottom: 20,
        textAlign: "center",
    },
    input: {
        borderWidth: 1,
        borderColor: "#d1d5db",
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        marginBottom: 14,
        fontSize: 16,
    },
    button: {
        backgroundColor: "#2563eb",
        paddingVertical: 14,
        borderRadius: 10,
        marginBottom: 12,
    },
    logoutButton: {
        backgroundColor: "#dc2626",
    },
    buttonText: {
        color: "#fff",
        textAlign: "center",
        fontSize: 16,
        fontWeight: "600",
    },
    statusBox: {
        marginTop: 20,
        padding: 16,
        borderRadius: 10,
        backgroundColor: "#f3f4f6",
    },
    statusTitle: {
        fontWeight: "700",
        marginBottom: 6,
    },
    statusText: {
        color: "#374151",
    },
});