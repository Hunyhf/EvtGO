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
            setFormData({
                ...user,
                gender: user.gender || 'OTHER',
                age: user.age ?? ''
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

        // Data cleaning tối thiểu trước khi gửi qua service
        const { email, ...updateData } = formData;
        const payload = { ...formData, age: Number(formData.age) || 0 };

        try {
            // Gọi service thay vì gọi API trực tiếp
            const updatedData = await userService.updateProfile(
                payload,
                user.id
            );

            if (updatedData) {
                updateUserContext(updatedData);
            }
        } catch (error) {
            // Lỗi đã được service toast, ở đây chỉ cần quản lý flow (nếu cần)
        } finally {
            setIsUpdating(false);
        }
    };

    return { formData, isUpdating, handleChange, submitUpdate };
};
