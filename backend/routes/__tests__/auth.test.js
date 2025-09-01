import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import authRouter from '../auth.js';
import User from '../../models/Users.js';

// Create test app
const app = express();
app.use(express.json());
app.use('/api', authRouter);

// Mock User model
jest.mock('../../models/Users.js');

describe('Auth Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/register', () => {
    test('successfully registers a new user', async () => {
      const mockUser = {
        email: 'test@example.com',
        role: 'auditor',
        save: jest.fn().mockResolvedValue(true)
      };

      User.findOne.mockResolvedValue(null);
      User.mockImplementation(() => mockUser);

      const response = await request(app)
        .post('/api/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          role: 'auditor'
        });

      expect(response.status).toBe(201);
      expect(response.body.email).toBe('test@example.com');
      expect(response.body.role).toBe('auditor');
      expect(response.body.message).toContain('Usuario registrado con éxito');
    });

    test('returns error when user already exists', async () => {
      User.findOne.mockResolvedValue({ email: 'test@example.com' });

      const response = await request(app)
        .post('/api/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          role: 'auditor'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('El usuario ya existe');
    });

    test('handles server errors', async () => {
      User.findOne.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/api/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          role: 'auditor'
        });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Error en el servidor');
    });
  });

  describe('POST /api/login', () => {
    test('successfully logs in with valid credentials', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const mockUser = {
        email: 'test@example.com',
        role: 'auditor',
        password: hashedPassword
      };

      User.findOne.mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/login')
        .send({
          user: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body.email).toBe('test@example.com');
      expect(response.body.role).toBe('auditor');
      expect(response.body.message).toContain('Login exitoso');
    });

    test('returns error when user not found', async () => {
      User.findOne.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/login')
        .send({
          user: 'nonexistent@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Usuario no encontrado');
    });

    test('returns error when password is incorrect', async () => {
      const hashedPassword = await bcrypt.hash('correctpassword', 10);
      const mockUser = {
        email: 'test@example.com',
        role: 'auditor',
        password: hashedPassword
      };

      User.findOne.mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/login')
        .send({
          user: 'test@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Contraseña incorrecta');
    });

    test('allows login with role instead of email', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const mockUser = {
        email: 'admin@example.com',
        role: 'administrador',
        password: hashedPassword
      };

      User.findOne.mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/login')
        .send({
          user: 'administrador',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body.role).toBe('administrador');
    });

    test('handles server errors', async () => {
      User.findOne.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/api/login')
        .send({
          user: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Error en el servidor');
    });
  });
});
