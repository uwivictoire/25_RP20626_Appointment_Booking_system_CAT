# Authentication System Guide

## New Features Added

### 1. **Login Page** (`login.html`)
- Professional gradient design
- Email and password authentication
- Password visibility toggle
- Remember me functionality
- Redirects to dashboard for admins, home for regular users

### 2. **Register Page** (`register.html`)
- User registration form with validation
- Password strength indicator
- Confirm password matching
- Terms & conditions acceptance
- Automatic redirect to login after successful registration

### 3. **Admin Dashboard** (`dashboard.html`)
- Full admin panel with sidebar navigation
- Real-time statistics:
  - Total appointments
  - Pending appointments
  - Confirmed appointments
  - Completed appointments
- Recent appointments table
- Quick actions panel
- User management section
- Reports & analytics (placeholder for charts)
- Settings panel
- Responsive design (mobile-friendly)

### 4. **Updated Main Page** (`index.html`)
- Authentication status bar
- User welcome message when logged in
- Login/Register buttons for guests
- Logout functionality

## Default Admin Credentials

```
Email: admin@appointment.com
Password: admin123
```

## How to Use

### For Users:
1. Visit the home page
2. Click "Register" to create an account
3. Fill in your details and submit
4. Login with your credentials
5. Book appointments as usual

### For Admins:
1. Login with admin credentials
2. Access the dashboard at `/dashboard.html`
3. View all appointments and statistics
4. Manage users and system settings
5. Export data and view reports

## API Endpoints Added

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Request Examples

#### Register
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "password": "password123"
}
```

#### Login
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(20) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## File Structure

```
public/
├── index.html          # Main booking page (updated with auth)
├── login.html          # Login page
├── register.html       # Registration page
└── dashboard.html      # Admin dashboard
```

## Security Notes

⚠️ **Important**: This is a basic implementation for demonstration purposes.

For production use, you should:
1. Hash passwords using bcrypt or similar
2. Implement proper JWT token authentication
3. Add middleware to protect routes
4. Implement CSRF protection
5. Add rate limiting
6. Use HTTPS
7. Add input sanitization
8. Implement proper session management

## Features Overview

✅ User registration and login
✅ Role-based access (user/admin)
✅ Admin dashboard with statistics
✅ Responsive design
✅ Password visibility toggle
✅ Remember me functionality
✅ Session management
✅ User-friendly interface
✅ Professional gradient design

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Technologies Used

- **Frontend**: HTML5, CSS3, Bootstrap 5.3.2, Font Awesome 6.0.0
- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **Authentication**: Session storage / Local storage

## Next Steps

To enhance the system further, consider:
1. Email verification
2. Password reset functionality
3. Two-factor authentication
4. User profile management
5. Appointment notifications
6. Calendar integration
7. Advanced reporting with Chart.js
8. File uploads for documents
9. SMS notifications
10. Payment integration
