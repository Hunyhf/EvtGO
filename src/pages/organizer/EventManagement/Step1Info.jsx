// src/pages/organizer/EventManagement/Step1Info.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Sử dụng axios để gọi API bên ngoài
import classNames from 'classnames/bind';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import styles from './Step1Info.module.scss';
import FormGroup from '@components/Common/FormGroup';
import categoryApi from '@apis/categoryApi';
import { CameraOutlined, PictureOutlined } from '@ant-design/icons';
import { toast } from 'react-toastify';

const cx = classNames.bind(styles);

const Step1Info = ({ formData, setFormData, errors, validateTrigger }) => {
    const [categories, setCategories] = useState([]);

    // === STATE LƯU TRỮ DỮ LIỆU ĐỊA LÝ ===
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);
    const [localErrors, setLocalErrors] = useState({});

    useEffect(() => {
        setLocalErrors(errors);
        if (Object.keys(errors).length > 0) {
            const timer = setTimeout(() => setLocalErrors({}), 2000);
            return () => clearTimeout(timer);
        }
    }, [errors, validateTrigger]);

    // 1. Lấy danh sách Tỉnh/Thành khi component mount
    useEffect(() => {
        const fetchLocationData = async () => {
            try {
                const res = await axios.get(
                    'https://provinces.open-api.vn/api/p/'
                );
                setProvinces(res.data);
            } catch (error) {
                console.error('Lỗi lấy danh sách tỉnh thành:', error);
            }
        };

        const fetchCategories = async () => {
            try {
                const res = await categoryApi.getAll();
                if (res && res.result) setCategories(res.result);
                else if (res && res.data) setCategories(res.data);
            } catch (error) {
                console.error('Lỗi khi lấy danh mục:', error);
            }
        };

        fetchLocationData();
        fetchCategories();
    }, []);

    const handleInputChange = e => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // === XỬ LÝ THAY ĐỔI ĐỊA LÝ BIẾN ĐỘNG ===

    // Khi chọn Tỉnh -> Lấy Huyện
    const handleProvinceChange = async e => {
        const provinceCode = e.target.value;
        const selectedProvince = provinces.find(p => p.code == provinceCode);

        // Cập nhật tên tỉnh vào formData và reset cấp dưới
        setFormData(prev => ({
            ...prev,
            province: selectedProvince ? selectedProvince.name : '',
            district: '',
            ward: ''
        }));

        if (provinceCode) {
            try {
                const res = await axios.get(
                    `https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`
                );
                setDistricts(res.data.districts);
            } catch (error) {
                console.error('Lỗi lấy quận huyện:', error);
            }
        } else {
            setDistricts([]);
        }
        setWards([]);
    };

    // Khi chọn Huyện -> Lấy Xã
    const handleDistrictChange = async e => {
        const districtCode = e.target.value;
        const selectedDistrict = districts.find(d => d.code == districtCode);

        setFormData(prev => ({
            ...prev,
            district: selectedDistrict ? selectedDistrict.name : '',
            ward: ''
        }));

        if (districtCode) {
            try {
                const res = await axios.get(
                    `https://provinces.open-api.vn/api/d/${districtCode}?depth=2`
                );
                setWards(res.data.wards);
            } catch (error) {
                console.error('Lỗi lấy phường xã:', error);
            }
        } else {
            setWards([]);
        }
    };

    // Khi chọn Xã
    const handleWardChange = e => {
        const wardCode = e.target.value;
        const selectedWard = wards.find(w => w.code == wardCode);
        setFormData(prev => ({
            ...prev,
            ward: selectedWard ? selectedWard.name : ''
        }));
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
            {/* 1. UP HÌNH ẢNH NỀN (Giữ nguyên) */}
            <div className={cx('section')}>
                <div
                    className={cx('coverUpload', {
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

            {/* 2. THÔNG TIN BAN TỔ CHỨC (Giữ nguyên) */}
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
                            error={errors.organizerName}
                            trigger={validateTrigger}
                            maxLength={80}
                            placeholder='Nhập tên ban tổ chức'
                            className={cx('inputCustom')}
                        />
                    </div>
                </div>
            </div>

            {/* 3. THÔNG TIN SỰ KIỆN & ĐỊA CHỈ (ĐÃ CẬP NHẬT SELECT DƯỚI ĐÂY) */}
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
                    {/* TỈNH/THÀNH */}
                    <div className={cx('inputWrapper')}>
                        <label className={cx('label')}>Tỉnh/Thành phố</label>
                        <select
                            name='province'
                            className={cx('select', {
                                errorInput: !!localErrors.province
                            })}
                            onChange={handleProvinceChange}
                        >
                            <option value=''>Chọn Tỉnh/Thành</option>
                            {provinces.map(p => (
                                <option key={p.code} value={p.code}>
                                    {p.name}
                                </option>
                            ))}
                        </select>
                        {localErrors.province && (
                            <span className={cx('errorText')}>
                                {localErrors.province}
                            </span>
                        )}
                    </div>

                    {/* QUẬN/HUYỆN */}
                    <div className={cx('inputWrapper')}>
                        <label className={cx('label')}>Quận/Huyện</label>
                        <select
                            name='district'
                            className={cx('select', {
                                errorInput: !!localErrors.district
                            })}
                            disabled={!districts.length}
                            onChange={handleDistrictChange}
                        >
                            <option value=''>Chọn Quận/Huyện</option>
                            {districts.map(d => (
                                <option key={d.code} value={d.code}>
                                    {d.name}
                                </option>
                            ))}
                        </select>
                        {localErrors.district && (
                            <span className={cx('errorText')}>
                                {localErrors.district}
                            </span>
                        )}
                    </div>

                    {/* PHƯỜNG/XÃ */}
                    <div className={cx('inputWrapper')}>
                        <label className={cx('label')}>Phường/Xã</label>
                        <select
                            name='ward'
                            className={cx('select', {
                                errorInput: !!localErrors.ward
                            })}
                            disabled={!wards.length}
                            onChange={handleWardChange}
                        >
                            <option value=''>Chọn Phường/Xã</option>
                            {wards.map(w => (
                                <option key={w.code} value={w.code}>
                                    {w.name}
                                </option>
                            ))}
                        </select>
                        {localErrors.ward && (
                            <span className={cx('errorText')}>
                                {localErrors.ward}
                            </span>
                        )}
                    </div>

                    {/* THỂ LOẠI (Giữ nguyên) */}
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

            {/* 4. MÔ TẢ CHI TIẾT (Giữ nguyên) */}
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
