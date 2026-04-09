import React, { useMemo, useRef, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import MapView, {
  Circle,
  Marker,
  Polygon,
  Polyline,
  PROVIDER_DEFAULT,
  Region,
} from "react-native-maps";
import * as Location from "expo-location";

type LatLng = {
  latitude: number;
  longitude: number;
};

type CampusMarker = {
  id: string;
  coordinate: LatLng;
  title: string;
  description: string;
};

const INITIAL_REGION: Region = {
  latitude: -37.7212,
  longitude: 145.0468,
  latitudeDelta: 0.012,
  longitudeDelta: 0.012,
};

const CAMPUS_MARKERS: CampusMarker[] = [
  {
    id: "1",
    coordinate: {
      latitude: -37.721077,
      longitude: 145.047977,
    },
    title: "Agora",
    description: "Coffee stop",
  },
  {
    id: "2",
    coordinate: {
      latitude: -37.721407,
      longitude: 145.04653,
    },
    title: "Beth Gleeson Building",
    description: "Study and class area",
  },
  {
    id: "3",
    coordinate: {
      latitude: -37.72065,
      longitude: 145.0454,
    },
    title: "Library",
    description: "Reading and assignment work",
  },
];

const UNIVERSITY_ROUTE: LatLng[] = [
  { latitude: -37.7244, longitude: 145.0418 },
  { latitude: -37.7234, longitude: 145.0435 },
  { latitude: -37.7223, longitude: 145.0452 },
  { latitude: -37.721407, longitude: 145.04653 },
];

const WEEKLY_PLACES: LatLng[] = [
  { latitude: -37.722, longitude: 145.0447 },
  { latitude: -37.721077, longitude: 145.047977 },
  { latitude: -37.7202, longitude: 145.0461 },
  { latitude: -37.7209, longitude: 145.0438 },
];

export default function HomeScreen() {
  const mapRef = useRef<MapView | null>(null);

  const [region, setRegion] = useState<Region>(INITIAL_REGION);
  const [addressInput, setAddressInput] = useState("La Trobe University Bundoora");
  const [statusText, setStatusText] = useState("Ready.");
  const [locationStatus, setLocationStatus] = useState("Location not requested.");
  const [selectedPoint, setSelectedPoint] = useState<LatLng | null>(null);

  const circleCenter = useMemo<LatLng>(
      () => selectedPoint ?? CAMPUS_MARKERS[1].coordinate,
      [selectedPoint]
  );

  function animateToPoint(point: LatLng, latitudeDelta = 0.006, longitudeDelta = 0.006) {
    mapRef.current?.animateToRegion(
        {
          latitude: point.latitude,
          longitude: point.longitude,
          latitudeDelta,
          longitudeDelta,
        },
        800
    );
  }

  // Part A: basic marker interaction
  function handleMarkerPress(marker: CampusMarker) {
    setSelectedPoint(marker.coordinate);
    setStatusText(`Selected marker: ${marker.title}`);
    animateToPoint(marker.coordinate);
  }

  // Part D: reverse geocode from a tapped point
  async function handleMapPress(point: LatLng) {
    setSelectedPoint(point);

    try {
      const reverseResults = await Location.reverseGeocodeAsync(point);

      if (reverseResults.length === 0) {
        setStatusText(
            `Selected point: ${point.latitude.toFixed(6)}, ${point.longitude.toFixed(6)}`
        );
        return;
      }

      const address = reverseResults[0];
      const formattedAddress = [
        address.name,
        address.street,
        address.city,
        address.region,
        address.country,
      ]
          .filter(Boolean)
          .join(", ");

      setStatusText(`Reverse geocode: ${formattedAddress || "Address not available"}`);
    } catch {
      setStatusText("Reverse geocoding failed.");
    }
  }

  // Part D: request permission and get current location
  async function handleGetCurrentLocation() {
    try {
      setLocationStatus("Requesting location permission...");

      const permission = await Location.requestForegroundPermissionsAsync();

      if (permission.status !== "granted") {
        setLocationStatus("Permission denied.");
        Alert.alert("Permission denied", "Location permission is required to get current location.");
        return;
      }

      const currentPosition = await Location.getCurrentPositionAsync({});
      const point = {
        latitude: currentPosition.coords.latitude,
        longitude: currentPosition.coords.longitude,
      };

      setSelectedPoint(point);
      setLocationStatus(
          `Current location: ${point.latitude.toFixed(6)}, ${point.longitude.toFixed(6)}`
      );
      setStatusText("Current location loaded successfully.");
      animateToPoint(point);
    } catch {
      setLocationStatus("Failed to get current location.");
      setStatusText("Location request failed.");
    }
  }

  // Part D: geocode from typed address
  async function handleGeocodeAddress() {
    const query = addressInput.trim();

    if (!query) {
      Alert.alert("Missing input", "Please enter an address or place name.");
      return;
    }

    try {
      const results = await Location.geocodeAsync(query);

      if (results.length === 0) {
        setStatusText("No geocoding results found.");
        return;
      }

      const point = {
        latitude: results[0].latitude,
        longitude: results[0].longitude,
      };

      setSelectedPoint(point);
      setStatusText(
          `Geocode result: ${query} → ${point.latitude.toFixed(6)}, ${point.longitude.toFixed(6)}`
      );
      animateToPoint(point);
    } catch {
      setStatusText("Geocoding failed.");
    }
  }

  // Part C: show line to university
  function handleShowRoute() {
    animateToPoint(UNIVERSITY_ROUTE[UNIVERSITY_ROUTE.length - 1], 0.012, 0.012);
    setStatusText("Polyline route to university displayed.");
  }

  // Part C: show polygon of weekly places
  function handleShowPolygon() {
    animateToPoint(WEEKLY_PLACES[0], 0.015, 0.015);
    setStatusText("Polygon of weekly visited places displayed.");
  }

  function handleResetMap() {
    setSelectedPoint(null);
    setAddressInput("La Trobe University Bundoora");
    setStatusText("Map reset.");
    setLocationStatus("Location not requested.");
    mapRef.current?.animateToRegion(INITIAL_REGION, 800);
  }

  return (
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>Week 07 — Maps and Location</Text>
          <Text style={styles.subtitle}>
            Expo Maps, markers, circle, shapes, geocoding, and accessibility testing
          </Text>

          <View style={styles.mapCard}>
            <MapView
                ref={mapRef}
                // Part B: use default provider for better compatibility across devices
                provider={PROVIDER_DEFAULT}
                style={styles.map}
                initialRegion={INITIAL_REGION}
                onRegionChangeComplete={setRegion}
                onPress={(event) => handleMapPress(event.nativeEvent.coordinate)}
                accessibilityLabel="Interactive map with markers, route, polygon, and selected locations"
            >
              {/* Part A: basic markers */}
              {CAMPUS_MARKERS.map((marker) => (
                  <Marker
                      key={marker.id}
                      coordinate={marker.coordinate}
                      title={marker.title}
                      description={marker.description}
                      onPress={() => handleMarkerPress(marker)}
                  />
              ))}

              {/* Part B: circle around selected point or default marker */}
              <Circle
                  center={circleCenter}
                  radius={200}
                  strokeWidth={2}
                  strokeColor="rgba(37, 99, 235, 0.9)"
                  fillColor="rgba(37, 99, 235, 0.18)"
              />

              {/* Part C: polyline showing route to university */}
              <Polyline
                  coordinates={UNIVERSITY_ROUTE}
                  strokeWidth={4}
                  strokeColor="rgba(220, 38, 38, 0.95)"
              />

              {/* Part C: polygon showing places visited in a week */}
              <Polygon
                  coordinates={WEEKLY_PLACES}
                  strokeWidth={2}
                  strokeColor="rgba(22, 163, 74, 0.95)"
                  fillColor="rgba(22, 163, 74, 0.20)"
              />

              {/* Selected point from tap, geocode, or current location */}
              {selectedPoint ? (
                  <Marker
                      coordinate={selectedPoint}
                      title="Selected Point"
                      description="Generated from tap, geocoder, or current location"
                      pinColor="violet"
                  />
              ) : null}
            </MapView>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Map Status</Text>
            <Text style={styles.infoText}>
              Region: {region.latitude.toFixed(4)}, {region.longitude.toFixed(4)}
            </Text>
            <Text style={styles.infoText}>{locationStatus}</Text>
            <Text style={styles.infoText}>{statusText}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Part D — GeoCoder</Text>
            <TextInput
                style={styles.input}
                value={addressInput}
                onChangeText={setAddressInput}
                placeholder="Enter address or place name"
                accessibilityLabel="Address input field for geocoding"
            />

            <View style={styles.buttonRow}>
              <AppButton label="Geocode Address" onPress={handleGeocodeAddress} />
              <AppButton label="Get Current Location" onPress={handleGetCurrentLocation} />
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Part C — Lines and Shapes</Text>
            <View style={styles.buttonRow}>
              <AppButton label="Show Route" onPress={handleShowRoute} />
              <AppButton label="Show Polygon" onPress={handleShowPolygon} />
              <AppButton label="Reset Map" onPress={handleResetMap} />
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Part E — Accessibility</Text>
            <Text style={styles.infoText}>
              Test this screen with TalkBack on Android or VoiceOver on iOS. Buttons include
              accessibility labels, and the app updates visible status text after interactions.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
  );
}

function AppButton({
                     label,
                     onPress,
                   }: {
  label: string;
  onPress: () => void;
}) {
  return (
      <Pressable
          onPress={onPress}
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
          accessibilityRole="button"
          accessibilityLabel={label}
      >
        <Text style={styles.buttonText}>{label}</Text>
      </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  container: {
    padding: 16,
    gap: 14,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0f172a",
  },
  subtitle: {
    fontSize: 14,
    color: "#475569",
  },
  mapCard: {
    height: 360,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#dbe2ea",
    backgroundColor: "#fff",
  },
  map: {
    flex: 1,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#dbe2ea",
    padding: 14,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0f172a",
  },
  infoText: {
    fontSize: 14,
    color: "#334155",
    lineHeight: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "ios" ? 12 : 10,
    backgroundColor: "#fff",
    fontSize: 15,
  },
  buttonRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  button: {
    backgroundColor: "#0f172a",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
});