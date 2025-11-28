// Production URLs
export let API_URL = "https://project-meet.vercel.app"; // URL ของ API Server จริง
export let CLIENT_URL = "https://project-meet.vercel.app"; // URL ของ Frontend จริง



// ถ้าอยู่ใน Development mode ให้ใช้ localhost
if (import.meta.env.MODE === 'development') {
  API_URL = "http://localhost:8080";
  CLIENT_URL = "http://localhost:5173";
}
