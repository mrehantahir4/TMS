/**
 * TMSshj - Lookup Service
 *
 * Employees aur Pages ka real backend data
 * yahan se load hoga.
 */

import { apiGet } from './apiClient';

/**
 * Get Employees
 *
 * Confirmed endpoint:
 * GET /api/v1/index.php?module=lookups&action=employees
 *
 * Bearer token required hai.
 */
const getEmployees = async token => {
    return apiGet(
        '/api/v1/index.php?module=lookups&action=employees',
        token,
    );
};

/**
 * Get Pages
 *
 * Confirmed endpoint:
 * GET /api/v1/index.php?module=lookups&action=pages
 *
 * Bearer token required hai.
 */
const getPages = async token => {
    return apiGet(
        '/api/v1/index.php?module=lookups&action=pages',
        token,
    );
};

export {
    getEmployees,
    getPages,
};