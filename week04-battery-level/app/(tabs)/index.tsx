import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import * as Battery from "expo-battery";

export default function HomeScreen() {
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [batteryState, setBatteryState] = useState<Battery.BatteryState | null>(null);

  useEffect(() => {
    async function loadBattery() {
      const level = await Battery.getBatteryLevelAsync();
      const state = await Battery.getBatteryStateAsync();

      setBatteryLevel(level);
      setBatteryState(state);
    }

    loadBattery();

    const subscription = Battery.addBatteryLevelListener(({ batteryLevel }) => {
      setBatteryLevel(batteryLevel);
    });

    return () => subscription.remove();
  }, []);

  function getBatteryStateText(state: Battery.BatteryState | null) {
    switch (state) {
      case Battery.BatteryState.CHARGING:
        return "Charging";
      case Battery.BatteryState.FULL:
        return "Full";
      case Battery.BatteryState.UNPLUGGED:
        return "Unplugged";
      default:
        return "Unknown";
    }
  }

  return (
      <View style={styles.container}>
        <Text style={styles.title}>Battery Level App</Text>

        <Text style={styles.text}>
          Battery Level: {batteryLevel ? `${Math.round(batteryLevel * 100)}%` : "Loading..."}
        </Text>

        <Text style={styles.text}>
          Battery State: {getBatteryStateText(batteryState)}
        </Text>

        <Text style={styles.note}>
          Try unplugging the charger to observe state changes.
        </Text>
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },
  text: {
    fontSize: 18,
    marginVertical: 6,
  },
  note: {
    marginTop: 20,
    color: "gray",
  },
});