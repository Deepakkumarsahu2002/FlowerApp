# Admin Panel Debugging Guide

## Issues Fixed

### 1. **Blank Page After Login**
   - **Problem**: After successful login, pages were showing blank
   - **Root Cause**: API calls failing silently, causing authentication state to be cleared
   - **Fix**: 
     - Added better error handling that distinguishes between auth errors (401/403) and network/API errors
     - If `getMe()` fails after login but login succeeded, create a temporary user object
     - Keep stored user data if API fails for non-auth reasons
     - Added comprehensive console logging for debugging

### 2. **Loading State Management**
   - **Problem**: Loading state could get stuck, causing infinite loading
   - **Fix**: Properly set loading to false in all code paths (success and error)

### 3. **Error Handling**
   - **Problem**: All API errors were treated the same way
   - **Fix**: 
     - Distinguish between authentication errors (401/403) and other errors
     - Only clear tokens on auth errors
     - For network/500 errors, try to use stored user data

## How to Debug

### 1. Check Browser Console
Open browser DevTools (F12) and check the Console tab. You should see:
- `Admin API Base URL: http://localhost:5000/api`
- `Attempting login...`
- `Login successful, token received`
- `User data fetched: {...}` or error messages

### 2. Check Network Tab
In DevTools Network tab, check:
- Is the backend running on `http://localhost:5000`?
- Are API calls being made?
- What status codes are returned?
- Are there CORS errors?

### 3. Check LocalStorage
In DevTools Application/Storage tab, check:
- `adminToken` - Should contain JWT token after login
- `adminUser` - Should contain user object after login

### 4. Common Issues

#### Backend Not Running
**Symptom**: All API calls fail with network errors
**Solution**: Start your backend server on `localhost:5000`

#### Wrong API URL
**Symptom**: Console shows different API URL than expected
**Solution**: Check `.env` file has `VITE_API_BASE_URL=http://localhost:5000/api`

#### CORS Errors
**Symptom**: Network tab shows CORS errors
**Solution**: Configure backend to allow requests from admin frontend origin

#### Invalid Token
**Symptom**: 401/403 errors after login
**Solution**: 
- Clear localStorage and try logging in again
- Check backend token validation

## Testing Steps

1. **Clear Browser Data**
   - Open DevTools → Application → Clear Storage → Clear site data

2. **Check Backend**
   - Ensure backend is running on `localhost:5000`
   - Test API endpoint: `http://localhost:5000/api/auth/login` (should return error without credentials, not 404)

3. **Login**
   - Enter credentials
   - Watch console for logs
   - Check Network tab for API calls
   - Verify localStorage has `adminToken` and `adminUser`

4. **Check Dashboard**
   - Should see dashboard content, not blank page
   - Check console for any errors
   - Check Network tab for failed requests

## Console Logs to Look For

### Successful Login Flow:
```
Admin API Base URL: http://localhost:5000/api
Attempting login...
Login successful, token received
User data fetched: {_id: "...", email: "...", name: "..."}
```

### If getMe() Fails After Login:
```
Login successful, token received
Failed to fetch user details after login: [error]
```
- App will still work with temporary user object
- You'll see a toast notification

### If Backend is Down:
```
Login error: Failed to fetch
```
- Check if backend is running
- Check API URL is correct

## Environment Variables

Make sure `admin/.env` exists with:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## Still Having Issues?

1. **Check all console errors** - They will tell you exactly what's failing
2. **Check Network tab** - See which API calls are failing
3. **Verify backend is running** - Test with Postman/curl
4. **Clear localStorage** - Remove `adminToken` and `adminUser`
5. **Check browser compatibility** - Use Chrome/Firefox latest version
