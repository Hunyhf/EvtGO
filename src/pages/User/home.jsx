import { Link } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './styles.module.scss';
const cx = classNames.bind(styles);

function Home() {
    return <div className={cx('grid', 'home')}></div>;
}

export default Home;
