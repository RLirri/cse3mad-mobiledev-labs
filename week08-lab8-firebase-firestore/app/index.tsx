import { View, Text, StyleSheet, Pressable } from "react-native";
import { router } from "expo-router";

export default function HomeScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Week 08 Lab 8</Text>
            <Text style={styles.subtitle}>Firebase Authentication + Realtime Database</Text>

            <Pressable style={styles.button} onPress={() => router.push("/auth")}>
                <Text style={styles.buttonText}>Go to Authentication</Text>
            </Pressable>

            <Pressable style={styles.button} onPress={() => router.push("/database")}>
                <Text style={styles.buttonText}>Go to Database</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
        justifyContent: "center",
        backgroundColor: "#fff",
    },
    title: {
        fontSize: 28,
        fontWeight: "700",
        marginBottom: 8,
        textAlign: "center",
    },
    subtitle: {
        fontSize: 16,
        color: "#555",
        marginBottom: 28,
        textAlign: "center",
    },
    button: {
        backgroundColor: "#2563eb",
        paddingVertical: 14,
        paddingHorizontal: 18,
        borderRadius: 10,
        marginBottom: 14,
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
        textAlign: "center",
    },
});