import { useState, useContext, useEffect, useCallback } from 'react';
import { message } from 'antd';
import { AuthContext } from '@contexts/AuthContext';
import { userService } from '@services/userService';
import { callGetUserById } from '@apis/userApi';
import axios from '@apis/axiosClient';

/**
 * Custom Hook quản lý toàn bộ logic trang Profile:
 * - Lấy dữ liệu user chi tiết
 * - Xử lý thay đổi form
 * - Preview và upload avatar
 * - Gửi request cập nhật profile
 */
export const useProfileLogic = () => {
    const { user, updateUserContext } = useContext(AuthContext);

    /**
     * Trạng thái loading khi đang gửi yêu cầu cập nhật
     */
    const [isUpdating, setIsUpdating] = useState(false);

    /**
     * Lưu file avatar được chọn để upload sau khi submit
     */
    const [selectedFile, setSelectedFile] = useState(null);

    /**
     * State quản lý dữ liệu form chỉnh sửa thông tin cá nhân
     */
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        email: '',
        phone: '',
        age: '',
        gender: 'OTHER',
        address: '',
        avatar: ''
    });

    /**
     * Lấy đầy đủ thông tin user từ server khi component mount
     * Đồng bộ dữ liệu từ API và context
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
                    console.error('Lỗi tải thông tin user:', error);
                }
            }
        };

        fetchFullUserProfile();

        return () => {
            isMounted = false;
        };
    }, [user?.id]);

    /**
     * Xử lý thay đổi input trong form
     * Đảm bảo age luôn >= 0 và đúng định dạng số
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
     * Xử lý chọn avatar mới:
     * - Kiểm tra định dạng ảnh
     * - Tạo URL preview hiển thị trên UI
     * - Lưu file để upload khi submit
     */
    const handleAvatarChange = useCallback(e => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            message.error('Vui lòng chọn tệp tin hình ảnh!');
            return;
        }

        const previewUrl = URL.createObjectURL(file);

        setFormData(prev => ({
            ...prev,
            avatar: previewUrl
        }));

        setSelectedFile(file);
    }, []);

    /**
     * Xử lý submit cập nhật profile:
     * 1. Upload avatar nếu có file mới
     * 2. Gửi dữ liệu cập nhật vào database
     * 3. Đồng bộ lại AuthContext
     */
    const submitUpdate = useCallback(
        async e => {
            if (e) e.preventDefault();
            if (isUpdating) return;

            setIsUpdating(true);

            let finalAvatarName = formData.avatar;

            try {
                /**
                 * Upload file avatar lên server nếu người dùng chọn ảnh mới
                 */
                if (selectedFile) {
                    const uploadData = new FormData();
                    uploadData.append('file', selectedFile);
                    uploadData.append('folder', `avatars/${user.id}`);

                    const res = await axios.post('/api/v1/files', uploadData, {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    });

                    const uploadResult = res.data || res;

                    finalAvatarName =
                        uploadResult.data?.fileName || uploadResult.fileName;

                    if (!finalAvatarName) {
                        throw new Error('Không nhận được tên file từ server');
                    }

                    /**
                     * Giải phóng bộ nhớ nếu avatar là blob preview
                     */
                    if (
                        formData.avatar &&
                        formData.avatar.startsWith('blob:')
                    ) {
                        URL.revokeObjectURL(formData.avatar);
                    }
                }

                /**
                 * Tạo payload cập nhật thông tin user
                 */
                const payload = {
                    ...formData,
                    avatar: finalAvatarName,
                    age: Number(formData.age) || 0
                };

                const updatedData = await userService.updateProfile(
                    payload,
                    user.id
                );

                /**
                 * Nếu cập nhật thành công:
                 * - Đồng bộ lại context
                 * - Reset trạng thái file
                 * - Hiển thị thông báo thành công
                 */
                if (updatedData) {
                    updateUserContext(updatedData);
                    setSelectedFile(null);
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

    /**
     * Trả về các state và hàm xử lý cho component sử dụng
     */
    return {
        formData,
        isUpdating,
        handleChange,
        submitUpdate,
        handleAvatarChange
    };
};
