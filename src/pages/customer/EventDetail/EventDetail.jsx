import React, { useState, useEffect, useContext, useRef, useMemo } from 'react';
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
    ClockCircleOutlined,
    DownOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import classNames from 'classnames/bind';

import styles from './EventDetail.module.scss';
import BookingButton from '@components/BookingButton/BookingButton';
import { eventApi } from '@apis/eventApi';
import { ticketApi } from '@apis/ticketApi';
import { getEventImageUrl, getAvatarUrl } from '@utils/imageHelper';
import { AuthContext } from '@contexts/AuthContext';
import AuthModal from '@components/AuthModal/AuthModal';
import RelatedEvents from './RelatedEvents';
import Nav from '@components/Nav/Nav.jsx';

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
    const [isExpanded, setIsExpanded] = useState(false);
    const [isOverflowing, setIsOverflowing] = useState(false);

    const descriptionRef = useRef(null);

    useEffect(() => {
        document.body.classList.add('is-event-detail');
        return () => {
            document.body.classList.remove('is-event-detail');
        };
    }, []);

    useEffect(() => {
        let isMounted = true;

        const fetchDetailData = async () => {
            try {
                setLoading(true);
                const [resEvent, resTicket] = await Promise.all([
                    eventApi.getById(id),
                    ticketApi.getAll({ filter: `event.id:${id}` })
                ]);

                if (isMounted) {
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
                if (isMounted) {
                    console.error('Lỗi tải dữ liệu:', error);
                    message.error('Không thể tải thông tin sự kiện');
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchDetailData();
        return () => {
            isMounted = false;
        };
    }, [id]);

    useEffect(() => {
        if (!loading && event?.description && descriptionRef.current) {
            const timeout = setTimeout(() => {
                if (descriptionRef.current.scrollHeight > 400) {
                    setIsOverflowing(true);
                } else {
                    setIsOverflowing(false);
                }
            }, 100);
            return () => clearTimeout(timeout);
        }
    }, [event?.description, loading]);

    const derivedData = useMemo(() => {
        if (!event) return null;

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
            tickets.length > 0
                ? Math.min(...tickets.map(t => t.price || 0))
                : 0;
        const isEventSoldOut =
            tickets.length > 0 &&
            tickets.every(t => t.ticketStatus?.toUpperCase() === 'SOLD_OUT');

        const startTime = dayjs(
            `${event.startDate} ${event.startTime || '00:00:00'}`
        );
        const endTime = event.endTime
            ? dayjs(`${event.startDate} ${event.endTime}`)
            : null;

        const isPublished = event.isPublished || event.published;
        const isActive = event.isActive || event.active;
        const isPast = dayjs().isAfter(startTime);
        const isUpcoming = !isPast && (!isPublished || !isActive);

        return {
            posterUrl,
            organizerName,
            organizerAvatar,
            lowestPrice,
            isEventSoldOut,
            startTime,
            endTime,
            isPast,
            isUpcoming
        };
    }, [event, tickets, id]);

    const handleGoToBooking = () => {
        if (!isAuthenticated) {
            setIsAuthModalOpen(true);
        } else {
            navigate(`/booking/${id}`);
        }
    };

    if (loading)
        return (
            <div className={cx('eventDetail', 'loadingState')}>
                <Nav />
                <div className={cx('wrapper')}>
                    <section className={cx('hero')}>
                        <Row gutter={[24, 0]}>
                            <Col lg={9} xs={24}>
                                <Skeleton
                                    active
                                    title={{ width: '80%' }}
                                    paragraph={{ rows: 6 }}
                                />
                            </Col>
                            <Col lg={15} xs={24}>
                                <Skeleton.Button
                                    active
                                    block
                                    style={{ height: 450, borderRadius: 12 }}
                                />
                            </Col>
                        </Row>
                    </section>
                    <div style={{ marginTop: 40 }}>
                        <Skeleton active paragraph={{ rows: 8 }} />
                    </div>
                </div>
            </div>
        );

    if (!event || !derivedData)
        return <div className={cx('error')}>Không tìm thấy sự kiện.</div>;

    const {
        posterUrl,
        organizerName,
        organizerAvatar,
        lowestPrice,
        isEventSoldOut,
        startTime,
        endTime,
        isPast,
        isUpcoming
    } = derivedData;

    return (
        <div className={cx('eventDetail', 'fadeIn')}>
            <Nav />
            <div className={cx('wrapper')}>
                <section className={cx('hero')}>
                    <Row gutter={[0, 0]} align='stretch'>
                        <Col
                            xs={{ span: 24, order: 2 }}
                            lg={{ span: 9, order: 1 }}
                        >
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
                                            {startTime.format('HH:mm')}
                                            {endTime
                                                ? ` - ${endTime.format('HH:mm')}`
                                                : ''}
                                            {` | ${startTime.format('dddd, DD/MM/YYYY')}`}
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
                                    isSoldOut={isEventSoldOut}
                                    onClick={handleGoToBooking}
                                    variant='primary'
                                    block
                                    size='large'
                                    soldOutLabel='HẾT VÉ'
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
                                    ref={descriptionRef}
                                    className={cx(
                                        'descriptionWrapper',
                                        isOverflowing &&
                                            (isExpanded
                                                ? 'expanded'
                                                : 'collapsed')
                                    )}
                                >
                                    <div
                                        className={cx('description')}
                                        dangerouslySetInnerHTML={{
                                            __html: event.description
                                        }}
                                    />
                                </div>

                                {isOverflowing && (
                                    <div
                                        className={cx('showMoreBtn')}
                                        onClick={() =>
                                            setIsExpanded(!isExpanded)
                                        }
                                    >
                                        <span>
                                            {isExpanded
                                                ? 'Thu gọn'
                                                : 'Xem thêm'}
                                        </span>
                                        <DownOutlined
                                            className={cx('arrowIcon', {
                                                rotated: isExpanded
                                            })}
                                        />
                                    </div>
                                )}
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
                                                    :{' '}
                                                </Text>
                                                <Text>
                                                    {' '}
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
                                                                isSoldOut={
                                                                    ticket.ticketStatus?.toUpperCase() ===
                                                                    'SOLD_OUT'
                                                                }
                                                                onClick={
                                                                    handleGoToBooking
                                                                }
                                                                variant='sub'
                                                                label='Chọn'
                                                                pastLabel='Hết hạn'
                                                                upcomingLabel='Chờ bán'
                                                                soldOutLabel='Hết vé'
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

                <RelatedEvents
                    genreId={event.genre?.id}
                    currentEventId={Number(id)}
                    genreName={event.genre?.name}
                />
            </div>

            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
            />
        </div>
    );
};

export default EventDetail;
