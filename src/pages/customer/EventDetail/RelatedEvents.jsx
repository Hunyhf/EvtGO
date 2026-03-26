// src/pages/customer/EventDetail/RelatedEvents.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, Row, Col, Button, Spin } from 'antd';
import { RightOutlined } from '@ant-design/icons';
import classNames from 'classnames/bind';

import styles from './RelatedEvents.module.scss';
import EventCard from '@components/EventCard/EventCard';
import { eventApi } from '@apis/eventApi';
import { ticketApi } from '@apis/ticketApi';
import { getEventImageUrl } from '@utils/imageHelper';
import { slugify } from '@utils/stringUtils';

const cx = classNames.bind(styles);
const { Title } = Typography;

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
                // 1. Lấy danh sách sự kiện liên quan theo genreId
                const res = await eventApi.getAll({
                    filter: `genre.id:${genreId} and isPublished:true`,
                    size: 9
                });

                if (!isMounted) return;

                const rawData =
                    res?.result?.content || res?.data || res?.result || [];

                // Loại bỏ sự kiện hiện tại đang xem
                const filteredData = rawData
                    .filter(event => event.id !== currentEventId)
                    .slice(0, 8);

                // 2. Fetch giá vé STANDARD cho từng sự kiện
                const processedData = await Promise.all(
                    filteredData.map(async event => {
                        let price = 0;
                        try {
                            const ticketRes = await ticketApi.getAll({
                                filter: `event.id:${event.id} and ticketType:'STANDARD'`
                            });
                            const tickets =
                                ticketRes?.result || ticketRes?.content || [];
                            if (tickets.length > 0) {
                                price = tickets[0].price;
                            }
                        } catch (err) {
                            console.error(
                                `Lỗi lấy giá vé cho sự kiện ${event.id}:`,
                                err
                            );
                        }

                        const posterObj =
                            event.images?.find(img => img.isCover) ||
                            event.images?.[0];

                        return {
                            ...event,
                            price: price,
                            poster: getEventImageUrl(event.id, posterObj?.url)
                        };
                    })
                );

                if (isMounted) {
                    setRelatedEvents(processedData);
                }
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

    // CẬP NHẬT TẠI ĐÂY: Chuyển sang dùng slug thay vì query params
    const handleSeeMore = () => {
        if (genreName) {
            navigate(`/genre/${slugify(genreName)}`);
        } else {
            navigate('/genre');
        }
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
                                {/* EventCard đã có logic slug nên link sẽ tự đúng */}
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
                            onClick={handleSeeMore}
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
