import React, { useState } from 'react';
import axios from 'axios';

function Stock() {
  const [inputs, setInputs] = useState({
    open: '',
    high: '',
    low: '',
    close: '',
    volume: '',
    moving_average_5: '',
    rsi: ''
  });

  const [endpoint, setEndpoint] = useState('/predict_close');
  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
  };

  const handleEndpointChange = (e) => {
    setEndpoint(e.target.value);
    setResult(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const basePayload = {
      open: parseFloat(inputs.open),
      high: parseFloat(inputs.high),
      low: parseFloat(inputs.low),
      volume: parseFloat(inputs.volume),
      moving_average_5: parseFloat(inputs.moving_average_5),
      rsi: parseFloat(inputs.rsi)
    };

    if (['/predict_volatility', '/predict_cluster'].includes(endpoint)) {
      basePayload.close = parseFloat(inputs.close);
    }

    try {
      const response = await axios.post(`https://stock-service-955460950771.asia-south1.run.app/${endpoint}`, basePayload);
      setResult(response.data);
    } catch (error) {
      setResult({ error: error.response?.data?.error || 'Unknown error' });
    }
  };

  return (
    <div style={{ maxWidth: '700px', margin: 'auto', padding: '2rem', fontFamily: 'Arial, sans-serif', background: 'linear-gradient(135deg, #f0f4ff, #dfe7fd)', borderRadius: '15px', boxShadow: '0px 10px 20px rgba(0,0,0,0.1)', color: '#333' }}>
      <h2 style={{ textAlign: 'center', color: '#0056b3', fontSize: '24px' }}>📊 Stock Prediction Dashboard</h2>
      <form onSubmit={handleSubmit} style={{ background: '#ffffff', padding: '1.5rem', borderRadius: '10px', boxShadow: '0px 4px 10px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          {Object.entries(inputs).map(([key, value], index) => {
            if (key === 'close' && (endpoint === '/predict_close' || endpoint === '/predict_bullbear')) return null;
            const isCloseRequired = ['/predict_volatility', '/predict_cluster'].includes(endpoint);
            const isRequired = key !== 'close' || isCloseRequired;

            return (
              <div key={key} style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ fontWeight: 'bold', textTransform: 'capitalize', color: '#0056b3' }}>{key.replace(/_/g, ' ')}: </label>
                <input
                  type="number"
                  step="any"
                  name={key}
                  value={value}
                  onChange={handleChange}
                  required={isRequired}
                  style={{ width: '90%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ccc', background: '#f8f9fc', color: '#333', marginRight: '100px', marginBottom: '10px' }}
                />
              </div>
            );
          })}
        </div>

        <div style={{ marginBottom: '2rem', marginTop: '10px' }}>
          <label style={{ fontWeight: 'bold', color: '#0056b3' }}>Choose Prediction Type: </label>
          <select value={endpoint} onChange={handleEndpointChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ccc', background: '#f8f9fc', color: '#0056b3' }}>
            <option value="/predict_close">📈 Predict Close Price</option>
            <option value="/predict_bullbear">🐂 Predict Bull/Bear</option>
            <option value="/predict_volatility">📉 Predict Volatility</option>
            <option value="/predict_cluster">🔍 Predict Cluster</option>
          </select>
        </div>

        <button type="submit" style={{ background: '#0056b3', color: '#ffffff', padding: '0.75rem', width: '100%', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold' }}>
          Predict 🔮
        </button>
      </form>

      {result && (
        <div style={{ marginTop: '2rem', background: '#f8f9fc', padding: '1.5rem', borderRadius: '10px', color: '#0056b3', boxShadow: '0px 4px 10px rgba(0,0,0,0.05)', textAlign: 'center' }}>
          <h4>🧠 Prediction Result:</h4>
          <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default Stock;
