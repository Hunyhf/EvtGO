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
import genresApi from '@apis/genresApi';

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

                    // 1. Lấy file thực tế từ parentFormData (đã lưu ở handleUpload)
                    const currentPosterFile = parentFormData.posterFile;
                    const currentLogoFile = parentFormData.logoFile;

                    // 2. Validate thủ công: Bắt buộc phải có file ảnh nếu form đã có URL
                    // (Antd Form chỉ check required của field input, k check file object)
                    if (!currentPosterFile && !parentFormData.poster) {
                        message.error('Vui lòng tải lên ảnh nền sự kiện!');
                        throw new Error('Missing poster file');
                    }

                    // 3. TẠO MẢNG IMAGES THEO ĐÚNG THỨ TỰ YÊU CẦU
                    // Index 0: Poster (Sẽ là Cover)
                    // Index 1: Logo (Ảnh phụ/BTC)
                    const imagesArr = [];

                    if (currentPosterFile) {
                        imagesArr.push(currentPosterFile);
                    } else if (
                        parentFormData.images &&
                        parentFormData.images[0]
                    ) {
                        // Trường hợp edit hoặc back lại, giữ file cũ
                        imagesArr.push(parentFormData.images[0]);
                    }

                    if (currentLogoFile) {
                        imagesArr.push(currentLogoFile);
                    } else if (
                        parentFormData.images &&
                        parentFormData.images[1]
                    ) {
                        imagesArr.push(parentFormData.images[1]);
                    }

                    // 4. Cập nhật vào State cha
                    setParentFormData(prev => ({
                        ...prev,
                        ...values, // Dữ liệu text (tên, mô tả, địa chỉ...)
                        images: imagesArr // Mảng file chuẩn bị upload: [Poster, Logo]
                    }));

                    // 5. Chuyển bước
                    if (nextStep) {
                        nextStep();
                    }
                    return true;
                })
                .catch(info => {
                    console.error('Validate Failed:', info);
                    // message.error đã được gọi ở trên hoặc mặc định của antd
                });
        });
    }, [
        form,
        setOnNextAction,
        setParentFormData,
        nextStep,
        parentFormData.posterFile,
        parentFormData.logoFile
    ]);

    // Load dữ liệu ban đầu
    useEffect(() => {
        // Load Genres
        genresApi
            .getAll()
            .then(res => {
                // Tùy cấu trúc response api của bạn
                const list = res.result || res.data || [];
                setCategories(list);
            })
            .catch(err => console.error(err));

        // Load Tỉnh/Thành (Open API)
        axios
            .get('https://provinces.open-api.vn/api/p/')
            .then(res => setProvinces(res.data))
            .catch(err => console.error(err));

        // Fill dữ liệu cũ nếu quay lại bước này
        if (parentFormData) {
            form.setFieldsValue(parentFormData);
            if (parentFormData.province)
                handleProvinceChange(parentFormData.province, false);
            if (parentFormData.district)
                handleDistrictChange(parentFormData.district, false);
        }
    }, []);

    // Logic địa lý (Provinces/Districts/Wards)
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
            setParentFormData(prev => ({
                ...prev,
                provinceName: res.data.name
            }));
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

    // ----------------------------------------------------------------------
    // LOGIC UPLOAD: LƯU FILE RAW VÀO PARENT FORM DATA NGAY LẬP TỨC
    // ----------------------------------------------------------------------
    const handleUpload = (file, type) => {
        const isImage = file.type.startsWith('image/');
        if (!isImage) {
            message.error('Bạn chỉ được upload file ảnh!');
            return Upload.LIST_IGNORE;
        }

        getBase64(file, url => {
            if (type === 'poster') {
                // 1. Set Preview
                setPosterUrl(url);
                form.setFieldsValue({ poster: url }); // Để pass validate 'required'

                // 2. Lưu file gốc vào state cha (để dùng ở useEffect Next)
                setParentFormData(prev => ({
                    ...prev,
                    posterFile: file,
                    poster: url
                }));
            } else {
                // 1. Set Preview
                setLogoUrl(url);
                form.setFieldsValue({ organizerLogo: url });

                // 2. Lưu file gốc
                setParentFormData(prev => ({
                    ...prev,
                    logoFile: file,
                    organizerLogo: url
                }));
            }
        });
        return false; // Chặn auto upload của antd
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
            {/* --- 1. ẢNH BÌA (POSTER - Index 0) --- */}
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

            {/* --- 2. THÔNG TIN & LOGO (Index 1) --- */}
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
                            name='organizerName' // Lưu ý: Backend có thể cần field này trong description hoặc xử lý riêng
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
                                    name='location' // Lưu ý: Backend đang map trường này là 'location'
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
                            name='addressDetail' // Field này FE dùng để ghép chuỗi location
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
