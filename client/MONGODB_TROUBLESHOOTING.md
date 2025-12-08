# MongoDB Authentication Error Troubleshooting Guide

## Error: `bad auth : authentication failed` (Code: 8000)

This error occurs when MongoDB Atlas cannot authenticate your connection. Here's how to fix it:

## 🔍 Common Causes & Solutions

### 1. **Incorrect Password or Username**
- **Check:** Verify your MongoDB Atlas username and password
- **Solution:** 
  - Go to MongoDB Atlas → Database Access
  - Verify the username is correct
  - Reset the password if needed
  - Update your `MONGO_URI` in `.env.local`

### 2. **Special Characters in Password Not URL-Encoded**
- **Problem:** Passwords with special characters (`!@#$%^&*()`) break the connection string
- **Solution:** URL-encode special characters in your password:
  ```
  ! → %21
  @ → %40
  # → %23
  $ → %24
  % → %25
  ^ → %5E
  & → %26
  * → %2A
  ( → %28
  ) → %29
  ```
  
  **Example:**
  ```
  Password: MyP@ssw0rd!
  Encoded: MyP%40ssw0rd%21
  ```

### 3. **IP Address Not Whitelisted**
- **Check:** MongoDB Atlas → Network Access → IP Access List
- **Solution:**
  - Add your current IP address
  - Or add `0.0.0.0/0` for development (allows all IPs - **NOT recommended for production**)
  - For Vercel deployment, add Vercel's IP ranges or use `0.0.0.0/0`

### 4. **Database User Doesn't Exist**
- **Check:** MongoDB Atlas → Database Access
- **Solution:** Create a new database user with appropriate permissions

### 5. **Incorrect Connection String Format**
- **Correct Format:**
  ```
  mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
  ```
- **Common Mistakes:**
  - Missing `mongodb+srv://` prefix
  - Missing `@` before cluster name
  - Incorrect database name
  - Missing password encoding

## 🛠️ Step-by-Step Fix

### Step 1: Verify MongoDB Atlas Setup
1. Log into [MongoDB Atlas](https://cloud.mongodb.com/)
2. Go to **Database Access** → Verify user exists
3. Go to **Network Access** → Add your IP or `0.0.0.0/0`
4. Go to **Database** → Get connection string

### Step 2: Fix Connection String
1. Copy the connection string from MongoDB Atlas
2. Replace `<password>` with your actual password (URL-encoded if needed)
3. Replace `<database>` with your database name (e.g., `furever`)
4. Update `.env.local`:
   ```env
   MONGO_URI=mongodb+srv://username:encodedpassword@cluster.mongodb.net/furever?retryWrites=true&w=majority
   ```

### Step 3: Test Connection
1. Restart your development server
2. Check console for connection success message
3. If still failing, test connection string in MongoDB Compass

## 🔐 Password Encoding Example

If your password is: `MyP@ssw0rd!123`

1. Identify special characters: `@` and `!`
2. Encode them:
   - `@` → `%40`
   - `!` → `%21`
3. Encoded password: `MyP%40ssw0rd%21123`

**Full connection string:**
```
mongodb+srv://myuser:MyP%40ssw0rd%21123@cluster.mongodb.net/furever
```

## 🌐 Vercel Deployment

For Vercel deployment:
1. Add `MONGO_URI` to Vercel Environment Variables
2. Ensure IP whitelist includes Vercel's IP ranges or use `0.0.0.0/0`
3. Use URL-encoded password in the connection string

## ✅ Quick Checklist

- [ ] MongoDB Atlas user exists and is active
- [ ] Password is correct (and URL-encoded if needed)
- [ ] IP address is whitelisted in Network Access
- [ ] Connection string format is correct
- [ ] Database name matches your MongoDB database
- [ ] `.env.local` file has correct `MONGO_URI`
- [ ] Restarted development server after changes

## 🆘 Still Having Issues?

1. **Test with MongoDB Compass:**
   - Download MongoDB Compass
   - Try connecting with your connection string
   - This will help identify the exact issue

2. **Check MongoDB Atlas Logs:**
   - Go to MongoDB Atlas → Monitoring → Logs
   - Look for authentication failure messages

3. **Create a New Database User:**
   - Sometimes it's easier to create a fresh user
   - Set appropriate permissions (read/write to your database)

4. **Verify Environment Variables:**
   - Ensure `.env.local` is in the `client` folder
   - Check that `MONGO_URI` is set correctly
   - No extra spaces or quotes around the value

