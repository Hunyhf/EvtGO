import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '@contexts/AuthContext';
import { userService } from '@services/userService';

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

    useEffect(() => {
        if (user) {
            // SỬA TẠI ĐÂY: Đảm bảo mọi giá trị đều là defined (không undefined/null)
            setFormData({
                id: user.id || '',
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                age: user.age ?? '', // Giữ số 0 nếu có, nếu null/undefined thì lấy ''
                gender: user.gender || 'OTHER',
                address: user.address || ''
            });
        }
    }, [user]);

    const handleChange = e => {
        const { name, value } = e.target;
        if (name === 'age') {
            const val = value === '' ? '' : Math.max(0, parseInt(value, 10));
            setFormData(prev => ({ ...prev, age: val }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const submitUpdate = async e => {
        e.preventDefault();
        setIsUpdating(true);

        // Chuẩn bị dữ liệu gửi đi
        const payload = { ...formData, age: Number(formData.age) || 0 };

        try {
            const updatedData = await userService.updateProfile(
                payload,
                user.id
            );

            if (updatedData) {
                updateUserContext(updatedData);
            }
        } catch (error) {
            // Lỗi đã được service xử lý (toast), ở đây chỉ quản lý luồng loading
        } finally {
            setIsUpdating(false);
        }
    };

    return { formData, isUpdating, handleChange, submitUpdate };
};
