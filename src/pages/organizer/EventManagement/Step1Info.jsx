import React, { useState } from 'react';
import classNames from 'classnames/bind';
import styles from './Step1Info.module.scss';
import FormGroup from '@components/Common/FormGroup';
import { CameraOutlined, PictureOutlined } from '@ant-design/icons';

const cx = classNames.bind(styles);

const Step1Info = ({ formData, setFormData, errors }) => {
    // Mock data cho dropdown địa chỉ
    const PROVINCES = ['Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Cần Thơ'];

    const handleInputChange = e => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e, field) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({
                ...prev,
                [field]: URL.createObjectURL(file) // Lưu tạm URL để preview
            }));
        }
    };

    return (
        <div className={cx('stepContent')}>
            {/* 1. UP HÌNH ẢNH NỀN (IS COVER 1280x720) */}
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
                            {formData.organizerName?.length || 0}/80 ký tự
                        </span>
                    </div>
                </div>
            </div>

            {/* 3. THÔNG TIN SỰ KIỆN */}
            <div className={cx('section')}>
                <h3 className={cx('sectionTitle')}>Thông tin sự kiện</h3>
                <div className={cx('formGrid')}>
                    <div className={cx('inputWrapper')}>
                        <FormGroup
                            label='Tên sự kiện'
                            name='name'
                            value={formData.name}
                            onChange={handleInputChange}
                            maxLength={100}
                            placeholder='Nhập tên sự kiện'
                            className={cx('inputCustom', {
                                errorInput: errors.name
                            })}
                        />
                        <div className={cx('inputFooter')}>
                            {errors.name && (
                                <span className={cx('errorText')}>
                                    {errors.name}
                                </span>
                            )}
                            <span className={cx('charCount')}>
                                {formData.name?.length || 0}/100
                            </span>
                        </div>
                    </div>

                    <div className={cx('inputWrapper')}>
                        <FormGroup
                            label='Tên địa điểm'
                            name='locationName'
                            value={formData.locationName}
                            onChange={handleInputChange}
                            maxLength={80}
                            placeholder='VD: Nhà thi đấu Phú Thọ'
                            className={cx('inputCustom', {
                                errorInput: errors.locationName
                            })}
                        />
                        <div className={cx('inputFooter')}>
                            {errors.locationName && (
                                <span className={cx('errorText')}>
                                    {errors.locationName}
                                </span>
                            )}
                            <span className={cx('charCount')}>
                                {formData.locationName?.length || 0}/80
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 4. ĐỊA CHÍ CHI TIẾT */}
            <div className={cx('section')}>
                <h3 className={cx('sectionTitle')}>Địa chỉ chi tiết</h3>
                <div className={cx('addressGrid')}>
                    <div className={cx('inputWrapper')}>
                        <label className={cx('label')}>Tỉnh/Thành phố</label>
                        <select
                            name='province'
                            className={cx('select', {
                                errorInput: errors.province
                            })}
                            value={formData.province}
                            onChange={handleInputChange}
                        >
                            <option value=''>Chọn Tỉnh/Thành</option>
                            {PROVINCES.map(p => (
                                <option key={p} value={p}>
                                    {p}
                                </option>
                            ))}
                        </select>
                        {errors.province && (
                            <span className={cx('errorText')}>
                                Vui lòng chọn tỉnh thành
                            </span>
                        )}
                    </div>

                    <div className={cx('inputWrapper')}>
                        <label className={cx('label')}>Quận/Huyện</label>
                        <select
                            name='district'
                            className={cx('select', {
                                errorInput: errors.district
                            })}
                            value={formData.district}
                            onChange={handleInputChange}
                        >
                            <option value=''>Chọn Quận/Huyện</option>
                        </select>
                        {errors.district && (
                            <span className={cx('errorText')}>
                                Vui lòng chọn quận huyện
                            </span>
                        )}
                    </div>

                    <div className={cx('inputWrapper')}>
                        <label className={cx('label')}>Phường/Xã</label>
                        <select
                            name='ward'
                            className={cx('select', {
                                errorInput: errors.ward
                            })}
                            value={formData.ward}
                            onChange={handleInputChange}
                        >
                            <option value=''>Chọn Phường/Xã</option>
                        </select>
                        {errors.ward && (
                            <span className={cx('errorText')}>
                                Vui lòng chọn phường xã
                            </span>
                        )}
                    </div>

                    <div className={cx('inputWrapper')}>
                        <FormGroup
                            label='Số nhà, đường'
                            name='addressDetail'
                            value={formData.addressDetail}
                            onChange={handleInputChange}
                            placeholder='VD: 123 đường ABC'
                            className={cx('inputCustom', {
                                errorInput: errors.addressDetail
                            })}
                        />
                        {errors.addressDetail && (
                            <span className={cx('errorText')}>
                                Vui lòng nhập địa chỉ
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Step1Info;
