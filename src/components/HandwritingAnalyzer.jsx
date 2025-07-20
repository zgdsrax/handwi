import React, { useState, useRef, useEffect } from 'react';
import graphologyRules from '../graphologyRules.json';
import './HandwritingAnalyzer.css';

const HandwritingAnalyzer = ({ onAnalysisComplete, onAnalysisStart }) => {
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);
  const [cvLoaded, setCvLoaded] = useState(false);

  useEffect(() => {
    // Ensure canvas reference is initialized
    if (!canvasRef.current) {
      console.warn('Canvas reference not initialized on component mount');
    }
    
    // Check if OpenCV is already loaded
    if (window.cv && window.cv.Mat) {
      setCvLoaded(true);
      return;
    }
    
    // Create a global flag to prevent multiple loads
    if (window.isOpenCVLoading) {
      // Wait for the existing load to complete
      const checkInterval = setInterval(() => {
        if (window.cv && window.cv.Mat) {
          setCvLoaded(true);
          clearInterval(checkInterval);
        }
      }, 100);
      return () => clearInterval(checkInterval);
    }
    
    // Set loading flag
    window.isOpenCVLoading = true;
    
    // Load OpenCV.js
    const script = document.createElement('script');
    script.src = 'https://docs.opencv.org/4.8.0/opencv.js';
    script.async = true;
    script.onload = () => {
      // Wait for cv to be ready
      const checkCV = () => {
        if (window.cv && window.cv.Mat) {
          setCvLoaded(true);
          window.isOpenCVLoading = false;
        } else {
          setTimeout(checkCV, 100);
        }
      };
      checkCV();
    };
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleFileUpload = (file) => {
    if (!cvLoaded) {
      alert('OpenCV is still loading. Please wait a moment and try again.');
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file.');
      return;
    }

    onAnalysisStart();

    // Ensure OpenCV is properly loaded before proceeding
    if (!window.cv || !window.cv.Mat) {
      alert('OpenCV failed to load properly. Please refresh the page and try again.');
      onAnalysisComplete(null);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        analyzeHandwriting(img, file);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const analyzeHandwriting = (img, originalFile) => {
    try {
      const canvas = canvasRef.current;
      
      // Check if canvas reference is valid
      if (!canvas) {
        console.error('Canvas reference is null');
        alert('Error analyzing handwriting. Please try again.');
        onAnalysisComplete(null);
        return;
      }
      
      const ctx = canvas.getContext('2d');
      
      // Check if context is valid
      if (!ctx) {
        console.error('Failed to get canvas context');
        alert('Error analyzing handwriting. Please try again.');
        onAnalysisComplete(null);
        return;
      }
      
      // Set canvas size
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw image to canvas
      ctx.drawImage(img, 0, 0);
      
      // Get image data for OpenCV
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      // Create OpenCV Mat from image data
      let src, gray, binary, contours, hierarchy;
      
      try {
        // Create OpenCV Mat from image data
        src = window.cv.matFromImageData(imageData);
        gray = new window.cv.Mat();
        binary = new window.cv.Mat();
        contours = new window.cv.MatVector();
        hierarchy = new window.cv.Mat();
        
        // Convert to grayscale
        window.cv.cvtColor(src, gray, window.cv.COLOR_RGBA2GRAY);
        
        // Apply threshold to get binary image
        window.cv.threshold(gray, binary, 0, 255, window.cv.THRESH_BINARY_INV + window.cv.THRESH_OTSU);
        
        // Find contours
        window.cv.findContours(binary, contours, hierarchy, window.cv.RETR_EXTERNAL, window.cv.CHAIN_APPROX_SIMPLE);
        
        // Analyze features
        const features = extractFeatures(contours, binary, canvas);
        
        // Generate personality analysis
        const personalityAnalysis = generatePersonalityAnalysis(features);
        
        // Draw contours on canvas for visualization
        drawContours(canvas, contours);
        
        // Return results
        onAnalysisComplete({
          features,
          personality: personalityAnalysis,
          timestamp: new Date().toISOString()
        }, originalFile, canvas);
      } catch (cvError) {
        console.error('OpenCV processing error:', cvError);
        throw cvError;
      } finally {
        // Clean up OpenCV Mats to prevent memory leaks
        if (src) src.delete();
        if (gray) gray.delete();
        if (binary) binary.delete();
        if (contours) contours.delete();
        if (hierarchy) hierarchy.delete();
      }
    } catch (error) {
      console.error('Analysis error:', error);
      alert('Error analyzing handwriting. Please try a different image.');
      onAnalysisComplete(null);
    }
  };

  const extractFeatures = (contours, binary, canvas) => {
    const features = {
      slant: 0,
      spacing: 0.5,
      size: 0.5,
      pressure: 0.5,
      letterCount: 0,
      wordCount: 0
    };
    
    // Early return if canvas is null or contours is not available
    if (!canvas) {
      console.error('Canvas reference is null in extractFeatures');
      return features;
    }
    
    if (!contours) {
      console.error('Contours object is null in extractFeatures');
      return features;
    }
    
    // Additional check for canvas context
    try {
      const testCtx = canvas.getContext('2d');
      if (!testCtx) {
        console.error('Failed to get canvas context in extractFeatures');
        return features;
      }
    } catch (error) {
      console.error('Error accessing canvas context:', error);
      return features;
    }

    try {
      // Ensure OpenCV is properly loaded and canvas is available
      if (!window.cv) {
        console.error('OpenCV not available during feature extraction');
        return features;
      }
      
      if (!canvas) {
        console.error('Canvas reference is null during feature extraction');
        return features;
      }
      
      const numContours = contours.size();
      features.letterCount = numContours;
      
      if (numContours === 0) {
        return features;
      }

      let totalArea = 0;
      let totalWidth = 0;
      let totalHeight = 0;
      let angles = [];
      let spacings = [];
      let contourAreas = [];
      
      // Analyze each contour
      for (let i = 0; i < numContours; i++) {
        const contour = contours.get(i);
        const area = window.cv.contourArea(contour);
        
        if (area > 50) { // Filter out noise
          const rect = window.cv.boundingRect(contour);
          totalArea += area;
          totalWidth += rect.width;
          totalHeight += rect.height;
          contourAreas.push(area);
          
          // Calculate slant (simplified)
          if (rect.height > rect.width) {
            try {
              const ellipse = window.cv.fitEllipse(contour);
              angles.push(ellipse.angle);
            } catch (ellipseError) {
              // Skip this contour if ellipse fitting fails
              console.warn('Ellipse fitting failed for a contour', ellipseError);
            }
          }
          
          // Calculate spacing (distance between contours)
          if (i > 0) {
            const prevContour = contours.get(i - 1);
            const prevRect = window.cv.boundingRect(prevContour);
            const spacing = Math.abs(rect.x - (prevRect.x + prevRect.width));
            spacings.push(spacing);
          }
        }
      }
      
      // Calculate average slant
      if (angles.length > 0) {
        const avgAngle = angles.reduce((sum, angle) => sum + angle, 0) / angles.length;
        features.slant = avgAngle - 90; // Normalize to -90 to 90 range
      }
      
      // Calculate average spacing (normalized)
      if (spacings.length > 0) {
        const avgSpacing = spacings.reduce((sum, spacing) => sum + spacing, 0) / spacings.length;
        const avgWidth = totalWidth / contourAreas.length;
        features.spacing = Math.min(1, avgSpacing / avgWidth);
      }
      
      // Calculate average size (normalized to canvas)
      if (contourAreas.length > 0) {
        const avgHeight = totalHeight / contourAreas.length;
        features.size = Math.min(1, avgHeight / (canvas.height * 0.1));
      }
      
      // Estimate pressure based on contour area density
      if (contourAreas.length > 0) {
        const avgArea = totalArea / contourAreas.length;
        const avgWidth = totalWidth / contourAreas.length;
        const avgHeight = totalHeight / contourAreas.length;
        const density = avgArea / (avgWidth * avgHeight);
        features.pressure = Math.min(1, density);
      }
      
      // Estimate word count (simplified)
      features.wordCount = Math.max(1, Math.floor(contourAreas.length / 5));
      
    } catch (error) {
      console.error('Feature extraction error:', error);
    }
    
    return features;
  };

  const generatePersonalityAnalysis = (features) => {
    const traits = [];
    const rules = graphologyRules.rules;
    
    // Analyze slant
    Object.entries(rules.slant).forEach(([key, rule]) => {
      if (features.slant >= rule.range[0] && features.slant <= rule.range[1]) {
        traits.push(...rule.traits);
      }
    });
    
    // Analyze spacing
    Object.entries(rules.spacing).forEach(([key, rule]) => {
      if (features.spacing >= rule.range[0] && features.spacing <= rule.range[1]) {
        traits.push(...rule.traits);
      }
    });
    
    // Analyze size
    Object.entries(rules.size).forEach(([key, rule]) => {
      if (features.size >= rule.range[0] && features.size <= rule.range[1]) {
        traits.push(...rule.traits);
      }
    });
    
    // Analyze pressure
    Object.entries(rules.pressure).forEach(([key, rule]) => {
      if (features.pressure >= rule.range[0] && features.pressure <= rule.range[1]) {
        traits.push(...rule.traits);
      }
    });
    
    // Find matching personality template
    const template = graphologyRules.personalityTemplates.find(template => {
      return template.combination.some(trait => traits.includes(trait));
    }) || {
      title: "The Unique Individual",
      description: "You have a distinctive personality that doesn't fit into conventional categories. Your handwriting reveals a complex and interesting character."
    };
    
    return {
      traits: [...new Set(traits)], // Remove duplicates
      template,
      confidence: Math.min(100, Math.max(60, traits.length * 10))
    };
  };

  const drawContours = (canvas, contours) => {
    // Check if canvas and contours are valid
    if (!canvas) {
      console.error('Canvas reference is null in drawContours');
      return;
    }
    
    if (!contours) {
      console.error('Contours object is null in drawContours');
      return;
    }
    
    const ctx = canvas.getContext('2d');
    
    // Check if context is valid
    if (!ctx) {
      console.error('Failed to get canvas context in drawContours');
      return;
    }
    
    ctx.strokeStyle = '#ff6b6b';
    ctx.lineWidth = 2;
    
    for (let i = 0; i < contours.size(); i++) {
      const contour = contours.get(i);
      const points = [];
      
      for (let j = 0; j < contour.rows; j++) {
        const point = contour.data32S.slice(j * 2, j * 2 + 2);
        points.push({ x: point[0], y: point[1] });
      }
      
      if (points.length > 0) {
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let k = 1; k < points.length; k++) {
          ctx.lineTo(points[k].x, points[k].y);
        }
        ctx.closePath();
        ctx.stroke();
      }
    }
  };

  return (
    <div className="handwriting-analyzer">
      <div 
        className={`upload-area ${dragOver ? 'drag-over' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="upload-content">
          <div className="upload-icon">📝</div>
          <h3>Upload Your Handwriting Sample</h3>
          <p>Drag and drop an image here, or click to select</p>
          <p className="upload-hint">
            Best results with clear handwriting on white paper
          </p>
          {!cvLoaded && (
            <p className="loading-opencv">Loading analysis engine...</p>
          )}
        </div>
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="file-input"
      />
      
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default HandwritingAnalyzer;