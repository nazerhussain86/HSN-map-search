import React, { useState } from 'react';
import { 
  FileText, 
  Minimize2, 
  Scissors, 
  Combine, 
  ScanText, 
  UploadCloud, 
  CheckCircle2, 
  File, 
  Loader2,
  Trash2,
  Download
} from 'lucide-react';
import { getGeminiResponse } from '../services/geminiService';

type ToolType = 'merge' | 'split' | 'compress' | 'extract';

interface UploadedFile {
  name: string;
  size: string;
  id: string;
}

const PDFTools: React.FC = () => {
  const [activeTool, setActiveTool] = useState<ToolType>('merge');
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<string | null>(null);

  const tools = [
    { id: 'merge', label: 'Merge PDF', icon: Combine, desc: 'Combine multiple PDFs into a single file' },
    { id: 'split', label: 'Split PDF', icon: Scissors, desc: 'Separate a PDF into individual pages' },
    { id: 'compress', label: 'Compress PDF', icon: Minimize2, desc: 'Reduce file size while maintaining quality' },
    { id: 'extract', label: 'Extract Data', icon: ScanText, desc: 'Extract text and tables from any document' },
  ];

  // Mock file upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).map(file => ({
        name: file.name,
        size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
        id: Math.random().toString(36).substr(2, 9)
      }));
      
      if (activeTool === 'merge') {
        setFiles(prev => [...prev, ...newFiles]);
      } else {
        // For other tools, usually only one file at a time
        setFiles([newFiles[0]]);
      }
      setResult(null);
      setExtractedData(null);
    }
  };

  const removeFile = (id: string) => {
    setFiles(files.filter(f => f.id !== id));
  };

  const handleProcess = async () => {
    if (files.length === 0) return;

    setIsProcessing(true);
    setResult(null);
    setExtractedData(null);

    // Simulate processing time
    if (activeTool === 'extract') {
       try {
         // In a real scenario, we would send the file content to Gemini. 
         // Here we simulate extraction based on filename for demo purposes.
         const prompt = `Extract key data points from a document named "${files[0].name}". 
         Assume it is an invoice or HSN document. 
         Return a structured JSON-like summary of fields like Date, Invoice Number, Items, HS Codes, and Amounts.`;
         
         const aiResponse = await getGeminiResponse(prompt);
         setExtractedData(aiResponse);
         setResult('Extraction Complete');
       } catch (error) {
         console.error(error);
         setResult('Error extracting data');
       }
    } else {
       // Simulate PDF manipulation delay
       setTimeout(() => {
         setResult(`${activeTool === 'merge' ? 'Merged' : activeTool === 'split' ? 'Split' : 'Compressed'} document ready for download.`);
       }, 2000);
    }
    setIsProcessing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold text-slate-900">PDF & Document Tools</h1>
        <p className="text-slate-500">Manage your trade documents efficiently.</p>
      </div>

      {/* Tool Selection Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {tools.map((tool) => {
          const Icon = tool.icon;
          const isActive = activeTool === tool.id;
          return (
            <button
              key={tool.id}
              onClick={() => {
                setActiveTool(tool.id as ToolType);
                setFiles([]);
                setResult(null);
                setExtractedData(null);
              }}
              className={`
                flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-200
                ${isActive 
                  ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm' 
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'}
              `}
            >
              <Icon size={24} className="mb-2" />
              <span className="font-semibold text-sm">{tool.label}</span>
              <span className="text-xs text-center mt-1 opacity-70 hidden md:block">{tool.desc}</span>
            </button>
          );
        })}
      </div>

      {/* Main Workspace */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px] flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-lg font-bold text-slate-800 flex items-center">
             {activeTool === 'merge' && <Combine size={20} className="mr-2 text-blue-600" />}
             {activeTool === 'split' && <Scissors size={20} className="mr-2 text-blue-600" />}
             {activeTool === 'compress' && <Minimize2 size={20} className="mr-2 text-blue-600" />}
             {activeTool === 'extract' && <ScanText size={20} className="mr-2 text-blue-600" />}
             {tools.find(t => t.id === activeTool)?.label}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {activeTool === 'merge' ? 'Upload multiple PDF files to combine them into one.' : 
             activeTool === 'extract' ? 'Upload any PDF, JPG, or PNG to extract structured data using AI.' :
             `Upload a PDF file to ${activeTool} it.`}
          </p>
        </div>

        {/* Upload Area */}
        <div className="flex-1 p-8">
          {files.length === 0 ? (
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-12 text-center hover:bg-slate-50 transition-colors relative">
              <input 
                type="file" 
                multiple={activeTool === 'merge'} 
                accept={activeTool === 'extract' ? ".pdf,.jpg,.png,.jpeg" : ".pdf"}
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <UploadCloud size={32} />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Click to upload or drag and drop</h3>
              <p className="text-slate-500 mt-2 text-sm">
                {activeTool === 'extract' ? 'PDF, JPG, PNG (max 10MB)' : 'PDF (max 50MB)'}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* File List */}
              <div className="space-y-3">
                {files.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-white border border-slate-200 rounded shadow-sm text-red-500">
                        <FileText size={24} />
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{file.name}</p>
                        <p className="text-xs text-slate-500">{file.size}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => removeFile(file.id)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-4 pt-4 border-t border-slate-100">
                <button 
                  onClick={() => setFiles([])}
                  className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleProcess}
                  disabled={isProcessing}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors flex items-center disabled:opacity-70"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 size={18} className="mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      {activeTool === 'extract' ? 'Extract Data' : `Process ${activeTool.charAt(0).toUpperCase() + activeTool.slice(1)}`}
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Results Section */}
          {(result || extractedData) && (
            <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-xl animate-in fade-in slide-in-from-bottom-4">
              <div className="flex items-center mb-4">
                <CheckCircle2 size={24} className="text-green-600 mr-3" />
                <h3 className="text-lg font-bold text-green-800">
                  {activeTool === 'extract' ? 'Data Extracted Successfully' : 'Task Completed Successfully!'}
                </h3>
              </div>
              
              {activeTool === 'extract' && extractedData ? (
                <div className="bg-white p-4 rounded-lg border border-green-200 text-sm text-slate-700 font-mono whitespace-pre-wrap shadow-sm overflow-auto max-h-64">
                  {extractedData}
                </div>
              ) : (
                <p className="text-green-700 mb-4">
                  Your file has been {activeTool === 'merge' ? 'merged' : activeTool === 'split' ? 'split' : 'compressed'} and is ready.
                </p>
              )}

              <div className="mt-4 flex gap-3">
                <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-sm transition-colors">
                  <Download size={18} className="mr-2" />
                  Download Result
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PDFTools;