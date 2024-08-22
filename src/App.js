import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [inputType, setInputType] = useState('file');
  const [file, setFile] = useState(null);
  const [url, setUrl] = useState('');
  const [prediction, setPrediction] = useState('');
  const [error, setError] = useState('');
  const [positionSequence, setPositionSequence] = useState([]);
  const [selectedTest, setSelectedTest] = useState('Chloroquine');

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

  const handleTestChange = (event) => {
    setSelectedTest(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setPrediction('');
    setPositionSequence([]);

    try {
      let response;
      if (inputType === 'file' && file) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('test', selectedTest);
        response = await axios.post('http://localhost:5000/predict', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else if (inputType === 'url' && url) {
        response = await axios.post('http://localhost:5000/predict', { url, test: selectedTest });
      } else {
        setError('Please provide either a file or a URL.');
        return;
      }

      if (response.data.prediction && response.data.positionSequence) {
        const displayPrediction = response.data.prediction === 'resistant' ? 'Resistance' : 'Sensitive';
        setPrediction(displayPrediction);
        setPositionSequence(response.data.positionSequence);
      } else {
        setError('Unexpected response format from API.');
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
          <label className="form-label">
            Select Test:
            <select value={selectedTest} onChange={handleTestChange} className="test-select">
              <option value="Chloroquine">Chloroquine</option>
              <option value="Dihydroartemisinin">Dihydroartemisinin</option>
              <option value="Lumefantrine">Lumefantrine</option>
              <option value="Quinine">Quinine</option>
              <option value="Halofantrine">Halofantrine</option>
              <option value="Piperaquine">Piperaquine</option>
            </select>
          </label>

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
        {prediction && (
          <div className="result-display">
            <p className="prediction-message">Prediction for {selectedTest}: {prediction}</p>
            {positionSequence.length > 0 && (
              <div className="sequence-display">
                <p>Position Sequence:</p>
                <ul>
                  {positionSequence.map((position, index) => (
                    <li key={index}>{position}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
