/**
 * TMSshj - Employee Dashboard
 *
 * Employee login ke baad ye screen open hoti hai.
 *
 * Flow:
 *
 * Login
 *   ↓
 * Employee Dashboard
 *   ↓
 * Dashboard Stats API
 *   ↓
 * Active Now Popup
 *   ↓
 * Dashboard
 */

import React, { useEffect, useState } from 'react';

import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import ActiveNowModal from '../../components/ActiveNowModal';

import {
  getToken,
  getUser,
} from '../../services/authStorage';

import {
  getDashboardStats,
} from '../../services/dashboardService';

/**
 * Employee Dashboard Screen
 */
const EmployeeDashboardScreen = () => {
  /**
   * Active Now popup.
   */
  const [showActiveModal, setShowActiveModal] =
    useState(true);

  /**
   * Authentication token.
   */
  const [activeToken, setActiveToken] =
    useState(null);

  /**
   * Logged-in employee.
   */
  const [user, setUser] = useState(null);

  /**
   * Dashboard loading.
   */
  const [isLoadingStats, setIsLoadingStats] =
    useState(true);

  /**
   * Dashboard error.
   */
  const [statsError, setStatsError] =
    useState('');

  /**
   * Dashboard data.
   */
  const [dashboardData, setDashboardData] =
    useState(null);

  /**
   * Load dashboard data.
   */
  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setStatsError('');

        /**
         * Stored authentication data.
         */
        const token = await getToken();
        const storedUser = await getUser();

        if (!token) {
          setStatsError(
            'Authentication token not found.',
          );

          return;
        }

        setActiveToken(token);
        setUser(storedUser);

        /**
         * Dashboard stats API.
         */
        const response =
          await getDashboardStats(token);

        setDashboardData(response);

        console.log(
          'Dashboard Stats Response:',
          response,
        );
      } catch (error) {
        console.error(
          'Dashboard stats error:',
          error,
        );

        if (error instanceof Error) {
          setStatsError(error.message);
        } else {
          setStatsError(
            'Unable to load dashboard data.',
          );
        }
      } finally {
        setIsLoadingStats(false);
      }
    };

    loadDashboard();
  }, []);

  /**
   * Active Now completed.
   */
  const handleActivated = () => {
    setShowActiveModal(false);
    setActiveToken(null);
  };

  /**
   * Real employee name.
   */
  const employeeName =
    user?.name ||
    [user?.firstname, user?.lastname]
      .filter(Boolean)
      .join(' ') ||
    'Employee';

  /**
   * Dashboard employee data.
   */
  const employeeData =
    dashboardData?.data?.employee || {};

  const tasksByStatus =
    employeeData?.tasks_by_status || {};

  const eodsByStatus =
    employeeData?.eods_by_status || {};

  const onlineStatus =
    employeeData?.online || 'inactive';

  /**
   * Total Tasks.
   */
  const totalTasks =
    Number(tasksByStatus.on_progress || 0) +
    Number(tasksByStatus.pending || 0) +
    Number(tasksByStatus.completed || 0);

  /**
   * Total EODs.
   */
  const totalEods =
    Number(eodsByStatus.on_progress || 0) +
    Number(eodsByStatus.pending || 0) +
    Number(eodsByStatus.completed || 0);

  return (
    <View style={styles.screen}>

      <ScrollView
        contentContainerStyle={
          styles.scrollContent
        }
        showsVerticalScrollIndicator={false}>

        {/* Soft Gradient-Like Header Background */}
        <View style={styles.topBackground}>

          <View style={styles.headerGlowOne} />

          <View style={styles.headerGlowTwo} />

          {/* Dashboard Header */}
          <View style={styles.header}>

            <View style={styles.headerTextContainer}>

              <Text style={styles.greeting}>
                Employee Dashboard
              </Text>

              <Text style={styles.employeeName}>
                {employeeName}
              </Text>

            </View>

            {/* Active Status */}
            <View style={styles.statusBadge}>

              <View
                style={styles.statusDot}
              />

              <Text
                style={styles.statusText}>
                {onlineStatus === 'active'
                  ? 'Active'
                  : 'Inactive'}
              </Text>

            </View>

          </View>

        </View>

        {/* Loading */}
        {isLoadingStats ? (
          <View style={styles.loadingCard}>

            <ActivityIndicator
              size="small"
              color="#0F9D9A"
            />

            <Text
              style={styles.loadingText}>
              Loading dashboard...
            </Text>

          </View>
        ) : null}

        {/* Error */}
        {!isLoadingStats &&
          statsError ? (
          <View style={styles.errorCard}>

            <Text
              style={styles.errorTitle}>
              Unable to load dashboard
            </Text>

            <Text
              style={styles.errorText}>
              {statsError}
            </Text>

          </View>
        ) : null}

        {/* Dashboard */}
        {!isLoadingStats &&
          !statsError &&
          dashboardData ? (
          <View style={styles.dashboardContent}>

            {/* Task Overview */}
            <View style={styles.section}>

              <Text style={styles.sectionTitle}>
                Task Overview
              </Text>

              <View style={styles.cardsRow}>

                {/* Total Tasks */}
                <View
                  style={[
                    styles.statCard,
                    styles.totalCard,
                  ]}>

                  <View
                    style={
                      styles.iconBoxTotal
                    }>
                    <Text
                      style={
                        styles.iconText
                      }>
                      #
                    </Text>
                  </View>

                  <Text
                    style={styles.statLabel}>
                    Total Tasks
                  </Text>

                  <Text
                    style={styles.totalValue}>
                    {totalTasks}
                  </Text>

                </View>

                {/* On Progress */}
                <View
                  style={styles.statCard}>

                  <View
                    style={
                      styles.iconBoxProgress
                    }>
                    <Text
                      style={
                        styles.iconTextProgress
                      }>
                      ◔
                    </Text>
                  </View>

                  <Text
                    style={styles.statLabel}>
                    On Progress
                  </Text>

                  <Text
                    style={styles.statValue}>
                    {tasksByStatus.on_progress ??
                      0}
                  </Text>

                </View>

              </View>

              <View style={styles.cardsRow}>

                {/* Pending */}
                <View
                  style={styles.statCard}>

                  <View
                    style={
                      styles.iconBoxPending
                    }>
                    <Text
                      style={
                        styles.iconTextPending
                      }>
                      !
                    </Text>
                  </View>

                  <Text
                    style={styles.statLabel}>
                    Pending
                  </Text>

                  <Text
                    style={styles.statValue}>
                    {tasksByStatus.pending ??
                      0}
                  </Text>

                </View>

                {/* Completed */}
                <View
                  style={styles.statCard}>

                  <View
                    style={
                      styles.iconBoxCompleted
                    }>
                    <Text
                      style={
                        styles.iconTextCompleted
                      }>
                      ✓
                    </Text>
                  </View>

                  <Text
                    style={styles.statLabel}>
                    Completed
                  </Text>

                  <Text
                    style={styles.statValue}>
                    {tasksByStatus.completed ??
                      0}
                  </Text>

                </View>

              </View>

            </View>

            {/* EOD Overview */}
            <View style={styles.section}>

              <Text style={styles.sectionTitle}>
                EOD Overview
              </Text>

              <View style={styles.cardsRow}>

                {/* Total EOD */}
                <View
                  style={[
                    styles.statCard,
                    styles.totalCard,
                  ]}>

                  <View
                    style={
                      styles.iconBoxTotal
                    }>
                    <Text
                      style={
                        styles.iconText
                      }>
                      #
                    </Text>
                  </View>

                  <Text
                    style={styles.statLabel}>
                    Total EODs
                  </Text>

                  <Text
                    style={styles.totalValue}>
                    {totalEods}
                  </Text>

                </View>

                {/* On Progress */}
                <View
                  style={styles.statCard}>

                  <View
                    style={
                      styles.iconBoxProgress
                    }>
                    <Text
                      style={
                        styles.iconTextProgress
                      }>
                      ◔
                    </Text>
                  </View>

                  <Text
                    style={styles.statLabel}>
                    On Progress
                  </Text>

                  <Text
                    style={styles.statValue}>
                    {eodsByStatus.on_progress ??
                      0}
                  </Text>

                </View>

              </View>

              <View style={styles.cardsRow}>

                {/* Pending */}
                <View
                  style={styles.statCard}>

                  <View
                    style={
                      styles.iconBoxPending
                    }>
                    <Text
                      style={
                        styles.iconTextPending
                      }>
                      !
                    </Text>
                  </View>

                  <Text
                    style={styles.statLabel}>
                    Pending
                  </Text>

                  <Text
                    style={styles.statValue}>
                    {eodsByStatus.pending ??
                      0}
                  </Text>

                </View>

                {/* Completed */}
                <View
                  style={styles.statCard}>

                  <View
                    style={
                      styles.iconBoxCompleted
                    }>
                    <Text
                      style={
                        styles.iconTextCompleted
                      }>
                      ✓
                    </Text>
                  </View>

                  <Text
                    style={styles.statLabel}>
                    Completed
                  </Text>

                  <Text
                    style={styles.statValue}>
                    {eodsByStatus.completed ??
                      0}
                  </Text>

                </View>

              </View>

            </View>

          </View>
        ) : null}

      </ScrollView>

      {/* Active Now Modal */}
      {showActiveModal &&
        activeToken ? (
        <ActiveNowModal
          token={activeToken}
          onActivated={
            handleActivated
          }
        />
      ) : null}

    </View>
  );
};

/**
 * Styles
 *
 * Screenshot-inspired:
 * Light teal + soft blue/gray
 * + clean white cards.
 */
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#EEF4F8',
  },

  scrollContent: {
    flexGrow: 1,
    paddingBottom: 30,
  },

  /**
   * Top gradient-like section.
   */
  topBackground: {
    position: 'relative',
    overflow: 'hidden',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 26,
    backgroundColor: '#E4F6F4',
  },

  headerGlowOne: {
    position: 'absolute',
    width: 210,
    height: 210,
    right: -85,
    top: -120,
    borderRadius: 120,
    backgroundColor: 'rgba(15, 157, 154, 0.09)',
  },

  headerGlowTwo: {
    position: 'absolute',
    width: 180,
    height: 180,
    left: -100,
    top: 55,
    borderRadius: 100,
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
  },

  header: {
    width: '100%',
    maxWidth: 700,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  headerTextContainer: {
    flex: 1,
    paddingRight: 10,
  },

  greeting: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111827',
  },

  employeeName: {
    marginTop: 5,
    fontSize: 15,
    fontWeight: '500',
    color: '#64748B',
  },

  statusBadge: {
    minHeight: 34,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 11,
    borderRadius: 18,
    backgroundColor: '#ECFDF5',
  },

  statusDot: {
    width: 8,
    height: 8,
    marginRight: 6,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },

  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#047857',
  },

  dashboardContent: {
    paddingHorizontal: 20,
    paddingTop: 18,
  },

  section: {
    width: '100%',
    maxWidth: 700,
    alignSelf: 'center',
    marginBottom: 24,
  },

  sectionTitle: {
    marginBottom: 12,
    fontSize: 18,
    fontWeight: '800',
    color: '#172033',
  },

  cardsRow: {
    width: '100%',
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },

  statCard: {
    flex: 1,
    minHeight: 122,
    paddingHorizontal: 16,
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
  },

  totalCard: {
    borderColor: '#DDEBEC',
  },

  iconBoxTotal: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#E6F7F6',
  },

  iconText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F9D9A',
  },

  iconBoxProgress: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#EEF2FF',
  },

  iconTextProgress: {
    fontSize: 17,
    fontWeight: '800',
    color: '#4F46E5',
  },

  iconBoxPending: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#FFF7ED',
  },

  iconTextPending: {
    fontSize: 17,
    fontWeight: '800',
    color: '#EA580C',
  },

  iconBoxCompleted: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#E9F8F3',
  },

  iconTextCompleted: {
    fontSize: 17,
    fontWeight: '800',
    color: '#059669',
  },

  statLabel: {
    marginTop: 9,
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },

  statValue: {
    marginTop: 4,
    fontSize: 29,
    fontWeight: '800',
    color: '#111827',
  },

  totalValue: {
    marginTop: 4,
    fontSize: 29,
    fontWeight: '800',
    color: '#0F766E',
  },

  loadingCard: {
    marginHorizontal: 20,
    marginTop: 18,
    minHeight: 140,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
  },

  loadingText: {
    marginTop: 9,
    fontSize: 13,
    color: '#64748B',
  },

  errorCard: {
    marginHorizontal: 20,
    marginTop: 18,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 15,
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
    lineHeight: 19,
    color: '#B91C1C',
  },
});

export default EmployeeDashboardScreen;