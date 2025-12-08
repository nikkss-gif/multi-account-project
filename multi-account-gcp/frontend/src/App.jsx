import React, { useState, useEffect } from 'react';
import axios from 'axios';

// 🔥 FIXED: Your AWS backend URL — ALWAYS use this
const API = "http://43.204.238.92:8080";

export default function App() {

  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [created, setCreated] = useState(null);
  const [getId, setGetId] = useState('');
  const [fetched, setFetched] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');

  const [sqlData, setSqlData] = useState([]);
  const [redisData, setRedisData] = useState([]);
  const [bucketData, setBucketData] = useState([]);
  const [serviceStatus, setServiceStatus] = useState({});
  const [workerLogs, setWorkerLogs] = useState([]);
  const [cacheStats, setCacheStats] = useState({});
  const [rabbitMqStats, setRabbitMqStats] = useState({});

  async function create() {
    try {
      const res = await axios.post(`${API}/v1/items`, {
        name,
        description: desc
      });
      setCreated(res.data);
    } catch (e) {
      setCreated({ error: e.message });
    }
  }

  async function getItem() {
    try {
      const res = await axios.get(`${API}/v1/items/${getId}`);
      setFetched(res.data);
    } catch {
      setFetched(null);
    }
  }

  async function uploadFile() {
    try {
      if (!selectedFile) {
        return setUploadStatus("Please select a file");
      }

      const formData = new FormData();
      formData.append("file", selectedFile);

      const res = await axios.post(`${API}/v1/files/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setUploadStatus(`✅ ${res.data.message}`);
      setSelectedFile(null);

      setTimeout(fetchAll, 500);
    } catch (e) {
      setUploadStatus(`❌ Upload failed: ${e.message}`);
    }
  }

  const fetchAll = async () => {
    try {
      setSqlData((await axios.get(`${API}/v1/data/sql`)).data);
      setRedisData((await axios.get(`${API}/v1/data/redis`)).data);
      setBucketData((await axios.get(`${API}/v1/data/bucket`)).data);
      setServiceStatus((await axios.get(`${API}/v1/status/services`)).data);
      setCacheStats((await axios.get(`${API}/v1/status/cache`)).data);
      setRabbitMqStats((await axios.get(`${API}/v1/status/rabbitmq`)).data);
    } catch (e) {
      console.error("Dashboard fetch error:", e);
    }
  };

  useEffect(() => {
    fetchAll();
    const t = setInterval(fetchAll, 3000);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ fontFamily: "Arial", padding: 20, background: "#f5f5f5" }}>

      <h1 style={{ textAlign: "center" }}>🚀 Multi-Account GCP Demo Dashboard</h1>

      {/* SERVICE STATUS */}
      <section style={{ padding: 20, background: "white", borderRadius: 8, marginBottom: 20 }}>
        <h2>📊 Service Status</h2>

        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ padding: 10, background: "#e8f5e8" }}>
            Backend: {serviceStatus.backend || "Online"}
          </div>

          <div style={{ padding: 10, background: "#e8f5e8" }}>
            DB: {serviceStatus.database || "Connected"}
          </div>

          <div style={{
            padding: 10,
            background: serviceStatus.redis === "Connected" ? "#e8f5e8" : "#ffdddd"
          }}>
            Redis: {serviceStatus.redis || "Unavailable"}
          </div>

          <div style={{ padding: 10, background: "#e8f5e8" }}>
            RabbitMQ: {serviceStatus.rabbitmq || "Connected"}
          </div>
        </div>
      </section>

      <div style={{ marginTop: 30, textAlign: "center" }}>
        Connected to backend: <strong>{API}</strong>
      </div>

    </div>
  );
}
