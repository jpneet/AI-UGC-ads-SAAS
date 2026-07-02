# 🚀 AI UGC Ads SaaS

An AI-powered SaaS platform that enables users to generate high-quality User Generated Content (UGC) advertisements using artificial intelligence. Users can upload product images, provide prompts, and generate engaging marketing creatives with an intuitive and modern interface.

## ✨ Features

* 🔐 Secure Authentication with Clerk
* 🎨 AI Image Generation
* 🎥 AI Video Generation
* 💳 Credit-based Usage System
* 📂 Project Management Dashboard
* 🌍 Publish & Unpublish Generated Projects
* ☁️ Cloud Media Storage
* 📱 Responsive UI
* ⚡ Fast REST APIs
* 🛡️ Error Monitoring with Sentry

---

## 🛠️ Tech Stack

### Frontend

* React.js
* TypeScript
* Tailwind CSS
* React Router
* Clerk Authentication

### Backend

* Node.js
* Express.js
* TypeScript
* Prisma ORM

### Database

* PostgreSQL

### AI & Cloud Services

* AI Image Generation API
* AI Video Generation API
* Cloudinary
* Clerk
* Sentry

---

## 📁 Project Structure

```text
AI-UGC-ads-SAAS/
│
├── client/
│   ├── src/
│   ├── public/
│   └── ...
│
├── server/
│   ├── controllers/
│   ├── routes/
│   ├── prisma/
│   ├── configs/
│   └── ...
│
└── README.md
```

---

## ⚙️ Installation

### 1. Clone the repository

```bash
git clone https://github.com/jpneet/AI-UGC-ads-SAAS.git
cd AI-UGC-ads-SAAS
```

### 2. Install dependencies

#### Frontend

```bash
cd client
npm install
```

#### Backend

```bash
cd ../server
npm install
```

---

## 🔑 Environment Variables

Create a `.env` file inside the **server** directory.

```env
DATABASE_URL=

CLERK_SECRET_KEY=
CLERK_PUBLISHABLE_KEY=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

SENTRY_DSN=

# Add your AI provider API keys here
AI_API_KEY=
```

---

## ▶️ Run the Application

### Backend

```bash
cd server
npm run dev
```

### Frontend

```bash
cd client
npm run dev
```

---

## 🎯 Future Improvements

* AI Voice Generation
* Multiple AI Model Support
* Team Collaboration
* Analytics Dashboard
* Social Media Publishing

---

## 🤝 Contributing

Contributions, suggestions, and bug reports are welcome.

1. Fork the repository
2. Create a new branch
3. Commit your changes
4. Push the branch
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Japneet Singh**

---

⭐ If you found this project useful, consider giving it a **Star** on GitHub!
