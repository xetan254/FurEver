import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {

    if (totalPages <= 1) {
        return null; // Không hiển thị nếu chỉ có 1 trang
    }

    return (
        <div className="pagination">
            {/* Nút Previous */}
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="page-item prev"
            >
                &lt;
            </button>

            {/* Các nút số trang */}
            {Array.from({ length: totalPages }, (_, i) => (
                <button
                    key={i + 1}
                    onClick={() => onPageChange(i + 1)}
                    className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}
                >
                    {i + 1}
                </button>
            ))}

            {/* Nút Next */}
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="page-item next"
            >
                &gt;
            </button>
        </div>
    );
};

export default Pagination;