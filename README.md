Video How To Set Up Project SWP: 
=>   https://drive.google.com/file/d/1G_SkxpiZNnr7HCBDZPsjY_3uH2WL7Y_L/view?usp=sharing

# BloodLine DNA
---

## 🧬 Introduction

**BloodLine DNA** is a modern platform for managing and analyzing genetic data. It provides a robust backend API (ASP.NET Core) and a fast, user-friendly frontend (Vite + Node.js). The system supports user management, DNA test processing, and seamless integration with external applications.

---

## 🚀 Features

- User registration, login, JWT authentication, Google OAuth
- User, DNA test, and result management
- Email verification and password recovery
- Integrated Swagger/OpenAPI documentation
- CI/CD with GitHub Actions
- SQL Server database support

---

## 📁 Project Structure

```
.
├── DNA_Blood_API/           # Backend: ASP.NET Core Web API
│   ├── Controllers/         # API controllers
│   ├── Models/              # Data models
│   ├── Repository/          # Data access layer
│   ├── Services/            # Business logic services
│   ├── ViewModels/          # View models for API responses
│   ├── Hubs/                # SignalR hubs (if any)
│   ├── Program.cs           # Application entry point
│   ├── appsettings.json     # Application configuration
│   └── DNA_API1.csproj      # .NET project file
├── DNA_Blood_Front_End/     # Frontend: Vite/React/Angular/etc.
│   ├── public/              # Static assets
│   ├── src/                 # Source code
│   ├── package.json         # Node.js project file
│   └── vite.config.js       # Vite configuration
├── .github/
│   └── workflows/
│       └── ci.yml           # GitHub Actions CI/CD pipeline
├── README.md                # Project documentation
└── ...                      # Other configuration files
```

---

## ⚙️ Requirements

- .NET 8.0 SDK
- Node.js 20.x
- SQL Server 2019 or newer
- Docker (optional, for containerized setup)
- Git

---

## 🛠️ Installation

### 1. Clone the repository

```sh
git clone https://github.com/your-org/bloodline-dna.git
cd bloodline-dna
```

### 2. Backend setup

```sh
cd DNA_Blood_API
dotnet restore
dotnet build
dotnet run
```

### 3. Frontend setup

```sh
cd ../DNA_Blood_Front_End
npm install
npm run dev
```

### 4. Database connection configuration

Edit `appsettings.json` in `DNA_Blood_API`:

```json
"ConnectionStrings": {
  "Default": "Server=localhost,1433;Database=Bloodline_DNA;User Id=sa;Password=Your_password;"
}
```

---

## 💡 Usage

- API documentation: [http://localhost:5058/swagger](http://localhost:5058/swagger)
- Frontend interface: [http://localhost:5173](http://localhost:5173) (or your configured port)

---

## 🔄 CI/CD

This project uses GitHub Actions ([.github/workflows/ci.yml](.github/workflows/ci.yml)) for automated build, test, and deployment.

---

## 🤝 Contribution

Contributions are welcome!  
To contribute:

1. Fork the repository and create a new branch
2. Commit your changes and push to your fork
3. Open a pull request with a clear description of your changes

Please follow the [Code of Conduct](CODE_OF_CONDUCT.md) and our [Contributing Guidelines](CONTRIBUTING.md) (if available).

---

## 📄 License

MIT License. See the [LICENSE](LICENSE) file for details.

---

## 📬 Contact

- Project Lead: [Rebuilt]
- Email: [rebuiltteam@gmail.com]
---
