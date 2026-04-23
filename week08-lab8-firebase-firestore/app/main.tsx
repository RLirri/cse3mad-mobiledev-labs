import { View, Text, StyleSheet, Pressable, Alert } from "react-native";
import { router } from "expo-router";
import { auth, logoutUser } from "../lib/firebase";

export default function MainScreen() {
    const currentEmail = auth.currentUser?.email ?? "No user signed in";

    const handleLogout = async () => {
        try {
            await logoutUser();
            Alert.alert("Success", "Logged out successfully.");
            router.replace("/auth");
        } catch (error: any) {
            Alert.alert("Logout failed", error.message ?? "Unknown error");
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Main Page</Text>
            <Text style={styles.emailLabel}>Logged in user:</Text>
            <Text style={styles.email}>{currentEmail}</Text>

            <Pressable style={styles.button} onPress={() => router.push("/database")}>
                <Text style={styles.buttonText}>Go to Realtime Database</Text>
            </Pressable>

            <Pressable style={[styles.button, styles.logoutButton]} onPress={handleLogout}>
                <Text style={styles.buttonText}>Logout</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: "700",
        marginBottom: 16,
    },
    emailLabel: {
        fontSize: 16,
        color: "#6b7280",
        marginBottom: 6,
    },
    email: {
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 28,
        textAlign: "center",
    },
    button: {
        width: "100%",
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
});