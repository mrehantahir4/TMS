/**
 * TMSshj - EOD Service
 *
 * Is service ka kaam EOD related API requests
 * ko handle karna hai.
 *
 * Abhi hum Postman mein confirmed:
 * GET /api/v1/index.php?module=eods&action=list
 * ko use kar rahe hain.
 */

import {apiGet} from './apiClient';

/**
 * Get EOD list.
 *
 * @param {string} token - Logged-in user's bearer token
 * @param {number} page - Current page number
 * @param {number} limit - Number of records per page
 * @returns {Promise<Object>} API response
 */
const getEods = async (
  token,
  page = 1,
  limit = 20,
) => {
  /**
   * Exact endpoint jo Postman collection mein
   * confirmed hai.
   */
  const endpoint =
    `/api/v1/index.php?module=eods&action=list` +
    `&page=${page}` +
    `&limit=${limit}`;

  return apiGet(endpoint, token);
};

export {getEods};