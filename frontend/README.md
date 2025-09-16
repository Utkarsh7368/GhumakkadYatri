# Ghumakkad Yatri Frontend

A modern, responsive React.js frontend for the Ghumakkad Yatri travel booking website.

## Features

- 🎨 **Modern Design**: Clean, minimal UI with Tailwind CSS
- 📱 **Responsive**: Mobile-first design that works on all devices
- 🌙 **Dark Mode**: Toggle between light and dark themes
- ⚡ **Performance**: Lazy loading and optimized components
- 🎭 **Animations**: Smooth Framer Motion animations
- 🔐 **Authentication**: User login/register with protected routes
- 🎯 **TypeScript Ready**: Easy to migrate to TypeScript
- 📦 **Component Library**: Reusable, well-documented components

## Tech Stack

- **React 18** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **React Router** - Client-side routing
- **React Query** - Server state management
- **React Hook Form** - Form handling
- **Axios** - HTTP client
- **React Hot Toast** - Toast notifications

## Quick Start

### Prerequisites

- Node.js 16+ and npm
- Backend server running on port 5000

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Update the `.env` file with your backend URL:
   ```
   VITE_API_BASE_URL=http://localhost:5000
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:3000
   ```

### Build for Production

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Navbar.jsx      # Navigation bar with dark mode
│   ├── Footer.jsx      # Site footer
│   ├── PackageCard.jsx # Travel package card
│   ├── Loader.jsx      # Loading components
│   ├── ScrollToTop.jsx # Scroll to top button
│   └── Layout.jsx      # Main layout wrapper
├── contexts/           # React contexts
│   └── AuthContext.jsx # Authentication context
├── pages/             # Page components
│   ├── Home.jsx       # Landing page
│   ├── Packages.jsx   # Package listing
│   ├── PackageDetails.jsx # Package details
│   ├── Login.jsx      # Login page
│   ├── About.jsx      # About page
│   └── Contact.jsx    # Contact page
├── services/          # API services
│   ├── api.js         # Axios configuration
│   └── index.js       # API endpoints
├── App.jsx            # Main app component
├── main.jsx           # App entry point
└── index.css          # Global styles
```

## Key Components

### Navbar
- Responsive navigation with mobile menu
- Dark mode toggle
- User authentication state
- Smooth animations

### PackageCard
- Hover animations
- Rating display
- Price formatting
- Responsive design

### Layout
- Consistent header/footer
- Scroll to top functionality
- Dark mode support

## API Integration

The frontend is configured to work with your backend API:

```javascript
// Login
POST /api/auth/login
// Register  
POST /api/auth/register
// Get packages
POST /api/admin/getPackages
// Create package (admin)
POST /api/admin/createPackage
```

## Styling

### Tailwind CSS Classes
- `btn-primary` - Primary button style
- `btn-secondary` - Secondary button style  
- `card` - Card container style
- `input-field` - Form input style

### Dark Mode
Dark mode is implemented using Tailwind's `dark:` prefix and managed via React state.

## Animations

Framer Motion animations include:
- Page transitions
- Scroll-triggered animations
- Hover effects
- Loading states

## Environment Variables

```bash
VITE_API_BASE_URL=http://localhost:5000  # Backend API URL
VITE_APP_NAME=Ghumakkad Yatri           # App name
VITE_APP_VERSION=1.0.0                  # App version
```

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Performance Tips

- Images are lazy loaded
- Routes are code-split
- Animations are optimized
- Bundle size is monitored

## Demo Credentials

For testing the login functionality:
- **User**: user@demo.com / password123
- **Admin**: admin@demo.com / password123

## Deployment

### Vercel (Recommended)
```bash
npm run build
# Deploy dist/ folder to Vercel
```

### Netlify
```bash
npm run build
# Deploy dist/ folder to Netlify
```

### Custom Server
```bash
npm run build
# Serve dist/ folder with any static file server
```

## License

MIT License - see LICENSE file for details