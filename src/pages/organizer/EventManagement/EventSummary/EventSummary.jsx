import React, { useState, useEffect, useMemo } from 'react';
import classNames from 'classnames/bind';
import { useParams } from 'react-router-dom';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import styles from './EventSummary.module.scss';

import orderApi from '@apis/orderApi';
import { ticketApi } from '@apis/ticketApi';
import transactionApi from '@apis/transactionApi';

const cx = classNames.bind(styles);

function EventSummary() {
    const { id: eventId } = useParams();

    const [timeFilter, setTimeFilter] = useState('24h');
    const [loading, setLoading] = useState(true);
    const [rawOrders, setRawOrders] = useState([]);
    const [rawTransactions, setRawTransactions] = useState([]);
    const [totalTickets, setTotalTickets] = useState(0);

    useEffect(() => {
        const fetchSummaryData = async () => {
            setLoading(true);
            try {
                const orderFilter = `orderItems.ticket.event.id:${eventId}`;
                const ticketFilter = `event.id:${eventId}`;

                // CHỈ GỌI CÁC API MÀ ORGANIZER CHẮC CHẮN CÓ QUYỀN
                const [ticketResponse, orderResponse, transactionResponse] =
                    await Promise.all([
                        ticketApi.getAll({ size: 1000, filter: ticketFilter }),
                        orderApi.getAllOrders(
                            `size=1000&filter=${orderFilter}`
                        ),
                        transactionApi.getAllTransactions().catch(() => null) // Bỏ qua lỗi nếu bị chặn
                    ]);

                // --- XỬ LÝ ĐƠN HÀNG (Dùng để tính doanh thu) ---
                const orderPayload =
                    orderResponse?.result || orderResponse?.data;
                let orders =
                    orderPayload?.result ||
                    orderPayload?.content ||
                    orderPayload ||
                    [];
                if (!Array.isArray(orders)) orders = [];
                setRawOrders(orders);

                // --- XỬ LÝ VÉ ĐÃ BÁN TỪ BẢNG TICKET ---
                const ticketPayload =
                    ticketResponse?.result || ticketResponse?.data;
                const tickets =
                    ticketPayload?.result ||
                    ticketPayload?.content ||
                    ticketPayload ||
                    [];
                const totalSold = Array.isArray(tickets)
                    ? tickets.reduce(
                          (sum, t) =>
                              sum + (t.sold_quantity ?? t.soldQuantity ?? 0),
                          0
                      )
                    : 0;
                setTotalTickets(totalSold);
            } catch (mainError) {
                console.error('Lỗi khi tải dữ liệu tổng quan:', mainError);
            } finally {
                setLoading(false);
            }
        };

        if (eventId) fetchSummaryData();
    }, [eventId]);

    const { chartData, totalRevenue, totalSoldTicketsCount } = useMemo(() => {
        let calculatedRevenue = 0;
        let calculatedTicketsCount = 0;
        const dataMap = {};

        // Ưu tiên chạy biểu đồ và thống kê theo rawOrders
        const dataSource = rawOrders.length > 0 ? rawOrders : rawTransactions;

        dataSource.forEach(item => {
            const status = (
                item.status ||
                item.transaction_status ||
                item.orderStatus ||
                item.order_status ||
                ''
            ).toUpperCase();

            // Chỉ tính các đơn hàng hoặc giao dịch đã thanh toán thành công
            const isSuccess = ['SUCCESS', 'COMPLETED', '00', 'PAID'].includes(
                status
            );

            if (isSuccess) {
                // 1. Tính doanh thu
                const amount = Number(
                    item.amount || item.totalAmount || item.total_amount || 0
                );
                calculatedRevenue += amount;

                // 2. TÍNH SỐ VÉ ĐÃ BÁN TỪ ORDER ITEMS
                const items = item.orderItems || item.items || [];
                const ticketCountInOrder =
                    items.length > 0
                        ? items.reduce((s, i) => s + (i.quantity || 1), 0)
                        : item.totalQuantity || 1;

                calculatedTicketsCount += ticketCountInOrder;

                // 3. Xử lý gom nhóm dữ liệu theo thời gian để vẽ biểu đồ
                const dateStr =
                    item.createdAt || item.paidAt || item.created_at;
                if (dateStr) {
                    const date = new Date(dateStr);
                    let timeKey, sortVal;

                    if (timeFilter === '24h') {
                        timeKey = `${date.getHours().toString().padStart(2, '0')}:00`;
                        sortVal = date.getHours();
                    } else {
                        timeKey = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;
                        sortVal = date.getTime();
                    }

                    if (!dataMap[timeKey]) {
                        dataMap[timeKey] = {
                            time: timeKey,
                            revenue: 0,
                            tickets: 0,
                            sortVal
                        };
                    }
                    dataMap[timeKey].revenue += amount;
                    dataMap[timeKey].tickets += ticketCountInOrder;
                }
            }
        });

        const formatted = Object.values(dataMap).sort(
            (a, b) => a.sortVal - b.sortVal
        );

        return {
            chartData: formatted,
            totalRevenue: calculatedRevenue,
            totalSoldTicketsCount: calculatedTicketsCount
        };
    }, [rawOrders, rawTransactions, timeFilter]);

    if (loading)
        return (
            <div
                style={{ padding: '50px', textAlign: 'center', color: '#fff' }}
            >
                Đang xử lý dữ liệu...
            </div>
        );

    return (
        <div className={cx('wrapper')}>
            <div className={cx('tabs')}>
                <div className={cx('tab', 'active')}>Doanh thu</div>
            </div>

            <h2 className={cx('sectionTitle')}>Tổng quan sự kiện</h2>
            <div className={cx('cardsContainer')}>
                <div className={cx('statCard')}>
                    <div className={cx('cardLabel')}>Tổng doanh thu</div>
                    <div className={cx('cardValue')}>
                        {totalRevenue.toLocaleString('vi-VN')} ₫
                    </div>
                </div>
                <div className={cx('statCard')}>
                    <div className={cx('cardLabel')}>Số vé đã bán</div>
                    <div className={cx('cardValue')}>
                        {totalSoldTicketsCount} vé
                    </div>
                </div>
                {/* ĐÃ BỎ HẲN THẺ "SỐ VÉ ĐÃ QUÉT" KHỎI GIAO DIỆN */}
            </div>

            <div className={cx('chartSection')}>
                <div className={cx('chartHeader')}>
                    <div className={cx('legend')}>
                        <div className={cx('legendItem')}>
                            <span className={cx('dot', 'dotPurple')}></span>
                            Doanh thu
                        </div>
                        <div className={cx('legendItem')}>
                            <span className={cx('dot', 'dotGreen')}></span>
                            Lượt mua
                        </div>
                    </div>

                    <div className={cx('filters')}>
                        <button
                            className={cx('filterBtn', {
                                active: timeFilter === '24h'
                            })}
                            onClick={() => setTimeFilter('24h')}
                        >
                            24 giờ
                        </button>
                        <button
                            className={cx('filterBtn', {
                                active: timeFilter === '30d'
                            })}
                            onClick={() => setTimeFilter('30d')}
                        >
                            30 ngày
                        </button>
                    </div>
                </div>

                <div className={cx('chartContainer')}>
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width='100%' height={350}>
                            <LineChart
                                data={chartData}
                                margin={{
                                    top: 10,
                                    right: 10,
                                    left: 0,
                                    bottom: 0
                                }}
                            >
                                <CartesianGrid
                                    strokeDasharray='3 3'
                                    vertical={false}
                                    stroke='#333'
                                />
                                <XAxis
                                    dataKey='time'
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9ca6b0', fontSize: 12 }}
                                />
                                <YAxis
                                    yAxisId='left'
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9ca6b0', fontSize: 12 }}
                                    tickFormatter={v =>
                                        v.toLocaleString('vi-VN')
                                    }
                                />
                                <YAxis
                                    yAxisId='right'
                                    orientation='right'
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9ca6b0', fontSize: 12 }}
                                />
                                <Tooltip
                                    formatter={(value, name) => [
                                        name === 'revenue'
                                            ? `${value.toLocaleString('vi-VN')} ₫`
                                            : value,
                                        name === 'revenue'
                                            ? 'Doanh thu'
                                            : 'Số vé/Lượt'
                                    ]}
                                    contentStyle={{
                                        background: '#1a1a1a',
                                        border: '1px solid #333',
                                        borderRadius: '8px',
                                        color: '#fff'
                                    }}
                                />
                                <Line
                                    yAxisId='left'
                                    type='monotone'
                                    dataKey='revenue'
                                    stroke='#8b5cf6'
                                    strokeWidth={3}
                                    dot={{ r: 4, fill: '#8b5cf6' }}
                                />
                                <Line
                                    yAxisId='right'
                                    type='monotone'
                                    dataKey='tickets'
                                    stroke='#2dc275'
                                    strokeWidth={3}
                                    dot={{ r: 4, fill: '#2dc275' }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <p
                            style={{
                                textAlign: 'center',
                                color: '#9ca6b0',
                                marginTop: '50px'
                            }}
                        >
                            Chưa có dữ liệu giao dịch cho sự kiện này.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default EventSummary;
