import React, { useMemo, useRef, useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  Pressable,
  View,
  ActivityIndicator,
  Keyboard,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { WebView } from "react-native-webview";

function normalizeUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const withScheme = /^https?:\/\//i.test(trimmed)
      ? trimmed
      : `https://${trimmed}`;

  try {
    const url = new URL(withScheme);
    if (!url.hostname) return null;
    return url.toString();
  } catch {
    return null;
  }
}

export default function IndexScreen() {
  const inputRef = useRef<TextInput>(null);
  const webRef = useRef<WebView>(null);

  const [input, setInput] = useState("www.hello.com");
  const [currentUrl, setCurrentUrl] = useState(
      normalizeUrl("www.hello.com") ?? "https://example.com"
  );

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);

  const normalizedInput = useMemo(() => normalizeUrl(input), [input]);
  const canGo = useMemo(() => normalizedInput !== null, [normalizedInput]);

  const handleGo = () => {
    const url = normalizeUrl(input);

    if (!url) {
      setError("Please enter a valid URL (e.g., google.com or https://google.com).");
      return;
    }

    setError("");
    Keyboard.dismiss();
    setProgress(0);
    setLoading(true);
    setCurrentUrl(url);
  };

  const handleClear = () => {
    setInput("");
    setError("");
    // Immediately refocus after clearing (super nice UX on Android)
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const handleBack = () => webRef.current?.goBack();
  const handleForward = () => webRef.current?.goForward();
  const handleReload = () => webRef.current?.reload();

  return (
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
            style={styles.safe}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.container}>
            {/* Top Input Row */}
            <View style={styles.topRow}>
              {/* Pressable wrapper ensures focus always works on Android */}
              <Pressable
                  style={styles.inputWrap}
                  onPress={() => inputRef.current?.focus()}
                  android_ripple={{ color: "rgba(0,0,0,0.05)" }}
              >
                <TextInput
                    ref={inputRef}
                    style={styles.input}
                    value={input}
                    onChangeText={setInput}
                    placeholder="Enter a URL (e.g., example.com)"
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="url"
                    returnKeyType="go"
                    onSubmitEditing={handleGo}
                    editable
                    selectTextOnFocus
                />

                {/* Clear button: positioned but doesn't block input focus */}
                {input.length > 0 && (
                    <Pressable
                        onPress={handleClear}
                        style={styles.clearBtn}
                        hitSlop={10}
                    >
                      <Text style={styles.clearText}>✕</Text>
                    </Pressable>
                )}
              </Pressable>

              <Pressable
                  onPress={handleGo}
                  disabled={!canGo}
                  style={({ pressed }) => [
                    styles.goButton,
                    !canGo && styles.btnDisabled,
                    pressed && canGo && styles.btnPressed,
                  ]}
              >
                <Text style={styles.goText}>Go</Text>
              </Pressable>
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            {/* Toolbar */}
            <View style={styles.toolbar}>
              <Pressable
                  onPress={handleBack}
                  disabled={!canGoBack}
                  style={({ pressed }) => [
                    styles.toolBtn,
                    !canGoBack && styles.btnDisabled,
                    pressed && canGoBack && styles.btnPressed,
                  ]}
              >
                <Text style={styles.toolText}>◀</Text>
              </Pressable>

              <Pressable
                  onPress={handleForward}
                  disabled={!canGoForward}
                  style={({ pressed }) => [
                    styles.toolBtn,
                    !canGoForward && styles.btnDisabled,
                    pressed && canGoForward && styles.btnPressed,
                  ]}
              >
                <Text style={styles.toolText}>▶</Text>
              </Pressable>

              <Pressable
                  onPress={handleReload}
                  style={({ pressed }) => [styles.toolBtn, pressed && styles.btnPressed]}
              >
                <Text style={styles.toolText}>⟳</Text>
              </Pressable>

              <Text style={styles.urlText} numberOfLines={1}>
                {currentUrl}
              </Text>
            </View>

            {/* Web Area */}
            <Pressable style={styles.webBox} onPress={Keyboard.dismiss}>
              {loading && (
                  <View style={styles.progressTrack}>
                    <View
                        style={[
                          styles.progressFill,
                          { width: `${Math.round(progress * 100)}%` },
                        ]}
                    />
                  </View>
              )}

              {loading && (
                  <View style={styles.loadingOverlay} pointerEvents="none">
                    <ActivityIndicator size="small" />
                    <Text style={styles.loadingText}>Loading…</Text>
                  </View>
              )}

              <WebView
                  ref={webRef}
                  source={{ uri: currentUrl }}
                  onLoadStart={() => {
                    setLoading(true);
                    setProgress(0);
                  }}
                  onLoadProgress={(e) => setProgress(e.nativeEvent.progress)}
                  onLoadEnd={() => setLoading(false)}
                  onError={() => {
                    setLoading(false);
                    setError("Failed to load the page. Check your URL or internet connection.");
                  }}
                  onNavigationStateChange={(navState) => {
                    setCanGoBack(navState.canGoBack);
                    setCanGoForward(navState.canGoForward);
                  }}
                  startInLoadingState
              />
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  container: { flex: 1, padding: 14, gap: 10 },

  topRow: { flexDirection: "row", gap: 10, alignItems: "center" },

  inputWrap: { flex: 1, position: "relative" },
  input: {
    borderWidth: 1,
    borderColor: "#111",
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 12,
    minHeight: 48,
    borderRadius: 10,
    fontSize: 16,
    paddingRight: 38,
  },

  clearBtn: {
    position: "absolute",
    right: 10,
    top: 12,
    height: 24,
    width: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#111",
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  clearText: { fontSize: 12, fontWeight: "800" },

  goButton: {
    borderWidth: 1,
    borderColor: "#111",
    borderRadius: 10,
    minHeight: 48,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 86,
  },
  goText: { fontSize: 16, fontWeight: "800" },

  btnPressed: { opacity: 0.75 },
  btnDisabled: { opacity: 0.4 },

  errorText: { color: "#b00020", fontSize: 14 },

  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#111",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  toolBtn: {
    borderWidth: 1,
    borderColor: "#111",
    borderRadius: 10,
    height: 38,
    width: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  toolText: { fontSize: 16, fontWeight: "900" },
  urlText: { flex: 1, fontSize: 12, color: "#333", marginLeft: 4 },

  webBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#111",
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
  },

  progressTrack: { height: 3, backgroundColor: "#eee", width: "100%" },
  progressFill: { height: 3, backgroundColor: "#111" },

  loadingOverlay: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 10,
    backgroundColor: "rgba(255,255,255,0.92)",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  loadingText: { fontSize: 12, fontWeight: "600" },
});
