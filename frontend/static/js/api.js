const API_BASE_URL = window.location.origin + "/api";

export const api = {
  auth: {
    login: (username, password) =>
      fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      }).then((res) => {
        if (!res.ok) throw new Error("Failed to login");
        return res.json();
      }),
    logout: () =>
      fetch("/logout", {
        method: "POST",
        credentials: "include",
      }).then((res) => {
        if (!res.ok) throw new Error("Failed to logout");
        return res.json();
      }),
    getIsAdmin: () =>
      fetch(`${API_BASE_URL}/is_admin`, {
        method: "GET",
        credentials: "include",
      }).then((res) => {
        if (!res.ok) throw new Error("Failed to get user info");
        return res.json();
      }),
  },
  assistants: {
    getAll: () =>
      fetch(`${API_BASE_URL}/assistant`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      }).then((res) => {
        if (!res.ok) throw new Error("Failed to fetch assistants");
        return res.json();
      }),
    get: (id) =>
      fetch(`${API_BASE_URL}/assistant/${id}`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      }).then((res) => {
        if (!res.ok) throw new Error("Failed to fetch assistant details");
        return res.json();
      }),
    update: (id, data) =>
      fetch(`${API_BASE_URL}/assistant/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then((res) => {
        if (!res.ok) throw new Error("Failed to update assistant");
        return res.json();
      }),
    create: (data) =>
      fetch(`${API_BASE_URL}/assistant`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then((res) => {
        if (!res.ok) throw new Error("Failed to create assistant");
        return res.json();
      }),
  },
  worklog: {
    getMonthly: (assistantId, year, month) =>
      fetch(`${API_BASE_URL}/worklogs/${assistantId}/${year}/${month}`).then(
        (res) => res.json()
      ),
    create: (data) =>
      fetch(`${API_BASE_URL}/worklog`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then((res) => res.json()),
    delete: (id) =>
      fetch(`${API_BASE_URL}/worklog/${id}`, {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      }).then((res) => res.json()),
    check: (data) =>
      fetch(`${API_BASE_URL}/worklogs/check`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then((res) => res.json()),
    getUncheckedLogs: (year, month) =>
      fetch(`${API_BASE_URL}/worklogs/unchecked/${year}/${month}`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      }).then((res) => res.json()),
    exportLogs: (year, month) =>
      fetch(`${API_BASE_URL}/worklogs/export/${year}/${month}`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      }).then((res) => res.blob()),
  },
};
