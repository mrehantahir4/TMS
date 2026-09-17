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
 */

import React, { useEffect, useMemo, useState } from 'react';

import {
    ActivityIndicator,
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

import { getTasks } from '../../services/taskService';

/**
 * Page size options.
 */
const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

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
    const [isLoading, setIsLoading] = useState(true);

    /**
     * API error.
     */
    const [errorMessage, setErrorMessage] = useState('');

    /**
     * Current page.
     */
    const [currentPage, setCurrentPage] = useState(1);

    /**
     * Selected page size.
     */
    const [pageSize, setPageSize] = useState(10);

    /**
     * Page size dropdown.
     */
    const [showPageSizeMenu, setShowPageSizeMenu] =
        useState(false);

    /**
     * API total.
     */
    const [totalTasks, setTotalTasks] = useState(0);

    /**
     * Search text.
     */
    const [searchText, setSearchText] = useState('');

    /**
     * Search value actually sent to API.
     */
    const [activeSearch, setActiveSearch] = useState('');

    /**
     * Current task filter.
     */
    const [taskFilter, setTaskFilter] = useState(
        TASK_FILTERS.ALL,
    );

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

            const items =
                response?.data?.items || [];

            const total =
                Number(response?.data?.total || 0);

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
                const authToken = await getToken();
                const storedUser = await getUser();

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
     * Search.
     *
     * API request search ke saath jayegi.
     */
    const handleSearch = async () => {
        const cleanSearch = searchText.trim();

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
    const handlePageSizeChange = async size => {
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
    const handlePreviousPage = async () => {
        if (currentPage <= 1 || isLoading) {
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
        Math.ceil(totalTasks / pageSize),
    );

    /**
     * Next page.
     */
    const handleNextPage = async () => {
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
     * Check whether task is assigned to
     * current employee.
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
     * Check whether task was assigned by
     * current employee.
     */
    const isAssignedByMe = task => {
        const currentUserId =
            String(user?.id || '');

        if (!currentUserId) {
            return false;
        }

        return (
            String(task?.assigned_by || '') ===
            currentUserId
        );
    };

    /**
     * Filter tasks.
     *
     * Backend se jo actual tasks aaye hain,
     * unhi ko category ke according filter
     * kar rahe hain.
     */
    const visibleTasks = useMemo(() => {
        if (taskFilter === TASK_FILTERS.ASSIGNED_TO_ME) {
            return tasks.filter(isAssignedToMe);
        }

        if (taskFilter === TASK_FILTERS.ASSIGNED_BY_ME) {
            return tasks.filter(isAssignedByMe);
        }

        return tasks;
    }, [
        tasks,
        taskFilter,
        user,
    ]);

    /**
     * Format date.
     *
     * Backend date:
     * YYYY-MM-DD
     *
     * UI:
     * Sep 11, 2026
     */
    const formatDueDate = date => {
        if (!date) {
            return '-';
        }

        const parsedDate =
            new Date(`${date}T00:00:00`);

        if (Number.isNaN(parsedDate.getTime())) {
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
     *
     * Actual API data se pending/on-progress
     * tasks filter kar rahe hain.
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

        if (cleanStatus === 'completed') {
            return styles.completedBadge;
        }

        if (cleanStatus === 'on-progress') {
            return styles.progressBadge;
        }

        return styles.pendingBadge;
    };

    return (
        <View style={styles.screen}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}>

                {/* Page Header */}
                <View style={styles.header}>
                    <Text style={styles.pageTitle}>
                        Task List
                    </Text>
                </View>

                {/* Active Tasks Ticker */}
                <View style={styles.activeTasksBar}>
                    <View style={styles.activeTitleBox}>
                        <Text style={styles.activeTitle}>
                            🔔 Active Tasks
                        </Text>
                    </View>

                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={
                            styles.tickerContent
                        }>

                        {activeTasks.length > 0 ? (
                            activeTasks.map(task => (
                                <View
                                    key={task.id}
                                    style={styles.tickerItem}>

                                    <Text
                                        numberOfLines={1}
                                        style={styles.tickerTask}>
                                        {task?.task || '-'}
                                    </Text>

                                    <Text style={styles.tickerSeparator}>
                                        •
                                    </Text>

                                    <Text
                                        numberOfLines={1}
                                        style={styles.tickerPerson}>
                                        {task?.assigned_to_names || '-'}
                                    </Text>

                                    <Text style={styles.tickerSeparator}>
                                        •
                                    </Text>

                                    <Text style={styles.tickerDate}>
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
                            ))
                        ) : (
                            <Text style={styles.noActiveText}>
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
                            console.log(
                                'Add New Task pressed',
                            );
                        }}
                        style={({ pressed }) => [
                            styles.addTaskButton,
                            pressed
                                ? styles.addTaskButtonPressed
                                : null,
                        ]}>

                        <Text style={styles.addTaskText}>
                            + Add New Task
                        </Text>
                    </Pressable>

                    <View style={styles.divider} />

                    {/* Task Filters */}
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
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
                    <View style={styles.controlsSection}>

                        {/* Show Entries */}
                        <View style={styles.entriesWrapper}>
                            <View style={styles.entriesContainer}>

                                <Text style={styles.controlLabel}>
                                    Show
                                </Text>

                                <Pressable
                                    onPress={() =>
                                        setShowPageSizeMenu(
                                            previous => !previous,
                                        )
                                    }
                                    style={
                                        styles.pageSizeButton
                                    }>

                                    <Text style={styles.pageSizeText}>
                                        {pageSize}
                                    </Text>

                                    <Text
                                        style={
                                            styles.dropdownArrow
                                        }>
                                        ▼
                                    </Text>
                                </Pressable>

                                <Text style={styles.controlLabel}>
                                    entries
                                </Text>

                            </View>

                            {showPageSizeMenu ? (
                                <View style={styles.pageSizeMenu}>
                                    {PAGE_SIZE_OPTIONS.map(
                                        option => (
                                            <Pressable
                                                key={option}
                                                onPress={() =>
                                                    handlePageSizeChange(
                                                        option,
                                                    )
                                                }
                                                style={[
                                                    styles.pageSizeOption,
                                                    pageSize === option
                                                        ? styles.pageSizeOptionSelected
                                                        : null,
                                                ]}>

                                                <Text
                                                    style={[
                                                        styles.pageSizeOptionText,
                                                        pageSize === option
                                                            ? styles.pageSizeOptionTextSelected
                                                            : null,
                                                    ]}>
                                                    {option}
                                                </Text>

                                            </Pressable>
                                        ),
                                    )}
                                </View>
                            ) : null}
                        </View>

                        {/* Search */}
                        <View style={styles.searchContainer}>

                            <Text style={styles.controlLabel}>
                                Search
                            </Text>

                            <View style={styles.searchRow}>
                                <TextInput
                                    value={searchText}
                                    onChangeText={setSearchText}
                                    placeholder="Search tasks..."
                                    placeholderTextColor="#94A3B8"
                                    style={styles.searchInput}
                                    returnKeyType="search"
                                    onSubmitEditing={
                                        handleSearch
                                    }
                                />

                                <Pressable
                                    onPress={handleSearch}
                                    style={styles.searchButton}>

                                    <Text style={styles.searchButtonText}>
                                        Search
                                    </Text>
                                </Pressable>
                            </View>
                        </View>

                    </View>

                    {/* Loading */}
                    {isLoading ? (
                        <View style={styles.loadingBox}>
                            <ActivityIndicator
                                size="small"
                                color="#111827"
                            />

                            <Text style={styles.loadingText}>
                                Loading tasks...
                            </Text>
                        </View>
                    ) : null}

                    {/* Error */}
                    {!isLoading && errorMessage ? (
                        <View style={styles.errorBox}>
                            <Text style={styles.errorTitle}>
                                Unable to load tasks
                            </Text>

                            <Text style={styles.errorText}>
                                {errorMessage}
                            </Text>
                        </View>
                    ) : null}

                    {/* Task Table */}
                    {!isLoading && !errorMessage ? (
                        <View style={styles.tableWrapper}>

                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={true}>

                                <View>

                                    {/* Table Header */}
                                    <View style={styles.tableHeader}>

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
                                    {visibleTasks.length > 0 ? (
                                        visibleTasks.map(
                                            (task, index) => (
                                                <View
                                                    key={String(
                                                        task?.id ||
                                                        index,
                                                    )}
                                                    style={
                                                        styles.tableRow
                                                    }>

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
                                                        numberOfLines={3}
                                                        style={[
                                                            styles.bodyCell,
                                                            styles.pageCell,
                                                            styles.linkText,
                                                        ]}>
                                                        {task?.pagename || '-'}
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
                                                            numberOfLines={2}
                                                            style={
                                                                styles.taskName
                                                            }>
                                                            {task?.task || '-'}
                                                        </Text>

                                                        {task?.description ? (
                                                            <Text
                                                                numberOfLines={2}
                                                                style={
                                                                    styles.description
                                                                }>
                                                                {task.description}
                                                            </Text>
                                                        ) : null}

                                                    </View>

                                                    {/* Due Date */}
                                                    <Text
                                                        numberOfLines={2}
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
                                                        numberOfLines={3}
                                                        style={[
                                                            styles.bodyCell,
                                                            styles.assignedCell,
                                                        ]}>
                                                        {task?.assigned_to_names ||
                                                            '-'}
                                                    </Text>

                                                    {/* Assigned By */}
                                                    <Text
                                                        numberOfLines={3}
                                                        style={[
                                                            styles.bodyCell,
                                                            styles.assignedByCell,
                                                        ]}>
                                                        {task?.assigned_by_name ||
                                                            '-'}
                                                    </Text>

                                                    {/* Created At */}
                                                    <Text
                                                        numberOfLines={3}
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
                                                        ]}>

                                                        <Pressable
                                                            onPress={() =>
                                                                console.log(
                                                                    'Task action:',
                                                                    task,
                                                                )
                                                            }
                                                            style={
                                                                styles.actionButton
                                                            }>

                                                            <Text
                                                                style={
                                                                    styles.actionButtonText
                                                                }>
                                                                Action ▼
                                                            </Text>

                                                        </Pressable>

                                                    </View>

                                                </View>
                                            ),
                                        )
                                    ) : (
                                        <View
                                            style={styles.emptyTable}>
                                            <Text style={styles.emptyText}>
                                                No tasks found.
                                            </Text>
                                        </View>
                                    )}

                                </View>
                            </ScrollView>
                        </View>
                    ) : null}

                    {/* Pagination Information */}
                    {!isLoading &&
                        !errorMessage ? (
                        <View style={styles.paginationArea}>

                            <Text style={styles.paginationInfo}>
                                Showing{' '}
                                {totalTasks === 0
                                    ? 0
                                    : (currentPage - 1) *
                                    pageSize +
                                    1}{' '}
                                to{' '}
                                {Math.min(
                                    currentPage * pageSize,
                                    totalTasks,
                                )}{' '}
                                of {totalTasks} entries
                            </Text>

                            <View style={styles.paginationControls}>

                                <Pressable
                                    onPress={
                                        handlePreviousPage
                                    }
                                    disabled={
                                        currentPage === 1 ||
                                        isLoading
                                    }
                                    style={[
                                        styles.paginationButton,
                                        currentPage === 1
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
                                        {currentPage}
                                    </Text>
                                </View>

                                <Pressable
                                    onPress={handleNextPage}
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
        borderRightColor: 'rgba(255,255,255,0.18)',
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
        overflow: 'hidden',
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
        width: 105,
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
        gap: 7,
        marginTop: 12,
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
});

export default AllTask;