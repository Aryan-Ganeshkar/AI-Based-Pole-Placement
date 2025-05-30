import React, { useState, useRef, useEffect } from 'react';
import { Upload, MapPin, Camera, CheckCircle, XCircle, AlertTriangle, Download, Eye, Trash2, Settings } from 'lucide-react';

const PoleValidationApp = () => {
  const [plots, setPlots] = useState([]);
  const [selectedPlot, setSelectedPlot] = useState(null);
  const [poles, setPoles] = useState([]);
  const [analysisResults, setAnalysisResults] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('upload');
  const [mapCenter, setMapCenter] = useState({ lat: 21.1458, lng: 79.0882 }); // Nagpur coordinates
  const [validationMode, setValidationMode] = useState('realtime');
  
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Mock data for demonstration
  const mockPlots = [
    {
      id: 1,
      name: "Plot A - Residential Area",
      boundaries: [
        { lat: 21.1458, lng: 79.0882 },
        { lat: 21.1468, lng: 79.0892 },
        { lat: 21.1478, lng: 79.0882 },
        { lat: 21.1468, lng: 79.0872 }
      ],
      area: "2.5 acres",
      status: "active"
    },
    {
      id: 2,
      name: "Plot B - Commercial Zone",
      boundaries: [
        { lat: 21.1480, lng: 79.0885 },
        { lat: 21.1490, lng: 79.0895 },
        { lat: 21.1500, lng: 79.0885 },
        { lat: 21.1490, lng: 79.0875 }
      ],
      area: "3.2 acres",
      status: "active"
    }
  ];

  const mockAnalysisResults = [
    {
      id: 1,
      plotId: 1,
      poleId: "P001",
      position: { lat: 21.1463, lng: 79.0887 },
      status: "valid",
      confidence: 95,
      timestamp: new Date().toISOString(),
      issues: []
    },
    {
      id: 2,
      plotId: 1,
      poleId: "P002",
      position: { lat: 21.1475, lng: 79.0879 },
      status: "invalid",
      confidence: 88,
      timestamp: new Date().toISOString(),
      issues: ["Outside boundary", "Incorrect positioning"]
    },
    {
      id: 3,
      plotId: 2,
      poleId: "P003",
      position: { lat: 21.1485, lng: 79.0890 },
      status: "warning",
      confidence: 72,
      timestamp: new Date().toISOString(),
      issues: ["Near boundary edge"]
    }
  ];

  useEffect(() => {
    setPlots(mockPlots);
    setAnalysisResults(mockAnalysisResults);
  }, []);

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    setIsProcessing(true);
    
    // Simulate file processing
    setTimeout(() => {
      const newPoles = files.map((file, index) => ({
        id: Date.now() + index,
        name: file.name,
        type: file.type.startsWith('image/') ? 'image' : 'video',
        url: URL.createObjectURL(file),
        processed: false
      }));
      
      setPoles(prev => [...prev, ...newPoles]);
      setIsProcessing(false);
    }, 2000);
  };

  const startCameraCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0);
      
      canvas.toBlob((blob) => {
        const newPole = {
          id: Date.now(),
          name: `Captured_${new Date().toISOString()}`,
          type: 'image',
          url: URL.createObjectURL(blob),
          processed: false
        };
        setPoles(prev => [...prev, newPole]);
      });
    }
  };

  const processAIValidation = async () => {
    setIsProcessing(true);
    
    // Simulate AI processing
    setTimeout(() => {
      const updatedPoles = poles.map(pole => ({
        ...pole,
        processed: true,
        aiAnalysis: {
          confidence: Math.floor(Math.random() * 30) + 70,
          status: ['valid', 'invalid', 'warning'][Math.floor(Math.random() * 3)],
          detectedObjects: Math.floor(Math.random() * 5) + 1
        }
      }));
      
      setPoles(updatedPoles);
      setIsProcessing(false);
    }, 3000);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'valid': return 'text-green-600 bg-green-100';
      case 'invalid': return 'text-red-600 bg-red-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'valid': return <CheckCircle className="w-4 h-4" />;
      case 'invalid': return <XCircle className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      default: return <Eye className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">AI Pole Validation System</h1>
                <p className="text-sm text-gray-500">Geo-fenced pole placement analysis</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Settings className="w-4 h-4 text-gray-400" />
                <select 
                  value={validationMode} 
                  onChange={(e) => setValidationMode(e.target.value)}
                  className="text-sm border border-gray-300 rounded px-2 py-1"
                >
                  <option value="realtime">Real-time</option>
                  <option value="batch">Batch Processing</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-white p-1 rounded-lg shadow-sm mb-8">
          {['upload', 'camera', 'analysis', 'results'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium capitalize transition-colors ${
                activeTab === tab
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Upload Tab */}
            {activeTab === 'upload' && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Upload Images/Videos</h2>
                
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-700 mb-2">
                    Drop files here or click to upload
                  </p>
                  <p className="text-sm text-gray-500">
                    Support for images (JPG, PNG) and videos (MP4, MOV)
                  </p>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                {poles.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-4">Uploaded Files ({poles.length})</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {poles.map((pole) => (
                        <div key={pole.id} className="bg-gray-50 rounded-lg p-3">
                          <div className="aspect-video bg-gray-200 rounded mb-2 overflow-hidden">
                            {pole.type === 'image' ? (
                              <img src={pole.url} alt={pole.name} className="w-full h-full object-cover" />
                            ) : (
                              <video src={pole.url} className="w-full h-full object-cover" />
                            )}
                          </div>
                          <p className="text-xs font-medium truncate">{pole.name}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              pole.processed ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {pole.processed ? 'Processed' : 'Pending'}
                            </span>
                            <button 
                              onClick={() => setPoles(poles.filter(p => p.id !== pole.id))}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Camera Tab */}
            {activeTab === 'camera' && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Live Camera Capture</h2>
                
                <div className="aspect-video bg-black rounded-lg mb-4 overflow-hidden">
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    muted 
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="flex space-x-4">
                  <button
                    onClick={startCameraCapture}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Start Camera</span>
                  </button>
                  
                  <button
                    onClick={captureImage}
                    className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <span>Capture Image</span>
                  </button>
                </div>
                
                <canvas ref={canvasRef} className="hidden" />
              </div>
            )}

            {/* Analysis Tab */}
            {activeTab === 'analysis' && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">AI Analysis</h2>
                  <button
                    onClick={processAIValidation}
                    disabled={isProcessing || poles.length === 0}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                      isProcessing || poles.length === 0
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700'
                    }`}
                  >
                    {isProcessing ? 'Processing...' : 'Start AI Validation'}
                  </button>
                </div>

                {isProcessing && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      <div>
                        <p className="font-medium text-blue-900">AI Processing in Progress</p>
                        <p className="text-sm text-blue-700">Analyzing pole positions and validating placement...</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid gap-4">
                  {poles.filter(pole => pole.processed).map((pole) => (
                    <div key={pole.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start space-x-4">
                        <div className="w-20 h-20 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                          <img src={pole.url} alt={pole.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 mb-2">{pole.name}</h4>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Confidence:</span>
                              <p className="font-medium">{pole.aiAnalysis?.confidence}%</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Status:</span>
                              <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(pole.aiAnalysis?.status)}`}>
                                {getStatusIcon(pole.aiAnalysis?.status)}
                                <span className="capitalize">{pole.aiAnalysis?.status}</span>
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-500">Objects:</span>
                              <p className="font-medium">{pole.aiAnalysis?.detectedObjects}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Results Tab */}
            {activeTab === 'results' && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Validation Results</h2>
                  <button className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                    <Download className="w-4 h-4" />
                    <span>Export Report</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {analysisResults.map((result) => (
                    <div key={result.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-medium text-gray-900">Pole {result.poleId}</h4>
                            <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(result.status)}`}>
                              {getStatusIcon(result.status)}
                              <span className="capitalize">{result.status}</span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-500 mb-2">
                            Position: {result.position.lat.toFixed(6)}, {result.position.lng.toFixed(6)}
                          </p>
                          <p className="text-sm text-gray-500">
                            Confidence: {result.confidence}% | {new Date(result.timestamp).toLocaleString()}
                          </p>
                          {result.issues.length > 0 && (
                            <div className="mt-2">
                              <p className="text-sm font-medium text-red-600">Issues:</p>
                              <ul className="text-sm text-red-500 list-disc list-inside">
                                {result.issues.map((issue, index) => (
                                  <li key={index}>{issue}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Plot Selection */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Plot</h3>
              <div className="space-y-3">
                {plots.map((plot) => (
                  <div
                    key={plot.id}
                    onClick={() => setSelectedPlot(plot)}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedPlot?.id === plot.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <h4 className="font-medium text-gray-900">{plot.name}</h4>
                    <p className="text-sm text-gray-500">Area: {plot.area}</p>
                    <span className={`inline-block px-2 py-1 text-xs rounded-full mt-2 ${
                      plot.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {plot.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Statistics */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Poles Analyzed</span>
                  <span className="font-semibold text-gray-900">{analysisResults.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Valid Placements</span>
                  <span className="font-semibold text-green-600">
                    {analysisResults.filter(r => r.status === 'valid').length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Invalid Placements</span>
                  <span className="font-semibold text-red-600">
                    {analysisResults.filter(r => r.status === 'invalid').length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Warnings</span>
                  <span className="font-semibold text-yellow-600">
                    {analysisResults.filter(r => r.status === 'warning').length}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                  View Map Overlay
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                  Generate Report
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                  Export Data
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                  Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PoleValidationApp;