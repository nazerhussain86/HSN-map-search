import React, { useState, useRef } from 'react';
import { 
  Upload, 
  FileText, 
  X, 
  Plus, 
  Combine, 
  Scissors, 
  Minimize2, 
  ScanText, 
  CheckCircle2, 
  Loader2, 
  Trash2, 
  Eye, 
  MoreVertical, 
  Image as ImageIcon, 
  ChevronRight, 
  ChevronLeft, 
  Save,
  Search,
  Maximize2,
  FileJson,
  Settings,
  Database,
  Play,
  UploadCloud,
  Code,
  Table
} from 'lucide-react';
import { getGeminiResponse } from '../geminiService';

// Types
type FileStatus = 'uploaded' | 'processing' | 'completed' | 'error';

interface UploadedFile {
  id: string;
  file: File;
  name: string;
  size: string;
  type: 'pdf' | 'image';
  status: FileStatus;
  previewUrl: string;
  extractedData?: any;
  selected: boolean;
}

const ETLProcess: React.FC = () => {
  // State
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [openTabs, setOpenTabs] = useState<string[]>([]); // IDs of open files
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [processingAction, setProcessingAction] = useState<string | null>(null);
  const [extractionView, setExtractionView] = useState<'json' | 'table'>('json');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helpers
  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  // Handlers
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).map((file: File) => ({
        id: Math.random().toString(36).substr(2, 9),
        file,
        name: file.name,
        size: formatSize(file.size),
        type: file.type.includes('pdf') ? 'pdf' : 'image' as 'pdf' | 'image',
        status: 'uploaded' as FileStatus,
        selected: false,
        previewUrl: URL.createObjectURL(file)
      }));

      setFiles(prev => [...prev, ...newFiles]);
      
      // Auto open first new file
      if (newFiles.length > 0) {
        const firstId = newFiles[0].id;
        if (!openTabs.includes(firstId)) setOpenTabs(prev => [...prev, firstId]);
        setActiveTabId(firstId);
      }
      
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const openTab = (fileId: string) => {
    if (!openTabs.includes(fileId)) {
      setOpenTabs(prev => [...prev, fileId]);
    }
    setActiveTabId(fileId);
  };

  const closeTab = (e: React.MouseEvent, fileId: string) => {
    e.stopPropagation();
    const newTabs = openTabs.filter(id => id !== fileId);
    setOpenTabs(newTabs);
    if (activeTabId === fileId) {
      setActiveTabId(newTabs.length > 0 ? newTabs[newTabs.length - 1] : null);
    }
  };

  const deleteFile = (e: React.MouseEvent, fileId: string) => {
    e.stopPropagation();
    setFiles(prev => prev.filter(f => f.id !== fileId));
    setOpenTabs(prev => prev.filter(id => id !== fileId));
    if (activeTabId === fileId) setActiveTabId(null);
  };

  const handleSelection = (fileId: string) => {
    setFiles(prev => prev.map(f => f.id === fileId ? { ...f, selected: !f.selected } : f));
  };

  // --- ETL Actions ---
  
  const performMerge = () => {
    const selected = files.filter(f => f.selected);
    if (selected.length < 2) {
      alert("Select at least 2 files from the explorer to merge.");
      return;
    }
    setProcessingAction('Merging Files...');
    setTimeout(() => {
      setProcessingAction(null);
      alert(`Merged ${selected.length} files successfully!`);
      // Logic to add merged file would go here
    }, 2000);
  };

  const performExtract = async () => {
    if (!activeTabId) return;
    const file = files.find(f => f.id === activeTabId);
    if (!file) return;

    setProcessingAction('Extracting Data...');
    setFiles(prev => prev.map(f => f.id === activeTabId ? { ...f, status: 'processing' } : f));

    try {
      const base64 = await fileToBase64(file.file);
      const prompt = `Extract key entities from this document (Invoice/Bill/Contract). Return a flat JSON object with keys like 'document_type', 'date', 'total_amount', 'vendor', 'buyer', 'items_summary'.`;
      
      const response = await getGeminiResponse(prompt, base64, file.file.type);
      let jsonRes = { raw: response };
      try {
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
             jsonRes = JSON.parse(jsonMatch[0]);
        }
      } catch (e) { console.log("JSON Parse Error", e); }

      setFiles(prev => prev.map(f => f.id === activeTabId ? { ...f, status: 'completed', extractedData: jsonRes } : f));
    } catch (e) {
      setFiles(prev => prev.map(f => f.id === activeTabId ? { ...f, status: 'error' } : f));
    } finally {
      setProcessingAction(null);
    }
  };

  const activeFile = files.find(f => f.id === activeTabId);

  return (
    <div className="flex h-full bg-white font-sans text-slate-700 overflow-hidden">
      
      {/* --- Left Sidebar (File Explorer) --- */}
      <div className={`${isSidebarOpen ? 'w-72' : 'w-0'} border-r border-slate-200 bg-slate-50 flex flex-col transition-all duration-300 ease-in-out relative overflow-hidden`}>
         <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-white">
            <span className="font-bold text-sm text-slate-800 flex items-center gap-2">
              <Database size={16} className="text-blue-600"/>  FILES
            </span>
            <button onClick={() => fileInputRef.current?.click()} className="p-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
              <Plus size={16}/>
            </button>
         </div>

         <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {files.length === 0 && (
               <div className="text-center p-8 text-xs text-slate-400">
                 <UploadCloud size={32} className="mx-auto mb-2 opacity-50"/>
                 No files uploaded
               </div>
            )}
            {files.map(file => (
               <div 
                 key={file.id}
                 onClick={() => openTab(file.id)}
                 className={`
                   group flex items-center gap-3 p-2.5 rounded-lg cursor-pointer border transition-all
                   ${activeTabId === file.id ? 'bg-white border-blue-200 shadow-sm ring-1 ring-blue-100' : 'bg-transparent border-transparent hover:bg-slate-100'}
                 `}
               >
                 <input 
                    type="checkbox" 
                    checked={file.selected} 
                    onClick={(e) => e.stopPropagation()} 
                    onChange={() => handleSelection(file.id)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
                 />
                 <div className="text-slate-400">
                    {file.type === 'image' ? <ImageIcon size={16}/> : <FileText size={16}/>}
                 </div>
                 <div className="flex-1 min-w-0">
                    <p className={`text-xs font-medium truncate ${activeTabId === file.id ? 'text-blue-700' : 'text-slate-700'}`}>{file.name}</p>
                    <p className="text-[10px] text-slate-400">{file.size}</p>
                 </div>
                 {file.status === 'completed' && <CheckCircle2 size={14} className="text-emerald-500"/>}
                 <button onClick={(e) => deleteFile(e, file.id)} className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition-opacity">
                    <Trash2 size={14}/>
                 </button>
               </div>
            ))}
         </div>

         {/* Bulk Actions */}
         <div className="p-3 border-t border-slate-200 bg-white">
            <button 
               onClick={performMerge}
               disabled={files.filter(f => f.selected).length < 2}
               className="w-full flex items-center justify-center gap-2 bg-slate-800 text-white text-xs font-medium py-2 rounded-lg hover:bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
               <Combine size={14}/> Merge Selected ({files.filter(f => f.selected).length})
            </button>
         </div>
         
         <input type="file" multiple ref={fileInputRef} className="hidden" onChange={handleFileUpload} accept=".pdf,.jpg,.png"/>
      </div>

      {/* Sidebar Toggle */}
      <div 
        className="w-3 bg-slate-200 hover:bg-slate-300 cursor-pointer flex items-center justify-center z-10"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
         {isSidebarOpen ? <ChevronLeft size={12}/> : <ChevronRight size={12}/>}
      </div>


      {/* --- Main Workspace --- */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-100">
         
         {/* 1. Tab Bar */}
         <div className="h-10 bg-slate-200 flex items-end px-2 gap-1 border-b border-slate-300">
            {openTabs.length === 0 && <span className="text-xs text-slate-500 p-2">No documents open</span>}
            {openTabs.map(tabId => {
               const file = files.find(f => f.id === tabId);
               if(!file) return null;
               const isActive = activeTabId === tabId;
               return (
                  <div 
                    key={tabId} 
                    onClick={() => setActiveTabId(tabId)}
                    className={`
                      group flex items-center gap-2 px-3 py-1.5 max-w-[200px] rounded-t-lg cursor-pointer select-none border-x border-t border-transparent text-xs font-medium
                      ${isActive ? 'bg-white text-slate-800 shadow-[0_-1px_2px_rgba(0,0,0,0.05)] !border-slate-300' : 'bg-slate-200 text-slate-500 hover:bg-slate-300'}
                    `}
                  >
                     <span className="truncate flex-1">{file.name}</span>
                     <button onClick={(e) => closeTab(e, tabId)} className="hover:bg-slate-400/20 rounded-full p-0.5 text-slate-400 hover:text-slate-700">
                        <X size={12}/>
                     </button>
                  </div>
               )
            })}
         </div>

         {/* 2. Toolbar */}
         <div className="h-12 bg-white border-b border-slate-200 flex items-center justify-between px-4 shadow-sm">
            <div className="flex items-center gap-2">
               <button disabled={!activeTabId} onClick={performExtract} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded hover:bg-emerald-100 text-xs font-medium transition-colors disabled:opacity-50">
                  <ScanText size={14}/> Extract Data
               </button>
               <div className="h-5 w-px bg-slate-200 mx-1"></div>
               <button disabled={!activeTabId} className="flex items-center gap-1.5 px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded text-xs font-medium transition-colors disabled:opacity-50">
                  <Scissors size={14}/> Split
               </button>
               <button disabled={!activeTabId} className="flex items-center gap-1.5 px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded text-xs font-medium transition-colors disabled:opacity-50">
                  <Minimize2 size={14}/> Compress
               </button>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
               {activeFile && <span className="text-xs">{activeFile.size}</span>}
               <button className="p-1.5 hover:bg-slate-100 rounded text-slate-500"><Settings size={16}/></button>
            </div>
         </div>

         {/* 3. Main Viewport */}
         <div className="flex-1 flex overflow-hidden relative">
            
            {/* Document Viewer */}
            <div className="flex-1 bg-slate-500/5 overflow-auto flex items-center justify-center p-4 relative">
               {activeFile ? (
                  <div className="bg-white shadow-xl w-full h-full max-w-4xl rounded-lg overflow-hidden relative">
                     {activeFile.type === 'pdf' ? (
                        <iframe src={activeFile.previewUrl} className="w-full h-full border-0" title="PDF Viewer" />
                     ) : (
                        <div className="w-full h-full overflow-auto flex items-center justify-center bg-slate-900">
                           <img src={activeFile.previewUrl} className="max-w-full max-h-full object-contain" alt="Preview"/>
                        </div>
                     )}
                     {/* Processing Overlay */}
                     {activeFile.status === 'processing' && (
                        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                           <Loader2 size={40} className="text-blue-600 animate-spin mb-3"/>
                           <p className="font-medium text-slate-700 animate-pulse">{processingAction || 'Processing...'}</p>
                        </div>
                     )}
                  </div>
               ) : (
                  <div className="text-center text-slate-400">
                     <UploadCloud size={48} className="mx-auto mb-3 opacity-30"/>
                     <p className="text-sm">Open a file to view content</p>
                  </div>
               )}
            </div>

            {/* 4. Right Sidebar (Results) */}
            {activeFile && activeFile.extractedData && (
               <div className="w-80 bg-white border-l border-slate-200 flex flex-col shadow-xl z-10 animate-in slide-in-from-right duration-300">
                  <div className="p-3 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                     <h3 className="font-bold text-xs text-slate-700 uppercase tracking-wider flex items-center gap-2">
                        <FileJson size={14}/> Extracted Data
                     </h3>
                     <div className="flex gap-1">
                        <button onClick={() => setExtractionView('json')} className={`p-1 rounded ${extractionView==='json'?'bg-white shadow text-blue-600':'text-slate-400'}`}><Code size={14}/></button>
                        <button onClick={() => setExtractionView('table')} className={`p-1 rounded ${extractionView==='table'?'bg-white shadow text-blue-600':'text-slate-400'}`}><Table size={14}/></button>
                     </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4">
                     {extractionView === 'json' ? (
                        <pre className="text-[10px] font-mono text-slate-700 whitespace-pre-wrap bg-slate-50 p-2 rounded border border-slate-100">
                           {JSON.stringify(activeFile.extractedData, null, 2)}
                        </pre>
                     ) : (
                        <div className="space-y-3">
                           {Object.entries(activeFile.extractedData).map(([key, val]) => (
                              <div key={key} className="text-xs border-b border-slate-100 pb-2 last:border-0">
                                 <span className="font-bold text-slate-500 block mb-0.5 uppercase">{key.replace(/_/g, ' ')}</span>
                                 <span className="text-slate-800 break-words font-medium">{String(val)}</span>
                              </div>
                           ))}
                        </div>
                     )}
                  </div>
                  <div className="p-3 border-t border-slate-100 bg-slate-50">
                     <button className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium py-2 rounded transition-colors">
                        <Save size={14}/> Export to CSV
                     </button>
                  </div>
               </div>
            )}

         </div>
      </div>
    </div>
  );
};

export default ETLProcess;