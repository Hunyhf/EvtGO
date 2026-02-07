import classNames from 'classnames/bind';
import styles from './user.module.scss';

const cx = classNames.bind(styles);

function Profile() {
    return <div className={cx('wrapper')}></div>;
}

export default Profile;
