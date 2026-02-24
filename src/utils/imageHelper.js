// Lấy Base URL từ biến môi trường
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

/**
 * Hàm tạo đường dẫn ảnh sự kiện chuẩn
 * @param {string|number} eventId - ID của sự kiện
 * @param {string} fileName - Tên file ảnh lấy từ database
 * @returns {string} - Đường dẫn URL đầy đủ
 */
export const getEventImageUrl = (eventId, fileName) => {
    if (!fileName) return 'https://placehold.co/400x600?text=No+Image';

    // Nếu fileName đã là một URL tuyệt đối (ví dụ link ảnh từ web khác)
    if (fileName.startsWith('http')) return fileName;

    // Cấu trúc chuẩn theo Backend: /storage/events/{eventId}/{fileName}
    return `${API_URL}/storage/events/${eventId}/${fileName}`;
};
