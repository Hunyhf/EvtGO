import React, { useState, useEffect } from 'react';
// Lưu ý: Hãy điều chỉnh lại đường dẫn import này cho đúng với thư mục của bạn nhé!
import transactionApi from '../../../apis/transactionApi';

const Transaction = () => {
    // 1. Khai báo các state để lưu dữ liệu
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    // 2. Tự động gọi API khi người dùng vào trang này
    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                // Gọi API để lấy dữ liệu
                const response = await transactionApi.getAllTransactions();
                const data = response.data?.data || response.data || [];

                setTransactions(data);
                setLoading(false); // Tắt trạng thái đang tải
            } catch (error) {
                console.error('Lỗi khi lấy danh sách giao dịch:', error);
                setLoading(false);
            }
        };

        fetchTransactions();
    }, []); // Mảng rỗng [] giúp mã này chỉ chạy 1 lần khi trang được mở lên

    // 3. Hiển thị khi đang chờ dữ liệu
    if (loading) {
        return (
            <div style={{ padding: '20px', textAlign: 'center' }}>
                Đang tải thông tin giao dịch...
            </div>
        );
    }

    // 4. Hiển thị giao diện chính
    return (
        <div style={{ padding: '20px' }}>
            <h2>Lịch sử giao dịch của bạn</h2>

            {/* Kiểm tra nếu khách hàng không có giao dịch nào */}
            {transactions.length === 0 ? (
                <p>Bạn chưa có giao dịch nào.</p>
            ) : (
                <table
                    border='1'
                    cellPadding='10'
                    style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        textAlign: 'left'
                    }}
                >
                    <thead>
                        <tr style={{ backgroundColor: '#f2f2f2' }}>
                            <th>Mã Giao Dịch (ID)</th>
                            <th>Ngày Tạo</th>
                            <th>Tổng Tiền</th>
                            <th>Trạng Thái</th>
                            <th>Ghi chú</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map(item => (
                            <tr key={item.id}>
                                <td>{item.id}</td>
                                {/* Bạn có thể thay đổi các trường dữ liệu dưới đây cho khớp với ResTransactionDTO từ backend */}
                                <td>{item.createdAt || 'Đang cập nhật'}</td>
                                <td>
                                    {item.amount
                                        ? `${item.amount.toLocaleString()} VNĐ`
                                        : '0 VNĐ'}
                                </td>
                                <td>{item.status || 'Hoàn thành'}</td>
                                <td>{item.description || ''}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default Transaction;
