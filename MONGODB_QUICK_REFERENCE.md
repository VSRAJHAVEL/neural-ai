# Quick Reference - MongoDB Authentication System

## Server Status

### Check if server is running
```bash
# You should see: Server setup complete, listening on port 5000
curl http://localhost:5000
```

### Start development server
```bash
cd "d:\neural ai"
npm run dev
```

### Stop server
```
Press Ctrl+C in terminal
```

---

## API Quick Reference

### Base URL
```
http://localhost:5000
```

### Authentication Endpoints

#### Sign Up
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123"
  }'
```

Response:
```json
{
  "user": {
    "id": "user-id",
    "email": "user@example.com"
  },
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

#### Sign In
```bash
curl -X POST http://localhost:5000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123"
  }'
```

#### Logout
```bash
curl -X POST http://localhost:5000/api/auth/logout \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### Project Endpoints (All require Authorization header)

#### List All Projects
```bash
curl -X GET http://localhost:5000/api/projects \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Response:
```json
[
  {
    "id": "project-id",
    "userId": "user-id",
    "name": "My Project",
    "layout": {"components": []},
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z"
  }
]
```

#### Create Project
```bash
curl -X POST http://localhost:5000/api/projects \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Project",
    "layout": {"components": []}
  }'
```

#### Get Single Project
```bash
curl -X GET http://localhost:5000/api/projects/PROJECT_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Update Project
```bash
curl -X PATCH http://localhost:5000/api/projects/PROJECT_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Name",
    "layout": {"components": []}
  }'
```

#### Delete Project
```bash
curl -X DELETE http://localhost:5000/api/projects/PROJECT_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## MongoDB Queries

### Connect to MongoDB
```bash
mongosh
# or
mongosh mongodb://localhost:27017/neural-ai
```

### User Collection

#### Find all users
```javascript
db.users.find()
```

#### Find specific user
```javascript
db.users.findOne({ email: "user@example.com" })
```

#### Count users
```javascript
db.users.countDocuments()
```

#### Delete user (for testing)
```javascript
db.users.deleteOne({ email: "user@example.com" })
```

### Projects Collection

#### Find all projects
```javascript
db.projects.find()
```

#### Find user's projects
```javascript
db.projects.find({ userId: "user-id" })
```

#### Find specific project
```javascript
db.projects.findOne({ _id: ObjectId("project-id") })
```

#### Count projects
```javascript
db.projects.countDocuments()
```

#### Delete project (for testing)
```javascript
db.projects.deleteOne({ _id: ObjectId("project-id") })
```

#### Update project
```javascript
db.projects.updateOne(
  { _id: ObjectId("project-id") },
  { $set: { name: "New Name", updatedAt: new Date() } }
)
```

---

## Browser Testing

### Get JWT Token
1. Open Developer Tools (F12)
2. Go to "Application" → "Local Storage"
3. Select `http://localhost:5000`
4. Look for `auth_token` value

### Test Protected Endpoint in Console
```javascript
// Get token
const token = localStorage.getItem('auth_token');

// Fetch projects
fetch('http://localhost:5000/api/projects', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
.then(r => r.json())
.then(data => console.log(data))
```

### Check Auto-Save
1. Open Network tab (F12)
2. Make layout changes
3. Wait 30 seconds
4. Look for PATCH request to `/api/projects/:id`

---

## Common Tasks

### Clear All Data (For Fresh Start)
```bash
# Drop database
mongosh
> db.dropDatabase()
> exit()

# Restart server
npm run dev
```

### Test Full Flow
```bash
# 1. Sign up
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123456"}'

# Save the token from response

# 2. Create project (replace TOKEN)
curl -X POST http://localhost:5000/api/projects \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Project","layout":{"components":[]}}'

# 3. Get projects
curl -X GET http://localhost:5000/api/projects \
  -H "Authorization: Bearer TOKEN"

# 4. Check MongoDB
mongosh
> use neural-ai
> db.projects.find()
```

### Reset Password (Manual - No Endpoint Yet)
```javascript
// In MongoDB console
db.users.updateOne(
  { email: "user@example.com" },
  { $set: { password: "<new-bcrypt-hash>" } }
)
```

---

## Error Responses

### 401 Unauthorized
```json
{
  "message": "Invalid credentials"
}
```
**Cause**: Wrong password or non-existent user

### 400 Bad Request
```json
{
  "message": "Email and password are required"
}
```
**Cause**: Missing fields

### 409 Conflict
```json
{
  "message": "Email already registered"
}
```
**Cause**: Duplicate email on signup

### 404 Not Found
```json
{
  "message": "Project not found"
}
```
**Cause**: Project doesn't exist or not owned by user

---

## Environment Variables

### Current Setup
```
MONGODB_URI=mongodb://localhost:27017/neural-ai
JWT_SECRET=your-secret (uses default if not set)
NODE_ENV=development
PORT=5000
```

### For Production
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/neural-ai
JWT_SECRET=<long-random-secret-string>
NODE_ENV=production
PORT=5000
```

---

## Files to Know

### Key Server Files
- `server/auth.ts` - Authentication logic (bcrypt, JWT)
- `server/middleware.ts` - JWT validation middleware
- `server/projects.ts` - Project CRUD operations
- `server/routes.ts` - API endpoint definitions
- `server/index.ts` - Server startup

### Key Client Files
- `client/src/services/auth.ts` - Auth API client
- `client/src/hooks/useAuth.tsx` - Auth state management
- `client/src/context/ProjectContext.tsx` - Project state
- `client/src/pages/LoginPage.tsx` - Login/signup UI
- `client/src/pages/BuilderPage.tsx` - Main editor

---

## Debugging Tips

### Server Not Starting?
```bash
# Check Node version
node --version  # Should be 18+

# Clear node_modules and reinstall
npm install

# Restart
npm run dev
```

### MongoDB Connection Error?
```bash
# Verify MongoDB running
mongosh

# If not running on Windows:
# Start MongoDB service: services.msc or
# mongod.exe (if installed locally)
```

### Endpoints Returning 404?
```bash
# Verify server is running
curl http://localhost:5000

# Check port not in use
netstat -ano | findstr :5000  # Windows
lsof -i :5000  # Mac/Linux
```

### JWT Token Invalid?
```bash
# Clear localStorage and logout
localStorage.clear()

# Sign in again to get new token
```

### Auto-Save Not Working?
```bash
# Check browser console (F12)
# Look for [ProjectContext] logs

# Make sure:
# 1. You're logged in
# 2. You have a project open
# 3. You've made layout changes
# 4. MongoDB is connected
```

---

## Performance Tips

### Optimize Queries
```javascript
// Create indexes for faster queries
db.users.createIndex({ email: 1 })
db.projects.createIndex({ userId: 1, createdAt: -1 })
```

### Monitor Performance
```bash
# Server logs show response times
npm run dev
# Look for [express] logs
```

### Client Performance
- Open DevTools Network tab
- Sort by time
- Optimize slow requests

---

## Security Reminders

### ✅ Do
- Keep JWT_SECRET secret
- Use HTTPS in production
- Hash passwords (bcryptjs does this)
- Validate all inputs
- Clear tokens on logout
- Use httpOnly cookies for production

### ❌ Don't
- Store passwords in plain text
- Log sensitive data
- Expose JWT_SECRET in code
- Trust client-side validation alone
- Use weak JWT secret
- Share MongoDB credentials publicly

---

## Support Resources

- **Docs**: See MONGODB_AUTH_IMPLEMENTATION.md
- **Testing**: See MONGODB_TESTING_GUIDE.md
- **Migration**: See FIREBASE_TO_MONGODB_MIGRATION.md
- **Server Logs**: Terminal output from `npm run dev`
- **Browser Logs**: DevTools Console (F12)
- **Database**: MongoDB Compass GUI
