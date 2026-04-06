import React, { useState, useEffect, useCallback } from 'react';
import {
    Table,
    Space,
    Button,
    Typography,
    Modal,
    Input,
    App,
    Form,
    Skeleton
} from 'antd';
import {
    EditOutlined,
    DeleteOutlined,
    PlusOutlined,
    SearchOutlined,
    ExclamationCircleOutlined
} from '@ant-design/icons';
import classNames from 'classnames/bind';
import debounce from 'lodash/debounce';

import styles from './GenreManagement.module.scss';
import { genresApi } from '@apis/genresApi';

const cx = classNames.bind(styles);
const { Title } = Typography;

function GenreManagementContent() {
    const { message, modal } = App.useApp();
    const [form] = Form.useForm();

    const [genres, setGenres] = useState([]);
    const [loading, setLoading] = useState(false);

    // States cho Add/Edit Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [editingGenre, setEditingGenre] = useState(null);

    const [searchText, setSearchText] = useState('');

    // 1. Lấy danh sách thể loại
    const fetchGenres = async (search = '') => {
        setLoading(true);
        try {
            // Tùy chỉnh params dựa trên backend của bạn (ví dụ search theo tên)
            const params = search ? { name: search } : {};
            const res = await genresApi.getAll(params);
            // Giả định dữ liệu trả về nằm trong res.result hoặc res.data
            setGenres(res?.result || res?.data || res);
        } catch (error) {
            message.error('Không thể tải danh sách thể loại');
        } finally {
            setLoading(false);
        }
    };

    // 2. Xử lý tìm kiếm Debounce
    const debounceSearch = useCallback(
        debounce(nextValue => {
            fetchGenres(nextValue);
        }, 500),
        []
    );

    useEffect(() => {
        fetchGenres();
    }, []);

    const handleSearchChange = e => {
        const value = e.target.value;
        setSearchText(value);
        debounceSearch(value);
    };

    // 3. Mở Modal Thêm/Sửa
    const handleOpenModal = (genre = null) => {
        setEditingGenre(genre);
        if (genre) {
            form.setFieldsValue(genre);
        } else {
            form.resetFields();
        }
        setIsModalOpen(true);
    };

    // 4. Xử lý Lưu (Create/Update)
    const onFinish = async values => {
        setSubmitting(true);
        try {
            if (editingGenre) {
                await genresApi.update({ id: editingGenre.id, ...values });
                message.success('Cập nhật thể loại thành công');
            } else {
                await genresApi.create(values);
                message.success('Thêm thể loại mới thành công');
            }
            setIsModalOpen(false);
            fetchGenres(searchText);
        } catch (error) {
            message.error('Đã xảy ra lỗi khi lưu dữ liệu');
        } finally {
            setSubmitting(false);
        }
    };

    // 5. Xử lý Xóa
    const handleDelete = genre => {
        modal.confirm({
            title: 'Xác nhận xóa thể loại?',
            icon: <ExclamationCircleOutlined />,
            content: `Bạn có chắc chắn muốn xóa thể loại "${genre.name}"?`,
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            async onOk() {
                try {
                    await genresApi.remove(genre.id);
                    message.success('Xóa thể loại thành công');
                    fetchGenres(searchText);
                } catch (error) {
                    message.error('Không thể xóa thể loại này');
                }
            }
        });
    };

    const columns = [
        { title: 'ID', dataIndex: 'id', key: 'id', width: 100 },
        {
            title: 'Tên thể loại',
            dataIndex: 'name',
            key: 'name',
            render: text => <strong style={{ color: '#fff' }}>{text}</strong>
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            key: 'description',
            render: text => (
                <span style={{ color: '#ccc' }}>{text || 'Chưa có mô tả'}</span>
            )
        },
        {
            title: 'Thao tác',
            key: 'actions',
            width: 150,
            render: (_, record) => (
                <Space className={cx('action-btns')}>
                    <Button
                        type='text'
                        icon={<EditOutlined style={{ color: '#2dc275' }} />}
                        onClick={() => handleOpenModal(record)}
                    />
                    <Button
                        type='text'
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(record)}
                    />
                </Space>
            )
        }
    ];

    return (
        <div className={cx('genre-management')}>
            <div className={cx('genre-management__header')}>
                <Title level={3} className={cx('genre-management__title')}>
                    Quản lý thể loại
                </Title>

                <Space size='middle'>
                    <Input
                        placeholder='Tìm kiếm thể loại...'
                        prefix={<SearchOutlined />}
                        value={searchText}
                        onChange={handleSearchChange}
                        style={{ width: 250 }}
                        allowClear
                    />
                    <Button
                        type='primary'
                        icon={<PlusOutlined />}
                        className={cx('btn-primary')}
                        onClick={() => handleOpenModal()}
                    >
                        Thêm thể loại
                    </Button>
                </Space>
            </div>

            <div className={cx('genre-management__container')}>
                <Table
                    className={cx('genre-management__table')}
                    columns={columns}
                    dataSource={genres}
                    rowKey='id'
                    loading={loading}
                    pagination={{
                        pageSize: 10,
                        showTotal: total => (
                            <span style={{ color: '#fff' }}>
                                Tổng cộng {total} thể loại
                            </span>
                        )
                    }}
                />
            </div>

            {/* Modal Thêm/Sửa */}
            <Modal
                title={
                    <span style={{ color: '#fff' }}>
                        {editingGenre
                            ? 'Chỉnh sửa thể loại'
                            : 'Thêm thể loại mới'}
                    </span>
                }
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onOk={() => form.submit()}
                confirmLoading={submitting}
                okText='Lưu'
                cancelText='Hủy'
                className={cx('genre-management__modal')}
            >
                <Form form={form} layout='vertical' onFinish={onFinish}>
                    <Form.Item
                        label={
                            <span style={{ color: '#fff' }}>Tên thể loại</span>
                        }
                        name='name'
                        rules={[
                            {
                                required: true,
                                message: 'Vui lòng nhập tên thể loại'
                            }
                        ]}
                    >
                        <Input placeholder='VD: Nhạc Pop, Rock...' />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}

// Wrap Content bằng App component để sử dụng message/modal của Antd
function GenreManagement() {
    return (
        <App>
            <GenreManagementContent />
        </App>
    );
}

export default GenreManagement;
