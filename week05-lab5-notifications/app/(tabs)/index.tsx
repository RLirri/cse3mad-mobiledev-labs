import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function NotificationsLabScreen() {
  const [permissionStatus, setPermissionStatus] = useState("Unknown");
  const [lastNotificationTitle, setLastNotificationTitle] = useState("None");
  const [lastNotificationBody, setLastNotificationBody] = useState("None");
  const [lastResponse, setLastResponse] = useState("No interaction yet");

  const receivedListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    const setupNotifications = async () => {
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.HIGH,
        });
      }

      const existing = await Notifications.getPermissionsAsync();
      setPermissionStatus(existing.status);

      receivedListener.current =
          Notifications.addNotificationReceivedListener((notification) => {
            setLastNotificationTitle(notification.request.content.title ?? "No title");
            setLastNotificationBody(notification.request.content.body ?? "No body");
          });

      responseListener.current =
          Notifications.addNotificationResponseReceivedListener((response) => {
            const title = response.notification.request.content.title ?? "No title";
            setLastResponse(`Tapped notification: ${title}`);
          });
    };

    setupNotifications();

    return () => {
      receivedListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  const requestPermission = async () => {
    const result = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: true,
        allowSound: true,
      },
    });

    setPermissionStatus(result.status);

    if (result.status !== "granted") {
      Alert.alert("Permission not granted", "Notifications permission was not granted.");
    }
  };

  const sendInstantNotification = async () => {
    if (permissionStatus !== "granted") {
      Alert.alert("Permission required", "Please grant notification permission first.");
      return;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Instant Local Notification",
        body: "This notification was triggered immediately inside the app.",
      },
      trigger: null,
    });
  };

  const scheduleFiveSecondNotification = async () => {
    if (permissionStatus !== "granted") {
      Alert.alert("Permission required", "Please grant notification permission first.");
      return;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Scheduled Notification",
        body: "This notification was scheduled 5 seconds ago.",
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 5,
      },
    });
  };

  const clearScheduledNotifications = async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
    Alert.alert("Done", "All scheduled notifications have been cleared.");
  };

  return (
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>Week 05 — Notifications Lab</Text>
          <Text style={styles.subtitle}>
            Local notifications demo using Expo Notifications
          </Text>

          <View style={styles.card}>
            <Text style={styles.label}>Permission Status</Text>
            <Text style={styles.value}>{permissionStatus}</Text>

            <Pressable style={styles.button} onPress={requestPermission}>
              <Text style={styles.buttonText}>Request Permission</Text>
            </Pressable>
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>Actions</Text>

            <Pressable style={styles.button} onPress={sendInstantNotification}>
              <Text style={styles.buttonText}>Send Instant Notification</Text>
            </Pressable>

            <Pressable style={styles.button} onPress={scheduleFiveSecondNotification}>
              <Text style={styles.buttonText}>Schedule Notification (5s)</Text>
            </Pressable>

            <Pressable style={styles.buttonSecondary} onPress={clearScheduledNotifications}>
              <Text style={styles.buttonSecondaryText}>Clear Scheduled Notifications</Text>
            </Pressable>
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>Last Received Notification</Text>
            <Text style={styles.value}>Title: {lastNotificationTitle}</Text>
            <Text style={styles.value}>Body: {lastNotificationBody}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>Last Notification Interaction</Text>
            <Text style={styles.value}>{lastResponse}</Text>
          </View>

          <View style={styles.noteBox}>
            <Text style={styles.noteTitle}>Testing Notes</Text>
            <Text style={styles.noteText}>
              Local notifications can be demonstrated in development, but push notifications
              require a development build rather than Expo Go. Notification behavior also
              changes depending on whether the app is in the foreground, background, or
              terminated state.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    padding: 16,
    gap: 14,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
  },
  subtitle: {
    fontSize: 14,
    color: "#444",
  },
  card: {
    borderWidth: 1,
    borderColor: "#111",
    borderRadius: 12,
    padding: 14,
    gap: 10,
    backgroundColor: "#fff",
  },
  label: {
    fontSize: 15,
    fontWeight: "700",
  },
  value: {
    fontSize: 14,
    color: "#222",
  },
  button: {
    borderWidth: 1,
    borderColor: "#111",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "700",
  },
  buttonSecondary: {
    borderWidth: 1,
    borderColor: "#777",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: "center",
  },
  buttonSecondaryText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#444",
  },
  noteBox: {
    borderRadius: 12,
    padding: 14,
    backgroundColor: "#f5f5f5",
  },
  noteTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 6,
  },
  noteText: {
    fontSize: 13,
    color: "#444",
    lineHeight: 20,
  },
});