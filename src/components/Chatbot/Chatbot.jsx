import { useState, useEffect, useRef, useContext } from 'react';
import classNames from 'classnames/bind';
import { message as antMessage, Spin } from 'antd';
import {
    MessageOutlined,
    CloseOutlined,
    SendOutlined,
    PictureOutlined,
    RobotOutlined
} from '@ant-design/icons';
import styles from './Chatbot.module.scss';
import { aiApi } from '@apis/aiApi';
import { AuthContext } from '@contexts/AuthContext';

const cx = classNames.bind(styles);

// Key lưu session khách (bỏ key lưu chat chung đi)
const GUEST_SESSION_KEY = 'etco_guest_session_id';

function Chatbot() {
    // Lấy thông tin user từ context
    const { user, isAuthenticated } = useContext(AuthContext);

    // State mở/đóng chatbot
    const [isOpen, setIsOpen] = useState(false);

    // Tạo hoặc lấy sessionId (user hoặc guest)
    // Đưa hàm này lên trước để sử dụng cho việc khởi tạo state
    const getSessionId = () => {
        if (isAuthenticated && user?.id) {
            return `user_${user.id}`;
        }

        let guestId = localStorage.getItem(GUEST_SESSION_KEY);
        if (!guestId) {
            guestId = `guest_${new Date().getTime()}`;
            localStorage.setItem(GUEST_SESSION_KEY, guestId);
        }
        return guestId;
    };

    const currentSessionId = getSessionId();

    // Khởi tạo danh sách tin nhắn từ localStorage dựa trên currentSessionId
    const [messages, setMessages] = useState(() => {
        const saved = localStorage.getItem(`chat_history_${currentSessionId}`);
        return saved
            ? JSON.parse(saved)
            : [
                  {
                      role: 'bot',
                      content: 'Chào bạn! Tôi có thể giúp gì cho bạn hôm nay?'
                  }
              ];
    });

    // State nội dung input
    const [input, setInput] = useState('');

    // State lưu file ảnh gửi kèm
    const [imageFile, setImageFile] = useState(null);

    // State loading khi gọi API
    const [isLoading, setIsLoading] = useState(false);

    // Ref để scroll xuống cuối danh sách tin nhắn
    const messagesEndRef = useRef(null);

    // 1. Lưu lịch sử chat vào localStorage mỗi khi messages thay đổi theo Session ID
    useEffect(() => {
        localStorage.setItem(
            `chat_history_${currentSessionId}`,
            JSON.stringify(messages)
        );
    }, [messages, currentSessionId]);

    // 2. Cập nhật lại giao diện khi người dùng Đăng nhập / Đăng xuất
    useEffect(() => {
        const sessionId = getSessionId();
        const saved = localStorage.getItem(`chat_history_${sessionId}`);

        if (saved) {
            setMessages(JSON.parse(saved));
        } else {
            setMessages([
                {
                    role: 'bot',
                    content: 'Chào bạn! Tôi có thể giúp gì cho bạn hôm nay?'
                }
            ]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated, user]);

    // Xử lý gửi tin nhắn (text hoặc kèm ảnh)
    const handleSend = async () => {
        if (!input.trim() && !imageFile) return;

        const userMsg = {
            role: 'user',
            content: input,
            imageUrl: imageFile ? URL.createObjectURL(imageFile) : null
        };

        // Thêm tin nhắn người dùng vào UI
        setMessages(prev => [...prev, userMsg]);

        setInput('');
        setIsLoading(true);

        try {
            let res;

            // Gửi request có ảnh
            if (imageFile) {
                res = await aiApi.chatWithImage(
                    input || 'Xem ảnh này',
                    currentSessionId,
                    imageFile
                );
                setImageFile(null);
            } else {
                // Gửi request text
                res = await aiApi.chat({
                    message: input,
                    sessionId: currentSessionId
                });
            }

            const data = res?.result || res?.data || res;

            // Thêm phản hồi từ bot
            if (data?.answer) {
                setMessages(prev => [
                    ...prev,
                    { role: 'bot', content: data.answer }
                ]);
            }
        } catch (error) {
            // Xử lý lỗi khi gọi AI
            antMessage.error('Kết nối AI thất bại');
            setMessages(prev => [
                ...prev,
                {
                    role: 'bot',
                    content: 'Cảm ơn bạn, tôi đang gặp chút sự cố kỹ thuật.'
                }
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    // Xóa toàn bộ lịch sử chat của phiên hiện tại
    const clearChat = () => {
        localStorage.removeItem(`chat_history_${currentSessionId}`);
        setMessages([
            {
                role: 'bot',
                content: 'Chào bạn! Tôi có thể giúp gì cho bạn hôm nay?'
            }
        ]);
    };

    // Tự động scroll xuống cuối khi có tin nhắn mới
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div className={cx('wrapper')}>
            {isOpen ? (
                <div className={cx('chatWindow')}>
                    {/* Header chatbot */}
                    <div className={cx('header')}>
                        <div className={cx('title')}>
                            <RobotOutlined /> AI Support
                        </div>
                        <CloseOutlined onClick={() => setIsOpen(false)} />
                    </div>

                    {/* Nội dung tin nhắn */}
                    <div className={cx('body')}>
                        {messages.map((msg, idx) => (
                            <div key={idx} className={cx('msgRow', msg.role)}>
                                <div className={cx('msgBox')}>
                                    {msg.imageUrl && (
                                        <img src={msg.imageUrl} alt='preview' />
                                    )}
                                    <div className={cx('text')}>
                                        {msg.content}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {isLoading && <Spin className={cx('loading')} />}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Thanh nhập và gửi tin nhắn */}
                    <div className={cx('footer')}>
                        <label className={cx('actionBtn')}>
                            <PictureOutlined />
                            <input
                                type='file'
                                hidden
                                onChange={e => setImageFile(e.target.files[0])}
                            />
                        </label>
                        <input
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyPress={e => e.key === 'Enter' && handleSend()}
                            placeholder='Hỏi gì đó...'
                        />
                        <SendOutlined
                            className={cx('actionBtn')}
                            onClick={handleSend}
                        />
                    </div>
                </div>
            ) : (
                // Nút mở chatbot
                <div className={cx('badge')} onClick={() => setIsOpen(true)}>
                    <MessageOutlined />
                </div>
            )}
        </div>
    );
}

export default Chatbot;
