import { initializeApp, getApps, getApp } from "firebase/app";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    User,
} from "firebase/auth";
import {
    getDatabase,
    ref,
    push,
    get,
    update,
} from "firebase/database";

const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getDatabase(app);

export type LabTask = {
    id: string;
    title: string;
    completed: boolean;
    ownerEmail: string;
    createdAt: string;
};

export async function registerUser(email: string, password: string): Promise<User> {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
}

export async function loginUser(email: string, password: string): Promise<User> {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
}

export async function logoutUser(): Promise<void> {
    await signOut(auth);
}

export async function addTask(title: string): Promise<void> {
    const currentUser = auth.currentUser;

    if (!currentUser?.email) {
        throw new Error("User must be logged in to add a task.");
    }

    const tasksRef = ref(db, "tasks");

    await push(tasksRef, {
        title: title.trim(),
        completed: false,
        ownerEmail: currentUser.email,
        createdAt: new Date().toISOString(),
    });
}

export async function getTasks(): Promise<LabTask[]> {
    const tasksRef = ref(db, "tasks");
    const snapshot = await get(tasksRef);

    if (!snapshot.exists()) {
        return [];
    }

    const data = snapshot.val();

    const tasks: LabTask[] = Object.keys(data).map((key) => ({
        id: key,
        title: String(data[key].title ?? ""),
        completed: Boolean(data[key].completed),
        ownerEmail: String(data[key].ownerEmail ?? ""),
        createdAt: String(data[key].createdAt ?? ""),
    }));

    return tasks.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function toggleTaskCompletion(taskId: string, currentValue: boolean): Promise<void> {
    const taskRef = ref(db, `tasks/${taskId}`);
    await update(taskRef, {
        completed: !currentValue,
    });
}