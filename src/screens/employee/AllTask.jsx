/**
 * TMSshj - All Tasks
 *
 * Employee ke tamam tasks yahan show honge.
 *
 * Features:
 * 1. Active Tasks ticker
 * 2. Add New Task button
 * 3. Show entries
 * 4. Search
 * 5. All / Assigned To Me / Assigned By Me
 * 6. Responsive task table
 * 7. Server-side pagination
 * 8. Conditional Action menu
 * 9. View Task details
 * 10. Add Progress popup
 * 11. View Progress popup
 */

import React, {
    useEffect,
    useMemo,
    useState,
} from 'react';

import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

import {
    getToken,
    getUser,
} from '../../services/authStorage';

import {
    getTasks,
    getTask,
    getTaskProgress,
    saveTaskProgress,
} from '../../services/taskService';

import CreateTaskModal from '../../components/CreateTaskModal';

/**
 * Page size options.
 */
const PAGE_SIZE_OPTIONS = [
    10,
    25,
    50,
    100,
];

/**
 * Task filter options.
 */
const TASK_FILTERS = {
    ALL: 'all',
    ASSIGNED_TO_ME: 'assigned_to_me',
    ASSIGNED_BY_ME: 'assigned_by_me',
};

/**
 * All Tasks Screen.
 */
const AllTask = () => {
    /**
     * Current logged-in user.
     */
    const [user, setUser] = useState(null);

    /**
     * Authentication token.
     */
    const [token, setToken] = useState(null);

    /**
     * Tasks returned by API.
     */
    const [tasks, setTasks] = useState([]);

    /**
     * API loading.
     */
    const [isLoading, setIsLoading] =
        useState(true);

    /**
     * API error.
     */
    const [errorMessage, setErrorMessage] =
        useState('');

    /**
     * Current page.
     */
    const [currentPage, setCurrentPage] =
        useState(1);

    /**
     * Selected page size.
     */
    const [pageSize, setPageSize] =
        useState(10);

    /**
     * Page size dropdown.
     */
    const [showPageSizeMenu, setShowPageSizeMenu] =
        useState(false);

    /**
     * API total.
     */
    const [totalTasks, setTotalTasks] =
        useState(0);

    /**
     * Search text.
     */
    const [searchText, setSearchText] =
        useState('');

    /**
     * Search value actually sent to API.
     */
    const [activeSearch, setActiveSearch] =
        useState('');

    /**
     * Current task filter.
     */
    const [taskFilter, setTaskFilter] =
        useState(TASK_FILTERS.ALL);

    /**
     * Create task modal.
     */
    const [
        showCreateTaskModal,
        setShowCreateTaskModal,
    ] = useState(false);

    /**
     * Selected task for Action menu.
     */
    const [selectedTask, setSelectedTask] =
        useState(null);

    /**
     * Action menu modal.
     */
    const [
        showActionModal,
        setShowActionModal,
    ] = useState(false);

    /**
     * Task detail modal.
     */
    const [
        showTaskDetailModal,
        setShowTaskDetailModal,
    ] = useState(false);

    /**
     * Task details returned by API.
     */
    const [
        taskDetail,
        setTaskDetail,
    ] = useState(null);

    /**
     * Task details loading.
     */
    const [
        isTaskDetailLoading,
        setIsTaskDetailLoading,
    ] = useState(false);

    /**
     * Task details error.
     */
    const [
        taskDetailError,
        setTaskDetailError,
    ] = useState('');

    /**
     * Add Progress modal.
     */
    const [
        showAddProgressModal,
        setShowAddProgressModal,
    ] = useState(false);

    /**
     * Progress text.
     */
    const [
        progressText,
        setProgressText,
    ] = useState('');

    /**
     * Save progress loading.
     */
    const [
        isSavingProgress,
        setIsSavingProgress,
    ] = useState(false);

    /**
     * Add progress error.
     */
    const [
        progressError,
        setProgressError,
    ] = useState('');

    /**
     * View Progress modal.
     */
    const [
        showProgressModal,
        setShowProgressModal,
    ] = useState(false);

    /**
     * Progress list.
     */
    const [
        progressItems,
        setProgressItems,
    ] = useState([]);

    /**
     * Progress loading.
     */
    const [
        isProgressLoading,
        setIsProgressLoading,
    ] = useState(false);

    /**
     * Progress error.
     */
    const [
        progressListError,
        setProgressListError,
    ] = useState('');

    /**
     * Get tasks.
     */
    const loadTasks = async (
        authToken,
        page,
        limit,
        search = '',
    ) => {
        try {
            setIsLoading(true);
            setErrorMessage('');

            const response = await getTasks(
                authToken,
                page,
                limit,
                search,
            );

            if (!response?.ok) {
                throw new Error(
                    response?.error?.message ||
                    'Unable to load tasks.',
                );
            }

            const items =
                response?.data?.items || [];

            const total =
                Number(
                    response?.data?.total || 0,
                );

            setTasks(items);
            setTotalTasks(total);

            console.log(
                'All Tasks API Response:',
                response,
            );
        } catch (error) {
            console.error(
                'All Tasks API Error:',
                error,
            );

            if (error instanceof Error) {
                setErrorMessage(error.message);
            } else {
                setErrorMessage(
                    'Unable to load tasks.',
                );
            }
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Initial screen load.
     */
    useEffect(() => {
        const initialize = async () => {
            try {
                const authToken =
                    await getToken();

                const storedUser =
                    await getUser();

                if (!authToken) {
                    setErrorMessage(
                        'Authentication token not found.',
                    );

                    setIsLoading(false);
                    return;
                }

                setToken(authToken);
                setUser(storedUser);

                await loadTasks(
                    authToken,
                    1,
                    pageSize,
                    '',
                );
            } catch (error) {
                console.error(
                    'Failed to initialize All Tasks:',
                    error,
                );

                setErrorMessage(
                    'Unable to initialize tasks.',
                );

                setIsLoading(false);
            }
        };

        initialize();
    }, []);

    /**
     * Refresh task list after new task.
     */
    const handleTaskCreated = async () => {
        setCurrentPage(1);

        if (token) {
            await loadTasks(
                token,
                1,
                pageSize,
                activeSearch,
            );
        }
    };

    /**
     * Search.
     */
    const handleSearch = async () => {
        const cleanSearch =
            searchText.trim();

        setActiveSearch(cleanSearch);
        setCurrentPage(1);

        if (token) {
            await loadTasks(
                token,
                1,
                pageSize,
                cleanSearch,
            );
        }
    };

    /**
     * Page size change.
     */
    const handlePageSizeChange =
        async size => {
            setShowPageSizeMenu(false);
            setPageSize(size);
            setCurrentPage(1);

            if (token) {
                await loadTasks(
                    token,
                    1,
                    size,
                    activeSearch,
                );
            }
        };

    /**
     * Previous page.
     */
    const handlePreviousPage =
        async () => {
            if (
                currentPage <= 1 ||
                isLoading
            ) {
                return;
            }

            const previousPage =
                currentPage - 1;

            setCurrentPage(previousPage);

            if (token) {
                await loadTasks(
                    token,
                    previousPage,
                    pageSize,
                    activeSearch,
                );
            }
        };

    /**
     * Total pages.
     */
    const totalPages = Math.max(
        1,
        Math.ceil(
            totalTasks / pageSize,
        ),
    );

    /**
     * Next page.
     */
    const handleNextPage =
        async () => {
            if (
                currentPage >= totalPages ||
                isLoading
            ) {
                return;
            }

            const nextPage =
                currentPage + 1;

            setCurrentPage(nextPage);

            if (token) {
                await loadTasks(
                    token,
                    nextPage,
                    pageSize,
                    activeSearch,
                );
            }
        };

    /**
     * Check whether task is assigned
     * to current employee.
     */
    const isAssignedToMe = task => {
        const currentUserId =
            String(user?.id || '');

        if (!currentUserId) {
            return false;
        }

        const employeeIds = String(
            task?.employee_id || '',
        )
            .split(',')
            .map(id => id.trim())
            .filter(Boolean);

        return employeeIds.includes(
            currentUserId,
        );
    };

    /**
     * Check whether task was assigned
     * by current employee.
     */
    const isAssignedByMe = task => {
        const currentUserId =
            String(user?.id || '');

        if (!currentUserId) {
            return false;
        }

        return (
            String(
                task?.assigned_by || '',
            ) === currentUserId
        );
    };

    /**
     * Visible tasks.
     */
    const visibleTasks = useMemo(() => {
        if (
            taskFilter ===
            TASK_FILTERS.ASSIGNED_TO_ME
        ) {
            return tasks.filter(
                isAssignedToMe,
            );
        }

        if (
            taskFilter ===
            TASK_FILTERS.ASSIGNED_BY_ME
        ) {
            return tasks.filter(
                isAssignedByMe,
            );
        }

        return tasks;
    }, [
        tasks,
        taskFilter,
        user,
    ]);

    /**
     * Format due date.
     */
    const formatDueDate = date => {
        if (!date) {
            return '-';
        }

        const parsedDate =
            new Date(`${date}T00:00:00`);

        if (
            Number.isNaN(
                parsedDate.getTime(),
            )
        ) {
            return date;
        }

        return parsedDate.toLocaleDateString(
            'en-US',
            {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
            },
        );
    };

    /**
     * Format created date.
     */
    const formatCreatedDate = date => {
        if (!date) {
            return '-';
        }

        return date;
    };

    /**
     * Active tasks.
     */
    const activeTasks = useMemo(() => {
        return tasks.filter(task => {
            const status =
                String(
                    task?.status_label || '',
                ).toLowerCase();

            return (
                status === 'pending' ||
                status === 'on-progress'
            );
        });
    }, [tasks]);

    /**
     * Status style.
     */
    const getStatusStyle = status => {
        const cleanStatus =
            String(status || '')
                .toLowerCase();

        if (
            cleanStatus ===
            'completed'
        ) {
            return styles.completedBadge;
        }

        if (
            cleanStatus ===
            'on-progress'
        ) {
            return styles.progressBadge;
        }

        if (
            cleanStatus.includes('over')
        ) {
            return styles.overdueBadge;
        }

        return styles.pendingBadge;
    };

    /**
     * Normalize task status.
     */
    const normalizeStatus = status => {
        return String(status || '')
            .trim()
            .toLowerCase()
            .replace(/_/g, '-');
    };

    /**
     * Get Action options according to
     * task status.
     *
     * Completed:
     * - View Task
     * - View Progress
     *
     * Other statuses:
     * - View Task
     * - Add Progress
     * - View Progress
     */
    const getTaskActionOptions = task => {
        const status =
            normalizeStatus(
                task?.status_label,
            );

        if (
            status === 'completed'
        ) {
            return [
                'View Task',
                'View Progress',
            ];
        }

        return [
            'View Task',
            'Add Progress',
            'View Progress',
        ];
    };

   /**
 * Action dropdown open / close.
 */
const handleActionPress = task => {
    const sameTask =
        selectedTask?.id === task?.id;

    setSelectedTask(task);

    /**
     * Same task par dobara press ho to
     * dropdown close ho jayega.
     */
    setShowActionModal(
        sameTask
            ? previous => !previous
            : true,
    );
};

    /**
     * View Task.
     */
    const handleViewTask = async task => {
        setSelectedTask(task);
        setShowActionModal(false);

        /**
         * Initially list data show karte hain
         * taake popup empty na ho.
         */
        setTaskDetail(task);
        setTaskDetailError('');
        setShowTaskDetailModal(true);
        setIsTaskDetailLoading(true);

        try {
            if (!token) {
                throw new Error(
                    'Authentication token not found.',
                );
            }

            const response =
                await getTask(
                    token,
                    task?.id,
                );

            if (!response?.ok) {
                throw new Error(
                    response?.error?.message ||
                    'Unable to load task details.',
                );
            }

            /**
             * API ka real detail data.
             */
            const detail =
                response?.data || task;

            setTaskDetail(detail);

            console.log(
                'Task Details API Response:',
                response,
            );
        } catch (error) {
            console.error(
                'Task Details API Error:',
                error,
            );

            if (error instanceof Error) {
                setTaskDetailError(
                    error.message,
                );
            } else {
                setTaskDetailError(
                    'Unable to load task details.',
                );
            }
        } finally {
            setIsTaskDetailLoading(false);
        }
    };

    /**
     * Open Add Progress popup.
     */
    const handleAddProgress = task => {
        setSelectedTask(task);
        setShowActionModal(false);

        setProgressText('');
        setProgressError('');

        setShowAddProgressModal(true);
    };

    /**
 * Load progress for selected task.
 */
const loadTaskProgress = async taskId => {
    if (!token || !taskId) {
        return;
    }

    try {
        setIsProgressLoading(true);
        setProgressListError('');

        const response =
            await getTaskProgress(
                token,
                taskId,
            );

        if (!response?.ok) {
            throw new Error(
                response?.error?.message ||
                'Unable to load progress.',
            );
        }

        /**
         * Confirmed API response:
         *
         * {
         *   ok: true,
         *   data: {
         *      items: [...]
         *   }
         * }
         */
        const items = Array.isArray(
            response?.data?.items,
        )
            ? response.data.items
            : [];

        setProgressItems(items);

        console.log(
            'Task Progress API Response:',
            JSON.stringify(
                response,
                null,
                2,
            ),
        );
    } catch (error) {
        console.error(
            'Task Progress API Error:',
            error,
        );

        setProgressItems([]);

        if (error instanceof Error) {
            setProgressListError(
                error.message,
            );
        } else {
            setProgressListError(
                'Unable to load progress.',
            );
        }
    } finally {
        setIsProgressLoading(false);
    }
};
    /**
     * Save Progress.
     */
    const handleSaveProgress = async () => {
        const cleanProgress =
            progressText.trim();

        setProgressError('');

        if (!cleanProgress) {
            setProgressError(
                'Please enter progress.',
            );
            return;
        }

        if (!token) {
            setProgressError(
                'Authentication token not found.',
            );
            return;
        }

        if (!selectedTask?.id) {
            setProgressError(
                'Task ID not found.',
            );
            return;
        }

        try {
            setIsSavingProgress(true);

            /**
             * Confirmed Postman body:
             *
             * task_id
             * progress
             * status
             */
            const response =
                await saveTaskProgress(
                    token,
                    {
                        task_id:
                            Number(
                                selectedTask.id,
                            ) ||
                            selectedTask.id,

                        progress:
                            cleanProgress,

                        status: 0,
                    },
                );

            if (!response?.ok) {
                throw new Error(
                    response?.error?.message ||
                    'Unable to save progress.',
                );
            }

            console.log(
                'Save Progress API Response:',
                response,
            );

            /**
             * Text clear.
             */
            setProgressText('');

            /**
             * Popup close.
             */
            setShowAddProgressModal(false);

            /**
             * Saved progress ko fresh
             * server response se load kar
             * lete hain.
             */
            await loadTaskProgress(
                selectedTask.id,
            );
        } catch (error) {
            console.error(
                'Save Progress API Error:',
                error,
            );

            if (error instanceof Error) {
                setProgressError(
                    error.message,
                );
            } else {
                setProgressError(
                    'Unable to save progress.',
                );
            }
        } finally {
            setIsSavingProgress(false);
        }
    };

    /**
     * View Progress.
     */
    const handleViewProgress = async task => {
        setSelectedTask(task);
        setShowActionModal(false);

        setProgressItems([]);
        setProgressListError('');
        setShowProgressModal(true);

        await loadTaskProgress(
            task?.id,
        );
    };

    /**
     * Close task details.
     */
    const closeTaskDetails = () => {
        setShowTaskDetailModal(false);
        setTaskDetailError('');
    };

    /**
     * Close Add Progress.
     */
    const closeAddProgress = () => {
        if (isSavingProgress) {
            return;
        }

        setShowAddProgressModal(false);
        setProgressText('');
        setProgressError('');
    };

    /**
     * Close View Progress.
     */
    const closeProgressModal = () => {
        if (isProgressLoading) {
            return;
        }

        setShowProgressModal(false);
        setProgressListError('');
    };

    /**
     * Convert API key to readable label.
     */
    const formatLabel = key => {
        return String(key || '')
            .replace(/_/g, ' ')
            .replace(/-/g, ' ')
            .replace(
                /\b\w/g,
                character =>
                    character.toUpperCase(),
            );
    };

    /**
     * Convert any detail value into text.
     */
    const formatDetailValue = value => {
        if (
            value === null ||
            value === undefined ||
            value === ''
        ) {
            return '-';
        }

        if (
            typeof value === 'object'
        ) {
            try {
                return JSON.stringify(
                    value,
                    null,
                    2,
                );
            } catch {
                return String(value);
            }
        }

        return String(value);
    };

    /**
     * Render task detail fields.
     *
     * API object ke real fields ko
     * dynamically show karta hai.
     */
    const renderTaskDetails = () => {
        if (!taskDetail) {
            return (
                <Text
                    style={
                        styles.emptyModalText
                    }>
                    No task details available.
                </Text>
            );
        }

        const entries =
            Object.entries(taskDetail);

        if (!entries.length) {
            return (
                <Text
                    style={
                        styles.emptyModalText
                    }>
                    No task details available.
                </Text>
            );
        }

        return entries.map(
            ([key, value]) => (
                <View
                    key={key}
                    style={styles.detailRow}>

                    <Text
                        style={
                            styles.detailLabel
                        }>
                        {formatLabel(key)}
                    </Text>

                    <Text
                        style={
                            styles.detailValue
                        }>
                        {formatDetailValue(
                            value,
                        )}
                    </Text>

                </View>
            ),
        );
    };

   /**
 * Progress text ko readable plain text mein
 * convert karta hai.
 *
 * API progress HTML encoded form mein
 * aa rahi hai:
 *
 * &lt;p&gt;updated it&lt;/p&gt;
 *
 * UI mein:
 *
 * updated it
 */
const getProgressText = item => {
    if (
        item?.progress === undefined ||
        item?.progress === null
    ) {
        return '-';
    }

    const decodedText = String(item.progress)
        // HTML encoded tags decode
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, ' ')

        // HTML line breaks
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/p>/gi, '\n')

        // Remaining HTML tags remove
        .replace(/<[^>]*>/g, '')

        // Extra spaces clean
        .replace(/\n\s*\n/g, '\n')
        .trim();

    return decodedText || '-';
};

    return (
        <View style={styles.screen}>
            <ScrollView
                contentContainerStyle={
                    styles.scrollContent
                }
                showsVerticalScrollIndicator={
                    false
                }>

                {/* Page Header */}
                <View style={styles.header}>
                    <Text
                        style={
                            styles.pageTitle
                        }>
                        Task List
                    </Text>
                </View>

                {/* Active Tasks Ticker */}
                <View
                    style={
                        styles.activeTasksBar
                    }>

                    <View
                        style={
                            styles.activeTitleBox
                        }>

                        <Text
                            style={
                                styles.activeTitle
                            }>
                            🔔 Active Tasks
                        </Text>
                    </View>

                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={
                            false
                        }
                        contentContainerStyle={
                            styles.tickerContent
                        }>

                        {activeTasks.length >
                        0 ? (
                            activeTasks.map(
                                task => (
                                    <View
                                        key={
                                            task.id
                                        }
                                        style={
                                            styles.tickerItem
                                        }>

                                        <Text
                                            numberOfLines={
                                                1
                                            }
                                            style={
                                                styles.tickerTask
                                            }>
                                            {task?.task ||
                                                '-'}
                                        </Text>

                                        <Text
                                            style={
                                                styles.tickerSeparator
                                            }>
                                            •
                                        </Text>

                                        <Text
                                            numberOfLines={
                                                1
                                            }
                                            style={
                                                styles.tickerPerson
                                            }>
                                            {task?.assigned_to_names ||
                                                '-'}
                                        </Text>

                                        <Text
                                            style={
                                                styles.tickerSeparator
                                            }>
                                            •
                                        </Text>

                                        <Text
                                            style={
                                                styles.tickerDate
                                            }>
                                            {formatDueDate(
                                                task?.due_date,
                                            )}
                                        </Text>

                                        <View
                                            style={[
                                                styles.tickerStatus,
                                                getStatusStyle(
                                                    task?.status_label,
                                                ),
                                            ]}>

                                            <Text
                                                style={
                                                    styles.tickerStatusText
                                                }>
                                                {task?.status_label ||
                                                    'Unknown'}
                                            </Text>
                                        </View>
                                    </View>
                                ),
                            )
                        ) : (
                            <Text
                                style={
                                    styles.noActiveText
                                }>
                                No active tasks
                            </Text>
                        )}
                    </ScrollView>
                </View>

                {/* Main Card */}
                <View style={styles.card}>

                    {/* Add New Task */}
                    <Pressable
                        onPress={() => {
                            setShowCreateTaskModal(
                                true,
                            );
                        }}
                        style={({
                            pressed,
                        }) => [
                            styles.addTaskButton,
                            pressed
                                ? styles.addTaskButtonPressed
                                : null,
                        ]}>

                        <Text
                            style={
                                styles.addTaskText
                            }>
                            + Add New Task
                        </Text>
                    </Pressable>

                    <View
                        style={
                            styles.divider
                        }
                    />

                    {/* Task Filters */}
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={
                            false
                        }
                        contentContainerStyle={
                            styles.filterScroll
                        }>

                        <Pressable
                            onPress={() =>
                                setTaskFilter(
                                    TASK_FILTERS.ALL,
                                )
                            }
                            style={[
                                styles.filterButton,
                                taskFilter ===
                                TASK_FILTERS.ALL
                                    ? styles.filterButtonActive
                                    : null,
                            ]}>

                            <Text
                                style={[
                                    styles.filterText,
                                    taskFilter ===
                                    TASK_FILTERS.ALL
                                        ? styles.filterTextActive
                                        : null,
                                ]}>
                                All Tasks
                            </Text>
                        </Pressable>

                        <Pressable
                            onPress={() =>
                                setTaskFilter(
                                    TASK_FILTERS.ASSIGNED_TO_ME,
                                )
                            }
                            style={[
                                styles.filterButton,
                                taskFilter ===
                                TASK_FILTERS.ASSIGNED_TO_ME
                                    ? styles.filterButtonActive
                                    : null,
                            ]}>

                            <Text
                                style={[
                                    styles.filterText,
                                    taskFilter ===
                                    TASK_FILTERS.ASSIGNED_TO_ME
                                        ? styles.filterTextActive
                                        : null,
                                ]}>
                                Assigned To Me
                            </Text>
                        </Pressable>

                        <Pressable
                            onPress={() =>
                                setTaskFilter(
                                    TASK_FILTERS.ASSIGNED_BY_ME,
                                )
                            }
                            style={[
                                styles.filterButton,
                                taskFilter ===
                                TASK_FILTERS.ASSIGNED_BY_ME
                                    ? styles.filterButtonActive
                                    : null,
                            ]}>

                            <Text
                                style={[
                                    styles.filterText,
                                    taskFilter ===
                                    TASK_FILTERS.ASSIGNED_BY_ME
                                        ? styles.filterTextActive
                                        : null,
                                ]}>
                                Assigned By Me
                            </Text>
                        </Pressable>
                    </ScrollView>

                    {/* Controls */}
                    <View
                        style={
                            styles.controlsSection
                        }>

                        {/* Show Entries */}
                        <View
                            style={
                                styles.entriesWrapper
                            }>

                            <View
                                style={
                                    styles.entriesContainer
                                }>

                                <Text
                                    style={
                                        styles.controlLabel
                                    }>
                                    Show
                                </Text>

                                <Pressable
                                    onPress={() =>
                                        setShowPageSizeMenu(
                                            previous =>
                                                !previous,
                                        )
                                    }
                                    style={
                                        styles.pageSizeButton
                                    }>

                                    <Text
                                        style={
                                            styles.pageSizeText
                                        }>
                                        {pageSize}
                                    </Text>

                                    <Text
                                        style={
                                            styles.dropdownArrow
                                        }>
                                        ▼
                                    </Text>
                                </Pressable>

                                <Text
                                    style={
                                        styles.controlLabel
                                    }>
                                    entries
                                </Text>
                            </View>

                            {showPageSizeMenu ? (
                                <View
                                    style={
                                        styles.pageSizeMenu
                                    }>

                                    {PAGE_SIZE_OPTIONS.map(
                                        option => (
                                            <Pressable
                                                key={
                                                    option
                                                }
                                                onPress={() =>
                                                    handlePageSizeChange(
                                                        option,
                                                    )
                                                }
                                                style={[
                                                    styles.pageSizeOption,
                                                    pageSize ===
                                                    option
                                                        ? styles.pageSizeOptionSelected
                                                        : null,
                                                ]}>

                                                <Text
                                                    style={[
                                                        styles.pageSizeOptionText,
                                                        pageSize ===
                                                        option
                                                            ? styles.pageSizeOptionTextSelected
                                                            : null,
                                                    ]}>
                                                    {
                                                        option
                                                    }
                                                </Text>
                                            </Pressable>
                                        ),
                                    )}
                                </View>
                            ) : null}
                        </View>

                        {/* Search */}
                        <View
                            style={
                                styles.searchContainer
                            }>

                            <Text
                                style={
                                    styles.controlLabel
                                }>
                                Search
                            </Text>

                            <View
                                style={
                                    styles.searchRow
                                }>

                                <TextInput
                                    value={
                                        searchText
                                    }
                                    onChangeText={
                                        setSearchText
                                    }
                                    placeholder="Search tasks..."
                                    placeholderTextColor="#94A3B8"
                                    style={
                                        styles.searchInput
                                    }
                                    returnKeyType="search"
                                    onSubmitEditing={
                                        handleSearch
                                    }
                                />

                                <Pressable
                                    onPress={
                                        handleSearch
                                    }
                                    style={
                                        styles.searchButton
                                    }>

                                    <Text
                                        style={
                                            styles.searchButtonText
                                        }>
                                        Search
                                    </Text>
                                </Pressable>
                            </View>
                        </View>
                    </View>

                    {/* Loading */}
                    {isLoading ? (
                        <View
                            style={
                                styles.loadingBox
                            }>

                            <ActivityIndicator
                                size="small"
                                color="#111827"
                            />

                            <Text
                                style={
                                    styles.loadingText
                                }>
                                Loading tasks...
                            </Text>
                        </View>
                    ) : null}

                    {/* Error */}
                    {!isLoading &&
                    errorMessage ? (
                        <View
                            style={
                                styles.errorBox
                            }>

                            <Text
                                style={
                                    styles.errorTitle
                                }>
                                Unable to load tasks
                            </Text>

                            <Text
                                style={
                                    styles.errorText
                                }>
                                {errorMessage}
                            </Text>
                        </View>
                    ) : null}

                    {/* Task Table */}
                    {!isLoading &&
                    !errorMessage ? (
                        <View
                            style={
                                styles.tableWrapper
                            }>

                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={
                                    true
                                }>

                                <View>

                                    {/* Table Header */}
                                    <View
                                        style={
                                            styles.tableHeader
                                        }>

                                        <Text
                                            style={[
                                                styles.headerCell,
                                                styles.numberCell,
                                            ]}>
                                            #
                                        </Text>

                                        <Text
                                            style={[
                                                styles.headerCell,
                                                styles.pageCell,
                                            ]}>
                                            PAGE NAME
                                        </Text>

                                        <Text
                                            style={[
                                                styles.headerCell,
                                                styles.statusCell,
                                            ]}>
                                            STATUS
                                        </Text>

                                        <Text
                                            style={[
                                                styles.headerCell,
                                                styles.taskCell,
                                            ]}>
                                            TASK
                                        </Text>

                                        <Text
                                            style={[
                                                styles.headerCell,
                                                styles.dueCell,
                                            ]}>
                                            DUE DATE
                                        </Text>

                                        <Text
                                            style={[
                                                styles.headerCell,
                                                styles.assignedCell,
                                            ]}>
                                            ASSIGNED TO
                                        </Text>

                                        <Text
                                            style={[
                                                styles.headerCell,
                                                styles.assignedByCell,
                                            ]}>
                                            ASSIGNED BY
                                        </Text>

                                        <Text
                                            style={[
                                                styles.headerCell,
                                                styles.createdCell,
                                            ]}>
                                            CREATED AT
                                        </Text>

                                        <Text
                                            style={[
                                                styles.headerCell,
                                                styles.actionCell,
                                            ]}>
                                            ACTION
                                        </Text>
                                    </View>

                                    {/* Table Rows */}
                                    {visibleTasks.length >
                                    0 ? (
                                        visibleTasks.map(
                                            (
                                                task,
                                                index,
                                            ) => (
                                                <View
                                                    key={String(
                                                        task?.id ||
                                                        index,
                                                    )}
                                                   style={[
                                                        styles.tableRow,
                                                          selectedTask?.id === task?.id &&
                                                           showActionModal
                                                                ? styles.tableRowOpen
                                                                  : null,
                                                ]}>

                                                    {/* Number */}
                                                    <Text
                                                        style={[
                                                            styles.bodyCell,
                                                            styles.numberCell,
                                                        ]}>
                                                        {(currentPage -
                                                            1) *
                                                            pageSize +
                                                            index +
                                                            1}
                                                    </Text>

                                                    {/* Page Name */}
                                                    <Text
                                                        numberOfLines={
                                                            3
                                                        }
                                                        style={[
                                                            styles.bodyCell,
                                                            styles.pageCell,
                                                            styles.linkText,
                                                        ]}>
                                                        {task?.pagename ||
                                                            '-'}
                                                    </Text>

                                                    {/* Status */}
                                                    <View
                                                        style={[
                                                            styles.bodyCellView,
                                                            styles.statusCell,
                                                        ]}>

                                                        <View
                                                            style={[
                                                                styles.statusBadge,
                                                                getStatusStyle(
                                                                    task?.status_label,
                                                                ),
                                                            ]}>

                                                            <Text
                                                                style={
                                                                    styles.statusText
                                                                }>
                                                                {task?.status_label ||
                                                                    '-'}
                                                            </Text>
                                                        </View>
                                                    </View>

                                                    {/* Task */}
                                                    <View
                                                        style={[
                                                            styles.bodyCellView,
                                                            styles.taskCell,
                                                        ]}>

                                                        <Text
                                                            numberOfLines={
                                                                2
                                                            }
                                                            style={
                                                                styles.taskName
                                                            }>
                                                            {task?.task ||
                                                                '-'}
                                                        </Text>

                                                        {task?.description ? (
                                                            <Text
                                                                numberOfLines={
                                                                    2
                                                                }
                                                                style={
                                                                    styles.description
                                                                }>
                                                                {
                                                                    task.description
                                                                }
                                                            </Text>
                                                        ) : null}
                                                    </View>

                                                    {/* Due Date */}
                                                    <Text
                                                        numberOfLines={
                                                            2
                                                        }
                                                        style={[
                                                            styles.bodyCell,
                                                            styles.dueCell,
                                                        ]}>
                                                        {formatDueDate(
                                                            task?.due_date,
                                                        )}
                                                    </Text>

                                                    {/* Assigned To */}
                                                    <Text
                                                        numberOfLines={
                                                            3
                                                        }
                                                        style={[
                                                            styles.bodyCell,
                                                            styles.assignedCell,
                                                        ]}>
                                                        {task?.assigned_to_names ||
                                                            '-'}
                                                    </Text>

                                                    {/* Assigned By */}
                                                    <Text
                                                        numberOfLines={
                                                            3
                                                        }
                                                        style={[
                                                            styles.bodyCell,
                                                            styles.assignedByCell,
                                                        ]}>
                                                        {task?.assigned_by_name ||
                                                            '-'}
                                                    </Text>

                                                    {/* Created At */}
                                                    <Text
                                                        numberOfLines={
                                                            3
                                                        }
                                                        style={[
                                                            styles.bodyCell,
                                                            styles.createdCell,
                                                        ]}>
                                                        {formatCreatedDate(
                                                            task?.date_created,
                                                        )}
                                                    </Text>

                                                   {/* Action */}
<View
    style={[
        styles.bodyCellView,
        styles.actionCell,
        selectedTask?.id === task?.id &&
        showActionModal
            ? styles.actionCellOpen
            : null,
    ]}>

    <View
        style={
            styles.actionDropdownWrapper
        }>

        {/* Action Button */}
        <Pressable
            onPress={() =>
                handleActionPress(
                    task,
                )
            }
            style={({pressed}) => [
                styles.actionButton,
                pressed
                    ? styles.actionButtonPressed
                    : null,
            ]}>

            <Text
                style={
                    styles.actionButtonText
                }>
                Action ▼
            </Text>
        </Pressable>

        {/* Dropdown */}
        {showActionModal &&
        selectedTask?.id === task?.id ? (
            <View
                style={
                    styles.actionDropdownMenu
                }>

                {getTaskActionOptions(
                    task,
                ).map(option => (
                    <Pressable
                        key={
                            option
                        }
                        onPress={() => {

                            /**
                             * Dropdown close.
                             */
                            setShowActionModal(
                                false,
                            );

                            /**
                             * Selected action.
                             */
                            if (
                                option ===
                                'View Task'
                            ) {
                                handleViewTask(
                                    task,
                                );
                                return;
                            }

                            if (
                                option ===
                                'Add Progress'
                            ) {
                                handleAddProgress(
                                    task,
                                );
                                return;
                            }

                            if (
                                option ===
                                'View Progress'
                            ) {
                                handleViewProgress(
                                    task,
                                );
                            }
                        }}
                        style={({pressed}) => [
                            styles.actionDropdownItem,
                            pressed
                                ? styles.actionDropdownItemPressed
                                : null,
                        ]}>

                        <Text
                            style={
                                styles.actionDropdownText
                            }>
                            {option}
                        </Text>

                    </Pressable>
                ))}

            </View>
        ) : null}

    </View>
</View>
                                                </View>
                                            ),
                                        )
                                    ) : (
                                        <View
                                            style={
                                                styles.emptyTable
                                            }>

                                            <Text
                                                style={
                                                    styles.emptyText
                                                }>
                                                No tasks found.
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            </ScrollView>
                        </View>
                    ) : null}

                    {/* Pagination */}
                    {!isLoading &&
                    !errorMessage ? (
                        <View
                            style={
                                styles.paginationArea
                            }>

                            <Text
                                style={
                                    styles.paginationInfo
                                }>
                                Showing{' '}
                                {totalTasks ===
                                0
                                    ? 0
                                    : (currentPage -
                                          1) *
                                          pageSize +
                                      1}{' '}
                                to{' '}
                                {Math.min(
                                    currentPage *
                                        pageSize,
                                    totalTasks,
                                )}{' '}
                                of{' '}
                                {totalTasks}{' '}
                                entries
                            </Text>

                            <View
                                style={
                                    styles.paginationControls
                                }>

                                <Pressable
                                    onPress={
                                        handlePreviousPage
                                    }
                                    disabled={
                                        currentPage ===
                                            1 ||
                                        isLoading
                                    }
                                    style={[
                                        styles.paginationButton,
                                        currentPage ===
                                            1
                                            ? styles.paginationDisabled
                                            : null,
                                    ]}>

                                    <Text
                                        style={
                                            styles.paginationButtonText
                                        }>
                                        Previous
                                    </Text>
                                </Pressable>

                                <View
                                    style={
                                        styles.currentPageButton
                                    }>

                                    <Text
                                        style={
                                            styles.currentPageText
                                        }>
                                        {
                                            currentPage
                                        }
                                    </Text>
                                </View>

                                <Pressable
                                    onPress={
                                        handleNextPage
                                    }
                                    disabled={
                                        currentPage >=
                                            totalPages ||
                                        isLoading
                                    }
                                    style={[
                                        styles.paginationButton,
                                        currentPage >=
                                            totalPages
                                            ? styles.paginationDisabled
                                            : null,
                                    ]}>

                                    <Text
                                        style={
                                            styles.paginationButtonText
                                        }>
                                        Next
                                    </Text>
                                </Pressable>
                            </View>
                        </View>
                    ) : null}
                </View>
            </ScrollView>

            {/* Create Task Modal */}
            <CreateTaskModal
                visible={
                    showCreateTaskModal
                }
                onClose={() => {
                    setShowCreateTaskModal(
                        false,
                    );
                }}
                onTaskCreated={
                    handleTaskCreated
                }
            />


            {/* ================================================== */}
            {/* VIEW TASK MODAL */}
            {/* ================================================== */}

            <Modal
                visible={
                    showTaskDetailModal
                }
                transparent
                animationType="slide"
                onRequestClose={
                    closeTaskDetails
                }>

                <View
                    style={
                        styles.modalOverlay
                    }>

                    <View
                        style={
                            styles.detailModalCard
                        }>

                        <View
                            style={
                                styles.modalHeader
                            }>

                            <View
                                style={
                                    styles.modalHeaderTextBox
                                }>

                                <Text
                                    style={
                                        styles.modalTitle
                                    }>
                                    Task Details
                                </Text>

                                <Text
                                    numberOfLines={
                                        1
                                    }
                                    style={
                                        styles.modalSubtitle
                                    }>
                                    {selectedTask?.task ||
                                        'Task'}
                                </Text>
                            </View>

                            <Pressable
                                onPress={
                                    closeTaskDetails
                                }
                                style={
                                    styles.closeButton
                                }>

                                <Text
                                    style={
                                        styles.closeButtonText
                                    }>
                                    ×
                                </Text>
                            </Pressable>
                        </View>

                        {isTaskDetailLoading ? (
                            <View
                                style={
                                    styles.modalLoading
                                }>

                                <ActivityIndicator
                                    size="small"
                                    color="#0F9D9A"
                                />

                                <Text
                                    style={
                                        styles.modalLoadingText
                                    }>
                                    Loading task details...
                                </Text>
                            </View>
                        ) : null}

                        {taskDetailError ? (
                            <View
                                style={
                                    styles.modalErrorBox
                                }>

                                <Text
                                    style={
                                        styles.modalErrorText
                                    }>
                                    {
                                        taskDetailError
                                    }
                                </Text>
                            </View>
                        ) : null}

                        <ScrollView
                            style={
                                styles.modalScroll
                            }
                            contentContainerStyle={
                                styles.modalScrollContent
                            }
                            showsVerticalScrollIndicator={
                                false
                            }>

                            {renderTaskDetails()}
                        </ScrollView>

                        <Pressable
                            onPress={
                                closeTaskDetails
                            }
                            style={
                                styles.modalCloseButton
                            }>

                            <Text
                                style={
                                    styles.modalCloseButtonText
                                }>
                                Close
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>

            {/* ================================================== */}
            {/* ADD PROGRESS MODAL */}
            {/* ================================================== */}

            <Modal
                visible={
                    showAddProgressModal
                }
                transparent
                animationType="slide"
                onRequestClose={
                    closeAddProgress
                }>

                <View
                    style={
                        styles.modalOverlay
                    }>

                    <KeyboardAvoidingView
                        behavior={
                            Platform.OS ===
                            'ios'
                                ? 'padding'
                                : 'height'
                        }
                        style={
                            styles.keyboardContainer
                        }>

                        <View
                            style={
                                styles.progressModalCard
                            }>

                            <View
                                style={
                                    styles.modalHeader
                                }>

                                <View
                                    style={
                                        styles.modalHeaderTextBox
                                    }>

                                    <Text
                                        style={
                                            styles.modalTitle
                                        }>
                                        Add Progress
                                    </Text>

                                    <Text
                                        numberOfLines={
                                            1
                                        }
                                        style={
                                            styles.modalSubtitle
                                        }>
                                        {selectedTask?.task ||
                                            'Selected task'}
                                    </Text>
                                </View>

                                <Pressable
                                    onPress={
                                        closeAddProgress
                                    }
                                    disabled={
                                        isSavingProgress
                                    }
                                    style={
                                        styles.closeButton
                                    }>

                                    <Text
                                        style={
                                            styles.closeButtonText
                                        }>
                                        ×
                                    </Text>
                                </Pressable>
                            </View>

                            <Text
                                style={
                                    styles.inputLabel
                                }>
                                Progress
                            </Text>

                            <TextInput
                                value={
                                    progressText
                                }
                                onChangeText={
                                    setProgressText
                                }
                                placeholder="Enter your progress..."
                                placeholderTextColor="#94A3B8"
                                multiline
                                textAlignVertical="top"
                                style={
                                    styles.progressInput
                                }
                                editable={
                                    !isSavingProgress
                                }
                            />

                            {progressError ? (
                                <Text
                                    style={
                                        styles.formErrorText
                                    }>
                                    {
                                        progressError
                                    }
                                </Text>
                            ) : null}

                            <View
                                style={
                                    styles.modalButtonRow
                                }>

                                <Pressable
                                    onPress={
                                        closeAddProgress
                                    }
                                    disabled={
                                        isSavingProgress
                                    }
                                    style={[
                                        styles.secondaryModalButton,
                                        isSavingProgress
                                            ? styles.disabledButton
                                            : null,
                                    ]}>

                                    <Text
                                        style={
                                            styles.secondaryModalButtonText
                                        }>
                                        Cancel
                                    </Text>
                                </Pressable>

                                <Pressable
                                    onPress={
                                        handleSaveProgress
                                    }
                                    disabled={
                                        isSavingProgress
                                    }
                                    style={[
                                        styles.primaryModalButton,
                                        isSavingProgress
                                            ? styles.disabledButton
                                            : null,
                                    ]}>

                                    {isSavingProgress ? (
                                        <ActivityIndicator
                                            size="small"
                                            color="#FFFFFF"
                                        />
                                    ) : (
                                        <Text
                                            style={
                                                styles.primaryModalButtonText
                                            }>
                                            Save Progress
                                        </Text>
                                    )}
                                </Pressable>
                            </View>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </Modal>

            {/* ================================================== */}
            {/* VIEW PROGRESS MODAL */}
            {/* ================================================== */}

            <Modal
                visible={
                    showProgressModal
                }
                transparent
                animationType="slide"
                onRequestClose={
                    closeProgressModal
                }>

                <View
                    style={
                        styles.modalOverlay
                    }>

                    <View
                        style={
                            styles.progressListModalCard
                        }>

                        <View
                            style={
                                styles.modalHeader
                            }>

                            <View
                                style={
                                    styles.modalHeaderTextBox
                                }>

                                <Text
                                    style={
                                        styles.modalTitle
                                    }>
                                    View Progress
                                </Text>

                                <Text
                                    numberOfLines={
                                        1
                                    }
                                    style={
                                        styles.modalSubtitle
                                    }>
                                    {selectedTask?.task ||
                                        'Selected task'}
                                </Text>
                            </View>

                            <Pressable
                                onPress={
                                    closeProgressModal
                                }
                                style={
                                    styles.closeButton
                                }>

                                <Text
                                    style={
                                        styles.closeButtonText
                                    }>
                                    ×
                                </Text>
                            </Pressable>
                        </View>

                        {isProgressLoading ? (
                            <View
                                style={
                                    styles.modalLoading
                                }>

                                <ActivityIndicator
                                    size="small"
                                    color="#0F9D9A"
                                />

                                <Text
                                    style={
                                        styles.modalLoadingText
                                    }>
                                    Loading progress...
                                </Text>
                            </View>
                        ) : null}

                        {progressListError ? (
                            <View
                                style={
                                    styles.modalErrorBox
                                }>

                                <Text
                                    style={
                                        styles.modalErrorText
                                    }>
                                    {
                                        progressListError
                                    }
                                </Text>
                            </View>
                        ) : null}

                        {!isProgressLoading &&
                        !progressListError ? (
                            <ScrollView
                                style={
                                    styles.modalScroll
                                }
                                contentContainerStyle={
                                    styles.progressListContent
                                }
                                showsVerticalScrollIndicator={
                                    false
                                }>

                                {progressItems.length >
                                0 ? (
                                    progressItems.map(
                                        (
                                            item,
                                            index,
                                        ) => (
                                            <View
                                                key={
                                                    String(
                                                        item?.id ||
                                                        index,
                                                    )
                                                }
                                                style={
                                                    styles.progressCard
                                                }>

                                                <View
                                                    style={
                                                        styles.progressCardTop
                                                    }>

                                                    <Text
                                                        style={
                                                            styles.progressNumber
                                                        }>
                                                        Progress{' '}
                                                        {index +
                                                            1}
                                                    </Text>

                                                    {item?.date_created ? (
                                                        <Text
                                                            style={
                                                                styles.progressDate
                                                            }>
                                                            {
                                                                item.date_created
                                                            }
                                                        </Text>
                                                    ) : null}
                                                </View>

                                                <Text
                                                    style={
                                                        styles.progressValue
                                                    }>
                                                    {getProgressText(
                                                        item,
                                                    )}
                                                </Text>

                                            </View>
                                        ),
                                    )
                                ) : (
                                    <View
                                        style={
                                            styles.emptyProgressBox
                                        }>

                                        <Text
                                            style={
                                                styles.emptyProgressTitle
                                            }>
                                            No progress found
                                        </Text>

                                        <Text
                                            style={
                                                styles.emptyProgressText
                                            }>
                                            No progress has been
                                            added for this task yet.
                                        </Text>
                                    </View>
                                )}
                            </ScrollView>
                        ) : null}

                        <Pressable
                            onPress={
                                closeProgressModal
                            }
                            style={
                                styles.modalCloseButton
                            }>

                            <Text
                                style={
                                    styles.modalCloseButtonText
                                }>
                                Close
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

/**
 * Styles.
 */
const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: '#F1F5F9',
    },

    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 12,
        paddingTop: 18,
        paddingBottom: 30,
    },

    header: {
        width: '100%',
        marginBottom: 12,
    },

    pageTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#111827',
    },

    activeTasksBar: {
        width: '100%',
        minHeight: 44,
        flexDirection: 'row',
        alignItems: 'center',
        overflow: 'hidden',
        borderRadius: 8,
        backgroundColor: '#163D73',
    },

    activeTitleBox: {
        minHeight: 44,
        justifyContent: 'center',
        paddingHorizontal: 12,
        backgroundColor: '#12335F',
    },

    activeTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: '#FFFFFF',
    },

    tickerContent: {
        alignItems: 'center',
    },

    tickerItem: {
        minHeight: 44,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        borderRightWidth: 1,
        borderRightColor:
            'rgba(255,255,255,0.18)',
    },

    tickerTask: {
        maxWidth: 110,
        fontSize: 12,
        fontWeight: '600',
        color: '#FFFFFF',
    },

    tickerPerson: {
        maxWidth: 100,
        fontSize: 11,
        color: '#E2E8F0',
    },

    tickerDate: {
        fontSize: 11,
        color: '#E2E8F0',
    },

    tickerSeparator: {
        marginHorizontal: 5,
        fontSize: 11,
        color: '#94A3B8',
    },

    tickerStatus: {
        marginLeft: 7,
        paddingHorizontal: 7,
        paddingVertical: 4,
        borderRadius: 10,
    },

    tickerStatusText: {
        fontSize: 9,
        fontWeight: '700',
        color: '#FFFFFF',
    },

    noActiveText: {
        paddingHorizontal: 12,
        fontSize: 11,
        color: '#CBD5E1',
    },

    card: {
        width: '100%',
        marginTop: 12,
        padding: 12,
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
    },

    addTaskButton: {
        minHeight: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#0F9D9A',
        borderRadius: 7,
        backgroundColor: '#FFFFFF',
    },

    addTaskButtonPressed: {
        opacity: 0.7,
    },

    addTaskText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#163D73',
    },

    divider: {
        height: 1,
        marginTop: 12,
        backgroundColor: '#E2E8F0',
    },

    filterScroll: {
        paddingVertical: 12,
    },

    filterButton: {
        minHeight: 36,
        marginRight: 8,
        paddingHorizontal: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#CBD5E1',
        borderRadius: 18,
        backgroundColor: '#FFFFFF',
    },

    filterButtonActive: {
        borderColor: '#0F9D9A',
        backgroundColor: '#0F9D9A',
    },

    filterText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#475569',
    },

    filterTextActive: {
        color: '#FFFFFF',
    },

    controlsSection: {
        width: '100%',
    },

    entriesWrapper: {
        position: 'relative',
        zIndex: 50,
    },

    entriesContainer: {
        minHeight: 40,
        flexDirection: 'row',
        alignItems: 'center',
    },

    controlLabel: {
        fontSize: 13,
        color: '#475569',
    },

    pageSizeButton: {
        minWidth: 52,
        minHeight: 36,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 5,
        paddingHorizontal: 8,
        borderWidth: 1,
        borderColor: '#CBD5E1',
        borderRadius: 7,
        backgroundColor: '#FFFFFF',
    },

    pageSizeText: {
        fontSize: 13,
        color: '#111827',
    },

    dropdownArrow: {
        marginLeft: 5,
        fontSize: 9,
        color: '#64748B',
    },

    pageSizeMenu: {
        position: 'absolute',
        top: 40,
        left: 35,
        zIndex: 100,
        width: 85,
        borderWidth: 1,
        borderColor: '#CBD5E1',
        borderRadius: 6,
        backgroundColor: '#FFFFFF',
        elevation: 8,
        shadowColor: '#000000',
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.15,
        shadowRadius: 5,
    },

    pageSizeOption: {
        minHeight: 40,
        justifyContent: 'center',
        paddingHorizontal: 12,
    },

    pageSizeOptionSelected: {
        backgroundColor: '#2563EB',
    },

    pageSizeOptionText: {
        fontSize: 14,
        color: '#111827',
    },

    pageSizeOptionTextSelected: {
        color: '#FFFFFF',
        fontWeight: '600',
    },

    searchContainer: {
        marginTop: 12,
    },

    searchRow: {
        width: '100%',
        flexDirection: 'row',
        marginTop: 6,
    },

    searchInput: {
        flex: 1,
        minHeight: 40,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: '#CBD5E1',
        borderRadius: 8,
        fontSize: 13,
        color: '#111827',
        backgroundColor: '#FFFFFF',
    },

    searchButton: {
        minWidth: 72,
        marginLeft: 8,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        backgroundColor: '#0F9D9A',
    },

    searchButtonText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#FFFFFF',
    },

    loadingBox: {
        minHeight: 160,
        alignItems: 'center',
        justifyContent: 'center',
    },

    loadingText: {
        marginTop: 8,
        fontSize: 13,
        color: '#64748B',
    },

    errorBox: {
        marginTop: 16,
        padding: 14,
        borderRadius: 10,
        backgroundColor: '#FEF2F2',
    },

    errorTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#991B1B',
    },

    errorText: {
        marginTop: 5,
        fontSize: 13,
        color: '#B91C1C',
    },

    tableWrapper: {
        width: '100%',
        marginTop: 16,
        overflow: 'visible',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },

    tableHeader: {
        flexDirection: 'row',
        minHeight: 46,
        backgroundColor: '#F8FAFC',
        borderBottomWidth: 1,
        borderBottomColor: '#CBD5E1',
    },

    tableRow: {
        flexDirection: 'row',
        minHeight: 82,
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
        backgroundColor: '#FFFFFF',
    },

    tableRowOpen: {
    position: 'relative',
    zIndex: 1000,
    elevation: 20,
},

    headerCell: {
        minHeight: 46,
        paddingHorizontal: 8,
        paddingVertical: 10,
        fontSize: 10,
        fontWeight: '700',
        color: '#64748B',
    },

    bodyCell: {
        paddingHorizontal: 8,
        paddingVertical: 10,
        fontSize: 11,
        color: '#1E293B',
    },

    bodyCellView: {
        justifyContent: 'center',
        paddingHorizontal: 8,
        paddingVertical: 8,
    },

    numberCell: {
        width: 42,
    },

    pageCell: {
        width: 160,
    },

    statusCell: {
        width: 120,
    },

    taskCell: {
        width: 150,
    },

    dueCell: {
        width: 115,
    },

    assignedCell: {
        width: 180,
    },

    assignedByCell: {
        width: 150,
    },

    createdCell: {
        width: 145,
    },

    actionCell: {
        width: 115,
        overflow: 'visible',
    },

    linkText: {
        fontWeight: '700',
        color: '#0F9D9A',
    },

    taskName: {
        fontSize: 12,
        fontWeight: '700',
        color: '#111827',
    },

    description: {
        marginTop: 3,
        fontSize: 10,
        lineHeight: 14,
        color: '#64748B',
    },

    statusBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 5,
        borderRadius: 12,
    },

    pendingBadge: {
        backgroundColor: '#0F9D9A',
    },

    progressBadge: {
        backgroundColor: '#1687D9',
    },

    completedBadge: {
        backgroundColor: '#059669',
    },

    overdueBadge: {
        backgroundColor: '#DC2626',
    },

    statusText: {
        fontSize: 9,
        fontWeight: '700',
        color: '#FFFFFF',
    },

    actionButton: {
        minHeight: 34,
        paddingHorizontal: 8,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 7,
        backgroundColor: '#F1F5F9',
    },

    actionButtonText: {
        fontSize: 10,
        fontWeight: '600',
        color: '#475569',
    },

    actionCellOpen: {
    zIndex: 1000,
    elevation: 10,
},

actionDropdownWrapper: {
    position: 'relative',
    zIndex: 2000,
    elevation: 20,
},

actionButtonPressed: {
    opacity: 0.7,
},

actionDropdownMenu: {
    position: 'absolute',
    top: 38,
    left: 0,

    width: 145,

    zIndex: 3000,
    elevation: 25,

    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 9,

    backgroundColor: '#FFFFFF',

    shadowColor: '#000000',
    shadowOffset: {
        width: 0,
        height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
},

actionDropdownItem: {
    minHeight: 42,
    justifyContent: 'center',
    paddingHorizontal: 12,

    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',

    backgroundColor: '#FFFFFF',
},

actionDropdownItemPressed: {
    backgroundColor: '#F1F5F9',
},

actionDropdownText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
},

    emptyTable: {
        minWidth: 1100,
        minHeight: 140,
        alignItems: 'center',
        justifyContent: 'center',
    },

    emptyText: {
        fontSize: 13,
        color: '#64748B',
    },

    paginationArea: {
        marginTop: 16,
    },

    paginationInfo: {
        fontSize: 12,
        color: '#64748B',
    },

    paginationControls: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginTop: 12,
        gap: 7,
    },

    paginationButton: {
        minHeight: 36,
        paddingHorizontal: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#CBD5E1',
        borderRadius: 7,
        backgroundColor: '#FFFFFF',
    },

    paginationDisabled: {
        opacity: 0.45,
    },

    paginationButtonText: {
        fontSize: 11,
        color: '#475569',
    },

    currentPageButton: {
        width: 36,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 7,
        backgroundColor: '#0F9D9A',
    },

    currentPageText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#FFFFFF',
    },

    /* ==================================================
       MODALS
       ================================================== */

    modalOverlay: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 16,
        backgroundColor:
            'rgba(15,23,42,0.55)',
    },

    actionModalCard: {
        width: '100%',
        maxWidth: 420,
        padding: 16,
        borderRadius: 14,
        backgroundColor: '#FFFFFF',
    },

    detailModalCard: {
        width: '100%',
        maxWidth: 520,
        maxHeight: '86%',
        padding: 16,
        borderRadius: 14,
        backgroundColor: '#FFFFFF',
    },

    progressModalCard: {
        width: '100%',
        maxWidth: 520,
        padding: 16,
        borderRadius: 14,
        backgroundColor: '#FFFFFF',
    },

    progressListModalCard: {
        width: '100%',
        maxWidth: 520,
        maxHeight: '86%',
        padding: 16,
        borderRadius: 14,
        backgroundColor: '#FFFFFF',
    },

    keyboardContainer: {
        width: '100%',
        alignItems: 'center',
    },

    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 14,
    },

    modalHeaderTextBox: {
        flex: 1,
        paddingRight: 10,
    },

    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },

    modalSubtitle: {
        marginTop: 3,
        fontSize: 11,
        color: '#64748B',
    },

    closeButton: {
        width: 34,
        height: 34,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 17,
        backgroundColor: '#F1F5F9',
    },

    closeButtonText: {
        marginTop: -2,
        fontSize: 25,
        lineHeight: 27,
        color: '#475569',
    },

    actionOptions: {
        width: '100%',
    },

    actionOption: {
        minHeight: 48,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 14,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 9,
        marginTop: 8,
        backgroundColor: '#FFFFFF',
    },

    actionOptionPressed: {
        opacity: 0.7,
        backgroundColor: '#F8FAFC',
    },

    actionOptionText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#334155',
    },

    actionOptionArrow: {
        fontSize: 22,
        color: '#0F9D9A',
    },

    modalScroll: {
        flexGrow: 0,
    },

    modalScrollContent: {
        paddingBottom: 8,
    },

    detailRow: {
        width: '100%',
        paddingVertical: 10,
        paddingHorizontal: 10,
        marginBottom: 7,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 9,
        backgroundColor: '#F8FAFC',
    },

    detailLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: '#64748B',
    },

    detailValue: {
        marginTop: 4,
        fontSize: 13,
        lineHeight: 19,
        color: '#1E293B',
    },

    modalLoading: {
        minHeight: 90,
        alignItems: 'center',
        justifyContent: 'center',
    },

    modalLoadingText: {
        marginTop: 8,
        fontSize: 12,
        color: '#64748B',
    },

    modalErrorBox: {
        marginBottom: 10,
        padding: 10,
        borderRadius: 8,
        backgroundColor: '#FEF2F2',
    },

    modalErrorText: {
        fontSize: 12,
        lineHeight: 17,
        color: '#B91C1C',
    },

    emptyModalText: {
        paddingVertical: 30,
        textAlign: 'center',
        fontSize: 13,
        color: '#64748B',
    },

    modalCloseButton: {
        minHeight: 42,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 12,
        borderRadius: 8,
        backgroundColor: '#F1F5F9',
    },

    modalCloseButtonText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#475569',
    },

    inputLabel: {
        marginBottom: 7,
        fontSize: 13,
        fontWeight: '600',
        color: '#334155',
    },

    progressInput: {
        minHeight: 140,
        maxHeight: 220,
        paddingHorizontal: 12,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: '#CBD5E1',
        borderRadius: 9,
        fontSize: 13,
        lineHeight: 19,
        color: '#111827',
        backgroundColor: '#FFFFFF',
    },

    formErrorText: {
        marginTop: 7,
        fontSize: 12,
        color: '#B91C1C',
    },

    modalButtonRow: {
        width: '100%',
        flexDirection: 'row',
        marginTop: 14,
        gap: 8,
    },

    secondaryModalButton: {
        flex: 1,
        minHeight: 42,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#CBD5E1',
        borderRadius: 8,
        backgroundColor: '#FFFFFF',
    },

    secondaryModalButtonText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#475569',
    },

    primaryModalButton: {
        flex: 1.3,
        minHeight: 42,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        backgroundColor: '#0F9D9A',
    },

    primaryModalButtonText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#FFFFFF',
    },

    disabledButton: {
        opacity: 0.55,
    },

    progressListContent: {
        paddingBottom: 4,
    },

    progressCard: {
        marginBottom: 9,
        padding: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 10,
        backgroundColor: '#F8FAFC',
    },

    progressCardTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },

    progressNumber: {
        fontSize: 12,
        fontWeight: '700',
        color: '#0F9D9A',
    },

    progressDate: {
        marginLeft: 8,
        fontSize: 10,
        color: '#64748B',
    },

    progressValue: {
        marginTop: 8,
        fontSize: 13,
        lineHeight: 19,
        color: '#1E293B',
    },

    emptyProgressBox: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 35,
        paddingHorizontal: 15,
    },

    emptyProgressTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#334155',
    },

    emptyProgressText: {
        marginTop: 5,
        textAlign: 'center',
        fontSize: 12,
        lineHeight: 18,
        color: '#64748B',
    },
});

export default AllTask;