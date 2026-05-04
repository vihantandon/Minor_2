import axios from "axios";

const client = axios.create({
  baseURL: "http://localhost:8080",
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT to every request if present
client.interceptors.request.use((config) => {
  const token = localStorage.getItem("oh-token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default client;

// Auth
export const register = (data) => client.post("/api/auth/register", data);
export const login = (data) => client.post("/api/auth/login", data);

// Contests
export const listContests = () => client.get("/api/contests");
export const getContest = (id) => client.get(`/api/contests/${id}`);

// Submissions
// answer: string, questionId: number
export const submitAnswer = (contestId, questionId, answer) =>
  client.post(`/api/contests/${contestId}/submit`, {
    question_id: questionId,
    answer,
  });

// Users
export const getMe = () => client.get("/api/users/me");
