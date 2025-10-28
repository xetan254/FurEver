import React, { useState, useEffect, useRef, useMemo } from 'react';
import axios from 'axios';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Giao diện snow


// --- COMPONENT FORM MODAL (PHIÊN BẢN NÂNG CẤP) ---
const ArticleFormModal = ({ article, onSave, onClose }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('news');
    const [imageFile, setImageFile] = useState(null);
    const quillRef = useRef(null);

    useEffect(() => {
        if (article) {
            setTitle(article.title || '');
            setContent(article.content || '');
            setCategory(article.category || 'news');
            setImageFile(null); // Reset file khi mở modal
        } else {
            // Reset state cho bài viết mới
            setTitle(''); 
            setContent(''); 
            setCategory('news'); 
            setImageFile(null);
        }
    }, [article]);
    
    // CẢI TIẾN: Sử dụng useMemo để không phải tạo lại object modules mỗi lần render
    const modules = useMemo(() => ({
        toolbar: {
            container: [
                [{ 'header': [1, 2, 3, 4, 5, 6, false] }], // Thêm lựa chọn header
                [{ 'font': [] }], // Thêm lựa chọn font
                [{ 'size': ['small', false, 'large', 'huge'] }],
                ['bold', 'italic', 'underline', 'strike'], // Thêm gạch chân, gạch ngang
                [{ 'color': [] }, { 'background': [] }], // Thêm màu chữ, màu nền
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                [{ 'script': 'sub'}, { 'script': 'super' }], // Thêm chữ nhỏ trên/dưới
                [{ 'indent': '-1'}, { 'indent': '+1' }], // Thêm thụt lề
                [{ 'direction': 'rtl' }], // Thêm hướng chữ
                [{ 'align': [] }],
                ['link', 'image', 'video'], // Thêm chèn link, video
                ['blockquote', 'code-block'], // Thêm trích dẫn, khối code
                ['clean']
            ],
            handlers: {
                'image': imageHandler // Gán hàm xử lý ảnh tùy chỉnh
            }
        },
        // CÓ THỂ THÊM CÁC MODULES KHÁC
        // clipboard: { matchVisual: false }, // Dán text không kèm định dạng
    }), []); // Mảng rỗng đảm bảo useMemo chỉ chạy một lần

    // Danh sách các format được phép, cần khớp với toolbar
    const formats = [
        'header', 'font', 'size',
        'bold', 'italic', 'underline', 'strike', 'blockquote', 'code-block',
        'color', 'background',
        'list', 'bullet', 'indent',
        'script', 'direction', 'align',
        'link', 'image', 'video'
    ];

    // CẢI TIẾN: Hàm xử lý upload ảnh với phản hồi cho người dùng
    function imageHandler() {
        if (!quillRef.current) return;
        
        const editor = quillRef.current.getEditor();
        const range = editor.getSelection(true);

        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();

        input.onchange = async () => {
            if (input.files != null && input.files[0] != null) {
                const file = input.files[0];
                const formData = new FormData();
                formData.append('image', file);

                // Tạm thời vô hiệu hóa editor để người dùng không thao tác khi đang tải lên
                editor.enable(false);

                try {
                    // CẢI TIẾN: Sử dụng biến môi trường cho URL backend
                    const backendUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
                    const { data: imageUrl } = await axios.post(`${backendUrl}/api/upload`, formData);
                    
                    // Chèn ảnh vào đúng vị trí con trỏ với URL đầy đủ
                    editor.insertEmbed(range.index, 'image', `${backendUrl}${imageUrl}`);
                    // Di chuyển con trỏ đến sau ảnh
                    editor.setSelection(range.index + 1);
                } catch (error) {
                    console.error('Lỗi khi tải ảnh lên:', error);
                    alert('Tải ảnh thất bại. Vui lòng thử lại.');
                } finally {
                    // Bật lại editor sau khi hoàn tất
                    editor.enable(true);
                }
            }
        };
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('title', title);
        formData.append('content', content);
        formData.append('category', category);
        if (imageFile) {
            formData.append('image', imageFile);
        } else if (article && article.image) {
            // Nếu không chọn ảnh mới khi edit, giữ lại ảnh cũ
            formData.append('existingImage', article.image);
        }
        onSave(formData);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content new-design">
                <h2>{article ? 'Chỉnh sửa bài viết' : 'Tạo tin tức mới'}</h2>
                <form onSubmit={handleSubmit} className="article-form">
                    <div className="form-group">
                        <label>Tiêu đề</label>
                        <input 
                            type="text" value={title} onChange={(e) => setTitle(e.target.value)} 
                            placeholder="Tiêu đề" maxLength="150" required 
                        />
                        <div className="char-counter">{title.length}/150</div>
                    </div>

                    <div className="form-group form-group-horizontal">
                        <label>Nội dung</label>
                        <ReactQuill 
                            ref={quillRef}
                            theme="snow" 
                            value={content} 
                            onChange={setContent}
                            modules={modules}
                            formats={formats}
                            className="rich-text-editor"
                            placeholder="Viết nội dung của bạn ở đây..."
                        />
                    </div>

                    <div className="form-group">
                        <label>Ảnh đại diện</label>
                        <input 
                            type="file" id="articleImageUpload" onChange={handleFileChange} 
                            accept="image/*" style={{display: 'none'}}
                        />
                        <label htmlFor="articleImageUpload" className="btn-add-image">
                            <span>Thêm hoặc thay đổi ảnh</span>
                        </label>
                        {imageFile && <span className="file-name-display">{imageFile.name}</span>}
                    </div>

                    <div className="modal-actions">
                        <button type="button" onClick={onClose} className="btn-cancel new-design">Hủy</button>
                        <button type="submit" className="btn-save new-design">Đăng tải</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ArticleFormModal; // Giả sử bạn export component này