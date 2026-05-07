import { useState } from "react";
import { StyleSheet, Text, View, Pressable, Alert } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [scanResult, setScanResult] = useState<string>("No QR code scanned yet.");

  if (!permission) {
    return (
        <View style={styles.centered}>
          <Text style={styles.message}>Checking camera permission...</Text>
        </View>
    );
  }

  if (!permission.granted) {
    return (
        <View style={styles.centered}>
          <Text style={styles.message}>
            Camera permission is required to scan QR codes.
          </Text>

          <Pressable style={styles.button} onPress={requestPermission}>
            <Text style={styles.buttonText}>Grant Camera Permission</Text>
          </Pressable>
        </View>
    );
  }

  const handleBarcodeScanned = ({ type, data }: { type: string; data: string }) => {
    if (scanned) return;

    setScanned(true);
    setScanResult(data);

    Alert.alert("QR Code Scanned", `Type: ${type}\nData: ${data}`);
  };

  return (
      <View style={styles.container}>
        <Text style={styles.title}>Week 09 Camera QR Reader</Text>

        <View style={styles.cameraContainer}>
          <CameraView
              style={styles.camera}
              facing="back"
              barcodeScannerSettings={{
                barcodeTypes: ["qr"],
              }}
              onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
          />
        </View>

        <View style={styles.resultBox}>
          <Text style={styles.resultLabel}>Scan Result:</Text>
          <Text style={styles.resultText}>{scanResult}</Text>
        </View>

        {scanned && (
            <Pressable
                style={styles.button}
                onPress={() => {
                  setScanned(false);
                  setScanResult("No QR code scanned yet.");
                }}
            >
              <Text style={styles.buttonText}>Tap to Scan Again</Text>
            </Pressable>
        )}
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  centered: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
    color: "#374151",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 20,
    marginBottom: 20,
  },
  cameraContainer: {
    flex: 1,
    overflow: "hidden",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#2563eb",
  },
  camera: {
    flex: 1,
  },
  resultBox: {
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#f3f4f6",
  },
  resultLabel: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 6,
  },
  resultText: {
    fontSize: 15,
    color: "#374151",
  },
  button: {
    marginTop: 18,
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    borderRadius: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
    textAlign: "center",
  },
});