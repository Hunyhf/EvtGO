// src/apis/eventApi.js
import axios from './axiosClient';

// --- 1. Các hàm cơ bản ---
const create = data => axios.post('/api/v1/events', data);
const update = (id, data) => axios.put(`/api/v1/events/${id}`, data);
const getById = id => axios.get(`/api/v1/events/${id}`);
const remove = id => axios.delete(`/api/v1/events/${id}`);
const getAll = params => axios.get('/api/v1/events', { params });
const toggleActive = id => axios.patch(`/api/v1/events/${id}/active`);
const togglePublished = id => axios.patch(`/api/v1/events/${id}/published`);
const approve = id => togglePublished(id);
const reject = id => toggleActive(id);

// --- 2. API lấy gợi ý (Dựa trên lịch sử mua vé - Proxy cho "Sự kiện nổi bật") ---
const getRecommendations = () => axios.get('/api/v1/events/recommendations');

/**
 * LOGIC THÔNG MINH: Lấy Trending cho trang Home
 * - Ưu tiên 1: Lấy từ gợi ý (Backend dùng User-Based CF dựa trên vé đã bán).
 * - Ưu tiên 2: Nếu thiếu (dưới 10 cái) hoặc chưa đăng nhập, lấy thêm sự kiện mới nhất.
 * - Đảm bảo: Không trùng lặp và luôn đủ 10 sản phẩm (nếu DB có đủ).
 */
const getUnifiedTrending = async () => {
    let finalEvents = [];

    // BƯỚC 1: Thử lấy dữ liệu "Hot" từ Backend (Những gì người dùng khác đã mua)
    try {
        const res = await getRecommendations();
        const data = res?.data || res || [];
        if (Array.isArray(data)) {
            finalEvents = [...data];
        }
    } catch (error) {
        console.log('Guest mode: Chuyển sang lấy sự kiện công khai...');
    }

    // BƯỚC 2: Nếu chưa đủ 10 cái, "nghĩ cách" lấy thêm sự kiện mới nhất đắp vào
    if (finalEvents.length < 10) {
        try {
            // Lấy 20 cái mới nhất để dư giả lọc trùng
            const publicRes = await getAll({
                current: 1,
                pageSize: 20,
                sort: 'createdAt,desc'
            });

            const newestList =
                publicRes?.result || publicRes?.data?.result || [];

            // Thuật toán lọc trùng: Chỉ lấy những ID chưa có trong danh sách Hot
            const existingIds = new Set(finalEvents.map(ev => ev.id));
            const fillers = newestList.filter(ev => !existingIds.has(ev.id));

            // Gộp danh sách Hot + danh sách Mới
            finalEvents = [...finalEvents, ...fillers];
        } catch (err) {
            console.error('Không thể lấy thêm dữ liệu bù đắp:', err);
        }
    }

    // BƯỚC 3: Cắt đúng 10 phần tử đầu tiên để trả về cho UI
    return finalEvents.slice(0, 10);
};

// --- 3. Export object ---
export const eventApi = {
    create,
    update,
    getById,
    remove,
    getAll,
    toggleActive,
    togglePublished,
    approve,
    reject,
    getRecommendations,
    getUnifiedTrending // <--- Hàm quan trọng nhất cho Trending Home
};
