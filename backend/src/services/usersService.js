// src/services/usersService.js
const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

export const usersService = {
  async createUser(payload) {
    const res = await fetch(`${API}/api/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(()=>({ error: 'Error desconocido' }));
      throw err;
    }
    return res.json();
  }
};
