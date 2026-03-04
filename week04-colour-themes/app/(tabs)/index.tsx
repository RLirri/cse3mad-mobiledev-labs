import React from "react";
import { StyleSheet, Text, View, useColorScheme } from "react-native";

export default function HomeScreen() {
  const theme = useColorScheme();

  const isDark = theme === "dark";

  const styles = createStyles(isDark);

  return (
      <View style={styles.container}>
        <Text style={styles.title}>Colour Theme Demo</Text>

        <Text style={styles.text}>
          Current Theme: {theme}
        </Text>

        <Text style={styles.text}>
          Change your phone theme to see it update automatically.
        </Text>
      </View>
  );
}

function createStyles(isDark: boolean) {
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: isDark ? "#111" : "#fff",
    },
    title: {
      fontSize: 22,
      fontWeight: "bold",
      color: isDark ? "#fff" : "#000",
      marginBottom: 20,
    },
    text: {
      fontSize: 18,
      color: isDark ? "#ddd" : "#333",
    },
  });
}