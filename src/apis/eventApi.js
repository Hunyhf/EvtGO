import axios from './axiosClient';

const create = data => axios.post('/api/v1/events', data);

const update = (id, data) => axios.put(`/api/v1/events/${id}`, data);

const getById = id => axios.get(`/api/v1/events/${id}`);

const remove = id => axios.delete(`/api/v1/events/${id}`);

// Lấy danh sách sự kiện (params: { current, pageSize, filter, sort })
const getAll = params => axios.get('/api/v1/events', { params });

// --- Quản lý trạng thái (Admin/Organizer) ---
const toggleActive = id => axios.patch(`/api/v1/events/${id}/active`);

const togglePublished = id => axios.patch(`/api/v1/events/${id}/published`);

const approve = id => togglePublished(id);

const reject = id => toggleActive(id);

// --- Tính năng Recommendation ---
const getRecommendations = () => axios.get('/api/v1/events/recommendations');

/**
 * Logic lấy sự kiện Trending cho trang Home
 */
const getUnifiedTrending = async () => {
    let finalEvents = [];
    try {
        const res = await getRecommendations();
        // Xử lý linh hoạt các cấu trúc response khác nhau từ BE
        const data = res?.result || res?.data || res || [];
        if (Array.isArray(data)) finalEvents = [...data];
    } catch (error) {
        console.warn('Không lấy được gợi ý, chuyển sang lấy sự kiện mới nhất');
    }

    if (finalEvents.length < 10) {
        try {
            const publicRes = await getAll({
                current: 1,
                pageSize: 20,
                sort: 'createdAt,desc'
            });
            const newestList =
                publicRes?.result?.content || publicRes?.result || [];
            const existingIds = new Set(finalEvents.map(ev => ev.id));
            const fillers = newestList.filter(ev => !existingIds.has(ev.id));
            finalEvents = [...finalEvents, ...fillers];
        } catch (err) {
            console.error('Lỗi khi lấy thêm sự kiện:', err);
        }
    }
    return finalEvents.slice(0, 10);
};

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
    getUnifiedTrending
};
