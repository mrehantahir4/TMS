/**
 * TMSshj - Authentication Service
 *
 * Is file mein authentication se related API calls hongi.
 *
 * IMPORTANT:
 * Actual API endpoints Postman collection ke mutabiq
 * use kiye gaye hain.
 *
 * Employee Login:
 * POST /api/v1/index.php?module=auth&action=login
 * login_type = 0
 *
 * Employee Status:
 * POST /api/v1/index.php?module=auth&action=status
 * status = 1  -> Active / Online
 * status = 0  -> Offline
 */

import {apiGet, apiPost} from './apiClient';

/**
 * Employee Login
 *
 * Postman endpoint:
 * POST /api/v1/index.php?module=auth&action=login
 *
 * Body:
 * {
 *   email,
 *   password,
 *   login_type: 0
 * }
 */
const loginEmployee = async (email, password) => {
  const response = await apiPost(
    '/api/v1/index.php?module=auth&action=login',
    {
      email,
      password,
      login_type: 0,
    },
  );

  return response;
};

/**
 * Employee ka online/active status update karta hai.
 *
 * Postman endpoint:
 * POST /api/v1/index.php?module=auth&action=status
 *
 * status:
 * 1 = Active / Online
 * 0 = Offline
 */
const setEmployeeStatus = async (token, status) => {
  return apiPost(
    '/api/v1/index.php?module=auth&action=status',
    {
      status,
    },
    token,
  );
};

/**
 * Current logged-in user ki information.
 *
 * Postman endpoint:
 * GET /api/v1/index.php?module=auth&action=me
 *
 * Bearer token required hai.
 */
const getMe = async token => {
  return apiGet(
    '/api/v1/index.php?module=auth&action=me',
    token,
  );
};

/**
 * Current authentication/session information.
 *
 * Postman endpoint:
 * GET /api/v1/index.php?module=auth&action=session
 *
 * Bearer token required hai.
 */
const getSession = async token => {
  return apiGet(
    '/api/v1/index.php?module=auth&action=session',
    token,
  );
};

/**
 * Logout
 *
 * Postman endpoint:
 * POST /api/v1/index.php?module=auth&action=logout
 *
 * Logout ke waqt current bearer token send hoga.
 */
const logout = async token => {
  return apiPost(
    '/api/v1/index.php?module=auth&action=logout',
    undefined,
    token,
  );
};

/**
 * Authentication functions export.
 *
 * Doosri files in functions ko import karke
 * use kar sakti hain.
 */
export {
  loginEmployee,
  setEmployeeStatus,
  getMe,
  getSession,
  logout,
};