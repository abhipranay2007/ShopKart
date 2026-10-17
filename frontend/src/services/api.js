import axios from "axios";

// Create an Axios instance with default settings
const API = axios.create({
  baseURL: "http://localhost:5000", // Backend server URL
  withCredentials: true, // IMPORTANT: This tells Axios to send cookies with every request
});

export default API;
