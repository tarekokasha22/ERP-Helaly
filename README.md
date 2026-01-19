# Helaly Construction ERP

A modern, responsive web application for construction project management, built with React, TypeScript, and Tailwind CSS.

## 🏗️ Features

- **Dashboard**: Visual overview of project statuses, budgets, and recent activity
- **Projects Management**: Complete CRUD operations for construction projects
- **Sections Management**: Track progress of different project sections
- **Spending Management**: Monitor and control project expenses
- **Workers Management**: Manage worker accounts and permissions
- **Responsive Design**: Works seamlessly on mobile, tablet, and desktop devices
- **Multi-language Support**: English and Arabic localizations
- **Role-based Access Control**: Different capabilities for admin and worker roles
- **Modern UI**: Clean, professional interface with a focus on usability

## 🚀 Getting Started

### Prerequisites

- Node.js v14+ 
- npm v6+ or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/helaly-erp.git
   cd helaly-erp
   ```

2. Install dependencies:
   ```bash
   cd client
   npm install
   # or
   yarn install
   ```

3. Start the development server:
   ```bash
   npm start
   # or
   yarn start
   ```

4. Open your browser and navigate to `http://localhost:3000`

## 🧰 Technology Stack

### Frontend
- **React**: UI library
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **React Router**: Navigation and routing
- **React Query**: Data fetching and state management
- **React Toastify**: Toast notifications
- **Chart.js**: Interactive charts and visualizations
- **Headless UI**: Accessible UI components
- **Heroicons**: Beautiful SVG icons

### Development Tools
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Jest**: Testing framework

## 📁 Project Structure

```
client/
├── public/                # Static files
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── common/        # Generic components
│   │   └── ui/            # Specific UI components
│   ├── contexts/          # React context providers
│   ├── hooks/             # Custom React hooks
│   ├── pages/             # Page components
│   ├── services/          # API and service functions
│   │   └── mockApi.ts     # Mock API for local development
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Utility functions
│   ├── i18n/              # Internationalization files
│   ├── assets/            # Images, fonts, etc.
│   ├── App.tsx            # Main application component
│   └── index.tsx          # Entry point
├── package.json
└── tsconfig.json
```

## 🌐 API Integration

The application is designed to work with a backend API, but currently uses a mock API service (`mockApi.ts`) for development and demo purposes. The mock service simulates API responses and maintains in-memory data for:

- Authentication and user management
- Projects, sections, and spending data
- Dashboard statistics

To connect to a real backend:
1. Update the API service endpoints in `src/services/api.ts`
2. Set the `USE_MOCK_API` flag to `false` in relevant components

## 🔒 Authentication

The application includes a complete authentication system with:

- Login/logout functionality
- Role-based permissions (admin/worker)
- Protected routes
- Authentication context for global state

## 🎨 Customization

### Styling

The application uses Tailwind CSS for styling. You can customize the design by editing:

- `tailwind.config.js` for theme settings
- Individual component classes for specific styling

### Localization

To add or modify translations:
1. Navigate to the `src/i18n` directory
2. Edit the appropriate language files (e.g., `en.json` or `ar.json`)

## 📱 Responsive Design

The application is fully responsive, with optimized layouts for:
- Mobile devices (< 640px)
- Tablets (640px - 1024px)
- Desktop screens (> 1024px)

## 🧪 Testing

A manual test guide is available in `src/tests/crudTest.js` to verify all CRUD operations.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details. 