import axios from './axiosClient';

// Tạo mới một sự kiện
const create = data => axios.post('/api/v1/events', data);

// Cập nhật thông tin sự kiện theo ID
const update = (id, data) => axios.put(`/api/v1/events/${id}`, data);

// Lấy chi tiết một sự kiện theo ID
const getById = id => axios.get(`/api/v1/events/${id}`);

// Xóa một sự kiện theo ID
const remove = id => axios.delete(`/api/v1/events/${id}`);

// Lấy danh sách sự kiện (có thể truyền params để phân trang, lọc, sắp xếp)
const getAll = params => axios.get('/api/v1/events', { params });

// Thay đổi trạng thái active của sự kiện (bật/tắt hoạt động)
const toggleActive = id => axios.patch(`/api/v1/events/${id}/active`);

// Thay đổi trạng thái published của sự kiện (hiển thị/ẩn)
const togglePublished = id => axios.patch(`/api/v1/events/${id}/published`);

// Duyệt sự kiện (publish sự kiện)
const approve = id => togglePublished(id);

// Từ chối sự kiện (disable sự kiện)
const reject = id => toggleActive(id);

// Lấy danh sách sự kiện gợi ý cho người dùng
const getRecommendations = () => axios.get('/api/v1/events/recommendations');

/**
 * Lấy danh sách sự kiện trending cho trang Home
 * - Lấy từ danh sách gợi ý trước
 * - Nếu chưa đủ 10 sự kiện thì bổ sung bằng sự kiện mới nhất
 * - Loại bỏ các sự kiện trùng ID
 * - Trả về tối đa 10 sự kiện
 */
const getUnifiedTrending = async () => {
    let finalEvents = [];

    // Lấy danh sách gợi ý
    try {
        const res = await getRecommendations();
        const data = res?.data || res || [];
        if (Array.isArray(data)) {
            finalEvents = [...data];
        }
    } catch (error) {
        console.log('Không lấy được gợi ý, chuyển sang danh sách công khai');
    }

    // Nếu chưa đủ 10 sự kiện thì lấy thêm sự kiện mới nhất
    if (finalEvents.length < 10) {
        try {
            const publicRes = await getAll({
                current: 1,
                pageSize: 20,
                sort: 'createdAt,desc'
            });

            const newestList =
                publicRes?.result || publicRes?.data?.result || [];

            // Lọc các sự kiện chưa có trong danh sách hiện tại
            const existingIds = new Set(finalEvents.map(ev => ev.id));
            const fillers = newestList.filter(ev => !existingIds.has(ev.id));

            // Gộp danh sách gợi ý và danh sách bổ sung
            finalEvents = [...finalEvents, ...fillers];
        } catch (err) {
            console.error('Lỗi khi lấy thêm sự kiện:', err);
        }
    }

    // Trả về tối đa 10 sự kiện
    return finalEvents.slice(0, 10);
};

// Export các API để sử dụng
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
