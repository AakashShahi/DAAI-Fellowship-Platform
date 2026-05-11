# DAAI Fellowship Platform - Frontend (Web App) Structure Guide

This document explains the **frontend architecture of the DAAI Web App** using:

- React (Vite)
- Zustand (Global Client State)
- TanStack React Query (Server State)
- Axios (API Layer)

This structure is designed for **scalable, production-level development**.

---

# Frontend Folder Structure

```txt
daai-webapp/src/
├── api/
├── assets/
├── auth/
├── components/
├── hooks/
├── layouts/
├── pages/
├── routers/
├── services/
├── store/
├── utils/
├── App.jsx
├── App.css
├── index.css
└── main.jsx
```

---

# Architecture Overview

The frontend follows a **layered architecture**:

```txt
UI (Pages)
   ↓
Hooks (React Query)
   ↓
Services (Business API layer)
   ↓
Axios Client
   ↓
Backend API
```

Zustand is used separately for **global client state**:

```txt
UI → Zustand Store → Global State (auth, UI state, theme)
```

---

# 1. api/ (Axios Client Layer)

### Purpose:

Single configured Axios instance for all API requests.

```js
// api/axiosClient.js
import axios from "axios";

const axiosClient = axios.create({
  baseURL: "http://127.0.0.1:8000/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach token automatically
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default axiosClient;
```

---

# 2. services/ (API Business Layer)

### Purpose:

All backend API calls are defined here.

```js
// services/authService.js
import axiosClient from "../api/axiosClient";

export const loginUser = async (payload) => {
  const res = await axiosClient.post("/auth/login", payload);
  return res.data;
};

export const registerUser = async (payload) => {
  const res = await axiosClient.post("/auth/register", payload);
  return res.data;
};
```

---

# 3. store/ (Zustand Global State)

### Purpose:

Manages global client state like authentication, UI state.

```js
// store/authStore.js
import { create } from "zustand";

const useAuthStore = create((set) => ({
  user: null,
  token: null,

  setUser: (user) => set({ user }),
  setToken: (token) => set({ token }),

  logout: () => {
    localStorage.removeItem("token");
    set({ user: null, token: null });
  },
}));

export default useAuthStore;
```

---

# 4. hooks/ (TanStack Query Hooks)

### Purpose:

Handles server state (fetching, caching, syncing).

---

## Login Hook (Mutation)

```js
// hooks/useLogin.js
import { useMutation } from "@tanstack/react-query";
import { loginUser } from "../services/authService";
import useAuthStore from "../store/authStore";

export const useLogin = () => {
  const setUser = useAuthStore((state) => state.setUser);
  const setToken = useAuthStore((state) => state.setToken);

  return useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem("token", data.token);
    },
  });
};
```

---

## Fetch Data Hook (Query)

```js
// hooks/useUsers.js
import { useQuery } from "@tanstack/react-query";
import axiosClient from "../api/axiosClient";

const fetchUsers = async () => {
  const res = await axiosClient.get("/users");
  return res.data;
};

export const useUsers = () => {
  return useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });
};
```

---

# 5. auth/ (Authentication Utilities)

### Purpose:

Handles token helpers and auth checks.

```js
// auth/token.js
export const getToken = () => localStorage.getItem("token");

export const isAuthenticated = () => {
  return !!getToken();
};
```

---

# 6. components/ (Reusable UI Components)

### Purpose:

Reusable UI elements like buttons, inputs, cards.

```jsx
// components/Button.jsx
export default function Button({ children, onClick }) {
  return (
    <button
      className="px-4 py-2 bg-blue-600 text-white rounded"
      onClick={onClick}
    >
      {children}
    </button>
  );
}
```

---

# 7. pages/ (Application Screens)

### Purpose:

Full pages like Login, Dashboard, Profile.

```jsx
// pages/Login.jsx
import { useState } from "react";
import { useLogin } from "../hooks/useLogin";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loginMutation = useLogin();

  const handleLogin = () => {
    loginMutation.mutate({ email, password });
  };

  return (
    <div>
      <h1>Login</h1>

      <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
      <input
        placeholder="Password"
        type="password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={handleLogin}>Login</button>
    </div>
  );
}
```

---

# 8. routers/ (Routing System)

### Purpose:

Manages application routes.

```jsx
// routers/AppRouter.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../pages/Login";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}
```

---

# 9. layouts/ (UI Structure Wrapper)

### Purpose:

Common layouts like dashboard, navbar, sidebar.

```jsx
// layouts/MainLayout.jsx
export default function MainLayout({ children }) {
  return (
    <div>
      <header>DAAI Navbar</header>
      <main>{children}</main>
    </div>
  );
}
```

---

# 10. utils/ (Helper Functions)

### Purpose:

Utility functions like formatting, validation.

```js
// utils/formatDate.js
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString();
};
```

---

# 11. App.jsx (Root Component)

```jsx
import AppRouter from "./routers/AppRouter";

function App() {
  return <AppRouter />;
}

export default App;
```

---

# 12. main.jsx (App Entry Point)

### Includes TanStack Query setup.

```jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
);
```

---

# Responsibilities Summary

| Layer      | Responsibility        |
| ---------- | --------------------- |
| pages      | UI screens            |
| components | reusable UI           |
| hooks      | TanStack server logic |
| services   | API logic             |
| api        | Axios configuration   |
| store      | Zustand global state  |
| layouts    | page structure        |
| utils      | helper functions      |
| routers    | routing system        |

---

# Why This Architecture Works

- Clean separation of concerns
- Scalable for large fellowship system
- Easy backend integration
- Ready for authentication & RBAC
- Supports real-world production scaling

---

# Next Recommended Step

After this setup, you should build:

1. Auth system (JWT login/register)
2. Protected routes
3. Dashboard layout (Admin/Student/Lecturer)
4. API error handling interceptor
5. Role-based access control
