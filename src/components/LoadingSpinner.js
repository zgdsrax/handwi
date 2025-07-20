import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="loading-spinner">
      <div className="spinner">
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
      </div>
      
      <div className="loading-steps">
        <div className="step active">
          <div className="step-icon">📝</div>
          <div className="step-text">Processing Image</div>
        </div>
        <div className="step">
          <div className="step-icon">🔍</div>
          <div className="step-text">Detecting Features</div>
        </div>
        <div className="step">
          <div className="step-icon">🧠</div>
          <div className="step-text">Analyzing Personality</div>
        </div>
        <div className="step">
          <div className="step-icon">✨</div>
          <div className="step-text">Generating Report</div>
        </div>
      </div>
      
      <style jsx>{`
        .loading-spinner {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem;
          text-align: center;
        }
        
        .spinner {
          position: relative;
          width: 80px;
          height: 80px;
          margin-bottom: 2rem;
        }
        
        .spinner-ring {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border: 4px solid transparent;
          border-top: 4px solid #667eea;
          border-radius: 50%;
          animation: spin 1.5s linear infinite;
        }
        
        .spinner-ring:nth-child(1) {
          animation-delay: 0s;
        }
        
        .spinner-ring:nth-child(2) {
          animation-delay: 0.1s;
          border-top-color: #764ba2;
          width: 90%;
          height: 90%;
          top: 5%;
          left: 5%;
        }
        
        .spinner-ring:nth-child(3) {
          animation-delay: 0.2s;
          border-top-color: #f093fb;
          width: 80%;
          height: 80%;
          top: 10%;
          left: 10%;
        }
        
        .spinner-ring:nth-child(4) {
          animation-delay: 0.3s;
          border-top-color: #f5576c;
          width: 70%;
          height: 70%;
          top: 15%;
          left: 15%;
        }
        
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        
        .loading-steps {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;
          max-width: 600px;
          width: 100%;
        }
        
        .step {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          transition: all 0.3s ease;
          opacity: 0.5;
        }
        
        .step.active {
          opacity: 1;
          background: rgba(255, 255, 255, 0.2);
          border-color: rgba(255, 255, 255, 0.4);
          transform: scale(1.05);
        }
        
        .step-icon {
          font-size: 2rem;
          margin-bottom: 0.5rem;
          animation: bounce 2s infinite;
        }
        
        .step.active .step-icon {
          animation: pulse 1.5s infinite;
        }
        
        .step-text {
          font-size: 0.9rem;
          font-weight: 600;
          color: white;
          text-align: center;
        }
        
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-10px);
          }
          60% {
            transform: translateY(-5px);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.2);
          }
        }
        
        @media (max-width: 768px) {
          .loading-spinner {
            padding: 2rem 1rem;
          }
          
          .spinner {
            width: 60px;
            height: 60px;
          }
          
          .loading-steps {
            grid-template-columns: repeat(2, 1fr);
            gap: 0.5rem;
          }
          
          .step {
            padding: 0.8rem 0.5rem;
          }
          
          .step-icon {
            font-size: 1.5rem;
          }
          
          .step-text {
            font-size: 0.8rem;
          }
        }
        
        @media (max-width: 480px) {
          .loading-steps {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;