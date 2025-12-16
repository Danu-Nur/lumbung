# Lumbung Microservices Documentation

Welcome to the Lumbung Inventory Management System documentation!

## 📚 Documentation Structure

### 🏗️ Architecture
Learn about the system design and database structure.

- [**ARCHITECTURE.md**](./architecture/ARCHITECTURE.md) - System architecture, microservices design, and component overview
- [**DATABASE.md**](./architecture/DATABASE.md) - Database schema, relationships, and data models

### ⚙️ Setup & Configuration
Get started with installation and deployment.

- [**SETUP.md**](./setup/SETUP.md) - Complete setup guide for Docker and local development
- [**STATUS.md**](./setup/STATUS.md) - Current project status and completion summary

### ✨ Features
Detailed guides for specific features and implementations.

- [**DASHBOARD_REFACTOR.md**](./features/DASHBOARD_REFACTOR.md) - Dashboard API integration and refactoring guide
- [**OFFLINE_SUPPORT.md**](./features/OFFLINE_SUPPORT.md) - Offline functionality implementation details
- [**OFFLINE_TESTING.md**](./features/OFFLINE_TESTING.md) - Testing procedures for offline mode
- [**OFFLINE_COMPLETE.md**](./features/OFFLINE_COMPLETE.md) - Offline support summary and next steps

## 🚀 Quick Start

1. **New to the project?** Start with [SETUP.md](./setup/SETUP.md)
2. **Want to understand the architecture?** Read [ARCHITECTURE.md](./architecture/ARCHITECTURE.md)
3. **Working on features?** Check the [features](./features/) directory
4. **Need database info?** See [DATABASE.md](./architecture/DATABASE.md)

## 📖 Documentation Categories

### Architecture Documentation
Understanding how the system is built and organized.

```
docs/architecture/
├── ARCHITECTURE.md    # System design and components
└── DATABASE.md        # Database schema and models
```

### Setup Documentation
Getting the system up and running.

```
docs/setup/
├── SETUP.md          # Installation and configuration
└── STATUS.md         # Project status and milestones
```

### Feature Documentation
Detailed guides for specific features.

```
docs/features/
├── DASHBOARD_REFACTOR.md    # Dashboard API integration
├── OFFLINE_SUPPORT.md       # Offline functionality
├── OFFLINE_TESTING.md       # Offline testing guide
└── OFFLINE_COMPLETE.md      # Offline implementation summary
```

## 🔍 Find What You Need

### I want to...

- **Install the project** → [SETUP.md](./setup/SETUP.md)
- **Understand the architecture** → [ARCHITECTURE.md](./architecture/ARCHITECTURE.md)
- **Learn about the database** → [DATABASE.md](./architecture/DATABASE.md)
- **Work on the dashboard** → [DASHBOARD_REFACTOR.md](./features/DASHBOARD_REFACTOR.md)
- **Implement offline features** → [OFFLINE_SUPPORT.md](./features/OFFLINE_SUPPORT.md)
- **Test offline mode** → [OFFLINE_TESTING.md](./features/OFFLINE_TESTING.md)
- **Check project status** → [STATUS.md](./setup/STATUS.md)

## 📝 Contributing to Documentation

When adding new documentation:

1. **Choose the right category**:
   - Architecture docs → `docs/architecture/`
   - Setup/config docs → `docs/setup/`
   - Feature guides → `docs/features/`

2. **Follow naming conventions**:
   - Use UPPERCASE for main docs (e.g., `SETUP.md`)
   - Use descriptive names (e.g., `OFFLINE_SUPPORT.md`)
   - Keep filenames concise but clear

3. **Update this index**:
   - Add your new document to the relevant section
   - Include a brief description
   - Update the "Find What You Need" section if applicable

## 🏗️ Project Structure

```
lumbung-microservices/
├── backend/              # Fastify API backend
├── frontend/             # Next.js frontend
├── docs/                 # 📚 You are here!
│   ├── architecture/     # System design docs
│   ├── setup/           # Installation guides
│   ├── features/        # Feature documentation
│   └── README.md        # This file
├── docker-compose.yml   # Docker orchestration
└── README.md           # Project overview
```

## 🔗 External Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Fastify Documentation](https://www.fastify.io/docs/latest/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Docker Documentation](https://docs.docker.com/)

## 📞 Need Help?

- Check the relevant documentation first
- Review the [SETUP.md](./setup/SETUP.md) troubleshooting section
- Look at [STATUS.md](./setup/STATUS.md) for known issues

---

**Last Updated**: December 16, 2025  
**Documentation Version**: 1.0
