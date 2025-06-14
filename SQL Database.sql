ALTER DATABASE Bloodline_DNA SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
DROP DATABASE Bloodline_DNA;

ALTER DATABASE Bloodline_DNA SET SINGLE_USER WITH ROLLBACK IMMEDIATE;

CREATE TABLE Roles (
    role_id INT IDENTITY(1,1) PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL
)

CREATE TABLE Permission (
    permission_id INT IDENTITY(1,1) PRIMARY KEY,
    permission_name VARCHAR(100) UNIQUE NOT NULL
)

CREATE TABLE USERS (
    user_id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    email NVARCHAR(100) NOT NULL UNIQUE,
    phone NVARCHAR(20),
    password NVARCHAR(255) NOT NULL,
    role_id INT,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (role_id) REFERENCES Roles(role_id)
);


create table User_profile (
profile_id INT IDENTITY(1,1) PRIMARY KEY,
user_id INT unique not null,
name NVARCHAR(100) NOT NULL,
email NVARCHAR(100) NOT NULL UNIQUE,
phone NVARCHAR(20),
Specialization NVARCHAR(100), 
YearsOfExperience INT,
created_at DATETIME DEFAULT GETDATE(),
updated_at DATETIME DEFAULT GETDATE(),
FOREIGN KEY (user_id) REFERENCES USERS(user_id)
)

CREATE TABLE Role_Permission (
    role_id INT,
    permission_id INT,
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES Roles(role_id),
    FOREIGN KEY (permission_id) REFERENCES Permission(permission_id)
)

CREATE TABLE Participant (
participant_id INT IDENTITY(1,1) PRIMARY KEY,
full_name NVARCHAR(100),
sex NVARCHAR(10) CHECK (sex IN ('Male', 'Female', 'Other')),
birth_date DATE NOT NULL,
phone decimal(12,0),
relationship NVARCHAR(30),
name_relation NVARCHAR(30)
)

CREATE TABLE Sample_type(
sample_type_id INT IDENTITY(1,1) PRIMARY KEY,
name NVARCHAR(20) unique not null,
description nvarchar(500),
)

CREATE TABLE TestType (
    TestTypeID INT PRIMARY KEY,
    Name NVARCHAR(50) NOT NULL 
)



create table Collection_method (
collection_method_id INT  PRIMARY KEY,
method_name NVARCHAR(20),
TestTypeID INT NOT NULL,
description nvarchar(1000),
FOREIGN KEY (TestTypeID) REFERENCES TestType(TestTypeID)
)


CREATE TABLE Service_package (
    service_package_id INT  PRIMARY KEY,
    service_name NVARCHAR(100) unique NOT NULL,
    category NVARCHAR(100),
    description NVARCHAR(MAX),
    duration INT CHECK (duration > 0)
)

create table Choose_method (
service_package_id int,
collection_method_id int,
FOREIGN KEY (service_package_id) REFERENCES Service_package(service_package_id),
FOREIGN KEY (collection_method_id) REFERENCES Collection_method(collection_method_id)
)

create table Service_price(
service_price_id INT PRIMARY KEY,
service_package_id int not null,
price int not null,
FOREIGN KEY (service_package_id) REFERENCES Service_package(service_package_id)
)

create table Orders(
order_id INT IDENTITY(1,1) PRIMARY KEY,
customer_id INT not null,
collection_method_id INT  not null,
order_status nvarchar(50) not null,
create_at DATETIME DEFAULT GETDATE(),
update_at DATETIME DEFAULT GETDATE(),
FOREIGN KEY (customer_id) REFERENCES USERS(user_id),
FOREIGN KEY (collection_method_id) REFERENCES Collection_method(collection_method_id)
)

create table Order_detail (
order_detail_id INT IDENTITY(1,1) PRIMARY KEY,
service_package_id int not null,
medical_staff_id INT not null,
order_id int not null,
FOREIGN KEY (service_package_id) REFERENCES Service_package(service_package_id),
FOREIGN KEY (order_id) REFERENCES Orders(order_id),
FOREIGN KEY (medical_staff_id) REFERENCES USERS(user_id)
)


CREATE TABLE Delivery (
    delivery_id INT IDENTITY(1,1) PRIMARY KEY,
    order_id INT unique NOT NULL,
    delivery_address NVARCHAR(255) not null,
    delivery_status NVARCHAR(50) not null,
    delivery_date DATE not null,
    note NVARCHAR(MAX),
    FOREIGN KEY (order_id) REFERENCES Orders(order_id)
)
create table samples(
sample_id INT IDENTITY(1,1) PRIMARY KEY,
participant_id int,
sample_type_id int not null,
staff_id int Not null,
order_detail_id int not null,
collected_date date,
received_date date,
sample_status nvarchar(50) not null,
note nvarchar(500),
FOREIGN KEY (participant_id) REFERENCES Participant(participant_id),
FOREIGN KEY (sample_type_id) REFERENCES Sample_type(sample_type_id),
FOREIGN KEY (staff_id) REFERENCES USERS(user_id),
FOREIGN KEY (order_detail_id) REFERENCES Order_detail(order_detail_id)
)

create table Payment(
payment_id INT IDENTITY(1,1) PRIMARY KEY,
order_id int unique not null,
payment_method Nvarchar(20) not null,
payment_status nvarchar(50) not null,
payment_date DATETIME DEFAULT GETDATE(),
total int not null,
FOREIGN KEY (order_id) REFERENCES Orders(order_id)
)

create table Sample_kit (
sample_kit_id INT IDENTITY(1,1) PRIMARY KEY,
order_detail_id int not null,
staff_id int not null,
name nvarchar(50) not null,
intruction_url nvarchar(MAX),
kit_code VARCHAR(20) UNIQUE NOT NULL,
create_at DATETIME DEFAULT GETDATE(),
update_at DATETIME DEFAULT GETDATE(),
send_date date,
received_date date,
FOREIGN KEY (order_detail_id) REFERENCES Order_detail(order_detail_id),
FOREIGN KEY (staff_id) REFERENCES USERS(user_id)
)

create table Feedback (
feedback_id INT IDENTITY(1,1) PRIMARY KEY,
order_id int unique not null,
name Nvarchar(100) not null,
rating DECIMAL(2,1) CHECK (rating >= 0 AND rating <= 5) not null,
comment nvarchar(1000),
create_at DATETIME DEFAULT GETDATE(),
update_at DATETIME DEFAULT GETDATE(),
FOREIGN KEY (order_id) REFERENCES Orders(order_id)
)

create table Feedback_response (
response_id INT IDENTITY(1,1) PRIMARY KEY,
feedback_id int not null,
staff_id int not null,
content_response nvarchar(1000),
create_at DATETIME DEFAULT GETDATE(),
update_at DATETIME DEFAULT GETDATE(),
FOREIGN KEY (feedback_id) REFERENCES Feedback(feedback_id),
FOREIGN KEY (staff_id) REFERENCES USERS(user_id)
)

create table Result (
result_id INT IDENTITY(1,1) PRIMARY KEY,
order_detail_id int unique not null,
report_date DATETIME DEFAULT GETDATE(),
test_summary text,
raw_data_path varchar(255),
report_url nvarchar(MAX),
result_status nvarchar(50) not null,
create_at DATETIME DEFAULT GETDATE(),
update_at DATETIME DEFAULT GETDATE(),
FOREIGN KEY (order_detail_id) REFERENCES Order_detail(order_detail_id)
)

create table Delivery_task (
task_id INT IDENTITY(1,1) PRIMARY KEY,
order_detail_id int not null,
manager_id int not null,
staff_id int not null,
assigned_at DATETIME DEFAULT GETDATE(),
note nvarchar(MAX),
delivery_task_status nvarchar(50) not null,
complete_at date,
FOREIGN KEY (order_detail_id) REFERENCES Order_detail(order_detail_id),
FOREIGN KEY (manager_id) REFERENCES USERS(user_id),
FOREIGN KEY (staff_id) REFERENCES USERS(user_id)
)

create table Sample_transfer (
transfer_id INT IDENTITY(1,1) PRIMARY KEY,
staff_id int not null,
medical_staff_id int not null,
transfer_date DATETIME DEFAULT GETDATE(),
sample_transfer_status nvarchar(50) not null,
FOREIGN KEY (staff_id) REFERENCES USERS(user_id),
FOREIGN KEY (medical_staff_id) REFERENCES USERS(user_id)
)


INSERT INTO [Bloodline_DNA].[dbo].[Roles] ([role_name]) VALUES
('Admin'),
('Staff'),
('Customer'),
('Medical Staff');


-- USERS: Staff
INSERT INTO USERS (name, email, phone, password, role_id)
VALUES
(N'Nguyễn Văn An', 'an.staff@example.com', '0901000001', 'hashed_pw_1', 2),
(N'Trần Thị Bình', 'binh.staff@example.com', '0901000002', 'hashed_pw_2', 2),
(N'Lê Văn Cường', 'cuong.staff@example.com', '0901000003', 'hashed_pw_3', 2),
(N'Phạm Thị Dung', 'dung.staff@example.com', '0901000004', 'hashed_pw_4', 2),
(N'Hoàng Minh Đức', 'duc.staff@example.com', '0901000005', 'hashed_pw_5', 2);

-- USER_PROFILE: Staff
INSERT INTO User_profile (user_id, name, email, phone)
VALUES
(1, N'Nguyễn Văn An', 'an.staff@example.com', '0901000001'),
(2, N'Trần Thị Bình', 'binh.staff@example.com', '0901000002'),
(3, N'Lê Văn Cường', 'cuong.staff@example.com', '0901000003'),
(4, N'Phạm Thị Dung', 'dung.staff@example.com', '0901000004'),
(5, N'Hoàng Minh Đức', 'duc.staff@example.com', '0901000005');

-- USERS: Medical Staff
INSERT INTO USERS (name, email, phone, password, role_id)
VALUES
(N'TS. Nguyễn Thị Hồng', 'hong.med@example.com', '0912000001', 'hashed_pw_6', 4),
(N'BS. Trần Văn Khánh', 'khanh.med@example.com', '0912000002', 'hashed_pw_7', 4),
(N'ThS. Lê Thị Minh', 'minh.med@example.com', '0912000003', 'hashed_pw_8', 4),
(N'BS. Phạm Anh Quân', 'quan.med@example.com', '0912000004', 'hashed_pw_9', 4),
(N'ThS. Hoàng Thị Trang', 'trang.med@example.com', '0912000005', 'hashed_pw_10', 4);

-- USER_PROFILE: Medical Staff
INSERT INTO User_profile (user_id, name, email, phone, Specialization, YearsOfExperience)
VALUES
(6, N'TS. Nguyễn Thị Hồng', 'hong.med@example.com', '0912000001', N'Maternal Ancestry', 6),
(7, N'BS. Trần Văn Khánh', 'khanh.med@example.com', '0912000002', N'Paternal Ancestry', 8),
(8, N'ThS. Lê Thị Minh', 'minh.med@example.com', '0912000003', N'Family Ancestry', 7),
(9, N'BS. Phạm Anh Quân', 'quan.med@example.com', '0912000004', N'Sibling Relationship', 5),
(10, N'ThS. Hoàng Thị Trang', 'trang.med@example.com', '0912000005', N'Parentage Testing', 9);

INSERT INTO [Bloodline_DNA].[dbo].[TestType] ([TestTypeID], [Name]) VALUES
(1, 'Civil'),
(2, 'Legal');

INSERT INTO [Bloodline_DNA].[dbo].[Collection_method] (
    [collection_method_id],
    [method_name],
    [TestTypeID],
    [description]
) VALUES
(1, 'At Home', 1, 'Sample is collected at home'),
(2, 'At Medical Center', 1, 'Sample is collected at clinic'),
(3, 'At Medical Center', 2, 'Required for legal test type');


INSERT INTO [Bloodline_DNA].[dbo].[Service_package] (
    [service_package_id],
    [service_name],
    [category],
    [description],
    [duration]
) VALUES
(1, 'Maternal Ancestry Test', 'Ancestry', 'Test to determine maternal lineage based on mitochondrial DNA (mtDNA)', 7),
(2, 'Paternal Ancestry Test', 'Ancestry', 'Test to determine paternal lineage based on Y-chromosome DNA (Y-STR)', 7),
(3, 'Family Ancestry Test', 'Ancestry', 'DNA analysis to identify family relationships within a household', 10),
(4, 'Sibling Relationship Test', 'Relationship', 'Test to verify sibling relationship using autosomal DNA analysis', 7),
(5, 'Parentage Verification Test', 'Relationship', 'High accuracy DNA test to verify parent-child relationship using STR markers', 5);

INSERT INTO [Bloodline_DNA].[dbo].[Service_price] (
    [service_price_id],
    [service_package_id],
    [price]
) VALUES
(1, 1, 3000),
(2, 2, 2500),
(3, 3, 4000),
(4, 4, 6000),
(5, 5, 2000);

INSERT INTO [Bloodline_DNA].[dbo].[Sample_type] (
    [name],
    [description]
) VALUES
('Blood', 'Biological fluid responsible for transporting oxygen and nutrients. Commonly used for DNA analysis, disease screening, and blood typing.'),
('Hair', 'Protein filament (keratin) growing from follicles. Used in toxicology, drug history analysis, and mitochondrial DNA testing'),
('Fingernail', 'Keratin-based tissue from fingertips. Useful in detecting long-term exposure to toxins, trace element analysis, and forensic testing.');



