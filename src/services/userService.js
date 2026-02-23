import { callUpdateUser } from '@apis/userApi';
// Thay thế react-toastify bằng antd
import { message } from 'antd';
import Cookies from 'js-cookie';

export const userService = {
    async updateProfile(payload, userId) {
        try {
            const res = await callUpdateUser(payload);
            const updatedData = res?.data || res;

            if (updatedData) {
                // Logic Cookie: Lưu tuổi người dùng vào cookie nếu có
                if (payload.age) {
                    Cookies.set(`user_age_${userId}`, payload.age, {
                        expires: 7
                    });
                }

                // Đổi toast.success thành message.success
                message.success('Cập nhật thông tin thành công!');
                return updatedData;
            }
        } catch (error) {
            console.error('Service Update Error:', error);
            // Đổi toast.error thành message.error
            // Lưu ý: Nếu axiosClient đã có thông báo lỗi global, bạn có thể cân nhắc xóa dòng này để tránh lặp thông báo
            message.error('Cập nhật thông tin thất bại!');
            throw error;
        }
    }
};
