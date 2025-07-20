import React, { useRef, useEffect } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const ResultsDisplay = ({ results, originalImage, processedCanvas, onReset }) => {
  const resultsRef = useRef(null);
  const visualizationCanvasRef = useRef(null);

  useEffect(() => {
    if (processedCanvas && visualizationCanvasRef.current) {
      // Copy the processed canvas to the visualization canvas
      const vizCanvas = visualizationCanvasRef.current;
      const vizCtx = vizCanvas.getContext('2d');
      
      vizCanvas.width = processedCanvas.width;
      vizCanvas.height = processedCanvas.height;
      
      vizCtx.drawImage(processedCanvas, 0, 0);
    }
  }, [processedCanvas]);

  const downloadPDF = async () => {
    try {
      const element = resultsRef.current;
      const canvas = await html2canvas(element, {
        backgroundColor: '#667eea',
        scale: 2,
        useCORS: true
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save('handwriting-personality-analysis.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  const getFeatureDescription = (feature, value) => {
    const descriptions = {
      slant: {
        description: 'Letter slant indicates emotional expression',
        interpretation: value < -15 ? 'Leftward slant suggests introspection' : 
                      value > 15 ? 'Rightward slant indicates expressiveness' : 
                      'Upright writing shows emotional balance'
      },
      spacing: {
        description: 'Letter spacing reveals social preferences',
        interpretation: value < 0.3 ? 'Tight spacing suggests focus and attention to detail' :
                      value > 0.7 ? 'Wide spacing indicates need for personal space' :
                      'Normal spacing shows social balance'
      },
      size: {
        description: 'Writing size reflects self-confidence',
        interpretation: value < 0.4 ? 'Small writing suggests modesty and precision' :
                      value > 0.7 ? 'Large writing indicates confidence and ambition' :
                      'Medium size shows balanced self-esteem'
      },
      pressure: {
        description: 'Writing pressure indicates emotional intensity',
        interpretation: value < 0.3 ? 'Light pressure suggests sensitivity and adaptability' :
                      value > 0.7 ? 'Heavy pressure indicates determination and passion' :
                      'Medium pressure shows emotional stability'
      }
    };
    
    return descriptions[feature] || { description: '', interpretation: '' };
  };

  const formatFeatureValue = (feature, value) => {
    switch (feature) {
      case 'slant':
        return `${value.toFixed(1)}°`;
      case 'spacing':
      case 'size':
      case 'pressure':
        return `${(value * 100).toFixed(0)}%`;
      default:
        return value.toString();
    }
  };

  if (!results) {
    return null;
  }

  return (
    <div className="results-display" ref={resultsRef}>
      <div className="results-header">
        <h2>🎭 Your Personality Analysis</h2>
        <div className="action-buttons">
          <button onClick={downloadPDF} className="btn btn-primary">
            📄 Download PDF Report
          </button>
          <button onClick={onReset} className="btn btn-secondary">
            🔄 Analyze Another Sample
          </button>
        </div>
      </div>

      <div className="results-grid">
        {/* Personality Summary */}
        <div className="card personality-summary">
          <h3>{results.personality.template.title}</h3>
          <p className="personality-description">
            {results.personality.template.description}
          </p>
          <div className="confidence-meter">
            <div className="confidence-label">
              Analysis Confidence: {results.personality.confidence}%
            </div>
            <div className="confidence-bar">
              <div 
                className="confidence-fill" 
                style={{ width: `${results.personality.confidence}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Personality Traits */}
        <div className="card traits-card">
          <h3>🌟 Key Personality Traits</h3>
          <div className="traits-grid">
            {results.personality.traits.map((trait, index) => (
              <div key={index} className="trait-tag">
                {trait}
              </div>
            ))}
          </div>
        </div>

        {/* Handwriting Features */}
        <div className="card features-card">
          <h3>📊 Handwriting Analysis</h3>
          <div className="features-list">
            {Object.entries(results.features)
              .filter(([key]) => ['slant', 'spacing', 'size', 'pressure'].includes(key))
              .map(([feature, value]) => {
                const desc = getFeatureDescription(feature, value);
                return (
                  <div key={feature} className="feature-item">
                    <div className="feature-header">
                      <span className="feature-name">
                        {feature.charAt(0).toUpperCase() + feature.slice(1)}
                      </span>
                      <span className="feature-value">
                        {formatFeatureValue(feature, value)}
                      </span>
                    </div>
                    <div className="feature-description">
                      {desc.description}
                    </div>
                    <div className="feature-interpretation">
                      {desc.interpretation}
                    </div>
                  </div>
                );
              })
            }
          </div>
        </div>

        {/* Visualization */}
        <div className="card visualization-card">
          <h3>🔍 Analysis Visualization</h3>
          <div className="canvas-container">
            <canvas 
              ref={visualizationCanvasRef}
              className="visualization-canvas"
            />
            <p className="visualization-note">
              Red outlines show detected handwriting elements
            </p>
          </div>
        </div>

        {/* Statistics */}
        <div className="card stats-card">
          <h3>📈 Writing Statistics</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-value">{results.features.letterCount}</div>
              <div className="stat-label">Elements Detected</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{results.features.wordCount}</div>
              <div className="stat-label">Estimated Words</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">
                {new Date(results.timestamp).toLocaleDateString()}
              </div>
              <div className="stat-label">Analysis Date</div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .results-display {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }
        
        .results-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }
        
        .results-header h2 {
          margin: 0;
          font-size: 2rem;
          color: white;
        }
        
        .action-buttons {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }
        
        .results-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
        }
        
        .card {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 15px;
          padding: 2rem;
          color: white;
        }
        
        .card h3 {
          margin: 0 0 1.5rem 0;
          font-size: 1.3rem;
          color: white;
        }
        
        .personality-summary {
          grid-column: 1 / -1;
        }
        
        .personality-description {
          font-size: 1.1rem;
          line-height: 1.6;
          margin-bottom: 2rem;
          color: rgba(255, 255, 255, 0.9);
        }
        
        .confidence-meter {
          margin-top: 1rem;
        }
        
        .confidence-label {
          margin-bottom: 0.5rem;
          font-weight: 600;
        }
        
        .confidence-bar {
          height: 8px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 4px;
          overflow: hidden;
        }
        
        .confidence-fill {
          height: 100%;
          background: linear-gradient(90deg, #4CAF50, #8BC34A);
          transition: width 1s ease;
        }
        
        .traits-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        
        .trait-tag {
          background: rgba(255, 255, 255, 0.2);
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.9rem;
          font-weight: 500;
          border: 1px solid rgba(255, 255, 255, 0.3);
        }
        
        .features-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        
        .feature-item {
          padding: 1rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .feature-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }
        
        .feature-name {
          font-weight: 600;
          font-size: 1rem;
        }
        
        .feature-value {
          font-weight: 700;
          color: #4CAF50;
          font-size: 1.1rem;
        }
        
        .feature-description {
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.8);
          margin-bottom: 0.3rem;
        }
        
        .feature-interpretation {
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.7);
          font-style: italic;
        }
        
        .canvas-container {
          text-align: center;
        }
        
        .visualization-canvas {
          max-width: 100%;
          height: auto;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          background: white;
        }
        
        .visualization-note {
          margin-top: 0.5rem;
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.7);
          font-style: italic;
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 1rem;
        }
        
        .stat-item {
          text-align: center;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #4CAF50;
          margin-bottom: 0.5rem;
        }
        
        .stat-label {
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.8);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        @media (max-width: 768px) {
          .results-display {
            padding: 1rem;
          }
          
          .results-header {
            flex-direction: column;
            align-items: stretch;
          }
          
          .results-header h2 {
            font-size: 1.5rem;
            text-align: center;
          }
          
          .action-buttons {
            justify-content: center;
          }
          
          .results-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
          
          .card {
            padding: 1.5rem;
          }
          
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        
        @media (max-width: 480px) {
          .action-buttons {
            flex-direction: column;
          }
          
          .btn {
            width: 100%;
          }
          
          .stats-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default ResultsDisplay;