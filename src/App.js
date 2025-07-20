import React, { useState } from 'react';
import './App.css';
import HandwritingAnalyzer from './components/HandwritingAnalyzer';
import ResultsDisplay from './components/ResultsDisplay';
import LoadingSpinner from './components/LoadingSpinner';

function App() {
  const [analysisResults, setAnalysisResults] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [processedCanvas, setProcessedCanvas] = useState(null);

  const handleAnalysisComplete = (results, originalImage, canvas) => {
    setAnalysisResults(results);
    setUploadedImage(originalImage);
    setProcessedCanvas(canvas);
    setIsAnalyzing(false);
  };

  const handleAnalysisStart = () => {
    setIsAnalyzing(true);
    setAnalysisResults(null);
  };

  const handleReset = () => {
    setAnalysisResults(null);
    setUploadedImage(null);
    setProcessedCanvas(null);
    setIsAnalyzing(false);
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>🖋️ Handwriting Personality Analyzer</h1>
        <p className="subtitle">
          Discover your personality traits through handwriting analysis - completely private and secure
        </p>
      </header>

      <main className="app-main">
        {!analysisResults && !isAnalyzing && (
          <div className="upload-section">
            <HandwritingAnalyzer 
              onAnalysisComplete={handleAnalysisComplete}
              onAnalysisStart={handleAnalysisStart}
            />
          </div>
        )}

        {isAnalyzing && (
          <div className="loading-section">
            <LoadingSpinner />
            <p>Analyzing your handwriting...</p>
          </div>
        )}

        {analysisResults && (
          <div className="results-section">
            <ResultsDisplay 
              results={analysisResults}
              originalImage={uploadedImage}
              processedCanvas={processedCanvas}
              onReset={handleReset}
            />
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>
          🔒 Your handwriting is processed entirely in your browser - no data is sent to any server.
        </p>
        <p className="disclaimer">
          This is for entertainment purposes only. Graphology is not scientifically validated.
        </p>
      </footer>
    </div>
  );
}

export default App;