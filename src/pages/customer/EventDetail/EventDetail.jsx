// src/pages/customer/EventDetail/EventDetail.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Row,
    Col,
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
import BookingButton from '@components/BookingButton/BookingButton';
import { eventApi } from '@apis/eventApi';
import { ticketApi } from '@apis/ticketApi';
import { getEventImageUrl, getAvatarUrl } from '@utils/imageHelper';
import { AuthContext } from '@contexts/AuthContext';
import AuthModal from '@components/AuthModal/AuthModal';

dayjs.locale('vi');

const cx = classNames.bind(styles);
const { Title, Text } = Typography;
const { Panel } = Collapse;

const TICKET_LABELS = {
    VIP: 'Vé VIP: ',
    STANDARD: 'Vé tiêu chuẩn: '
};

const EventDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useContext(AuthContext);

    const [event, setEvent] = useState(null);
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    const handleGoToBooking = () => {
        if (!isAuthenticated) {
            setIsAuthModalOpen(true);
        } else {
            navigate(`/booking/${id}`);
        }
    };

    useEffect(() => {
        let active = true;

        const fetchDetailData = async () => {
            try {
                setLoading(true);
                const [resEvent, resTicket] = await Promise.all([
                    eventApi.getById(id),
                    ticketApi.getAll({ filter: `event.id:${id}` })
                ]);

                if (active) {
                    const eventData = resEvent?.result || resEvent;
                    setEvent(eventData);

                    const ticketData =
                        resTicket?.result?.content ||
                        resTicket?.data ||
                        resTicket?.result ||
                        [];
                    setTickets(Array.isArray(ticketData) ? ticketData : []);
                }
            } catch (error) {
                if (active) {
                    console.error('Lỗi tải dữ liệu:', error);
                    message.error('Không thể tải thông tin sự kiện hoặc vé');
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        fetchDetailData();
        window.scrollTo(0, 0);

        return () => {
            active = false;
        };
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

    const eventImages = event.urlImage || [];
    const posterUrl = getEventImageUrl(id, eventImages[0]);
    const organizer = event.organizer || event.user || {};
    const organizerName =
        organizer.name ||
        event.organizerName ||
        event.createdBy ||
        'Ban tổ chức';
    const organizerAvatar =
        eventImages.length > 1
            ? getEventImageUrl(id, eventImages[1])
            : getAvatarUrl(organizer.id, organizer.avatar);

    const lowestPrice =
        tickets.length > 0 ? Math.min(...tickets.map(t => t.price || 0)) : 0;

    const startTime = dayjs(
        `${event.startDate} ${event.startTime || '00:00:00'}`
    );
    const endTime = event.endTime
        ? dayjs(`${event.startDate} ${event.endTime}`)
        : null;

    // --- LOGIC TRẠNG THÁI NÚT THEO ORGANIZER & ADMIN ---
    const isPublished = event.isPublished || event.published;
    const isActive = event.isActive || event.active;

    // 1. Đã diễn ra: Cập nhật logic dựa trên thời gian bắt đầu
    // Ngay khi hiện tại vượt quá startTime, isPast sẽ thành true
    const isPast = dayjs().isAfter(startTime);

    // 2. Sắp mở bán: Nếu sự kiện chưa bắt đầu nhưng chưa được Admin duyệt hoặc Organizer chưa kích hoạt
    const isUpcoming = !isPast && (!isPublished || !isActive);

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
                                        <Text strong className={cx('locName')}>
                                            {event.location}
                                        </Text>
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

                                <BookingButton
                                    isPast={isPast}
                                    isUpcoming={isUpcoming}
                                    onClick={handleGoToBooking}
                                    variant='primary'
                                    block
                                    size='large'
                                />
                            </div>
                        </Col>

                        <Col xs={24} lg={15}>
                            <div className={cx('posterContainer')}>
                                <img
                                    src={posterUrl}
                                    alt={event.name}
                                    className={cx('heroPoster')}
                                />
                                {isPast && (
                                    <div className={cx('pastLabel')}>
                                        ĐÃ DIỄN RA
                                    </div>
                                )}
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
                                    ghost
                                    defaultActiveKey={['ticket-list']}
                                    expandIcon={({ isActive }) => (
                                        <RightOutlined
                                            rotate={isActive ? 90 : 0}
                                        />
                                    )}
                                >
                                    <Panel
                                        key='ticket-list'
                                        header={
                                            <div className={cx('panelHeader')}>
                                                <Text strong>
                                                    {startTime.format('HH:mm')}
                                                    {endTime
                                                        ? ` - ${endTime.format('HH:mm')}`
                                                        : ''}
                                                </Text>
                                                <Text>
                                                    Ngày{' '}
                                                    {startTime.format(
                                                        'DD/MM/YYYY'
                                                    )}
                                                </Text>
                                            </div>
                                        }
                                    >
                                        <div className={cx('ticketTiers')}>
                                            {tickets.length > 0 ? (
                                                tickets.map((ticket, idx) => (
                                                    <div
                                                        key={ticket.id || idx}
                                                        className={cx(
                                                            'tierRow'
                                                        )}
                                                    >
                                                        <Text
                                                            className={cx(
                                                                'tierLabel'
                                                            )}
                                                        >
                                                            {TICKET_LABELS[
                                                                ticket
                                                                    .ticketType
                                                            ] ||
                                                                ticket.ticketType ||
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
                                                            <BookingButton
                                                                isPast={isPast}
                                                                isUpcoming={
                                                                    isUpcoming
                                                                }
                                                                onClick={
                                                                    handleGoToBooking
                                                                }
                                                                variant='sub'
                                                                label='Chọn'
                                                                pastLabel='Hết hạn'
                                                                upcomingLabel='Chờ bán'
                                                                size='small'
                                                            />
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
                                        src={organizerAvatar}
                                        alt={organizerName}
                                        className={cx('orgLogo')}
                                    />
                                    <div className={cx('orgMeta')}>
                                        <Title
                                            level={5}
                                            className={cx('orgName')}
                                        >
                                            {organizerName}
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

            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
            />
        </main>
    );
};

export default EventDetail;
