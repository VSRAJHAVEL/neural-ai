# Neural AI - AI-Powered Website Builder

An intelligent web application that empowers users to build, design, and optimize websites using AI-driven tools. Features a responsive React-based builder with drag-and-drop interface, real-time preview, MongoDB persistence, JWT authentication, and Groq-powered AI services.

![Neural AI](client/public/favicon.svg)

## ✨ Features

- **🎨 Drag-and-Drop Builder** - Intuitive interface to create and edit website components
- **👁️ Real-Time Preview** - See changes instantly as you build
- **🤖 AI Code Generation** - Generate optimized React components using Groq API
- **⚡ Code Optimization** - Improve existing code with AI suggestions
- **🏗️ Layout Optimization** - Automatically refine component layouts
- **💬 AI Chat Assistant** - Ask questions and get help from AI
- **🔐 User Authentication** - Secure JWT-based authentication with bcryptjs
- **📊 Project Management** - Save, load, and manage multiple projects
- **📦 MongoDB Integration** - Cloud-based data persistence with MongoDB Atlas
- **🚀 Production Ready** - Deploy to Netlify or Vercel with one click

---

## 🛠️ Tech Stack

### Frontend
- **React 18+** - Modern UI library
- **Vite** - Ultra-fast build tool
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first styling
- **Shadcn/ui** - Pre-built accessible components
- **Lucide Icons** - Beautiful icon library
- **Axios** - HTTP client with JWT interceptor

### Backend
- **Express.js** - Lightweight web framework
- **TypeScript** - Type safety
- **tsx** - TypeScript runtime

### Database & AI
- **MongoDB** - NoSQL database for data persistence
- **JWT (JSON Web Tokens)** - Stateless authentication
- **bcryptjs** - Secure password hashing
- **Groq API** - Fast LLM inference for AI features

---

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- MongoDB (local or MongoDB Atlas)
- Git

### Local Development

1. **Clone the repository**
```bash
git clone https://github.com/VSRAJHAVEL/neural-ai.git
cd neural-ai
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp env.example .env
```

Edit `.env` with your MongoDB URI:
```
MONGODB_URI=mongodb://localhost:27017/neural-ai
NODE_ENV=development
```

4. **Start MongoDB**
```bash
# If using local MongoDB
mongod
```

5. **Run development server**
```bash
npm run dev
```

6. **Open in browser**
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000`

---

## 📁 Project Structure

```
neural-ai/
├── client/                          # React frontend
│   ├── src/
│   │   ├── components/             # React components
│   │   ├── pages/                  # Page components
│   │   ├── services/               # API services
│   │   ├── hooks/                  # Custom React hooks
│   │   └── context/                # React context
│   └── public/                     # Static assets
│
├── server/                          # Express backend
│   ├── auth.ts                     # Authentication logic
│   ├── routes.ts                   # API routes
│   ├── middleware.ts               # JWT validation
│   ├── db.ts                       # Database connection
│   └── services/                   # Business logic
│
├── shared/
│   └── schema.ts                   # Shared types
│
└── package.json                    # Dependencies
```

---

## 🔐 Authentication

The app uses JWT-based authentication with bcryptjs:

- **Signup**: `POST /api/auth/signup` - Create new account
- **Signin**: `POST /api/auth/signin` - Login and receive JWT token
- **Logout**: `POST /api/auth/logout` - Invalidate session

Token expiration: 7 days
Password hashing: bcryptjs (10 salt rounds)

---

## 🤖 AI Features

### Code Generation
Generate optimized React components from descriptions using Groq API:
```bash
POST /api/ai/generate
```

### Code Optimization
Improve existing code:
```bash
POST /api/ai/optimize
```

### Layout Optimization
Refine component layouts:
```bash
POST /api/ai/optimize-layout
```

---

## 📚 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/signin` - Login user
- `POST /api/auth/logout` - Logout user

### Projects
- `GET /api/projects` - List user projects
- `POST /api/projects` - Create new project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### AI Services
- `POST /api/ai/generate` - Generate code
- `POST /api/ai/optimize` - Optimize code
- `POST /api/ai/optimize-layout` - Optimize layout

---

## 🌐 Deployment

### Deploy to Netlify

1. Push to GitHub:
```bash
git push origin main
```

2. Go to [netlify.com](https://netlify.com)
3. Connect your GitHub repository
4. Add environment variables:
   - `MONGODB_URI` - MongoDB Atlas connection string
   - `GROQ_API_KEY` - Groq API key (optional)
   - `NODE_ENV` - Set to `production`
5. Deploy!

### Deploy to Vercel

1. Push to GitHub:
```bash
git push origin main
```

2. Go to [vercel.com](https://vercel.com)
3. Import your GitHub repository
4. Add environment variables (same as Netlify)
5. Deploy!

### MongoDB Atlas Setup

1. Create account at [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. Create free M0 cluster
3. Create database user
4. Whitelist IP: `0.0.0.0/0`
5. Get connection string
6. Add to deployment platform environment variables

---

## 📖 Documentation

- [QUICK_START.md](QUICK_START.md) - Getting started guide
- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - Detailed deployment steps
- [MONGODB_QUICK_REFERENCE.md](MONGODB_QUICK_REFERENCE.md) - MongoDB commands
- [MONGODB_TESTING_GUIDE.md](MONGODB_TESTING_GUIDE.md) - Testing procedures

---

## 🎯 Usage

### Creating a Website

1. **Sign up** - Create your account
2. **Create Project** - Start a new project
3. **Add Components** - Drag components from sidebar
4. **Edit Properties** - Customize colors, text, sizing
5. **Preview** - See live preview of your site
6. **Use AI** - Generate or optimize code with AI
7. **Save** - Auto-saves to MongoDB

### AI Chat

- Click the chat button (bottom right)
- Ask questions about the builder
- Get AI-powered suggestions
- Messages logged to MongoDB

---

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev              # Start dev server

# Build
npm run build           # Build for production
npm run check           # Type check with TypeScript

# Testing
npm run test            # Run tests (if configured)
```

### Environment Variables

Create `.env` file in root:
```env
MONGODB_URI=mongodb://localhost:27017/neural-ai
NODE_ENV=development
GROQ_API_KEY=your_key_here
```

---

## 🐛 Troubleshooting

### MongoDB Connection Error
- Verify MongoDB is running locally or MongoDB Atlas is accessible
- Check connection string in `.env`
- Ensure IP whitelist includes your machine

### AI Features Not Working
- Check `GROQ_API_KEY` is set
- Verify Groq API account has valid API key
- Check browser console for errors

### Build Errors
- Run `npm install` to update dependencies
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check `npm run check` for TypeScript errors

### Deployment Issues
- Check deployment logs on Netlify/Vercel
- Verify all environment variables are set
- Ensure `MONGODB_URI` includes correct password
- Check MongoDB Atlas IP whitelist

---

## 📝 License

MIT License - See [LICENSE](LICENSE) file for details

---

## 👨‍💻 Author

- **VS Rajhavel** - [@VSRAJHAVEL](https://github.com/VSRAJHAVEL)

---

## 🤝 Contributing

Contributions welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests

---

## 📧 Support

For issues or questions:
- Open an issue on GitHub
- Check existing documentation
- Review deployment guide

---

## 🎉 Getting Help

- **Documentation**: Check [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md)
- **Deployment**: See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
- **MongoDB**: Read [MONGODB_QUICK_REFERENCE.md](MONGODB_QUICK_REFERENCE.md)

---

**Built with ❤️ using React, Express, and MongoDB**
