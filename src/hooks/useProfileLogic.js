// src/hooks/useProfileLogic.js
import { useState, useContext, useEffect, useCallback } from 'react';
import { message } from 'antd';
import { AuthContext } from '@contexts/AuthContext';
import { userService } from '@services/userService';
import { callGetUserById } from '@apis/userApi';
import axios from '@apis/axiosClient';

export const useProfileLogic = () => {
    const { user, updateUserContext } = useContext(AuthContext);
    const [isUpdating, setIsUpdating] = useState(false);

    // State lưu file ảnh đã chọn để chờ upload
    const [selectedFile, setSelectedFile] = useState(null);

    const [formData, setFormData] = useState({
        id: '',
        name: '',
        email: '',
        phone: '', // Lưu ý: Backend Entity User chưa có trường phone
        age: '',
        gender: 'OTHER',
        address: '',
        avatar: ''
    });

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
                    console.error('Lỗi tải thông tin user:', error);
                }
            }
        };
        fetchFullUserProfile();
        return () => {
            isMounted = false;
        };
    }, [user?.id]);

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
     * Chỉ xử lý hiển thị Preview và giữ file lại
     */
    const handleAvatarChange = useCallback(e => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            message.error('Vui lòng chọn tệp tin hình ảnh!');
            return;
        }

        // Tạo đường dẫn tạm thời để hiển thị UI
        const previewUrl = URL.createObjectURL(file);
        setFormData(prev => ({ ...prev, avatar: previewUrl }));
        setSelectedFile(file); // Giữ file lại để upload sau
    }, []);

    /**
     * Logic chính để gửi dữ liệu vào Database
     */
    const submitUpdate = useCallback(
        async e => {
            if (e) e.preventDefault();
            if (isUpdating) return;

            setIsUpdating(true);
            let finalAvatarName = formData.avatar;

            try {
                // Bước 1: Nếu có file mới, upload lên server trước
                if (selectedFile) {
                    const uploadData = new FormData();
                    uploadData.append('file', selectedFile);
                    uploadData.append('folder', `avatars/${user.id}`);

                    const res = await axios.post('/api/v1/files', uploadData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    });

                    // Lấy tên file từ ResUploadFileDTO (xử lý cả trường hợp có wrapper data hoặc không)
                    const uploadResult = res.data || res;
                    finalAvatarName =
                        uploadResult.data?.fileName || uploadResult.fileName;

                    if (!finalAvatarName) {
                        throw new Error('Không nhận được tên file từ server');
                    }

                    // Giải phóng bộ nhớ preview
                    if (formData.avatar.startsWith('blob:')) {
                        URL.revokeObjectURL(formData.avatar);
                    }
                }

                // Bước 2: Gửi payload cập nhật User vào DB
                const payload = {
                    ...formData,
                    avatar: finalAvatarName, // Đảm bảo đây là String tên file, không phải blob URL
                    age: Number(formData.age) || 0
                };

                const updatedData = await userService.updateProfile(
                    payload,
                    user.id
                );

                if (updatedData) {
                    updateUserContext(updatedData);
                    setSelectedFile(null); // Reset trạng thái file
                    message.success('Cập nhật thông tin thành công!');
                }
            } catch (error) {
                console.error('Update Profile Error:', error);
                message.error(
                    'Không thể cập nhật thông tin. Vui lòng thử lại!'
                );
            } finally {
                setIsUpdating(false);
            }
        },
        [formData, user.id, isUpdating, selectedFile, updateUserContext]
    );

    return {
        formData,
        isUpdating,
        handleChange,
        submitUpdate,
        handleAvatarChange
    };
};
