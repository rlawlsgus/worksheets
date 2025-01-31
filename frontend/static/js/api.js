const API_BASE_URL = "http://3.35.4.35:8000/api";

export const api = {
  assistants: {
    getAll: () =>
      fetch(`${API_BASE_URL}/assistant`).then((res) => {
        if (!res.ok) throw new Error("Failed to fetch assistants");
        return res.json();
      }),
    get: (id) =>
      fetch(`${API_BASE_URL}/assistant/${id}`).then((res) => {
        if (!res.ok) throw new Error("Failed to fetch assistant details");
        return res.json();
      }),
    update: (id, data) =>
      fetch(`${API_BASE_URL}/assistant/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then((res) => {
        if (!res.ok) throw new Error("Failed to update assistant");
        return res.json();
      }),
    create: (data) =>
      fetch(`${API_BASE_URL}/assistant`, {
        method: "POST",
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then((res) => res.json()),
    delete: (id) =>
      fetch(`${API_BASE_URL}/worklog/${id}`, {
        method: "DELETE",
      }).then((res) => res.json()),
    check: (data) =>
      fetch(`${API_BASE_URL}/worklogs/check`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then((res) => res.json()),
    exportLogs: (year, month) =>
      fetch(`${API_BASE_URL}/worklogs/export/${year}/${month}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }).then((res) => res.blob()),
  },
};
