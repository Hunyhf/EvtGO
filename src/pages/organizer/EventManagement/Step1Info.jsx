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
    Typography
} from 'antd';
import { InboxOutlined, PlusOutlined } from '@ant-design/icons';

import { genresApi } from '@apis/genresApi';

// Cấu hình upload (giả lập preview)
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

    // State dữ liệu danh mục & địa lý
    const [categories, setCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(false); // ADD: Loading state
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);

    // State hiển thị ảnh preview
    const [posterUrl, setPosterUrl] = useState(parentFormData?.poster || null);
    const [logoUrl, setLogoUrl] = useState(
        parentFormData?.organizerLogo || null
    );

    // ----------------------------------------------------------------------
    // LOGIC QUAN TRỌNG: XỬ LÝ KHI BẤM NEXT
    // ----------------------------------------------------------------------
    useEffect(() => {
        setOnNextAction(() => () => {
            return form
                .validateFields()
                .then(values => {
                    console.log('Step 1 Validated:', values);

                    // 1. Lấy file thực tế từ parentFormData
                    const currentPosterFile = parentFormData.posterFile;
                    const currentLogoFile = parentFormData.logoFile;

                    // 2. Validate thủ công: Bắt buộc phải có file ảnh
                    if (!currentPosterFile && !parentFormData.poster) {
                        message.error('Vui lòng tải lên ảnh nền sự kiện!');
                        throw new Error('Missing poster file');
                    }

                    // 3. TẠO MẢNG IMAGES THEO ĐÚNG THỨ TỰ YÊU CẦU
                    // Index 0: Poster, Index 1: Logo
                    const imagesArr = [];

                    if (currentPosterFile) {
                        imagesArr.push(currentPosterFile);
                    } else if (parentFormData.images?.[0]) {
                        imagesArr.push(parentFormData.images[0]);
                    }

                    if (currentLogoFile) {
                        imagesArr.push(currentLogoFile);
                    } else if (parentFormData.images?.[1]) {
                        imagesArr.push(parentFormData.images[1]);
                    }

                    // 4. Cập nhật vào State cha
                    setParentFormData(prev => ({
                        ...prev,
                        ...values,
                        images: imagesArr
                    }));

                    // 5. Chuyển bước
                    if (nextStep) nextStep();
                    return true;
                })
                .catch(info => {
                    console.error('Validate Failed:', info);
                });
        });
    }, [form, setOnNextAction, setParentFormData, nextStep, parentFormData]);

    // Load dữ liệu ban đầu
    useEffect(() => {
        const fetchInitialData = async () => {
            // 1. Load Genres (Có try/catch và loading)
            try {
                setLoadingCategories(true);
                const res = await genresApi.getAll(); // Gọi qua object genresApi
                const list =
                    res?.result || res?.data || (Array.isArray(res) ? res : []);
                setCategories(list);
            } catch (err) {
                console.error('Lỗi tải danh mục:', err);
                message.error('Không thể tải danh sách thể loại');
            } finally {
                setLoadingCategories(false);
            }

            // 2. Load Tỉnh/Thành
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

        // Fill dữ liệu cũ nếu quay lại bước này
        if (parentFormData) {
            form.setFieldsValue(parentFormData);
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

            // Lưu tên tỉnh để hiển thị nếu cần
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

    // Logic Upload
    const handleUpload = (file, type) => {
        const isImage = file.type.startsWith('image/');
        if (!isImage) {
            message.error('Bạn chỉ được upload file ảnh!');
            return Upload.LIST_IGNORE;
        }

        // ADD: Validate kích thước ảnh (VD: < 5MB)
        const isLt5M = file.size / 1024 / 1024 < 5;
        if (!isLt5M) {
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

    const quillModules = {
        toolbar: [
            [{ header: [1, 2, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            ['link', 'clean']
        ]
    };

    return (
        <Form form={form} layout='vertical' initialValues={parentFormData}>
            {/* --- 1. ẢNH BÌA --- */}
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
                            message: 'Vui lòng tải lên ảnh nền sự kiện (Cover)'
                        }
                    ]}
                    style={{ marginBottom: 0 }}
                >
                    <Dragger
                        name='file'
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
                                <p className='ant-upload-hint'>
                                    Kích thước: 1280x720 (Sẽ được đặt làm ảnh
                                    đại diện sự kiện)
                                </p>
                            </div>
                        )}
                    </Dragger>
                </Form.Item>
            </Card>

            {/* --- 2. THÔNG TIN & LOGO --- */}
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
                                flexDirection: 'column',
                                alignItems: 'center',
                                marginBottom: 20
                            }}
                        >
                            <Form.Item name='organizerLogo' noStyle>
                                <Upload
                                    name='avatar'
                                    listType='picture-circle'
                                    className='avatar-uploader'
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
                                        loading={loadingCategories} // ADD: Loading state
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

                        {/* Địa lý */}
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
                                        {
                                            required: true,
                                            message: 'Chọn Tỉnh/Thành'
                                        }
                                    ]}
                                >
                                    <Select
                                        placeholder='Tỉnh/Thành'
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
                                            Quận/Huyện
                                        </span>
                                    }
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Chọn Quận/Huyện'
                                        }
                                    ]}
                                >
                                    <Select
                                        placeholder='Quận/Huyện'
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
                                            Phường/Xã
                                        </span>
                                    }
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Chọn Phường/Xã'
                                        }
                                    ]}
                                >
                                    <Select
                                        placeholder='Phường/Xã'
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
                            rules={[
                                {
                                    required: true,
                                    message: 'Nhập số nhà, tên đường'
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

            {/* --- 3. MÔ TẢ --- */}
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
                    rules={[
                        {
                            required: true,
                            message: 'Vui lòng nhập mô tả sự kiện'
                        }
                    ]}
                >
                    <ReactQuill
                        theme='snow'
                        modules={quillModules}
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
