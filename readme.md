# FlowLite

FlowLite is a modern MERN-stack workforce and workflow management platform designed to streamline internal team operations such as request handling, approvals, notifications, and employee management.

Built with a clean UI, role-based access control, and a scalable architecture, FlowLite helps organizations manage workflow processes efficiently.


# Live Demo

Frontend: (flowlite-4d0iqkovp-charan-s-projects6.vercel.app)

Backend API: (https://flowlite-backend.onrender.com)


# Features

## Authentication & Security

* JWT-based authentication
* Secure login system
* Protected routes
* Session persistence
* Role-based access control

## Workflow Management

* Create workflow requests
* Approval & rejection system
* Role-based request visibility
* Status tracking
* Request history

## Notifications

* Real-time style notification system
* Mark notifications as read
* Mark all notifications as read
* Notification categorization

## Dashboard & Analytics

* Centralized dashboard
* Metrics overview
* Request statistics
* User activity insights

## UI/UX

* Responsive modern interface
* Mobile-friendly layout
* Smooth animations using Framer Motion
* Clean card-based design system
* Professional enterprise styling


# Tech Stack

## Frontend

* React.js
* React Router
* Axios
* Tailwind CSS
* Framer Motion
* Lucide React Icons

## Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT Authentication

## Deployment

* Vercel (Frontend)
* Render (Backend)
* GitHub (Version Control)

# Project Structure

```bash
FlowLite/
│
├── client/
│   ├── public/
│   └── src/
│       ├── api/
│       ├── assets/
│       ├── components/
│       ├── hooks/
│       ├── pages/
│       └── utils/
│
├── server/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── utils/
│
└── README.md


# Installation & Setup

## Clone Repository

```bash
git clone https://github.com/rsubacharan22/flowlite.git
cd flowlite

# Frontend Setup

```bash
cd client
npm install
npm start
```

Create a `.env` file inside `client/`

```env
REACT_APP_API_URL=http://localhost:5000
```

# Backend Setup

```bash
cd server
npm install
npm run dev
```

Create a `.env` file inside `server/`

```env
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret_key
PORT=5000
```

# API Routes

## Authentication

* POST `/api/auth/login`
* POST `/api/auth/register`

## Requests

* GET `/api/requests`
* POST `/api/requests`
* PUT `/api/requests/:id`

## Notifications

* GET `/api/notifications`
* PUT `/api/notifications/read/:id`
* PUT `/api/notifications/read-all`

---

# Deployment

## Frontend Deployment

Deployed using Vercel.

## Backend Deployment

Deployed using Render.

---

# Screenshots

Add screenshots here:

#login
<img width="1919" height="851" alt="image" src="https://github.com/user-attachments/assets/4975b6fe-0c36-4e54-b3dc-b77385ad852f" />

#My tasks(employee)
<img width="1919" height="853" alt="image" src="https://github.com/user-attachments/assets/b4b261b3-cdea-456f-94ca-f222d986a7ef" />

#My request(employee)
<img width="1917" height="848" alt="image" src="https://github.com/user-attachments/assets/ace824bf-5e15-4c34-a7f8-0c41d7a8b9e6" />

#Submit Request(employee)
<img width="1919" height="855" alt="image" src="https://github.com/user-attachments/assets/7b8d440d-2e69-43c2-a91d-707b566b97ac" />

#Profile settings
<img width="1565" height="745" alt="image" src="https://github.com/user-attachments/assets/7adf3a13-3bca-47ee-a50e-5d1e7cf6083f" />
<img width="1499" height="649" alt="image" src="https://github.com/user-attachments/assets/15ba18ac-d032-45db-a7bb-259357d7ce3b" />

#Dashboard(approver)
<img width="1891" height="838" alt="image" src="https://github.com/user-attachments/assets/adc6005e-62ec-4f5b-8d23-0cdf534f51db" />

#Assign Tasks(approver)
<img width="1908" height="837" alt="image" src="https://github.com/user-attachments/assets/36cc9bb8-9e22-4498-b4ae-e0e2e5a94563" />

#Approvals(approver)
<img width="1903" height="829" alt="image" src="https://github.com/user-attachments/assets/3b60a51b-8ddf-4048-a915-dc5ef7a6b6e8" />

#Team analytics(approver)
<img width="1907" height="842" alt="image" src="https://github.com/user-attachments/assets/f1e2b80d-6a59-494b-852e-a06c737b4b7d" />

#Notification
<img width="428" height="709" alt="image" src="https://github.com/user-attachments/assets/5bb055d5-b311-4ec6-b85d-90e5f9e91034" />

#Dashboard(Admin)
<img width="1912" height="844" alt="image" src="https://github.com/user-attachments/assets/691b8a41-ed17-4860-81a5-6bdb11f5d40b" />

#User Management(Admin)
<img width="1902" height="843" alt="image" src="https://github.com/user-attachments/assets/5d49ac15-e5f5-479b-a5cf-293415b52190" />


# Future Improvements

* Real-time WebSocket notifications
* File upload support
* Email notifications
* Advanced analytics
* Team management
* Docker support
* CI/CD pipelines

# Learning Outcomes

This project helped in understanding:

* Full-stack MERN architecture
* Authentication systems
* REST API development
* Frontend deployment
* Backend deployment
* Environment configuration
* Production debugging
* Git & GitHub workflows
* Role-based access control


# Author

Subacharan R

GitHub: (https://github.com/rsubacharan22)

# License

This project is licensed under the MIT License.
