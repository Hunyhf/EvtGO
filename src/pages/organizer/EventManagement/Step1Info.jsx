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
    DatePicker
} from 'antd';
import { InboxOutlined, PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { genresApi } from '@apis/genresApi';

const { Title } = Typography;
const { Option } = Select;
const { Dragger } = Upload;

// --- PHẦN THÊM MỚI 1: URL cơ sở để truy cập ảnh từ Backend ---
const IMAGE_BASE_URL = 'http://localhost:8080/storage/events';

const getBase64 = (img, callback) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result));
    reader.readAsDataURL(img);
};

const Step1Info = ({
    setOnNextAction,
    formData: parentFormData,
    setFormData: setParentFormData
}) => {
    const [form] = Form.useForm();
    const [categories, setCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(false);
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);

    const [posterUrl, setPosterUrl] = useState(null);
    const [logoUrl, setLogoUrl] = useState(null);

    // ----------------------------------------------------------------------
    // LOGIC: ĐĂNG KÝ HÀM VALIDATE CHO CHA (CreateEvent) - GIỮ NGUYÊN
    // ----------------------------------------------------------------------
    useEffect(() => {
        setOnNextAction(() => () => async () => {
            try {
                const values = await form.validateFields();
                const currentPoster =
                    parentFormData.posterFile || parentFormData.images?.[0];
                const currentLogo =
                    parentFormData.logoFile || parentFormData.images?.[1];

                if (!posterUrl) {
                    // Kiểm tra qua state posterUrl thay vì parentFormData
                    message.error('Vui lòng tải lên ảnh nền sự kiện!');
                    return false;
                }

                const imagesArr = [];
                if (parentFormData.posterFile)
                    imagesArr.push(parentFormData.posterFile);
                if (parentFormData.logoFile)
                    imagesArr.push(parentFormData.logoFile);

                setParentFormData(prev => ({
                    ...prev,
                    ...values,
                    images: imagesArr
                }));
                return true;
            } catch (error) {
                console.error('Validation Step 1 Failed:', error);
                return false;
            }
        });
        return () => setOnNextAction(null);
    }, [form, parentFormData, setParentFormData, setOnNextAction, posterUrl]);

    // ----------------------------------------------------------------------
    // LOGIC: KHỞI TẠO DỮ LIỆU & LẤY ẢNH TỪ DATA (HYDRATION)
    // ----------------------------------------------------------------------
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setLoadingCategories(true);
                const [genresRes, provRes] = await Promise.all([
                    genresApi.getAll(),
                    axios.get('https://provinces.open-api.vn/api/p/')
                ]);
                setCategories(genresRes?.result || genresRes?.data || []);
                setProvinces(provRes.data);
            } catch (err) {
                console.error('Lỗi tải dữ liệu:', err);
            } finally {
                setLoadingCategories(false);
            }
        };

        fetchInitialData();

        if (parentFormData) {
            form.setFieldsValue({
                ...parentFormData,
                permitIssuedAt: parentFormData.permitIssuedAt
                    ? dayjs(parentFormData.permitIssuedAt)
                    : null
            });

            // --- PHẦN THÊM MỚI 2: Logic xử lý ảnh từ mảng images của Backend ---
            if (parentFormData.images && parentFormData.images.length > 0) {
                // 1. Tìm ảnh Poster (isCover = true) trong mảng images
                const posterData = parentFormData.images.find(
                    img => img.isCover === true
                );
                if (posterData) {
                    const fullUrl = `${IMAGE_BASE_URL}/${parentFormData.id}/${posterData.url}`;
                    setPosterUrl(fullUrl);
                    form.setFieldsValue({ poster: fullUrl }); // Cập nhật form để pass validation
                }

                // 2. Tìm ảnh Logo (Quy ước: ảnh đầu tiên không phải cover)
                const logoData = parentFormData.images.find(
                    img => img.isCover === false
                );
                if (logoData) {
                    const fullUrl = `${IMAGE_BASE_URL}/${parentFormData.id}/${logoData.url}`;
                    setLogoUrl(fullUrl);
                    form.setFieldsValue({ organizerLogo: fullUrl });
                }
            }

            if (parentFormData.province)
                handleProvinceChange(parentFormData.province, false);
            if (parentFormData.district)
                handleDistrictChange(parentFormData.district, false);
        }
    }, [parentFormData]); // Thêm parentFormData vào dependency để cập nhật khi data từ API trả về

    // ----------------------------------------------------------------------
    // CÁC HÀM XỬ LÝ ĐỊA LÝ & UPLOAD - GIỮ NGUYÊN NHƯ CŨ
    // ----------------------------------------------------------------------
    const handleProvinceChange = async (value, resetChildren = true) => {
        const province = provinces.find(p => p.code === value);
        if (resetChildren) {
            form.setFieldsValue({ district: undefined, ward: undefined });
            setDistricts([]);
            setWards([]);
            setParentFormData(prev => ({
                ...prev,
                provinceName: province?.name
            }));
        }
        try {
            const res = await axios.get(
                `https://provinces.open-api.vn/api/p/${value}?depth=2`
            );
            setDistricts(res.data.districts);
        } catch (error) {
            console.error(error);
        }
    };

    const handleDistrictChange = async (value, resetChildren = true) => {
        const district = districts.find(d => d.code === value);
        if (resetChildren) {
            form.setFieldsValue({ ward: undefined });
            setWards([]);
            setParentFormData(prev => ({
                ...prev,
                districtName: district?.name
            }));
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

    const handleWardChange = value => {
        const ward = wards.find(w => w.code === value);
        setParentFormData(prev => ({ ...prev, wardName: ward?.name }));
    };

    const handleUpload = (file, type) => {
        if (!file.type.startsWith('image/')) {
            message.error('Chỉ được upload ảnh!');
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
            {/* --- ẢNH BÌA --- */}
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
                        { required: true, message: 'Vui lòng tải ảnh bìa' }
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
                                <InboxOutlined
                                    style={{ color: '#2dc275', fontSize: 48 }}
                                />
                                <p style={{ marginTop: 16 }}>
                                    Kéo thả hoặc chọn Ảnh Bìa (1280x720)
                                </p>
                            </div>
                        )}
                    </Dragger>
                </Form.Item>
            </Card>

            <Row gutter={24}>
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
                                justifyContent: 'center',
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
                                            alt='logo'
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover',
                                                borderRadius: '50%'
                                            }}
                                        />
                                    ) : (
                                        <PlusOutlined
                                            style={{ color: '#fff' }}
                                        />
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
                                { required: true, message: 'Nhập tên sự kiện' }
                            ]}
                        >
                            <Input
                                placeholder='VD: Đại nhạc hội Mùa Hè'
                                size='large'
                            />
                        </Form.Item>

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
                                            message: 'Nhập số GP'
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
                                        { required: true, message: 'Chọn ngày' }
                                    ]}
                                >
                                    <DatePicker
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
                                    <Input
                                        placeholder='Sở VH-TT'
                                        size='large'
                                    />
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
                                        { required: true, message: 'Chọn tỉnh' }
                                    ]}
                                >
                                    <Select
                                        placeholder='Tỉnh'
                                        size='large'
                                        onChange={handleProvinceChange}
                                        showSearch
                                        filterOption={(input, option) =>
                                            option.children
                                                .toLowerCase()
                                                .includes(input.toLowerCase())
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
                                            Quận/Huyện
                                        </span>
                                    }
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Chọn huyện'
                                        }
                                    ]}
                                >
                                    <Select
                                        placeholder='Huyện'
                                        size='large'
                                        onChange={handleDistrictChange}
                                        disabled={!districts.length}
                                        showSearch
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
                                            Phường/Xã
                                        </span>
                                    }
                                    rules={[
                                        { required: true, message: 'Chọn xã' }
                                    ]}
                                >
                                    <Select
                                        placeholder='Xã'
                                        size='large'
                                        onChange={handleWardChange}
                                        disabled={!wards.length}
                                        showSearch
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
                            rules={[
                                {
                                    required: true,
                                    message: 'Nhập địa chỉ cụ thể'
                                }
                            ]}
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
