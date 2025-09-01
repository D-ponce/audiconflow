import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../Users.js';

describe('User Model', () => {
  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect('mongodb://localhost:27017/audiconflow_test');
  });

  afterAll(async () => {
    // Clean up and close connection
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clear users collection before each test
    await User.deleteMany({});
  });

  test('creates user with hashed password', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'plainpassword',
      role: 'auditor'
    };

    const user = new User(userData);
    const savedUser = await user.save();

    expect(savedUser.email).toBe(userData.email);
    expect(savedUser.role).toBe(userData.role);
    expect(savedUser.password).not.toBe(userData.password); // Should be hashed
    expect(savedUser.password.length).toBeGreaterThan(50); // Hashed passwords are long
  });

  test('validates required fields', async () => {
    const user = new User({});

    let error;
    try {
      await user.save();
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.errors.email).toBeDefined();
    expect(error.errors.password).toBeDefined();
    expect(error.errors.role).toBeDefined();
  });

  test('validates email format', async () => {
    const user = new User({
      email: 'invalid-email',
      password: 'password123',
      role: 'auditor'
    });

    let error;
    try {
      await user.save();
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.errors.email).toBeDefined();
  });

  test('validates role enum values', async () => {
    const user = new User({
      email: 'test@example.com',
      password: 'password123',
      role: 'invalid-role'
    });

    let error;
    try {
      await user.save();
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.errors.role).toBeDefined();
  });

  test('prevents duplicate emails', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'password123',
      role: 'auditor'
    };

    // Create first user
    const user1 = new User(userData);
    await user1.save();

    // Try to create second user with same email
    const user2 = new User(userData);
    
    let error;
    try {
      await user2.save();
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.code).toBe(11000); // MongoDB duplicate key error
  });

  test('password is hashed before saving', async () => {
    const plainPassword = 'testpassword123';
    const user = new User({
      email: 'test@example.com',
      password: plainPassword,
      role: 'auditor'
    });

    await user.save();

    // Verify password was hashed
    expect(user.password).not.toBe(plainPassword);
    
    // Verify hash can be compared
    const isMatch = await bcrypt.compare(plainPassword, user.password);
    expect(isMatch).toBe(true);
  });

  test('sets default timestamps', async () => {
    const user = new User({
      email: 'test@example.com',
      password: 'password123',
      role: 'auditor'
    });

    const savedUser = await user.save();

    expect(savedUser.createdAt).toBeDefined();
    expect(savedUser.updatedAt).toBeDefined();
    expect(savedUser.createdAt).toBeInstanceOf(Date);
    expect(savedUser.updatedAt).toBeInstanceOf(Date);
  });
});
