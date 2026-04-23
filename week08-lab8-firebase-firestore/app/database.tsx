import { useEffect, useState } from "react";
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    Pressable,
    FlatList,
    Alert,
} from "react-native";
import { router } from "expo-router";
import { addTask, getTasks, toggleTaskCompletion, auth, logoutUser, LabTask } from "../lib/firebase";

export default function DatabaseScreen() {
    const [title, setTitle] = useState("");
    const [tasks, setTasks] = useState<LabTask[]>([]);
    const [loading, setLoading] = useState(false);

    const loadTasks = async () => {
        try {
            setLoading(true);
            const fetchedTasks = await getTasks();
            setTasks(fetchedTasks);
        } catch (error: any) {
            Alert.alert("Load failed", error.message ?? "Unknown error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTasks();
    }, []);

    const handleAddTask = async () => {
        if (!auth.currentUser) {
            Alert.alert("Not allowed", "Please sign in first.");
            return;
        }

        if (!title.trim()) {
            Alert.alert("Validation", "Please enter a task title.");
            return;
        }

        try {
            await addTask(title);
            setTitle("");
            await loadTasks();
            Alert.alert("Success", "Task added to Realtime Database.");
        } catch (error: any) {
            Alert.alert("Add failed", error.message ?? "Unknown error");
        }
    };

    const handleToggle = async (taskId: string, currentValue: boolean) => {
        try {
            await toggleTaskCompletion(taskId, currentValue);
            await loadTasks();
            Alert.alert("Updated", "Task updated successfully.");
        } catch (error: any) {
            Alert.alert("Update failed", error.message ?? "Unknown error");
        }
    };

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
            <Text style={styles.heading}>Realtime Database Tasks</Text>

            <Text style={styles.userText}>
                Signed in as: {auth.currentUser?.email ?? "No active user"}
            </Text>

            <TextInput
                style={styles.input}
                placeholder="Enter task title"
                value={title}
                onChangeText={setTitle}
            />

            <Pressable style={styles.button} onPress={handleAddTask}>
                <Text style={styles.buttonText}>Add Task</Text>
            </Pressable>

            <Pressable style={[styles.button, styles.secondaryButton]} onPress={loadTasks}>
                <Text style={styles.buttonText}>{loading ? "Loading..." : "Refresh Tasks"}</Text>
            </Pressable>

            <Pressable style={[styles.button, styles.logoutButton]} onPress={handleLogout}>
                <Text style={styles.buttonText}>Logout</Text>
            </Pressable>

            <FlatList
                data={tasks}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingTop: 12, paddingBottom: 20 }}
                ListEmptyComponent={<Text style={styles.emptyText}>No tasks found yet.</Text>}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>{item.title}</Text>
                        <Text style={styles.cardMeta}>Owner: {item.ownerEmail}</Text>
                        <Text style={styles.cardMeta}>
                            Status: {item.completed ? "Completed" : "Not completed"}
                        </Text>

                        <Pressable
                            style={[
                                styles.smallButton,
                                { backgroundColor: item.completed ? "#f59e0b" : "#16a34a" },
                            ]}
                            onPress={() => handleToggle(item.id, item.completed)}
                        >
                            <Text style={styles.smallButtonText}>
                                {item.completed ? "Mark Incomplete" : "Mark Complete"}
                            </Text>
                        </Pressable>
                    </View>
                )}
            />
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
        marginBottom: 12,
        textAlign: "center",
    },
    userText: {
        marginBottom: 12,
        color: "#374151",
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
    secondaryButton: {
        backgroundColor: "#4b5563",
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
    emptyText: {
        textAlign: "center",
        color: "#6b7280",
        marginTop: 20,
    },
    card: {
        backgroundColor: "#f9fafb",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#e5e7eb",
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 6,
    },
    cardMeta: {
        color: "#4b5563",
        marginBottom: 4,
    },
    smallButton: {
        marginTop: 10,
        paddingVertical: 10,
        borderRadius: 8,
    },
    smallButtonText: {
        color: "#fff",
        textAlign: "center",
        fontWeight: "600",
    },
});