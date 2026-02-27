import { callUpdateUser } from '@apis/userApi';
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

                message.success('Cập nhật thông tin thành công!');
                return updatedData;
            }
        } catch (error) {
            console.error('Service Update Error:', error);
            message.error('Cập nhật thông tin thất bại!');
            throw error;
        }
    }
};
