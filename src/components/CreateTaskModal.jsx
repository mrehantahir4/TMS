import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
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
import DateTimePicker from '@react-native-community/datetimepicker';

import {getToken, getUser} from '../services/authStorage';
import {getEmployees, getPages} from '../services/lookupService';
import {createTask} from '../services/taskService';

const CreateTaskModal = ({
  visible,
  onClose,
  onTaskCreated,
}) => {
  const [task, setTask] = useState('');
  const [description, setDescription] = useState('');

  const [employees, setEmployees] = useState([]);
  const [pages, setPages] = useState([]);

  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [selectedPage, setSelectedPage] = useState(null);

  const [dueDate, setDueDate] = useState(new Date());

  const [showDatePicker, setShowDatePicker] = useState(false);

  const [loadingData, setLoadingData] = useState(false);
  const [saving, setSaving] = useState(false);

  const [showEmployees, setShowEmployees] = useState(false);
  const [showPages, setShowPages] = useState(false);

  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    if (visible) {
      loadFormData();
    }
  }, [visible]);

  const loadFormData = async () => {
    setLoadingData(true);

    try {
      const token = await getToken();
      const user = await getUser();

      if (!token) {
        Alert.alert(
          'Session Error',
          'Authentication token not found. Please login again.',
        );
        return;
      }

      setCurrentUser(user);

      const [employeesResponse, pagesResponse] = await Promise.all([
        getEmployees(token),
        getPages(token),
      ]);

      const employeeItems =
        employeesResponse?.data?.items || [];

      const pageItems =
        pagesResponse?.data?.items || [];

      setEmployees(employeeItems);
      setPages(pageItems);
    } catch (error) {
      console.error('Create task form loading error:', error);

      Alert.alert(
        'Error',
        error?.message || 'Unable to load employees and pages.',
      );
    } finally {
      setLoadingData(false);
    }
  };

  const formatDate = date => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  };

  const toggleEmployee = employeeId => {
    setSelectedEmployees(previous => {
      const alreadySelected = previous.includes(employeeId);

      if (alreadySelected) {
        return previous.filter(id => id !== employeeId);
      }

      return [...previous, employeeId];
    });
  };

  const getEmployeeName = employee => {
    const firstName = employee?.firstname || '';
    const lastName = employee?.lastname || '';

    return `${firstName} ${lastName}`
      .replace(/\s+/g, ' ')
      .trim();
  };

  const resetForm = () => {
    setTask('');
    setDescription('');
    setSelectedEmployees([]);
    setSelectedPage(null);
    setDueDate(new Date());
    setShowEmployees(false);
    setShowPages(false);
  };

  const handleClose = () => {
    if (saving) {
      return;
    }

    resetForm();
    onClose();
  };

  const handleSave = async () => {
    if (!task.trim()) {
      Alert.alert('Required', 'Please enter task.');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Required', 'Please enter description.');
      return;
    }

    if (selectedEmployees.length === 0) {
      Alert.alert('Required', 'Please select at least one employee.');
      return;
    }

    if (!selectedPage) {
      Alert.alert('Required', 'Please select a page.');
      return;
    }

    try {
      setSaving(true);

      const token = await getToken();
      const user = currentUser || (await getUser());

      if (!token) {
        Alert.alert(
          'Session Error',
          'Authentication token not found. Please login again.',
        );
        return;
      }

      if (!user?.id) {
        Alert.alert(
          'User Error',
          'Logged-in user ID was not found.',
        );
        return;
      }

      const taskData = {
        task: task.trim(),
        description: description.trim(),
        employee_id: selectedEmployees,
        page_id: String(selectedPage.id),
        due_date: formatDate(dueDate),
        status: 1,
        assigned_by: String(user.id),
      };

      console.log('Creating task with data:', taskData);

      const response = await createTask(
        token,
        taskData,
      );

      console.log('Create task response:', response);

      if (response?.ok) {
        Alert.alert(
          'Success',
          'Task created successfully.',
          [
            {
              text: 'OK',
              onPress: () => {
                resetForm();
                onClose();

                if (onTaskCreated) {
                  onTaskCreated();
                }
              },
            },
          ],
        );
      } else {
        Alert.alert(
          'Error',
          response?.error?.message ||
            response?.error ||
            'Unable to create task.',
        );
      }
    } catch (error) {
      console.error('Create task error:', error);

      Alert.alert(
        'Error',
        error?.message || 'Something went wrong while creating task.',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          style={styles.keyboardContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.modalContainer}>
            {/* Header */}
            <View style={styles.header}>
              <View>
                <Text style={styles.title}>Create New Task</Text>
                <Text style={styles.subtitle}>
                  Assign a new task to employee
                </Text>
              </View>

              <Pressable
                onPress={handleClose}
                disabled={saving}
                style={styles.closeButton}>
                <Text style={styles.closeText}>×</Text>
              </Pressable>
            </View>

            {loadingData ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator
                  size="large"
                  color="#176B87"
                />

                <Text style={styles.loadingText}>
                  Loading employees and pages...
                </Text>
              </View>
            ) : (
              <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.content}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}>
                
                {/* Task */}
                <Text style={styles.label}>Task</Text>

                <TextInput
                  value={task}
                  onChangeText={setTask}
                  placeholder="Enter task"
                  placeholderTextColor="#9AA4AF"
                  style={styles.input}
                  editable={!saving}
                />

                
                {/* Employees */}
                <Text style={styles.label}>Assign To</Text>

                <Pressable
                  onPress={() => {
                    setShowEmployees(previous => !previous);
                    setShowPages(false);
                  }}
                  disabled={saving}
                  style={styles.dropdownButton}>
                 <Text
  numberOfLines={2}
  style={[
    styles.dropdownText,
    selectedEmployees.length === 0 &&
      styles.placeholderText,
  ]}>
  {selectedEmployees.length === 0
    ? 'Select employee(s)'
    : employees
        .filter(employee =>
          selectedEmployees.includes(
            String(employee.id),
          ),
        )
        .map(employee =>
          getEmployeeName(employee),
        )
        .join(', ')}
</Text>

                  <Text style={styles.arrow}>
                    {showEmployees ? '▲' : '▼'}
                  </Text>
                </Pressable>

                {showEmployees && (
  <View style={styles.dropdownList}>
    <ScrollView
      nestedScrollEnabled
      showsVerticalScrollIndicator
      keyboardShouldPersistTaps="handled">
      
      {employees.map(employee => {
        const employeeId = String(employee.id);
        const selected =
          selectedEmployees.includes(employeeId);

        return (
          <Pressable
            key={employeeId}
            onPress={() =>
              toggleEmployee(employeeId)
            }
            style={[
              styles.employeeItem,
              selected &&
                styles.selectedEmployeeItem,
            ]}>
            
            <View
              style={[
                styles.checkbox,
                selected &&
                  styles.checkboxSelected,
              ]}>
              {selected ? (
                <Text style={styles.checkmark}>
                  ✓
                </Text>
              ) : null}
            </View>

            <View style={styles.employeeInfo}>
              <Text
                style={[
                  styles.employeeName,
                  selected &&
                    styles.selectedEmployeeName,
                ]}>
                {getEmployeeName(employee)}
              </Text>

              <Text style={styles.employeeType}>
                {employee.emp_type || 'Employee'}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </ScrollView>
  </View>
)}

                {/* Page */}
                <Text style={styles.label}>Select Page</Text>

                <Pressable
                  onPress={() => {
                    setShowPages(previous => !previous);
                    setShowEmployees(false);
                  }}
                  disabled={saving}
                  style={styles.dropdownButton}>
                  <Text
                    style={[
                      styles.dropdownText,
                      !selectedPage &&
                        styles.placeholderText,
                    ]}>
                    {selectedPage
                      ? selectedPage.pagename
                      : 'Select page'}
                  </Text>

                  <Text style={styles.arrow}>
                    {showPages ? '▲' : '▼'}
                  </Text>
                </Pressable>

                {showPages && (
  <View style={styles.dropdownList}>
    <ScrollView
      nestedScrollEnabled
      showsVerticalScrollIndicator
      keyboardShouldPersistTaps="handled">
      
      {pages.map(page => {
        const selected =
          selectedPage?.id === page.id;

        return (
          <Pressable
            key={String(page.id)}
            onPress={() => {
              setSelectedPage(page);
              setShowPages(false);
            }}
            style={[
              styles.pageItem,
              selected &&
                styles.selectedPageItem,
            ]}>
            
            <Text
              style={[
                styles.pageText,
                selected &&
                  styles.selectedPageText,
              ]}>
              {String(page.pagename || '')
                .replace(/\s+/g, ' ')
                .trim()}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  </View>
)}

                {/* Due Date */}
                <Text style={styles.label}>Due Date</Text>

                <Pressable
                  onPress={() => setShowDatePicker(true)}
                  disabled={saving}
                  style={styles.dropdownButton}>
                  <Text style={styles.dropdownText}>
                    {formatDate(dueDate)}
                  </Text>

                  <Text style={styles.calendarText}>📅</Text>
                </Pressable>

                {showDatePicker && (
                  <DateTimePicker
                    value={dueDate}
                    mode="date"
                    display={
                      Platform.OS === 'ios'
                        ? 'spinner'
                        : 'default'
                    }
                    onChange={(event, selectedDate) => {
                      setShowDatePicker(false);

                      if (selectedDate) {
                        setDueDate(selectedDate);
                      }
                    }}
                  />
                )}
                   {/* Description */}
                <Text style={styles.label}>Description</Text>

                <TextInput
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Enter description"
                  placeholderTextColor="#9AA4AF"
                  style={[
                    styles.input,
                    styles.descriptionInput,
                  ]}
                  multiline
                  textAlignVertical="top"
                  editable={!saving}
                />
                {/* Buttons */}
                <View style={styles.buttonRow}>
                  <Pressable
                    onPress={handleClose}
                    disabled={saving}
                    style={styles.cancelButton}>
                    <Text style={styles.cancelText}>
                      Cancel
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={handleSave}
                    disabled={saving}
                    style={[
                      styles.saveButton,
                      saving && styles.disabledButton,
                    ]}>
                    {saving ? (
                      <ActivityIndicator
                        size="small"
                        color="#FFFFFF"
                      />
                    ) : (
                      <Text style={styles.saveText}>
                        Save Task
                      </Text>
                    )}
                  </Pressable>
                </View>
              </ScrollView>
            )}
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
  flex: 1,
  backgroundColor: 'rgba(7, 20, 35, 0.60)',
  justifyContent: 'center',
  alignItems: 'center',
  paddingHorizontal: 16,
},

  keyboardContainer: {
  width: '100%',
  alignItems: 'center',
},

  modalContainer: {
  width: '100%',
  maxHeight: '88%',
  backgroundColor: '#F7FAFC',
  borderRadius: 24,
  overflow: 'hidden',
  elevation: 12,
  shadowColor: '#000000',
  shadowOffset: {
    width: 0,
    height: 6,
  },
  shadowOpacity: 0.25,
  shadowRadius: 12,
},

  header: {
    backgroundColor: '#123B52',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  title: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '800',
  },

  subtitle: {
    color: '#C6D8E2',
    fontSize: 12,
    marginTop: 4,
  },

  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  closeText: {
    color: '#FFFFFF',
    fontSize: 28,
    lineHeight: 30,
    fontWeight: '300',
  },

  scrollView: {
    width: '100%',
  },

  content: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 28,
  },

  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#183B4D',
    marginBottom: 7,
    marginTop: 10,
  },

  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: '#D4DEE5',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 14,
    color: '#1B2D3A',
    fontSize: 14,
  },

  descriptionInput: {
    height: 92,
    paddingTop: 13,
  },

  dropdownButton: {
    minHeight: 48,
     paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#D4DEE5',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  dropdownText: {
    flex: 1,
    color: '#243B49',
    fontSize: 14,
    paddingRight: 10,
  },

  placeholderText: {
    color: '#9AA4AF',
  },

  arrow: {
    color: '#176B87',
    fontSize: 12,
  },

  calendarText: {
    fontSize: 18,
  },

  dropdownList: {
  backgroundColor: '#FFFFFF',
  borderWidth: 1,
  borderColor: '#D4DEE5',
  borderRadius: 12,
  marginTop: 6,
  maxHeight: 220,
  overflow: 'hidden',
},

  employeeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#EDF1F4',
  },

  selectedEmployeeItem: {
    backgroundColor: '#EAF7F5',
  },

  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#AAB9C3',
    marginRight: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },

  checkboxSelected: {
    backgroundColor: '#176B87',
    borderColor: '#176B87',
  },

  checkmark: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },

  employeeInfo: {
    flex: 1,
  },

  employeeName: {
    color: '#203744',
    fontSize: 14,
    fontWeight: '600',
  },

  selectedEmployeeName: {
    color: '#12657D',
  },

  employeeType: {
    color: '#8797A2',
    fontSize: 11,
    marginTop: 2,
  },

  pageItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EDF1F4',
  },

  selectedPageItem: {
    backgroundColor: '#EAF7F5',
  },

  pageText: {
    color: '#203744',
    fontSize: 13,
  },

  selectedPageText: {
    color: '#12657D',
    fontWeight: '700',
  },

  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 22,
  },

  cancelButton: {
    flex: 1,
    minHeight: 50,
    borderRadius: 12,
    backgroundColor: '#E7EDF1',
    alignItems: 'center',
    justifyContent: 'center',
  },

  cancelText: {
    color: '#3C5360',
    fontSize: 14,
    fontWeight: '700',
  },

  saveButton: {
    flex: 1.2,
    minHeight: 50,
    borderRadius: 12,
    backgroundColor: '#176B87',
    alignItems: 'center',
    justifyContent: 'center',
  },

  saveText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },

  disabledButton: {
    opacity: 0.65,
  },

  loadingContainer: {
    minHeight: 300,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },

  loadingText: {
    marginTop: 12,
    color: '#61737E',
    fontSize: 13,
  },
});

export default CreateTaskModal;