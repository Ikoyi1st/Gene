import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [inputType, setInputType] = useState('file');
  const [file, setFile] = useState(null);
  const [url, setUrl] = useState('');
  const [prediction, setPrediction] = useState('');
  const [error, setError] = useState('');

  const handleInputTypeChange = (event) => {
    setInputType(event.target.value);
    setPrediction('');
  };

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    setPrediction('');
  };

  const handleUrlChange = (event) => {
    setUrl(event.target.value);
    setPrediction('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setPrediction('');

    try {
      if (inputType === 'file' && file) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await axios.post('http://localhost:5000/predict', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        setPrediction(response.data.prediction);
      } else if (inputType === 'url' && url) {
        const response = await axios.post('http://localhost:5000/predict', { url });
        setPrediction(response.data.prediction);
      } else {
        setError('Please provide either a file or a URL.');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('There was an error processing your request. Please try again.');
    }
  };

  return (
    <div className="App">
      <div className="form-container">
        <h1 className="form-title">Gene Resistance Prediction</h1>

        <div className="input-type">
          <label className="radio-label">
            <input
              type="radio"
              value="file"
              checked={inputType === 'file'}
              onChange={handleInputTypeChange}
              className="radio-input"
            />
            Upload Genome Sequence File
          </label>
          <label className="radio-label">
            <input
              type="radio"
              value="url"
              checked={inputType === 'url'}
              onChange={handleInputTypeChange}
              className="radio-input"
            />
            Enter URL
          </label>
        </div>

        <form onSubmit={handleSubmit} className="form">
          {inputType === 'file' ? (
            <label className="form-label">
              Upload FASTA or FASTQ file:
              <input
                type="file"
                accept=".fa, .fq"
                onChange={handleFileChange}
                className="file-input"
              />
            </label>
          ) : (
            <label className="form-label">
              Enter URL:
              <input
                type="url"
                value={url}
                onChange={handleUrlChange}
                className="url-input"
                placeholder="https://example.com/genome.fa"
              />
            </label>
          )}
          <button type="submit" className="submit-button">Predict</button>
        </form>

        {error && <p className="error-message">{error}</p>}
        {prediction && <p className="prediction-message">Prediction: {prediction}</p>}
      </div>
    </div>
  );
}

export default App;
