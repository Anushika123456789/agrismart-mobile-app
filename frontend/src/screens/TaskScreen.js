import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  ScrollView,
  Platform,
  Animated,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { taskService, inventoryService, landService, machineryService } from '../services/api';
import { colors, spacing, borderRadius, typography, shadows } from '../styles/colors';

export default function TaskScreen() {
  const [tasks, setTasks] = useState([]);
  const [labors, setLabors] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [machinery, setMachinery] = useState([]);
  const [lands, setLands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Filters
  const [activeTab, setActiveTab] = useState('All');
  const [activeWorkerFilter, setActiveWorkerFilter] = useState('All');
  const [activeLandFilter, setActiveLandFilter] = useState('All');

  const filterTabs = ['All', 'pending', 'in-progress', 'completed', 'delayed', 'cancelled', 'Overdue'];

  const [pickerMode, setPickerMode] = useState(null);

  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    assignedTo: '',
    landId: '',
    priority: 'medium',
    status: 'pending',
    startDate: null,
    dueDate: null,
    materialsUsed: [],
    machineryUsed: [],
    progress: 0,
    notes: '',
  });

  const progressOptions = [0, 25, 50, 75, 100];
  const statuses = ['pending', 'in-progress', 'completed', 'delayed', 'cancelled'];

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const handleTextChange = (field, text) => {
    if (text.trim().split(/\s+/).length > 150) {
      Alert.alert('Word Limit Reached', 'Maximum 150 words allowed.');
      return;
    }
    setTaskForm({ ...taskForm, [field]: text });
  };

  const formatDate = (date) => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getTodayWithoutTime = () => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), today.getDate());
  };

  const fetchData = async () => {
    try {
      const [tasksRes, laborsRes, invRes, landsRes, machRes] = await Promise.all([
        taskService.getAll(),
        taskService.getLabors(),
        inventoryService.getAll(),
        landService.getAll(),
        machineryService.getAll(),
      ]);

      setTasks(tasksRes.data || []);
      setInventory(invRes.data || []);

      let machineryList = [];
      if (Array.isArray(machRes.data)) {
        machineryList = machRes.data;
      } else if (Array.isArray(machRes.data?.all)) {
        machineryList = machRes.data.all;
      } else if (Array.isArray(machRes.data?.machinery)) {
        machineryList = machRes.data.machinery;
      } else if (Array.isArray(machRes.data?.data)) {
        machineryList = machRes.data.data;
      }
      setMachinery(machineryList);

      let laborList = [];
      if (Array.isArray(laborsRes.data)) {
        laborList = laborsRes.data;
      } else if (Array.isArray(laborsRes.data?.active)) {
        laborList = laborsRes.data.active;
      } else if (Array.isArray(laborsRes.data?.labors)) {
        laborList = laborsRes.data.labors;
      } else if (Array.isArray(laborsRes.data?.data)) {
        laborList = laborsRes.data.data;
      }
      setLabors(laborList);

      let landList = [];
      if (Array.isArray(landsRes.data)) {
        landList = landsRes.data;
      } else if (Array.isArray(landsRes.data?.lands)) {
        landList = landsRes.data.lands;
      } else if (Array.isArray(landsRes.data?.data)) {
        landList = landsRes.data.data;
      }
      setLands(landList);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch tasks dependencies');
    } finally {
      setLoading(false);
    }
  };

  const resetTaskForm = () => {
    setTaskForm({
      title: '',
      description: '',
      assignedTo: '',
      landId: '',
      priority: 'medium',
      status: 'pending',
      startDate: new Date(),
      dueDate: null,
      materialsUsed: [],
      machineryUsed: [],
      progress: 0,
      notes: '',
    });
  };

  const createTask = async () => {
    const trimmedTitle = taskForm.title.trim();
    if (!trimmedTitle) return Alert.alert('Validation Error', 'Please enter task title');
    if (!taskForm.assignedTo) return Alert.alert('Validation Error', 'Please select a worker');
    if (!taskForm.landId) return Alert.alert('Validation Error', 'Please select a land plot');
    if (!taskForm.startDate) return Alert.alert('Validation Error', 'Please select a start date');

    if (taskForm.startDate) {
      const today = getTodayWithoutTime();
      const selectedStartDate = new Date(taskForm.startDate.getFullYear(), taskForm.startDate.getMonth(), taskForm.startDate.getDate());
      if (selectedStartDate < today) {
        return Alert.alert('Validation Error', 'Start date cannot be in the past');
      }
    }

    if (taskForm.dueDate) {
      const today = getTodayWithoutTime();
      const selectedDueDate = new Date(taskForm.dueDate.getFullYear(), taskForm.dueDate.getMonth(), taskForm.dueDate.getDate());
      if (selectedDueDate <= today) {
        return Alert.alert('Validation Error', 'Deadline date must be ahead of the current date');
      }
    }

    if (taskForm.dueDate && taskForm.startDate && taskForm.dueDate < taskForm.startDate) {
      return Alert.alert('Validation Error', 'Finishing date must be equal to or greater than starting date');
    }

    for (const mat of taskForm.materialsUsed) {
      const invItem = inventory.find(i => i._id === mat.inventoryId);
      if (invItem) {
        if (mat.quantity > invItem.quantity) {
          return Alert.alert('Validation Error', `Amount for ${invItem.name} exceeds available quantity (${invItem.quantity})`);
        }
        if ((invItem.quantity - mat.quantity) < (invItem.reorderPoint || 0)) {
          return Alert.alert('Validation Error', `Cannot assign ${mat.quantity} of ${invItem.name}. Remaining amount would be below minimum order level (${invItem.reorderPoint || 0})`);
        }
      }
    }

    const payload = {
      title: trimmedTitle,
      description: taskForm.description.trim(),
      assignedTo: taskForm.assignedTo,
      landId: taskForm.landId || undefined,
      priority: taskForm.priority,
      status: taskForm.status,
      startDate: formatDate(taskForm.startDate),
      materialsUsed: taskForm.materialsUsed,
      machineryUsed: taskForm.machineryUsed,
      progress: taskForm.progress,
      notes: taskForm.notes,
      ...(taskForm.dueDate && { dueDate: formatDate(taskForm.dueDate) }),
    };

    try {
      await taskService.create(payload);
      Alert.alert('Success', 'Task created successfully');
      setModalVisible(false);
      resetTaskForm();
      fetchData();
    } catch (error) {
      Alert.alert('Error', error?.response?.data?.message || 'Failed to create task');
    }
  };

  const updateTask = async () => {
    const trimmedTitle = taskForm.title.trim();
    if (!trimmedTitle) return Alert.alert('Validation Error', 'Please enter task title');
    if (!taskForm.assignedTo) return Alert.alert('Validation Error', 'Please select a worker');
    if (!taskForm.landId) return Alert.alert('Validation Error', 'Please select a land plot');

    if (taskForm.dueDate) {
      const today = getTodayWithoutTime();
      const selectedDueDate = new Date(taskForm.dueDate.getFullYear(), taskForm.dueDate.getMonth(), taskForm.dueDate.getDate());

      if (editingItem && editingItem.dueDate) {
        const originalDueDate = new Date(editingItem.dueDate);
        const originalDueWithoutTime = new Date(originalDueDate.getFullYear(), originalDueDate.getMonth(), originalDueDate.getDate());
        if (selectedDueDate.getTime() !== originalDueWithoutTime.getTime() && selectedDueDate <= today) {
          return Alert.alert('Validation Error', 'New deadline date must be ahead of the current date');
        }
      } else if (selectedDueDate <= today) {
        return Alert.alert('Validation Error', 'Deadline date must be ahead of the current date');
      }
    }

    if (taskForm.dueDate && taskForm.startDate && taskForm.dueDate < taskForm.startDate) {
      return Alert.alert('Validation Error', 'Finishing date must be equal to or greater than starting date');
    }

    for (const mat of taskForm.materialsUsed) {
      const invItem = inventory.find(i => i._id === mat.inventoryId);
      if (invItem) {
        if (mat.quantity > invItem.quantity) {
          return Alert.alert('Validation Error', `Amount for ${invItem.name} exceeds available quantity (${invItem.quantity})`);
        }
        if ((invItem.quantity - mat.quantity) < (invItem.reorderPoint || 0)) {
          return Alert.alert('Validation Error', `Cannot assign ${mat.quantity} of ${invItem.name}. Remaining amount would be below minimum order level (${invItem.reorderPoint || 0})`);
        }
      }
    }

    const payload = {
      title: trimmedTitle,
      description: taskForm.description.trim(),
      assignedTo: taskForm.assignedTo,
      landId: taskForm.landId || undefined,
      priority: taskForm.priority,
      status: taskForm.status,
      startDate: formatDate(taskForm.startDate),
      materialsUsed: taskForm.materialsUsed,
      machineryUsed: taskForm.machineryUsed,
      progress: taskForm.progress,
      notes: taskForm.notes,
      ...(taskForm.dueDate && { dueDate: formatDate(taskForm.dueDate) }),
    };

    if (taskForm.progress === 100 && taskForm.status !== 'completed') {
      payload.status = 'completed';
    }

    try {
      await taskService.update(editingItem._id, payload);
      Alert.alert('Success', 'Task updated successfully');
      setModalVisible(false);
      setEditingItem(null);
      resetTaskForm();
      fetchData();
    } catch (error) {
      Alert.alert('Error', error?.response?.data?.message || 'Failed to update task');
    }
  };

  const deleteTask = async (id, title) => {
    Alert.alert('Delete Task', `Delete "${title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await taskService.delete(id);
            fetchData();
          } catch (error) {
            Alert.alert('Error', 'Failed to delete task');
          }
        }
      },
    ]);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setTaskForm({
      title: item.title,
      description: item.description || '',
      assignedTo: item.assignedTo?._id || item.assignedTo,
      landId: item.landId?._id || item.landId || '',
      priority: item.priority || 'medium',
      status: item.status || 'pending',
      startDate: item.startDate ? new Date(item.startDate) : null,
      dueDate: item.dueDate ? new Date(item.dueDate) : null,
      materialsUsed: item.materialsUsed || [],
      machineryUsed: item.machineryUsed || [],
      progress: item.progress || 0,
      notes: item.notes || '',
    });
    setModalVisible(true);
  };

  const updateStatusQuick = async (id, status) => {
    try {
      await taskService.updateStatus(id, status);
      fetchData();
    } catch (error) {
      Alert.alert('Error', error?.response?.data?.message || 'Failed to update task status');
    }
  };

  const getPriorityStyle = (priority) => {
    const stylesMap = {
      high: { bg: colors.error, lightBg: colors.errorLight, text: 'High' },
      medium: { bg: colors.warning, lightBg: colors.warningLight, text: 'Medium' },
      low: { bg: colors.success, lightBg: colors.successLight, text: 'Low' },
      urgent: { bg: '#9b59b6', lightBg: '#f5eef8', text: 'Urgent' },
    };
    return stylesMap[priority] || stylesMap.medium;
  };

  const getStatusStyle = (status) => {
    const smap = {
      pending: { bg: colors.warningLight, color: colors.warning, icon: '⏳' },
      'in-progress': { bg: colors.infoLight, color: colors.info, icon: '🔄' },
      completed: { bg: colors.successLight, color: colors.success, icon: '✓' },
      delayed: { bg: colors.errorLight, color: colors.error, icon: '⚠' },
      cancelled: { bg: colors.lightGray, color: colors.darkGray, icon: '✕' },
    };
    return smap[status] || smap.pending;
  };

  const handleAddMaterial = (invItem) => {
    if (taskForm.materialsUsed.some(m => m.inventoryId === invItem._id)) return;
    setTaskForm(prev => ({
      ...prev,
      materialsUsed: [...prev.materialsUsed, { inventoryId: invItem._id, quantity: 1, name: invItem.name, unit: invItem.unit }]
    }));
  };

  const handleUpdateMaterialQty = (invId, text) => {
    const val = parseFloat(text) || 0;
    setTaskForm(prev => ({
      ...prev,
      materialsUsed: prev.materialsUsed.map(m => m.inventoryId === invId ? { ...m, quantity: val } : m)
    }));
  };

  const handleRemoveMaterial = (invId) => {
    setTaskForm(prev => ({
      ...prev,
      materialsUsed: prev.materialsUsed.filter(m => m.inventoryId !== invId)
    }));
  };

  const handleAddMachinery = (machItem) => {
    if (taskForm.machineryUsed.some(m => m.machineryId === machItem._id)) return;
    setTaskForm(prev => ({
      ...prev,
      machineryUsed: [...prev.machineryUsed, { machineryId: machItem._id, duration: 1, name: machItem.name }]
    }));
  };

  const handleRemoveMachinery = (machId) => {
    setTaskForm(prev => ({
      ...prev,
      machineryUsed: prev.machineryUsed.filter(m => m.machineryId !== machId)
    }));
  };

  const filteredTasks = tasks.filter(t => {
    let statusMatch = false;
    if (activeTab === 'All') statusMatch = true;
    else if (activeTab === 'Overdue') {
      if (!t.dueDate || t.status === 'completed' || t.status === 'cancelled') statusMatch = false;
      else statusMatch = new Date(t.dueDate) < getTodayWithoutTime();
    } else {
      statusMatch = t.status === activeTab;
    }

    let workerMatch = true;
    if (activeWorkerFilter !== 'All') {
      const tworkerId = t.assignedTo?._id || t.assignedTo;
      workerMatch = (tworkerId === activeWorkerFilter);
    }

    let landMatch = true;
    if (activeLandFilter !== 'All') {
      const tlandId = t.landId?._id || t.landId;
      landMatch = (tlandId === activeLandFilter);
    }

    return statusMatch && workerMatch && landMatch;
  });

  const renderTask = ({ item }) => {
    const priorityStyle = getPriorityStyle(item.priority);
    const statusStyle = getStatusStyle(item.status);
    const isOverdue = item.dueDate && new Date(item.dueDate) < getTodayWithoutTime() && item.status !== 'completed' && item.status !== 'cancelled';

    return (
      <View style={[styles.card, isOverdue && styles.overdueCard]}>
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleSection}>
            <Text style={styles.taskTitle} numberOfLines={2}>{item.title}</Text>
            {isOverdue && (
              <View style={styles.overdueBadge}>
                <Text style={styles.overdueText}>OVERDUE</Text>
              </View>
            )}
          </View>
          <View style={styles.badgeContainer}>
            <View style={[styles.priorityBadge, { backgroundColor: priorityStyle.lightBg }]}>
              <View style={[styles.priorityDot, { backgroundColor: priorityStyle.bg }]} />
              <Text style={[styles.priorityText, { color: priorityStyle.bg }]}>{priorityStyle.text}</Text>
            </View>
          </View>
        </View>

        {/* Status Chip */}
        <View style={[styles.statusChip, { backgroundColor: statusStyle.bg }]}>
          <Text style={[styles.statusText, { color: statusStyle.color }]}>
            {statusStyle.icon} {item.status.charAt(0).toUpperCase() + item.status.slice(1).replace('-', ' ')}
          </Text>
        </View>

        {item.description ? <Text style={styles.taskDesc}>{item.description}</Text> : null}

        {/* Meta Info */}
        <View style={styles.metaContainer}>
          <View style={styles.metaItem}>
            <Text style={styles.metaIcon}>📅</Text>
            <Text style={styles.metaText}>
              {formatDisplayDate(item.startDate)} - {formatDisplayDate(item.dueDate) || 'No deadline'}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaIcon}>👤</Text>
            <Text style={styles.metaText}>{item.assignedTo?.name || 'Unassigned'}</Text>
          </View>
          {item.landId && (
            <View style={styles.metaItem}>
              <Text style={styles.metaIcon}>🌱</Text>
              <Text style={styles.metaText}>{item.landId?.name || item.landId?.location || 'Land'}</Text>
            </View>
          )}
        </View>

        {/* Notes Section */}
        {item.notes ? (
          <View style={styles.notesSection}>
            <Text style={styles.notesLabel}>Notes</Text>
            <Text style={styles.notesText}>{item.notes}</Text>
          </View>
        ) : null}

        {/* Materials */}
        {item.materialsUsed && item.materialsUsed.length > 0 && (
          <View style={styles.resourceSection}>
            <Text style={styles.resourceLabel}>Materials</Text>
            <View style={styles.resourceChips}>
              {item.materialsUsed.map((m, idx) => {
                const invItem = inventory.find(i => i._id === m.inventoryId);
                return (
                  <View key={idx} style={styles.resourceChip}>
                    <Text style={styles.resourceChipText}>{invItem ? invItem.name : 'Item'}: {m.quantity}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Machinery */}
        {item.machineryUsed && item.machineryUsed.length > 0 && (
          <View style={styles.resourceSection}>
            <Text style={styles.resourceLabel}>Equipment</Text>
            <View style={styles.resourceChips}>
              {item.machineryUsed.map((m, idx) => {
                const machItem = machinery.find(i => i._id === m.machineryId);
                return (
                  <View key={idx} style={[styles.resourceChip, { backgroundColor: colors.warningLight }]}>
                    <Text style={[styles.resourceChipText, { color: colors.warning }]}>{machItem ? machItem.name : 'Equipment'}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Progress */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Progress</Text>
            <Text style={styles.progressValue}>{item.progress || 0}%</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${item.progress || 0}%` }]} />
          </View>
        </View>

        {/* Actions */}
        <View style={styles.cardActions}>
          {item.status !== 'completed' && item.status !== 'cancelled' && (
            <TouchableOpacity 
              style={[styles.actionBtn, styles.completeBtn]} 
              onPress={() => updateStatusQuick(item._id, 'completed')}
              activeOpacity={0.7}
            >
              <Text style={styles.completeBtnText}>Complete</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity 
            style={[styles.actionBtn, styles.editBtn]} 
            onPress={() => openEditModal(item)}
            activeOpacity={0.7}
          >
            <Text style={styles.editBtnText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionBtn, styles.deleteBtn]} 
            onPress={() => deleteTask(item._id, item.title)}
            activeOpacity={0.7}
          >
            <Text style={styles.deleteBtnText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading tasks...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Filter Section */}
      <View style={styles.filterSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {filterTabs.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.filterTab, activeTab === tab && styles.filterTabActive]}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterTabText, activeTab === tab && styles.filterTabTextActive]}>
                {tab === 'in-progress' ? 'In Progress' : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Worker Filter */}
        <View style={styles.subFilter}>
          <Text style={styles.subFilterLabel}>Worker</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity 
              style={[styles.subFilterChip, activeWorkerFilter === 'All' && styles.subFilterChipActive]} 
              onPress={() => setActiveWorkerFilter('All')}
            >
              <Text style={[styles.subFilterChipText, activeWorkerFilter === 'All' && styles.subFilterChipTextActive]}>All</Text>
            </TouchableOpacity>
            {labors.map(lbl => (
              <TouchableOpacity 
                key={lbl._id} 
                style={[styles.subFilterChip, activeWorkerFilter === lbl._id && styles.subFilterChipActive]} 
                onPress={() => setActiveWorkerFilter(lbl._id)}
              >
                <Text style={[styles.subFilterChipText, activeWorkerFilter === lbl._id && styles.subFilterChipTextActive]}>
                  {lbl.name.split(' ')[0]}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Land Filter */}
        <View style={styles.subFilter}>
          <Text style={styles.subFilterLabel}>Land</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity 
              style={[styles.subFilterChip, activeLandFilter === 'All' && styles.subFilterChipActive]} 
              onPress={() => setActiveLandFilter('All')}
            >
              <Text style={[styles.subFilterChipText, activeLandFilter === 'All' && styles.subFilterChipTextActive]}>All</Text>
            </TouchableOpacity>
            {lands.map(lnd => (
              <TouchableOpacity 
                key={lnd._id} 
                style={[styles.subFilterChip, activeLandFilter === lnd._id && styles.subFilterChipActive]} 
                onPress={() => setActiveLandFilter(lnd._id)}
              >
                <Text style={[styles.subFilterChipText, activeLandFilter === lnd._id && styles.subFilterChipTextActive]}>
                  {lnd.name || lnd.location || 'Plot'}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      {/* Tasks List */}
      <FlatList
        data={filteredTasks}
        keyExtractor={(item) => item._id}
        renderItem={renderTask}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconBg}>
              <Text style={styles.emptyIcon}>✓</Text>
            </View>
            <Text style={styles.emptyTitle}>No Tasks Found</Text>
            <Text style={styles.emptySubtitle}>Create a new task to get started</Text>
          </View>
        }
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          resetTaskForm();
          setEditingItem(null);
          setModalVisible(true);
        }}
        activeOpacity={0.8}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      {/* Modal */}
      <Modal animationType="slide" transparent visible={modalVisible}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingItem ? 'Edit Task' : 'New Task'}</Text>
              <TouchableOpacity
                onPress={() => { setModalVisible(false); resetTaskForm(); }}
                style={styles.modalCloseBtn}
              >
                <Text style={styles.modalCloseBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView contentContainerStyle={styles.modalContent} showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Title</Text>
              <TextInput 
                placeholderTextColor={colors.textHint}
                style={styles.input} 
                placeholder="Enter task title" 
                value={taskForm.title} 
                onChangeText={(text) => handleTextChange('title', text)} 
              />

              <Text style={styles.inputLabel}>Description</Text>
              <TextInput 
                placeholderTextColor={colors.textHint}
                style={[styles.input, styles.textArea]} 
                placeholder="What needs to be done?" 
                multiline 
                numberOfLines={3} 
                value={taskForm.description} 
                onChangeText={(text) => handleTextChange('description', text)} 
              />

              <Text style={styles.inputLabel}>Select Land Plot</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionScroll}>
                {lands.map((land) => (
                  <TouchableOpacity 
                    key={land._id} 
                    style={[styles.optionChip, taskForm.landId === land._id && styles.optionChipSelected]} 
                    onPress={() => setTaskForm({ ...taskForm, landId: land._id, assignedTo: '', materialsUsed: [], machineryUsed: [] })}
                  >
                    <Text style={[styles.optionChipText, taskForm.landId === land._id && styles.optionChipTextSelected]}>
                      {land.name || land.location || 'Plot'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {!taskForm.landId && (
                <Text style={styles.hintText}>Select a land plot first to assign workers and resources</Text>
              )}

              {taskForm.landId && (
                <>
                  <Text style={styles.inputLabel}>Assign Worker</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionScroll}>
                    {labors.filter(labor => (labor.landId?._id || labor.landId) === taskForm.landId).length === 0 ? (
                      <Text style={styles.emptyOptionText}>No workers on this land</Text>
                    ) : labors.filter(labor => (labor.landId?._id || labor.landId) === taskForm.landId).map((labor) => (
                      <TouchableOpacity 
                        key={labor._id} 
                        style={[styles.optionChip, taskForm.assignedTo === labor._id && styles.optionChipSelected]} 
                        onPress={() => setTaskForm({ ...taskForm, assignedTo: labor._id })}
                      >
                        <Text style={[styles.optionChipText, taskForm.assignedTo === labor._id && styles.optionChipTextSelected]}>
                          {labor.name.split(' ')[0]}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </>
              )}

              <Text style={styles.inputLabel}>Status</Text>
              <View style={styles.statusOptions}>
                {statuses.map((stat) => {
                  const statStyle = getStatusStyle(stat);
                  return (
                    <TouchableOpacity 
                      key={stat} 
                      style={[
                        styles.statusOption, 
                        taskForm.status === stat && { backgroundColor: statStyle.bg, borderColor: statStyle.color }
                      ]} 
                      onPress={() => setTaskForm({ ...taskForm, status: stat })}
                    >
                      <Text style={[
                        styles.statusOptionText, 
                        taskForm.status === stat && { color: statStyle.color, fontWeight: '600' }
                      ]}>
                        {stat.charAt(0).toUpperCase() + stat.slice(1).replace('-', ' ')}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.inputLabel}>Progress: {taskForm.progress}%</Text>
              <View style={styles.progressOptions}>
                {progressOptions.map(p => (
                  <TouchableOpacity
                    key={p}
                    style={[styles.progressOption, taskForm.progress === p && styles.progressOptionSelected]}
                    onPress={() => setTaskForm({ ...taskForm, progress: p })}
                  >
                    <Text style={[styles.progressOptionText, taskForm.progress === p && styles.progressOptionTextSelected]}>{p}%</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Dates</Text>
              <View style={styles.dateRow}>
                <TouchableOpacity style={styles.dateInput} onPress={() => setPickerMode('start')}>
                  <Text style={styles.dateIcon}>📅</Text>
                  <Text style={taskForm.startDate ? styles.dateText : styles.datePlaceholder}>
                    {taskForm.startDate ? formatDate(taskForm.startDate) : 'Start Date'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.dateInput} onPress={() => setPickerMode('due')}>
                  <Text style={styles.dateIcon}>🏁</Text>
                  <Text style={taskForm.dueDate ? styles.dateText : styles.datePlaceholder}>
                    {taskForm.dueDate ? formatDate(taskForm.dueDate) : 'Deadline'}
                  </Text>
                </TouchableOpacity>
              </View>

              {pickerMode && (
                <View style={styles.datePickerContainer}>
                  <View style={styles.datePickerHeader}>
                    <Text style={styles.datePickerTitle}>{pickerMode === 'start' ? 'Set Start Date' : 'Set Deadline'}</Text>
                    <TouchableOpacity onPress={() => setPickerMode(null)} style={styles.datePickerDone}>
                      <Text style={styles.datePickerDoneText}>Done</Text>
                    </TouchableOpacity>
                  </View>
                  <DateTimePicker
                    value={taskForm[pickerMode === 'start' ? 'startDate' : 'dueDate'] || new Date()}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'inline' : 'default'}
                    minimumDate={pickerMode === 'due' ? new Date(new Date().setHours(0, 0, 0, 0) + 86400000) : undefined}
                    style={{ height: Platform.OS === 'ios' ? 320 : undefined }}
                    accentColor={colors.primary}
                    onChange={(e, val) => {
                      if (Platform.OS === 'android') setPickerMode(null);
                      if (val) {
                        if (pickerMode === 'start') setTaskForm(prev => ({ ...prev, startDate: val }));
                        if (pickerMode === 'due') setTaskForm(prev => ({ ...prev, dueDate: val }));
                      }
                    }}
                  />
                </View>
              )}

              <Text style={styles.inputLabel}>Priority</Text>
              <View style={styles.priorityOptions}>
                {['low', 'medium', 'high', 'urgent'].map((priority) => {
                  const pStyle = getPriorityStyle(priority);
                  return (
                    <TouchableOpacity 
                      key={priority} 
                      style={[styles.priorityOption, taskForm.priority === priority && { backgroundColor: pStyle.bg }]} 
                      onPress={() => setTaskForm({ ...taskForm, priority })}
                    >
                      <Text style={[styles.priorityOptionText, taskForm.priority === priority && styles.priorityOptionTextSelected]}>
                        {pStyle.text}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {taskForm.landId && (
                <>
                  <Text style={styles.inputLabel}>Materials</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionScroll}>
                    {inventory.filter(i => (i.landId?._id || i.landId) === taskForm.landId).length === 0 ? (
                      <Text style={styles.emptyOptionText}>No inventory on this land</Text>
                    ) : inventory.filter(i => (i.landId?._id || i.landId) === taskForm.landId).map(invItem => (
                      <TouchableOpacity key={invItem._id} style={styles.addResourceChip} onPress={() => handleAddMaterial(invItem)}>
                        <Text style={styles.addResourceChipText}>+ {invItem.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>

                  {taskForm.materialsUsed.map((mat, idx) => {
                    const invItem = inventory.find(i => i._id === mat.inventoryId);
                    return (
                      <View key={idx} style={styles.resourceRow}>
                        <Text style={styles.resourceName}>{invItem?.name || mat.name}</Text>
                        <TextInput
                          style={styles.resourceInput}
                          keyboardType="numeric"
                          value={mat.quantity.toString()}
                          onChangeText={(txt) => handleUpdateMaterialQty(mat.inventoryId, txt)}
                        />
                        <Text style={styles.resourceUnit}>{invItem?.unit || mat.unit}</Text>
                        <TouchableOpacity onPress={() => handleRemoveMaterial(mat.inventoryId)}>
                          <Text style={styles.removeBtn}>✕</Text>
                        </TouchableOpacity>
                      </View>
                    );
                  })}

                  <Text style={styles.inputLabel}>Equipment</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionScroll}>
                    {machinery.filter(m => (m.landId?._id || m.landId) === taskForm.landId).length === 0 ? (
                      <Text style={styles.emptyOptionText}>No equipment on this land</Text>
                    ) : machinery.filter(m => (m.landId?._id || m.landId) === taskForm.landId).map(machItem => (
                      <TouchableOpacity key={machItem._id} style={styles.addResourceChip} onPress={() => handleAddMachinery(machItem)}>
                        <Text style={styles.addResourceChipText}>+ {machItem.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>

                  {taskForm.machineryUsed.map((mat, idx) => {
                    const machItem = machinery.find(i => i._id === mat.machineryId);
                    return (
                      <View key={idx} style={styles.resourceRow}>
                        <Text style={styles.resourceName}>{machItem?.name || mat.name}</Text>
                        <TouchableOpacity onPress={() => handleRemoveMachinery(mat.machineryId)}>
                          <Text style={styles.removeBtn}>✕</Text>
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </>
              )}

              <Text style={styles.inputLabel}>Notes</Text>
              <TextInput 
                placeholderTextColor={colors.textHint}
                style={[styles.input, styles.textArea]} 
                placeholder="Add any notes or observations..." 
                multiline 
                numberOfLines={3} 
                value={taskForm.notes} 
                onChangeText={(text) => handleTextChange('notes', text)} 
              />

              <TouchableOpacity style={styles.submitBtn} onPress={editingItem ? updateTask : createTask}>
                <Text style={styles.submitBtnText}>{editingItem ? 'Save Changes' : 'Create Task'}</Text>
              </TouchableOpacity>
              
              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: colors.background,
  },
  loadingContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: spacing.md,
    ...typography.body,
    color: colors.textSecondary,
  },

  // Filter Section
  filterSection: { 
    backgroundColor: colors.cardBackground, 
    paddingTop: spacing.md, 
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.mediumGray,
  },
  filterScroll: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  filterTab: { 
    paddingHorizontal: spacing.lg, 
    paddingVertical: spacing.sm, 
    borderRadius: borderRadius.round, 
    backgroundColor: colors.lightGray, 
    marginRight: spacing.sm,
  },
  filterTabActive: { 
    backgroundColor: colors.primary,
  },
  filterTabText: { 
    ...typography.buttonSmall,
    color: colors.textSecondary,
  },
  filterTabTextActive: { 
    color: colors.textLight,
  },

  subFilter: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: spacing.md,
    marginTop: spacing.xs,
  },
  subFilterLabel: { 
    ...typography.caption,
    color: colors.textTertiary,
    width: 50,
  },
  subFilterChip: { 
    paddingHorizontal: spacing.md, 
    paddingVertical: spacing.xs, 
    borderRadius: borderRadius.round, 
    backgroundColor: colors.backgroundAlt, 
    marginRight: spacing.xs,
  },
  subFilterChipActive: { 
    backgroundColor: colors.primaryMuted,
  },
  subFilterChipText: { 
    ...typography.caption,
    color: colors.textSecondary,
  },
  subFilterChipTextActive: { 
    color: colors.primary,
    fontWeight: '600',
  },

  // List
  listContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: 100,
  },

  // Card
  card: { 
    backgroundColor: colors.cardBackground, 
    marginBottom: spacing.md, 
    padding: spacing.lg, 
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  overdueCard: { 
    borderWidth: 2, 
    borderColor: colors.error, 
    backgroundColor: colors.errorLight,
  },
  cardHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  cardTitleSection: {
    flex: 1,
    marginRight: spacing.sm,
  },
  taskTitle: { 
    ...typography.h4,
    color: colors.textPrimary,
  },
  overdueBadge: {
    backgroundColor: colors.error,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
    marginTop: spacing.xs,
    alignSelf: 'flex-start',
  },
  overdueText: {
    ...typography.overline,
    color: colors.textLight,
    fontSize: 9,
  },
  badgeContainer: {
    flexDirection: 'row',
  },
  priorityBadge: { 
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm, 
    paddingVertical: spacing.xs, 
    borderRadius: borderRadius.round,
  },
  priorityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: spacing.xs,
  },
  priorityText: { 
    ...typography.caption,
    fontWeight: '600',
  },
  statusChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.sm,
  },
  statusText: {
    ...typography.caption,
    fontWeight: '600',
  },
  taskDesc: { 
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },

  // Meta
  metaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundAlt,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    marginRight: spacing.sm,
    marginBottom: spacing.xs,
  },
  metaIcon: {
    fontSize: 12,
    marginRight: spacing.xs,
  },
  metaText: {
    ...typography.caption,
    color: colors.textSecondary,
  },

  // Notes
  notesSection: {
    backgroundColor: colors.warningLight,
    padding: spacing.md,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.warning,
  },
  notesLabel: {
    ...typography.caption,
    color: colors.warning,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  notesText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },

  // Resources
  resourceSection: {
    marginBottom: spacing.md,
  },
  resourceLabel: {
    ...typography.caption,
    color: colors.textTertiary,
    marginBottom: spacing.xs,
  },
  resourceChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  resourceChip: {
    backgroundColor: colors.primaryMuted,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  resourceChipText: {
    ...typography.caption,
    color: colors.primary,
  },

  // Progress
  progressSection: {
    marginBottom: spacing.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  progressLabel: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  progressValue: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: colors.lightGray,
    borderRadius: borderRadius.xs,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.xs,
  },

  // Actions
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
  },
  actionBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    marginLeft: spacing.sm,
  },
  completeBtn: {
    backgroundColor: colors.successLight,
  },
  completeBtnText: {
    ...typography.buttonSmall,
    color: colors.success,
  },
  editBtn: {
    backgroundColor: colors.infoLight,
  },
  editBtnText: {
    ...typography.buttonSmall,
    color: colors.info,
  },
  deleteBtn: {
    backgroundColor: colors.errorLight,
  },
  deleteBtnText: {
    ...typography.buttonSmall,
    color: colors.error,
  },

  // Empty
  emptyContainer: { 
    alignItems: 'center', 
    marginTop: 80,
  },
  emptyIconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  emptyIcon: { 
    fontSize: 36,
    color: colors.primary,
  },
  emptyTitle: { 
    ...typography.h4,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  emptySubtitle: { 
    ...typography.body,
    color: colors.textTertiary,
  },

  // FAB
  fab: { 
    position: 'absolute', 
    bottom: 24, 
    right: 24, 
    backgroundColor: colors.primary, 
    width: 60, 
    height: 60, 
    borderRadius: 30, 
    justifyContent: 'center', 
    alignItems: 'center', 
    ...shadows.lg,
  },
  fabIcon: { 
    fontSize: 32, 
    color: colors.textLight,
    marginTop: -2,
  },

  // Modal
  modalOverlay: { 
    flex: 1, 
    backgroundColor: colors.overlay,
  },
  modalContainer: { 
    flex: 1, 
    marginTop: Platform.OS === 'ios' ? 60 : 30,
    backgroundColor: colors.cardBackground, 
    borderTopLeftRadius: borderRadius.xl, 
    borderTopRightRadius: borderRadius.xl,
  },
  modalHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1, 
    borderBottomColor: colors.lightGray,
  },
  modalTitle: { 
    ...typography.h3,
    color: colors.textPrimary,
  },
  modalCloseBtn: {
    padding: spacing.sm,
  },
  modalCloseBtnText: {
    fontSize: 20,
    color: colors.textTertiary,
  },
  modalContent: { 
    padding: spacing.lg,
  },

  // Form
  inputLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    marginTop: spacing.md,
  },
  input: { 
    borderWidth: 1, 
    borderColor: colors.mediumGray, 
    backgroundColor: colors.inputBackground,
    padding: spacing.md, 
    borderRadius: borderRadius.md, 
    ...typography.body,
    color: colors.textPrimary,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  hintText: {
    ...typography.bodySmall,
    color: colors.warning,
    fontStyle: 'italic',
    marginTop: spacing.sm,
  },

  optionScroll: {
    marginVertical: spacing.sm,
  },
  optionChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.round,
    backgroundColor: colors.lightGray,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  optionChipSelected: {
    backgroundColor: colors.primaryMuted,
    borderColor: colors.primary,
  },
  optionChipText: {
    ...typography.buttonSmall,
    color: colors.textSecondary,
  },
  optionChipTextSelected: {
    color: colors.primary,
  },
  emptyOptionText: {
    ...typography.bodySmall,
    color: colors.textHint,
    fontStyle: 'italic',
  },

  statusOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.sm,
  },
  statusOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.lightGray,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  statusOptionText: {
    ...typography.buttonSmall,
    color: colors.textSecondary,
  },

  progressOptions: {
    flexDirection: 'row',
    marginTop: spacing.sm,
  },
  progressOption: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    backgroundColor: colors.lightGray,
    marginRight: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  progressOptionSelected: {
    backgroundColor: colors.primary,
  },
  progressOptionText: {
    ...typography.buttonSmall,
    color: colors.textSecondary,
  },
  progressOptionTextSelected: {
    color: colors.textLight,
  },

  dateRow: {
    flexDirection: 'row',
    marginTop: spacing.sm,
  },
  dateInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.mediumGray,
    backgroundColor: colors.inputBackground,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginRight: spacing.sm,
  },
  dateIcon: {
    fontSize: 16,
    marginRight: spacing.sm,
  },
  dateText: {
    ...typography.body,
    color: colors.textPrimary,
  },
  datePlaceholder: {
    ...typography.body,
    color: colors.textHint,
  },

  datePickerContainer: {
    backgroundColor: colors.charcoal,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.darkGray,
  },
  datePickerTitle: {
    ...typography.h5,
    color: colors.leaf,
  },
  datePickerDone: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  datePickerDoneText: {
    ...typography.buttonSmall,
    color: colors.textLight,
  },

  priorityOptions: {
    flexDirection: 'row',
    marginTop: spacing.sm,
  },
  priorityOption: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    backgroundColor: colors.lightGray,
    marginRight: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  priorityOptionText: {
    ...typography.buttonSmall,
    color: colors.textSecondary,
  },
  priorityOptionTextSelected: {
    color: colors.textLight,
  },

  addResourceChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.round,
    backgroundColor: colors.primaryMuted,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.primary,
    borderStyle: 'dashed',
  },
  addResourceChipText: {
    ...typography.buttonSmall,
    color: colors.primary,
  },

  resourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundAlt,
    padding: spacing.md,
    borderRadius: borderRadius.sm,
    marginTop: spacing.sm,
  },
  resourceName: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
  },
  resourceInput: {
    width: 60,
    borderWidth: 1,
    borderColor: colors.mediumGray,
    backgroundColor: colors.inputBackground,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    textAlign: 'center',
    ...typography.body,
    color: colors.textPrimary,
  },
  resourceUnit: {
    ...typography.caption,
    color: colors.textTertiary,
    marginLeft: spacing.sm,
    marginRight: spacing.sm,
  },
  removeBtn: {
    fontSize: 18,
    color: colors.error,
    padding: spacing.xs,
  },

  submitBtn: {
    backgroundColor: colors.primary,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  submitBtnText: {
    ...typography.button,
    color: colors.textLight,
  },
});
