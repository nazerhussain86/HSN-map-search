import React, { useState } from 'react';
import { Calculator, CalculatorIcon, Info, Loader2, RefreshCcw, TrendingUp, DollarSign, Truck, Building, Plane, Ship } from 'lucide-react';
import { getGeminiResponse } from '../services/geminiService';

interface CostBreakdown {
  productCost: number;
  shipping: number;
  insurance: number;
  cif: number;
  basicDuty: number;
  sws: number;
  igst: number;
  totalLandedCost: number;
}

const LandedCostCalculator: React.FC = () => {
  const [formData, setFormData] = useState({
    productName: '',
    value: '',
    hsCode: '',
    origin: '',
    destination: '',
    quantity: '1',
    weight: '',
    shippingMethod: ''
  });

  const [isSuggesting, setIsSuggesting] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [result, setResult] = useState<CostBreakdown | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSuggestHSCode = async () => {
    if (!formData.productName) {
      alert("Please enter a Product Name first.");
      return;
    }

    setIsSuggesting(true);
    try {
      const prompt = `You are a trade expert. Suggest the most likely 6-digit or 8-digit Harmonized System (HS) code for the product: "${formData.productName}". Return ONLY the code number, nothing else. No explanation.`;
      const response = await getGeminiResponse(prompt);
      // Clean up response to get just the code
      const code = response.replace(/[^0-9.]/g, '');
      setFormData(prev => ({ ...prev, hsCode: code }));
    } catch (error) {
      console.error("Error fetching HS Code:", error);
      alert("Could not suggest HS Code. Please try manually.");
    } finally {
      setIsSuggesting(false);
    }
  };

  const calculateCost = () => {
    setIsCalculating(true);
    
    // Simulate API delay
    setTimeout(() => {
      const val = parseFloat(formData.value) || 0;
      const qty = parseFloat(formData.quantity) || 1;
      const weight = parseFloat(formData.weight) || 1;
      const totalProductValue = val * qty;

      // Mock calculations logic
      // In a real app, these rates would come from an API based on HS Code + Origin + Destination
      const shippingRate = formData.shippingMethod === 'air' ? 5 : 1.5; // $ per kg
      const shippingCost = weight * shippingRate;
      
      const insuranceCost = totalProductValue * 0.01; // 1% insurance
      
      const cif = totalProductValue + shippingCost + insuranceCost;
      
      const dutyRate = 0.10; // 10% BCD
      const basicDuty = cif * dutyRate;
      
      const swsRate = 0.10; // 10% SWS on BCD
      const sws = basicDuty * swsRate;
      
      const igstRate = 0.18; // 18% IGST
      const igst = (cif + basicDuty + sws) * igstRate;
      
      const total = cif + basicDuty + sws + igst;

      setResult({
        productCost: totalProductValue,
        shipping: shippingCost,
        insurance: insuranceCost,
        cif: cif,
        basicDuty: basicDuty,
        sws: sws,
        igst: igst,
        totalLandedCost: total
      });
      
      setIsCalculating(false);
    }, 800);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-8rem)]">
      
      {/* Left Column: Form */}
      <div className="lg:col-span-7 flex flex-col">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-y-auto h-full">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-xl font-bold text-slate-900">Product Information</h2>
            <p className="text-sm text-slate-500 mt-1">Enter your product details to calculate the landed cost</p>
          </div>
          
          <div className="p-6 space-y-6">
            
            {/* Product Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="productName"
                value={formData.productName}
                onChange={handleInputChange}
                placeholder="e.g., Wireless Headphones"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            {/* Value */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Product Value (USD) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                <input
                  type="number"
                  name="value"
                  value={formData.value}
                  onChange={handleInputChange}
                  placeholder="e.g., 1000"
                  className="w-full pl-8 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>

            {/* HS Code */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                HS Code (Optional)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="hsCode"
                  value={formData.hsCode}
                  onChange={handleInputChange}
                  placeholder="e.g., 8518.30"
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
                <button 
                  onClick={handleSuggestHSCode}
                  disabled={isSuggesting || !formData.productName}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-medium rounded-lg border border-slate-200 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 whitespace-nowrap"
                >
                  {isSuggesting ? <Loader2 size={16} className="animate-spin" /> : <Calculator size={16} />}
                  Suggest
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Don't know your HS code? <button onClick={handleSuggestHSCode} className="text-blue-600 hover:underline">Get it classified</button>
              </p>
            </div>

            {/* Origin & Destination */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Origin Country <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="origin"
                  value={formData.origin}
                  onChange={handleInputChange}
                  placeholder="e.g., China"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Destination <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="destination"
                  value={formData.destination}
                  onChange={handleInputChange}
                  placeholder="e.g., United States"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>

            {/* Quantity & Weight */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  placeholder="e.g., 5"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>

            {/* Shipping Method */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Shipping Method
              </label>
              <div className="relative">
                <select
                  name="shippingMethod"
                  value={formData.shippingMethod}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none bg-white"
                >
                  <option value="">Select shipping method</option>
                  <option value="air">Air Freight</option>
                  <option value="ocean">Ocean Freight</option>
                  <option value="road">Road Transport</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>

            <button 
              onClick={calculateCost}
              disabled={isCalculating || !formData.value || !formData.weight}
              className="w-full py-3 bg-green-700 hover:bg-green-800 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed mt-4"
            >
              {isCalculating ? <Loader2 size={20} className="animate-spin" /> : <CalculatorIcon size={20} />}
              Calculate Landed Cost
            </button>
          </div>
        </div>
      </div>

      {/* Right Column: Result */}
      <div className="lg:col-span-5">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm h-full flex flex-col">
          {!result ? (
             <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
               <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 mb-4">
                 <CalculatorIcon size={32} />
               </div>
               <h3 className="text-lg font-medium text-slate-600 mb-2">Ready to Calculate</h3>
               <p className="text-slate-400 max-w-xs">
                 Enter product details on the left to calculate the estimated landed cost.
               </p>
             </div>
          ) : (
            <div className="flex flex-col h-full">
              <div className="p-6 bg-slate-50 border-b border-slate-100 rounded-t-xl">
                <h3 className="text-lg font-bold text-slate-800">Landed Cost Breakdown</h3>
                <p className="text-sm text-slate-500">Estimated total cost for {formData.quantity} unit(s)</p>
              </div>
              
              <div className="flex-1 p-6 overflow-y-auto space-y-6">
                {/* Main Cost */}
                <div className="text-center py-6 bg-blue-50 rounded-xl border border-blue-100">
                  <p className="text-sm font-medium text-blue-600 mb-1">Total Landed Cost</p>
                  <p className="text-4xl font-bold text-blue-900">${result.totalLandedCost.toFixed(2)}</p>
                  <p className="text-xs text-blue-400 mt-1">(${(result.totalLandedCost / parseInt(formData.quantity)).toFixed(2)} / unit)</p>
                </div>

                {/* Details List */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded border border-slate-200 text-slate-600"><DollarSign size={16}/></div>
                      <span className="text-sm font-medium text-slate-700">Product Value</span>
                    </div>
                    <span className="font-semibold text-slate-900">${result.productCost.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                     <div className="flex items-center gap-3">
                       <div className="p-2 bg-white rounded border border-slate-200 text-slate-600">
                         {formData.shippingMethod === 'air' ? <Plane size={16}/> : formData.shippingMethod === 'ocean' ? <Ship size={16}/> : <Truck size={16}/>}
                       </div>
                       <span className="text-sm font-medium text-slate-700">Shipping & Insurance</span>
                     </div>
                     <div className="text-right">
                       <span className="block font-semibold text-slate-900">${(result.shipping + result.insurance).toFixed(2)}</span>
                       <span className="text-xs text-slate-400">CIF Total: ${result.cif.toFixed(2)}</span>
                     </div>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded border border-slate-200 text-slate-600"><Building size={16}/></div>
                      <span className="text-sm font-medium text-slate-700">Customs Duties</span>
                    </div>
                    <div className="text-right">
                       <span className="block font-semibold text-slate-900">${(result.basicDuty + result.sws).toFixed(2)}</span>
                       <span className="text-xs text-slate-400">BCD + SWS</span>
                     </div>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded border border-slate-200 text-slate-600"><TrendingUp size={16}/></div>
                      <span className="text-sm font-medium text-slate-700">Taxes (IGST)</span>
                    </div>
                    <span className="font-semibold text-slate-900">${result.igst.toFixed(2)}</span>
                  </div>
                </div>

                <div className="p-4 bg-amber-50 rounded-lg border border-amber-100 text-xs text-amber-700 flex gap-2 items-start">
                   <Info size={16} className="shrink-0 mt-0.5" />
                   <p>This is an estimation based on general duty rates. Actual landed cost may vary based on specific FTA benefits, valuation rules, and exchange rates.</p>
                </div>
              </div>
              
              <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-xl">
                <button 
                  onClick={() => setResult(null)}
                  className="w-full py-2 bg-white border border-slate-300 text-slate-600 font-medium rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCcw size={16} />
                  Reset Calculation
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default LandedCostCalculator;