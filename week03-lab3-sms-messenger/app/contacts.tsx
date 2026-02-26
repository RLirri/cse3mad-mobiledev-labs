import React, { useEffect, useMemo, useState } from "react";
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import * as Contacts from "expo-contacts";

type PickableContact = {
    id: string;
    name: string;
    phone: string;
};

export default function ContactsScreen() {
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState<PickableContact[]>([]);

    useEffect(() => {
        const run = async () => {
            setLoading(true);

            const { status } = await Contacts.requestPermissionsAsync();
            if (status !== "granted") {
                setLoading(false);
                Alert.alert("Permission required", "Contacts access is required to pick a phone number.");
                return;
            }

            const result = await Contacts.getContactsAsync({
                fields: [Contacts.Fields.PhoneNumbers],
                pageSize: 200,
            });

            const mapped: PickableContact[] =
                result.data
                    .map((c) => {
                        const phone = c.phoneNumbers?.[0]?.number ?? "";
                        const name = c.name ?? "Unnamed";
                        return phone ? { id: c.id, name, phone } : null;
                    })
                    .filter(Boolean) as PickableContact[];

            setItems(mapped);
            setLoading(false);
        };

        run();
    }, []);

    const subtitle = useMemo(() => {
        if (loading) return "Loading contacts…";
        return `${items.length} contacts with phone numbers`;
    }, [loading, items.length]);

    const pick = (phone: string) => {
        // Return value to Home using query param
        router.replace({ pathname: "/", params: { phone } });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Read Contacts</Text>
            <Text style={styles.sub}>{subtitle}</Text>

            <FlatList
                data={items}
                keyExtractor={(x) => x.id}
                contentContainerStyle={{ paddingVertical: 8 }}
                renderItem={({ item }) => (
                    <Pressable style={styles.row} onPress={() => pick(item.phone)}>
                        <Text style={styles.name}>{item.name}</Text>
                        <Text style={styles.phone}>{item.phone}</Text>
                    </Pressable>
                )}
                ListEmptyComponent={
                    !loading ? <Text style={styles.empty}>No contacts with phone numbers found.</Text> : null
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: "#fff" },
    title: { fontSize: 18, fontWeight: "800" },
    sub: { marginTop: 6, color: "#444" },
    row: {
        borderWidth: 1,
        borderColor: "#111",
        borderRadius: 12,
        padding: 12,
        marginBottom: 10,
        gap: 4,
    },
    name: { fontSize: 15, fontWeight: "800" },
    phone: { fontSize: 13, color: "#333" },
    empty: { marginTop: 16, color: "#444" },
});