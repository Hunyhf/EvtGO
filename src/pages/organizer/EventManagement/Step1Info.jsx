import React, { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import styles from './Step1Info.module.scss';
import FormGroup from '@components/Common/FormGroup';
import categoryApi from '@apis/categoryApi';
import { CameraOutlined, PictureOutlined } from '@ant-design/icons';
import { toast } from 'react-toastify'; // Import toast để thông báo lỗi

const cx = classNames.bind(styles);

const Step1Info = ({ formData, setFormData, errors }) => {
    const [categories, setCategories] = useState([]);

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

    // === PHẦN SỬA ĐỔI: VALIDATE KÍCH THƯỚC ẢNH ===
    const handleFileChange = (e, field) => {
        const file = e.target.files[0];
        if (!file) return;

        // Định nghĩa kích thước yêu cầu
        const config = {
            poster: { w: 1280, h: 720, label: 'Ảnh nền' },
            organizerLogo: { w: 275, h: 275, label: 'Logo' }
        };

        const target = config[field];
        const img = new Image();
        const objectUrl = URL.createObjectURL(file);

        img.src = objectUrl;

        img.onload = () => {
            // Kiểm tra kích thước chính xác
            if (img.width === target.w && img.height === target.h) {
                setFormData(prev => ({
                    ...prev,
                    [field]: objectUrl
                }));
            } else {
                // Nếu sai kích thước: Thông báo, xóa input và giải phóng bộ nhớ tạm
                toast.error(
                    `${target.label} không đúng kích thước! Yêu cầu: ${target.w}x${target.h}px (Hiện tại: ${img.width}x${img.height}px)`
                );
                e.target.value = ''; // Reset input file
                URL.revokeObjectURL(objectUrl);
            }
        };

        img.onerror = () => {
            toast.error('File ảnh bị lỗi hoặc không định dạng được.');
            e.target.value = '';
            URL.revokeObjectURL(objectUrl);
        };
    };
    // ============================================

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
                        errorBorder: errors.poster
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
                {errors.poster && (
                    <span className={cx('errorText')}>
                        Vui lòng up ảnh sự kiện
                    </span>
                )}
            </div>

            {/* 2. THÔNG TIN BAN TỔ CHỨC */}
            <div className={cx('section')}>
                <h3 className={cx('sectionTitle')}>Thông tin ban tổ chức</h3>
                <div className={cx('organizerInfo')}>
                    <div className={cx('logoUpload')}>
                        <div className={cx('logoCircle')}>
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

                    <div className={cx('organizerName')}>
                        <FormGroup
                            label='Tên ban tổ chức'
                            name='organizerName'
                            value={formData.organizerName || ''}
                            onChange={handleInputChange}
                            maxLength={80}
                            placeholder='Nhập tên ban tổ chức'
                            className={cx('inputCustom')}
                        />
                        <span className={cx('charCount')}>
                            {formData.organizerName?.length || 0}/80
                        </span>
                    </div>
                </div>
            </div>

            {/* ... Các phần còn lại của code (Địa điểm, Thể loại, Mô tả) giữ nguyên ... */}
            <div className={cx('section')}>
                <h3 className={cx('sectionTitle')}>Địa điểm & Thể loại</h3>
                <div className={cx('formGrid')}>
                    <FormGroup
                        label='Tên sự kiện'
                        name='name'
                        value={formData.name}
                        onChange={handleInputChange}
                        maxLength={100}
                        className={cx('inputCustom')}
                    />
                    <FormGroup
                        label='Tên địa điểm'
                        name='locationName'
                        value={formData.locationName}
                        onChange={handleInputChange}
                        maxLength={80}
                        className={cx('inputCustom')}
                    />
                </div>

                <div className={cx('addressGrid')}>
                    <div className={cx('inputWrapper')}>
                        <label className={cx('label')}>Tỉnh/Thành phố</label>
                        <select
                            name='province'
                            className={cx('select')}
                            value={formData.province}
                            onChange={handleInputChange}
                        >
                            <option value=''>Chọn Tỉnh/Thành</option>
                            <option value='Hồ Chí Minh'>Hồ Chí Minh</option>
                            <option value='Hà Nội'>Hà Nội</option>
                        </select>
                    </div>

                    <div className={cx('inputWrapper')}>
                        <label className={cx('label')}>Quận/Huyện</label>
                        <select
                            name='district'
                            className={cx('select')}
                            value={formData.district}
                            onChange={handleInputChange}
                        >
                            <option value=''>Chọn Quận/Huyện</option>
                        </select>
                    </div>

                    <div className={cx('inputWrapper')}>
                        <label className={cx('label')}>Phường/Xã</label>
                        <select
                            name='ward'
                            className={cx('select')}
                            value={formData.ward}
                            onChange={handleInputChange}
                        >
                            <option value=''>Chọn Phường/Xã</option>
                        </select>
                    </div>

                    <div className={cx('inputWrapper')}>
                        <label className={cx('label')}>Thể loại sự kiện</label>
                        <select
                            name='genreId'
                            className={cx('select', {
                                errorInput: errors.genreId
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
                        {errors.genreId && (
                            <span className={cx('errorText')}>
                                Vui lòng chọn thể loại
                            </span>
                        )}
                    </div>

                    <div className={cx('inputWrapper', 'fullWidth')}>
                        <FormGroup
                            label='Số nhà, đường'
                            name='addressDetail'
                            value={formData.addressDetail}
                            onChange={handleInputChange}
                            placeholder='VD: 123 đường ABC'
                            className={cx('inputCustom')}
                        />
                    </div>
                </div>
            </div>

            <div className={cx('section')}>
                <h3 className={cx('sectionTitle')}>
                    Thông tin chi tiết sự kiện
                </h3>
                <div
                    className={cx('editorContainer', {
                        errorBorder: errors.description
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
                        placeholder='Viết mô tả sự kiện (hỗ trợ in đậm, màu sắc, up ảnh...)'
                    />
                </div>
                {errors.description && (
                    <span className={cx('errorText')}>
                        Vui lòng nhập thông tin sự kiện
                    </span>
                )}
            </div>
        </div>
    );
};

export default Step1Info;
