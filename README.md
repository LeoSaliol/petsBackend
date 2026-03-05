# 🐾 PetSocial API

Backend API for a social network where users can register, create pets, post content, follow other users, like posts, and comment.

Built with:

- Node.js
- Express
- TypeScript
- Prisma
- PostgreSQL
- JWT Authentication
- Zod Validation

---

## 🚀 Features

- User registration & login (JWT)
- Pet management
- Create posts
- Like / Unlike posts
- Comment system
- Follow / Unfollow users
- Followers & Following counters
- Request validation with Zod
- Global error handling middleware
- CORS configured

---

## 📁 Project Structure

```
src/
 ├── controllers/
 ├── services/
 ├── routes/
 ├── middlewares/
 ├── validations/
 ├── utils/
 └── app.ts
```

---

## 🧠 Architecture

- Controllers → Handle HTTP layer
- Services → Business logic
- Middlewares → Validation & error handling
- Prisma → Database access layer

---

## 🛡 Error Handling

All errors are handled through a global error middleware.

Standard error response format:

```json
{
    "success": false,
    "message": "Error message"
}
```

---

## 📌 Future Improvements

- Pagination for feed
- Image upload support
- Rate limiting
- Email verification
- Password reset
- Refresh tokens

---
