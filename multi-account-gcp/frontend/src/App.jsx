import React, {useState, useEffect} from 'react'
import axios from 'axios'

const API = process.env.REACT_APP_API || 'http://localhost:8081'

export default function App(){
  const [name,setName] = useState('')
  const [desc,setDesc] = useState('')
  const [created,setCreated] = useState(null)
  const [getId,setGetId] = useState('')
  const [fetched,setFetched] = useState(null)
  const [logs,setLogs] = useState([])
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploadStatus, setUploadStatus] = useState('')
  
  // New state for service data
  const [sqlData,setSqlData] = useState([])
  const [redisData,setRedisData] = useState([])
  const [bucketData,setBucketData] = useState([])
  const [serviceStatus,setServiceStatus] = useState({})
  const [workerLogs,setWorkerLogs] = useState([])
  const [cacheStats,setCacheStats] = useState({})
  const [rabbitMqStats,setRabbitMqStats] = useState({})

  async function create(){
    try {
      console.log('Creating item with API:', API)
      const res = await axios.post(`${API}/v1/items`, { name, description: desc })
      console.log('Create response:', res.data)
      setCreated(res.data)
    } catch (error) {
      console.error('Create error:', error)
      setCreated({ error: error.message })
    }
  }

  async function getItem(){
    try{
      console.log('Getting item with API:', `${API}/v1/items/${getId}`)
      const res = await axios.get(`${API}/v1/items/${getId}`)
      console.log('Get response:', res.data)
      setFetched(res.data)
    }catch(e){ 
      console.error('Get error:', e)
      setFetched(null) 
    }
  }

  async function uploadFile(){
    try {
      if (!selectedFile) {
        setUploadStatus('Please select a file')
        return
      }
      
      const formData = new FormData()
      formData.append('file', selectedFile)
      
      console.log('Uploading file:', selectedFile.name)
      const res = await axios.post(`${API}/v1/files/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      console.log('Upload response:', res.data)
      setUploadStatus(`✅ ${res.data.message}`)
      setSelectedFile(null)
      
      // Refresh bucket data
      setTimeout(fetchAllData, 500)
    } catch (error) {
      console.error('Upload error:', error)
      setUploadStatus(`❌ Upload failed: ${error.message}`)
    }
  }

  // Fetch all service data periodically
  const fetchAllData = async () => {
    try {
      // SQL Data (all items)
      const sqlRes = await axios.get(`${API}/v1/data/sql`)
      setSqlData(sqlRes.data)
      
      // Redis Data
      const redisRes = await axios.get(`${API}/v1/data/redis`)  
      setRedisData(redisRes.data)
      
      // Bucket Data (files)
      const bucketRes = await axios.get(`${API}/v1/data/bucket`)
      setBucketData(bucketRes.data)
      
      // Worker Logs
      const workerRes = await axios.get(`${API}/v1/worker/logs`)
      setWorkerLogs(workerRes.data)
      
      // Service Status
      const statusRes = await axios.get(`${API}/v1/status/services`)
      setServiceStatus(statusRes.data)
      
      // Cache Stats
      const cacheRes = await axios.get(`${API}/v1/status/cache`)
      setCacheStats(cacheRes.data)
      
      // RabbitMQ Stats  
      const rabbitRes = await axios.get(`${API}/v1/status/rabbitmq`)
      setRabbitMqStats(rabbitRes.data)
      
    } catch (error) {
      console.error('Error fetching service data:', error)
    }
  }

  useEffect(()=>{
    fetchAllData() // Initial fetch
    const t = setInterval(fetchAllData, 3000) // Refresh every 3 seconds
    return ()=>clearInterval(t)
  },[])

  return (
    <div style={{fontFamily:'Arial',padding:20,backgroundColor:'#f5f5f5'}}>
      <h1 style={{color:'#333',textAlign:'center'}}>🚀 Multi-Account GCP Demo Dashboard</h1>
      
      {/* Service Status Overview */}
      <section style={{marginBottom:30,padding:20,backgroundColor:'white',borderRadius:8,boxShadow:'0 2px 4px rgba(0,0,0,0.1)'}}>
        <h2 style={{color:'#2196F3'}}>📊 Service Status</h2>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))',gap:15}}>
          <div style={{padding:15,backgroundColor:'#e8f5e8',borderRadius:5}}>
            <strong>Backend API:</strong> {serviceStatus.backend || '✅ Online'}
          </div>
          <div style={{padding:15,backgroundColor:'#e8f5e8',borderRadius:5}}>
            <strong>Database:</strong> {serviceStatus.database || '✅ Connected'}
          </div>
          <div style={{padding:15,backgroundColor:serviceStatus.redis === 'Connected' ? '#e8f5e8' : '#ffeeee',borderRadius:5}}>
            <strong>Redis:</strong> {serviceStatus.redis || '❌ Unavailable'}
          </div>
          <div style={{padding:15,backgroundColor:'#e8f5e8',borderRadius:5}}>
            <strong>RabbitMQ:</strong> {serviceStatus.rabbitmq || '✅ Connected'}
          </div>
        </div>
      </section>

      {/* CRUD Operations */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:20,marginBottom:30}}>
        <section style={{padding:20,backgroundColor:'white',borderRadius:8,boxShadow:'0 2px 4px rgba(0,0,0,0.1)'}}>
          <h2 style={{color:'#4CAF50'}}>➕ Create Item</h2>
          <div style={{marginBottom:10}}>
            <input style={{width:'100%',padding:8,marginBottom:10,border:'1px solid #ddd',borderRadius:4}} 
              placeholder='Item name' value={name} onChange={e=>setName(e.target.value)} />
            <input style={{width:'100%',padding:8,marginBottom:10,border:'1px solid #ddd',borderRadius:4}} 
              placeholder='Description' value={desc} onChange={e=>setDesc(e.target.value)} />
            <button style={{padding:10,backgroundColor:'#4CAF50',color:'white',border:'none',borderRadius:4,cursor:'pointer'}} 
              onClick={create}>Create Item</button>
          </div>
          <pre style={{backgroundColor:'#f9f9f9',padding:10,borderRadius:4,fontSize:12}}>
            {created ? JSON.stringify(created,null,2) : 'Created item will appear here'}
          </pre>
        </section>

        <section style={{padding:20,backgroundColor:'white',borderRadius:8,boxShadow:'0 2px 4px rgba(0,0,0,0.1)'}}>
          <h2 style={{color:'#2196F3'}}>🔍 Get Item</h2>
          <div style={{marginBottom:10}}>
            <input style={{width:'70%',padding:8,marginRight:10,border:'1px solid #ddd',borderRadius:4}} 
              placeholder='Item ID' value={getId} onChange={e=>setGetId(e.target.value)} />
            <button style={{padding:10,backgroundColor:'#2196F3',color:'white',border:'none',borderRadius:4,cursor:'pointer'}} 
              onClick={getItem}>Get Item</button>
          </div>
          <pre style={{backgroundColor:'#f9f9f9',padding:10,borderRadius:4,fontSize:12}}>
            {fetched ? JSON.stringify(fetched,null,2) : 'Fetched item will appear here'}
          </pre>
        </section>

        <section style={{padding:20,backgroundColor:'white',borderRadius:8,boxShadow:'0 2px 4px rgba(0,0,0,0.1)'}}>
          <h2 style={{color:'#FF9800'}}>📤 Upload File</h2>
          <div style={{marginBottom:10}}>
            <input type="file" 
              style={{width:'100%',padding:8,marginBottom:10,border:'1px solid #ddd',borderRadius:4}} 
              onChange={e=>setSelectedFile(e.target.files[0])} />
            <button style={{padding:10,backgroundColor:'#FF9800',color:'white',border:'none',borderRadius:4,cursor:'pointer',width:'100%'}} 
              onClick={uploadFile}>Upload File</button>
          </div>
          <div style={{backgroundColor:'#f9f9f9',padding:10,borderRadius:4,fontSize:12,minHeight:40}}>
            {selectedFile ? `Selected: ${selectedFile.name}` : 'No file selected'}
            <br/>
            {uploadStatus && <span style={{color:uploadStatus.includes('✅')?'green':'red'}}>{uploadStatus}</span>}
          </div>
        </section>
      </div>

      {/* Data Tables */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:20,marginBottom:30}}>
        
        {/* SQL Data Table */}
        <section style={{padding:20,backgroundColor:'white',borderRadius:8,boxShadow:'0 2px 4px rgba(0,0,0,0.1)'}}>
          <h2 style={{color:'#9C27B0'}}>🗄️ SQL Database (PostgreSQL)</h2>
          <div style={{maxHeight:300,overflow:'auto'}}>
            <table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
              <thead>
                <tr style={{backgroundColor:'#f0f0f0'}}>
                  <th style={{border:'1px solid #ddd',padding:8}}>ID</th>
                  <th style={{border:'1px solid #ddd',padding:8}}>Name</th>
                  <th style={{border:'1px solid #ddd',padding:8}}>Description</th>
                </tr>
              </thead>
              <tbody>
                {sqlData.map(item => (
                  <tr key={item.id}>
                    <td style={{border:'1px solid #ddd',padding:8}}>{item.id}</td>
                    <td style={{border:'1px solid #ddd',padding:8}}>{item.name}</td>
                    <td style={{border:'1px solid #ddd',padding:8}}>{item.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {sqlData.length === 0 && <p>No SQL data yet</p>}
          </div>
        </section>

        {/* Redis Data Table */}
        <section style={{padding:20,backgroundColor:'white',borderRadius:8,boxShadow:'0 2px 4px rgba(0,0,0,0.1)'}}>
          <h2 style={{color:'#FF5722'}}>⚡ Redis Cache</h2>
          <div style={{maxHeight:300,overflow:'auto'}}>
            <table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
              <thead>
                <tr style={{backgroundColor:'#f0f0f0'}}>
                  <th style={{border:'1px solid #ddd',padding:8}}>Key</th>
                  <th style={{border:'1px solid #ddd',padding:8}}>Value</th>
                  <th style={{border:'1px solid #ddd',padding:8}}>TTL</th>
                </tr>
              </thead>
              <tbody>
                {redisData.map(item => (
                  <tr key={item.key}>
                    <td style={{border:'1px solid #ddd',padding:8}}>{item.key}</td>
                    <td style={{border:'1px solid #ddd',padding:8}}>{item.value}</td>
                    <td style={{border:'1px solid #ddd',padding:8}}>{item.ttl}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {redisData.length === 0 && <p>Redis unavailable or no cache data</p>}
            <div style={{marginTop:10,fontSize:11,color:'#666'}}>
              Cache Hit Rate: {cacheStats.hitRate || 'N/A'} | 
              Total Keys: {cacheStats.totalKeys || 0}
            </div>
          </div>
        </section>

        {/* Bucket Data Table */}
        <section style={{padding:20,backgroundColor:'white',borderRadius:8,boxShadow:'0 2px 4px rgba(0,0,0,0.1)'}}>
          <h2 style={{color:'#607D8B'}}>🗂️ Object Storage (MinIO)</h2>
          <div style={{maxHeight:300,overflow:'auto'}}>
            <table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
              <thead>
                <tr style={{backgroundColor:'#f0f0f0'}}>
                  <th style={{border:'1px solid #ddd',padding:8}}>File Name</th>
                  <th style={{border:'1px solid #ddd',padding:8}}>Size</th>
                  <th style={{border:'1px solid #ddd',padding:8}}>Upload Date</th>
                </tr>
              </thead>
              <tbody>
                {bucketData.map(file => (
                  <tr key={file.name}>
                    <td style={{border:'1px solid #ddd',padding:8}}>{file.name}</td>
                    <td style={{border:'1px solid #ddd',padding:8}}>{file.size}</td>
                    <td style={{border:'1px solid #ddd',padding:8}}>{file.uploadDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {bucketData.length === 0 && <p>No files uploaded yet</p>}
          </div>
        </section>
      </div>

      {/* Service Outputs */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
        
        {/* Worker Logs */}
        <section style={{padding:20,backgroundColor:'white',borderRadius:8,boxShadow:'0 2px 4px rgba(0,0,0,0.1)'}}>
          <h2 style={{color:'#795548'}}>🔧 Worker Service Output</h2>
          <div style={{maxHeight:250,overflow:'auto',backgroundColor:'#f9f9f9',padding:10,borderRadius:4}}>
            {workerLogs.map((log, idx) => (
              <div key={idx} style={{fontSize:11,marginBottom:5,padding:5,backgroundColor:'#fff',borderRadius:3}}>
                <strong>ID {log.id}:</strong> Item {log.item_id} processed at {log.processed_at} - {log.note}
              </div>
            ))}
            {workerLogs.length === 0 && <p>No worker logs yet</p>}
          </div>
        </section>

        {/* RabbitMQ Stats */}
        <section style={{padding:20,backgroundColor:'white',borderRadius:8,boxShadow:'0 2px 4px rgba(0,0,0,0.1)'}}>
          <h2 style={{color:'#FF9800'}}>🐰 Message Queue Stats</h2>
          <div style={{fontSize:12}}>
            <div style={{marginBottom:8}}><strong>Queue:</strong> {rabbitMqStats.queueName || 'queue'}</div>
            <div style={{marginBottom:8}}><strong>Messages:</strong> {rabbitMqStats.messageCount || 0}</div>
            <div style={{marginBottom:8}}><strong>Consumers:</strong> {rabbitMqStats.consumerCount || 1}</div>
            <div style={{marginBottom:8}}><strong>Published:</strong> {rabbitMqStats.published || 0}</div>
            <div style={{marginBottom:8}}><strong>Delivered:</strong> {rabbitMqStats.delivered || 0}</div>
            <div style={{marginTop:15,padding:10,backgroundColor:'#f9f9f9',borderRadius:4}}>
              <strong>Recent Activity:</strong><br/>
              Last message: {rabbitMqStats.lastMessage || 'None'}<br/>
              Status: {rabbitMqStats.status || 'Active'}
            </div>
          </div>
        </section>
      </div>
      
      <div style={{textAlign:'center',marginTop:30,padding:20,backgroundColor:'white',borderRadius:8}}>
        <h3 style={{color:'#4CAF50'}}>🎯 All Services Ready for GCP Migration!</h3>
        <p>Dashboard updates every 3 seconds | Backend: {API}</p>
      </div>
    </div>
  )
}
