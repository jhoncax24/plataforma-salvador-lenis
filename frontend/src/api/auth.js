import api from "./api";

export async function login(username, password) {
  const res = await api.post("/auth/login", { username, password });

  localStorage.setItem("cesl_token", res.data.token);
  localStorage.setItem("cesl_user", JSON.stringify(res.data.user));

  return res.data.user;
}

export function logout() {
  localStorage.removeItem("cesl_token");
  localStorage.removeItem("cesl_user");
}

export function getUser() {
  return JSON.parse(localStorage.getItem("cesl_user") || "null");
}
