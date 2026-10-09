/**
 * auth.js — JWT utilities + middleware
 * Signs/verifies tokens, hashes passwords, protects routes.
 */

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// ─── JWT CONFIG ───────────────────────────────────────────────────────────────
// In production: set JWT_SECRET env variable to a long random string.
// e.g.,  openssl rand -hex 64
const JWT_SECRET = process.env.JWT_SECRET || 'university-ops-jwt-secret-change-in-production-2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '8h'; // one work day

// ─── PASSWORD HELPERS ─────────────────────────────────────────────────────────
export async function hashPassword(plain) {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

// ─── TOKEN HELPERS ────────────────────────────────────────────────────────────
export function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET); // throws on invalid/expired
}

// ─── MIDDLEWARE ───────────────────────────────────────────────────────────────

/**
 * authenticateToken — Verifies the Bearer JWT in Authorization header.
 * On success: attaches req.user = { id, email, role, officeId, fullName }
 * On failure: 401
 */
export function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const payload = verifyToken(token);
    req.user = {
      id: payload.id,
      email: payload.email,
      role: payload.role,
      officeId: payload.officeId || null,
      fullName: payload.fullName
    };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Session expired. Please log in again.' });
    }
    return res.status(401).json({ error: 'Invalid authentication token' });
  }
}

/**
 * requireRole — Restricts an endpoint to specific roles.
 * Must be used AFTER authenticateToken.
 * Usage: requireRole(['director', 'it_admin'])
 */
export function requireRole(allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. Required role: ${allowedRoles.join(' or ')}`
      });
    }
    next();
  };
}

/**
 * requireOfficeAccess — Ensures office managers can only access their own office.
 * paramKey: the request param name holding the officeId (default: 'officeId')
 */
export function requireOfficeAccess(paramKey = 'officeId') {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' });

    const { role, officeId: userOfficeId } = req.user;

    // Directors and IT admins can access all offices
    if (role === 'director' || role === 'it_admin') return next();

    // Office managers can only access their own office
    const requestedOfficeId = req.params[paramKey] || req.body?.[paramKey] || req.query?.[paramKey];
    if (role === 'office_manager' && requestedOfficeId && requestedOfficeId !== userOfficeId) {
      return res.status(403).json({ error: 'Access denied: you do not have permission for this office' });
    }

    next();
  };
}
