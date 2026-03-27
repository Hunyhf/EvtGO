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

const cx = classNames.bind(styles);

function EventSummary() {
    const { id: eventId } = useParams();

    const [timeFilter, setTimeFilter] = useState('24h');
    const [loading, setLoading] = useState(true);
    const [rawOrders, setRawOrders] = useState([]);
    const [totalTickets, setTotalTickets] = useState(0);

    // 1. Fetch dữ liệu thô từ API
    useEffect(() => {
        const fetchSummaryData = async () => {
            setLoading(true);
            try {
                // Chạy song song 2 API để tối ưu tốc độ
                const [ticketResponse, orderResponse] = await Promise.all([
                    ticketApi.getAll({ eventId: eventId }),
                    orderApi.getAllOrders(`size=1000&eventId=${eventId}`)
                ]);

                // Xử lý tổng vé từ Ticket API (Thẻ tổng quan)
                const tickets =
                    ticketResponse?.result ||
                    ticketResponse?.data?.result ||
                    [];
                const totalSold = Array.isArray(tickets)
                    ? tickets.reduce(
                          (sum, t) =>
                              sum + (t.sold_quantity ?? t.soldQuantity ?? 0),
                          0
                      )
                    : 0;
                setTotalTickets(totalSold);

                // Lưu danh sách đơn hàng để xử lý biểu đồ
                setRawOrders(
                    orderResponse?.result || orderResponse?.data?.result || []
                );
            } catch (error) {
                console.error('Lỗi khi tải dữ liệu tổng quan:', error);
            } finally {
                setLoading(false);
            }
        };

        if (eventId) fetchSummaryData();
    }, [eventId]);

    // 2. Xử lý dữ liệu biểu đồ (Dùng useMemo để tránh tính toán lại khi re-render)
    const { chartData, totalRevenue } = useMemo(() => {
        let calculatedRevenue = 0;
        const dataMap = {};

        rawOrders.forEach(order => {
            const status = (
                order.order_status ||
                order.orderStatus ||
                order.status ||
                ''
            ).toUpperCase();

            // Chỉ tính các đơn hàng đã thanh toán thành công
            if (status === 'PAID' || status === 'COMPLETED') {
                const orderTotal = order.total_amount || order.totalAmount || 0;
                calculatedRevenue += orderTotal;

                // --- FIX LỖI HIỂN THỊ SAI SỐ VÉ ---
                // Backend ResOrderDTO trả về trường là 'items'
                const items =
                    order.items || order.orderItems || order.order_items;

                // Tính tổng quantity của tất cả items trong đơn hàng (ví dụ: 1 Standard + 1 VIP = 2 vé)
                const orderTicketsCount =
                    Array.isArray(items) && items.length > 0
                        ? items.reduce(
                              (s, i) => s + (Number(i.quantity) || 1),
                              0
                          )
                        : Number(
                              order.totalQuantity || order.total_quantity || 1
                          );

                const createdAt = order.created_at || order.createdAt;
                if (createdAt) {
                    const date = new Date(createdAt);
                    let timeKey;
                    let sortVal;

                    if (timeFilter === '24h') {
                        timeKey = `${date.getHours().toString().padStart(2, '0')}:00`;
                        sortVal = date.getHours();
                    } else {
                        timeKey = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;
                        sortVal = date.getTime(); // Sort theo timestamp cho chính xác
                    }

                    if (!dataMap[timeKey]) {
                        dataMap[timeKey] = {
                            time: timeKey,
                            revenue: 0,
                            tickets: 0,
                            sortVal
                        };
                    }
                    dataMap[timeKey].revenue += orderTotal;
                    dataMap[timeKey].tickets += orderTicketsCount;
                }
            }
        });

        // Chuyển object sang array và sắp xếp
        const formatted = Object.values(dataMap).sort(
            (a, b) => a.sortVal - b.sortVal
        );
        return { chartData: formatted, totalRevenue: calculatedRevenue };
    }, [rawOrders, timeFilter]);

    if (loading)
        return (
            <div style={{ padding: '20px', textAlign: 'center' }}>
                Đang xử lý dữ liệu...
            </div>
        );

    return (
        <div className={cx('wrapper')}>
            <div className={cx('tabs')}>
                <div className={cx('tab', 'active')}>Doanh thu</div>
            </div>

            <h2 className={cx('sectionTitle')}>Tổng quan</h2>
            <div className={cx('cardsContainer')}>
                <div className={cx('statCard')}>
                    <div className={cx('cardLabel')}>Tổng doanh thu</div>
                    <div className={cx('cardValue')}>
                        {totalRevenue.toLocaleString('vi-VN')} ₫
                    </div>
                </div>
                <div className={cx('statCard')}>
                    <div className={cx('cardLabel')}>Số vé đã bán</div>
                    <div className={cx('cardValue')}>{totalTickets} vé</div>
                </div>
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
                            Số vé bán
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
                                    left: -20,
                                    bottom: 0
                                }}
                            >
                                <CartesianGrid
                                    strokeDasharray='3 3'
                                    vertical={false}
                                    stroke='#f0f0f0'
                                />
                                <XAxis
                                    dataKey='time'
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9ca6b0', fontSize: 12 }}
                                    dy={10}
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
                                            : 'Số vé'
                                    ]}
                                    contentStyle={{
                                        borderRadius: '8px',
                                        border: 'none',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                    }}
                                />
                                <Line
                                    yAxisId='left'
                                    type='monotone'
                                    dataKey='revenue'
                                    stroke='#8b5cf6'
                                    strokeWidth={3}
                                    dot={{ r: 4 }}
                                />
                                <Line
                                    yAxisId='right'
                                    type='monotone'
                                    dataKey='tickets'
                                    stroke='#2dc275'
                                    strokeWidth={3}
                                    dot={{ r: 4 }}
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
