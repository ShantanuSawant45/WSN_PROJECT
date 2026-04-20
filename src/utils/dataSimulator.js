

let globalNodes = [];
let totalReadings = 0;
let simulationProfile = 'v1'; 

function initializeNodes() {
  const baseNodes = [
    { id: 1, node_id: 'node_1', name: 'ESP8266_Node_1', location: 'Main Greenhouse' }
  ];

  baseNodes.forEach(n => {
    n.history = [];
    n.temperature = 0;
    n.humidity = 0;
    n.gas = 0;
    n.status = 'normal';
  });
  return baseNodes;
}

if (globalNodes.length === 0) {
  globalNodes = initializeNodes();
}

function generateNewReading(node) {
  const time = new Date().toISOString();
  
  
  const timeVal = Date.now() / 10000; 
  
  let baseT, baseH;
  let status = 'normal';

  if (simulationProfile === 'v1') {
      
      baseT = 30.0;
      baseH = 60.0;
  } else {
      
      baseT = 40.0;
      baseH = 50.0;
  }

  let t = baseT + Math.sin(timeVal) * 2 + (Math.random() * 1 - 0.5);
  let h = baseH + Math.sin(timeVal + 1) * 5 + (Math.random() * 2 - 1);
  let g = 300 + Math.sin(timeVal + 2) * 20 + (Math.random() * 10 - 5);

  
  if (Math.random() < 0.02) {
      status = 'anomaly';
      if (simulationProfile === 'v1') {
          
          if (Math.random() < 0.5) t += 6 + Math.random() * 5; 
          else h -= 15 + Math.random() * 10;
      } else {
          
          if (Math.random() < 0.5) t += 8 + Math.random() * 5; 
          else h -= 15 + Math.random() * 10;
      }
  }
  
  t = Number(t.toFixed(2));
  h = Number(h.toFixed(2));
  g = Number(g.toFixed(0));

  const reading = {
    timestamp: time,
    temperature: t,
    humidity: h,
    gas: g,
    status
  };

  node.temperature = t;
  node.humidity = h;
  node.gas = g;
  node.status = status;

  node.history.push(reading);
  
  if (node.history.length > 200) {
    node.history.shift();
  }
  
  totalReadings++;
}

export async function fetchNodes() {
  globalNodes.forEach(generateNewReading);
  
  return JSON.parse(JSON.stringify(globalNodes));
}

export async function fetchNodeDetail(nodeId) {
  const node = globalNodes.find(n => String(n.node_id) === String(nodeId) || String(n.id) === String(nodeId));
  return node ? JSON.parse(JSON.stringify(node)) : null;
}

export async function fetchLogs() {
  const logs = getLogsFromNodes(globalNodes);
  return logs.slice(0, 200);
}

export async function fetchSystemStatus() {
  return {
    mqtt: { connected: true, broker_host: "mock.broker.local", broker_port: 1883, topic: "wsn/sensor/mock" },
    ml_model: { 
        is_trained: true, 
        name: simulationProfile === 'v1' ? "Isolation Forest (V1 trained)" : "Isolation Forest (V2 trained)"
    },
    last_update: new Date().toISOString(),
    total_readings: totalReadings
  };
}

export async function triggerTraining() {
  return new Promise(resolve => {
    setTimeout(() => {
      
      simulationProfile = simulationProfile === 'v1' ? 'v2' : 'v1';
      const modelName = simulationProfile === 'v1' ? "Isolation Forest (V1 Trained)" : "Isolation Forest (V2 Trained)";
      resolve({ model_info: { is_trained: true, name: modelName } });
    }, 30000); 
  });
}

export function getAnomalies(nodes) {
  const anomalies = [];
  nodes.forEach((node) => {
    if (node.history) {
      node.history.forEach((reading) => {
        if (reading.status === 'anomaly') {
          anomalies.push({
            nodeId: node.node_id,
            nodeName: node.name,
            ...reading,
          });
        }
      });
    }
  });
  return anomalies
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 10);
}

export function getLogsFromNodes(nodes) {
  const logs = [];
  nodes.forEach((node) => {
    if (node.history) {
      node.history.forEach((reading) => {
        logs.push({
          nodeId: node.node_id,
          nodeName: node.name,
          location: node.location,
          ...reading,
        });
      });
    }
  });
  return logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

export function getSummaryStats(nodes) {
  const total = nodes.length;
  const faulty = nodes.filter((n) => n.status === 'anomaly').length;
  return { total, active: total, faulty, healthy: total - faulty };
}
