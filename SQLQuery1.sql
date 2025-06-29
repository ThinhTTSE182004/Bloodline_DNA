ALTER DATABASE Bloodline_DNA SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
DROP DATABASE Bloodline_DNA;

CREATE DATABASE Bloodline_DNA;

ALTER DATABASE Bloodline_DNA SET SINGLE_USER WITH ROLLBACK IMMEDIATE;

CREATE TABLE Roles (
    role_id INT IDENTITY(1,1) PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL
)

CREATE TABLE Permission (
    permission_id INT IDENTITY(1,1) PRIMARY KEY,
    permission_name VARCHAR(100) UNIQUE NOT NULL
)

CREATE TABLE WorkShift (
    shift_id  INT IDENTITY(1,1) PRIMARY KEY,
    shift_name NVARCHAR(50) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    description NVARCHAR(255)
);

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
CREATE TABLE ShiftAssignment (
    assignment_id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    shift_id INT NOT NULL,
    assignment_date DATE NOT NULL,
    FOREIGN KEY (user_id) REFERENCES USERS(user_id),
    FOREIGN KEY (shift_id) REFERENCES WorkShift(shift_id)
);

CREATE TABLE PasswordResetToken (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    token NVARCHAR(256) NOT NULL,
    expiry DATETIME NOT NULL,
    is_used BIT DEFAULT 0,
    CONSTRAINT FK_PasswordResetToken_User FOREIGN KEY (user_id) REFERENCES USERS(user_id)
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
phone NVARCHAR(12),
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
    service_package_id INT IDENTITY(1,1)  PRIMARY KEY,
    service_name NVARCHAR(100) unique NOT NULL,
    category NVARCHAR(100),
    description NVARCHAR(MAX),
    duration INT CHECK (duration > 0),
	processing_time_minutes INT CHECK (processing_time_minutes > 0)
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
booking_date Datetime,
FOREIGN KEY (customer_id) REFERENCES USERS(user_id),
FOREIGN KEY (collection_method_id) REFERENCES Collection_method(collection_method_id)
)

create table Order_detail (
order_detail_id INT IDENTITY(1,1) PRIMARY KEY,
service_package_id int not null,
medical_staff_id INT not null,
order_id int not null,
status nvarchar(50), 
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
sample_id int not null,
transfer_date DATETIME DEFAULT GETDATE(),
sample_transfer_status nvarchar(50) not null,
FOREIGN KEY (staff_id) REFERENCES USERS(user_id),
FOREIGN KEY (medical_staff_id) REFERENCES USERS(user_id),
FOREIGN KEY (sample_id) REFERENCES samples(sample_id)
)


INSERT INTO [Bloodline_DNA].[dbo].[Roles] ([role_name]) VALUES
('Admin'),
('Staff'),
('Customer'),
('Medical Staff');


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
    [service_name],
    [category],
    [description],
    [duration],
	[processing_time_minutes]
) VALUES
( 'Maternal Ancestry Test', 'Ancestry', 'Test to determine maternal lineage based on mitochondrial DNA (mtDNA)', 7,150),
( 'Paternal Ancestry Test', 'Ancestry', 'Test to determine paternal lineage based on Y-chromosome DNA (Y-STR)', 7,120),
( 'Family Ancestry Test', 'Ancestry', 'DNA analysis to identify family relationships within a household', 10,100),
( 'Sibling Relationship Test', 'Relationship', 'Test to verify sibling relationship using autosomal DNA analysis', 7,90),
( 'Parentage Verification Test', 'Relationship', 'High accuracy DNA test to verify parent-child relationship using STR markers', 5,110);

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



INSERT INTO USERS (name, email, phone, password, role_id)
VALUES (N'Admin', 'thinhttse182004@fpt.edu.vn', N'0944404161', N'AQAAAAIAAYagAAAAEAaft1D4glAiGYpAVCgj1Ut6lXdGe2mMxD+63GzUDnP8y26zeorQYnj7sGC1MqE7Pg==', 1);

INSERT INTO USERS (name, email, phone, password, role_id)
VALUES (N'Staff', 'thinhttse182004@gmail.com', N'0944404161', N'AQAAAAIAAYagAAAAEAaft1D4glAiGYpAVCgj1Ut6lXdGe2mMxD+63GzUDnP8y26zeorQYnj7sGC1MqE7Pg==', 2);

INSERT INTO USERS (name, email, phone, password, role_id)
VALUES (N'Customer', 'thaithinh9595@gmail.com', N'0944404161', N'AQAAAAIAAYagAAAAEAaft1D4glAiGYpAVCgj1Ut6lXdGe2mMxD+63GzUDnP8y26zeorQYnj7sGC1MqE7Pg==', 3);


