import React, { useEffect, useRef, useContext } from 'react';
import { Modal, Button } from 'antd';
import { AuthContext } from '@contexts/AuthContext';
import { WarningOutlined } from '@ant-design/icons';

const INACTIVITY_LIMIT = 2 * 60 * 60 * 1000; // 2 tiếng (ms)

const InactivityTimeout = () => {
    const { isAuthenticated, logoutContext } = useContext(AuthContext);
    const timerRef = useRef(null);
    const [isModalOpen, setIsModalOpen] = React.useState(false);

    const resetTimer = () => {
        if (timerRef.current) clearTimeout(timerRef.current);

        // Chỉ thiết lập đếm ngược nếu Modal chưa mở
        if (!isModalOpen) {
            timerRef.current = setTimeout(() => {
                if (isAuthenticated) {
                    setIsModalOpen(true);
                }
            }, INACTIVITY_LIMIT);
        }
    };

    // Hàm xử lý khi bấm "Đã hiểu" - Chỉ tắt modal và reset lại bộ đếm 2 tiếng
    const handleStayLoggedIn = () => {
        setIsModalOpen(false);
        resetTimer();
    };

    useEffect(() => {
        if (!isAuthenticated) return;

        // Lắng nghe các sự kiện tương tác của người dùng
        const events = [
            'mousemove',
            'keydown',
            'scroll',
            'click',
            'touchstart'
        ];

        const resetHandler = () => resetTimer();

        events.forEach(event => window.addEventListener(event, resetHandler));

        resetTimer();

        return () => {
            events.forEach(event =>
                window.removeEventListener(event, resetHandler)
            );
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [isAuthenticated, isModalOpen]);

    return (
        <Modal
            title={
                <span>
                    <WarningOutlined
                        style={{ color: '#faad14', marginRight: 8 }}
                    />
                    Thông báo phiên làm việc
                </span>
            }
            open={isModalOpen}
            closable={false} // Không cho phép đóng bằng dấu x để bắt buộc bấm nút
            maskClosable={false} // Không cho phép đóng khi bấm ra ngoài
            footer={[
                <Button key='stay' type='primary' onClick={handleStayLoggedIn}>
                    Đã hiểu
                </Button>
            ]}
        >
            <p>
                Bạn đã không hoạt động trong 2 giờ qua. Hệ thống vừa tạm dừng bộ
                đếm thời gian để đảm bảo an toàn. Vui lòng xác nhận để tiếp tục
                làm việc.
            </p>
        </Modal>
    );
};

export default InactivityTimeout;
