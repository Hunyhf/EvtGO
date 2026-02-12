import React from 'react';
import { Card, Statistic, Skeleton } from 'antd';
import classNames from 'classnames/bind';
import styles from './StatCard.module.scss';

const cx = classNames.bind(styles);

const StatCard = ({ title, value, icon, loading, suffix, color }) => {
    return (
        <Card className={cx('stat-card')} bordered={false}>
            <Skeleton loading={loading} active paragraph={{ rows: 1 }}>
                <div className={cx('stat-card__content')}>
                    <div
                        className={cx('stat-card__icon')}
                        style={{ backgroundColor: `${color}15`, color: color }}
                    >
                        {icon}
                    </div>
                    <Statistic
                        title={
                            <span className={cx('stat-card__title')}>
                                {title}
                            </span>
                        }
                        value={value}
                        suffix={suffix}
                    />
                </div>
            </Skeleton>
        </Card>
    );
};

export default StatCard;
