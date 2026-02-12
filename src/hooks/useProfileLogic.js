import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '@contexts/AuthContext';
import { callUpdateUser } from '@apis/userApi';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';

export const useProfileLogic = () => {
    const { user, updateUserContext } = useContext(AuthContext);
    const [isUpdating, setIsUpdating] = useState(false);

    // Khởi tạo state an toàn
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
                // Fallback giá trị mặc định để tránh lỗi Uncontrolled input
                age: user.age ?? ''
            });
        }
    }, [user]);

    const handleChange = e => {
        const { name, value } = e.target;
        // Logic validate age
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

        // Data cleaning trước khi gửi
        const payload = { ...formData, age: Number(formData.age) || 0 };

        try {
            const res = await callUpdateUser(payload);
            const updatedData = res?.data || res; // Adapt response

            if (updatedData) {
                updateUserContext(updatedData);
                // Logic Cookie
                if (payload.age)
                    Cookies.set(`user_age_${user.id}`, payload.age, {
                        expires: 7
                    });
                toast.success('Cập nhật thành công!');
            }
        } catch (error) {
            console.error(error);
            toast.error('Lỗi cập nhật!');
        } finally {
            setIsUpdating(false);
        }
    };

    return { formData, isUpdating, handleChange, submitUpdate };
};
