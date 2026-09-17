/**
 * TMSshj - Task Service
 *
 * Employee tasks se related API calls.
 */

import { apiGet, apiPost } from './apiClient';

/**
 * Get Tasks
 *
 * Endpoint:
 * GET /api/v1/index.php?module=tasks&action=list&page=1&limit=20
 *
 * Bearer token required hai.
 */
const getTasks = async (
    token,
    page = 1,
    limit = 20,
    search = '',
) => {
    const searchParameter = search
        ? `&search=${encodeURIComponent(search)}`
        : '';

    const endpoint =
        `/api/v1/index.php?module=tasks&action=list` +
        `&page=${page}` +
        `&limit=${limit}` +
        searchParameter;

    return apiGet(endpoint, token);
};

/**
 * Create Task
 *
 * Confirmed Postman endpoint:
 *
 * POST /api/v1/index.php?module=tasks&action=save
 *
 * body:
 * {
 *   task,
 *   description,
 *   employee_id,
 *   page_id,
 *   due_date,
 *   status,
 *   assigned_by
 * }
 */
const createTask = async (
    token,
    taskData,
) => {
    return apiPost(
        '/api/v1/index.php?module=tasks&action=save',
        taskData,
        token,
    );
};

export {
    getTasks,
    createTask,
};