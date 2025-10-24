import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Pagination from '../../components/Pagination';

// Import icon nếu cần, ví dụ:
import searchIcon from '../../assets/img/search-icon.svg';

const NewsPage = () => {
    // Toàn bộ phần state và logic (useEffect, handleSearch,...) giữ nguyên
    const [allArticles, setAllArticles] = useState([]);
    const [filteredArticles, setFilteredArticles] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        const fetchAllArticles = async () => {
            try {
                const { data } = await axios.get('http://localhost:5000/api/articles');
                if (Array.isArray(data)) {
                    setAllArticles(data);
                    setFilteredArticles(data);
                }
            } catch (err) {
                setError('Không thể tải danh sách bài viết.');
            } finally {
                setLoading(false);
            }
        };
        fetchAllArticles();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        const term = searchTerm.toLowerCase();
        const results = allArticles.filter(article =>
            article.title.toLowerCase().includes(term) ||
            article.content.toLowerCase().includes(term)
        );
        setFilteredArticles(results);
        setCurrentPage(1);
    };
    
    // Logic phân trang và format ngày tháng giữ nguyên
    const articlesPerPage = 9;
    const indexOfLastArticle = currentPage * articlesPerPage;
    const indexOfFirstArticle = indexOfLastArticle - articlesPerPage;
    const currentArticles = filteredArticles.slice(indexOfFirstArticle, indexOfLastArticle);
    const totalPages = Math.ceil(filteredArticles.length / articlesPerPage);
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
        return new Date(dateString).toLocaleDateString('vi-VN', options);
    };

    if (loading) return <div className="loading-message">Đang tải...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        // 1. Thay đổi thẻ div ngoài cùng thành main và class "news-page"
        <main className="news-page">
            {/* 2. Thêm section breadcrumb và intro giống hệt AdoptionPage */}
            <section className="breadcrumb">
                <div className="content">
                    <p className="paragraph-p3"><Link to="/">Trang chủ</Link></p>
                    <p className="paragraph-p3">&gt;</p>
                    <p className="paragraph-p3">Tin tức</p>
                </div>
            </section>
            
            <section className="intro">
                <div className="content">
                    <h1 className="heading-h54">Tin tức</h1>
                    <p className="paragraph-p3">Cập nhật những tin tức, sự kiện và câu chuyện mới nhất</p>
                </div>
            </section>

            {/* 3. Bọc form tìm kiếm trong div "search-container-filter" */}
             <div className="search-container-filter">
                           <form onSubmit={handleSearch} className="search-container">
                               <div className="search-box">
                                   <input
                                       type="text"
                                       placeholder="Tìm kiếm tiêu đề"
                                       className="paragraph-p3"
                                       value={searchTerm}
                                       onChange={(e) => setSearchTerm(e.target.value)}
                                   />
                                   <button type="submit" className="search-icon">
                                       <img src={searchIcon} alt="Search" />
                                   </button>
                               </div>
                           </form>
                           <div onClick={() => setShowFilters(!showFilters)} className="filter-icon" style={{ cursor: 'pointer' }}>
                               
                           </div>
                       </div>
                       <div className="content">
                <div className={`filter-form ${!showFilters ? 'hidden' : ''}`}>
                    {/* Form bộ lọc sẽ được thêm logic sau */}
                </div>
             </div>

            {/* 4. Bọc danh sách tin tức trong cấu trúc div "content" và "news-container" */}
            <div className="content">
                <div className="news-container"> {/* Tương tự pet-container */}
                    <div className="news-cards"> {/* Tương tự pet-cards */}
                        {currentArticles.length > 0 ? (
                            currentArticles.map(article => (
                                <Link to={`/news-detail/${article._id}`} key={article._id} className="news-card">
                                    <img
                                        src={`http://localhost:5000/images/${article.image}`}
                                        alt={article.title}
                                    />
                                    <div className="news-date">
                                        {formatDate(article.createdAt)}
                                    </div>
                                    <div className="news-card__info">
                                        <h2 className="newscard-heading">{article.title}</h2>
                                        <p className="news-summary">
                                            {article.content.replace(/<[^>]+>/g, '').substring(0, 120)}...
                                        </p>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <p>Không tìm thấy bài viết nào phù hợp.</p>
                        )}
                    </div>
                </div>
            </div>

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />
        </main>
    );
};

export default NewsPage;