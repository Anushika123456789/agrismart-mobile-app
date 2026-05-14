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
  StatusBar,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { machineryService, landService } from '../services/api';
import { colors, spacing, borderRadius, typography, shadows } from '../styles/colors';

export default function MachineryScreen() {
  const [machinery, setMachinery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [lands, setLands] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    model: '',
    serialNumber: '',
    status: 'available',
    purchasePrice: '',
    maintenanceHistory: [],
    landId: '',
  });

  const [newLog, setNewLog] = useState({
    description: '',
    cost: '',
    date: '',
  });

  const statuses = [
    { label: 'Available', value: 'available', color: colors.success },
    { label: 'In Use', value: 'in-use', color: colors.info },
    { label: 'Repairs', value: 'under-repair', color: colors.error },
    { label: 'Retired', value: 'decommissioned', color: colors.gray }
  ];

  const [showDatePicker, setShowDatePicker] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const fetchData = async () => {
    setLoading(true);
    try {
      const [macRes, landRes] = await Promise.all([
        machineryService.getAll(),
        landService.getAll()
      ]);
      setMachinery(macRes.data.all || []);
      setLands(landRes.data || []);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch machinery or lands');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert('Validation Error', 'Please enter equipment name.');
      return false;
    }
    const price = parseFloat(formData.purchasePrice);
    if (formData.purchasePrice && (isNaN(price) || price < 0)) {
      Alert.alert('Validation Error', 'Please enter a valid positive number for purchase price.');
      return false;
    }
    return true;
  };

  const createAsset = async () => {
    if (!validateForm()) return;
    try {
      await machineryService.create({
        ...formData,
        purchasePrice: parseFloat(formData.purchasePrice) || 0,
      });
      Alert.alert('Success', 'Equipment added successfully');
      setModalVisible(false);
      resetForm();
      fetchData();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to create');
    }
  };

  const updateAsset = async () => {
    if (!validateForm()) return;
    try {
      await machineryService.update(editingItem._id, {
        ...formData,
        purchasePrice: parseFloat(formData.purchasePrice) || 0,
      });
      Alert.alert('Success', 'Equipment updated successfully');
      setModalVisible(false);
      setEditingItem(null);
      resetForm();
      fetchData();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update');
    }
  };

  const deleteAsset = async (id, name) => {
    Alert.alert('Delete Equipment', `Delete ${name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await machineryService.delete(id);
            fetchData();
          } catch (error) {
            Alert.alert('Error', 'Failed to delete equipment');
          }
        }
      },
    ]);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      model: '',
      serialNumber: '',
      status: 'available',
      purchasePrice: '',
      maintenanceHistory: [],
      landId: '',
    });
    setNewLog({ description: '', cost: '', date: '' });
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      model: item.model || '',
      serialNumber: item.serialNumber || '',
      status: item.status || 'available',
      purchasePrice: item.purchasePrice ? item.purchasePrice.toString() : '',
      maintenanceHistory: item.maintenanceHistory || [],
      landId: item.landId?._id || item.landId || '',
    });
    setNewLog({ description: '', cost: '', date: '' });
    setModalVisible(true);
  };

  const addMaintenanceLog = () => {
    if (!newLog.description.trim()) {
      Alert.alert("Validation Error", "Please enter a repair/fuel description.");
      return;
    }
    const cost = parseFloat(newLog.cost);
    if (isNaN(cost) || cost < 0) {
      Alert.alert("Validation Error", "Please enter a valid positive number for cost.");
      return;
    }
    if (!newLog.date) {
      Alert.alert("Validation Error", "Please select a maintenance date.");
      return;
    }
    const logObj = {
      description: newLog.description.trim(),
      cost: cost,
      date: new Date(newLog.date)
    };
    setFormData(prev => ({
      ...prev,
      maintenanceHistory: [...prev.maintenanceHistory, logObj]
    }));
    setNewLog({ description: '', cost: '', date: '' });
  };

  const removeMaintenanceLog = (index) => {
    setFormData(prev => {
      const updated = [...prev.maintenanceHistory];
      updated.splice(index, 1);
      return { ...prev, maintenanceHistory: updated };
    });
  };

  const getStatusStyle = (status) => {
    const s = statuses.find(x => x.value === status);
    return s ? s.color : colors.gray;
  };

  const getStatusBgStyle = (status) => {
    switch(status) {
      case 'available': return styles.statusAvailable;
      case 'in-use': return styles.statusInUse;
      case 'under-repair': return styles.statusRepair;
      default: return styles.statusDecommissioned;
    }
  };

  const renderItem = ({ item }) => {
    const totalMaintenance = item.maintenanceHistory?.reduce((sum, log) => sum + (log.cost || 0), 0) || 0;
    const lastService = item.maintenanceHistory && item.maintenanceHistory.length > 0
      ? new Date(item.maintenanceHistory[item.maintenanceHistory.length - 1].date).toLocaleDateString()
      : 'No records';

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <View style={styles.iconContainer}>
              <Text style={styles.iconText}>🚜</Text>
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.itemName}>{item.name}</Text>
              <View style={styles.badgeRow}>
                <View style={[styles.statusBadge, getStatusBgStyle(item.status)]}>
                  <Text style={[styles.statusText, { color: getStatusStyle(item.status) === colors.gray ? colors.textTertiary : getStatusStyle(item.status) }]}>
                    {item.status.toUpperCase().replace('-', ' ')}
                  </Text>
                </View>
                {item.landId && (
                  <View style={styles.landBadge}>
                    <Text style={styles.landBadgeText}>{item.landId?.location || 'Assigned'}</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
          <View style={styles.cardActions}>
            <TouchableOpacity onPress={() => openEditModal(item)} style={styles.actionButton} activeOpacity={0.7}>
              <Text style={styles.actionText}>✏️</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => deleteAsset(item._id, item.name)} style={styles.actionButton} activeOpacity={0.7}>
              <Text style={styles.actionText}>🗑️</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.cardDetail}>Model: {item.model || 'N/A'} | Serial: {item.serialNumber || 'N/A'}</Text>

        <View style={styles.metricsContainer}>
          <View style={styles.metricBox}>
            <Text style={styles.metricValue}>LKR {totalMaintenance.toLocaleString()}</Text>
            <Text style={styles.metricLabel}>Repair Costs</Text>
          </View>
          <View style={styles.metricBox}>
            <Text style={styles.metricValue}>{lastService}</Text>
            <Text style={styles.metricLabel}>Last Service</Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading equipment...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      
      <FlatList
        data={machinery}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 100, paddingTop: spacing.sm }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🚜</Text>
            <Text style={styles.emptyTitle}>No Equipment Listed</Text>
            <Text style={styles.emptyText}>Add machinery using the + button</Text>
          </View>
        }
      />

      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => { setEditingItem(null); resetForm(); setModalVisible(true); }}
        activeOpacity={0.8}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <Modal animationType="slide" transparent visible={modalVisible}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>{editingItem ? 'Edit Equipment' : 'Add Machinery'}</Text>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>Equipment Details</Text>
              <TextInput 
                placeholderTextColor={colors.textHint}
                style={styles.input} 
                placeholder="Machine Name" 
                value={formData.name} 
                onChangeText={(text) => setFormData({ ...formData, name: text })} 
              />

              <View style={styles.row}>
                <TextInput 
                  placeholderTextColor={colors.textHint}
                  style={[styles.input, { flex: 1, marginRight: spacing.sm }]} 
                  placeholder="Model" 
                  value={formData.model} 
                  onChangeText={(text) => setFormData({ ...formData, model: text })} 
                />
                <TextInput 
                  placeholderTextColor={colors.textHint}
                  style={[styles.input, { flex: 1 }]} 
                  placeholder="Serial #" 
                  value={formData.serialNumber} 
                  onChangeText={(text) => setFormData({ ...formData, serialNumber: text })} 
                />
              </View>

              <TextInput 
                placeholderTextColor={colors.textHint}
                style={styles.input} 
                placeholder="Purchase Price (LKR)" 
                keyboardType="numeric" 
                value={formData.purchasePrice.toString()} 
                onChangeText={(text) => setFormData({ ...formData, purchasePrice: text.replace(/[^0-9.]/g, '') })} 
              />

              <Text style={styles.label}>Operational Status</Text>
              <View style={styles.statusContainer}>
                {statuses.map((s) => (
                  <TouchableOpacity
                    key={s.value}
                    style={[styles.statusOption, formData.status === s.value && { backgroundColor: s.color }]}
                    onPress={() => setFormData({ ...formData, status: s.value })}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.statusOptionText, formData.status === s.value && styles.statusOptionTextSelected]}>
                      {s.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {lands.length > 0 && (
                <>
                  <Text style={styles.label}>Service Location</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.landPillsContainer}>
                    {lands.map((land) => (
                      <TouchableOpacity
                        key={land._id}
                        style={[styles.landPill, formData.landId === land._id && styles.landPillSelected]}
                        onPress={() => setFormData({ ...formData, landId: land._id })}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.landPillText, formData.landId === land._id && styles.landPillTextSelected]}>
                          {land.location}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </>
              )}

              <Text style={styles.labelHeader}>Maintenance Logs</Text>
              {formData.maintenanceHistory.map((log, index) => (
                <View key={index} style={styles.logCard}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.logDesc}>{log.description}</Text>
                    <Text style={styles.logSub}>LKR {log.cost} | {new Date(log.date).toLocaleDateString()}</Text>
                  </View>
                  <TouchableOpacity onPress={() => removeMaintenanceLog(index)} activeOpacity={0.7}>
                    <Text style={styles.removeLogIcon}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}

              <View style={styles.addLogBox}>
                <TextInput 
                  placeholderTextColor={colors.textHint}
                  style={styles.miniInput} 
                  placeholder="Repair / Fuel description" 
                  value={newLog.description} 
                  onChangeText={(t) => setNewLog({ ...newLog, description: t })} 
                />
                <View style={styles.row}>
                  <TextInput 
                    placeholderTextColor={colors.textHint}
                    style={[styles.miniInput, { flex: 1, marginRight: spacing.sm }]} 
                    placeholder="Cost (LKR)" 
                    keyboardType="numeric" 
                    value={newLog.cost.toString()} 
                    onChangeText={(t) => setNewLog({ ...newLog, cost: t.replace(/[^0-9.]/g, '') })} 
                  />
                  <TouchableOpacity 
                    style={[styles.miniInput, { flex: 1, justifyContent: 'center' }]} 
                    onPress={() => setShowDatePicker(true)}
                    activeOpacity={0.7}
                  >
                    <Text style={{ color: newLog.date ? colors.textPrimary : colors.textHint, fontSize: 14 }}>
                      {newLog.date ? newLog.date : 'Select Date'}
                    </Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.addLogBtn} onPress={addMaintenanceLog} activeOpacity={0.7}>
                  <Text style={styles.addLogBtnText}>+ Add Log Entry</Text>
                </TouchableOpacity>
              </View>

              {showDatePicker && (
                <View style={styles.datePickerContainer}>
                  <View style={styles.datePickerHeader}>
                    <Text style={styles.datePickerTitle}>Select Date</Text>
                    <TouchableOpacity 
                      onPress={() => setShowDatePicker(false)} 
                      style={styles.datePickerDoneBtn}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.datePickerDoneText}>Done</Text>
                    </TouchableOpacity>
                  </View>
                  <DateTimePicker
                    value={newLog.date ? new Date(newLog.date) : new Date()}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'inline' : 'default'}
                    themeVariant="light"
                    accentColor={colors.primary}
                    onChange={(e, val) => {
                      if (Platform.OS === 'android') {
                        setShowDatePicker(false);
                      }
                      if (val) {
                        setNewLog({ ...newLog, date: val.toISOString().split('T')[0] });
                      }
                    }}
                  />
                </View>
              )}

              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={[styles.button, styles.cancelButton]} 
                  onPress={() => setModalVisible(false)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.button, styles.saveButton]} 
                  onPress={editingItem ? updateAsset : createAsset}
                  activeOpacity={0.8}
                >
                  <Text style={styles.buttonText}>{editingItem ? 'Update' : 'Save'}</Text>
                </TouchableOpacity>
              </View>
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
  center: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    ...typography.body,
    color: colors.textTertiary,
    marginTop: spacing.md,
  },
  
  // Card
  card: { 
    backgroundColor: colors.white, 
    marginHorizontal: spacing.lg, 
    marginVertical: spacing.sm, 
    padding: spacing.lg, 
    borderRadius: borderRadius.lg, 
    ...shadows.sm,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  cardHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  iconText: {
    fontSize: 24,
  },
  headerInfo: {
    flex: 1,
  },
  itemName: { 
    ...typography.h4, 
    color: colors.textPrimary,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.xs,
    gap: spacing.xs,
  },
  statusBadge: { 
    paddingHorizontal: spacing.sm, 
    paddingVertical: spacing.xs, 
    borderRadius: borderRadius.xs,
  },
  statusAvailable: {
    backgroundColor: colors.successLight,
  },
  statusInUse: {
    backgroundColor: colors.infoLight,
  },
  statusRepair: {
    backgroundColor: colors.errorLight,
  },
  statusDecommissioned: {
    backgroundColor: colors.lightGray,
  },
  statusText: { 
    ...typography.overline,
    fontSize: 9,
  },
  landBadge: {
    backgroundColor: colors.infoLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.xs,
  },
  landBadgeText: {
    ...typography.overline,
    fontSize: 9,
    color: colors.info,
  },
  cardActions: { 
    flexDirection: 'row',
    gap: spacing.xs,
  },
  actionButton: { 
    width: 36,
    height: 36,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: { 
    fontSize: 16,
  },
  cardDetail: { 
    ...typography.bodySmall, 
    color: colors.textTertiary, 
    marginTop: spacing.md,
    marginLeft: 60,
  },

  // Metrics
  metricsContainer: { 
    flexDirection: 'row', 
    marginTop: spacing.lg, 
    paddingTop: spacing.md, 
    borderTopWidth: 1, 
    borderTopColor: colors.lightGray,
    gap: spacing.sm,
  },
  metricBox: { 
    flex: 1, 
    alignItems: 'center',
    paddingVertical: spacing.sm,
    backgroundColor: colors.backgroundAlt,
    borderRadius: borderRadius.sm,
  },
  metricValue: { 
    ...typography.body, 
    fontWeight: '600',
    color: colors.primary,
  },
  metricLabel: { 
    ...typography.caption, 
    color: colors.textTertiary,
    marginTop: spacing.xs,
  },

  // Empty State
  emptyContainer: { 
    alignItems: 'center', 
    paddingVertical: spacing.huge * 2,
    paddingHorizontal: spacing.xl,
  },
  emptyIcon: { 
    fontSize: 64, 
    marginBottom: spacing.lg,
    opacity: 0.7,
  },
  emptyTitle: {
    ...typography.h4,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  emptyText: { 
    ...typography.body, 
    color: colors.textTertiary,
    textAlign: 'center',
  },
  
  // FAB
  fab: { 
    position: 'absolute', 
    bottom: spacing.xxl, 
    right: spacing.xl, 
    backgroundColor: colors.primary, 
    width: 60, 
    height: 60, 
    borderRadius: 30, 
    justifyContent: 'center', 
    alignItems: 'center', 
    ...shadows.lg,
  },
  fabText: { 
    fontSize: 28, 
    color: colors.white,
    marginTop: -2,
  },

  // Modal
  modalContainer: { 
    flex: 1, 
    justifyContent: 'flex-end', 
    backgroundColor: colors.overlay,
  },
  modalContent: { 
    backgroundColor: colors.white, 
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    padding: spacing.xl,
    paddingTop: spacing.md,
    maxHeight: '92%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: colors.mediumGray,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: { 
    ...typography.h3, 
    color: colors.textPrimary,
    marginBottom: spacing.xl, 
    textAlign: 'center',
  },

  // Form
  row: { 
    flexDirection: 'row',
  },
  input: { 
    borderWidth: 1.5, 
    borderColor: colors.mediumGray, 
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md + 2, 
    borderRadius: borderRadius.md, 
    marginBottom: spacing.md, 
    fontSize: 15, 
    color: colors.textPrimary, 
    fontWeight: '500',
    backgroundColor: colors.white,
  },
  label: { 
    ...typography.overline, 
    color: colors.primary, 
    marginBottom: spacing.sm, 
    marginTop: spacing.md,
  },
  labelHeader: { 
    ...typography.h5, 
    color: colors.info, 
    marginTop: spacing.xl, 
    marginBottom: spacing.md,
  },

  statusContainer: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  statusOption: { 
    paddingHorizontal: spacing.md, 
    paddingVertical: spacing.sm, 
    borderRadius: borderRadius.round, 
    backgroundColor: colors.lightGray,
  },
  statusOptionText: { 
    ...typography.buttonSmall, 
    color: colors.textSecondary,
  },
  statusOptionTextSelected: { 
    color: colors.white,
  },

  // Maintenance Logs
  logCard: { 
    flexDirection: 'row', 
    backgroundColor: colors.leafLight, 
    padding: spacing.md, 
    borderRadius: borderRadius.sm, 
    marginBottom: spacing.sm, 
    alignItems: 'center',
  },
  logDesc: { 
    ...typography.body, 
    fontWeight: '600',
    color: colors.textPrimary,
  },
  logSub: { 
    ...typography.caption, 
    color: colors.textSecondary,
    marginTop: 2,
  },
  removeLogIcon: {
    fontSize: 18,
    color: colors.error,
    padding: spacing.xs,
  },

  // Land Pills
  landPillsContainer: { 
    flexDirection: 'row', 
    marginBottom: spacing.md,
  },
  landPill: { 
    paddingHorizontal: spacing.md, 
    paddingVertical: spacing.sm, 
    borderRadius: borderRadius.round, 
    backgroundColor: colors.lightGray, 
    marginRight: spacing.sm,
  },
  landPillSelected: { 
    backgroundColor: colors.primary,
  },
  landPillText: { 
    ...typography.buttonSmall, 
    color: colors.textSecondary,
  },
  landPillTextSelected: { 
    color: colors.white,
  },

  // Add Log Box
  addLogBox: { 
    backgroundColor: colors.backgroundAlt, 
    padding: spacing.md, 
    borderRadius: borderRadius.md, 
    borderWidth: 1, 
    borderColor: colors.lightGray, 
    marginTop: spacing.sm,
  },
  miniInput: { 
    borderWidth: 1.5, 
    borderColor: colors.mediumGray, 
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2, 
    borderRadius: borderRadius.sm, 
    marginBottom: spacing.sm, 
    fontSize: 14, 
    color: colors.textPrimary,
    backgroundColor: colors.white,
  },
  addLogBtn: { 
    backgroundColor: colors.info, 
    paddingVertical: spacing.sm + 2, 
    borderRadius: borderRadius.sm, 
    alignItems: 'center',
  },
  addLogBtnText: {
    ...typography.button,
    color: colors.white,
  },

  // Date Picker
  datePickerContainer: {
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.lightGray,
    ...shadows.sm,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  datePickerTitle: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  datePickerDoneBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  datePickerDoneText: {
    ...typography.buttonSmall,
    color: colors.white,
  },

  // Modal Buttons
  modalButtons: { 
    flexDirection: 'row', 
    gap: spacing.md,
    marginTop: spacing.xl,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
  },
  button: { 
    flex: 1, 
    paddingVertical: spacing.md + 2, 
    borderRadius: borderRadius.md, 
    alignItems: 'center',
  },
  cancelButton: { 
    backgroundColor: colors.lightGray,
  },
  saveButton: { 
    backgroundColor: colors.primary,
    ...shadows.sm,
  },
  buttonText: { 
    ...typography.button, 
    color: colors.white,
  },
  cancelButtonText: {
    ...typography.button,
    color: colors.textSecondary,
  },
});
