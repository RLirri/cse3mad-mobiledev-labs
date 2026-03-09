import { SQLiteDatabase, SQLiteProvider, useSQLiteContext } from "expo-sqlite";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

type LoggedUser = {
  id: number;
  username: string;
  login_time: string;
};

export default function App() {
  return (
      <SQLiteProvider databaseName="week6_users.db" onInit={migrateDbIfNeeded}>
        <SafeAreaView style={styles.safe}>
          <View style={styles.container}>
            <Header />
            <Content />
          </View>
        </SafeAreaView>
      </SQLiteProvider>
  );
}

function Header() {
  const db = useSQLiteContext();
  const [version, setVersion] = useState("");

  useEffect(() => {
    async function loadVersion() {
      const result = await db.getFirstAsync<{ "sqlite_version()": string }>(
          "SELECT sqlite_version()"
      );
      setVersion(result?.["sqlite_version()"] ?? "Unknown");
    }

    loadVersion();
  }, [db]);

  return (
      <View style={styles.header}>
        <Text style={styles.title}>Week 06 — SQLite Logged Users</Text>
        <Text style={styles.subtitle}>SQLite version: {version}</Text>
      </View>
  );
}

function Content() {
  const db = useSQLiteContext();

  const [users, setUsers] = useState<LoggedUser[]>([]);
  const [username, setUsername] = useState("");
  const [loginTime, setLoginTime] = useState("");
  const [selectedUser, setSelectedUser] = useState<LoggedUser | null>(null);
  const [statusMessage, setStatusMessage] = useState("Ready.");
  const [isLoading, setIsLoading] = useState(false);

  const isEditMode = useMemo(() => selectedUser !== null, [selectedUser]);

  useEffect(() => {
    refreshUsers();
  }, []);

  async function refreshUsers() {
    try {
      setIsLoading(true);
      const result = await db.getAllAsync<LoggedUser>(
          "SELECT * FROM logged_users ORDER BY id DESC"
      );
      setUsers(result);
      setStatusMessage(`Loaded ${result.length} user record(s).`);
    } catch {
      setStatusMessage("Failed to load users.");
    } finally {
      setIsLoading(false);
    }
  }

  function resetForm() {
    setUsername("");
    setLoginTime("");
    setSelectedUser(null);
    setStatusMessage("Form cleared.");
  }

  function getCurrentTimestamp() {
    return new Date().toLocaleString();
  }

  function handleSelectUser(user: LoggedUser) {
    setSelectedUser(user);
    setUsername(user.username);
    setLoginTime(user.login_time);
    setStatusMessage(`Selected user ID ${user.id} for editing.`);
  }

  async function handleCreateUser() {
    const trimmedUsername = username.trim();
    const finalLoginTime = loginTime.trim() || getCurrentTimestamp();

    if (!trimmedUsername) {
      Alert.alert("Validation", "Please enter a username.");
      return;
    }

    try {
      const result = await db.runAsync(
          "INSERT INTO logged_users (username, login_time) VALUES (?, ?)",
          trimmedUsername,
          finalLoginTime
      );

      if (result.changes > 0) {
        setStatusMessage("User record created successfully.");
        resetForm();
        await refreshUsers();
      }
    } catch {
      setStatusMessage("Failed to create user record.");
    }
  }

  async function handleUpdateUser() {
    if (!selectedUser) {
      Alert.alert("No selection", "Please select a user record to update.");
      return;
    }

    const trimmedUsername = username.trim();
    const finalLoginTime = loginTime.trim() || getCurrentTimestamp();

    if (!trimmedUsername) {
      Alert.alert("Validation", "Username cannot be empty.");
      return;
    }

    try {
      const result = await db.runAsync(
          "UPDATE logged_users SET username = ?, login_time = ? WHERE id = ?",
          trimmedUsername,
          finalLoginTime,
          selectedUser.id
      );

      if (result.changes === 0) {
        setStatusMessage("No user record was updated.");
      } else {
        setStatusMessage(`Updated user ID ${selectedUser.id}.`);
        resetForm();
        await refreshUsers();
      }
    } catch {
      setStatusMessage("Failed to update user record.");
    }
  }

  async function handleDeleteUser() {
    if (!selectedUser) {
      Alert.alert("No selection", "Please select a user record to delete.");
      return;
    }

    Alert.alert(
        "Confirm delete",
        `Delete user "${selectedUser.username}"?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              try {
                const result = await db.runAsync(
                    "DELETE FROM logged_users WHERE id = ?",
                    selectedUser.id
                );

                if (result.changes === 0) {
                  setStatusMessage("No user record was deleted.");
                } else {
                  setStatusMessage(`Deleted user ID ${selectedUser.id}.`);
                  resetForm();
                  await refreshUsers();
                }
              } catch {
                setStatusMessage("Failed to delete user record.");
              }
            },
          },
        ]
    );
  }

  async function handleSearchUser() {
    const trimmedUsername = username.trim();

    if (!trimmedUsername) {
      Alert.alert("Validation", "Please enter a username to search.");
      return;
    }

    try {
      setIsLoading(true);
      const result = await db.getAllAsync<LoggedUser>(
          "SELECT * FROM logged_users WHERE username LIKE ? ORDER BY id DESC",
          `%${trimmedUsername}%`
      );
      setUsers(result);
      setStatusMessage(`Search completed: ${result.length} matching record(s).`);
    } catch {
      setStatusMessage("Failed to search user records.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRecreateTable() {
    Alert.alert(
        "Recreate table",
        "This will remove all existing logged users. Continue?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Recreate",
            style: "destructive",
            onPress: async () => {
              try {
                await db.execAsync("DROP TABLE IF EXISTS logged_users;");
                await db.execAsync(`
                CREATE TABLE IF NOT EXISTS logged_users (
                  id INTEGER PRIMARY KEY NOT NULL,
                  username TEXT NOT NULL,
                  login_time TEXT NOT NULL
                );
              `);

                setUsers([]);
                resetForm();
                setStatusMessage("logged_users table recreated successfully.");
              } catch {
                setStatusMessage("Failed to recreate table.");
              }
            },
          },
        ]
    );
  }

  return (
      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Form</Text>

          <TextInput
              style={styles.input}
              placeholder="Enter username"
              value={username}
              onChangeText={setUsername}
          />

          <TextInput
              style={styles.input}
              placeholder="Enter login time (optional)"
              value={loginTime}
              onChangeText={setLoginTime}
          />

          <View style={styles.formActions}>
            <Pressable style={styles.primaryButton} onPress={handleCreateUser}>
              <Text style={styles.primaryButtonText}>Create</Text>
            </Pressable>

            <Pressable
                style={[styles.primaryButton, !isEditMode && styles.disabledButton]}
                onPress={handleUpdateUser}
                disabled={!isEditMode}
            >
              <Text style={styles.primaryButtonText}>Update</Text>
            </Pressable>

            <Pressable
                style={[styles.dangerButton, !isEditMode && styles.disabledButton]}
                onPress={handleDeleteUser}
                disabled={!isEditMode}
            >
              <Text style={styles.dangerButtonText}>Delete</Text>
            </Pressable>
          </View>

          <View style={styles.formActions}>
            <Pressable style={styles.secondaryButton} onPress={handleSearchUser}>
              <Text style={styles.secondaryButtonText}>Search</Text>
            </Pressable>

            <Pressable style={styles.secondaryButton} onPress={refreshUsers}>
              <Text style={styles.secondaryButtonText}>Refresh</Text>
            </Pressable>

            <Pressable style={styles.secondaryButton} onPress={resetForm}>
              <Text style={styles.secondaryButtonText}>Reset Form</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Database Controls</Text>

          <View style={styles.formActions}>
            <Pressable style={styles.secondaryButton} onPress={handleRecreateTable}>
              <Text style={styles.secondaryButtonText}>Recreate Table</Text>
            </Pressable>
          </View>

          <Text style={styles.statusText}>
            Status: {isLoading ? "Loading..." : statusMessage}
          </Text>

          <Text style={styles.selectionText}>
            Selected: {selectedUser ? `${selectedUser.username} (ID ${selectedUser.id})` : "None"}
          </Text>
        </View>

        <View style={[styles.card, styles.listCard]}>
          <Text style={styles.sectionTitle}>Logged Users</Text>

          {users.length === 0 ? (
              <Text style={styles.emptyText}>No user records found.</Text>
          ) : (
              <FlatList
                  data={users}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item }) => {
                    const isSelected = selectedUser?.id === item.id;

                    return (
                        <Pressable
                            onPress={() => handleSelectUser(item)}
                            style={[
                              styles.userRow,
                              isSelected && styles.selectedUserRow,
                            ]}
                        >
                          <Text style={styles.userRowTitle}>
                            {item.username} <Text style={styles.userRowId}>#{item.id}</Text>
                          </Text>
                          <Text style={styles.userRowSub}>Login Time: {item.login_time}</Text>
                        </Pressable>
                    );
                  }}
              />
          )}
        </View>
      </View>
  );
}

async function migrateDbIfNeeded(db: SQLiteDatabase) {
  const DATABASE_VERSION = 1;

  let currentDbVersion =
      (await db.getFirstAsync<{ user_version: number }>("PRAGMA user_version"))?.user_version ?? 0;

  if (currentDbVersion >= DATABASE_VERSION) {
    return;
  }

  if (currentDbVersion === 0) {
    await db.execAsync(`
      PRAGMA journal_mode = 'wal';

      CREATE TABLE IF NOT EXISTS logged_users (
        id INTEGER PRIMARY KEY NOT NULL,
        username TEXT NOT NULL,
        login_time TEXT NOT NULL
      );
    `);

    await db.runAsync(
        "INSERT INTO logged_users (username, login_time) VALUES (?, ?)",
        "alice",
        "2026-03-09 09:00"
    );
    await db.runAsync(
        "INSERT INTO logged_users (username, login_time) VALUES (?, ?)",
        "bob",
        "2026-03-09 09:15"
    );
    await db.runAsync(
        "INSERT INTO logged_users (username, login_time) VALUES (?, ?)",
        "charlie",
        "2026-03-09 09:30"
    );

    currentDbVersion = 1;
  }

  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#f7f8fa",
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
  },
  header: {
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
    color: "#4b5563",
  },
  content: {
    flex: 1,
    gap: 12,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    gap: 12,
  },
  listCard: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    backgroundColor: "#ffffff",
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  formActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  primaryButton: {
    backgroundColor: "#111827",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontWeight: "600",
  },
  secondaryButton: {
    backgroundColor: "#eef2f7",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  secondaryButtonText: {
    color: "#111827",
    fontWeight: "600",
  },
  dangerButton: {
    backgroundColor: "#fee2e2",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  dangerButtonText: {
    color: "#991b1b",
    fontWeight: "600",
  },
  disabledButton: {
    opacity: 0.45,
  },
  statusText: {
    fontSize: 14,
    color: "#374151",
  },
  selectionText: {
    fontSize: 14,
    color: "#374151",
  },
  emptyText: {
    color: "#6b7280",
    fontSize: 14,
  },
  userRow: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    backgroundColor: "#ffffff",
  },
  selectedUserRow: {
    borderColor: "#111827",
    backgroundColor: "#f3f4f6",
  },
  userRowTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },
  userRowId: {
    fontWeight: "400",
    color: "#6b7280",
  },
  userRowSub: {
    marginTop: 4,
    fontSize: 13,
    color: "#4b5563",
  },
});