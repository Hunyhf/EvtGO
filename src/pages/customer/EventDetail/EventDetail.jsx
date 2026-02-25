import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
    Row,
    Col,
    Button,
    Space,
    Typography,
    Card,
    Collapse,
    Calendar,
    Skeleton,
    message
} from 'antd';
import {
    CalendarOutlined,
    EnvironmentOutlined,
    InfoCircleOutlined,
    TeamOutlined,
    RightOutlined,
    GlobalOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import classNames from 'classnames/bind';

import styles from './EventDetail.module.scss';
import Nav from '@components/Nav/Nav.jsx';
import { eventApi } from '@apis/eventApi';
import { ticketApi } from '@apis/ticketApi'; // Đã thêm import ticketApi
import { getEventImageUrl } from '@utils/imageHelper';

dayjs.locale('vi');
const cx = classNames.bind(styles);
const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

const EventDetail = () => {
    const { id } = useParams();
    const [event, setEvent] = useState(null);
    const [tickets, setTickets] = useState([]); // State lưu danh sách vé
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetailData = async () => {
            try {
                setLoading(true);
                // Gọi song song API lấy chi tiết sự kiện và danh sách vé
                const [resEvent, resTicket] = await Promise.all([
                    eventApi.getById(id),
                    ticketApi.getAll({ eventId: id }) // Truyền tham số eventId để lọc vé theo sự kiện
                ]);

                // Xử lý dữ liệu event
                const eventData = resEvent?.result || resEvent;
                setEvent(eventData);

                // Xử lý dữ liệu ticket
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

    // --- LOGIC XỬ LÝ ẢNH THEO DỮ LIỆU THỰC TẾ ---
    const posterFileName = event.urlImage?.[0];
    const posterUrl = getEventImageUrl(id, posterFileName);

    const logoFileName = event.urlImage?.[1] || event.urlImage?.[0];
    const logoUrl = getEventImageUrl(id, logoFileName);

    // Tính "Giá từ" thấp nhất từ danh sách vé để hiển thị trên banner
    const lowestPrice =
        tickets.length > 0 ? Math.min(...tickets.map(t => t.price || 0)) : 0;

    return (
        <main className={cx('eventDetail')}>
            <Nav />
            <div className={cx('wrapper')}>
                {/* HERO SECTION */}
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
                                            {dayjs(event.startDate).format(
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
                                            <Paragraph
                                                className={cx('address')}
                                                ellipsis={{ rows: 2 }}
                                            >
                                                {event.location}
                                            </Paragraph>
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
                                        )}
                                        đ
                                    </Title>
                                </div>

                                <Button
                                    type='primary'
                                    size='large'
                                    block
                                    className={cx('ctaBtn')}
                                    shape='round'
                                >
                                    CHỌN LỊCH DIỄN
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

                {/* CONTENT SECTION */}
                <section className={cx('contentBody')}>
                    <Row gutter={[24, 24]}>
                        <Col xs={24} lg={16}>
                            <Card
                                title={
                                    <Space>
                                        <InfoCircleOutlined
                                            className={cx('cardIcon')}
                                        />
                                        <span>Giới thiệu</span>
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
                                        <CalendarOutlined
                                            className={cx('cardIcon')}
                                        />
                                        <span>Danh sách vé</span>
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
                                                <Text
                                                    strong
                                                    className={cx('stDate')}
                                                >
                                                    Các loại vé đang mở bán
                                                </Text>
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
                                                                )}
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
                                                            >
                                                                Mua vé ngay
                                                            </Button>
                                                        </Space>
                                                    </div>
                                                ))
                                            ) : (
                                                <Text>
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
                                title='Chọn ngày xem'
                                className={cx('detailCard')}
                                bordered={false}
                            >
                                <Calendar
                                    fullscreen={false}
                                    className={cx('miniCalendar')}
                                    headerRender={() => null}
                                    dateCellRender={value => {
                                        const isEventDay =
                                            value.format('YYYY-MM-DD') ===
                                            event.startDate;
                                        return isEventDay ? (
                                            <div
                                                className={cx(
                                                    'activeDateIndicator'
                                                )}
                                            />
                                        ) : null;
                                    }}
                                />
                            </Card>

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
