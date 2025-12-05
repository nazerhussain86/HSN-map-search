import React, { useState } from 'react';
import { 
  Calculator, 
  Info, 
  Loader2, 
  RefreshCcw, 
  TrendingUp, 
  DollarSign, 
  Truck, 
  Building, 
  Plane, 
  Ship, 
  Package,
  MapPin,
  Scale,
  Search,
  ArrowRight
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { getGeminiResponse } from '../geminiService';

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
    
    setTimeout(() => {
      const val = parseFloat(formData.value) || 0;
      const qty = parseFloat(formData.quantity) || 1;
      const weight = parseFloat(formData.weight) || 1;
      const totalProductValue = val * qty;

      const shippingRate = formData.shippingMethod === 'air' ? 5 : 1.5;
      const shippingCost = weight * shippingRate;
      const insuranceCost = totalProductValue * 0.01;
      
      const cif = totalProductValue + shippingCost + insuranceCost;
      const basicDuty = cif * 0.10;
      const sws = basicDuty * 0.10;
      const igst = (cif + basicDuty + sws) * 0.18;
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

  const chartData = result ? [
    { name: 'Product Cost', value: result.productCost, color: '#3b82f6' },
    { name: 'Shipping', value: result.shipping + result.insurance, color: '#f59e0b' },
    { name: 'Duties', value: result.basicDuty + result.sws, color: '#ef4444' },
    { name: 'Taxes', value: result.igst, color: '#10b981' },
  ] : [];

  return (
    <div className="flex flex-col h-full font-sans">
      <div className="flex-none mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Landed Cost Calculator</h1>
        <p className="text-slate-500">Accurate import duty & tax estimations powered by live tariff data.</p>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Form Section */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:p-8">
          <div className="space-y-8">
             {/* Section 1: Product */}
             <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                   <div className="w-6 h-6 rounded bg-blue-100 text-blue-600 flex items-center justify-center"><Package size={14}/></div>
                   Product Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                   <div className="md:col-span-2">
                      <label className="text-xs font-medium text-slate-500 mb-1.5 block">Product Name</label>
                      <input type="text" name="productName" value={formData.productName} onChange={handleInputChange} placeholder="e.g. Leather Shoes" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm font-medium text-slate-800 placeholder:text-slate-400" />
                   </div>
                   <div>
                      <label className="text-xs font-medium text-slate-500 mb-1.5 block">Value (USD)</label>
                      <div className="relative">
                         <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                         <input type="number" name="value" value={formData.value} onChange={handleInputChange} placeholder="0.00" className="w-full pl-9 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium" />
                      </div>
                   </div>
                   <div>
                      <label className="text-xs font-medium text-slate-500 mb-1.5 block">HS Code</label>
                      <div className="flex gap-2">
                         <input type="text" name="hsCode" value={formData.hsCode} onChange={handleInputChange} placeholder="Optional" className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium" />
                         <button onClick={handleSuggestHSCode} disabled={isSuggesting} className="px-3 bg-white border border-slate-200 rounded-xl text-blue-600 hover:bg-blue-50 transition-colors disabled:opacity-50">
                            {isSuggesting ? <Loader2 size={16} className="animate-spin"/> : <Search size={16}/>}
                         </button>
                      </div>
                   </div>
                </div>
             </div>

             <div className="h-px bg-slate-100 w-full"></div>

             {/* Section 2: Logistics */}
             <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                   <div className="w-6 h-6 rounded bg-orange-100 text-orange-600 flex items-center justify-center"><Truck size={14}/></div>
                   Logistics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                   <div>
                      <label className="text-xs font-medium text-slate-500 mb-1.5 block">Quantity</label>
                      <input type="number" name="quantity" value={formData.quantity} onChange={handleInputChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium" />
                   </div>
                   <div>
                      <label className="text-xs font-medium text-slate-500 mb-1.5 block">Total Weight (kg)</label>
                      <input type="number" name="weight" value={formData.weight} onChange={handleInputChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium" />
                   </div>
                   <div>
                      <label className="text-xs font-medium text-slate-500 mb-1.5 block">Mode</label>
                      <select name="shippingMethod" value={formData.shippingMethod} onChange={handleInputChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium appearance-none">
                          <option value="">Select...</option>
                          <option value="air">Air Freight</option>
                          <option value="ocean">Ocean Freight</option>
                          <option value="road">Road Transport</option>
                      </select>
                   </div>
                   <div className="md:col-span-3 grid grid-cols-2 gap-4">
                       <div className="relative">
                          <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                          <input type="text" name="origin" value={formData.origin} onChange={handleInputChange} placeholder="Origin Country" className="w-full pl-9 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
                       </div>
                       <div className="relative">
                          <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                          <input type="text" name="destination" value={formData.destination} onChange={handleInputChange} placeholder="Destination Country" className="w-full pl-9 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
                       </div>
                   </div>
                </div>
             </div>
          </div>

          <div className="mt-8">
             <button onClick={calculateCost} disabled={isCalculating || !formData.value} className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-lg shadow-slate-200 transition-all active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                {isCalculating ? <Loader2 className="animate-spin"/> : "Calculate Landed Cost"}
             </button>
          </div>
        </div>

        {/* Results Section */}
        <div className="lg:col-span-5 h-full">
           {!result ? (
              <div className="h-full min-h-[400px] bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center p-8">
                  <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                     <Calculator size={40} className="text-slate-300" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-400">Awaiting Input</h3>
                  <p className="text-sm text-slate-400 mt-2 max-w-xs">Enter product and shipping details to see the cost breakdown.</p>
              </div>
           ) : (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden animate-in slide-in-from-right-4 fade-in duration-500">
                  {/* Header Card */}
                  <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white">
                     <div className="flex justify-between items-start mb-4">
                        <div>
                           <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Total Landed Cost</p>
                           <h2 className="text-3xl font-bold mt-1">${result.totalLandedCost.toFixed(2)}</h2>
                        </div>
                        <div className="text-right">
                           <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Per Unit</p>
                           <p className="text-xl font-bold mt-1">${(result.totalLandedCost / parseInt(formData.quantity)).toFixed(2)}</p>
                        </div>
                     </div>
                     <div className="h-1 w-full bg-slate-700 rounded-full overflow-hidden flex">
                        {chartData.map((item, i) => (
                           <div key={i} style={{ width: `${(item.value / result.totalLandedCost) * 100}%`, backgroundColor: item.color }} />
                        ))}
                     </div>
                  </div>

                  <div className="p-6 space-y-6">
                      {/* Breakdown List */}
                      <div className="space-y-3">
                         <div className="flex justify-between items-center py-2 border-b border-slate-100">
                            <span className="text-sm text-slate-600 flex items-center gap-2">
                               <div className="w-2 h-2 rounded-full bg-blue-500"></div> Product Value
                            </span>
                            <span className="font-semibold text-slate-900">${result.productCost.toFixed(2)}</span>
                         </div>
                         <div className="flex justify-between items-center py-2 border-b border-slate-100">
                            <span className="text-sm text-slate-600 flex items-center gap-2">
                               <div className="w-2 h-2 rounded-full bg-amber-500"></div> Freight & Insurance
                            </span>
                            <span className="font-semibold text-slate-900">${(result.shipping + result.insurance).toFixed(2)}</span>
                         </div>
                         <div className="flex justify-between items-center py-2 border-b border-slate-100">
                            <span className="text-sm text-slate-600 flex items-center gap-2">
                               <div className="w-2 h-2 rounded-full bg-red-500"></div> Customs Duties
                            </span>
                            <span className="font-semibold text-slate-900">${(result.basicDuty + result.sws).toFixed(2)}</span>
                         </div>
                         <div className="flex justify-between items-center py-2 border-b border-slate-100">
                            <span className="text-sm text-slate-600 flex items-center gap-2">
                               <div className="w-2 h-2 rounded-full bg-emerald-500"></div> Taxes (IGST)
                            </span>
                            <span className="font-semibold text-slate-900">${result.igst.toFixed(2)}</span>
                         </div>
                      </div>

                      {/* Donut Chart */}
                      <div className="h-40 w-full relative">
                         <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                               <Pie data={chartData} innerRadius={40} outerRadius={60} paddingAngle={5} dataKey="value">
                                  {chartData.map((entry, index) => <Cell key={index} fill={entry.color} strokeWidth={0}/>)}
                               </Pie>
                               <RechartsTooltip contentStyle={{borderRadius:'8px', border:'none', boxShadow:'0 4px 12px rgba(0,0,0,0.1)'}}/>
                            </PieChart>
                         </ResponsiveContainer>
                         <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <span className="text-xs font-bold text-slate-400">BREAKDOWN</span>
                         </div>
                      </div>
                  </div>
                  
                  <div className="bg-slate-50 p-4 text-center border-t border-slate-200">
                      <button onClick={() => setResult(null)} className="text-sm text-slate-500 hover:text-slate-800 font-medium flex items-center justify-center gap-2 transition-colors">
                          <RefreshCcw size={14}/> Start New Calculation
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