/**
 * TMSshj - Dashboard Service
 *
 * Is file mein dashboard se related API calls rakhi jayengi.
 */

import {apiGet} from './apiClient';

/**
 * Employee/Admin Dashboard Stats
 *
 * API:
 * GET /api/v1/index.php?module=dashboard&action=stats
 *
 * Token required hai.
 */
const getDashboardStats = async token => {
  return apiGet(
    '/api/v1/index.php?module=dashboard&action=stats',
    token,
  );
};

export {
  getDashboardStats,
};