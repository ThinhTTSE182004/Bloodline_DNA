Vui Lòng Đọc Hướng Dẫn Trước Khi Sử Dụng Repo này

Video Hướng Dẫn Setup Sử Dụng Project SWP: 
=>   https://drive.google.com/file/d/1G_SkxpiZNnr7HCBDZPsjY_3uH2WL7Y_L/view?usp=sharing


Bộ Dữ liệu mẫu cho Staff
[

  {
    "username": "Nguyễn Văn An",
    "password": "12345678",
    "email": "nguyenvanan@gmail.com",
    "phone": "0912345678"
  }
  
  {
    "username": "Trần Thị Thùy",
    "password": "password123",
    "email": "tranthithuy@yahoo.com",
    "phone": "0908765432"
  }
  
  {
    "username": "Lê Minh Thư",
    "password": "thu12345",
    "email": "leminhthu@hotmail.com",
    "phone": "0987654321"
  }
  
  {
    "username": "Phạm Thanh Sơn",
    "password": "son12345",
    "email": "phamthanhson@outlook.com",
    "phone": "0923456789"
  }
  
  {
    "username": "Hoàng Thị Ma",
    "password": "ma123456",
    "email": "hoangthima@gmail.com",
    "phone": "0965432109"
  }
  
  {
    "username": "Đoàn Văn Khánh",
    "password": "khanhpassword",
    "email": "doanvankhanh@mail.com",
    "phone": "0901234567"
  }
  
  {
    "username": "Ngô Thị Thảo",
    "password": "password2023",
    "email": "ngothithao@outlook.com",
    "phone": "0912349876"
  }
  
  {
    "username": "Vương Thanh Hà",
    "password": "thanhha123",
    "email": "vuongthanhha@yahoo.com",
    "phone": "0923456789"
  }
  
  {
    "username": "Trần Như Quyền",
    "password": "quyenpassword",
    "email": "trannhuquyen@gmail.com",
    "phone": "0945678901"
  }
  
  {
    "username": "Phan Thị Thùy",
    "password": "thuy56789",
    "email": "phanthithuy@hotmail.com",
    "phone": "0981234567"
  }
  
]

Bộ Dữ Liệu Cho Medical Staff
[
  
  {
    "username": "Nguyễn Thị Lan",
    "password": "12345678",
    "email": "nguyenthilan@gmail.com",
    "phone": "0912345678",
    "yoe": 5,
    "specialization": "Software Development"
  }
  
  {
    "username": "Trần Minh Tú",
    "password": "password123",
    "email": "tranminhtu@yahoo.com",
    "phone": "0908765432",
    "yoe": 3,
    "specialization": "Data Analysis"
  }
  
  {
    "username": "Lê Thị Hương",
    "password": "thu12345",
    "email": "lethihuong@hotmail.com",
    "phone": "0987654321",
    "yoe": 2,
    "specialization": "UI/UX Design"
  }
  
  {
    "username": "Phạm Quang Huy",
    "password": "son12345",
    "email": "phamquanghuy@outlook.com",
    "phone": "0923456789",
    "yoe": 8,
    "specialization": "Machine Learning"
  }
  
  {
    "username": "Hoàng Thanh Mai",
    "password": "ma123456",
    "email": "hoangthanhmai@gmail.com",
    "phone": "0965432109",
    "yoe": 6,
    "specialization": "Cybersecurity"
  }
  
  {
    "username": "Đoàn Bích Liên",
    "password": "khanhpassword",
    "email": "doanbichlien@mail.com",
    "phone": "0901234567",
    "yoe": 4,
    "specialization": "Cloud Computing"
  }
  
  {
    "username": "Ngô Thiên Kim",
    "password": "password2023",
    "email": "ngothienkim@outlook.com",
    "phone": "0912349876",
    "yoe": 7,
    "specialization": "Software Testing"
  }
  
  {
    "username": "Vương Hồng Hà",
    "password": "thanhha123",
    "email": "vuonghongha@yahoo.com",
    "phone": "0923456789",
    "yoe": 9,
    "specialization": "Project Management"
  }
  
  {
    "username": "Trần Quang Hạ",
    "password": "quyenpassword",
    "email": "tranquangha@gmail.com",
    "phone": "0945678901",
    "yoe": 1,
    "specialization": "Frontend Development"
  }
  
  {
    "username": "Phan Thị Yến",
    "password": "thuy56789",
    "email": "phanthiyen@hotmail.com",
    "phone": "0981234567",
    "yoe": 3,
    "specialization": "Mobile App Development"
  }
  
]


```markdown
# BloodLine_DNA

A comprehensive platform for managing DNA testing services, including user management, order processing, staff scheduling, and real-time notifications. This project consists of a .NET 8 Web API backend and a modern React frontend.

---

## Table of Contents

- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Configuration](#configuration)
  - [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

---

## About

**BloodLine_DNA** is a full-stack web application designed to streamline the workflow of DNA testing laboratories and service providers. It supports customer booking, order management, staff assignment, payment processing, and more, with a focus on security, scalability, and user experience.

---

## Features

- **User Authentication & Authorization** (JWT, OAuth)
- **Role-based Access Control** (Admin, Staff, Medical Staff, Customer)
- **Order & Service Management**
- **Staff Scheduling & Shift Assignment**
- **Real-time Notifications** (SignalR)
- **Payment Integration**
- **Feedback & Support System**
- **Comprehensive API for integration**
- **Responsive Frontend UI**

---

## Tech Stack

- **Backend:** ASP.NET Core 8 Web API, Entity Framework Core, SQL Server
- **Frontend:** React, Vite, TailwindCSS
- **Real-time:** SignalR
- **CI/CD:** GitHub Actions

---

## Project Structure

```
SWP/
├── DNA_Blood_API/           # .NET 8 Web API backend

│   ├── Controllers/         # API controllers

│   ├── Models/              # Entity models

│   ├── Repository/          # Data access layer

│   ├── Services/            # Business logic

│   ├── ViewModels/          # DTOs and view models

│   ├── Hubs/                # SignalR hubs

│   ├── tests/               # Postman collections & environments

│   └── ...                  # Configs, Program.cs, etc.

├── DNA_Blood_Front_End/     # React frontend

│   ├── src/                 # Source code

│   ├── public/              # Static assets

│   └── ...                  # Configs, package.json, etc.

└── .github/workflows/       # CI/CD pipelines
```

---

## Getting Started

### Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download)
- [Node.js (v20+)](https://nodejs.org/)
- [SQL Server](https://www.microsoft.com/en-us/sql-server/sql-server-downloads)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- [Git](https://git-scm.com/)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/BloodLine_DNA.git
   cd BloodLine_DNA
   ```

2. **Backend Setup:**
   ```bash
   cd DNA_Blood_API
   dotnet restore
   ```

3. **Frontend Setup:**
   ```bash
   cd ../DNA_Blood_Front_End
   npm install
   ```

### Configuration

- **Backend:**
  - Update `appsettings.json` and `appsettings.Development.json` in `DNA_Blood_API/` with your SQL Server connection string and other secrets. (You Must Run SQLQuery in Project First)
  - Example:
    ```json
    "ConnectionStrings": {
      "Default": "Server=localhost;Database=Bloodline_DNA;User Id=sa;Password=Your_password;"
    }
    ```

- **Frontend:**
  - Set API base URL in `.env` or via `VITE_API_BASE_URL` in your environment.

### Running the Application

1. **Start SQL Server** and ensure the database is created (see `SQLQuery1.sql` for schema).
2. **Run the backend:**
   ```bash
   cd DNA_Blood_API
   dotnet run
   ```
   The API will be available at `https://localhost:7113` (or as configured).

3. **Run the frontend:**
   ```bash
   cd DNA_Blood_Front_End
   npm install 
   npm run dev
   ```
   The app will be available at `http://localhost:5173` (default Vite port).

---

## API Documentation

- API endpoints are defined in the controllers under `DNA_Blood_API/Controllers/`.
- You can use the provided Postman collection in `DNA_Blood_API/tests/dna_api_collection.json` for testing.
- (Optional) Swagger/OpenAPI can be enabled for interactive docs.

- **CI/CD:**  
  Automated tests and builds are configured via GitHub Actions in `.github/workflows/ci.yml`.

---

## Contributing

Contributions are welcome! Please open issues or pull requests for improvements, bug fixes, or new features.

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Open a Pull Request

## Contact

- **Project Maintainer:** [ThinhTTSE182004](mailto:thinhttse182004@fpt.edu.vn)


