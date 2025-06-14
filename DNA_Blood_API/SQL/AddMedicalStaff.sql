-- Thêm role nếu chưa có
IF NOT EXISTS (SELECT 1 FROM Roles WHERE role_id = 4)
BEGIN
    INSERT INTO Roles (role_id, role_name) VALUES (4, 'Medical Staff');
END

-- Thêm medical staff
INSERT INTO USERS (name, email, phone, password, role_id, created_at, updated_at)
VALUES 
('Dr. Nguyen Van A', 'doctor.a@example.com', '0123456789', 'hashed_password_here', 4, GETDATE(), GETDATE()),
('Dr. Tran Thi B', 'doctor.b@example.com', '0987654321', 'hashed_password_here', 4, GETDATE(), GETDATE());

-- Lấy ID của các medical staff vừa thêm
DECLARE @doctorA_id INT = (SELECT user_id FROM USERS WHERE email = 'doctor.a@example.com');
DECLARE @doctorB_id INT = (SELECT user_id FROM USERS WHERE email = 'doctor.b@example.com');

-- Thêm thông tin profile cho medical staff
INSERT INTO UserProfile (user_id, specialization, years_of_experience)
VALUES 
(@doctorA_id, 'DNA Testing', 5),
(@doctorB_id, 'Parentage Verification', 3); 