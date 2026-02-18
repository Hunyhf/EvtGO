import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    Modal,
    Radio,
    Switch,
    Tag,
    Button,
    Spin,
    Pagination,
    Empty
} from 'antd';
import {
    CalendarOutlined,
    FilterOutlined,
    DownOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import classNames from 'classnames/bind';

import styles from './Genre.module.scss';
import EventCard from '@components/EventCard/EventCard';
import { eventApi } from '@apis/eventApi';
import { genresApi } from '@apis/genresApi';

const cx = classNames.bind(styles);

const BASE_URL_IMAGE = 'http://localhost:8080/api/v1/files';

const LOCATIONS = [
    'Toàn quốc',
    'Hồ Chí Minh',
    'Hà Nội',
    'Đà Lạt',
    'Vị trí khác'
];

function Genre() {
    const [searchParams] = useSearchParams();
    const urlGenreId = searchParams.get('id');
    const urlSearchQuery = searchParams.get('q') || '';

    const [events, setEvents] = useState([]);
    const [genresList, setGenresList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // State quản lý phân trang
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const pageSize = 12;

    const [filters, setFilters] = useState({
        location: 'Toàn quốc',
        genreId: urlGenreId || '',
        isFree: false,
        date: 'Tất cả các ngày'
    });

    const [tempFilters, setTempFilters] = useState({ ...filters });

    // Khi URL thay đổi -> Reset về trang 1
    useEffect(() => {
        if (urlGenreId) {
            setFilters(prev => ({ ...prev, genreId: urlGenreId }));
            setTempFilters(prev => ({ ...prev, genreId: urlGenreId }));
            setCurrentPage(1);
        }
    }, [urlGenreId]);

    // Load danh sách thể loại
    useEffect(() => {
        const loadGenres = async () => {
            const res = await genresApi.getAll();
            setGenresList(
                res?.result || res?.data || (Array.isArray(res) ? res : [])
            );
        };
        loadGenres();
    }, []);

    // Hàm gọi API lấy sự kiện
    const fetchEvents = async () => {
        setLoading(true);
        try {
            // SỬA LỖI TÊN TRƯỜNG ĐỂ KHỚP VỚI EVENT.JAVA
            // Entity: private boolean isActive; private boolean isPublished;
            // Cú pháp filter: FieldName:Value (Boolean không cần nháy đơn)
            let filterString = `isPublished:true and isActive:true`;

            // Lọc theo thể loại (genre.id là số)
            if (filters.genreId) {
                filterString += ` and genre.id:${filters.genreId}`;
            }

            // Lọc theo tên (Tìm kiếm)
            if (urlSearchQuery) {
                filterString += ` and name ~~ '%${urlSearchQuery}%'`;
            }

            // Lọc theo địa điểm
            if (filters.location && filters.location !== 'Toàn quốc') {
                filterString += ` and location ~~ '%${filters.location}%'`;
            }

            console.log('>>> [Genre] Filter String gửi đi:', filterString);

            const params = {
                page: currentPage - 1, // Backend dùng index 0
                size: pageSize,
                filter: filterString
            };

            const res = await eventApi.getAll(params);

            if (res?.meta) {
                setTotalItems(res.meta.total);
            }

            const rawData =
                res?.result ||
                res?.content ||
                res?.data ||
                (Array.isArray(res) ? res : []);

            const mappedRealData = rawData.map(e => {
                const posterObj =
                    e.images?.find(img => img.isCover) || e.images?.[0];
                const startDateObj = dayjs(e.startDate);

                return {
                    ...e,
                    title: e.name,
                    date: startDateObj.isValid()
                        ? startDateObj.format('DD/MM/YYYY')
                        : 'Sắp diễn ra',
                    month: startDateObj.isValid()
                        ? startDateObj.format('MMM').toUpperCase()
                        : 'UP',
                    url: posterObj?.url
                        ? `${BASE_URL_IMAGE}/${posterObj.url}`
                        : 'https://placehold.co/400x600?text=No+Image'
                };
            });

            setEvents(mappedRealData);
        } catch (e) {
            console.error('>>> [Genre] Error:', e);
            setEvents([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, [filters, urlSearchQuery, currentPage]);

    const handleApply = () => {
        setFilters({ ...tempFilters });
        setCurrentPage(1);
        setIsModalOpen(false);
    };

    const handleReset = () => {
        setTempFilters({
            location: 'Toàn quốc',
            genreId: '',
            isFree: false,
            date: 'Tất cả các ngày'
        });
    };

    return (
        <div className={cx('genrePage')}>
            <div className={cx('container')}>
                <div className={cx('toolbar')}>
                    <div className={cx('titleSection')}>
                        <span className={cx('neonText')}>
                            {urlSearchQuery
                                ? `Kết quả tìm kiếm: "${urlSearchQuery}"`
                                : 'Khám phá sự kiện'}
                        </span>
                    </div>

                    <div className={cx('controls')}>
                        <div className={cx('pill')}>
                            <CalendarOutlined />
                            <span>{filters.date}</span>
                            <DownOutlined style={{ fontSize: 10 }} />
                        </div>

                        <div
                            className={cx('pill')}
                            onClick={() => setIsModalOpen(true)}
                        >
                            <FilterOutlined />
                            <span>Bộ lọc</span>
                        </div>

                        {filters.genreId && (
                            <Tag
                                color='cyan'
                                closable
                                onClose={() => {
                                    setFilters(f => ({ ...f, genreId: '' }));
                                    setCurrentPage(1);
                                }}
                                style={{
                                    borderRadius: 20,
                                    padding: '2px 12px'
                                }}
                            >
                                {
                                    genresList.find(
                                        g =>
                                            String(g.id) ===
                                            String(filters.genreId)
                                    )?.name
                                }
                            </Tag>
                        )}
                    </div>
                </div>

                {loading ? (
                    <div
                        className={cx('center')}
                        style={{ padding: '100px 0' }}
                    >
                        <Spin size='large' tip='Đang tìm kiếm sự kiện...' />
                    </div>
                ) : (
                    <>
                        {events.length > 0 ? (
                            <div className={cx('eventsGrid')}>
                                {events.map(event => (
                                    <EventCard key={event.id} data={event} />
                                ))}
                            </div>
                        ) : (
                            <div style={{ padding: '50px 0' }}>
                                <Empty description='Không tìm thấy sự kiện nào phù hợp' />
                            </div>
                        )}

                        {!loading && events.length > 0 && (
                            <div
                                style={{
                                    marginTop: '40px',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    paddingBottom: '40px'
                                }}
                            >
                                <Pagination
                                    current={currentPage}
                                    total={totalItems}
                                    pageSize={pageSize}
                                    onChange={page => {
                                        setCurrentPage(page);
                                        window.scrollTo({
                                            top: 0,
                                            behavior: 'smooth'
                                        });
                                    }}
                                    showSizeChanger={false}
                                />
                            </div>
                        )}
                    </>
                )}
            </div>

            <Modal
                title={<span className={cx('modalTitle')}>Bộ lọc sự kiện</span>}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
                width={500}
                centered
                className={cx('customModal')}
            >
                <div className={cx('modalBody')}>
                    <div className={cx('filterSection')}>
                        <h4>Vị trí</h4>
                        <Radio.Group
                            value={tempFilters.location}
                            onChange={e =>
                                setTempFilters({
                                    ...tempFilters,
                                    location: e.target.value
                                })
                            }
                            className={cx('verticalRadio')}
                        >
                            {LOCATIONS.map(loc => (
                                <Radio key={loc} value={loc}>
                                    {loc}
                                </Radio>
                            ))}
                        </Radio.Group>
                    </div>

                    <div className={cx('filterSection', 'flexBetween')}>
                        <h4>Sự kiện Miễn phí</h4>
                        <Switch
                            checked={tempFilters.isFree}
                            onChange={val =>
                                setTempFilters({ ...tempFilters, isFree: val })
                            }
                        />
                    </div>

                    <div className={cx('filterSection')}>
                        <h4>Thể loại</h4>
                        <div className={cx('chipGroup')}>
                            {genresList.map(genre => (
                                <div
                                    key={genre.id}
                                    className={cx('chip', {
                                        active:
                                            String(tempFilters.genreId) ===
                                            String(genre.id)
                                    })}
                                    onClick={() =>
                                        setTempFilters({
                                            ...tempFilters,
                                            genreId: genre.id
                                        })
                                    }
                                >
                                    {genre.name}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={cx('modalFooter')}>
                        <Button
                            className={cx('btnReset')}
                            onClick={handleReset}
                        >
                            Thiết lập lại
                        </Button>
                        <Button
                            className={cx('btnApply')}
                            onClick={handleApply}
                        >
                            Áp dụng
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

export default Genre;
