import classNames from 'classnames/bind';
import styles from './Home.module.scss';
import Nav from '@components/Nav/index.jsx';

const cx = classNames.bind(styles);

function Home() {
    return (
        <div className={cx('home')}>
            <Nav />
        </div>
    );
}

export default Home;
