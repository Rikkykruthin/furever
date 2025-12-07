# 🐾 FurEver - Pet Care Platform

A comprehensive Next.js platform for pet care services including veterinary consultations, pet training, grooming, food donations, emergency reporting, and community features.

## 🚀 Features

- **Veterinary Consultations** - Book appointments with verified veterinarians (online/in-person)
- **Pet Training** - Find and book sessions with professional pet trainers
- **Pet Grooming** - Schedule grooming appointments
- **Food Donations** - Donate and reserve pet food for those in need
- **Emergency Reporting** - Report injured street animals for rescue
- **Community** - Share posts, photos, and connect with other pet owners
- **E-commerce Store** - Purchase pet products with Stripe integration
- **Real-time Chat** - Video and text chat with veterinarians during consultations
- **Google OAuth** - Sign in with Google
- **Admin Dashboard** - Manage veterinarians, trainers, and platform content

## 📋 Prerequisites

- Node.js 18+ and npm/yarn
- MongoDB database
- Stripe account (for payments)
- Cloudinary account (for image uploads)
- Google Cloud Console project (for OAuth)
- CometChat account (for chat features)

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd furever/client
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the `client` directory with the following variables:

   ```env
   # Database
   MONGO_URI=your_mongodb_connection_string

   # JWT Secrets
   JWT_USER_SECRET=your_jwt_user_secret
   JWT_SELLER_SECRET=your_jwt_seller_secret
   JWT_ADMIN_SECRET=your_jwt_admin_secret

   # Stripe Payment Gateway
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

   # Cloudinary (Image/Video Upload)
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   NEXT_PUBLIC_CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret

   # Google OAuth
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret

   # Application URLs
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   NEXT_PUBLIC_URL=http://localhost:3000

   # CometChat (Chat & Video Calls)
   NEXT_PUBLIC_COMETCHAT_APP_ID=your_cometchat_app_id
   NEXT_PUBLIC_COMETCHAT_REGION=your_cometchat_region
   NEXT_PUBLIC_COMETCHAT_AUTH_KEY=your_cometchat_auth_key

   # Node Environment
   NODE_ENV=development
   ```

4. **Set up Google OAuth** (Optional but recommended)
   
   Follow the instructions in [`GOOGLE_OAUTH_SETUP.md`](./GOOGLE_OAUTH_SETUP.md) to configure Google login.

5. **Fix database index** (One-time setup for Google OAuth)
   ```bash
   npm run fix-name-index
   ```

6. **Populate sample data** (Optional)
   ```bash
   npm run setup-data
   ```
   This creates sample veterinarians, trainers, and groomers for testing.

7. **Run the development server**
   ```bash
   npm run dev
   ```

8. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📚 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run setup-data` - Populate sample data (vets, trainers, groomers)
- `npm run setup-vets` - Set up only veterinarians
- `npm run setup-trainers` - Set up only trainers
- `npm run setup-groomers` - Set up only groomers
- `npm run setup-products` - Set up sample products
- `npm run fix-name-index` - Fix database index for Google OAuth

## 🗂️ Project Structure

```
client/
├── src/
│   ├── app/                    # Next.js app router pages
│   │   ├── (auth)/            # Authentication pages
│   │   ├── (homepage)/        # Homepage
│   │   ├── api/               # API routes
│   │   ├── admin/             # Admin dashboard
│   │   ├── dashboard/        # User/Seller dashboards
│   │   ├── vet-consultation/  # Vet booking pages
│   │   └── ...
│   ├── components/            # Reusable React components
│   └── lib/                   # Utility functions
├── db/                        # Database schemas and config
├── actions/                   # Server actions
└── scripts/                   # Utility scripts
```

## 🔐 Authentication

The platform supports three types of authentication:
- **User Authentication** - For regular pet owners
- **Seller Authentication** - For product sellers
- **Admin Authentication** - For platform administrators

Users can sign up with email/password or use Google OAuth.

## 💳 Payment Integration

Stripe is integrated for:
- Veterinary appointment payments
- Grooming appointment payments
- Product purchases
- Training session payments

Make sure to configure Stripe webhooks for production deployments.

## 📸 Image Upload

Cloudinary is used for image uploads in:
- User profile pictures
- Pet photos
- Food donation images
- Community posts
- Product images
- Emergency reports

## 🎨 Tech Stack

- **Framework:** Next.js 15 (App Router)
- **UI Library:** React 19
- **Styling:** Tailwind CSS 4
- **UI Components:** Shadcn UI, Radix UI
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT, Google OAuth
- **Payments:** Stripe
- **File Upload:** Cloudinary
- **Chat:** CometChat
- **Animations:** Framer Motion
- **3D Graphics:** Three.js, React Three Fiber

## 📖 Documentation

- [`GOOGLE_OAUTH_SETUP.md`](./GOOGLE_OAUTH_SETUP.md) - Google OAuth configuration guide
- [`DATA_SETUP.md`](./DATA_SETUP.md) - Sample data setup guide

## 🐛 Troubleshooting

### Database Connection Issues
- Ensure MongoDB URI is correct in `.env.local`
- Check if MongoDB is running and accessible

### Stripe Payment Issues
- Verify Stripe keys are correct
- Ensure webhook endpoint is configured in Stripe dashboard
- Check webhook secret matches your environment variable

### Google OAuth Issues
- Follow the setup guide in `GOOGLE_OAUTH_SETUP.md`
- Ensure redirect URIs match exactly in Google Cloud Console
- Run `npm run fix-name-index` if you encounter duplicate name errors

### Image Upload Issues
- Verify Cloudinary credentials
- Check Cloudinary folder permissions
- Ensure image size is within limits

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is private and proprietary.

## 👥 Support

For issues and questions, please open an issue in the repository.

---

Built with ❤️ for pet lovers everywhere 🐾
