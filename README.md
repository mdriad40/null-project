# Admin UI - Routine Management System

A secure admin panel for managing class routines, teachers, students, and departments with Firebase authentication.

## 🔒 Security Features

- **Login Required**: Admin panel accessible only after authentication
- **Session-based Authentication**: Automatic logout on browser close
- **No Inline Scripts**: All JavaScript code in external files
- **Firebase Security**: Configuration separated from HTML
- **User Management**: Role-based access control (Main Admin vs Sub-Admin)
- **Account Blocking**: Ability to block/unblock users

## 🎨 Features

### Admin Panel
- **Dashboard**: Real-time analytics and user statistics
- **Department Management**: Add, edit, reorder departments
- **Routine Management**: Create and manage class schedules
- **Teacher Management**: Add, edit, delete teacher information
- **CR Info Management**: Manage class representatives
- **Section Info**: Manage section details and coordinators
- **User Management**: (Main Admin only) Add, edit, block users
- **Dark Theme**: Professional dark UI design

### Login Page
- **Secure Authentication**: Firebase-based login
- **Dark Theme**: Consistent with admin panel
- **Error Handling**: User-friendly error messages
- **Auto-redirect**: Redirects to admin panel after successful login

## 📁 File Structure

```
Admin_ui/
├── admin.html              # Main admin panel
├── login.html              # Login page
├── admin-auth.js           # Authentication & user management
├── admin.js                # Admin panel functionality
├── admin-styles.css        # Admin panel styles
├── admin-ui.js             # UI helpers (theme, mobile menu)
├── firebase-config.js      # Firebase configuration
├── login-auth.js           # Login authentication handler
├── login-styles.css        # Login page styles (dark theme)
├── styles.css              # Main app styles
└── README.md               # This file
```

## 🚀 Getting Started

### Prerequisites
- Firebase account
- Web server (local or hosted)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/Admin_ui.git
   cd Admin_ui
   ```

2. **Configure Firebase**
   - Update `firebase-config.js` with your Firebase credentials
   - Set up Firebase Realtime Database
   - Enable Firebase Authentication (Email/Password)

3. **Set up Firebase Security Rules**
   ```json
   {
     "rules": {
       "admin_users": {
         ".read": "auth != null",
         ".write": "auth != null && (
           root.child('admin_users').child(auth.uid).child('isMainAdmin').val() == true ||
           root.child('admin_users').child(auth.uid).child('email').val() == 'YOUR_MAIN_ADMIN_EMAIL'
         )"
       },
       "departments": {
         ".read": true,
         ".write": "auth != null"
       },
       "teachers": {
         ".read": "auth != null",
         ".write": "auth != null"
       }
     }
   }
   ```

4. **Deploy**
   - Upload files to your web server
   - Or use Firebase Hosting:
     ```bash
     firebase init hosting
     firebase deploy
     ```

## 🔐 First Time Setup

1. **Create Main Admin Account**
   - Go to Firebase Console → Authentication
   - Add user with email and password
   - Note the UID

2. **Set Main Admin in Database**
   - Go to Firebase Console → Realtime Database
   - Navigate to `admin_users/[UID]`
   - Set `isMainAdmin: true`

3. **Login**
   - Open `login.html`
   - Login with your credentials
   - You'll be redirected to admin panel

## 📖 Usage

### Admin Panel Access
1. Navigate to `login.html`
2. Enter your email and password
3. Click "Sign In"
4. You'll be redirected to `admin.html`

### User Management (Main Admin Only)
1. Login as main admin
2. Navigate to "User Management" from sidebar
3. Add new users with email and password
4. Edit, block, or delete users as needed

### Department Management
1. Go to "Department Add" section
2. Add new departments
3. Drag to reorder departments
4. Add sections for each department

### Routine Management
1. Select department, semester, and section
2. Choose day and time slot
3. Enter course details and teacher
4. Click "Add / Update"
5. Click "Publish Day" to save

## 🎨 Customization

### Changing Theme Colors
Edit CSS variables in `admin-styles.css` or `login-styles.css`:
```css
:root {
  --bg: #0a0a0f;
  --card: #13131a;
  --text: #e4e4e7;
  --primary: #6c63ff;
  --accent: #9e8cff;
}
```

### Adding New Features
1. Add HTML in appropriate section of `admin.html`
2. Add styles in `admin-styles.css`
3. Add functionality in `admin.js`

## 🔒 Security Best Practices

1. **Never commit Firebase credentials** to public repositories
2. **Use environment variables** for sensitive data in production
3. **Enable Firebase App Check** for additional security
4. **Implement rate limiting** to prevent brute force attacks
5. **Use HTTPS** in production
6. **Regularly update dependencies**
7. **Monitor Firebase Console** for suspicious activity

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Author

Your Name

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## ⭐ Show your support

Give a ⭐️ if this project helped you!

---

**Note**: This is a secure admin panel with authentication. Make sure to configure Firebase properly and never share your credentials.
