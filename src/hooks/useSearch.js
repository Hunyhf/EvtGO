import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SEARCH_HISTORY_KEY = 'searchHistory';
const MAX_HISTORY = 5;

export const useSearch = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchHistory, setSearchHistory] = useState([]);
    const [showHistory, setShowHistory] = useState(false);
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
    const navigate = useNavigate();

    // Load history từ storage
    useEffect(() => {
        const history =
            JSON.parse(localStorage.getItem(SEARCH_HISTORY_KEY)) || [];
        setSearchHistory(history);
    }, []);

    const saveToHistory = term => {
        const trimmed = term.trim();
        if (!trimmed) return;

        const newHistory = [
            trimmed,
            ...searchHistory.filter(item => item !== trimmed)
        ].slice(0, MAX_HISTORY);

        setSearchHistory(newHistory);
        localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
    };

    const handleSearch = keyword => {
        // Nếu keyword là chuỗi (từ history), dùng nó. Nếu không (từ event), dùng searchTerm
        const finalTerm = typeof keyword === 'string' ? keyword : searchTerm;
        const trimmed = finalTerm.trim();

        saveToHistory(trimmed);

        // Chuyển hướng tới /genre kèm query parameter 'q'
        // Đồng nhất với route path: 'genre' trong index.jsx
        navigate(`/genre?q=${encodeURIComponent(trimmed)}`);

        setSearchTerm(trimmed);
        setShowHistory(false);
        setIsMobileSearchOpen(false);
    };

    const removeHistoryItem = (e, itemToRemove) => {
        e.stopPropagation();
        const newHistory = searchHistory.filter(item => item !== itemToRemove);
        setSearchHistory(newHistory);
        localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
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
