// src/hooks/useProfileLogic.js
import { useState, useContext, useEffect, useCallback } from 'react';
import { message } from 'antd'; // Tích hợp thông báo
import { AuthContext } from '@contexts/AuthContext';
import { userService } from '@services/userService';
import { callGetUserById } from '@apis/userApi';

export const useProfileLogic = () => {
    const { user, updateUserContext } = useContext(AuthContext);
    const [isUpdating, setIsUpdating] = useState(false);

    const [formData, setFormData] = useState({
        id: '',
        name: '',
        email: '',
        phone: '',
        age: '',
        gender: 'OTHER',
        address: ''
    });

    // EFFECT: Lấy dữ liệu chi tiết từ server để đồng bộ Form
    useEffect(() => {
        let isMounted = true; // Chống memory leak khi component unmount

        const fetchFullUserProfile = async () => {
            if (user?.id) {
                try {
                    const res = await callGetUserById(user.id);
                    const userData = res.data || res;

                    if (isMounted) {
                        const syncedData = {
                            id: user.id,
                            name: userData.name || user.name || '',
                            email: userData.email || user.email || '',
                            phone: userData.phone || user.phone || '',
                            age: userData.age ?? user.age ?? '',
                            gender: userData.gender || user.gender || 'OTHER',
                            address: userData.address || user.address || ''
                        };
                        setFormData(syncedData);

                        // Tùy chọn: Đồng bộ ngược lại Context nếu dữ liệu API mới hơn
                        // updateUserContext(syncedData);
                    }
                } catch (error) {
                    console.error(
                        'Lỗi khi tải thông tin chi tiết user:',
                        error
                    );
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

    // Tối ưu: Chỉ định nghĩa lại hàm khi cần thiết
    const handleChange = useCallback(e => {
        const { name, value } = e.target;
        if (name === 'age') {
            const val = value === '' ? '' : Math.max(0, parseInt(value, 10));
            setFormData(prev => ({ ...prev, age: val }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    }, []);

    const submitUpdate = useCallback(
        async e => {
            if (e) e.preventDefault();
            if (isUpdating) return;

            setIsUpdating(true);
            const payload = { ...formData, age: Number(formData.age) || 0 };

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
