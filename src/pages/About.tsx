import React from 'react';

const About: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm">
        <h1 className="text-3xl font-bold text-slate-900 mb-6">About the HSN Code Guidebook</h1>
        
        <div className="prose prose-slate max-w-none">
          <p className="text-lg text-slate-600 leading-relaxed">
            The <strong>Guidebook on Mapping of Harmonized System of Nomenclature (HSN) Codes</strong> is a strategic initiative by the 
            <strong> Department for Promotion of Industry and Internal Trade (DPIIT)</strong>, Ministry of Commerce & Industry, Government of India.
          </p>

          <div className="my-8 grid md:grid-cols-3 gap-6">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <h3 className="font-bold text-blue-800 mb-2">12,000+ Codes</h3>
              <p className="text-sm text-blue-600">Comprehensive mapping of HS codes at the 8-digit level.</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
              <h3 className="font-bold text-purple-800 mb-2">31 Ministries</h3>
              <p className="text-sm text-purple-600">Clear allocation of product ownership across government bodies.</p>
            </div>
            <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100">
              <h3 className="font-bold text-emerald-800 mb-2">Viksit Bharat</h3>
              <p className="text-sm text-emerald-600">Supporting the vision of a developed India by 2047.</p>
            </div>
          </div>

          <h3 className="text-xl font-bold text-slate-800 mt-8 mb-4">Key Objectives</h3>
          <ul className="list-disc pl-5 space-y-2 text-slate-700">
            <li><strong>Domestic Ecosystem:</strong> Facilitate Ministries in developing robust ecosystems for products in their domain.</li>
            <li><strong>Targeted Policy:</strong> Support formulation of policies responsive to ground-level industry needs.</li>
            <li><strong>Trade Negotiations:</strong> Enhance technical expertise for better trade agreements.</li>
            <li><strong>Industry Facilitation:</strong> Enable stakeholders to easily identify the correct Ministry for support.</li>
          </ul>

          <div className="mt-8 p-6 bg-slate-50 rounded-xl border border-slate-200">
             <h3 className="text-lg font-bold text-slate-800 mb-2">Methodology</h3>
             <p className="text-sm text-slate-600">
               The mapping involved rigorous analysis of the Allocation of Business Rules (1961), 
               CBIC Tariff Manual, and extensive Inter-Ministerial consultations. 
               Out of 12,167 HS Codes, 11,651 have been successfully mapped and accepted by relevant departments.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
