import React, { useState, useEffect, useContext, useRef, useMemo } from 'react';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './ManagementPage.css';
import searchIcon from '../../assets/img/search-icon.svg';

// Định nghĩa URL backend ở ngoài để dùng chung
const BACKEND_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// ========================================================================
// ===                     COMPONENT MODAL TẠO/SỬA BÀI VIẾT             ===
// ========================================================================
const ArticleFormModal = ({ article, onSave, onClose }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const quillRef = useRef(null);

    useEffect(() => {
        if (article) {
            setTitle(article.title || '');
            setContent(article.content || '');
            if (article.image) {
                setImagePreview(`${BACKEND_URL}/images/${article.image}`);
            } else {
                setImagePreview('');
            }
            setImageFile(null);
        } else {
            setTitle('');
            setContent('');
            setImageFile(null);
            setImagePreview('');
        }
    }, [article]);

    useEffect(() => {
        return () => {
            if (imagePreview && imagePreview.startsWith('blob:')) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [imagePreview]);

    const handleCoverImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const dataToSubmit = new FormData();
        dataToSubmit.append('title', title);
        dataToSubmit.append('content', content);
        dataToSubmit.append('category', 'news');
        if (imageFile) {
            dataToSubmit.append('image', imageFile);
        }
        onSave(dataToSubmit);
    };

    const quillImageHandler = () => {
        if (!quillRef.current) return;
        const editor = quillRef.current.getEditor();
        const range = editor.getSelection(true);
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();
        input.onchange = async () => {
            const file = input.files[0];
            if (file) {
                const formData = new FormData();
                formData.append('image', file);
                editor.enable(false);
                try {
                    const { data: imageUrl } = await axios.post(`${BACKEND_URL}/api/upload`, formData);
                    editor.insertEmbed(range.index, 'image', `${BACKEND_URL}${imageUrl}`);
                    editor.setSelection(range.index + 1);
                } catch (error) {
                    console.error('Lỗi khi tải ảnh lên editor:', error);
                } finally {
                    editor.enable(true);
                }
            }
        };
    };

    const modules = useMemo(() => ({
        toolbar: {
            container: [
                [{ 'header': [1, 2, 3, false] }],
                ['bold', 'italic', 'underline'],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                ['link', 'image'],
                ['clean']
            ],
            handlers: { 'image': quillImageHandler }
        },
    }), []);

    return (
        <div className="modal-overlay">
            <div className="modal-content new-design">
                <h2>{article ? 'Chỉnh sửa bài viết' : 'Tạo tin tức mới'}</h2>
                <form onSubmit={handleSubmit} className="article-form">
                    <div className="form-group"><label>Tiêu đề</label><input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required /></div>
                    <div className="form-group full-width"><label>Nội dung</label><ReactQuill ref={quillRef} theme="snow" value={content} onChange={setContent} modules={modules} /></div>
                    <div className="form-group"><label>Ảnh đại diện</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                            {imagePreview && <div className="image-preview-wrapper"><img src={imagePreview} alt="Xem trước" className="image-preview" /></div>}
                            <div>
                                <input type="file" id="articleImageUpload" onChange={handleCoverImageChange} accept="image/*" style={{display: 'none'}} />
                                <label htmlFor="articleImageUpload" className="btn-add-image"><span>Thêm hoặc thay đổi ảnh</span></label>
                                {imageFile && <span className="file-name-display">{imageFile.name}</span>}
                            </div>
                        </div>
                    </div>
                    <div className="modal-actions"><button type="button" onClick={onClose} className="btn-cancel new-design">Hủy</button><button type="submit" className="btn-save new-design">Đăng tải</button></div>
                </form>
            </div>
        </div>
    );
};


// ========================================================================
// ===                   COMPONENT CHÍNH CỦA TRANG QUẢN LÝ              ===
// ========================================================================
const ArticleManagementPage = () => {
    // State
    const [articles, setArticles] = useState([]);
    const [displayArticles, setDisplayArticles] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentArticle, setCurrentArticle] = useState(null);
    const [searchInput, setSearchInput] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const { userInfo } = useContext(AuthContext);

    // Hàm tương tác API
    const fetchArticles = async () => {
        try {
            const { data } = await axios.get(`${BACKEND_URL}/api/articles`);
            setArticles(data);
        } catch (error) {
            console.error("Lỗi khi tải bài viết:", error);
        }
    };

    const handleSaveArticle = async (formData) => {
        try {
            const config = { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${userInfo.token}` } };
            if (currentArticle) {
                await axios.put(`${BACKEND_URL}/api/articles/${currentArticle._id}`, formData, config);
            } else {
                await axios.post(`${BACKEND_URL}/api/articles`, formData, config);
            }
            fetchArticles();
            handleCloseModal();
        } catch (error) {
            console.error("Lỗi khi lưu bài viết:", error);
        }
    };
    
    const handleDeleteArticle = async (articleId) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa bài viết này?')) {
            try {
                const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
                await axios.delete(`${BACKEND_URL}/api/articles/${articleId}`, config);
                fetchArticles();
            } catch (error) {
                console.error("Lỗi khi xóa bài viết:", error);
            }
        }
    };

    // Effects
    useEffect(() => {
        fetchArticles();
    }, []);

    useEffect(() => {
        let results = [...articles];
        if (searchTerm) {
            const lowercasedTerm = searchTerm.toLowerCase();
            results = results.filter(article =>
                article.title.toLowerCase().includes(lowercasedTerm)
            );
        }
        setDisplayArticles(results);
    }, [searchTerm, articles]);

    // Handlers cho UI
    const handleOpenModal = (article = null) => {
        setCurrentArticle(article);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentArticle(null);
    };

    const handleSearch = () => {
        setSearchTerm(searchInput);
    };

    const handleReset = () => {
        setSearchInput('');
        setSearchTerm('');
    };

    // Hàm tiện ích
    const truncateText = (text, length) => {
        if (!text) return '';
        const plainText = text.replace(/<[^>]+>/g, '');
        return plainText.length > length ? plainText.substring(0, length) + '...' : plainText;
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <div className="page-header-group">
                    <div className="search-bar">
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tiêu đề..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
                        />
                        <button className="search-btn" onClick={handleSearch}>
                            <img src={searchIcon} alt="Search" />
                        </button>
                    </div>
                </div>
                <div className="page-actions">
                    <button className="action-btn-secondary" onClick={handleReset}>Làm mới</button>
                    <button className="action-btn-primary" onClick={() => handleOpenModal()}>+ Thêm bài viết mới</button>
                </div>
            </div>

            <div className="article-list">
                {displayArticles.map((article) => (
                    <div className="article-card" key={article._id}>
                        <img
                            src={article.image ? `${BACKEND_URL}/images/${article.image}` : '/images/default-article.jpg'}
                            alt={article.title}
                            className="article-card-image"
                        />
                        <div className="article-card-info">
                            <h4>{truncateText(article.title, 50)}</h4>
                            <p>{truncateText(article.content, 120)}</p>
                        </div>
                        <div className="article-card-actions">
                            <button onClick={() => handleOpenModal(article)} title="Chỉnh sửa">✏️</button>
                            <button onClick={() => handleDeleteArticle(article._id)} title="Xóa">🗑️</button>
                        </div>
                    </div>
                ))}
            </div>
            
            {isModalOpen && <ArticleFormModal article={currentArticle} onSave={handleSaveArticle} onClose={handleCloseModal} />}
        </div>
    );
};

export default ArticleManagementPage;