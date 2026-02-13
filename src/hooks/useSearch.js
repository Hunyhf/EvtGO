import { useState, useEffect } from 'react';

export const useSearch = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchHistory, setSearchHistory] = useState([]);
    const [showHistory, setShowHistory] = useState(false);
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

    // Load lịch sử từ localStorage khi mount
    useEffect(() => {
        const history = JSON.parse(localStorage.getItem('searchHistory')) || [];
        setSearchHistory(history);
    }, []);

    // Hàm xử lý khi người dùng nhấn tìm kiếm
    const handleSearch = keyword => {
        const term = typeof keyword === 'string' ? keyword : searchTerm;
        if (!term.trim()) return;

        const newHistory = [
            term,
            ...searchHistory.filter(item => item !== term)
        ].slice(0, 5);

        setSearchHistory(newHistory);
        localStorage.setItem('searchHistory', JSON.stringify(newHistory));

        // Thực hiện logic điều hướng hoặc gọi API tìm kiếm ở đây
        console.log('Đang tìm kiếm:', term);

        setSearchTerm(term);
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
