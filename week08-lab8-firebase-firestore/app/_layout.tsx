import { Stack } from "expo-router";

export default function RootLayout() {
    return (
        <Stack screenOptions={{ headerTitleAlign: "center" }}>
            <Stack.Screen name="index" options={{ title: "Week 8 Lab" }} />
            <Stack.Screen name="auth" options={{ title: "Firebase Auth" }} />
            <Stack.Screen name="database" options={{ title: "Realtime Database" }} />
        </Stack>
    );
}