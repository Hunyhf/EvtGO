// src/pages/customer/EventDetail/EventDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Cập nhật: Thêm useNavigate
import {
    Row,
    Col,
    Button,
    Space,
    Typography,
    Card,
    Collapse,
    Skeleton,
    message
} from 'antd';
import {
    CalendarOutlined,
    EnvironmentOutlined,
    InfoCircleOutlined,
    TeamOutlined,
    RightOutlined,
    GlobalOutlined,
    ClockCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import classNames from 'classnames/bind';

import styles from './EventDetail.module.scss';
import Nav from '@components/Nav/Nav.jsx';
import { eventApi } from '@apis/eventApi';
import { ticketApi } from '@apis/ticketApi';
import { getEventImageUrl } from '@utils/imageHelper';

dayjs.locale('vi');
const cx = classNames.bind(styles);
const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

const EventDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate(); // Cập nhật: Khởi tạo navigate
    const [event, setEvent] = useState(null);
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);

    // Hàm xử lý chuyển hướng sang trang chọn vé
    const handleGoToBooking = () => {
        navigate(`/booking/${id}`); // Điều hướng đến route /booking/:eventId đã cấu trúc
    };

    useEffect(() => {
        const fetchDetailData = async () => {
            try {
                setLoading(true);
                const [resEvent, resTicket] = await Promise.all([
                    eventApi.getById(id),
                    ticketApi.getAll({ eventId: id })
                ]);

                const eventData = resEvent?.result || resEvent;
                setEvent(eventData);

                const ticketData =
                    resTicket?.result?.content ||
                    resTicket?.data ||
                    resTicket?.result ||
                    [];
                setTickets(Array.isArray(ticketData) ? ticketData : []);
            } catch (error) {
                console.error('Lỗi tải dữ liệu:', error);
                message.error('Không thể tải thông tin sự kiện hoặc vé');
            } finally {
                setLoading(false);
            }
        };
        fetchDetailData();
        window.scrollTo(0, 0);
    }, [id]);

    if (loading)
        return (
            <div className={cx('loadingWrapper')}>
                <Nav />
                <div className={cx('container')}>
                    <Skeleton active paragraph={{ rows: 15 }} />
                </div>
            </div>
        );

    if (!event)
        return <div className={cx('error')}>Không tìm thấy sự kiện.</div>;

    const posterFileName = event.urlImage?.[0];
    const posterUrl = getEventImageUrl(id, posterFileName);

    const logoFileName = event.urlImage?.[1] || event.urlImage?.[0];
    const logoUrl = getEventImageUrl(id, logoFileName);

    const lowestPrice =
        tickets.length > 0 ? Math.min(...tickets.map(t => t.price || 0)) : 0;

    const startTime = dayjs(
        `${event.startDate} ${event.startTime || '00:00:00'}`
    );
    const endTime = event.endTime
        ? dayjs(`${event.startDate} ${event.endTime}`)
        : null;

    return (
        <main className={cx('eventDetail')}>
            <Nav />
            <div className={cx('wrapper')}>
                <section className={cx('hero')}>
                    <Row gutter={[0, 0]} align='stretch'>
                        <Col xs={24} lg={9}>
                            <div className={cx('infoCard')}>
                                <Title level={1} className={cx('eventTitle')}>
                                    {event.name?.toUpperCase()}
                                </Title>

                                <Space
                                    direction='vertical'
                                    size={20}
                                    className={cx('metaList')}
                                >
                                    <div className={cx('metaItem')}>
                                        <CalendarOutlined
                                            className={cx('icon')}
                                        />
                                        <Text className={cx('text')}>
                                            {startTime.format(
                                                'HH:mm - dddd, DD/MM/YYYY'
                                            )}
                                        </Text>
                                    </div>
                                    <div className={cx('metaItem')}>
                                        <EnvironmentOutlined
                                            className={cx('icon')}
                                        />
                                        <div>
                                            <Text
                                                strong
                                                className={cx('locName')}
                                            >
                                                {event.location}
                                            </Text>
                                        </div>
                                    </div>
                                </Space>

                                <div className={cx('priceSection')}>
                                    <Text className={cx('priceLabel')}>
                                        Giá từ
                                    </Text>
                                    <Title
                                        level={2}
                                        className={cx('priceValue')}
                                    >
                                        {new Intl.NumberFormat('vi-VN').format(
                                            lowestPrice
                                        )}{' '}
                                        đ
                                    </Title>
                                </div>

                                {/* Cập nhật: Thêm onClick điều hướng */}
                                <Button
                                    type='primary'
                                    size='large'
                                    block
                                    className={cx('ctaBtn')}
                                    shape='round'
                                    onClick={handleGoToBooking}
                                >
                                    MUA VÉ NGAY
                                </Button>
                            </div>
                        </Col>

                        <Col xs={24} lg={15}>
                            <div className={cx('posterContainer')}>
                                <img
                                    src={posterUrl}
                                    alt={event.name}
                                    className={cx('heroPoster')}
                                />
                            </div>
                        </Col>
                    </Row>
                </section>

                <section className={cx('contentBody')}>
                    <Row gutter={[24, 24]}>
                        <Col xs={24} lg={16}>
                            <Card
                                title={
                                    <Space>
                                        <InfoCircleOutlined
                                            className={cx('cardIcon')}
                                        />
                                        <span>Giới thiệu sự kiện</span>
                                    </Space>
                                }
                                className={cx('detailCard')}
                                bordered={false}
                            >
                                <div
                                    className={cx('description')}
                                    dangerouslySetInnerHTML={{
                                        __html: event.description
                                    }}
                                />
                            </Card>

                            <Card
                                title={
                                    <Space>
                                        <ClockCircleOutlined
                                            className={cx('cardIcon')}
                                        />
                                        <span>Lịch diễn & Vé</span>
                                    </Space>
                                }
                                className={cx('detailCard')}
                                bordered={false}
                            >
                                <Collapse
                                    expandIcon={({ isActive }) => (
                                        <RightOutlined
                                            rotate={isActive ? 90 : 0}
                                        />
                                    )}
                                    className={cx('showtimeCollapse')}
                                    ghost
                                    defaultActiveKey={['ticket-list']}
                                >
                                    <Panel
                                        header={
                                            <div className={cx('panelHeader')}>
                                                <div
                                                    className={cx('timeGroup')}
                                                >
                                                    <Text
                                                        strong
                                                        className={cx('stTime')}
                                                    >
                                                        {startTime.format(
                                                            'HH:mm'
                                                        )}
                                                        {endTime
                                                            ? ` - ${endTime.format('HH:mm')}`
                                                            : ''}
                                                    </Text>
                                                    <Text
                                                        className={cx('stDay')}
                                                    >
                                                        {startTime.format(
                                                            'dddd'
                                                        )}
                                                    </Text>
                                                </div>
                                                <div
                                                    className={cx('dateGroup')}
                                                >
                                                    <Text
                                                        className={cx(
                                                            'stFullDate'
                                                        )}
                                                    >
                                                        Ngày{' '}
                                                        {startTime.format(
                                                            'DD/MM/YYYY'
                                                        )}
                                                    </Text>
                                                </div>
                                            </div>
                                        }
                                        key='ticket-list'
                                    >
                                        <div className={cx('ticketTiers')}>
                                            {tickets.length > 0 ? (
                                                tickets.map((ticket, idx) => (
                                                    <div
                                                        className={cx(
                                                            'tierRow'
                                                        )}
                                                        key={ticket.id || idx}
                                                    >
                                                        <Text
                                                            className={cx(
                                                                'tierLabel'
                                                            )}
                                                        >
                                                            {ticket.name ||
                                                                'Vé tiêu chuẩn'}
                                                        </Text>
                                                        <Space size={16}>
                                                            <Text
                                                                className={cx(
                                                                    'tierPrice'
                                                                )}
                                                            >
                                                                {new Intl.NumberFormat(
                                                                    'vi-VN'
                                                                ).format(
                                                                    ticket.price ||
                                                                        0
                                                                )}{' '}
                                                                đ
                                                            </Text>
                                                            {/* Cập nhật: Thêm onClick điều hướng */}
                                                            <Button
                                                                type='primary'
                                                                ghost
                                                                size='small'
                                                                shape='round'
                                                                className={cx(
                                                                    'buyBtn'
                                                                )}
                                                                onClick={
                                                                    handleGoToBooking
                                                                }
                                                            >
                                                                Chọn
                                                            </Button>
                                                        </Space>
                                                    </div>
                                                ))
                                            ) : (
                                                <Text italic>
                                                    Hiện chưa có thông tin vé
                                                    cho sự kiện này.
                                                </Text>
                                            )}
                                        </div>
                                    </Panel>
                                </Collapse>
                            </Card>
                        </Col>

                        <Col xs={24} lg={8}>
                            <Card
                                title='Ban tổ chức'
                                className={cx('detailCard')}
                                bordered={false}
                            >
                                <div className={cx('organizerInfo')}>
                                    <img
                                        src={logoUrl}
                                        alt='Organizer'
                                        className={cx('orgLogo')}
                                    />
                                    <div className={cx('orgMeta')}>
                                        <Title
                                            level={5}
                                            className={cx('orgName')}
                                        >
                                            {event.organizerName ||
                                                event.createdBy}
                                        </Title>
                                        <Space direction='vertical' size={2}>
                                            <Text className={cx('orgSub')}>
                                                <GlobalOutlined /> evtgo.vn
                                            </Text>
                                            <Text className={cx('orgSub')}>
                                                <TeamOutlined /> 500+ theo dõi
                                            </Text>
                                        </Space>
                                    </div>
                                </div>
                            </Card>
                        </Col>
                    </Row>
                </section>
            </div>
        </main>
    );
};

export default EventDetail;
