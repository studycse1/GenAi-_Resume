import express from 'express';
import { register, login, logout, verifyAuth } from '../controllers/auth.controller.js';

/**
 * Express router for authentication routes
 * @type {express.Router}
 */
const router = express.Router();

/**
 * POST /api/auth/register
 * Register a new user with username, email, and password
 * @route POST /register
 * @param {string} username.body.required - Username for the new user
 * @param {string} email.body.required - Email for the new user
 * @param {string} password.body.required - Password for the new user
 * @returns {Object} 201 - User successfully registered with user data
 * @returns {Object} 400 - Missing required fields or user already exists
 * @returns {Object} 500 - Server error
 */
router.post('/register', (req, res, next) => {
    console.log('📝 Register request received:', { username: req.body.username, email: req.body.email });
    register(req, res, next);
});

/**
 * POST /api/auth/login
 * Login a user with email and password
 * @route POST /login
 * @param {string} email.body.required - User email
 * @param {string} password.body.required - User password
 * @returns {Object} 200 - User successfully logged in with user data
 * @returns {Object} 400 - Missing email or password
 * @returns {Object} 401 - Invalid email or password
 * @returns {Object} 500 - Server error
 */
router.post('/login', (req, res, next) => {
    console.log('🔐 Login request received:', { email: req.body.email });
    login(req, res, next);
});

/**
 * POST /api/auth/logout
 * Logout the current user by clearing the auth cookie
 * @route POST /logout
 * @returns {Object} 200 - User successfully logged out
 * @returns {Object} 400 - Token not provided
 * @returns {Object} 500 - Server error
 */
router.post('/logout', (req, res, next) => {
    // Check if token/cookie exists
    if (!req.cookies.token) {
        return res.status(400).json({ message: 'Token not provided' });
    }
    
    console.log('🚪 Logout request received');
    logout(req, res, next);
});

/**
 * GET /api/auth/me
 * Verify and get current authenticated user
 * @route GET /me
 * @returns {Object} 200 - User data if authenticated
 * @returns {Object} 401 - Not authenticated
 */
router.get('/me', (req, res, next) => {
    console.log('👤 Verify auth request received');
    verifyAuth(req, res, next);
});

export default router;
