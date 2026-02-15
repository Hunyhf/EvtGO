import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '@contexts/AuthContext';
import { userService } from '@services/userService';
import { callGetUserById } from '@apis/userApi'; // Import API lấy chi tiết user

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

    // EFFECT: Gọi API lấy dữ liệu mới nhất khi vào trang
    useEffect(() => {
        const fetchFullUserProfile = async () => {
            if (user && user.id) {
                try {
                    // Gọi API để đảm bảo lấy dữ liệu age, address từ DB
                    const res = await callGetUserById(user.id);

                    // Kiểm tra cấu trúc data trả về (thường là res.data hoặc res)
                    const userData = res.data || res;

                    setFormData({
                        id: user.id,
                        // Ưu tiên dữ liệu từ API mới gọi, nếu không có thì lấy từ Context
                        name: userData.name || user.name || '',
                        email: userData.email || user.email || '',
                        phone: userData.phone || user.phone || '',

                        // Dùng ?? để giữ giá trị 0 nếu tuổi là 0
                        age: userData.age ?? '',

                        // Xử lý giới tính: Nếu API trả về số (0,1), bạn có thể cần map sang String tại đây
                        gender: userData.gender || 'OTHER',

                        address: userData.address || ''
                    });
                } catch (error) {
                    console.error(
                        'Lỗi khi tải thông tin chi tiết user:',
                        error
                    );
                    // Fallback: Nếu lỗi API thì dùng tạm dữ liệu từ context
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
        };

        fetchFullUserProfile();
    }, [user?.id]); // Chỉ chạy lại khi ID thay đổi

    const handleChange = e => {
        const { name, value } = e.target;
        if (name === 'age') {
            // Cho phép xóa trắng hoặc nhập số >= 0
            const val = value === '' ? '' : Math.max(0, parseInt(value, 10));
            setFormData(prev => ({ ...prev, age: val }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const submitUpdate = async e => {
        e.preventDefault();
        setIsUpdating(true);

        // Chuẩn bị payload: Đảm bảo age là số
        const payload = { ...formData, age: Number(formData.age) || 0 };

        try {
            const updatedData = await userService.updateProfile(
                payload,
                user.id
            );

            if (updatedData) {
                // Cập nhật lại Context để các phần khác của Web cũng nhận được tên/avatar mới
                updateUserContext(updatedData);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsUpdating(false);
        }
    };

    return { formData, isUpdating, handleChange, submitUpdate };
};
