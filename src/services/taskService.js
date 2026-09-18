/**
 * TMSshj - Task Service
 *
 * Tasks aur task progress se related API calls.
 */

import {apiGet, apiPost} from './apiClient';

/**
 * Get paginated tasks.
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
        `&page=${page}&limit=${limit}${searchParameter}`;

    return apiGet(endpoint, token);
};

/**
 * Get single task details.
 *
 * Confirmed endpoint:
 * GET /api/v1/index.php?module=tasks&action=get&id=1
 */
const getTask = async (token, taskId) => {
    const endpoint =
        `/api/v1/index.php?module=tasks&action=get&id=${encodeURIComponent(
            taskId,
        )}`;

    return apiGet(endpoint, token);
};

/**
 * Create / update task.
 *
 * Confirmed endpoint:
 * POST /api/v1/index.php?module=tasks&action=save
 */
const createTask = (
    token,
    taskData,
) => {
    return apiPost(
        '/api/v1/index.php?module=tasks&action=save',
        taskData,
        token,
    );
};

/**
 * Get progress list for one task.
 *
 * Confirmed endpoint:
 * GET /api/v1/index.php?module=progress&action=list
 *     &task_id=1&type=task
 */
const getTaskProgress = async (
    token,
    taskId,
) => {
    const endpoint =
        `/api/v1/index.php?module=progress&action=list` +
        `&task_id=${encodeURIComponent(taskId)}` +
        `&type=task`;

    return apiGet(endpoint, token);
};

/**
 * Save a new progress entry.
 *
 * Confirmed endpoint:
 * POST /api/v1/index.php?module=progress&action=save
 *
 * Body:
 * {
 *   task_id: 1,
 *   progress: "Work update from app",
 *   status: 0
 * }
 */
const saveTaskProgress = (
    token,
    progressData,
) => {
    return apiPost(
        '/api/v1/index.php?module=progress&action=save',
        progressData,
        token,
    );
};

export {
    getTasks,
    getTask,
    createTask,
    getTaskProgress,
    saveTaskProgress,
};