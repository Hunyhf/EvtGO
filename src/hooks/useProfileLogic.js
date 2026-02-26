// src/hooks/useProfileLogic.js
import { useState, useContext, useEffect, useCallback } from 'react';
import { message } from 'antd';
import { AuthContext } from '@contexts/AuthContext';
import { userService } from '@services/userService';
import { callGetUserById } from '@apis/userApi';
import axios from '@apis/axiosClient'; // Import axiosClient để gọi API upload

/**
 * Hook quản lý logic trang Profile
 * - Đồng bộ dữ liệu người dùng từ server
 * - Quản lý state form chỉnh sửa thông tin cá nhân
 * - Xử lý upload và cập nhật thông tin người dùng
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
        address: '',
        avatar: '' // Đảm bảo có trường avatar trong state
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
                            address: userData.address || user.address || '',
                            avatar: userData.avatar || user.avatar || ''
                        });
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
                            address: user.address || '',
                            avatar: user.avatar || ''
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
     * Xử lý thay đổi Avatar
     * - Upload file lên server với thư mục theo ID người dùng
     * - Cập nhật tên file vào formData
     * - Tự động lưu Database
     */
    const handleAvatarChange = useCallback(
        async e => {
            const file = e.target.files?.[0];
            if (!file) return;

            // Kiểm tra định dạng ảnh cơ bản
            if (!file.type.startsWith('image/')) {
                message.error('Vui lòng chọn tệp tin hình ảnh!');
                return;
            }

            const uploadData = new FormData();
            uploadData.append('file', file);

            uploadData.append('folder', `avatars/${user.id}`);

            try {
                setIsUpdating(true);
                // Gọi API upload file dựa trên FileController của Backend
                const res = await axios.post('/api/v1/files', uploadData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                // Lấy tên file từ response
                const newAvatarName =
                    res.data?.data?.fileName || res.data?.fileName;

                if (newAvatarName) {
                    // Cập nhật State và Context hiển thị UI tạm thời
                    setFormData(prev => ({ ...prev, avatar: newAvatarName }));
                    updateUserContext({ avatar: newAvatarName });

                    // Tự động gọi API cập nhật User vào Database ngay sau khi upload thành công
                    const payload = {
                        ...formData,
                        avatar: newAvatarName,
                        age: Number(formData.age) || 0
                    };

                    await userService.updateProfile(payload, user.id);
                    message.success('Cập nhật ảnh đại diện thành công!');
                }
            } catch (error) {
                console.error('Upload Avatar Error:', error);
                message.error('Không thể tải ảnh lên. Vui lòng thử lại!');
            } finally {
                setIsUpdating(false);
            }
        },
        [formData, user.id, updateUserContext]
    );

    /**
     * Cập nhật giá trị input khi người dùng thay đổi form
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

    return {
        formData,
        isUpdating,
        handleChange,
        submitUpdate,
        handleAvatarChange
    };
};
