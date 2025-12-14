import React, { useState, useEffect } from 'react';
import {
   Calculator,
   ChevronRight,
   ChevronLeft,
   Eraser,
   ArrowRight,
   DollarSign,
   Box,
   Sparkles,
   Loader2,

   Package,
   Gavel,
   X
} from 'lucide-react';
import { suggestHSNCode, getDutyDetails, HSNPayload } from '../services/Api';
//import { getGeminiResponse } from '../geminiService'; // Keep as fallback if desired

interface HSNData {
   assessableValue: number;
   basicDuty: number;
   sws: number;
   igst: number;
   totalDuty: number;
   landedCost: number;
}

interface SuggestionRow {
   [key: string]: any;   // <-- ADD THIS
   hsnCode: string;
   title: string;
   confidence?: number;
}

const HSNMapping: React.FC = () => {


   const [isSidebarOpen, setIsSidebarOpen] = useState(true);
   const [isSuggesting, setIsSuggesting] = useState(false);
   const [isCalculating, setIsCalculating] = useState(false);

   const [formData, setFormData] = useState({
      description: '',
      hsnCode: '',
      qty: '',
      unitPrice: '',
      amount: '',
      freight: '',
      insurance: '',
      misc: ''
   });

   // Modal related state
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [suggestions, setSuggestions] = useState<SuggestionRow[]>([]);

   const [result, setResult] = useState<HSNData | null>(null);
   const [currentPage, setCurrentPage] = useState(1);
const rowsPerPage = 3;
const indexOfLastRow = currentPage * rowsPerPage;
const indexOfFirstRow = indexOfLastRow - rowsPerPage;
const currentRows = suggestions.slice(indexOfFirstRow, indexOfLastRow);

const totalPages = Math.ceil(suggestions.length / rowsPerPage);

   // Auto-calculate Amount when Qty or Unit Price changes
   useEffect(() => {
      const qty = parseFloat(formData.qty) || 0;
      const price = parseFloat(formData.unitPrice) || 0;
      if (qty > 0 || price > 0) {
         setFormData(prev => ({
            ...prev,
            amount: (qty * price).toFixed(2)
         }));
      }
   }, [formData.qty, formData.unitPrice]);

   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
   };

   const clearForm = () => {
      setFormData({
         description: '',
         hsnCode: '',
         qty: '',
         unitPrice: '',
         amount: '',
         freight: '',
         insurance: '',
         misc: ''
      });
      setResult(null);
   };

   const calculateAssessableVal = () => {
      //const amount = parseFloat(formData.amount) || 0;
      const freight = parseFloat(formData.freight) || 0;
      const insurance = parseFloat(formData.insurance) || 0;
      const misc = parseFloat(formData.misc) || 0;
      return ( freight + insurance + misc).toFixed(2);
   };

   // New: open modal and fetch suggestions
   const handleSuggestHSN = async () => {
      if (!formData.description) return;

      setIsSuggesting(true);
      setIsModalOpen(true);
      setSuggestions([]);

      try {
         const data = await suggestHSNCode(formData.description);

         let rows: any[] = [];

         // Backend returns array
         if (Array.isArray(data)) {
            rows = data;
         }

         // Backend returns single row
         else if (data && typeof data === "object") {
            rows = [data];
         }

         // Set suggestions as dynamic objects (no mapping)
         setSuggestions(rows);

      } catch (error) {
         console.error("HSN Suggestion Error:", error);
         setSuggestions([]);
      } finally {
         setIsSuggesting(false);
      }
   };


   const handleSelectSuggestion = (row: SuggestionRow) => {

      console.log("Selected Suggestion:", row);
      setFormData(prev => ({
         ...prev,
         hsnCode: row.hsCode || row.hsnCode || "",
         description: row.description || prev.description
      }));

      setIsModalOpen(false);
   };

   const calculateDetails = async () => {
      setIsCalculating(true);
      const assessableValueVal = parseFloat(calculateAssessableVal());

      // Prepare Payload
      const payload: HSNPayload = {
         description: formData.description,
         hsnCode: formData.hsnCode,
         qty: parseFloat(formData.qty) || 0,
         unitPrice: parseFloat(formData.unitPrice) || 0,
         amount: parseFloat(formData.amount) || 0,
         freight: parseFloat(formData.freight) || 0,
         insurance: parseFloat(formData.insurance) || 0,
         misc: parseFloat(formData.misc) || 0,
         assessableValue: assessableValueVal,

      };

      try {
         // Attempt backend API call
         const data = await getDutyDetails(payload);
         setResult(data);
      } catch (apiError) {

      } finally {

         setTimeout(() => setIsCalculating(false), 800);
      }

      

   };

   return (
      <div className="flex h-[calc(100vh-4rem)] bg-white overflow-hidden overflow-x-hidden">

         {/* --- Left Panel (Inputs) --- */}
         <div className={`${isSidebarOpen ? 'w-full sm:w-[360px]' : 'w-0'} bg-slate-50 border-r border-slate-200 flex flex-col transition-all duration-300 ease-in-out fixed sm:static overflow-hidden flex-shrink-0 shadow-lg z-20`}>
            <div className="p-4 border-b border-slate-200 bg-white sticky top-0 z-10 flex justify-between items-center">
               <h2 className="font-bold text-slate-800 flex items-center gap-2 text-sm uppercase tracking-wide">
                  <Calculator size={16} className="text-blue-600" /> Mapping Input
               </h2>
               {/* Close Button inside panel for mobile/convenience */}
               <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400">
                  <ChevronLeft size={20} />
               </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-6" style={{
               msOverflowStyle: "none",      // IE + Edge
               scrollbarWidth: "none"        // Firefox
            }}>

               {/* 1. Identification */}
               <div className="space-y-4">
                  <div>
                     <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Product Description</label>
                     <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={3}
                        placeholder="Enter detailed product description..."
                        className="w-full p-3 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none shadow-sm transition-all"
                     />
                  </div>

                  <div>
                     <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">HSN Code</label>
                     <div className="flex gap-2">
                        <input
                           type="text"
                           name="hsnCode"
                           value={formData.hsnCode}
                           onChange={handleInputChange}
                           placeholder="e.g. 85414011"
                           className="flex-1 p-3 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-sm font-mono tracking-wide"
                        />
                        <button
                           onClick={handleSuggestHSN}
                           disabled={isSuggesting || !formData.description}
                           className="px-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-sm flex items-center gap-2 text-xs font-bold whitespace-nowrap"
                        >
                           {isSuggesting ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                           Suggest HSN
                        </button>
                     </div>
                  </div>
               </div>

               <div className="h-px bg-slate-200 w-full"></div>

               {/* 2. Valuation */}
               <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                     <Package size={14} /> Valuation Details
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                     {/* Qty & Unit */}
                     <div className="col-span-1">
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">No. of Units (Qty)</label>
                        <input
                           type="number"
                           name="qty"
                           value={formData.qty}
                           onChange={handleInputChange}
                           placeholder="0"
                           className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                     </div>


                     {/* Price */}
                     <div className="col-span-1">
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Unit Price (₹)</label>
                        <div className="relative">
                           <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                           <input
                              type="number"
                              name="unitPrice"
                              value={formData.unitPrice}
                              onChange={handleInputChange}
                              placeholder="0.00"
                              className="w-full pl-8 p-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                           />
                        </div>
                     </div>

                     {/* Calculated Amount */}
                     <div className="col-span-2">
                        <label className="block text-xs font-bold text-blue-700 mb-1.5">Amount (Qty * Unit Price)</label>
                        <div className="relative">
                           <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500" />
                           <input
                              type="number"
                              name="amount"
                              value={formData.amount}
                              readOnly
                              className="w-full pl-8 p-2.5 bg-blue-50 border border-blue-200 rounded-lg text-sm font-bold text-blue-800 outline-none"
                           />
                        </div>
                     </div>
                  </div>
               </div>

               <div className="h-px bg-slate-200 w-full"></div>

               {/* 3. Logistics Add-ons */}
               <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                     <Box size={14} /> Add-ons (Freight/Ins.)
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="col-span-1">
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Freight (₹)</label>
                        <input
                           type="number"
                           name="freight"
                           value={formData.freight}
                           onChange={handleInputChange}
                           placeholder="0.00"
                           className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                     </div>
                     <div className="col-span-1">
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Insurance (₹)</label>
                        <input
                           type="number"
                           name="insurance"
                           value={formData.insurance}
                           onChange={handleInputChange}
                           placeholder="0.00"
                           className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                     </div>
                     <div className="col-span-1">
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Misc. Charges (₹)</label>
                        <input
                           type="number"
                           name="misc"
                           value={formData.misc}
                           onChange={handleInputChange}
                           placeholder="0.00"
                           className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                     </div>
                     <div className="col-span-1">
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Assessable Amt (₹)</label>
                        <input
                           type="text"
                           value={calculateAssessableVal()}
                           readOnly
                           className="w-full p-2.5 bg-slate-100 border border-slate-300 rounded-lg text-sm font-bold text-slate-900 outline-none cursor-default"
                        />
                     </div>
                  </div>
               </div>
            </div>

            {/* Actions */}
            <div className="p-4 border-t border-slate-200 bg-white grid grid-cols-3 gap-3">
               <button onClick={clearForm} className="col-span-1 px-4 py-3 border border-slate-300 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 flex items-center justify-center gap-2 transition-colors">
                  <Eraser size={18} />
               </button>
               <button
                  onClick={calculateDetails}
                  disabled={isCalculating}
                  className="col-span-2  bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-500 shadow-md flex items-center justify-center gap-2 transition-transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
               //className="col-span-2 px-4 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-500 shadow-md flex items-center justify-center gap-2 transition-transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
               >
                  {isCalculating ? (
                     <>
                        <Loader2 size={18} className="animate-spin" />
                        Calculating...
                     </>
                  ) : (
                     <>
                        Get Details <ArrowRight size={18} />
                     </>
                  )}
               </button>
            </div>
         </div>

         {/* Toggle Sidebar Button */}
         <div
            className="w-5 bg-white border-r border-slate-200 hover:bg-slate-50 cursor-pointer flex items-center justify-center z-10 transition-colors shadow-[4px_0_24px_rgba(0,0,0,0.02)]"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
         >
            {isSidebarOpen ? <ChevronLeft size={14} className="text-slate-400" /> : <ChevronRight size={14} className="text-slate-400" />}
         </div>

         {/* --- Right Panel (Results) --- */}
         <div className="flex-1 bg-slate-50/50 flex flex-col min-w-0">
            <div className="flex-1 p-4 lg:p-8 overflow-y-auto scroll-smooth">
               {!result ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
                     <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mb-6">
                        <Gavel size={32} className="text-slate-400" />
                     </div>
                     <h3 className="text-xl font-bold text-slate-600">Awaiting Input</h3>
                     <p className="text-sm mt-2 max-w-xs text-center">Fill out the product and valuation details on the left to generate the duty breakdown.</p>
                  </div>
               ) : null}
            </div>
         </div>

         {/* ---------- SUGGESTIONS MODAL ---------- */}
         {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
               <div className="absolute inset-0 bg-black/40" onClick={() => setIsModalOpen(false)} />

               <div className="relative max-w-3xl w-full bg-white rounded-2xl shadow-xl overflow-hidden">
                  <div className="flex items-center justify-between p-4 border-b">
                     <h3 className="font-bold">HSN Suggestions</h3>
                     <div className="flex items-center gap-2">
                        {isSuggesting && <div className="flex items-center gap-2 text-sm text-slate-500"><Loader2 className="animate-spin" size={14} /> Fetching...</div>}
                        <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-md hover:bg-slate-50">
                           <X size={18} />
                        </button>
                     </div>
                  </div>

                  <div className="p-4 max-h-[60vh] overflow-y-auto">
  {suggestions.length === 0 && !isSuggesting ? (
    <div className="text-slate-500 text-sm">No suggestions found.</div>
  ) : (
    <>
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-slate-500 uppercase tracking-wider border-b pb-2">
          <tr>
            {/* Dynamic columns */}
            {Object.keys(suggestions[0] || {}).map((col) => (
              <th key={col} className="py-2 px-3">{col}</th>
            ))}

            {/* Select column */}
            <th className="py-2 px-3 text-right">Select</th>
          </tr>
        </thead>

        <tbody className="divide-y">
          {currentRows.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-slate-50">
              {Object.keys(row).map((col) => (
                <td key={col} className="py-3 px-3 text-slate-700">
                  {String(row[col] ?? "—")}
                </td>
              ))}

              {/* Select Button */}
              <td className="py-3 px-3 text-right">
                <button
                  onClick={(e) => {
                    e.stopPropagation();       // Prevent row click
                    handleSelectSuggestion(row);
                  }}
                  className="px-3 py-1 bg-indigo-600 text-white rounded-md text-xs hover:bg-indigo-700 transition"
                >
                  Select
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex justify-between items-center pt-4">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((prev) => prev - 1)}
          className={`px-3 py-1 rounded-md text-sm ${
            currentPage === 1
              ? "bg-gray-200 text-gray-400"
              : "bg-slate-900 text-white hover:bg-slate-700"
          }`}
        >
          Previous
        </button>

        <span className="text-sm text-slate-600">
          Page {currentPage} of {totalPages}
        </span>

        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((prev) => prev + 1)}
          className={`px-3 py-1 rounded-md text-sm ${
            currentPage === totalPages
              ? "bg-gray-200 text-gray-400"
              : "bg-slate-900 text-white hover:bg-slate-700"
          }`}
        >
          Next
        </button>
      </div>
    </>
  )}
</div>



                  <div className="p-4 border-t flex justify-end gap-2">
                     <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-lg border">Cancel</button>
                  </div>
               </div>
            </div>
         )}

      </div>
   );
};

export default HSNMapping;
