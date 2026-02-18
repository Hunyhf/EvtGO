// src/pages/organizer/EventManagement/Step1Info.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import {
    Form,
    Input,
    Select,
    Upload,
    Row,
    Col,
    message,
    Card,
    Typography,
    DatePicker // Đảm bảo đã import DatePicker
} from 'antd';
import { InboxOutlined, PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

import { genresApi } from '@apis/genresApi';

// Helper: Chuyển ảnh sang base64 để preview
const getBase64 = (img, callback) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result));
    reader.readAsDataURL(img);
};

const { Title } = Typography;
const { Option } = Select;
const { Dragger } = Upload;

const Step1Info = ({
    setOnNextAction,
    formData: parentFormData,
    setFormData: setParentFormData,
    nextStep
}) => {
    const [form] = Form.useForm();

    const [categories, setCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(false);
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);

    const [posterUrl, setPosterUrl] = useState(parentFormData?.poster || null);
    const [logoUrl, setLogoUrl] = useState(
        parentFormData?.organizerLogo || null
    );

    // ----------------------------------------------------------------------
    // LOGIC: XỬ LÝ KHI BẤM TIẾP TỤC (Đăng ký vào Parent)
    // ----------------------------------------------------------------------
    useEffect(() => {
        setOnNextAction(() => () => {
            return form
                .validateFields()
                .then(values => {
                    // Normalize dữ liệu: File thực tế từ state cha + Text từ form hiện tại
                    const currentPosterFile = parentFormData.posterFile;
                    const currentLogoFile = parentFormData.logoFile;

                    if (!currentPosterFile && !parentFormData.poster) {
                        message.error('Vui lòng tải lên ảnh nền sự kiện!');
                        throw new Error('Missing poster file');
                    }

                    const imagesArr = [];
                    // Index 0: Poster, Index 1: Logo
                    if (currentPosterFile) imagesArr.push(currentPosterFile);
                    else if (parentFormData.images?.[0])
                        imagesArr.push(parentFormData.images[0]);

                    if (currentLogoFile) imagesArr.push(currentLogoFile);
                    else if (parentFormData.images?.[1])
                        imagesArr.push(parentFormData.images[1]);

                    // Đồng bộ state cha
                    setParentFormData(prev => ({
                        ...prev,
                        ...values,
                        images: imagesArr
                    }));

                    if (nextStep) nextStep();
                    return true;
                })
                .catch(info => {
                    console.error('Validate Failed:', info);
                    return false;
                });
        });
    }, [form, setOnNextAction, setParentFormData, nextStep, parentFormData]);

    // ----------------------------------------------------------------------
    // LOGIC: KHỞI TẠO DỮ LIỆU (Hydration)
    // ----------------------------------------------------------------------
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setLoadingCategories(true);
                const res = await genresApi.getAll();
                const list =
                    res?.result || res?.data || (Array.isArray(res) ? res : []);
                setCategories(list);
            } catch (err) {
                console.error('Lỗi tải danh mục:', err);
            } finally {
                setLoadingCategories(false);
            }

            try {
                const res = await axios.get(
                    'https://provinces.open-api.vn/api/p/'
                );
                setProvinces(res.data);
            } catch (err) {
                console.error('Lỗi tải tỉnh thành:', err);
            }
        };

        fetchInitialData();

        // FIX LỖI: Hydrate permitIssuedAt từ string sang dayjs
        if (parentFormData) {
            const initialValues = {
                ...parentFormData,
                // Chuyển đổi string sang object dayjs cho DatePicker
                permitIssuedAt: parentFormData.permitIssuedAt
                    ? dayjs(parentFormData.permitIssuedAt)
                    : null
            };

            form.setFieldsValue(initialValues);

            if (parentFormData.province)
                handleProvinceChange(parentFormData.province, false);
            if (parentFormData.district)
                handleDistrictChange(parentFormData.district, false);
        }
    }, []);

    // Logic địa lý
    const handleProvinceChange = async (value, resetChildren = true) => {
        if (resetChildren) {
            form.setFieldsValue({ district: undefined, ward: undefined });
            setDistricts([]);
            setWards([]);
        }
        try {
            const res = await axios.get(
                `https://provinces.open-api.vn/api/p/${value}?depth=2`
            );
            setDistricts(res.data.districts);
            if (resetChildren) {
                const province = provinces.find(p => p.code === value);
                setParentFormData(prev => ({
                    ...prev,
                    provinceName: province?.name
                }));
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleDistrictChange = async (value, resetChildren = true) => {
        if (resetChildren) {
            form.setFieldsValue({ ward: undefined });
            setWards([]);
        }
        try {
            const res = await axios.get(
                `https://provinces.open-api.vn/api/d/${value}?depth=2`
            );
            setWards(res.data.wards);
        } catch (error) {
            console.error(error);
        }
    };

    const handleUpload = (file, type) => {
        const isImage = file.type.startsWith('image/');
        if (!isImage) {
            message.error('Bạn chỉ được upload file ảnh!');
            return Upload.LIST_IGNORE;
        }
        if (file.size / 1024 / 1024 >= 5) {
            message.error('Ảnh phải nhỏ hơn 5MB!');
            return Upload.LIST_IGNORE;
        }

        getBase64(file, url => {
            if (type === 'poster') {
                setPosterUrl(url);
                form.setFieldsValue({ poster: url });
                setParentFormData(prev => ({
                    ...prev,
                    posterFile: file,
                    poster: url
                }));
            } else {
                setLogoUrl(url);
                form.setFieldsValue({ organizerLogo: url });
                setParentFormData(prev => ({
                    ...prev,
                    logoFile: file,
                    organizerLogo: url
                }));
            }
        });
        return false;
    };

    return (
        <Form form={form} layout='vertical'>
            {/* ẢNH BÌA */}
            <Card
                style={{
                    marginBottom: 24,
                    background: '#2a2d34',
                    borderColor: '#393f4e'
                }}
            >
                <Form.Item
                    name='poster'
                    rules={[
                        {
                            required: true,
                            message: 'Vui lòng tải lên ảnh nền sự kiện'
                        }
                    ]}
                    style={{ marginBottom: 0 }}
                >
                    <Dragger
                        multiple={false}
                        showUploadList={false}
                        beforeUpload={file => handleUpload(file, 'poster')}
                        style={{
                            background: 'rgba(255,255,255,0.02)',
                            border: '1px dashed #393f4e'
                        }}
                    >
                        {posterUrl ? (
                            <img
                                src={posterUrl}
                                alt='Poster'
                                style={{
                                    maxHeight: 300,
                                    width: '100%',
                                    objectFit: 'cover',
                                    borderRadius: 8
                                }}
                            />
                        ) : (
                            <div
                                style={{ padding: '40px 0', color: '#9ca6b0' }}
                            >
                                <p className='ant-upload-drag-icon'>
                                    <InboxOutlined
                                        style={{
                                            color: '#2dc275',
                                            fontSize: 48
                                        }}
                                    />
                                </p>
                                <p className='ant-upload-text'>
                                    Kéo thả hoặc chọn Ảnh Bìa (Cover)
                                </p>
                            </div>
                        )}
                    </Dragger>
                </Form.Item>
            </Card>

            <Row gutter={24}>
                {/* BTC */}
                <Col span={24} lg={8}>
                    <Card
                        style={{
                            height: '100%',
                            background: '#2a2d34',
                            borderColor: '#393f4e'
                        }}
                    >
                        <Title
                            level={5}
                            style={{ color: '#fff', marginBottom: 20 }}
                        >
                            Ban tổ chức
                        </Title>
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                marginBottom: 20
                            }}
                        >
                            <Form.Item name='organizerLogo' noStyle>
                                <Upload
                                    listType='picture-circle'
                                    showUploadList={false}
                                    beforeUpload={file =>
                                        handleUpload(file, 'logo')
                                    }
                                >
                                    {logoUrl ? (
                                        <img
                                            src={logoUrl}
                                            alt='avatar'
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover',
                                                borderRadius: '50%'
                                            }}
                                        />
                                    ) : (
                                        <div>
                                            <PlusOutlined />
                                            <div style={{ marginTop: 8 }}>
                                                Upload Logo
                                            </div>
                                        </div>
                                    )}
                                </Upload>
                            </Form.Item>
                        </div>
                        <Form.Item
                            name='organizerName'
                            label={
                                <span style={{ color: '#fff' }}>
                                    Tên ban tổ chức
                                </span>
                            }
                            rules={[
                                { required: true, message: 'Nhập tên BTC' }
                            ]}
                        >
                            <Input placeholder='VD: Công ty XYZ' size='large' />
                        </Form.Item>
                    </Card>
                </Col>

                {/* THÔNG TIN SỰ KIỆN */}
                <Col span={24} lg={16}>
                    <Card
                        style={{
                            height: '100%',
                            background: '#2a2d34',
                            borderColor: '#393f4e'
                        }}
                    >
                        <Title
                            level={5}
                            style={{ color: '#fff', marginBottom: 20 }}
                        >
                            Thông tin sự kiện
                        </Title>
                        <Form.Item
                            name='name'
                            label={
                                <span style={{ color: '#fff' }}>
                                    Tên sự kiện
                                </span>
                            }
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng nhập tên sự kiện'
                                }
                            ]}
                        >
                            <Input
                                placeholder='VD: Đại nhạc hội Mùa Hè'
                                size='large'
                            />
                        </Form.Item>

                        {/* GIẤY PHÉP */}
                        <Row gutter={16}>
                            <Col span={8}>
                                <Form.Item
                                    name='permitNumber'
                                    label={
                                        <span style={{ color: '#fff' }}>
                                            Số giấy phép
                                        </span>
                                    }
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Nhập số giấy phép'
                                        }
                                    ]}
                                >
                                    <Input placeholder='Số GP' size='large' />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    name='permitIssuedAt'
                                    label={
                                        <span style={{ color: '#fff' }}>
                                            Ngày cấp
                                        </span>
                                    }
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Chọn ngày cấp'
                                        }
                                    ]}
                                >
                                    <DatePicker
                                        placeholder='Chọn ngày'
                                        size='large'
                                        style={{ width: '100%' }}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    name='permitIssuedBy'
                                    label={
                                        <span style={{ color: '#fff' }}>
                                            Nơi cấp
                                        </span>
                                    }
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Nhập nơi cấp'
                                        }
                                    ]}
                                >
                                    <Input placeholder='Nơi cấp' size='large' />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    name='genreId'
                                    label={
                                        <span style={{ color: '#fff' }}>
                                            Thể loại
                                        </span>
                                    }
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Chọn thể loại'
                                        }
                                    ]}
                                >
                                    <Select
                                        placeholder='Chọn thể loại'
                                        size='large'
                                        allowClear
                                        loading={loadingCategories}
                                    >
                                        {categories.map(c => (
                                            <Option key={c.id} value={c.id}>
                                                {c.name}
                                            </Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name='location'
                                    label={
                                        <span style={{ color: '#fff' }}>
                                            Tên địa điểm
                                        </span>
                                    }
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Nhập tên địa điểm'
                                        }
                                    ]}
                                >
                                    <Input
                                        placeholder='VD: Sân vận động Mỹ Đình'
                                        size='large'
                                    />
                                </Form.Item>
                            </Col>
                        </Row>

                        {/* ĐỊA LÝ */}
                        <Row gutter={16}>
                            <Col span={8}>
                                <Form.Item
                                    name='province'
                                    label={
                                        <span style={{ color: '#fff' }}>
                                            Tỉnh/Thành
                                        </span>
                                    }
                                    rules={[
                                        { required: true, message: 'Chọn Tỉnh' }
                                    ]}
                                >
                                    <Select
                                        placeholder='Tỉnh'
                                        size='large'
                                        onChange={val =>
                                            handleProvinceChange(val)
                                        }
                                        showSearch
                                        filterOption={(input, option) =>
                                            option.children
                                                .toLowerCase()
                                                .indexOf(input.toLowerCase()) >=
                                            0
                                        }
                                    >
                                        {provinces.map(p => (
                                            <Option key={p.code} value={p.code}>
                                                {p.name}
                                            </Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    name='district'
                                    label={
                                        <span style={{ color: '#fff' }}>
                                            Huyện
                                        </span>
                                    }
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Chọn Huyện'
                                        }
                                    ]}
                                >
                                    <Select
                                        placeholder='Huyện'
                                        size='large'
                                        onChange={val =>
                                            handleDistrictChange(val)
                                        }
                                        disabled={!districts.length}
                                        showSearch
                                        filterOption={(input, option) =>
                                            option.children
                                                .toLowerCase()
                                                .indexOf(input.toLowerCase()) >=
                                            0
                                        }
                                    >
                                        {districts.map(d => (
                                            <Option key={d.code} value={d.code}>
                                                {d.name}
                                            </Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    name='ward'
                                    label={
                                        <span style={{ color: '#fff' }}>
                                            Xã
                                        </span>
                                    }
                                    rules={[
                                        { required: true, message: 'Chọn Xã' }
                                    ]}
                                >
                                    <Select
                                        placeholder='Xã'
                                        size='large'
                                        disabled={!wards.length}
                                        showSearch
                                        filterOption={(input, option) =>
                                            option.children
                                                .toLowerCase()
                                                .indexOf(input.toLowerCase()) >=
                                            0
                                        }
                                    >
                                        {wards.map(w => (
                                            <Option key={w.code} value={w.code}>
                                                {w.name}
                                            </Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>

                        <Form.Item
                            name='addressDetail'
                            label={
                                <span style={{ color: '#fff' }}>
                                    Địa chỉ chi tiết
                                </span>
                            }
                            rules={[{ required: true, message: 'Nhập số nhà' }]}
                        >
                            <Input
                                placeholder='VD: Số 123, Đường Nguyễn Huệ'
                                size='large'
                            />
                        </Form.Item>
                    </Card>
                </Col>
            </Row>

            <Card
                style={{
                    marginTop: 24,
                    background: '#2a2d34',
                    borderColor: '#393f4e'
                }}
            >
                <Title level={5} style={{ color: '#fff', marginBottom: 20 }}>
                    Mô tả sự kiện
                </Title>
                <Form.Item
                    name='description'
                    rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
                >
                    <ReactQuill
                        theme='snow'
                        style={{
                            background: '#fff',
                            borderRadius: 8,
                            color: '#000'
                        }}
                    />
                </Form.Item>
            </Card>
        </Form>
    );
};

export default Step1Info;
