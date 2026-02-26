// src/utils/imageHelper.js

// Lấy Base URL từ biến môi trường
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export const getEventImageUrl = (eventId, fileName) => {
    if (!fileName) return 'https://placehold.co/400x600?text=No+Image';

    // Nếu fileName đã là một URL tuyệt đối (ví dụ link ảnh từ web khác)
    if (fileName.startsWith('http')) return fileName;

    // Cấu trúc chuẩn theo Backend: /storage/events/{eventId}/{fileName}
    return `${API_URL}/storage/events/${eventId}/${fileName}`;
};

export const getAvatarUrl = (userId, fileName) => {
    // Nếu không có ảnh, trả về ảnh mặc định của hệ thống
    if (!fileName) return 'https://static.ticketbox.vn/avatar.png';

    // Nếu fileName đã là một URL tuyệt đối (ví dụ ảnh từ Google Login)
    if (fileName.startsWith('http')) return fileName;

    // Cấu trúc chuẩn: /storage/avatars/{userId}/{fileName}
    // userId giúp phân loại ảnh theo từng người dùng riêng biệt
    return `${API_URL}/storage/avatars/${userId}/${fileName}`;
};
