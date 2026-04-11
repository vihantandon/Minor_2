import axios from "axios";

const client = axios.create({ baseURL: "/api" });

// Attach token to every request if present
client.interceptors.request.use((config) => {
  const token = localStorage.getItem("oh-token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default client;

// Auth
export const register = (data) => client.post("/auth/register", data);
export const login = (data) => client.post("/auth/login", data);

// Contests
export const listContests = () => client.get("/contests");
export const getContest = (id) => client.get(`/contests/${id}`);
