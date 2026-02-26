// Lấy Base URL từ biến môi trường
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export const getEventImageUrl = (eventId, fileName) => {
    if (!fileName) return 'https://placehold.co/400x600?text=No+Image';

    if (fileName.startsWith('http')) return fileName;

    // Cấu trúc chuẩn theo Backend: /storage/events/{eventId}/{fileName}
    return `${API_URL}/storage/events/${eventId}/${fileName}`;
};

export const getAvatarUrl = fileName => {
    // Nếu không có ảnh, trả về ảnh mặc định của hệ thống
    if (!fileName) return 'https://static.ticketbox.vn/avatar.png';

    // Nếu fileName đã là một URL tuyệt đối
    if (fileName.startsWith('http')) return fileName;

    // Cấu trúc chuẩn theo Backend cho tài nguyên tĩnh (static resources)
    // Thường được cấu trúc là /storage/avatars/{fileName}
    return `${API_URL}/storage/avatars/${fileName}`;
};
