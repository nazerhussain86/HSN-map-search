import React, { useState, useRef } from 'react';
import { 

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
 
  Image as ImageIcon, 
  ChevronRight, 
  ChevronLeft, 
  Save,
  
  FileJson,
  Settings,
  Database,
 
  UploadCloud,
  Code,
  Table,
  
} from 'lucide-react';
import { getGeminiResponse } from '@/services/geminiService';

import { PDFDocument } from 'pdf-lib';

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
  pageCount: number; 
}

const ETLProcess: React.FC = () => {
  // State
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [openTabs, setOpenTabs] = useState<string[]>([]); // IDs of open files
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [processingAction, setProcessingAction] = useState<string | null>(null);
  const [extractionView, setExtractionView] = useState<'json' | 'table'>('json');

  // Split Modal State
  const [isSplitModalOpen, setIsSplitModalOpen] = useState(false);
  const [splitStrategy, setSplitStrategy] = useState<'range' | 'pages'>('range');
  const [splitRange, setSplitRange] = useState('');

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
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles: UploadedFile[] = [];
      
      for (const file of Array.from(e.target.files)) {
        let pageCount = 0;
        // Try to get actual page count for PDFs
        if (file.type === 'application/pdf') {
            try {
                const arrayBuffer = await file.arrayBuffer();
                const pdfDoc = await PDFDocument.load(arrayBuffer);
                pageCount = pdfDoc.getPageCount();
            } catch (err) {
                console.error("Error reading PDF page count", err);
                pageCount = 1; // Fallback
            }
        } else {
            pageCount = 1; // Images are 1 page
        }

        newFiles.push({
            id: Math.random().toString(36).substr(2, 9),
            file,
            name: file.name,
            size: formatSize(file.size),
            type: file.type.includes('pdf') ? 'pdf' : 'image',
            status: 'uploaded',
            selected: false,
            previewUrl: URL.createObjectURL(file),
            pageCount: pageCount
        });
      }

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
  
  const performMerge = async () => {
    const selected = files.filter(f => f.selected);
    if (selected.length < 2) {
      alert("Please select at least 2 files from the left sidebar to merge.");
      return;
    }
    
    setProcessingAction('Merging Documents...');
    
    try {
        const mergedPdf = await PDFDocument.create();

        for (const fileData of selected) {
            // Ensure we are working with PDFs. 
            // If an image, we would need to embed it, but for now assuming PDFs mostly.
            if (fileData.type === 'pdf') {
                const arrayBuffer = await fileData.file.arrayBuffer();
                const pdf = await PDFDocument.load(arrayBuffer);
                const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
                copiedPages.forEach((page) => mergedPdf.addPage(page));
            } else {
                // If implementing image merge, we'd embed PNG/JPG here
                // Skipping non-PDFs for this specific merge implementation or handling simply
                console.warn("Skipping non-PDF file in merge:", fileData.name);
            }
        }

        const mergedPdfBytes = await mergedPdf.save();
        const fixedBytes = new Uint8Array(mergedPdfBytes);
        const mergedBlob = new Blob([fixedBytes], { type: 'application/pdf' });
        const mergedFile = new File([mergedBlob], `Merged_Docs_${new Date().toISOString().slice(0,10)}.pdf`, { type: 'application/pdf' });

        const newFileEntry: UploadedFile = {
            id: Math.random().toString(36).substr(2, 9),
            file: mergedFile,
            name: mergedFile.name,
            size: formatSize(mergedFile.size),
            type: 'pdf',
            status: 'completed',
            selected: false,
            previewUrl: URL.createObjectURL(mergedFile),
            pageCount: mergedPdf.getPageCount()
        };

        setFiles(prev => [...prev, newFileEntry]);
        // Deselect others
        setFiles(prev => prev.map(f => ({ ...f, selected: false })));
        // Open new file
        setOpenTabs(prev => [...prev, newFileEntry.id]);
        setActiveTabId(newFileEntry.id);

    } catch (error) {
        console.error("Merge failed", error);
        alert("Failed to merge documents. Please ensure valid PDF files are selected.");
    } finally {
        setProcessingAction(null);
    }
  };

  const initiateSplit = () => {
    if (!activeTabId) return;
    setIsSplitModalOpen(true);
  };

  const performSplit = async () => {
    if (!activeTabId) return;
    const file = files.find(f => f.id === activeTabId);
    if (!file || file.type !== 'pdf') {
        alert("Can only split PDF files.");
        return;
    }

    setProcessingAction('Splitting Document...');
    setIsSplitModalOpen(false);

    try {
        const arrayBuffer = await file.file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const totalPages = pdfDoc.getPageCount();
        const baseName = file.name.replace('.pdf', '');
        const newFilesList: UploadedFile[] = [];

        if (splitStrategy === 'pages') {
            // Split into individual pages
            for (let i = 0; i < totalPages; i++) {
                const newPdf = await PDFDocument.create();
                const [copiedPage] = await newPdf.copyPages(pdfDoc, [i]);
                newPdf.addPage(copiedPage);
                
                const pdfBytes = await newPdf.save();
                const fixedBytes = new Uint8Array(pdfBytes);
                const blob = new Blob([fixedBytes], { type: 'application/pdf' });
                const newFile = new File([blob], `${baseName}_split.pdf`, { type: 'application/pdf' });

                newFilesList.push({
                    id: Math.random().toString(36).substr(2, 9),
                    file: newFile,
                    name: newFile.name,
                    size: formatSize(newFile.size),
                    type: 'pdf',
                    status: 'completed',
                    selected: false,
                    previewUrl: URL.createObjectURL(newFile),
                    pageCount: 1
                });
            }
        } else {
            // Split by range (e.g., "1-3, 5")
            // Parse range
            const pageIndices: number[] = [];
            const parts = splitRange.split(',').map(p => p.trim());
            
            for (const part of parts) {
                if (part.includes('-')) {
                    const [start, end] = part.split('-').map(n => parseInt(n));
                    if (!isNaN(start) && !isNaN(end)) {
                        for (let i = start; i <= end; i++) {
                            if (i >= 1 && i <= totalPages) pageIndices.push(i - 1);
                        }
                    }
                } else {
                    const num = parseInt(part);
                    if (!isNaN(num) && num >= 1 && num <= totalPages) {
                        pageIndices.push(num - 1);
                    }
                }
            }
            
            // Remove duplicates and sort
            const uniqueIndices = Array.from(new Set(pageIndices)).sort((a, b) => a - b);

            if (uniqueIndices.length === 0) {
                alert("Invalid page range specified.");
                setProcessingAction(null);
                return;
            }

            const newPdf = await PDFDocument.create();
            const copiedPages = await newPdf.copyPages(pdfDoc, uniqueIndices);
            copiedPages.forEach((page) => newPdf.addPage(page));

            const pdfBytes = await newPdf.save();
            const fixedBytes = new Uint8Array(pdfBytes);
            const blob = new Blob([fixedBytes], { type: 'application/pdf' });
            const newFile = new File([blob], `${baseName}_split.pdf`, { type: 'application/pdf' });

            newFilesList.push({
                id: Math.random().toString(36).substr(2, 9),
                file: newFile,
                name: newFile.name,
                size: formatSize(newFile.size),
                type: 'pdf',
                status: 'completed',
                selected: false,
                previewUrl: URL.createObjectURL(newFile),
                pageCount: newPdf.getPageCount()
            });
        }

        setFiles(prev => [...prev, ...newFilesList]);
        if (newFilesList.length > 0) openTab(newFilesList[0].id);

    } catch (error) {
        console.error("Split failed", error);
        alert("An error occurred while splitting the PDF.");
    } finally {
        setProcessingAction(null);
    }
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
    <div className="flex h-full bg-white font-sans text-slate-700 overflow-hidden relative">
      
      {/* --- Left Sidebar (File Explorer) --- */}
      <div className={`${isSidebarOpen ? 'w-72' : 'w-0'} border-r border-slate-200 bg-slate-50 flex flex-col transition-all duration-300 ease-in-out relative overflow-hidden flex-shrink-0`}>
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
                    <p className="text-[10px] text-slate-400">{file.size} • {file.pageCount} p</p>
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
        className="w-3 bg-slate-200 hover:bg-slate-300 cursor-pointer flex items-center justify-center z-10 flex-shrink-0"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
         {isSidebarOpen ? <ChevronLeft size={12}/> : <ChevronRight size={12}/>}
      </div>


      {/* --- Main Workspace --- */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-100 relative">
         
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
               {/* <button disabled={!activeTabId} onClick={performExtract} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded hover:bg-emerald-100 text-xs font-medium transition-colors disabled:opacity-50">
                  <ScanText size={14}/> Extract Data
               </button> */}
               <div className="h-5 w-px bg-slate-200 mx-1"></div>
               <button onClick={initiateSplit} disabled={!activeTabId} className="flex items-center gap-1.5 px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded text-xs font-medium transition-colors disabled:opacity-50">
                  <Scissors size={14}/> Split
               </button>
               {/* <button disabled={!activeTabId} className="flex items-center gap-1.5 px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded text-xs font-medium transition-colors disabled:opacity-50">
                  <Minimize2 size={14}/> Compress
               </button> */}
            </div>
            <div className="flex items-center gap-2 text-slate-400">
               {activeFile && <span className="text-xs">{activeFile.size}</span>}
               {/* <button className="p-1.5 hover:bg-slate-100 rounded text-slate-500"><Settings size={16}/></button> */}
            </div>
         </div>

         {/* 3. Main Viewport */}
         <div className="flex-1 flex overflow-hidden relative">
            
            {/* Document Viewer */}
            <div className="flex-1 bg-slate-500/5 overflow-auto flex items-center justify-center p-4 relative">
               {activeFile ? (
                  <div className="bg-white shadow-xl w-full h-full max-w-4xl rounded-lg overflow-hidden relative border border-slate-200">
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

         {/* Processing Modal Overlay (Global) */}
         {processingAction && !activeFile?.status.includes('processing') && (
            <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-[2px] z-50 flex items-center justify-center">
                <div className="bg-white p-6 rounded-xl shadow-2xl flex items-center gap-4 border border-slate-100">
                   <Loader2 size={24} className="text-blue-600 animate-spin"/>
                   <span className="font-medium text-slate-700">{processingAction}</span>
                </div>
            </div>
         )}
      </div>

      {/* --- Split Modal --- */}
      {isSplitModalOpen && activeFile && (
        <div className="fixed inset-0 z-[60] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
              <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                 <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <Scissors size={18} className="text-slate-500"/> Split Document
                 </h3>
                 <button onClick={() => setIsSplitModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
              </div>
              
              <div className="p-6 space-y-6">
                 <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg flex items-start gap-3">
                    <FileText size={20} className="text-blue-600 mt-0.5"/>
                    <div>
                       <p className="text-sm font-bold text-slate-800">{activeFile.name}</p>
                       <p className="text-xs text-slate-500">{activeFile.pageCount} Pages • {activeFile.size}</p>
                    </div>
                 </div>

                 <div className="space-y-3">
                    <label className="flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                       <input 
                         type="radio" 
                         name="splitStrategy" 
                         checked={splitStrategy === 'range'} 
                         onChange={() => setSplitStrategy('range')}
                         className="text-blue-600 focus:ring-blue-500"
                       />
                       <div className="flex-1">
                          <span className="text-sm font-medium text-slate-900 block">Extract by Range</span>
                          <span className="text-xs text-slate-500">Extract specific pages (e.g. 1-3, 5)</span>
                       </div>
                    </label>
                    
                    {splitStrategy === 'range' && (
                       <div className="pl-8">
                          <input 
                            type="text" 
                            placeholder="e.g. 1-3, 5" 
                            value={splitRange}
                            onChange={(e) => setSplitRange(e.target.value)}
                            className="w-full p-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                       </div>
                    )}

                    <label className="flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                       <input 
                         type="radio" 
                         name="splitStrategy" 
                         checked={splitStrategy === 'pages'} 
                         onChange={() => setSplitStrategy('pages')}
                         className="text-blue-600 focus:ring-blue-500"
                       />
                       <div className="flex-1">
                          <span className="text-sm font-medium text-slate-900 block">Split into Single Pages</span>
                          <span className="text-xs text-slate-500">Create a separate file for every page</span>
                       </div>
                    </label>
                 </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                 <button onClick={() => setIsSplitModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800">Cancel</button>
                 <button onClick={performSplit} className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 shadow-sm">
                    Split Document
                 </button>
              </div>
           </div>
        </div>
      )}

    </div>
  );
};

export default ETLProcess;