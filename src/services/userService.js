import { callUpdateUser } from '@apis/userApi';
import { toast } from 'react-toastify';
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

                toast.success('Cập nhật thành công!');
                return updatedData;
            }
        } catch (error) {
            console.error('Service Update Error:', error);
            toast.error('Lỗi cập nhật!');
            throw error; // Ném lỗi để hook xử lý trạng thái loading
        }
    }
};
