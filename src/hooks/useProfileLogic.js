// src/hooks/useProfileLogic.js
import { useState, useContext, useEffect, useCallback } from 'react';
import { message } from 'antd';
import { AuthContext } from '@contexts/AuthContext';
import { userService } from '@services/userService';
import { callGetUserById } from '@apis/userApi';

/**
 * Hook quản lý logic trang Profile
 * - Đồng bộ dữ liệu người dùng từ server
 * - Quản lý state form chỉnh sửa thông tin cá nhân
 * - Xử lý cập nhật thông tin người dùng
 */
export const useProfileLogic = () => {
    const { user, updateUserContext } = useContext(AuthContext);
    const [isUpdating, setIsUpdating] = useState(false);

    // State lưu trữ dữ liệu form
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        email: '',
        phone: '',
        age: '',
        gender: 'OTHER',
        address: ''
    });

    /**
     * Khi user thay đổi (hoặc mount lần đầu),
     * gọi API lấy thông tin chi tiết để đồng bộ form
     */
    useEffect(() => {
        let isMounted = true;

        const fetchFullUserProfile = async () => {
            if (user?.id) {
                try {
                    const res = await callGetUserById(user.id);
                    const userData = res.data || res;

                    if (isMounted) {
                        setFormData({
                            id: user.id,
                            name: userData.name || user.name || '',
                            email: userData.email || user.email || '',
                            phone: userData.phone || user.phone || '',
                            age: userData.age ?? user.age ?? '',
                            gender: userData.gender || user.gender || 'OTHER',
                            address: userData.address || user.address || ''
                        });
                    }
                } catch (error) {
                    console.error(
                        'Lỗi khi tải thông tin chi tiết user:',
                        error
                    );

                    // Fallback: sử dụng dữ liệu từ context nếu API lỗi
                    if (isMounted) {
                        setFormData({
                            id: user.id || '',
                            name: user.name || '',
                            email: user.email || '',
                            phone: user.phone || '',
                            age: user.age ?? '',
                            gender: user.gender || 'OTHER',
                            address: user.address || ''
                        });
                    }
                }
            }
        };

        fetchFullUserProfile();

        return () => {
            isMounted = false;
        };
    }, [user?.id]);

    /**
     * Cập nhật giá trị input khi người dùng thay đổi form
     * - Kiểm soát age không âm
     */
    const handleChange = useCallback(e => {
        const { name, value } = e.target;

        if (name === 'age') {
            const val = value === '' ? '' : Math.max(0, parseInt(value, 10));
            setFormData(prev => ({ ...prev, age: val }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    }, []);

    /**
     * Gửi request cập nhật thông tin người dùng
     * - Validate cơ bản
     * - Gọi API update
     * - Đồng bộ lại AuthContext
     */
    const submitUpdate = useCallback(
        async e => {
            if (e) e.preventDefault();
            if (isUpdating) return;

            setIsUpdating(true);

            const payload = {
                ...formData,
                age: Number(formData.age) || 0
            };

            try {
                const updatedData = await userService.updateProfile(
                    payload,
                    user.id
                );

                if (updatedData) {
                    updateUserContext(updatedData);
                    message.success('Cập nhật thông tin thành công!');
                }
            } catch (error) {
                console.error('Update Profile Error:', error);
                message.error(
                    error?.message ||
                        'Không thể cập nhật thông tin. Vui lòng thử lại!'
                );
            } finally {
                setIsUpdating(false);
            }
        },
        [formData, user.id, isUpdating, updateUserContext]
    );

    return { formData, isUpdating, handleChange, submitUpdate };
};
