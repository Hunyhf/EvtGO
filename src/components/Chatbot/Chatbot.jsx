// src/components/Chatbot/Chatbot.jsx
import { useState, useEffect, useRef, useContext } from 'react';
import classNames from 'classnames/bind';
import { message as antMessage, Spin } from 'antd';
import {
    MessageOutlined,
    CloseOutlined,
    SendOutlined,
    PictureOutlined,
    RobotOutlined,
    UserOutlined
} from '@ant-design/icons';
import styles from './Chatbot.module.scss';
import { aiApi } from '@apis/aiApi';
import { AuthContext } from '@contexts/AuthContext'; //

const cx = classNames.bind(styles);

function Chatbot() {
    const { user, isAuthenticated } = useContext(AuthContext); // Lấy thông tin user
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            role: 'bot',
            content: 'Chào bạn! Tôi có thể giúp gì cho bạn hôm nay?'
        }
    ]);
    const [input, setInput] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // Logic thay thế UUID: Dùng ID người dùng hoặc Timestamp
    const getSessionId = () => {
        if (isAuthenticated && user?.id) {
            return `user_${user.id}`; // Session theo ID người dùng
        }
        // Nếu là khách, tạo session theo ngày để tạm duy trì trong phiên làm việc
        return `guest_${new Date().getTime()}`;
    };

    const handleSend = async () => {
        if (!input.trim() && !imageFile) return;

        const currentSessionId = getSessionId();
        const userMsg = {
            role: 'user',
            content: input,
            imageUrl: imageFile ? URL.createObjectURL(imageFile) : null
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            let res;
            if (imageFile) {
                res = await aiApi.chatWithImage(
                    input || 'Xem ảnh này',
                    currentSessionId,
                    imageFile
                );
                setImageFile(null);
            } else {
                res = await aiApi.chat({
                    message: input,
                    sessionId: currentSessionId
                });
            }

            const data = res?.result || res?.data || res;
            if (data?.answer) {
                setMessages(prev => [
                    ...prev,
                    { role: 'bot', content: data.answer }
                ]);
            }
        } catch (error) {
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

    // Cuộn xuống cuối
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div className={cx('wrapper')}>
            {isOpen ? (
                <div className={cx('chatWindow')}>
                    <div className={cx('header')}>
                        <div className={cx('title')}>
                            <RobotOutlined /> AI Support
                        </div>
                        <CloseOutlined onClick={() => setIsOpen(false)} />
                    </div>

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
                <div className={cx('badge')} onClick={() => setIsOpen(true)}>
                    <MessageOutlined />
                </div>
            )}
        </div>
    );
}

export default Chatbot;
