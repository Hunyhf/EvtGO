import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
import { getEventImageUrl, getAvatarUrl } from '@utils/imageHelper';
import { AuthContext } from '@contexts/AuthContext';
import AuthModal from '@components/AuthModal/AuthModal';

dayjs.locale('vi');

const cx = classNames.bind(styles);
const { Title, Text } = Typography;
const { Panel } = Collapse;

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
        // 1. Tạo biến cờ để kiểm tra xem component có còn xem ID này không
        let active = true;

        const fetchDetailData = async () => {
            try {
                setLoading(true);

                // 2. QUAN TRỌNG: Reset state về rỗng ngay lập tức khi ID thay đổi
                // Điều này đảm bảo dữ liệu của event cũ không bị hiển thị đè lên event mới
                setEvent(null);
                setTickets([]);

                const [resEvent, resTicket] = await Promise.all([
                    eventApi.getById(id),
                    ticketApi.getAll({ eventId: id })
                ]);

                // 3. Chỉ cập nhật state nếu kết quả trả về vẫn thuộc về ID hiện tại
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

        // 4. Cleanup function: Chạy khi ID thay đổi hoặc component bị gỡ bỏ
        return () => {
            active = false;
        };
    }, [id]); // Luôn chạy lại mỗi khi id trên URL thay đổi

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

    // --- XỬ LÝ HÌNH ẢNH ---
    const eventImages = event.urlImage || [];

    // Ảnh bìa mặc định là ảnh đầu tiên (index 0)
    const posterUrl = getEventImageUrl(id, eventImages[0]);

    // Thông tin nhà tổ chức từ User tạo event
    const organizer = event.organizer || event.user || {};
    const organizerName =
        organizer.name ||
        event.organizerName ||
        event.createdBy ||
        'Ban tổ chức';

    /**
     * LOGIC HIỂN THỊ LOGO BAN TỔ CHỨC:
     * Ưu tiên lấy ảnh thứ 2 (index 1) trong mảng ảnh của sự kiện (đây là ảnh logo được upload ở Step 1).
     * Nếu không có ảnh thứ 2, hệ thống sẽ fallback về ảnh đại diện (avatar) của tài khoản BTC.
     */
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
    const isPast = endTime
        ? dayjs().isAfter(endTime)
        : dayjs().isAfter(startTime.endOf('day'));

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

                                <Button
                                    type={isPast ? 'default' : 'primary'}
                                    size='large'
                                    block
                                    shape='round'
                                    className={cx('ctaBtn', {
                                        isPastBtn: isPast
                                    })}
                                    onClick={handleGoToBooking}
                                    disabled={isPast}
                                >
                                    {isPast ? 'ĐÃ DIỄN RA' : 'MUA VÉ NGAY'}
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
                                                                disabled={
                                                                    isPast
                                                                }
                                                            >
                                                                {isPast
                                                                    ? 'Hết hạn'
                                                                    : 'Chọn'}
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
