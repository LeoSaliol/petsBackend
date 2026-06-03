"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPasswordResetEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const transporter = nodemailer_1.default.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});
const sendPasswordResetEmail = async (email, token) => {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4321';
    const resetLink = `${frontendUrl}/reset-password?token=${token}`;
    await transporter.sendMail({
        from: process.env.SMTP_FROM || 'noreply@michigram.com',
        to: email,
        subject: 'Recuperación de contraseña - Michigram',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #e74c73;">Recuperación de contraseña</h2>
        <p>Hemos recibido una solicitud para restablecer tu contraseña en Michigram.</p>
        <p>Haz clic en el siguiente botón para crear una nueva contraseña:</p>
        <a href="${resetLink}" style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #6b5b95, #e74c73); color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 16px 0;">
          Restablecer contraseña
        </a>
        <p style="color: #888; font-size: 13px;">Este enlace expira en 1 hora. Si no solicitaste este cambio, ignora este correo.</p>
        <p style="color: #888; font-size: 13px;">O copia este enlace en tu navegador:<br/>${resetLink}</p>
      </div>
    `,
    });
};
exports.sendPasswordResetEmail = sendPasswordResetEmail;
