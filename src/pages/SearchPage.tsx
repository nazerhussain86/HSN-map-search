import React, { useState, useMemo,useEffect } from 'react';
import { Search, Filter, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { HSN_DATA } from '../data';

const ITEMS_PER_PAGE = 10;

const SearchPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMinistry, setSelectedMinistry] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState(1);

  // const ministries = useMemo(() => {
  //   const unique = new Set(HSN_DATA.map(item => item.ministry));
  //   return ['All', ...Array.from(unique).sort()];
  // }, []);

  // const filteredData = useMemo(() => {
  //   return HSN_DATA.filter(item => {
  //     const matchesSearch = 
  //       item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //       item.hsCode.includes(searchQuery);
  //     const matchesMinistry = selectedMinistry === 'All' || item.ministry === selectedMinistry;
  //     return matchesSearch && matchesMinistry;
  //   });
  // }, [searchQuery, selectedMinistry]);
  
const normalize = (v: string) =>
  v
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/* ---------------- MINISTRY LIST ---------------- */
  const ministries = useMemo(() => {
    const map = new Map<string, string>();

    HSN_DATA.forEach(item => {
      if (!item.ministry) return;
      const norm = normalize(item.ministry);
      if (!map.has(norm)) map.set(norm, item.ministry.trim());
    });

    return ['All', ...Array.from(map.values()).sort()];
  }, []);

  /* ---------------- FILTER LOGIC ---------------- */
 const filteredData = useMemo(() => {
  const query = normalize(searchQuery);

  return HSN_DATA.filter(item => {
    const desc = normalize(item.description || '');
    const hsn = String(item.hsCode || '');
    const ministry = normalize(item.ministry || '');

    // 🔒 SEARCH FILTER
    if (query.length > 0) {
      // numeric → HSN only
      if (/^\d+$/.test(query)) {
        if (!hsn.startsWith(query)) return false;
      }
      // text → description only
      else {
        if (!desc.includes(query)) return false;
      }
    }

    // 🔒 MINISTRY FILTER
    if (selectedMinistry !== 'All') {
      if (ministry !== normalize(selectedMinistry)) return false;
    }

    return true;
  });
}, [searchQuery, selectedMinistry]);



  /* Reset page on filter change */
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedMinistry]);

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">HSN Code Directory</h1>
          <p className="text-slate-500">Search and filter through mapped HSN codes and Description.</p>
        </div>
        <button className="flex items-center px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
          <Download size={16} className="mr-2" />
          Export Data
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4 md:space-y-0 md:flex md:items-center md:space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search by HS Code or Description..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="w-full md:w-64 relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <select
            value={selectedMinistry}
            onChange={(e) => { setSelectedMinistry(e.target.value); setCurrentPage(1); }}
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
          >
            {ministries.map(m => (
              <option key={m} value={m}>{m === 'All' ? 'All Ministries' : m}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-700">HS Code</th>
                <th className="px-6 py-4 font-semibold text-slate-700">Chapter</th>
                <th className="px-6 py-4 font-semibold text-slate-700">Description</th>
                <th className="px-6 py-4 font-semibold text-slate-700">Ministry/Department</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {paginatedData.length > 0 ? (
                paginatedData.map((item) => (
                  <tr key={`${item.sno}-${item.hsCode}`} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-mono font-medium text-blue-600">{item.hsCode}</td>
                    <td className="px-6 py-4 text-slate-600">{item.chapter}</td>
                    <td className="px-6 py-4 text-slate-800 max-w-md">{item.description}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {item.ministry}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    No HSN codes found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Showing <span className="font-medium">{Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filteredData.length)}</span> to{' '}
            <span className="font-medium">{Math.min(currentPage * ITEMS_PER_PAGE, filteredData.length)}</span> of{' '}
            <span className="font-medium">{filteredData.length}</span> results
          </p>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
