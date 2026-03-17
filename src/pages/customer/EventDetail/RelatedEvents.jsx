import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, Row, Col, Button, Spin, Empty } from 'antd';
import { RightOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import classNames from 'classnames/bind';

import styles from './RelatedEvents.module.scss';
import EventCard from '@components/EventCard/EventCard';
import { eventApi } from '@apis/eventApi';
import { getEventImageUrl } from '@utils/imageHelper';

const cx = classNames.bind(styles);
const { Title, Text } = Typography;

const RelatedEvents = ({ genreId, currentEventId, genreName }) => {
    console.log('Check Props:', { genreId, currentEventId });
    const navigate = useNavigate();
    const [relatedEvents, setRelatedEvents] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchRelated = async () => {
            if (!genreId) return;

            try {
                setLoading(true);
                const res = await eventApi.getAll({
                    filter: `genre.id:${genreId}`,
                    size: 20
                });

                const rawData =
                    res?.result?.content || res?.data || res?.result || [];
                console.log('Raw Related Events:', rawData);
                const processedData = rawData
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
                    })
                    .filter(event => {
                        return event.id !== currentEventId; // Chỉ lọc bỏ chính nó
                    })
                    .slice(0, 8);

                setRelatedEvents(processedData);
            } catch (error) {
                console.error('Lỗi tải sự kiện liên quan:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRelated();
    }, [genreId, currentEventId]);

    return (
        <section className={cx('relatedSection')}>
            <div className={cx('header')}>
                <Title level={3} className={cx('title')}>
                    CÓ THỂ BẠN SẼ THÍCH
                </Title>
            </div>

            {loading ? (
                <div className={cx('loadingCenter')}>
                    <Spin
                        size='large'
                        tip='Đang tìm kiếm sự kiện tương tự...'
                    />
                </div>
            ) : relatedEvents.length > 0 ? (
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
                            onClick={() => navigate(`/genre/${genreId}`)}
                        >
                            Xem thêm sự kiện {genreName}
                        </Button>
                    </div>
                </>
            ) : (
                <div className={cx('emptyBox')}>
                    <Text className={cx('emptyText')}>
                        Chưa có sự kiện nào cùng thể loại
                    </Text>
                </div>
            )}
        </section>
    );
};

export default RelatedEvents;
