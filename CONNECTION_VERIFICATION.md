# Frontend-Backend Connection Verification

## Configuration Check ✅

### Backend Configuration
- ✅ **CORS**: Configured to allow `http://localhost:5173`
- ✅ **Port**: Default port 3000 (configurable via env)
- ✅ **API Routes**: All routes prefixed with `/api`
- ✅ **Authentication**: JWT token-based authentication
- ✅ **Error Handling**: Proper error middleware in place

### Frontend Configuration
- ✅ **Proxy**: Vite proxy configured for `/api` → `http://localhost:3000`
- ✅ **API Service**: Axios instance with baseURL `/api`
- ✅ **Token Management**: Token stored in localStorage
- ✅ **Protected Routes**: ProtectedRoute component for auth
- ✅ **Error Handling**: Proper error handling in components

## Connection Flow

1. **Frontend Request** → `/api/users/login`
2. **Vite Proxy** → Forwards to `http://localhost:3000/api/users/login`
3. **Backend CORS** → Validates origin `http://localhost:5173`
4. **Backend Route** → Handles request and returns response
5. **Frontend Response** → Receives response and updates UI

## API Endpoints Verified

### Authentication
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - Login user
- `GET /api/users/me` - Get current user (Protected)

### Health Check
- `GET /health` - Server health check

## Testing Steps

### 1. Start Backend Server
```bash
cd Backend
npm start
# or
npm run dev
```
Expected output:
- ✅ Server is running on port 3000
- ✅ Database connection established
- ✅ Database synced successfully

### 2. Start Frontend Server
```bash
cd frontend
npm run dev
```
Expected output:
- ✅ Vite dev server running on port 5173
- ✅ Proxy configured for `/api`

### 3. Test Health Check
Open browser: `http://localhost:3000/health`
Expected: JSON response with `success: true`

### 4. Test Frontend
Open browser: `http://localhost:5173`
Expected: Home page loads

### 5. Test Registration
1. Click "Sign Up"
2. Fill in form (name, email, password)
3. Submit
Expected: 
- ✅ User registered successfully
- ✅ Token stored in localStorage
- ✅ Redirected to dashboard
- ✅ User info displayed

### 6. Test Login
1. Click "Login"
2. Enter email and password
3. Submit
Expected:
- ✅ Login successful
- ✅ Token stored in localStorage
- ✅ Redirected to dashboard
- ✅ User info displayed

### 7. Test Protected Route
1. Try accessing `/dashboard` without token
Expected: Redirected to `/login`

2. Login and access `/dashboard`
Expected: Dashboard loads with user info

### 8. Test API from Frontend
Open browser console:
```javascript
// Check if token is stored
localStorage.getItem('token')

// Check if user is stored
localStorage.getItem('user')
```

## Common Issues & Solutions

### Issue: CORS Error
**Solution**: 
- Verify backend CORS allows `http://localhost:5173`
- Check if frontend is running on port 5173
- Verify `FRONTEND_URL` in backend `.env` file

### Issue: Proxy Not Working
**Solution**:
- Verify Vite config has proxy setup
- Check if backend is running on port 3000
- Verify proxy target URL is correct

### Issue: 401 Unauthorized
**Solution**:
- Check if token is stored in localStorage
- Verify token is sent in Authorization header
- Check if token is expired
- Verify JWT_SECRET matches

### Issue: Database Connection Error
**Solution**:
- Verify MySQL is running
- Check database credentials in `.env`
- Verify database exists
- Check database connection string

### Issue: Network Error
**Solution**:
- Verify both servers are running
- Check if ports are not in use
- Verify firewall settings
- Check network connectivity

## Verification Checklist

- [ ] Backend server starts without errors
- [ ] Frontend server starts without errors
- [ ] Database connection established
- [ ] Health check endpoint works
- [ ] Frontend can access backend via proxy
- [ ] Registration works
- [ ] Login works
- [ ] Token is stored in localStorage
- [ ] Protected routes work
- [ ] Logout works
- [ ] Error messages display correctly
- [ ] CORS headers are correct
- [ ] API responses are in correct format

## Next Steps

1. Test all API endpoints
2. Test error scenarios
3. Test token expiration
4. Test concurrent requests
5. Test different browsers
6. Test on different devices (if needed)

## Notes

- Backend runs on port 3000
- Frontend runs on port 5173
- Proxy forwards `/api` to `http://localhost:3000/api`
- CORS allows `http://localhost:5173`
- Tokens stored in localStorage
- JWT tokens expire in 7 days (default)

