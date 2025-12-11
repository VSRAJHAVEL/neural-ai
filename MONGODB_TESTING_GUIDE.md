# MongoDB Authentication - Testing Guide

## Quick Start

### 1. Server Already Running?
Check terminal output from `npm run dev`. Should see:
```
Server setup complete, waiting for connections...
[express] serving on port 5000 (http://localhost:5000)
```

### 2. Access the Application
Open browser: `http://localhost:5000`

You should see:
- Login page with "Neural UI" branding
- Two tabs: "Sign In" and "Sign Up"
- Email and password inputs

---

## Test Cases

### Test 1: User Registration (Sign Up)
1. Click "Sign Up" tab
2. Enter new email: `testuser@example.com`
3. Enter password: `Test123456`
4. Click "Create Account" button
5. **Expected Result**: 
   - Auto-redirects to `/builder`
   - User created in MongoDB `users` collection
   - JWT token stored in browser's localStorage

**Verify in MongoDB**:
```javascript
// In MongoDB console
db.users.findOne({ email: "testuser@example.com" })
// Should show user with hashed password
```

### Test 2: User Login (Sign In)
1. Click "Sign In" tab
2. Enter email: `testuser@example.com`
3. Enter password: `Test123456`
4. Click "Enter Studio" button
5. **Expected Result**: 
   - Auto-redirects to `/builder`
   - Same JWT token used
   - Can access protected routes

### Test 3: Create & Save Project
1. After login, click "Create a new project" or any component
2. Add some components to the canvas
3. Enter project name in topbar (if available)
4. Click "Save" button
5. **Expected Result**:
   - Project saved to MongoDB `projects` collection
   - Toast notification: "Project Saved"
   - currentProjectId set in state

**Verify in MongoDB**:
```javascript
db.projects.findOne({ userId: "<user-id>" })
// Should show project with layout and components
```

### Test 4: Auto-Save (Background)
1. After creating a project, wait 30 seconds
2. Modify components on canvas (add/remove)
3. Watch for console logs or check MongoDB
4. **Expected Result**:
   - Every 30 seconds, project automatically saves
   - No user action required
   - Layout updates persisted

### Test 5: Load Existing Project
1. Navigate away from builder (e.g., refresh page)
2. Click "Load Project" (if button exists) or create new
3. **Expected Result**:
   - Project data loads from MongoDB
   - Components render correctly
   - Layout matches saved version

### Test 6: Delete Project
1. Create a project and save
2. Click "Delete" (if button exists) or use API
3. **Expected Result**:
   - Project removed from MongoDB
   - UI clears or redirects
   - Cannot load deleted project

### Test 7: Logout
1. Click logout button (in top navbar or menu)
2. Navigate back to login page
3. **Expected Result**:
   - JWT token removed from localStorage
   - Cannot access protected routes
   - Redirected to login

### Test 8: Invalid Credentials
1. Click "Sign In"
2. Enter correct email with wrong password
3. Click "Enter Studio"
4. **Expected Result**:
   - Error toast: "Invalid credentials"
   - User stays on login page
   - No redirect to builder

### Test 9: Duplicate Email
1. Click "Sign Up"
2. Use email from Test 1: `testuser@example.com`
3. Click "Create Account"
4. **Expected Result**:
   - Error toast: "Email already registered"
   - No new user created
   - Stays on signup form

---

## API Testing with curl

### Get All User Projects
```bash
# Replace <TOKEN> with actual JWT from localStorage
curl -X GET http://localhost:5000/api/projects \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json"
```

**Expected Response**:
```json
[
  {
    "id": "ObjectId",
    "userId": "user-id",
    "name": "Project Name",
    "layout": {...},
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
]
```

### Create Project via API
```bash
curl -X POST http://localhost:5000/api/projects \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "API Test Project",
    "layout": {"components": []}
  }'
```

### Update Project
```bash
curl -X PATCH http://localhost:5000/api/projects/<PROJECT_ID> \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Name",
    "layout": {"components": []}
  }'
```

### Delete Project
```bash
curl -X DELETE http://localhost:5000/api/projects/<PROJECT_ID> \
  -H "Authorization: Bearer <TOKEN>"
```

---

## Browser Developer Tools Testing

### View JWT Token
1. Open Developer Tools (F12)
2. Go to "Application" or "Storage" tab
3. Click "Local Storage"
4. Click on `http://localhost:5000`
5. Look for `auth_token` key
6. Copy value (long string starting with `eyJ...`)

### View User ID
In same Local Storage, look for `user_id` key

### View Network Requests
1. Go to "Network" tab
2. Perform signup/login/save actions
3. Click on `auth/signup`, `auth/signin`, or `projects` requests
4. View "Request" and "Response" tabs
5. Verify headers include `Authorization: Bearer <TOKEN>`

### View Console Logs
1. Go to "Console" tab
2. Look for `[ProjectContext]` logs showing auto-save activity
3. Check for any error messages

---

## MongoDB Verification

### Check User Created
```javascript
db.users.find()
// Shows all users with their hashed passwords

db.users.findOne({ email: "testuser@example.com" })
// Shows specific user document
```

### Check Projects
```javascript
db.projects.find()
// Shows all projects

db.projects.find({ userId: "<user-id>" })
// Shows projects for specific user

db.projects.findOne({ _id: ObjectId("<project-id>") })
// Shows specific project with full layout
```

### Check Indexes
```javascript
db.users.getIndexes()
// Should show unique index on email

db.projects.getIndexes()
// Should show indexes on userId and createdAt
```

---

## Common Issues & Debugging

### Issue: "Cannot read property 'id' of undefined"
**Cause**: User not authenticated
**Fix**: Sign up/login first, then try

### Issue: 401 Unauthorized on API calls
**Cause**: Invalid or missing JWT token
**Fix**: 
- Check localStorage has `auth_token`
- Try logout and login again
- Check token hasn't expired (7 days)

### Issue: "Email already registered"
**Cause**: User tried to sign up with existing email
**Fix**: Use "Sign In" instead or choose different email

### Issue: Project not saving
**Cause**: 
1. User not authenticated
2. MongoDB not connected
3. Network error
**Fix**:
- Check browser console for errors
- Verify MongoDB running: `mongosh` in terminal
- Check server terminal for error messages

### Issue: Wrong password accepted
**Cause**: This shouldn't happen - bcryptjs always validates
**Action**: Check server logs, likely an error was caught silently

### Issue: Auto-save not working
**Cause**: Project not loaded or no layout changes detected
**Fix**:
- Make a layout change (add component)
- Wait 30 seconds
- Check browser console logs

---

## Success Indicators

✅ **Sign Up Works**: Can create new user account  
✅ **Login Works**: Can authenticate with email/password  
✅ **JWT Stored**: Token visible in localStorage  
✅ **Create Project**: New project appears in database  
✅ **Save Project**: Changes persist after reload  
✅ **Auto-Save**: Changes saved every 30 seconds  
✅ **Delete Project**: Project removed from database  
✅ **Logout Works**: Token cleared from localStorage  
✅ **Protected Routes**: Cannot access without token  
✅ **Data Isolation**: Users see only their projects  

---

## Next Steps

After successful testing:
1. ✅ Remove Firebase SDK from package.json if not needed
2. ✅ Delete old Firebase service files
3. ✅ Deploy to production (update MongoDB connection string)
4. ✅ Add password reset functionality
5. ✅ Add project sharing/collaboration features
6. ✅ Add rate limiting on auth endpoints
