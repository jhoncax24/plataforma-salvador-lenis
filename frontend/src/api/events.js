import api from "./api";

export async function getEvents() {
  const res = await api.get("/events");
  return res.data;
}
