// src/pages/organizer/EventManagement/Step1Info.jsx
import React, { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import styles from './Step1Info.module.scss';
import FormGroup from '@components/Common/FormGroup';
import categoryApi from '@apis/categoryApi';
import { CameraOutlined, PictureOutlined } from '@ant-design/icons';
import { toast } from 'react-toastify';

const cx = classNames.bind(styles);

// Thêm prop validateTrigger từ CreateEvent truyền xuống
const Step1Info = ({ formData, setFormData, errors, validateTrigger }) => {
    const [categories, setCategories] = useState([]);

    // === TRẠNG THÁI QUẢN LÝ LỖI HIỂN THỊ TẠI CHỖ ===
    const [localErrors, setLocalErrors] = useState({});

    // Xử lý việc hiển thị lỗi và tự động ẩn sau 2 giây
    useEffect(() => {
        // Mỗi khi có errors mới hoặc validateTrigger thay đổi (người dùng bấm nút Tiếp tục)
        setLocalErrors(errors);

        if (Object.keys(errors).length > 0) {
            const timer = setTimeout(() => {
                setLocalErrors({});
            }, 2000); // Biến mất sau 2 giây

            return () => clearTimeout(timer);
        }
    }, [errors, validateTrigger]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await categoryApi.getAll();
                if (res && res.result) setCategories(res.result);
                else if (res && res.data) setCategories(res.data);
            } catch (error) {
                console.error('Lỗi khi lấy danh mục:', error);
            }
        };
        fetchCategories();
    }, []);

    const handleInputChange = e => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e, field) => {
        const file = e.target.files[0];
        if (!file) return;

        const config = {
            poster: { w: 1280, h: 720, label: 'Ảnh nền' },
            organizerLogo: { w: 275, h: 275, label: 'Logo' }
        };

        const target = config[field];
        const img = new Image();
        const objectUrl = URL.createObjectURL(file);
        img.src = objectUrl;

        img.onload = () => {
            if (img.width === target.w && img.height === target.h) {
                setFormData(prev => ({ ...prev, [field]: objectUrl }));
            } else {
                toast.error(
                    `${target.label} sai kích thước (${target.w}x${target.h}px)`
                );
                e.target.value = '';
                URL.revokeObjectURL(objectUrl);
            }
        };
    };

    const quillModules = {
        toolbar: [
            [{ header: [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ color: [] }, { background: [] }],
            [{ list: 'ordered' }, { list: 'bullet' }],
            [{ align: [] }],
            ['link', 'image'],
            ['clean']
        ]
    };

    return (
        <div className={cx('stepContent')}>
            {/* 1. UP HÌNH ẢNH NỀN */}
            <div className={cx('section')}>
                <div
                    className={cx('coverUpload', {
                        // Sử dụng localErrors để điều khiển border đỏ
                        errorBorder: !!localErrors.poster
                    })}
                >
                    {formData.poster ? (
                        <img
                            src={formData.poster}
                            alt='Cover'
                            className={cx('previewCover')}
                        />
                    ) : (
                        <div className={cx('uploadPlaceholder')}>
                            <PictureOutlined />
                            <span>Tải ảnh nền sự kiện (1280x720)</span>
                        </div>
                    )}
                    <input
                        type='file'
                        accept='image/*'
                        onChange={e => handleFileChange(e, 'poster')}
                    />
                </div>
                {localErrors.poster && (
                    <span className={cx('errorText')}>
                        {localErrors.poster}
                    </span>
                )}
            </div>

            {/* 2. THÔNG TIN BAN TỔ CHỨC */}
            <div className={cx('section')}>
                <h3 className={cx('sectionTitle')}>Thông tin ban tổ chức</h3>
                <div className={cx('organizerInfo')}>
                    <div className={cx('logoUpload')}>
                        <div
                            className={cx('logoCircle', {
                                errorBorder: !!localErrors.organizerLogo
                            })}
                        >
                            {formData.organizerLogo ? (
                                <img src={formData.organizerLogo} alt='Logo' />
                            ) : (
                                <CameraOutlined />
                            )}
                            <input
                                type='file'
                                accept='image/*'
                                onChange={e =>
                                    handleFileChange(e, 'organizerLogo')
                                }
                            />
                        </div>
                        <span className={cx('logoLabel')}>Logo (275x275)</span>
                    </div>
                    {localErrors.organizerLogo && (
                        <span className={cx('errorText', 'small')}>
                            {localErrors.organizerLogo}
                        </span>
                    )}

                    <div className={cx('organizerName')}>
                        <FormGroup
                            label='Tên ban tổ chức'
                            name='organizerName'
                            value={formData.organizerName || ''}
                            onChange={handleInputChange}
                            error={errors.organizerName} // Truyền errors gốc
                            trigger={validateTrigger} // Truyền trigger để FormGroup tự xử lý timer
                            maxLength={80}
                            placeholder='Nhập tên ban tổ chức'
                            className={cx('inputCustom')}
                        />
                    </div>
                </div>
            </div>

            {/* 3. THÔNG TIN SỰ KIỆN & ĐỊA CHỈ */}
            <div className={cx('section')}>
                <h3 className={cx('sectionTitle')}>Địa điểm & Thể loại</h3>
                <div className={cx('formGrid')}>
                    <FormGroup
                        label='Tên sự kiện'
                        name='name'
                        value={formData.name}
                        onChange={handleInputChange}
                        error={errors.name}
                        trigger={validateTrigger}
                        maxLength={100}
                        className={cx('inputCustom')}
                    />
                    <FormGroup
                        label='Tên địa điểm'
                        name='locationName'
                        value={formData.locationName}
                        onChange={handleInputChange}
                        error={errors.locationName}
                        trigger={validateTrigger}
                        maxLength={80}
                        className={cx('inputCustom')}
                    />
                </div>

                <div className={cx('addressGrid')}>
                    <div className={cx('inputWrapper')}>
                        <label className={cx('label')}>Tỉnh/Thành phố</label>
                        <select
                            name='province'
                            className={cx('select', {
                                errorInput: !!localErrors.province
                            })}
                            value={formData.province}
                            onChange={handleInputChange}
                        >
                            <option value=''>Chọn Tỉnh/Thành</option>
                            <option value='Hồ Chí Minh'>Hồ Chí Minh</option>
                            <option value='Hà Nội'>Hà Nội</option>
                        </select>
                        {localErrors.province && (
                            <span className={cx('errorText')}>
                                {localErrors.province}
                            </span>
                        )}
                    </div>

                    <div className={cx('inputWrapper')}>
                        <label className={cx('label')}>Quận/Huyện</label>
                        <select
                            name='district'
                            className={cx('select', {
                                errorInput: !!localErrors.district
                            })}
                            value={formData.district}
                            onChange={handleInputChange}
                        >
                            <option value=''>Chọn Quận/Huyện</option>
                        </select>
                        {localErrors.district && (
                            <span className={cx('errorText')}>
                                {localErrors.district}
                            </span>
                        )}
                    </div>

                    <div className={cx('inputWrapper')}>
                        <label className={cx('label')}>Phường/Xã</label>
                        <select
                            name='ward'
                            className={cx('select', {
                                errorInput: !!localErrors.ward
                            })}
                            value={formData.ward}
                            onChange={handleInputChange}
                        >
                            <option value=''>Chọn Phường/Xã</option>
                        </select>
                        {localErrors.ward && (
                            <span className={cx('errorText')}>
                                {localErrors.ward}
                            </span>
                        )}
                    </div>

                    <div className={cx('inputWrapper')}>
                        <label className={cx('label')}>Thể loại sự kiện</label>
                        <select
                            name='genreId'
                            className={cx('select', {
                                errorInput: !!localErrors.genreId
                            })}
                            value={formData.genreId}
                            onChange={handleInputChange}
                        >
                            <option value=''>Chọn thể loại</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                        {localErrors.genreId && (
                            <span className={cx('errorText')}>
                                {localErrors.genreId}
                            </span>
                        )}
                    </div>

                    <div className={cx('inputWrapper', 'fullWidth')}>
                        <FormGroup
                            label='Số nhà, đường'
                            name='addressDetail'
                            value={formData.addressDetail}
                            onChange={handleInputChange}
                            error={errors.addressDetail}
                            trigger={validateTrigger}
                            placeholder='VD: 123 đường ABC'
                            maxLength={80}
                            className={cx('inputCustom')}
                        />
                    </div>
                </div>
            </div>

            {/* 4. MÔ TẢ CHI TIẾT */}
            <div className={cx('section')}>
                <h3 className={cx('sectionTitle')}>
                    Thông tin chi tiết sự kiện
                </h3>
                <div
                    className={cx('editorContainer', {
                        errorBorder: !!localErrors.description
                    })}
                >
                    <ReactQuill
                        theme='snow'
                        modules={quillModules}
                        value={formData.description || ''}
                        onChange={content =>
                            setFormData(prev => ({
                                ...prev,
                                description: content
                            }))
                        }
                        placeholder='Viết mô tả sự kiện...'
                    />
                </div>
                {localErrors.description && (
                    <span className={cx('errorText')}>
                        {localErrors.description}
                    </span>
                )}
            </div>
        </div>
    );
};

export default Step1Info;
