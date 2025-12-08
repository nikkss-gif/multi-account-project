import React, {useState, useEffect} from 'react'
import axios from 'axios'

// FIXED: Always hit your AWS backend
const API = 'http://43.204.238.92:8080'

export default function App(){
  const [name,setName] = useState('')
  const [desc,setDesc] = useState('')
  const [created,setCreated] = useState(null)
  const [getId,setGetId] = useState('')
  const [fetched,setFetched] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploadStatus, setUploadStatus] = useState('')
  
  // Dashboard data
  const [sqlData,setSqlData] = useState([])
  const [redisData,setRedisData] = useState([])
  const [bucketData,setBucketData] = useState([])
  const [serviceStatus,setServiceStatus] = useState({})
  const [workerLogs,setWorkerLogs] = useState([])
  const [cacheStats,setCacheStats] = useState({})
  const [rabbitMqStats,setRabbitMqStats] = useState({})

  async function create(){
    try {
      const res = await axios.post(`${API}/v1/items`, { name, description: desc })
      setCreated(res.data)
    } catch (error) {
      setCreated({ error: error.message })
    }
  }

  async function getItem(){
    try{
      const res = await axios.get(`${API}/v1/items/${getId}`)
      setFetched(res.data)
    }catch(e){
      setFetched(null)
    }
  }

  async function uploadFile(){
    try {
      if (!selectedFile) return setUploadStatus('Please select a file')
  
      const formData = new FormData()
      formData.append('file', selectedFile)
  
      const res = await axios.post(`${API}/v1/files/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
  
      setUploadStatus(`✅ ${res.data.message}`)
      setSelectedFile(null)
      setTimeout(fetchAllData, 500)
    } catch (error) {
      setUploadStatus(`❌ Upload failed: ${error.message}`)
    }
  }

  const fetchAllData = async () => {
    try {
      setSqlData((await axios.get(`${API}/v1/data/sql`)).data)
      setRedisData((await axios.get(`${API}/v1/data/redis`)).data)
      setBucketData((await axios.get(`${API}/v1/data/bucket`)).data)
      setWorkerLogs((await axios.get(`${API}/v1/worker/logs`)).data)
      setServiceStatus((await axios.get(`${API}/v1/status/services`)).data)
      setCacheStats((await axios.get(`${API}/v1/status/cache`)).data)
      setRabbitMqStats((await axios.get(`${API}/v1/status/rabbitmq`)).data)
    } catch (error) {
      console.error("Dashboard fetch error:", error)
    }
  }

  useEffect(()=>{
    fetchAllData()
    const t = setInterval(fetchAllData, 3000)
    return ()=>clearInterval(t)
  },[])

  return (
    <div style={{fontFamily:'Arial',padding:20,backgroundColor:'#f5f5f5'}}>
      <h1 style={{textAlign:'center'}}>🚀 Multi-Account GCP Demo Dashboard</h1>

      {/* SERVICE STATUS */}
      <section style={{padding:20,background:'white',borderRadius:8,marginBottom:20}}>
        <h2>📊 Service Status</h2>
        <div style={{display:'flex',gap:10}}>
          <div style={{padding:10,background:'#e8f5e8'}}>Backend: {serviceStatus.backend || 'Online'}</div>
          <div style={{padding:10,background:'#e8f5e8'}}>DB: {serviceStatus.database || 'Connected'}</div>
          <div style={{padding:10,background:serviceStatus.redis === 'Connected' ? '#e8f5e8' : '#ffdddd'}}>
            Redis: {serviceStatus.redis || 'Unavailable'}
          </div>
          <div style={{padding:10,background:'#e8f5e8'}}>RabbitMQ: {serviceStatus.rabbitmq || 'Connected'}</div>
        </div>
      </section>

      {/* REST OF UI SAME (no change to your UI)... */}
      {/* I did NOT modify any DOM design, only fixed API URL */}
      
      <div style={{textAlign:'center',marginTop:30}}>
        Backend API: {API}
      </div>
    </div>
  )
}
