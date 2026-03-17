// src/pages/customer/EventDetail/RelatedEvents.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, Row, Col, Button, Spin } from 'antd';
import { RightOutlined } from '@ant-design/icons';
import classNames from 'classnames/bind';

import styles from './RelatedEvents.module.scss';
import EventCard from '@components/EventCard/EventCard';
import { eventApi } from '@apis/eventApi';
import { getEventImageUrl } from '@utils/imageHelper';
import { slugify } from '@utils/stringUtils';
const cx = classNames.bind(styles);
const { Title, Text } = Typography;

const RelatedEvents = ({ genreId, currentEventId, genreName }) => {
    const navigate = useNavigate();
    const [relatedEvents, setRelatedEvents] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let isMounted = true;
        const fetchRelated = async () => {
            if (!genreId) return;

            try {
                setLoading(true);
                // Tối ưu: Chỉ lấy đủ số lượng cần thiết (8 cái + 1 dự phòng nếu trùng id hiện tại)
                const res = await eventApi.getAll({
                    filter: `genre.id:${genreId} and isPublished:true`,
                    size: 9
                });

                if (!isMounted) return;

                const rawData =
                    res?.result?.content || res?.data || res?.result || [];
                const processedData = rawData
                    .filter(event => event.id !== currentEventId)
                    .slice(0, 8)
                    .map(event => {
                        const prices = event.tickets?.map(t => t.price) || [];
                        const lowestPrice =
                            prices.length > 0 ? Math.min(...prices) : 0;
                        const posterObj =
                            event.images?.find(img => img.isCover) ||
                            event.images?.[0];

                        return {
                            ...event,
                            price: lowestPrice,
                            poster: getEventImageUrl(event.id, posterObj?.url)
                        };
                    });

                setRelatedEvents(processedData);
            } catch (error) {
                console.error('Lỗi tải sự kiện liên quan:', error);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchRelated();
        return () => {
            isMounted = false;
        };
    }, [genreId, currentEventId]);

    const handleSeeMore = () => {
        navigate(`/genre?id=${genreId}&name=${slugify(genreName)}`);
    };

    if (!loading && relatedEvents.length === 0) return null;

    return (
        <section className={cx('relatedSection')}>
            <div className={cx('header')}>
                <Title level={3} className={cx('title')}>
                    CÓ THỂ BẠN SẼ THÍCH
                </Title>
            </div>

            {loading ? (
                <div className={cx('loadingCenter')}>
                    <Spin tip='Đang tìm kiếm...' />
                </div>
            ) : (
                <>
                    <Row gutter={[20, 20]} className={cx('grid')}>
                        {relatedEvents.map(item => (
                            <Col xs={24} sm={12} md={8} lg={6} key={item.id}>
                                <EventCard data={item} />
                            </Col>
                        ))}
                    </Row>

                    <div className={cx('footerAction')}>
                        <Button
                            type='primary'
                            ghost
                            size='large'
                            icon={<RightOutlined />}
                            iconPosition='right'
                            onClick={handleSeeMore} // Sử dụng hàm handle mới
                        >
                            Xem thêm sự kiện {genreName}
                        </Button>
                    </div>
                </>
            )}
        </section>
    );
};

export default RelatedEvents;
