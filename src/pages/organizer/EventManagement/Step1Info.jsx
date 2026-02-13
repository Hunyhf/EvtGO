// src/pages/organizer/EventManagement/Step1Info.jsx
import React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Style của thư viện soạn thảo
import styles from './CreateEvent.module.scss';

const Step1Info = ({ formData, setFormData, errors }) => {
    const handleChange = e => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleEditorChange = value => {
        setFormData(prev => ({ ...prev, description: value }));
    };

    // Cấu hình thanh công cụ cho ReactQuill
    const modules = {
        toolbar: [
            [{ header: [1, 2, 3, false] }],
            ['bold', 'italic', 'underline'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            [{ align: [] }],
            [{ color: [] }, { background: [] }],
            ['link', 'image', 'video'],
            ['clean']
        ]
    };

    return (
        <div className={styles.stepContainer}>
            {/* SECTION: Upload hình ảnh */}
            <div className={styles.section}>
                <h3>Hình ảnh sự kiện</h3>
                <div className={styles.uploadRow}>
                    {/* Poster */}
                    <div className={styles.uploadCard}>
                        <div
                            className={`${styles.uploadBox} ${styles.posterBox} ${errors.poster ? styles.errorBorder : ''}`}
                        >
                            <span className={styles.uploadIcon}>📷</span>
                            <p>Tải ảnh Poster</p>
                            <small>Kích thước: 720x958</small>
                            <input
                                type='file'
                                accept='image/*'
                                className={styles.fileInput}
                            />
                        </div>
                        {errors.poster && (
                            <span className={styles.errorText}>
                                Vui lòng tải lên ảnh đại diện sự kiện
                            </span>
                        )}
                    </div>

                    {/* Background */}
                    <div className={styles.uploadCard}>
                        <div className={`${styles.uploadBox} ${styles.bgBox}`}>
                            <span className={styles.uploadIcon}>🖼️</span>
                            <p>Tải ảnh Background (Tuỳ chọn)</p>
                            <small>Kích thước: 1280x720</small>
                            <input
                                type='file'
                                accept='image/*'
                                className={styles.fileInput}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* SECTION: Form Inputs */}
            <div className={styles.section}>
                <h3>Thông tin cơ bản</h3>

                {/* Tên sự kiện */}
                <div className={styles.formGroup}>
                    <label>
                        Tên sự kiện <span className={styles.required}>*</span>
                    </label>
                    <input
                        type='text'
                        name='name'
                        value={formData.name}
                        onChange={handleChange}
                        maxLength={100}
                        placeholder='Nhập tên sự kiện...'
                        className={errors.name ? styles.inputError : ''}
                    />
                    <div className={styles.inputFooter}>
                        {errors.name ? (
                            <span className={styles.errorText}>
                                {errors.name}
                            </span>
                        ) : (
                            <span></span>
                        )}
                        <span className={styles.counter}>
                            {formData.name.length}/100
                        </span>
                    </div>
                </div>

                {/* Hình thức */}
                <div className={styles.formGroup}>
                    <label>
                        Hình thức tổ chức{' '}
                        <span className={styles.required}>*</span>
                    </label>
                    <div className={styles.radioGroup}>
                        <label>
                            <input
                                type='radio'
                                name='eventType'
                                value='offline'
                                checked={formData.eventType === 'offline'}
                                onChange={handleChange}
                            />
                            Sự kiện Offline
                        </label>
                        <label>
                            <input
                                type='radio'
                                name='eventType'
                                value='online'
                                checked={formData.eventType === 'online'}
                                onChange={handleChange}
                            />
                            Sự kiện Online
                        </label>
                    </div>
                </div>

                {/* Địa chỉ */}
                {formData.eventType === 'offline' && (
                    <div className={styles.addressBlock}>
                        <div className={styles.formGroup}>
                            <label>
                                Tên địa điểm{' '}
                                <span className={styles.required}>*</span>
                            </label>
                            <input
                                type='text'
                                name='locationName'
                                placeholder='VD: Trung tâm hội nghị Quốc Gia...'
                                onChange={handleChange}
                                value={formData.locationName}
                            />
                        </div>
                        <div className={styles.row3}>
                            <div className={styles.formGroup}>
                                <label>
                                    Tỉnh/Thành{' '}
                                    <span className={styles.required}>*</span>
                                </label>
                                <select
                                    name='province'
                                    onChange={handleChange}
                                    value={formData.province}
                                >
                                    <option value=''>Chọn Tỉnh/Thành</option>
                                    <option value='HN'>Hà Nội</option>
                                    <option value='HCM'>TP. Hồ Chí Minh</option>
                                </select>
                            </div>
                            <div className={styles.formGroup}>
                                <label>
                                    Quận/Huyện{' '}
                                    <span className={styles.required}>*</span>
                                </label>
                                <select
                                    name='district'
                                    onChange={handleChange}
                                    value={formData.district}
                                >
                                    <option value=''>Chọn Quận/Huyện</option>
                                </select>
                            </div>
                            <div className={styles.formGroup}>
                                <label>
                                    Phường/Xã{' '}
                                    <span className={styles.required}>*</span>
                                </label>
                                <select
                                    name='ward'
                                    onChange={handleChange}
                                    value={formData.ward}
                                >
                                    <option value=''>Chọn Phường/Xã</option>
                                </select>
                            </div>
                        </div>
                        <div className={styles.formGroup}>
                            <label>
                                Số nhà, đường{' '}
                                <span className={styles.required}>*</span>
                            </label>
                            <input
                                type='text'
                                name='addressDetail'
                                placeholder='Nhập số nhà, tên đường...'
                                onChange={handleChange}
                                value={formData.addressDetail}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* SECTION: Thể loại */}
            <div className={styles.section}>
                <div className={styles.formGroup}>
                    <label>
                        Thể loại sự kiện{' '}
                        <span className={styles.required}>*</span>
                    </label>
                    <select
                        name='genreId'
                        onChange={handleChange}
                        value={formData.genreId}
                        className={errors.genreId ? styles.inputError : ''}
                    >
                        <option value=''>Chọn thể loại</option>
                        <option value='1'>Âm nhạc</option>
                        <option value='2'>Hội thảo</option>
                        <option value='3'>Thể thao</option>
                    </select>
                    {errors.genreId && (
                        <span className={styles.errorText}>
                            {errors.genreId}
                        </span>
                    )}
                </div>
            </div>

            {/* SECTION: Rich Text Editor */}
            <div className={styles.section}>
                <h3>Thông tin chi tiết</h3>
                <div className={styles.editorWrapper}>
                    <ReactQuill
                        theme='snow'
                        value={formData.description}
                        onChange={handleEditorChange}
                        modules={modules}
                        placeholder='Giới thiệu về sự kiện của bạn...'
                    />
                </div>
            </div>
        </div>
    );
};

export default Step1Info;
