# Week 01 – React Native UI & Web Request Lab

**Course:** CSE3MAD Mobile Application Development
**Topic:** Core UI Components, State Management, and WebView Integration

---

## 1. Lab Objective

This lab focused on building a simple browser-like mobile interface using React Native (Expo). The application includes:

* A `TextInput` for URL entry
* A `Go` button
* A `WebView` to load web content
* Basic navigation controls (back, forward, reload)
* Loading state management

The goal was to practice **core UI components, state management, event handling, and debugging in a real mobile environment**.

---

## 2. Key Concepts Learned

### 2.1 Component-Based Architecture

React Native applications are built using **functional components**.

```tsx
export default function IndexScreen() { ... }
```

Each screen is a reusable UI unit composed of:

* Layout components (`View`, `SafeAreaView`)
* Input components (`TextInput`)
* Interactive components (`Pressable`)
* External modules (`WebView`)

React Native uses a **declarative UI approach**, meaning the UI reflects the current state.

---

### 2.2 State Management (`useState`)

We used React Hooks to manage application state:

```tsx
const [input, setInput] = useState("");
const [currentUrl, setCurrentUrl] = useState("");
const [loading, setLoading] = useState(false);
```

Key learning:

* UI automatically updates when state changes.
* State drives rendering.
* Proper state separation improves reliability and maintainability.

---

### 2.3 Derived State (`useMemo`)

We optimized validation logic using:

```tsx
const normalizedInput = useMemo(() => normalizeUrl(input), [input]);
```

This prevents unnecessary recalculation and improves performance.

Learning:

* `useMemo` is used for computed values.
* Avoid expensive recalculations on every render.

---

### 2.4 URL Validation & Data Sanitization

We implemented a helper function:

```tsx
function normalizeUrl(raw: string): string | null { ... }
```

Why important:

* Prevents invalid URLs from crashing WebView.
* Ensures proper `https://` prefix.
* Improves robustness and user experience.

This is an example of **defensive programming**.

---

### 2.5 Event Handling

We handled user interactions through callbacks:

```tsx
onPress={handleGo}
onSubmitEditing={handleGo}
onChangeText={setInput}
```

Learning:

* React Native uses event-driven architecture.
* UI interaction triggers state updates.
* Separation of logic (`handleGo`) improves clarity.

---

### 2.6 WebView Integration

We integrated:

```tsx
import { WebView } from "react-native-webview";
```

Key lifecycle events:

```tsx
onLoadStart
onLoadProgress
onLoadEnd
onNavigationStateChange
```

Learning:

* WebView is a native bridge component.
* Mobile differs from web: some modules are platform-specific.
* Platform limitations (e.g., WebView unsupported on Expo Web).

---

### 2.7 Platform Differences 

We encountered:

* Expo Web does **not** support `react-native-webview`.
* Tunnel vs LAN network mode differences.
* Emulator keyboard and touch handling issues.

Learning:

* React Native runs on multiple platforms (iOS, Android, Web).
* Not all native modules are cross-platform.
* Debugging mobile environments differs from browser debugging.

---

### 2.8 Keyboard & Focus Handling

We used:

```tsx
useRef<TextInput>()
KeyboardAvoidingView
Keyboard.dismiss()
```

Learning:

* Mobile input handling requires explicit focus management.
* Touch responders and native views can intercept events.
* Android and iOS behave differently.

---

## 3. React Native Application Structure

A typical Expo Router project:

```
week01-lab1-web-requester/
│
├── app/
│   ├── index.tsx        ← Main screen
│   └── _layout.tsx      ← Navigation layout
│
├── assets/
├── package.json
├── app.json
└── tsconfig.json
```

### Core Layers

| Layer         | Purpose                                 |
| ------------- | --------------------------------------- |
| UI Layer      | Views and components                    |
| State Layer   | React Hooks (`useState`, `useMemo`)     |
| Logic Layer   | Helper functions (e.g., `normalizeUrl`) |
| Native Bridge | WebView and platform APIs               |

---

## 4. Architecture Pattern Observed

This lab follows a simplified **React Component Architecture**:

```
User Input → Event Handler → State Update → Re-render → UI Update
```

This demonstrates:

* Unidirectional data flow
* Declarative UI updates
* Component isolation

---

## 5. What This Lab Teaches

Beyond just “button + input + web request”, this lab demonstrates:

1. Declarative UI design
2. Controlled components
3. Native module integration
4. Platform debugging
5. Defensive validation
6. Event-driven architecture
7. State-driven rendering

These are foundational for:

* API integration
* Authentication screens
* Form validation
* Real-world mobile apps

---

## 6. Challenges Faced & Debugging Insights

| Issue                 | Cause                            | Solution                      |
| --------------------- | -------------------------------- | ----------------------------- |
| WebView not supported | Running in web platform          | Use native device or emulator |
| Tunnel error          | Missing ngrok dependency         | Install `@expo/ngrok`         |
| Cannot edit URL       | Emulator focus/keyboard handling | Use ref + explicit focus      |
| Request timeout       | Network configuration            | Use `--tunnel` mode           |

Learning:

Mobile debugging requires understanding:

* Network topology
* Native bridges
* Platform permissions
* Emulator limitations

---

## 7. Reflection & TakeAway

This lab demonstrates the importance of:

* Writing defensive code
* Managing platform differences
* Structuring UI clearly
* Separating logic from presentation
* Using modern React hooks effectively

It forms the foundation for building scalable mobile applications.

---

## 8. Conclusion

Week 02 introduced the fundamental mechanics of React Native:

* UI composition
* State management
* Event handling
* Native module usage
* Cross-platform debugging

This lab builds the conceptual base for more advanced topics such as:

* API integration
* Authentication flows
* Navigation
* State architecture (Context / Redux)
* Production-ready mobile applications

