import { ChevronLeft, ChevronRight } from 'lucide-react';

export const Pagination = ({ 
  currentPage, 
  lastPage, 
  perPage, 
  total, 
  from, 
  to, 
  onPageChange, 
  onPerPageChange 
}) => {
  const perPageOptions = [10, 50, 100, 1000];

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < lastPage) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePageClick = (page) => {
    onPageChange(page);
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    
    if (lastPage <= maxPagesToShow) {
      // Show all pages if total pages is less than or equal to maxPagesToShow
      for (let i = 1; i <= lastPage; i++) {
        pages.push(i);
      }
    } else {
      // Show first page
      pages.push(1);
      
      // Calculate range around current page
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(lastPage - 1, currentPage + 1);
      
      // Adjust if we're near the start
      if (currentPage <= 3) {
        end = 4;
      }
      
      // Adjust if we're near the end
      if (currentPage >= lastPage - 2) {
        start = lastPage - 3;
      }
      
      // Add ellipsis after first page if needed
      if (start > 2) {
        pages.push('...');
      }
      
      // Add middle pages
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      // Add ellipsis before last page if needed
      if (end < lastPage - 1) {
        pages.push('...');
      }
      
      // Show last page
      pages.push(lastPage);
    }
    
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
      {/* Info */}
      <div className="text-sm text-gray-700">
        Menampilkan <span className="font-medium">{from || 0}</span> sampai{' '}
        <span className="font-medium">{to || 0}</span> dari{' '}
        <span className="font-medium">{total || 0}</span> data
      </div>

      {/* Per Page Selector */}
      <div className="flex items-center gap-2">
        <label className="text-sm text-gray-700">Data per halaman:</label>
        <select
          value={perPage}
          onChange={(e) => onPerPageChange(Number(e.target.value))}
          className="input-field py-1 px-2 text-sm"
        >
          {perPageOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      {/* Page Navigation */}
      <div className="flex items-center gap-1">
        <button
          onClick={handlePrevious}
          disabled={currentPage === 1}
          className={`p-2 rounded-lg border ${
            currentPage === 1
              ? 'border-gray-200 text-gray-400 cursor-not-allowed'
              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <ChevronLeft size={20} />
        </button>

        {getPageNumbers().map((page, index) => (
          page === '...' ? (
            <span key={`ellipsis-${index}`} className="px-3 py-2 text-gray-500">
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => handlePageClick(page)}
              className={`px-3 py-2 rounded-lg border ${
                currentPage === page
                  ? 'border-primary-500 bg-primary-50 text-primary-700 font-medium'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          )
        ))}

        <button
          onClick={handleNext}
          disabled={currentPage === lastPage}
          className={`p-2 rounded-lg border ${
            currentPage === lastPage
              ? 'border-gray-200 text-gray-400 cursor-not-allowed'
              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};
