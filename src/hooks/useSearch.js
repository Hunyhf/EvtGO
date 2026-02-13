import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const useSearch = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchHistory, setSearchHistory] = useState([]);
    const [showHistory, setShowHistory] = useState(false);
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

    // Khởi tạo hàm chuyển hướng
    const navigate = useNavigate();

    // Load lịch sử từ localStorage khi mount
    useEffect(() => {
        const history = JSON.parse(localStorage.getItem('searchHistory')) || [];
        setSearchHistory(history);
    }, []);

    // Hàm xử lý khi người dùng nhấn tìm kiếm
    const handleSearch = keyword => {
        // Kiểm tra xem tham số truyền vào có phải là chuỗi không (tránh trường hợp nhận event click/keydown)
        const term = typeof keyword === 'string' ? keyword : searchTerm;
        const trimmedTerm = term.trim();

        // Chỉ lưu vào lịch sử nếu người dùng CÓ nhập nội dung
        if (trimmedTerm) {
            const newHistory = [
                trimmedTerm,
                ...searchHistory.filter(item => item !== trimmedTerm)
            ].slice(0, 5);

            setSearchHistory(newHistory);
            localStorage.setItem('searchHistory', JSON.stringify(newHistory));
        }

        // Thực hiện điều hướng sang trang Category
        // Dù trimmedTerm có rỗng ('') thì nó vẫn sẽ chuyển hướng sang /category?q=
        navigate(`/category?q=${encodeURIComponent(trimmedTerm)}`);

        // Cập nhật lại các state giao diện
        setSearchTerm(term); // Vẫn giữ lại những gì đang hiển thị trên thanh input
        setShowHistory(false);
        setIsMobileSearchOpen(false);
    };

    // Hàm xóa một mục trong lịch sử
    const removeHistoryItem = (e, itemToRemove) => {
        e.stopPropagation();
        const newHistory = searchHistory.filter(item => item !== itemToRemove);
        setSearchHistory(newHistory);
        localStorage.setItem('searchHistory', JSON.stringify(newHistory));
    };

    return {
        searchTerm,
        setSearchTerm,
        searchHistory,
        showHistory,
        setShowHistory,
        isMobileSearchOpen,
        setIsMobileSearchOpen,
        handleSearch,
        removeHistoryItem
    };
};
