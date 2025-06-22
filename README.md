Vui Lòng Đọc Hướng Dẫn Sử Dụng Trước Khi Chạy Code

1.
DB thêm 1 trường status vào trong order_detail.(Đã sửa lại trong câu query luôn), xóa db chạy lại giúp 
T xóa các file tạo staff và medical Staff trong db vì đ có vào dc
T đã có api register cho staff và medical lấy cái đó mà tạo lại
Nhớ là 5 staff và 5 medicall (staff tạo trước 5 thằng rồi tới medical)
Medical nhớ thêm cái chuyên viên.

2. API staff

2.1 Cho phép lấy toàn bộ đơn hàng và thay đổi trạng thái payment_status thành thanh toán thành công

2.2 Cho phép lấy  danh sách mẫu (Sample) xét nghiệm cần ghi nhận theo nhân viên phụ trách và chỉnh sửa nó

2.3 Cho phép lấy sample_transfer được phụ trách bởi staffId và Update sample_transfer_status thành đang được đưa cho medical


3. API medical 

3.1 Cho phép lấy  danh sách mẫu (Sample) xét nghiệm cần ghi nhận theo nhân viên phụ trách và chỉnh sửa "Đã hoàn thành"
Tất cả các mẫu thuộc order khi đã ở trạng thái đã hoàn thành thì mới đc ghi vào order_detail

3.2 Cập nhật sample_transfer khi mà nhận dc mẫu từ staff

3.3 cái api để kiểm tra xem các sample thuộc order_detail đã ở trạng thái hoàn thành hết chưa

3.4 Nếu đã hoàn thành r thì mới cập nhật vào bảng result.

4. Sửa lại api GetOrderDetail trong userProfileController
vì t thấy 1 order sẽ có nhiểu order_detail mà mình chỉ select first thôi nên t chỉnh thành list 
Nên là FE sửa lại t cái này để hiện ra 1 list luôn. 



