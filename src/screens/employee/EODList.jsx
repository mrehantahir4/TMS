/**
 * TMSshj - EOD List
 *
 * Employee ke EOD records yahan show honge.
 *
 * Features:
 * 1. Real EOD API
 * 2. Responsive mobile layout
 * 3. Responsive header
 * 4. Responsive toolbar
 * 5. Search button
 * 6. Horizontal scrollable table
 * 7. Pagination
 * 8. Pull to refresh
 * 9. Real page / employee names
 * 10. Loading and error handling
 */

import React, {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react';

import {
    ActivityIndicator,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    useWindowDimensions,
    View,
} from 'react-native';

import {getToken} from '../../services/authStorage';

import {getEods} from '../../services/eodService';

import {
    getEmployees,
    getPages,
} from '../../services/lookupService';

/**
 * Page size options.
 */
const PAGE_SIZE_OPTIONS = [
    10,
    20,
    50,
    100,
];

/**
 * EOD List Screen.
 */
const EODList = () => {
    /**
     * Current screen width.
     *
     * Is se mobile/tablet layout
     * dynamically adjust hoga.
     */
    const {width: screenWidth} =
        useWindowDimensions();

    /**
     * Small mobile screen.
     */
    const isSmallScreen = screenWidth <= 380;

    /**
     * Mobile screen.
     */
    const isMobile = screenWidth <= 600;

    /**
     * Authentication token.
     */
    const [token, setToken] = useState(null);

    /**
     * EOD records.
     */
    const [eods, setEods] = useState([]);

    /**
     * Current page.
     */
    const [currentPage, setCurrentPage] =
        useState(1);

    /**
     * Number of records per page.
     */
    const [pageSize, setPageSize] =
        useState(10);

    /**
     * Total EOD records.
     */
    const [totalEods, setTotalEods] =
        useState(0);

    /**
     * Search text.
     */
    const [searchText, setSearchText] =
        useState('');

    /**
     * Search value.
     *
     * Ye actual filtering ke liye use hoga.
     */
    const [activeSearch, setActiveSearch] =
        useState('');

    /**
     * Page size dropdown.
     */
    const [
        showPageSizeMenu,
        setShowPageSizeMenu,
    ] = useState(false);

    /**
     * API loading.
     */
    const [isLoading, setIsLoading] =
        useState(true);

    /**
     * Pull refresh.
     */
    const [isRefreshing, setIsRefreshing] =
        useState(false);

    /**
     * Error message.
     */
    const [errorMessage, setErrorMessage] =
        useState('');

    /**
     * Pages lookup.
     */
    const [pages, setPages] =
        useState([]);

    /**
     * Employees lookup.
     */
    const [employees, setEmployees] =
        useState([]);

    /**
     * Load lookup data.
     */
    const loadLookups = async authToken => {
        try {
            const [
                pagesResponse,
                employeesResponse,
            ] = await Promise.all([
                getPages(authToken),
                getEmployees(authToken),
            ]);

            if (pagesResponse?.ok) {
                setPages(
                    pagesResponse?.data?.items ||
                        [],
                );
            }

            if (employeesResponse?.ok) {
                setEmployees(
                    employeesResponse?.data?.items ||
                        [],
                );
            }
        } catch (error) {
            console.error(
                'EOD lookup error:',
                error,
            );
        }
    };

    /**
     * Load EOD records.
     */
    const loadEods = useCallback(
        async (
            authToken,
            page,
            limit,
            showLoader = true,
        ) => {
            try {
                if (showLoader) {
                    setIsLoading(true);
                }

                setErrorMessage('');

                const response =
                    await getEods(
                        authToken,
                        page,
                        limit,
                    );

                if (!response?.ok) {
                    throw new Error(
                        'Unable to load EOD list.',
                    );
                }

                const items =
                    response?.data?.items ||
                    [];

                const total =
                    Number(
                        response?.data?.total ||
                            0,
                    );

                const apiPage =
                    Number(
                        response?.data?.page ||
                            page,
                    );

                setEods(items);
                setTotalEods(total);
                setCurrentPage(apiPage);

                console.log(
                    'EOD List API Response:',
                    response,
                );
            } catch (error) {
                console.error(
                    'EOD List API Error:',
                    error,
                );

                setEods([]);
                setTotalEods(0);

                if (error instanceof Error) {
                    setErrorMessage(
                        error.message,
                    );
                } else {
                    setErrorMessage(
                        'Unable to load EOD list.',
                    );
                }
            } finally {
                setIsLoading(false);
                setIsRefreshing(false);
            }
        },
        [],
    );

    /**
     * Initial screen load.
     */
    useEffect(() => {
        const initializeScreen =
            async () => {
                try {
                    const authToken =
                        await getToken();

                    if (!authToken) {
                        setErrorMessage(
                            'Authentication token not found.',
                        );

                        setIsLoading(false);
                        return;
                    }

                    setToken(authToken);

                    await Promise.all([
                        loadEods(
                            authToken,
                            1,
                            pageSize,
                            true,
                        ),
                        loadLookups(
                            authToken,
                        ),
                    ]);
                } catch (error) {
                    console.error(
                        'EOD initialization error:',
                        error,
                    );

                    setErrorMessage(
                        'Unable to initialize EOD list.',
                    );

                    setIsLoading(false);
                }
            };

        initializeScreen();
    }, [loadEods]);

    /**
     * Find page name.
     */
    const getPageName =
        useCallback(
            pageId => {
                if (!pageId) {
                    return '-';
                }

                const page = pages.find(
                    item =>
                        String(
                            item?.id,
                        ) ===
                        String(pageId),
                );

                return (
                    page?.pagename ||
                    String(pageId)
                );
            },
            [pages],
        );

    /**
     * Find employee name.
     */
    const getEmployeeName =
        useCallback(
            employeeId => {
                if (!employeeId) {
                    return '-';
                }

                const employee =
                    employees.find(
                        item =>
                            String(
                                item?.id,
                            ) ===
                            String(
                                employeeId,
                            ),
                    );

                if (!employee) {
                    return String(
                        employeeId,
                    );
                }

                return (
                    employee?.name ||
                    [
                        employee?.firstname,
                        employee?.lastname,
                    ]
                        .filter(Boolean)
                        .join(' ') ||
                    String(employeeId)
                );
            },
            [employees],
        );

    /**
     * Format employee IDs into names.
     */
    const formatEmployeeList =
        useCallback(
            value => {
                if (!value) {
                    return '-';
                }

                return String(value)
                    .split(',')
                    .map(id =>
                        id.trim(),
                    )
                    .filter(Boolean)
                    .map(id =>
                        getEmployeeName(id),
                    )
                    .join(', ');
            },
            [getEmployeeName],
        );

    /**
     * Format due date.
     */
    const formatDueDate = value => {
        if (!value) {
            return '-';
        }

        const parts =
            String(value).split('-');

        if (parts.length !== 3) {
            return String(value);
        }

        const monthNames = [
            'Jan',
            'Feb',
            'Mar',
            'Apr',
            'May',
            'Jun',
            'Jul',
            'Aug',
            'Sep',
            'Oct',
            'Nov',
            'Dec',
        ];

        const month =
            Number(parts[1]);

        return `${
            monthNames[month - 1] ||
            parts[1]
        } ${parts[2]}, ${parts[0]}`;
    };

    /**
     * Format created date.
     */
    const formatCreatedDate = value => {
        if (!value) {
            return '-';
        }

        const parts =
            String(value).split(' ');

        if (parts.length < 2) {
            return String(value);
        }

        return (
            <>
                <Text
                    style={
                        styles.createdDate
                    }>
                    {parts[0]}
                </Text>

                <Text
                    style={
                        styles.createdTime
                    }>
                    {parts[1]}
                </Text>
            </>
        );
    };

    /**
     * Search button.
     */
    const handleSearch = () => {
        setActiveSearch(
            searchText.trim(),
        );
    };

    /**
     * Search by keyboard.
     */
    const handleSearchSubmit = () => {
        setActiveSearch(
            searchText.trim(),
        );
    };

    /**
     * Local search.
     *
     * Backend EOD search parameter confirmed
     * nahi hai, is liye current API page ko
     * locally filter kar rahe hain.
     */
    const filteredEods = useMemo(() => {
        const cleanSearch =
            activeSearch
                .trim()
                .toLowerCase();

        if (!cleanSearch) {
            return eods;
        }

        return eods.filter(eod => {
            const searchableText = [
                getPageName(
                    eod?.page_id,
                ),
                eod?.task,
                eod?.description,
                formatEmployeeList(
                    eod?.employee_id,
                ),
                formatEmployeeList(
                    eod?.cc_employee_id,
                ),
                eod?.assigned_by_name,
                eod?.shift,
                eod?.status_label,
                eod?.due_date,
                eod?.date_created,
            ]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();

            return searchableText.includes(
                cleanSearch,
            );
        });
    }, [
        activeSearch,
        eods,
        getPageName,
        formatEmployeeList,
    ]);

    /**
     * Refresh current page.
     */
    const handleRefresh = async () => {
        if (!token) {
            return;
        }

        setIsRefreshing(true);

        await loadEods(
            token,
            currentPage,
            pageSize,
            false,
        );
    };

    /**
     * Total pages.
     */
    const totalPages =
        totalEods === 0
            ? 1
            : Math.ceil(
                totalEods /
                    pageSize,
            );

    /**
     * Previous page.
     */
    const handlePreviousPage =
        async () => {
            if (
                !token ||
                currentPage <= 1 ||
                isLoading
            ) {
                return;
            }

            const previousPage =
                currentPage - 1;

            setActiveSearch('');
            setSearchText('');

            await loadEods(
                token,
                previousPage,
                pageSize,
                true,
            );
        };

    /**
     * Next page.
     */
    const handleNextPage =
        async () => {
            if (
                !token ||
                currentPage >=
                    totalPages ||
                isLoading
            ) {
                return;
            }

            const nextPage =
                currentPage + 1;

            setActiveSearch('');
            setSearchText('');

            await loadEods(
                token,
                nextPage,
                pageSize,
                true,
            );
        };

    /**
     * Change page size.
     */
    const handlePageSizeChange =
        async size => {
            if (!token) {
                return;
            }

            setShowPageSizeMenu(
                false,
            );

            setSearchText('');
            setActiveSearch('');

            setPageSize(size);

            await loadEods(
                token,
                1,
                size,
                true,
            );
        };

    /**
     * Status badge style.
     */
    const getStatusStyle =
        statusLabel => {
            const label =
                String(
                    statusLabel ||
                        '',
                ).toLowerCase();

            if (
                label ===
                'completed'
            ) {
                return (
                    styles.completedBadge
                );
            }

            if (
                label.includes(
                    'progress',
                )
            ) {
                return (
                    styles.progressBadge
                );
            }

            return styles.pendingBadge;
        };

    /**
     * Initial loading screen.
     */
    if (
        isLoading &&
        eods.length === 0
    ) {
        return (
            <View
                style={
                    styles.loadingScreen
                }>

                <ActivityIndicator
                    size="large"
                    color="#0F9D9A"
                />

                <Text
                    style={
                        styles.loadingText
                    }>
                    Loading EODs...
                </Text>

            </View>
        );
    }

    return (
        <View style={styles.screen}>

            <ScrollView
                style={
                    styles.mainScroll
                }
                contentContainerStyle={
                    styles.scrollContent
                }
                refreshControl={
                    <RefreshControl
                        refreshing={
                            isRefreshing
                        }
                        onRefresh={
                            handleRefresh
                        }
                    />
                }>

                {/* Page Heading */}
                <View
                    style={[
                        styles.pageHeadingArea,
                        isMobile
                            ? styles.pageHeadingMobile
                            : null,
                    ]}>

                    <Text
                        style={[
                            styles.pageTitle,
                            isSmallScreen
                                ? styles.smallPageTitle
                                : null,
                        ]}>
                        Eod List
                    </Text>

                </View>

                {/* Main Card */}
                <View
                    style={[
                        styles.mainCard,
                        isMobile
                            ? styles.mainCardMobile
                            : null,
                    ]}>

                    {/* Card Header */}
                    <View
                        style={[
                            styles.cardHeader,
                            isMobile
                                ? styles.cardHeaderMobile
                                : null,
                        ]}>

                        <Text
                            style={[
                                styles.cardTitle,
                                isSmallScreen
                                    ? styles.smallCardTitle
                                    : null,
                            ]}>
                            ▣ EOD List
                        </Text>

                        <Pressable
                            onPress={() =>
                                console.log(
                                    'Add EOD pressed',
                                )
                            }
                            style={({pressed}) => [
                                styles.addEodButton,
                                isMobile
                                    ? styles.addEodButtonMobile
                                    : null,
                                pressed
                                    ? styles.addEodButtonPressed
                                    : null,
                            ]}>

                            <Text
                                style={
                                    styles.addEodButtonText
                                }>
                                + Add EOD
                            </Text>

                        </Pressable>

                    </View>

                    {/* Controls */}
                    <View
                        style={[
                            styles.toolbar,
                            isMobile
                                ? styles.toolbarMobile
                                : null,
                        ]}>

                        {/* Show Entries */}
                        <View
                            style={
                                styles.entriesArea
                            }>

                            <View
                                style={
                                    styles.entriesRow
                                }>

                                <Text
                                    style={
                                        styles.showText
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
                                            styles.smallArrow
                                        }>
                                        ▼
                                    </Text>

                                </Pressable>

                                <Text
                                    style={
                                        styles.entriesText
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
                                        size => (
                                            <Pressable
                                                key={size}
                                                onPress={() =>
                                                    handlePageSizeChange(
                                                        size,
                                                    )
                                                }
                                                style={
                                                    styles.pageSizeOption
                                                }>

                                                <Text
                                                    style={
                                                        styles.pageSizeOptionText
                                                    }>
                                                    {size}
                                                </Text>

                                            </Pressable>
                                        ),
                                    )}

                                </View>
                            ) : null}

                        </View>

                        {/* Search */}
                        <View
                            style={[
                                styles.searchArea,
                                isMobile
                                    ? styles.searchAreaMobile
                                    : null,
                            ]}>

                            <Text
                                style={
                                    styles.searchLabel
                                }>
                                Search:
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
                                    placeholder="Search EOD..."
                                    placeholderTextColor="#94A3B8"
                                    style={
                                        styles.searchInput
                                    }
                                    autoCapitalize="none"
                                    returnKeyType="search"
                                    onSubmitEditing={
                                        handleSearchSubmit
                                    }
                                />

                                <Pressable
                                    onPress={
                                        handleSearch
                                    }
                                    style={({pressed}) => [
                                        styles.searchButton,
                                        pressed
                                            ? styles.searchButtonPressed
                                            : null,
                                    ]}>

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

                    {/* Error */}
                    {errorMessage ? (
                        <View
                            style={
                                styles.errorBox
                            }>

                            <Text
                                style={
                                    styles.errorText
                                }>
                                {errorMessage}
                            </Text>

                            <Pressable
                                onPress={() => {
                                    if (!token) {
                                        return;
                                    }

                                    loadEods(
                                        token,
                                        currentPage,
                                        pageSize,
                                        true,
                                    );
                                }}
                                style={
                                    styles.retryButton
                                }>

                                <Text
                                    style={
                                        styles.retryButtonText
                                    }>
                                    Retry
                                </Text>

                            </Pressable>

                        </View>
                    ) : null}

                    {/* Table */}
                    {!errorMessage ? (
                        <View
                            style={
                                styles.tableOuter
                            }>

                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={
                                    true
                                }
                                nestedScrollEnabled>

                                <View
                                    style={
                                        styles.tableContainer
                                    }>

                                    {/* Header */}
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
                                                styles.pageNameCell,
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
                                                styles.dueDateCell,
                                            ]}>
                                            DUE DATE
                                        </Text>

                                        <Text
                                            style={[
                                                styles.headerCell,
                                                styles.shiftCell,
                                            ]}>
                                            SHIFT
                                        </Text>

                                        <Text
                                            style={[
                                                styles.headerCell,
                                                styles.assignedToCell,
                                            ]}>
                                            ASSIGNED TO
                                        </Text>

                                        <Text
                                            style={[
                                                styles.headerCell,
                                                styles.ccCell,
                                            ]}>
                                            CC
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
                                                styles.createdAtCell,
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

                                    {/* Rows */}
                                    {filteredEods.length >
                                    0 ? (
                                        filteredEods.map(
                                            (
                                                eod,
                                                index,
                                            ) => (
                                                <View
                                                    key={
                                                        eod?.id ||
                                                        `${currentPage}-${index}`
                                                    }
                                                    style={
                                                        styles.tableRow
                                                    }>

                                                    {/* Number */}
                                                    <View
                                                        style={[
                                                            styles.bodyCellView,
                                                            styles.numberCell,
                                                        ]}>

                                                        <Text
                                                            style={
                                                                styles.bodyCell
                                                            }>
                                                            {(currentPage -
                                                                1) *
                                                                pageSize +
                                                                index +
                                                                1}
                                                        </Text>

                                                    </View>

                                                    {/* Page */}
                                                    <View
                                                        style={[
                                                            styles.bodyCellView,
                                                            styles.pageNameCell,
                                                        ]}>

                                                        <Text
                                                            style={
                                                                styles.pageNameText
                                                            }
                                                            numberOfLines={
                                                                2
                                                            }>
                                                            {getPageName(
                                                                eod?.page_id,
                                                            )}
                                                        </Text>

                                                    </View>

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
                                                                    eod?.status_label,
                                                                ),
                                                            ]}>

                                                            <Text
                                                                style={
                                                                    styles.statusText
                                                                }>
                                                                {eod?.status_label ||
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
                                                            style={
                                                                styles.taskText
                                                            }
                                                            numberOfLines={
                                                                2
                                                            }>
                                                            {eod?.task ||
                                                                '-'}
                                                        </Text>

                                                        <Text
                                                            style={
                                                                styles.descriptionText
                                                            }
                                                            numberOfLines={
                                                                2
                                                            }>
                                                            {eod?.description ||
                                                                '-'}
                                                        </Text>

                                                    </View>

                                                    {/* Due Date */}
                                                    <View
                                                        style={[
                                                            styles.bodyCellView,
                                                            styles.dueDateCell,
                                                        ]}>

                                                        <Text
                                                            style={
                                                                styles.dueDateText
                                                            }>
                                                            {formatDueDate(
                                                                eod?.due_date,
                                                            )}
                                                        </Text>

                                                    </View>

                                                    {/* Shift */}
                                                    <View
                                                        style={[
                                                            styles.bodyCellView,
                                                            styles.shiftCell,
                                                        ]}>

                                                        <View
                                                            style={
                                                                styles.shiftBadge
                                                            }>

                                                            <Text
                                                                style={
                                                                    styles.shiftText
                                                                }>
                                                                {eod?.shift ||
                                                                    '-'}
                                                            </Text>

                                                        </View>

                                                    </View>

                                                    {/* Assigned To */}
                                                    <View
                                                        style={[
                                                            styles.bodyCellView,
                                                            styles.assignedToCell,
                                                        ]}>

                                                        <Text
                                                            style={
                                                                styles.assignedText
                                                            }
                                                            numberOfLines={
                                                                3
                                                            }>
                                                            {formatEmployeeList(
                                                                eod?.employee_id,
                                                            )}
                                                        </Text>

                                                        <Text
                                                            style={
                                                                styles.progressText
                                                            }>
                                                            ✓ All assigned employees
                                                        </Text>

                                                    </View>

                                                    {/* CC */}
                                                    <View
                                                        style={[
                                                            styles.bodyCellView,
                                                            styles.ccCell,
                                                        ]}>

                                                        <Text
                                                            style={
                                                                styles.assignedText
                                                            }
                                                            numberOfLines={
                                                                3
                                                            }>
                                                            {formatEmployeeList(
                                                                eod?.cc_employee_id,
                                                            )}
                                                        </Text>

                                                    </View>

                                                    {/* Assigned By */}
                                                    <View
                                                        style={[
                                                            styles.bodyCellView,
                                                            styles.assignedByCell,
                                                        ]}>

                                                        <Text
                                                            style={
                                                                styles.assignedText
                                                            }
                                                            numberOfLines={
                                                                2
                                                            }>
                                                            {eod?.assigned_by_name ||
                                                                eod?.assigned_by ||
                                                                '-'}
                                                        </Text>

                                                    </View>

                                                    {/* Created */}
                                                    <View
                                                        style={[
                                                            styles.bodyCellView,
                                                            styles.createdAtCell,
                                                        ]}>

                                                        <Text
                                                            style={
                                                                styles.createdAtText
                                                            }>
                                                            {formatCreatedDate(
                                                                eod?.date_created,
                                                            )}
                                                        </Text>

                                                    </View>

                                                    {/* Action */}
                                                    <View
                                                        style={[
                                                            styles.bodyCellView,
                                                            styles.actionCell,
                                                        ]}>

                                                        <Pressable
                                                            onPress={() =>
                                                                console.log(
                                                                    'EOD Action:',
                                                                    eod,
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
                                            style={
                                                styles.emptyTable
                                            }>

                                            <Text
                                                style={
                                                    styles.emptyText
                                                }>
                                                No EODs found.
                                            </Text>

                                        </View>
                                    )}

                                </View>

                            </ScrollView>

                        </View>
                    ) : null}

                    {/* Pagination */}
                    {!errorMessage ? (
                        <View
                            style={
                                styles.paginationArea
                            }>

                            <Text
                                style={
                                    styles.paginationInfo
                                }>
                                Showing{' '}
                                {totalEods === 0
                                    ? 0
                                    : (
                                        currentPage -
                                        1
                                    ) *
                                        pageSize +
                                        1}{' '}
                                to{' '}
                                {Math.min(
                                    currentPage *
                                        pageSize,
                                    totalEods,
                                )}{' '}
                                of {totalEods}{' '}
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
                                        {currentPage}
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

    mainScroll: {
        flex: 1,
    },

    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 12,
        paddingTop: 12,
        paddingBottom: 24,
    },

    pageHeadingArea: {
        width: '100%',
        paddingHorizontal: 12,
        paddingBottom: 14,
        marginBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },

    pageHeadingMobile: {
        paddingHorizontal: 4,
    },

    pageTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#111827',
    },

    smallPageTitle: {
        fontSize: 21,
    },

    mainCard: {
        width: '100%',
        borderRadius: 10,
        backgroundColor: '#FFFFFF',
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000000',
        shadowOpacity: 0.08,
        shadowRadius: 10,
        shadowOffset: {
            width: 0,
            height: 4,
        },
    },

    mainCardMobile: {
        borderRadius: 9,
    },

    cardHeader: {
        width: '100%',
        minHeight: 78,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },

    cardHeaderMobile: {
        flexDirection: 'column',
        alignItems: 'stretch',
        justifyContent: 'flex-start',
        gap: 12,
    },

    cardTitle: {
        flexShrink: 1,
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },

    smallCardTitle: {
        fontSize: 16,
    },

    addEodButton: {
        minHeight: 40,
        paddingHorizontal: 14,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        backgroundColor: '#0F9D9A',
        elevation: 3,
        shadowColor: '#0F9D9A',
        shadowOpacity: 0.22,
        shadowRadius: 6,
        shadowOffset: {
            width: 0,
            height: 3,
        },
    },

    addEodButtonMobile: {
        width: '100%',
    },

    addEodButtonPressed: {
        opacity: 0.75,
    },

    addEodButtonText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#FFFFFF',
    },

    toolbar: {
        width: '100%',
        minHeight: 112,
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        paddingHorizontal: 14,
        paddingTop: 20,
        paddingBottom: 14,
    },

    toolbarMobile: {
        flexDirection: 'column',
        alignItems: 'stretch',
        justifyContent: 'flex-start',
        minHeight: 0,
        paddingTop: 18,
    },

    entriesArea: {
        position: 'relative',
        zIndex: 50,
    },

    entriesRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'nowrap',
    },

    showText: {
        fontSize: 14,
        color: '#475569',
    },

    pageSizeButton: {
        minWidth: 62,
        minHeight: 40,
        marginHorizontal: 7,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: '#CBD5E1',
        borderRadius: 9,
        backgroundColor: '#FFFFFF',
    },

    pageSizeText: {
        fontSize: 14,
        color: '#334155',
    },

    smallArrow: {
        marginLeft: 5,
        fontSize: 8,
        color: '#64748B',
    },

    entriesText: {
        fontSize: 14,
        color: '#475569',
    },

    pageSizeMenu: {
        position: 'absolute',
        top: 43,
        left: 44,
        width: 62,
        zIndex: 100,
        borderWidth: 1,
        borderColor: '#CBD5E1',
        borderRadius: 8,
        backgroundColor: '#FFFFFF',
        overflow: 'hidden',
        elevation: 7,
    },

    pageSizeOption: {
        minHeight: 38,
        alignItems: 'center',
        justifyContent: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },

    pageSizeOptionText: {
        fontSize: 13,
        color: '#334155',
    },

    searchArea: {
        width: 230,
    },

    searchAreaMobile: {
        width: '100%',
        marginTop: 17,
    },

    searchLabel: {
        marginBottom: 7,
        fontSize: 14,
        color: '#475569',
        textAlign: 'left',
    },

    searchRow: {
        width: '100%',
        flexDirection: 'row',
        marginTop: 0,
    },

    searchInput: {
        flex: 1,
        minHeight: 42,
        paddingHorizontal: 11,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: '#CBD5E1',
        borderRadius: 8,
        backgroundColor: '#FFFFFF',
        fontSize: 13,
        color: '#111827',
    },

    searchButton: {
        minWidth: 74,
        minHeight: 42,
        marginLeft: 8,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        backgroundColor: '#0F9D9A',
    },

    searchButtonPressed: {
        opacity: 0.75,
    },

    searchButtonText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#FFFFFF',
    },

    errorBox: {
        marginHorizontal: 14,
        marginBottom: 14,
        padding: 13,
        borderWidth: 1,
        borderColor: '#FECACA',
        borderRadius: 8,
        backgroundColor: '#FEF2F2',
    },

    errorText: {
        fontSize: 12,
        lineHeight: 18,
        color: '#B91C1C',
    },

    retryButton: {
        alignSelf: 'flex-start',
        minHeight: 35,
        marginTop: 9,
        paddingHorizontal: 14,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 7,
        backgroundColor: '#0F9D9A',
    },

    retryButtonText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#FFFFFF',
    },

    tableOuter: {
        width: '100%',
        paddingHorizontal: 12,
    },

    tableContainer: {
        minWidth: 1440,
        borderWidth: 1,
        borderColor: '#DCE3EA',
        borderRadius: 2,
        overflow: 'hidden',
    },

    tableHeader: {
        minHeight: 48,
        flexDirection: 'row',
        alignItems: 'stretch',
        backgroundColor: '#F1F4F8',
        borderBottomWidth: 1,
        borderBottomColor: '#D7DEE7',
    },

    tableRow: {
        minHeight: 108,
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },

    headerCell: {
        paddingHorizontal: 9,
        paddingVertical: 10,
        fontSize: 10,
        fontWeight: '800',
        color: '#1E293B',
        textAlignVertical: 'center',
    },

    bodyCellView: {
        justifyContent: 'center',
        paddingHorizontal: 9,
        paddingVertical: 10,
    },

    bodyCell: {
        fontSize: 11,
        color: '#334155',
    },

    numberCell: {
        width: 42,
    },

    pageNameCell: {
        width: 130,
    },

    statusCell: {
        width: 135,
    },

    taskCell: {
        width: 175,
    },

    dueDateCell: {
        width: 115,
    },

    shiftCell: {
        width: 105,
    },

    assignedToCell: {
        width: 320,
    },

    ccCell: {
        width: 190,
    },

    assignedByCell: {
        width: 145,
    },

    createdAtCell: {
        width: 145,
    },

    actionCell: {
        width: 110,
    },

    pageNameText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#111827',
    },

    taskText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#111827',
    },

    descriptionText: {
        marginTop: 9,
        fontSize: 10,
        lineHeight: 14,
        color: '#64748B',
    },

    dueDateText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#111827',
    },

    statusBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 9,
        paddingVertical: 5,
        borderRadius: 13,
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
        fontSize: 10,
        fontWeight: '800',
        color: '#FFFFFF',
    },

    shiftBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 9,
        paddingVertical: 5,
        borderRadius: 12,
        backgroundColor: '#718096',
    },

    shiftText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#FFFFFF',
    },

    assignedText: {
        fontSize: 12,
        fontWeight: '700',
        lineHeight: 17,
        color: '#111827',
    },

    progressText: {
        marginTop: 5,
        fontSize: 10,
        color: '#16A34A',
    },

    createdAtText: {
        fontSize: 11,
        color: '#111827',
    },

    createdDate: {
        fontSize: 11,
        fontWeight: '700',
        color: '#111827',
    },

    createdTime: {
        marginTop: 3,
        fontSize: 10,
        color: '#475569',
    },

    actionButton: {
        minHeight: 38,
        paddingHorizontal: 9,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 7,
        backgroundColor: '#EEF2F7',
    },

    actionButtonText: {
        fontSize: 10,
        fontWeight: '600',
        color: '#475569',
    },

    emptyTable: {
        minWidth: 1440,
        minHeight: 130,
        alignItems: 'center',
        justifyContent: 'center',
    },

    emptyText: {
        fontSize: 13,
        color: '#64748B',
    },

    paginationArea: {
        width: '100%',
        paddingHorizontal: 14,
        paddingTop: 17,
        paddingBottom: 17,
    },

    paginationInfo: {
        fontSize: 13,
        color: '#475569',
    },

    paginationControls: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 8,
        marginTop: 16,
        flexWrap: 'wrap',
    },

    paginationButton: {
        minWidth: 82,
        minHeight: 38,
        paddingHorizontal: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#D7DEE7',
        borderRadius: 8,
        backgroundColor: '#FFFFFF',
    },

    paginationDisabled: {
        opacity: 0.45,
    },

    paginationButtonText: {
        fontSize: 12,
        color: '#475569',
    },

    currentPageButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        backgroundColor: '#0F9D9A',
    },

    currentPageText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#FFFFFF',
    },

   

    loadingScreen: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F1F5F9',
    },

    loadingText: {
        marginTop: 10,
        fontSize: 12,
        color: '#64748B',
    },
});

export default EODList;