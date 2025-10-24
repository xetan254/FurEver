import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';

const NewsDetailPage = () => {
    const { id } = useParams(); // Lấy ID bài viết từ URL
    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    useEffect(() => {
    const fetchArticle = async () => {
        // Log để kiểm tra ID có được lấy đúng từ URL không
        console.log('Đang fetch bài viết với ID:', id); 
        
        try {
            const response = await axios.get(`http://localhost:5000/api/articles/${id}`);
            
            // Log để xem dữ liệu trả về từ server
            console.log('Dữ liệu nhận được từ API:', response.data); 
            
            setArticle(response.data);
        } catch (err) {
            // Log để xem chi tiết lỗi nếu có
            console.error("Lỗi khi fetch API:", err); 
            
            setError('Không thể tải bài viết.');
        } finally {
            setLoading(false);
        }
    };

    if (id) {
        fetchArticle();
    }
}, [id]);
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
        return new Date(dateString).toLocaleDateString('vi-VN', options);
    };

    if (loading) return <div>Đang tải...</div>;
    if (error) return <div>{error}</div>;
    if (!article) return <div>Không tìm thấy bài viết.</div>;

    return (
        <main className="news-detail-page">
            <section className="breadcrumb">
                <div className="content">
                    <p className="paragraph-p3"><Link to="/">Trang chủ</Link></p>
                    <p className="paragraph-p3">&gt;</p>
                    <p className="paragraph-p3"><Link to="/news">Tin tức</Link></p>
                    <p className="paragraph-p3">&gt;</p>
                    <p className="paragraph-p3">{article.title}</p>
                </div>
            </section>
            
            <article className="article">
                <div className="content">
                    <div className="article-header">
                        <p className="article-date paragraph-p4">{formatDate(article.createdAt)}</p>
                        <h1 className="article-title heading-h32">{article.title}</h1>
                    </div>

                    <section className="article-content">
                        {/* Dùng dangerouslySetInnerHTML để render nội dung HTML từ database */}
                        <div dangerouslySetInnerHTML={{ __html: article.content }} />
                    </section>
                    
                </div>
            </article>
        </main>
    );
};

export default NewsDetailPage;