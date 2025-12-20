import React, { useState, useEffect } from 'react';
import {
   Calculator,
   ChevronRight,
   ChevronLeft,
   Eraser,
   ArrowRight,
   //DollarSign,
   Box,
   Sparkles,
   Loader2,
   Package,
   Gavel,
   X,
   FileText,
   ChevronDown,
   ChevronUp,
   //Info
} from 'lucide-react';
import { suggestHSNCode, getDutyDetails, HSNPayload, HSNData } from '../services/Api';
import { getHSNDetailsFromAI } from '../services/geminiService';
interface SuggestionRow {
   [key: string]: any;
   hsnCode: string;
   title: string;
   confidence?: number;
}

const HSNMapping: React.FC = () => {
   const [isSidebarOpen, setIsSidebarOpen] = useState(true);
   const [isSuggesting, setIsSuggesting] = useState(false);
   const [isCalculating, setIsCalculating] = useState(false);
   const [openSections, setOpenSections] = useState<string[]>(['basic', 'duty']);

   const [aiData, setAiData] = useState<any>(null);
   const [_, setLoadingAI] = useState(false);

   const fetchHSNFromAI = async () => {
      setLoadingAI(true);
      try {
         const data = await getHSNDetailsFromAI(
            formData.hsnCode,
            formData.description
         );
         setAiData(data);
      } finally {
         setLoadingAI(false);
      }
   };


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
   const [openDutyIndex, setOpenDutyIndex] = useState<number | null>(null);

   const [result, setResult] = useState<HSNData | null>(null);
   const [currentPage, setCurrentPage] = useState(1);
   const rowsPerPage = 5;
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
      return (freight + insurance + misc).toFixed(2);
   };

   const toggleSection = (section: string) => {
      setOpenSections(prev =>
         prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
      );
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

         setSuggestions(rows);
      } catch (error) {
         console.error("HSN Suggestion Error:", error);
         setSuggestions([]);
      } finally {
         setIsSuggesting(false);
      }
   };

   const handleSelectSuggestion = (row: SuggestionRow) => {
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
         // 1️⃣ Call Gemini FIRST
         await fetchHSNFromAI();
         // Attempt backend API call
         const data = await getDutyDetails(payload);
         setResult(data);
         // Ensure default sections are open
         setOpenSections(['basic', 'duty']);
      } catch (apiError) {
         console.error(apiError);
      } finally {
         setTimeout(() => setIsCalculating(false), 800);
      }
   };

   return (
      <div className="flex h-[calc(100vh-6rem)] bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">

         {/* --- Left Panel (Inputs) --- */}
         <div className={`${isSidebarOpen ? 'w-full md:w-[400px]' : 'w-0'} bg-slate-50 border-r border-slate-200 flex flex-col transition-all duration-300 ease-in-out relative overflow-hidden flex-shrink-0`}>
            <div className="p-4 border-b border-slate-200 bg-white sticky top-0 z-10 flex justify-between items-center h-16">
               <h2 className="font-bold text-slate-800 flex items-center gap-2 text-sm uppercase tracking-wide">
                  <Calculator size={16} className="text-blue-600" /> Mapping Input
               </h2>
               {/* Close Button inside panel for mobile/convenience */}
               <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-slate-400">
                  <ChevronLeft size={20} />
               </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-6">

               {/* 1. Identification */}
               <div className="space-y-4">
                  <div>
                     <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Product Description</label>
                     <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={2}
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
                           Suggest
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
                           {/* <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /> */}
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
                           {/* <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500" /> */}
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
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Assessable Add (₹)</label>
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
                  className="col-span-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 shadow-md flex items-center justify-center gap-2 transition-transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
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
               ) : (
                  <div className="max-w-5xl mx-auto space-y-6">
                     {/* Header */}
                     <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-2">
                        <div>
                           <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider mb-1 cursor-pointer hover:text-blue-600 transition-colors" onClick={() => setResult(null)}>
                              <ChevronLeft size={14} /> Back to Search
                           </div>
                           <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
                              {aiData?.hsnBasicInfo?.hsnCode || "20079930"}
                           </h1>
                           <p className="text-lg text-slate-600 font-medium">{aiData?.hsnBasicInfo?.description || "Product Description"}</p>
                        </div>
                        <div className="flex items-center gap-3">
                           <div className="flex flex-col items-center justify-center bg-orange-50 border border-orange-100 px-4 py-2 rounded-xl">
                              <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest">UQC</span>
                              <span className="text-sm font-bold text-orange-700">{aiData?.hsnBasicInfo?.uqc}</span>
                           </div>
                           <div className="flex flex-col items-center justify-center bg-green-50 border border-green-100 px-4 py-2 rounded-xl">
                              <span className="text-[10px] font-bold text-green-400 uppercase tracking-widest">Policy</span>
                              <span className="text-sm font-bold text-green-700">{aiData?.hsnBasicInfo?.policy}</span>
                           </div>
                           <button className="p-3 bg-white border border-slate-200 text-red-500 rounded-xl hover:bg-red-50 hover:border-red-100 transition-colors shadow-sm">
                              <FileText size={20} />
                           </button>
                        </div>
                     </div>

                     {/* Sections */}

                     {/* 1. HSN Basic Info */}
                     <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <button onClick={() => toggleSection('basic')} className="w-full flex items-center justify-between p-4 bg-blue-50/50 hover:bg-blue-50 transition-colors border-b border-blue-100/50">
                           <span className="font-bold text-blue-900 text-sm flex items-center gap-2">
                              HSN Basic Info
                           </span>
                           {openSections.includes('basic') ? <ChevronUp size={16} className="text-blue-400" /> : <ChevronDown size={16} className="text-blue-400" />}
                        </button>
                        {openSections.includes('basic') && (
                           <div className="p-4 text-sm space-y-3">
                              <div className="grid grid-cols-12 gap-4">
                                 <div className="col-span-3 md:col-span-2 font-semibold text-blue-600/80">Chapter {aiData?.hsnBasicInfo?.chapter?.code || 'XX'}:</div>
                                 <div className="col-span-9 md:col-span-10 text-slate-700">{aiData?.hsnBasicInfo?.chapter?.title || 'Preparations of Vegetables, Fruit, Nuts or other Parts of Plants'}</div>
                              </div>
                              <div className="grid grid-cols-12 gap-4 border-t border-slate-100 pt-3">
                                 <div className="col-span-3 md:col-span-2 font-semibold text-blue-600/80">Heading {aiData?.hsnBasicInfo?.heading?.code || 'XXXX'}:</div>
                                 <div className="col-span-9 md:col-span-10 text-slate-700">{aiData?.hsnBasicInfo?.heading?.title || 'JAMS, FRUIT JELLIES, MARMALADES, FRUIT OR NUT PUREE AND FRUIT OR NUT PASTES, OBTAINED BY COOKING, WHETHER OR NOT CONTAINING ADDED SUGAR OR OTHER SWEETENING MATTER'}</div>
                              </div>
                              <div className="grid grid-cols-12 gap-4 border-t border-slate-100 pt-3">
                                 <div className="col-span-3 md:col-span-2 font-semibold text-blue-600/80">Subheading {aiData?.hsnBasicInfo?.subheading?.code || 'XX'}:</div>
                                 <div className="col-span-9 md:col-span-10 text-slate-700"> {aiData?.hsnBasicInfo?.subheading?.title}</div>
                              </div>
                           </div>
                        )}
                     </div>

                     {/* 2. Duty */}
                     <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <button onClick={() => toggleSection('duty')} className="w-full flex items-center justify-between p-4 bg-blue-50/50 hover:bg-blue-50 transition-colors border-b border-blue-100/50">
                           <span className="font-bold text-blue-900 text-sm flex items-center gap-2">
                              Duty
                           </span>
                           {openSections.includes('duty') ? <ChevronUp size={16} className="text-blue-400" /> : <ChevronDown size={16} className="text-blue-400" />}
                        </button>
                        {openSections.includes('duty') && (
                           <div className="overflow-x-auto">
                              <table className="w-full text-left text-sm">
                                 <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold border-b border-slate-100">
                                    <tr>
                                       <th className="px-6 py-3">No</th>
                                       <th className="px-6 py-3">Value and Duty Description</th>
                                       <th className="px-6 py-3">Scheduled Duty(%)</th>
                                       <th className="px-6 py-3">Notification</th>
                                       <th className="px-6 py-3 text-right">Effective Duty(%)</th>
                                       <th className="px-6 py-3 text-right">Calculated (₹)</th>
                                    </tr>
                                 </thead>
                                 <tbody className="divide-y divide-slate-100">
                                    {aiData?.dutyDetails?.map((duty: any) => (
                                       <tr key={duty.no} className="hover:bg-slate-50/50 transition-colors">
                                          <td className="px-6 py-4 text-slate-400">{duty.no}</td>

                                          <td className="px-6 py-4">
                                             <span className="font-medium text-slate-700">
                                                {duty.valueAndDutyDescription}
                                             </span>
                                          </td>

                                          <td className="px-6 py-4 text-slate-600">
                                             {duty.scheduledDutyPercent}%
                                          </td>

                                          {/* Notification (Dropdown-ready text) */}
                                          {/* <td className="px-6 py-4">
                                             <div className="relative">
                                                <input
                                                   type="text"
                                                   readOnly
                                                   value={
                                                      duty.notifications && duty.notifications.length > 0
                                                         ? `${duty.notifications[0].notificationNumber} - ${duty.notifications[0].shortDescription}`
                                                         : 'No Notification'
                                                   }
                                                   className="w-64 bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs"
                                                />

                                                {/* Show dropdown icon only if multiple notifications exist 
                                                {duty.notifications && duty.notifications.length > 1 && (
                                                   <ChevronDown
                                                      size={12}
                                                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400"
                                                   />
                                                )}
                                             </div>
                                          </td> */}
                                          <td className="px-6 py-4 relative">
                                             <div
                                                className="relative cursor-pointer"
                                                onClick={() =>
                                                   setOpenDutyIndex(openDutyIndex === duty.no ? null : duty.no)
                                                }
                                             >
                                                <input
                                                   type="text"
                                                   readOnly
                                                   value={
                                                      duty.notifications.length > 0
                                                         ? `${duty.notifications[0].notificationNumber}`
                                                         : 'No Notification'
                                                   }
                                                   className="w-64 bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs cursor-pointer"
                                                />

                                                {duty.notifications.length > 1 && (
                                                   <ChevronDown
                                                      size={12}
                                                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400"
                                                   />
                                                )}
                                             </div>

                                             {openDutyIndex === duty.no && duty.notifications.length > 1 && (
                                                <div className="absolute z-20 mt-1 w-64 bg-white border border-slate-200 rounded shadow">
                                                   {duty.notifications.map((n: any, idx: number) => (
                                                      <div
                                                         key={idx}
                                                         className="px-2 py-1 text-xs hover:bg-slate-100 cursor-pointer"
                                                      >
                                                         {n.notificationNumber}
                                                      </div>
                                                   ))}
                                                </div>
                                             )}
                                          </td>

                                          <td className="px-6 py-4 text-right">
                                             <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-bold border border-slate-200">
                                                {duty.effectiveDutyPercent}%
                                             </span>
                                          </td>

                                          <td className="px-6 py-4 text-right font-medium text-slate-900">
                                             ₹{duty.calculatedAmount.toLocaleString('en-IN')}
                                          </td>
                                       </tr>
                                    ))}
                                 </tbody>

                                 <tfoot className="bg-slate-50 border-t border-slate-200">
                                    <tr>
                                       <td colSpan={4} className="px-6 py-4 text-right font-bold text-slate-700">Total Duty Payable</td>
                                       <td className="px-6 py-4 text-right font-bold text-slate-500">{((result.totalDuty / result.assessableValue) * 100).toFixed(2)}%</td>
                                       <td className="px-6 py-4 text-right font-bold text-green-600 text-lg">₹{result.totalDuty.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                                    </tr>
                                 </tfoot>
                              </table>
                           </div>
                        )}
                     </div>

                     {/* 3. Declarations (Collapsed by default) */}
                     <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <button onClick={() => toggleSection('declarations')} className="w-full flex items-center justify-between p-4 bg-blue-50/50 hover:bg-blue-50 transition-colors border-b border-blue-100/50">
                           <span className="font-bold text-blue-900 text-sm flex items-center gap-2">Declarations</span>
                           {openSections.includes('declarations') ? <ChevronUp size={16} className="text-blue-400" /> : <ChevronDown size={16} className="text-blue-400" />}
                        </button>
                        {openSections.includes('declarations') && (
                           <div className="p-0">
                              <table className="w-full text-sm text-left">
                                 <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
                                    <tr>
                                       <th className="px-6 py-3">Statements</th>
                                       <th className="px-6 py-3">Description</th>
                                    </tr>
                                 </thead>
                                 <tbody className="divide-y divide-slate-100">
                                    {aiData?.declarations?.map((dec: any, idx: number) => (
                                       <tr key={idx}>
                                          <td className="px-6 py-3 font-medium text-slate-700">
                                             {dec.statement}
                                          </td>
                                          <td className="px-6 py-3 text-slate-600">
                                             {dec.description}
                                          </td>
                                       </tr>
                                    ))}
                                 </tbody>
                              </table>
                           </div>
                        )}
                     </div>

                     {/* 4. Required Documents */}
                     <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <button onClick={() => toggleSection('docs')} className="w-full flex items-center justify-between p-4 bg-blue-50/50 hover:bg-blue-50 transition-colors border-b border-blue-100/50">
                           <span className="font-bold text-blue-900 text-sm flex items-center gap-2">Required Documents</span>
                           {openSections.includes('docs') ? <ChevronUp size={16} className="text-blue-400" /> : <ChevronDown size={16} className="text-blue-400" />}
                        </button>
                        {openSections.includes('docs') && (
                           <div className="p-0">
                              <table className="w-full text-sm text-left">
                                 <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
                                    <tr>
                                       <th className="px-6 py-3">DOC Code</th>
                                       <th className="px-6 py-3">Description</th>
                                    </tr>
                                 </thead>
                                 <tbody className="divide-y divide-slate-100">
                                    {aiData?.requiredDocuments?.map((doc: any, idx: number) => (
                                       <tr key={idx}>
                                          <td className="px-6 py-3 font-mono text-slate-600">
                                             {doc.docCode}
                                          </td>
                                          <td className="px-6 py-3">
                                             {doc.description}
                                          </td>
                                       </tr>
                                    ))}
                                 </tbody>
                              </table>
                           </div>
                        )}
                     </div>

                     {/* 5. Relevant FTAs */}
                     <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <button onClick={() => toggleSection('fta')} className="w-full flex items-center justify-between p-4 bg-blue-50/50 hover:bg-blue-50 transition-colors border-b border-blue-100/50">
                           <span className="font-bold text-blue-900 text-sm flex items-center gap-2">Relevant FTAs / SAPTA</span>
                           {openSections.includes('fta') ? <ChevronUp size={16} className="text-blue-400" /> : <ChevronDown size={16} className="text-blue-400" />}
                        </button>
                        {openSections.includes('fta') && (
                           <div className="p-0">
                              <table className="w-full text-sm text-left">
                                 <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
                                    <tr>
                                       <th className="px-6 py-3">No.</th>
                                       <th className="px-6 py-3">FTA Notification</th>
                                       <th className="px-6 py-3">FTA Duty</th>
                                       <th className="px-6 py-3 text-right">Applicable Countries</th>
                                    </tr>
                                 </thead>
                                 <tbody className="divide-y divide-slate-100">
                                    {aiData?.ftaDetails?.map((fta: any) => (
                                       <tr key={fta.no}>
                                          <td className="px-6 py-3 text-slate-500">{fta.no}</td>

                                          <td className="px-6 py-3">
                                             <div className="font-medium text-slate-700">
                                                {fta.ftaNotification}
                                             </div>
                                          </td>

                                          <td className="px-6 py-3 font-bold text-slate-700">
                                             {fta.ftaDutyPercent}%
                                          </td>

                                          <td className="px-6 py-3 text-right flex items-center justify-end gap-2">
                                             <span className="text-slate-600">{fta.applicableCountries}</span>
                                             <ChevronRight size={14} className="text-slate-400" />
                                          </td>
                                       </tr>
                                    ))}
                                 </tbody>

                              </table>
                           </div>
                        )}
                     </div>

                  </div>
               )}
            </div>
         </div>

         {/* ---------- SUGGESTIONS MODAL ---------- */}
         {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
               <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />

               <div className="relative max-w-4xl w-full bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[85vh]">
                  <div className="flex items-center justify-between p-4 border-b bg-slate-50">
                     <h3 className="font-bold text-slate-800 flex items-center gap-2"><Sparkles size={16} className="text-indigo-600" /> AI HSN Suggestions</h3>
                     <div className="flex items-center gap-2">
                        {isSuggesting && <div className="flex items-center gap-2 text-sm text-slate-500"><Loader2 className="animate-spin" size={14} /> Analysis in progress...</div>}
                        <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-md hover:bg-slate-200 text-slate-500">
                           <X size={20} />
                        </button>
                     </div>
                  </div>

                  <div className="p-0 overflow-y-auto flex-1">
                     {suggestions.length === 0 && !isSuggesting ? (
                        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                           <Package size={48} className="mb-4 opacity-30" />
                           <p>No suggestions found for this description.</p>
                        </div>
                     ) : (
                        <div className="overflow-x-auto">
                           <table className="w-full text-sm text-left">
                              <thead className="text-xs text-slate-500 uppercase tracking-wider bg-slate-50 border-b">
                                 <tr>
                                    {/* Dynamic columns based on first row */}
                                    {Object.keys(suggestions[0] || {}).map((col) => (
                                       <th key={col} className="py-3 px-4 font-semibold">{col}</th>
                                    ))}
                                    <th className="py-3 px-4 text-right">Action</th>
                                 </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                 {currentRows.map((row, rowIndex) => (
                                    <tr key={rowIndex} className="hover:bg-indigo-50/50 transition-colors group">
                                       {Object.keys(row).map((col) => (
                                          <td key={col} className="py-3 px-4 text-slate-700 align-top">
                                             {col === 'Confidence' ? (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                                   {String(row[col] ?? "—")}
                                                </span>
                                             ) : (
                                                String(row[col] ?? "—")
                                             )}
                                          </td>
                                       ))}
                                       <td className="py-3 px-4 text-right align-top">
                                          <button
                                             onClick={(e) => {
                                                e.stopPropagation();
                                                handleSelectSuggestion(row);
                                             }}
                                             className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition shadow-sm"
                                          >
                                             Select
                                          </button>
                                       </td>
                                    </tr>
                                 ))}
                              </tbody>
                           </table>
                        </div>
                     )}
                  </div>

                  {/* Pagination */}
                  {suggestions.length > 0 && (
                     <div className="flex justify-between items-center p-4 border-t bg-slate-50">
                        <button
                           disabled={currentPage === 1}
                           onClick={() => setCurrentPage((prev) => prev - 1)}
                           className="px-3 py-1.5 rounded-lg text-sm border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-slate-600 font-medium"
                        >
                           Previous
                        </button>

                        <span className="text-sm text-slate-500 font-medium">
                           Page {currentPage} of {totalPages}
                        </span>

                        <button
                           disabled={currentPage === totalPages}
                           onClick={() => setCurrentPage((prev) => prev + 1)}
                           className="px-3 py-1.5 rounded-lg text-sm border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-slate-600 font-medium"
                        >
                           Next
                        </button>
                     </div>
                  )}
               </div>
            </div>
         )}
      </div>
   );
};

export default HSNMapping;