import React, { useState } from 'react';
import classNames from 'classnames/bind';
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

const cx = classNames.bind(styles);

// Mock data cho biểu đồ
const chartData = [
    { time: '00:00', revenue: 4000000, tickets: 24 },
    { time: '04:00', revenue: 3000000, tickets: 13 },
    { time: '08:00', revenue: 2000000, tickets: 38 },
    { time: '12:00', revenue: 2780000, tickets: 39 },
    { time: '16:00', revenue: 1890000, tickets: 48 },
    { time: '20:00', revenue: 2390000, tickets: 38 },
    { time: '24:00', revenue: 3490000, tickets: 43 }
];

function EventSummary() {
    const [timeFilter, setTimeFilter] = useState('24h');

    return (
        <div className={cx('wrapper')}>
            {/* Section: Doanh Thu (Tab) */}
            <div className={cx('tabs')}>
                <div className={cx('tab', 'active')}>Doanh thu</div>
                <div className={cx('tab')}>Lượt truy cập</div>
            </div>

            {/* Section: Tổng quan (Cards) */}
            <h2 className={cx('sectionTitle')}>Tổng quan</h2>
            <div className={cx('cardsContainer')}>
                <div className={cx('statCard')}>
                    <div className={cx('cardLabel')}>Tổng doanh thu</div>
                    <div className={cx('cardValue')}>125.500.000 ₫</div>
                </div>
                <div className={cx('statCard')}>
                    <div className={cx('cardLabel')}>Số vé đã bán</div>
                    <div className={cx('cardValue')}>842 vé</div>
                </div>
            </div>

            {/* Section: Biểu đồ (Legend & Filters) */}
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

                {/* Line Chart */}
                <div className={cx('chartContainer')}>
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
                            />
                            <YAxis
                                yAxisId='right'
                                orientation='right'
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#9ca6b0', fontSize: 12 }}
                            />
                            <Tooltip
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
                                activeDot={{ r: 6 }}
                            />
                            <Line
                                yAxisId='right'
                                type='monotone'
                                dataKey='tickets'
                                stroke='#2dc275'
                                strokeWidth={3}
                                dot={{ r: 4 }}
                                activeDot={{ r: 6 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}

export default EventSummary;
