import React, { useState } from 'react';
import classNames from 'classnames/bind';
import {
    CalendarOutlined,
    DownOutlined,
    PlusOutlined,
    CopyOutlined,
    CloseOutlined,
    CloudUploadOutlined
} from '@ant-design/icons';
import styles from './Step2Showtimes.module.scss';

const cx = classNames.bind(styles);

const Step2Showtimes = () => {
    const [isEventTimeOpen, setIsEventTimeOpen] = useState(true);
    const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
    const [isFree, setIsFree] = useState(false);

    return (
        <div className={cx('wrapper')}>
            {/* Section 1: Event Time */}
            <div className={cx('card')}>
                <div
                    className={cx('cardHeader')}
                    onClick={() => setIsEventTimeOpen(!isEventTimeOpen)}
                >
                    <h3>Ngày sự kiện</h3>
                    <DownOutlined
                        className={cx('arrow', { rotate: !isEventTimeOpen })}
                    />
                </div>

                {isEventTimeOpen && (
                    <div className={cx('cardBody', 'animateSlide')}>
                        <div className={cx('formRow')}>
                            <div className={cx('formGroup')}>
                                <label>
                                    Thời gian bắt đầu{' '}
                                    <span className={cx('required')}>*</span>
                                </label>
                                <div className={cx('inputIcon')}>
                                    <input type='datetime-local' />
                                    <CalendarOutlined />
                                </div>
                            </div>
                            <div className={cx('formGroup')}>
                                <label>
                                    Thời gian kết thúc{' '}
                                    <span className={cx('required')}>*</span>
                                </label>
                                <div className={cx('inputIcon')}>
                                    <input type='datetime-local' />
                                    <CalendarOutlined />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Section 2: Ticket Type */}
            <div className={cx('card')}>
                <div className={cx('cardHeader')}>
                    <h3>
                        Loại vé <span className={cx('required')}>*</span>
                    </h3>
                    <button className={cx('btnCopy')}>
                        <CopyOutlined /> Copy loại vé từ
                    </button>
                </div>
                <div className={cx('cardBody', 'centerContent')}>
                    <button
                        className={cx('btnCreateTicket')}
                        onClick={() => setIsTicketModalOpen(true)}
                    >
                        <PlusOutlined /> Tạo loại vé mới
                    </button>
                </div>
            </div>

            {/* Section 3: Showtimes Accordion */}
            <div className={cx('accordion')}>
                <div className={cx('accordionHeader')}>
                    <span>Vui lòng nhập thông tin suất diễn</span>
                </div>
                <div className={cx('accordionBody')}>
                    <button className={cx('btnGhost')}>
                        <PlusOutlined /> Tạo suất diễn
                    </button>
                </div>
            </div>

            {/* MODAL: TẠO LOẠI VÉ MỚI */}
            {isTicketModalOpen && (
                <div className={cx('modalOverlay')}>
                    <div className={cx('modalContent')}>
                        <div className={cx('modalHeader')}>
                            <h2>Tạo loại vé mới</h2>
                            <CloseOutlined
                                onClick={() => setIsTicketModalOpen(false)}
                            />
                        </div>

                        <div className={cx('modalBody')}>
                            <div className={cx('formGroup', 'fullWidth')}>
                                <label>
                                    Tên loại vé{' '}
                                    <span className={cx('required')}>*</span>
                                </label>
                                <input
                                    type='text'
                                    placeholder='VD: Vé Phổ thông'
                                    maxLength={50}
                                />
                                <span className={cx('counter')}>0/50</span>
                            </div>

                            <div className={cx('grid4')}>
                                <div className={cx('formGroup')}>
                                    <label>Giá vé</label>
                                    <div className={cx('priceInput')}>
                                        <input
                                            type='number'
                                            disabled={isFree}
                                            placeholder='0'
                                        />
                                        <label className={cx('checkboxLabel')}>
                                            <input
                                                type='checkbox'
                                                onChange={e =>
                                                    setIsFree(e.target.checked)
                                                }
                                            />{' '}
                                            Miễn phí
                                        </label>
                                    </div>
                                </div>
                                <div className={cx('formGroup')}>
                                    <label>
                                        Số lượng vé{' '}
                                        <span className={cx('required')}>
                                            *
                                        </span>
                                    </label>
                                    <input type='number' />
                                </div>
                                <div className={cx('formGroup')}>
                                    <label>Tối thiểu/Đơn</label>
                                    <input type='number' defaultValue={1} />
                                </div>
                                <div className={cx('formGroup')}>
                                    <label>Tối đa/Đơn</label>
                                    <input type='number' defaultValue={10} />
                                </div>
                            </div>

                            <div className={cx('formRow')}>
                                <div className={cx('formGroup')}>
                                    <label>Thời gian bắt đầu bán</label>
                                    <input type='datetime-local' />
                                </div>
                                <div className={cx('formGroup')}>
                                    <label>Thời gian kết thúc bán</label>
                                    <input type='datetime-local' />
                                </div>
                            </div>

                            <div className={cx('splitRow')}>
                                <div className={cx('formGroup', 'flex7')}>
                                    <label>Mô tả</label>
                                    <textarea
                                        placeholder='Nhập mô tả loại vé...'
                                        maxLength={1000}
                                    ></textarea>
                                    <span className={cx('counter')}>
                                        0/1000
                                    </span>
                                </div>
                                <div className={cx('formGroup', 'flex3')}>
                                    <label>Ảnh loại vé</label>
                                    <div className={cx('uploadBox')}>
                                        <CloudUploadOutlined />
                                        <p>Thêm – 1MB</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={cx('modalFooter')}>
                            <button className={cx('btnSave')}>Lưu</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Step2Showtimes;
