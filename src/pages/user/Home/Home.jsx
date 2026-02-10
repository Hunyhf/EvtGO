import classNames from 'classnames/bind';
import styles from './Home.module.scss';
import Nav from '@components/Nav/Nav.jsx';

const cx = classNames.bind(styles);

function Home() {
    return (
        <div className={cx('home')}>
            <Nav />
        </div>
    );
}

export default Home;
