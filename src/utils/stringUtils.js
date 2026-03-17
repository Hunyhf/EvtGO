/**
 * Chuyển đổi chuỗi tiếng Việt có dấu thành slug không dấu, ngăn cách bởi dấu gạch ngang
 * @param {string} str - Chuỗi cần chuyển đổi
 * @returns {string} - Chuỗi slug đã xử lý
 */
export const slugify = str => {
    if (!str) return '';
    return str
        .normalize('NFD') // Chuyển về dạng tổ hợp
        .replace(/[\u0300-\u036f]/g, '') // Xóa các dấu phụ
        .replace(/đ/g, 'd') // Xử lý chữ đ
        .replace(/Đ/g, 'D') // Xử lý chữ Đ
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-') // Thay khoảng trắng bằng dấu -
        .replace(/[^\w-]+/g, '') // Loại bỏ các ký tự đặc biệt khác
        .replace(/-+/g, '-'); // Tránh các dấu gạch ngang liên tiếp
};
