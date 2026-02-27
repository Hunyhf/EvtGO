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
import { getEventImageUrl } from '@utils/imageHelper';
import { AuthContext } from '@contexts/AuthContext';
import AuthModal from '@components/AuthModal/AuthModal';

dayjs.locale('vi');

const cx = classNames.bind(styles);
const { Title, Text } = Typography;
const { Panel } = Collapse;

const EventDetail = () => {
    // Lấy id sự kiện từ URL
    const { id } = useParams();
    const navigate = useNavigate();

    // Lấy trạng thái đăng nhập từ Context
    const { isAuthenticated } = useContext(AuthContext);

    // State lưu thông tin sự kiện
    const [event, setEvent] = useState(null);

    // State lưu danh sách vé của sự kiện
    const [tickets, setTickets] = useState([]);

    // State loading khi gọi API
    const [loading, setLoading] = useState(true);

    // State điều khiển hiển thị modal đăng nhập
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    /**
     * Xử lý khi người dùng bấm mua vé
     * - Nếu chưa đăng nhập: mở modal đăng nhập
     * - Nếu đã đăng nhập: chuyển sang trang booking
     */
    const handleGoToBooking = () => {
        if (!isAuthenticated) {
            setIsAuthModalOpen(true);
        } else {
            navigate(`/booking/${id}`);
        }
    };

    /**
     * Gọi API lấy thông tin chi tiết sự kiện và danh sách vé
     */
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

    /**
     * Hiển thị skeleton khi đang tải dữ liệu
     */
    if (loading)
        return (
            <div className={cx('loadingWrapper')}>
                <Nav />
                <div className={cx('container')}>
                    <Skeleton active paragraph={{ rows: 15 }} />
                </div>
            </div>
        );

    /**
     * Trường hợp không tìm thấy sự kiện
     */
    if (!event)
        return <div className={cx('error')}>Không tìm thấy sự kiện.</div>;

    // Xử lý hình ảnh poster và logo
    const posterFileName = event.urlImage?.[0];
    const posterUrl = getEventImageUrl(id, posterFileName);

    const logoFileName = event.urlImage?.[1] || event.urlImage?.[0];
    const logoUrl = getEventImageUrl(id, logoFileName);

    // Tính giá vé thấp nhất
    const lowestPrice =
        tickets.length > 0 ? Math.min(...tickets.map(t => t.price || 0)) : 0;

    // Format thời gian bắt đầu và kết thúc
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
                {/* Section Hero: Thông tin chính và Poster */}
                <section className={cx('hero')}>
                    <Row gutter={[0, 0]} align='stretch'>
                        {/* Cột trái: Thông tin sự kiện */}
                        <Col xs={24} lg={9}>
                            <div className={cx('infoCard')}>
                                <Title level={1} className={cx('eventTitle')}>
                                    {event.name?.toUpperCase()}
                                </Title>

                                {/* Thông tin ngày giờ và địa điểm */}
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

                                {/* Giá vé thấp nhất */}
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

                                {/* Nút mua vé */}
                                <Button
                                    type='primary'
                                    size='large'
                                    block
                                    shape='round'
                                    className={cx('ctaBtn')}
                                    onClick={handleGoToBooking}
                                >
                                    MUA VÉ NGAY
                                </Button>
                            </div>
                        </Col>

                        {/* Cột phải: Poster sự kiện */}
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

                {/* Section nội dung chi tiết */}
                <section className={cx('contentBody')}>
                    <Row gutter={[24, 24]}>
                        {/* Cột trái: Giới thiệu & Vé */}
                        <Col xs={24} lg={16}>
                            {/* Giới thiệu sự kiện */}
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

                            {/* Lịch diễn và danh sách vé */}
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

                        {/* Cột phải: Thông tin ban tổ chức */}
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

            {/* Modal đăng nhập khi người dùng chưa xác thực */}
            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
            />
        </main>
    );
};

export default EventDetail;
