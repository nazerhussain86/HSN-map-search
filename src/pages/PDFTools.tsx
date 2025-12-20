import React, { useState, useRef } from 'react';
import { 
  Minimize2, 
  Scissors, 
  Combine, 
 
  UploadCloud, 
  CheckCircle2, 
  Loader2, 
  Trash2, 
  File as FileIcon, 

  Search,
  Diff,
  Crop,
  X,
  ArrowLeft,
  FileType,
  Image as ImageIcon,
  Eye,
  AlertCircle,
  
} from 'lucide-react';
//import { getGeminiResponse } from '@/services/geminiService';

type ToolType = 'merge' | 'split' | 'compress' | 'extract' | 'compare' | 'ocr' | null;
type FileStatus = 'uploaded' | 'processing' | 'completed' | 'error';

interface UploadedFile {
  id: string;
  file: File;
  name: string;
  size: string;
  status: FileStatus;
  pageRange?: string;
  docType?: string;
  result?: string;
  jsonResult?: any;
  selected: boolean;
  previewUrl?: string;
  // For Split tool
  pageCount?: number;
  selectedPages?: number[];
  splitFiles?: { name: string; size: string }[];
}


const PDFTools: React.FC = () => {
  const [activeTool, setActiveTool] = useState<ToolType>(null);
  const [files, setFiles] = useState<UploadedFile[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState<string | null>(null);
  
  // View State
  const [viewingFile, setViewingFile] = useState<UploadedFile | null>(null);

  // Compare State
  const [compareFileA, setCompareFileA] = useState<UploadedFile | null>(null);
  const [compareFileB, setCompareFileB] = useState<UploadedFile | null>(null);
  const [comparisonResult, setComparisonResult] = useState<string | null>(null);
  const [isComparing, setIsComparing] = useState(false);

  // Split State
  const [splitActiveFileId, setSplitActiveFileId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const tools = [
    { id: 'merge', label: 'Merge PDF', icon: Combine, desc: 'Combine files', color: 'text-blue-600 bg-blue-50', border: 'hover:border-blue-300', status: 'active' },
    { id: 'split', label: 'Split PDF', icon: Scissors, desc: 'Extract pages', color: 'text-orange-600 bg-orange-50', border: 'hover:border-orange-300', status: 'active' },
    { id: 'compress', label: 'Compress', icon: Minimize2, desc: 'Reduce size', color: 'text-slate-400 bg-slate-50', border: 'hover:border-slate-300', status: 'upcoming' },
    { id: 'compare', label: 'Compare', icon: Diff, desc: 'Find diffs', color: 'text-purple-600 bg-purple-50', border: 'hover:border-purple-300', status: 'active' },
    { id: 'extract', label: 'Digitize', icon: FileType, desc: 'Extract Data', color: 'text-emerald-600 bg-emerald-50', border: 'hover:border-emerald-300', status: 'active' },
    { id: 'ocr', label: 'Smart OCR', icon: Crop, desc: 'Crop & Label', color: 'text-slate-400 bg-slate-50', border: 'hover:border-slate-300', status: 'upcoming' },
  ];

  const docTypes = [
    "Commercial Invoice", "Packing List", "Freight Bill", 
    "Insurance Certificate", "Bill of Lading", "Certificate of Origin"
  ];

  // --- Helpers ---
  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // const fileToBase64 = (file: File): Promise<string> => {
  //   return new Promise((resolve, reject) => {
  //     const reader = new FileReader();
  //     reader.readAsDataURL(file);
  //     reader.onload = () => resolve(reader.result as string);
  //     reader.onerror = error => reject(error);
  //   });
  // };

  // --- Core Actions ---
  const handleToolSelect = (toolId: ToolType) => {
    const tool = tools.find(t => t.id === toolId);
    if (tool?.status === 'upcoming') {
        setNotification(`${tool.label} is coming soon!`);
        setTimeout(() => setNotification(null), 3000);
        return;
    }

    setActiveTool(toolId);
    setFiles([]);
    setCompareFileA(null);
    setCompareFileB(null);
    setComparisonResult(null);
    setViewingFile(null);
    setSplitActiveFileId(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target?: 'A' | 'B') => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).map((file: File) => ({
        id: Math.random().toString(36).substr(2, 9),
        file,
        name: file.name,
        size: formatSize(file.size),
        status: 'uploaded' as FileStatus,
        pageRange: '',
        docType: '',
        selected: false,
        previewUrl: URL.createObjectURL(file),
        pageCount: Math.floor(Math.random() * 8) + 4, // Mock page count
        selectedPages: [],
        splitFiles: []
      }));

      if (target === 'A') setCompareFileA(newFiles[0]);
      else if (target === 'B') setCompareFileB(newFiles[0]);
      else {
          setFiles(prev => {
              const updated = [...prev, ...newFiles];
              if(activeTool === 'split' && !splitActiveFileId && updated.length > 0) {
                  setSplitActiveFileId(updated[0].id);
              }
              return updated;
          });
      }
      
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeFile = (id: string) => {
      setFiles(prev => prev.filter(f => f.id !== id));
      if(id === splitActiveFileId) setSplitActiveFileId(null);
  };

  // --- Tool Logic ---
  const processFile = async (id: string) => {
    const fileToProcess = files.find(f => f.id === id);
    if (!fileToProcess) return;
    setFiles(prev => prev.map(f => f.id === id ? { ...f, status: 'processing' } : f));

    if (activeTool === 'extract') {
      // try {
      //   const base64 = await fileToBase64(fileToProcess.file);
      //   const prompt = `Analyze this ${fileToProcess.docType || 'document'} image/PDF. Extract key fields as a clean JSON object.`;
      //   const aiResponse = await getGeminiResponse(prompt, base64, fileToProcess.file.type);
      //   let parsedJson;
      //   try { parsedJson = JSON.parse(aiResponse.replace(/```json/g, '').replace(/```/g, '').trim()); } catch (e) { parsedJson = { text: aiResponse }; }
      //   setFiles(prev => prev.map(f => f.id === id ? { ...f, status: 'completed', jsonResult: parsedJson, result: "Digitized" } : f));
      // } catch (e) {
      //   setFiles(prev => prev.map(f => f.id === id ? { ...f, status: 'error', result: 'Failed' } : f));
      // }
    } else if (activeTool === 'split') {
         setTimeout(() => {
          setFiles(prev => prev.map(f => f.id === id ? { 
              ...f, 
              status: 'completed',
              splitFiles: [
                  { name: `${f.name.replace('.pdf', '')}_part1.pdf`, size: '1.2 MB' },
                  { name: `${f.name.replace('.pdf', '')}_part2.pdf`, size: '0.8 MB' }
              ]
          } : f));
         }, 1500);
    } else {
      setTimeout(() => {
        setFiles(prev => prev.map(f => f.id === id ? { ...f, status: 'completed', result: 'Done' } : f));
      }, 1500);
    }
  };

  const processCompare = async () => {
    if(!compareFileA || !compareFileB) return;
    setIsComparing(true);
    setTimeout(() => {
      setComparisonResult("## Comparison Analysis\n\n**Summary:**\n- **Header**: Date modified from 12/01 to 15/01.\n- **Row 4**: Quantity increased (+50).\n- **Footer**: Terms updated.");
      setIsComparing(false);
    }, 2000);
  };

  const updateFileField = (id: string, field: keyof UploadedFile, value: string) => setFiles(files.map(f => f.id === id ? { ...f, [field]: value } : f));
  const filteredFiles = files.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));

  // --- Renderers ---

  const renderDashboard = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="text-center space-y-2 py-6">
        <h1 className="text-3xl font-extrabold text-slate-900">Document Tools</h1>
        <p className="text-slate-500 max-w-lg mx-auto">Manage, process, and digitize your trade documents securely.</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-6xl mx-auto">
        {tools.map((tool) => {
          const Icon = tool.icon;
          const isUpcoming = tool.status === 'upcoming';
          return (
            <button
              key={tool.id}
              onClick={() => handleToolSelect(tool.id as ToolType)}
              className={`
                flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-slate-100 
                shadow-sm hover:shadow-md transition-all hover:-translate-y-1 ${tool.border} group h-32 relative overflow-hidden
                ${isUpcoming ? 'opacity-70' : ''}
              `}
            >
              {isUpcoming && (
                  <div className="absolute top-2 right-2">
                      <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">Soon</span>
                  </div>
              )}
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tool.color.replace('text-', '').replace('bg-', '')} flex items-center justify-center mb-3 shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                <Icon size={20} className={tool.color.split(' ')[0]} />
              </div>
              <h3 className="font-bold text-slate-800 text-xs text-center uppercase tracking-wide">{tool.label}</h3>
              <p className="text-[10px] text-slate-400 text-center mt-1 hidden sm:block">{tool.desc}</p>
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderFileContent = (file: UploadedFile) => {
    if (!file.previewUrl) return <div className="text-slate-400 text-xs">No Preview</div>;
    if (file.file.type === 'application/pdf') {
      return <iframe src={file.previewUrl} className="w-full h-full border-0 rounded-lg bg-gray-100" title={file.name} />;
    } else if (file.file.type.startsWith('image/')) {
      return <img src={file.previewUrl} className="w-full h-full object-contain" alt={file.name} />;
    }
    return <div className="flex items-center justify-center h-full text-slate-400"><FileIcon size={48}/></div>;
  };

  const renderSplitView = () => {
      const activeFile = files.find(f => f.id === splitActiveFileId);
      return (
          <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-12rem)]">
              <div className="w-full lg:w-72 bg-white border border-slate-200 rounded-xl flex flex-col h-full overflow-hidden">
                  <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                      <h3 className="font-bold text-slate-800 text-sm">Uploaded Files</h3>
                      <div className="relative cursor-pointer hover:text-blue-600" onClick={() => fileInputRef.current?.click()}>
                         <UploadCloud size={16} />
                         <input type="file" multiple ref={fileInputRef} accept=".pdf" onChange={(e) => handleFileUpload(e)} className="hidden" />
                      </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-2 space-y-2">
                      {files.map(file => (
                          <div key={file.id} onClick={() => setSplitActiveFileId(file.id)} className={`p-3 rounded-lg cursor-pointer border transition-all flex items-center gap-3 ${splitActiveFileId === file.id ? 'bg-blue-50 border-blue-200' : 'bg-white border-transparent hover:bg-slate-50'}`}>
                              <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center flex-shrink-0 text-slate-500"><FileIcon size={16} /></div>
                              <div className="flex-1 min-w-0">
                                  <p className={`text-sm font-medium truncate ${splitActiveFileId === file.id ? 'text-blue-700' : 'text-slate-700'}`}>{file.name}</p>
                                  <p className="text-[10px] text-slate-400">{file.pageCount} Pages</p>
                              </div>
                              <button onClick={(e) => {e.stopPropagation(); setViewingFile(file)}} className="text-slate-400 hover:text-blue-500"><Eye size={14}/></button>
                          </div>
                      ))}
                  </div>
              </div>
              <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl flex flex-col h-full overflow-hidden">
                  {activeFile ? (
                      <>
                          <div className="p-4 bg-white border-b border-slate-200 flex justify-between items-center shadow-sm">
                              <div><h3 className="font-bold text-slate-800">{activeFile.name}</h3><p className="text-xs text-slate-500">Select pages to split</p></div>
                              <button onClick={() => processFile(activeFile.id)} disabled={activeFile.status === 'processing'} className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 disabled:opacity-50 flex items-center gap-2">
                                  {activeFile.status === 'processing' ? <Loader2 size={16} className="animate-spin"/> : <Scissors size={16} />} Split
                              </button>
                          </div>
                          <div className="flex-1 overflow-y-auto p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                              {Array.from({length: activeFile.pageCount||1}).map((_,i) => (
                                  <div key={i} className="aspect-[3/4] bg-white border-2 border-slate-200 rounded-lg hover:border-blue-400 cursor-pointer flex items-center justify-center shadow-sm text-slate-300 font-bold text-2xl">
                                      {i+1}
                                  </div>
                              ))}
                          </div>
                      </>
                  ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-slate-400"><Scissors size={48} className="mb-4 opacity-20"/><p>Select a PDF to start splitting</p></div>
                  )}
              </div>
          </div>
      );
  };

  const renderCompareView = () => (
      <div className="h-[calc(100vh-12rem)] flex flex-col">
          <div className="flex-1 grid grid-cols-2 gap-6 min-h-0 mb-4">
              {[
                  {file: compareFileA, id: 'A', label: 'Original'},
                  {file: compareFileB, id: 'B', label: 'Modified'}
              ].map(side => (
                  <div key={side.id} className="flex flex-col h-full">
                      <div className="flex justify-between items-center mb-2">
                          <h3 className="font-bold text-slate-700 flex items-center gap-2 text-sm"><FileIcon size={16}/> {side.label}</h3>
                          {side.file && <button onClick={()=>setViewingFile(side.file)} className="text-xs text-blue-600 flex items-center gap-1"><Eye size={12}/> Preview</button>}
                      </div>
                      <div 
                        className={`flex-1 border-2 border-dashed rounded-xl flex flex-col items-center justify-center relative overflow-hidden bg-white
                            ${side.file ? 'border-blue-300' : 'border-slate-300 hover:bg-slate-50 cursor-pointer'}`}
                        onClick={() => !side.file && document.getElementById(`file${side.id}`)?.click()}
                      >
                          <input id={`file${side.id}`} type="file" className="hidden" onChange={(e) => handleFileUpload(e, side.id as any)} />
                          {side.file ? (
                             <div className="text-center">
                                <FileIcon size={40} className="mx-auto text-blue-500 mb-2"/>
                                <p className="text-sm font-medium text-slate-700">{side.file.name}</p>
                                <button onClick={(e)=>{e.stopPropagation(); if(side.id==='A') setCompareFileA(null); else setCompareFileB(null);}} className="mt-2 text-xs text-red-500 hover:underline">Remove</button>
                             </div>
                          ) : (
                             <div className="text-center"><UploadCloud className="mx-auto text-slate-400 mb-2"/><span className="text-xs text-slate-500">Upload File</span></div>
                          )}
                      </div>
                  </div>
              ))}
          </div>
          <div className="flex justify-center">
               <button onClick={processCompare} disabled={!compareFileA || !compareFileB || isComparing} className="bg-slate-900 text-white px-8 py-3 rounded-full font-medium hover:bg-slate-800 disabled:opacity-50 flex items-center gap-2">
                   {isComparing ? <Loader2 className="animate-spin" size={18} /> : <Diff size={18} />} 
                   {isComparing ? 'Comparing...' : 'Run Comparison'}
               </button>
          </div>
          {comparisonResult && (
              <div className="mt-4 p-4 bg-white rounded-xl border border-slate-200 shadow-sm animate-in slide-in-from-bottom-2">
                  <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: comparisonResult.replace(/\n/g, '<br/>') }} />
              </div>
          )}
      </div>
  );

  const renderStandardView = () => (
    <div className="space-y-4">
       {/* Toolbar */}
       <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
           <div className="flex items-center gap-3">
              <input type="checkbox" checked={files.length>0 && files.every(f=>f.selected)} onChange={e=>setFiles(files.map(f=>({...f, selected:e.target.checked})))} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
              <span className="text-sm font-medium text-slate-700">{files.length} Files</span>
              <div className="h-4 w-px bg-slate-200 mx-2"></div>
              <button onClick={() => fileInputRef.current?.click()} className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"><UploadCloud size={16}/> Upload</button>
              <input type="file" multiple ref={fileInputRef} className="hidden" onChange={handleFileUpload}/>
           </div>
           <div className="relative w-64">
               <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
               <input type="text" placeholder="Search files..." value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"/>
           </div>
       </div>

       {/* File List */}
       <div className="space-y-3">
           {files.length === 0 && (
               <div className="text-center py-12 bg-slate-50/50 rounded-xl border-2 border-dashed border-slate-200">
                   <p className="text-slate-400 text-sm">No files uploaded yet.</p>
                   <button onClick={() => fileInputRef.current?.click()} className="mt-2 text-blue-600 font-medium text-sm">Browse Files</button>
               </div>
           )}
           {filteredFiles.map(file => (
               <div key={file.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 group hover:border-blue-300 transition-all">
                   <div className="flex items-center gap-3">
                       <input type="checkbox" checked={file.selected} onChange={()=>setFiles(files.map(f=>f.id===file.id?{...f,selected:!f.selected}:f))} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                       <div 
                         className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 cursor-pointer hover:bg-slate-200 transition-colors"
                         onClick={() => setViewingFile(file)}
                         title="Preview"
                       >
                           {file.file.type.startsWith('image/') ? <ImageIcon size={20}/> : <FileIcon size={20}/>}
                       </div>
                   </div>
                   <div className="flex-1 min-w-0">
                       <h4 className="text-sm font-medium text-slate-900 truncate">{file.name}</h4>
                       <p className="text-xs text-slate-500">{file.size} • {file.file.type}</p>
                   </div>
                   
                   {/* Tool Specific Inputs */}
                   {activeTool === 'extract' && (
                        <select className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-slate-50 outline-none focus:border-blue-500 w-32" 
                            value={file.docType} onChange={(e) => updateFileField(file.id, 'docType', e.target.value)}>
                            <option value="">Select Type</option>
                            {docTypes.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                   )}

                   <div className="flex items-center gap-2">
                       {file.status === 'completed' ? (
                           <span className="text-xs text-green-600 font-medium flex items-center gap-1 px-3 py-1.5 bg-green-50 rounded-lg"><CheckCircle2 size={14}/> Done</span>
                       ) : (
                           <button 
                                onClick={() => processFile(file.id)}
                                disabled={file.status === 'processing'}
                                className="text-xs bg-slate-900 text-white px-4 py-1.5 rounded-lg hover:bg-slate-800 disabled:opacity-50 flex items-center gap-2"
                           >
                                {file.status === 'processing' ? <Loader2 size={14} className="animate-spin"/> : activeTool === 'extract' ? 'Digitize' : 'Start'}
                           </button>
                       )}
                       <button onClick={() => setViewingFile(file)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Eye size={16}/></button>
                       <button onClick={() => removeFile(file.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16}/></button>
                   </div>
               </div>
           ))}
           {/* JSON Result Display for Extract Tool */}
           {activeTool === 'extract' && files.map(f => f.jsonResult && (
               <div key={`res-${f.id}`} className="bg-slate-900 p-4 rounded-xl text-xs font-mono text-green-400 overflow-auto max-h-60 shadow-inner">
                   <div className="flex justify-between mb-2 text-slate-400 uppercase font-bold tracking-wider">
                       <span>Extracted Data: {f.name}</span>
                       <button onClick={()=>setFiles(files.map(file=>file.id===f.id?{...file, jsonResult:null}:file))}><X size={14}/></button>
                   </div>
                   <pre>{JSON.stringify(f.jsonResult, null, 2)}</pre>
               </div>
           ))}
       </div>
    </div>
  );

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Global Notification */}
      {notification && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-6 py-3 rounded-full shadow-xl z-50 flex items-center gap-2 text-sm font-medium animate-in slide-in-from-top-4 fade-in">
            <AlertCircle size={18} className="text-yellow-400"/> {notification}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
           <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              {activeTool ? (
                  <>
                    <span className="text-slate-400 cursor-pointer hover:text-slate-600 transition-colors" onClick={() => handleToolSelect(null)}>PDF Tools</span>
                    <span className="text-slate-300">/</span>
                    <span className="flex items-center gap-2 text-blue-600">
                        {tools.find(t => t.id === activeTool)?.label}
                    </span>
                  </>
              ) : "Document Processor"}
           </h1>
           {!activeTool && <p className="text-sm text-slate-500">AI-powered suite for document management and data extraction.</p>}
        </div>
        {activeTool && (
            <button onClick={() => handleToolSelect(null)} className="text-sm text-slate-500 hover:text-slate-900 flex items-center gap-1.5 font-medium transition-colors px-3 py-1.5 rounded-lg hover:bg-white border border-transparent hover:border-slate-200">
                <ArrowLeft size={16}/> Back to Tools
            </button>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 min-h-0">
          {!activeTool ? renderDashboard() : (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-full overflow-auto">
                  {activeTool === 'compare' ? renderCompareView() : 
                   activeTool === 'split' ? renderSplitView() :
                   renderStandardView()}
              </div>
          )}
      </div>

      {/* File Viewer Modal */}
      {viewingFile && (
        <div className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
           <div className="bg-white w-full max-w-5xl h-[90vh] rounded-2xl flex flex-col shadow-2xl overflow-hidden">
               <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                   <div className="flex items-center gap-3">
                       <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                          <FileIcon size={18}/> 
                       </div>
                       <div>
                           <h3 className="font-bold text-slate-800 text-sm">{viewingFile.name}</h3>
                           <p className="text-xs text-slate-500">{viewingFile.size}</p>
                       </div>
                   </div>
                   <div className="flex items-center gap-2">
                       <button className="px-4 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-lg hover:bg-slate-800">Download</button>
                       <button onClick={() => setViewingFile(null)} className="p-2 hover:bg-red-50 hover:text-red-600 rounded-lg text-slate-500 transition-colors"><X size={20}/></button>
                   </div>
               </div>
               <div className="flex-1 bg-slate-100 relative overflow-auto flex items-center justify-center p-8">
                   <div className="shadow-xl rounded-lg overflow-hidden bg-white min-w-[50%] min-h-[50%] max-w-full max-h-full flex items-center justify-center">
                       {renderFileContent(viewingFile)}
                   </div>
               </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default PDFTools;