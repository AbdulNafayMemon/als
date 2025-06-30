# ALS Dashboard - Logistics Management System

A comprehensive logistics dashboard for ALS company with role-based access control, container tracking, and real-time updates.

## 🚀 Features

### 🔐 Role-Based Access Control
- **Admin**: Full access to all records, user management, and system configuration
- **Client**: Read-only access to their containers by PARTY NAME
- **Vendor**: Update transport info and upload proof of delivery for assigned jobs

### 📊 Dashboard Features
- **Real-time Container Tracking**: Monitor container status from pending to delivered
- **Advanced Filtering**: Filter by status, destination, date range, and transporter
- **Search Functionality**: Search by invoice number, container number, or party name
- **Document Management**: Upload and view B/L, invoices, and POD documents
- **Export Capabilities**: Export job data to PDF/Excel
- **Mobile Responsive**: Optimized for all device sizes

### 📋 Job Management
- **Complete Job Lifecycle**: From creation to delivery
- **Status Updates**: Track container status (pending, in transit, delivered, etc.)
- **Vehicle Tracking**: Record ATD (Arrival Time at Destination) and ARRV times
- **Document Upload**: Attach relevant documents per job
- **Remarks & Notes**: Add important notes and updates

## 🛠 Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Backend**: Node.js with Express API routes
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens with role-based middleware
- **File Upload**: Cloudinary integration
- **UI Components**: Lucide React icons, React Hot Toast notifications

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- MongoDB (local or cloud)
- npm or yarn

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd als-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp env.example .env.local
   ```
   
   Update `.env.local` with your configuration:
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/als_dashboard
   
   # JWT Secret (generate a strong secret)
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   
   # Cloudinary Configuration
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   
   # Email Configuration (optional)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   
   # App Configuration
   NEXT_PUBLIC_API_URL=http://localhost:3000/api
   NODE_ENV=development
   ```

4. **Database Setup**
   - Ensure MongoDB is running
   - The application will create collections automatically on first use

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Access the application**
   - Open [http://localhost:3000](http://localhost:3000)
   - Login with your credentials

## 👥 User Roles & Permissions

### Admin Dashboard
- **Full Access**: View, create, edit, and delete all jobs
- **User Management**: Add/remove clients and vendors
- **System Configuration**: Manage roles and permissions
- **Analytics**: View comprehensive statistics and reports

### Client Dashboard
- **Read-Only Access**: View only their containers by PARTY NAME
- **Search & Filter**: Find specific containers and track status
- **Document Access**: View uploaded documents for their jobs
- **Notifications**: Optional WhatsApp/email notifications

### Vendor Dashboard
- **Assigned Jobs**: View only jobs assigned to their transporter
- **Status Updates**: Update vehicle arrival times and delivery status
- **POD Upload**: Upload proof of delivery documents
- **Limited Fields**: Can only update transport-related information

## 📊 Data Structure

The system handles the following fields from your Excel sheets:

| Field | Description | Type |
|-------|-------------|------|
| DATE | Job date | Date |
| JOB # | Job number | String |
| INV # | Invoice number | String |
| PARTY NAME | Client name | String |
| CTNS/FCL/LCL | Container type | Enum |
| S.LINE | Shipping line | String |
| DESTINATION | Delivery destination | String |
| VESSEL | Vessel name | String |
| TRUCK | Truck information | String |
| CONTAINER # | Container numbers (array) | String[] |
| PORT | Port information | String |
| CUT OFF & ETD | Cut-off and ETD dates | Date |
| VEHICLE ATD | Vehicle arrival time | Date |
| VEHICLE ARRV | Vehicle arrival time | Date |
| TRANSPORTER | Transporter name | String |
| CELL # | Contact number | String |
| REMARKS | Additional notes | String |

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User login

### Jobs
- `GET /api/jobs` - Get jobs with filtering and pagination
- `POST /api/jobs` - Create new job (admin only)
- `GET /api/jobs/[id]` - Get specific job
- `PUT /api/jobs/[id]` - Update job
- `DELETE /api/jobs/[id]` - Delete job (admin only)

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms
- **Railway**: Connect repository and set environment variables
- **DigitalOcean**: Use App Platform or deploy to Droplet
- **AWS**: Deploy to EC2 or use Elastic Beanstalk

## 📱 Mobile Support

The dashboard is fully responsive and optimized for:
- Desktop computers
- Tablets
- Mobile phones
- Touch interfaces

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access**: Granular permissions per user role
- **Input Validation**: Server-side validation for all inputs
- **Rate Limiting**: API rate limiting to prevent abuse
- **CORS Protection**: Configured CORS for security
- **Environment Variables**: Secure configuration management

## 🧪 Testing

```bash
# Run linting
npm run lint

# Type checking
npx tsc --noEmit

# Build for production
npm run build
```

## 📈 Future Enhancements

- [ ] Excel import utility for bulk data migration
- [ ] WhatsApp/SMS integration for notifications
- [ ] Container tracking API integration (Maersk, Hapag)
- [ ] Advanced analytics and reporting
- [ ] Multi-language support
- [ ] Dark mode theme
- [ ] Real-time notifications with WebSocket
- [ ] Mobile app (React Native)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Contact the development team
- Check the documentation

## 🎯 Roadmap

### Phase 1 ✅ (Complete)
- Basic authentication and role management
- Admin dashboard with job management
- Client dashboard with read-only access
- Vendor dashboard with update capabilities

### Phase 2 🚧 (In Progress)
- Excel import utility
- Document upload and management
- Enhanced filtering and search
- Export functionality

### Phase 3 📋 (Planned)
- Real-time notifications
- Advanced analytics
- Mobile app development
- Third-party integrations

---

**Built with ❤️ for ALS Logistics** 