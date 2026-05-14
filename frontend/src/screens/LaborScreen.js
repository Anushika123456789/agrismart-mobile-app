import React, { useState, useEffect } from 'react';
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
  StatusBar,
} from 'react-native';
import { laborService, landService } from '../services/api';
import { colors, spacing, borderRadius, typography, shadows } from '../styles/colors';

export default function LaborScreen() {
  const [laborers, setLaborers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [payModalVisible, setPayModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [lands, setLands] = useState([]);
  const [attendanceModalVisible, setAttendanceModalVisible] = useState(false);
  const [selectedLaborer, setSelectedLaborer] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    contactNumber: '',
    role: 'field_worker',
    dailyRate: '',
    landId: '',
  });

  const [paymentData, setPaymentData] = useState({
    amount: '',
    description: 'Cash Payment'
  });

  const roles = [
    { label: 'Field Worker', value: 'field_worker' },
    { label: 'Equipment Operator', value: 'equipment_operator' },
    { label: 'Supervisor', value: 'supervisor' },
    { label: 'Harvester', value: 'harvester' },
    { label: 'General', value: 'general' },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [laborRes, landRes] = await Promise.all([
        laborService.getAll(),
        landService.getAll()
      ]);
      setLaborers(laborRes.data.active || []);
      setLands(landRes.data || []);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch laborers or lands');
    } finally {
      setLoading(false);
    }
  };

  const createLabor = async () => {
    if (!formData.name || !formData.dailyRate) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }
    try {
      await laborService.create({
        ...formData,
        dailyRate: parseFloat(formData.dailyRate),
      });
      Alert.alert('Success', 'Laborer added successfully');
      setModalVisible(false);
      resetForm();
      fetchData();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to create laborer');
    }
  };

  const updateLabor = async () => {
    try {
      await laborService.update(editingItem._id, {
        ...formData,
        dailyRate: parseFloat(formData.dailyRate),
      });
      Alert.alert('Success', 'Laborer updated successfully');
      setModalVisible(false);
      setEditingItem(null);
      resetForm();
      fetchData();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update laborer');
    }
  };

  const submitPayment = async () => {
    if (!paymentData.amount) return Alert.alert('Error', 'Enter amount to pay');
    try {
      await laborService.pay(editingItem._id, {
        amount: parseFloat(paymentData.amount),
        description: paymentData.description
      });
      Alert.alert('Payment Logged', 'Finance module updated successfully.');
      setPayModalVisible(false);
      setPaymentData({ amount: '', description: 'Cash Payment' });
      fetchData();
    } catch (error) {
      Alert.alert('Error', 'Failed to process payment');
    }
  };

  const markAttendance = async (id, status) => {
    const today = new Date().toISOString().split('T')[0];
    try {
      await laborService.markAttendance(id, { date: today, status });
      Alert.alert('Success', `Attendance marked: ${status.toUpperCase()}`);
      fetchData();
    } catch (error) {
      Alert.alert('Error', 'Failed to mark attendance');
    }
  };

  const exportAttendanceCSV = (item) => {
    if (!item.attendance || item.attendance.length === 0) {
      Alert.alert('No Data', 'No attendance records to export');
      return;
    }

    let csvContent = `Attendance Report for ${item.name}\n`;
    csvContent += `Date,Status,Hours Worked,Task ID\n`;
    
    item.attendance.sort((a, b) => new Date(b.date) - new Date(a.date)).forEach(a => {
      const date = new Date(a.date).toISOString().split('T')[0];
      csvContent += `${date},${a.status},${a.hoursWorked || 'N/A'},${a.taskId || 'General'}\n`;
    });

    Alert.alert('Exporting CSV', 'In a real environment, this would save to your device storage.');
    console.log('CSV Export Data:', csvContent);
  };

  const deleteLabor = async (id, name) => {
    Alert.alert('Archive Laborer', `Archive ${name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Archive',
        style: 'destructive',
        onPress: async () => {
          try {
            await laborService.delete(id);
            fetchData();
          } catch (error) {
            Alert.alert('Error', 'Failed to archive laborer');
          }
        },
      },
    ]);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      contactNumber: '',
      role: 'field_worker',
      dailyRate: '',
      landId: '',
    });
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      contactNumber: item.contactNumber || '',
      role: item.role,
      dailyRate: item.dailyRate.toString(),
      landId: item.landId?._id || item.landId || '',
    });
    setModalVisible(true);
  };

  const openPayModal = (item) => {
    setEditingItem(item);
    setPaymentData({ amount: '', description: 'Cash Payment' });
    setPayModalVisible(true);
  };

  const openAttendanceModal = (item) => {
    setSelectedLaborer(item);
    setAttendanceModalVisible(true);
  };

  const getRoleLabel = (value) => {
    const role = roles.find((r) => r.value === value);
    return role ? role.label : value;
  };

  const renderItem = ({ item }) => {
    const todayStr = new Date().toDateString();
    const todaysLog = item.attendance?.find(a => new Date(a.date).toDateString() === todayStr);

    const totalEarned = item.attendance?.reduce((sum, a) => {
      if (a.status === 'present') return sum + item.dailyRate;
      if (a.status === 'half-day') return sum + (item.dailyRate / 2);
      return sum;
    }, 0) || 0;

    const totalPaid = item.paymentHistory?.reduce((sum, p) => sum + p.amount, 0) || 0;
    const unpaidBalance = totalEarned - totalPaid;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.name}>{item.name}</Text>
              <View style={styles.badgeRow}>
                <View style={styles.roleBadge}>
                  <Text style={styles.roleText}>{getRoleLabel(item.role)}</Text>
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
            <TouchableOpacity onPress={() => deleteLabor(item._id, item.name)} style={styles.actionButton} activeOpacity={0.7}>
              <Text style={styles.actionText}>🗑️</Text>
            </TouchableOpacity>
          </View>
        </View>

        {item.contactNumber ? (
          <Text style={styles.contact}>{item.contactNumber}</Text>
        ) : null}

        <View style={styles.financeMetrics}>
          <View style={styles.financeBox}>
            <Text style={styles.rateText}>LKR {item.dailyRate}</Text>
            <Text style={styles.rateLabel}>Daily Rate</Text>
          </View>
          <View style={[styles.financeBox, unpaidBalance > 0 && styles.unpaidBox]}>
            <Text style={[styles.rateText, unpaidBalance > 0 && styles.unpaidText]}>
              LKR {unpaidBalance.toFixed(0)}
            </Text>
            <Text style={styles.rateLabel}>Unpaid Wages</Text>
          </View>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.payBtn} onPress={() => openPayModal(item)} activeOpacity={0.7}>
            <Text style={styles.payBtnText}>Submit Payment</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.historyBtn} onPress={() => openAttendanceModal(item)} activeOpacity={0.7}>
            <Text style={styles.historyBtnText}>History</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.attendanceSection}>
          <Text style={styles.attendanceTitle}>Today&apos;s Attendance</Text>
          <View style={styles.attendanceButtons}>
            <TouchableOpacity
              style={[
                styles.attendanceBtn,
                styles.presentBtn,
                todaysLog?.status === 'present' && styles.activeAttendanceBtn
              ]}
              onPress={() => markAttendance(item._id, 'present')}
              activeOpacity={0.7}
            >
              <Text style={[styles.attendanceBtnText, { color: colors.success }]}>Present</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.attendanceBtn,
                styles.halfDayBtn,
                todaysLog?.status === 'half-day' && styles.activeAttendanceBtn
              ]}
              onPress={() => markAttendance(item._id, 'half-day')}
              activeOpacity={0.7}
            >
              <Text style={[styles.attendanceBtnText, { color: colors.warning }]}>Half-Day</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.attendanceBtn,
                styles.absentBtn,
                todaysLog?.status === 'absent' && styles.activeAttendanceBtn
              ]}
              onPress={() => markAttendance(item._id, 'absent')}
              activeOpacity={0.7}
            >
              <Text style={[styles.attendanceBtnText, { color: colors.error }]}>Absent</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading workforce...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      
      <FlatList
        data={laborers}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 100, paddingTop: spacing.sm }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>👷</Text>
            <Text style={styles.emptyTitle}>No Laborers Found</Text>
            <Text style={styles.emptyText}>Add workforce members using the + button</Text>
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

      {/* CREATE / EDIT Modal */}
      <Modal animationType="slide" transparent visible={modalVisible}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>{editingItem ? 'Edit Laborer' : 'Add Laborer'}</Text>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>Worker Details</Text>
              <TextInput 
                placeholderTextColor={colors.textHint}
                style={styles.input} 
                placeholder="Worker Name" 
                value={formData.name} 
                onChangeText={(text) => setFormData({ ...formData, name: text })} 
              />
              <TextInput 
                placeholderTextColor={colors.textHint}
                style={styles.input} 
                placeholder="Contact Number (Optional)" 
                keyboardType="phone-pad" 
                value={formData.contactNumber} 
                onChangeText={(text) => setFormData({ ...formData, contactNumber: text })} 
              />

              <Text style={styles.label}>Role</Text>
              <View style={styles.roleContainer}>
                {roles.map((role) => (
                  <TouchableOpacity 
                    key={role.value} 
                    style={[styles.roleOption, formData.role === role.value && styles.roleOptionSelected]} 
                    onPress={() => setFormData({ ...formData, role: role.value })}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.roleOptionText, formData.role === role.value && styles.roleOptionTextSelected]}>
                      {role.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Daily Wage / Rate</Text>
              <TextInput 
                placeholderTextColor={colors.textHint}
                style={styles.input} 
                placeholder="Daily Rate (LKR)" 
                keyboardType="numeric" 
                value={formData.dailyRate} 
                onChangeText={(text) => setFormData({ ...formData, dailyRate: text })} 
              />

              {lands.length > 0 && (
                <>
                  <Text style={styles.label}>Assigned Land</Text>
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

              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={[styles.button, styles.cancelButton]} 
                  onPress={() => { setModalVisible(false); setEditingItem(null); resetForm(); }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.button, styles.saveButton]} 
                  onPress={editingItem ? updateLabor : createLabor}
                  activeOpacity={0.8}
                >
                  <Text style={styles.buttonText}>{editingItem ? 'Update' : 'Save'}</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ATTENDANCE HISTORY Modal */}
      <Modal animationType="slide" transparent visible={attendanceModalVisible}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeaderInline}>
              <Text style={styles.modalTitleInline}>{selectedLaborer?.name}&apos;s Attendance</Text>
              <TouchableOpacity onPress={() => setAttendanceModalVisible(false)} activeOpacity={0.7}>
                <Text style={styles.closeIcon}>✕</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.exportBtnInline} onPress={() => exportAttendanceCSV(selectedLaborer)} activeOpacity={0.7}>
              <Text style={styles.exportBtnText}>Export CSV</Text>
            </TouchableOpacity>

            <ScrollView style={styles.historyScroll}>
              {selectedLaborer?.attendance?.sort((a, b) => new Date(b.date) - new Date(a.date)).map((a, idx) => (
                <View key={idx} style={styles.historyRow}>
                  <Text style={styles.historyDate}>{new Date(a.date).toLocaleDateString()}</Text>
                  <View style={[
                    styles.statusTag, 
                    a.status === 'present' ? styles.statusPresent : 
                    a.status === 'half-day' ? styles.statusHalfDay : styles.statusAbsent
                  ]}>
                    <Text style={[
                      styles.statusTagText,
                      a.status === 'present' ? styles.statusPresentText : 
                      a.status === 'half-day' ? styles.statusHalfDayText : styles.statusAbsentText
                    ]}>
                      {a.status.toUpperCase()}
                    </Text>
                  </View>
                </View>
              ))}
              {(!selectedLaborer?.attendance || selectedLaborer.attendance.length === 0) && (
                <Text style={styles.emptyLogText}>No attendance records found.</Text>
              )}
            </ScrollView>

            <TouchableOpacity 
              style={[styles.button, styles.saveButton, { marginTop: spacing.lg }]} 
              onPress={() => setAttendanceModalVisible(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* PAY Modal */}
      <Modal animationType="slide" transparent visible={payModalVisible}>
        <View style={styles.modalContainer}>
          <View style={styles.payModalContent}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Pay {editingItem?.name}</Text>

            <Text style={styles.label}>Payment Amount</Text>
            <TextInput 
              placeholderTextColor={colors.textHint}
              style={styles.input} 
              keyboardType="numeric" 
              placeholder="Amount (LKR)" 
              value={paymentData.amount} 
              onChangeText={(text) => setPaymentData({ ...paymentData, amount: text })} 
            />

            <Text style={styles.label}>Payment Note</Text>
            <TextInput 
              placeholderTextColor={colors.textHint}
              style={styles.input} 
              placeholder="e.g. Cash, Weekly Clearance" 
              value={paymentData.description} 
              onChangeText={(text) => setPaymentData({ ...paymentData, description: text })} 
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.button, styles.cancelButton]} 
                onPress={() => setPayModalVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.button, styles.saveButton]} 
                onPress={submitPayment}
                activeOpacity={0.8}
              >
                <Text style={styles.buttonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
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
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    ...typography.h4,
    color: colors.primary,
  },
  headerInfo: {
    flex: 1,
  },
  name: { 
    ...typography.h4, 
    color: colors.textPrimary,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.xs,
    gap: spacing.xs,
  },
  roleBadge: { 
    backgroundColor: colors.primaryMuted, 
    paddingHorizontal: spacing.sm, 
    paddingVertical: spacing.xs, 
    borderRadius: borderRadius.round,
  },
  roleText: { 
    ...typography.caption,
    color: colors.primary, 
    fontWeight: '600',
  },
  landBadge: {
    backgroundColor: colors.infoLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.round,
  },
  landBadgeText: {
    ...typography.caption,
    color: colors.info,
    fontWeight: '600',
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
  contact: { 
    ...typography.bodySmall, 
    color: colors.textTertiary, 
    marginTop: spacing.sm,
    marginLeft: 60,
  },

  // Finance Metrics
  financeMetrics: { 
    flexDirection: 'row', 
    marginTop: spacing.lg, 
    gap: spacing.sm,
  },
  financeBox: { 
    flex: 1, 
    alignItems: 'center', 
    paddingVertical: spacing.md, 
    backgroundColor: colors.backgroundAlt, 
    borderRadius: borderRadius.md,
  },
  unpaidBox: {
    backgroundColor: colors.errorLight,
  },
  rateText: { 
    ...typography.h4, 
    color: colors.primary,
  },
  unpaidText: {
    color: colors.error,
  },
  rateLabel: { 
    ...typography.caption, 
    color: colors.textTertiary,
    marginTop: spacing.xs,
  },

  // Action Buttons
  actionRow: { 
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  payBtn: { 
    flex: 1, 
    backgroundColor: colors.primary, 
    paddingVertical: spacing.md, 
    borderRadius: borderRadius.md, 
    alignItems: 'center',
    ...shadows.sm,
  },
  payBtnText: { 
    ...typography.button,
    color: colors.white,
  },
  historyBtn: {
    flex: 1,
    backgroundColor: colors.info,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    ...shadows.sm,
  },
  historyBtnText: {
    ...typography.button,
    color: colors.white,
  },

  // Attendance Section
  attendanceSection: { 
    marginTop: spacing.lg, 
    paddingTop: spacing.lg, 
    borderTopWidth: 1, 
    borderTopColor: colors.lightGray,
  },
  attendanceTitle: { 
    ...typography.caption, 
    color: colors.textSecondary, 
    marginBottom: spacing.sm, 
    textAlign: 'center',
    fontWeight: '600',
  },
  attendanceButtons: { 
    flexDirection: 'row', 
    gap: spacing.sm,
  },
  attendanceBtn: { 
    flex: 1, 
    paddingVertical: spacing.sm + 2, 
    borderRadius: borderRadius.sm, 
    alignItems: 'center', 
    borderWidth: 1.5,
  },
  presentBtn: { 
    borderColor: colors.success, 
    backgroundColor: colors.successLight,
  },
  halfDayBtn: { 
    borderColor: colors.warning, 
    backgroundColor: colors.warningLight,
  },
  absentBtn: { 
    borderColor: colors.error, 
    backgroundColor: colors.errorLight,
  },
  activeAttendanceBtn: { 
    borderWidth: 3,
    ...shadows.sm,
  },
  attendanceBtnText: { 
    ...typography.buttonSmall,
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
  payModalContent: { 
    backgroundColor: colors.white, 
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    padding: spacing.xl,
    paddingTop: spacing.md,
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
  roleContainer: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  roleOption: { 
    paddingHorizontal: spacing.md, 
    paddingVertical: spacing.sm, 
    borderRadius: borderRadius.round, 
    backgroundColor: colors.lightGray,
  },
  roleOptionSelected: { 
    backgroundColor: colors.primary,
  },
  roleOptionText: { 
    ...typography.buttonSmall, 
    color: colors.textSecondary,
  },
  roleOptionTextSelected: { 
    color: colors.white,
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

  // History Modal
  modalHeaderInline: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: spacing.lg,
  },
  modalTitleInline: { 
    ...typography.h4, 
    color: colors.textPrimary,
  },
  closeIcon: {
    fontSize: 20,
    color: colors.textTertiary,
    padding: spacing.sm,
  },
  exportBtnInline: { 
    backgroundColor: colors.primary, 
    paddingVertical: spacing.sm + 2, 
    borderRadius: borderRadius.md, 
    marginBottom: spacing.lg, 
    alignItems: 'center',
  },
  exportBtnText: { 
    ...typography.button,
    color: colors.white,
  },
  historyScroll: {
    maxHeight: 400,
  },
  historyRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingVertical: spacing.md, 
    borderBottomWidth: 1, 
    borderBottomColor: colors.lightGray,
  },
  historyDate: { 
    ...typography.body, 
    color: colors.textPrimary,
  },
  statusTag: { 
    paddingHorizontal: spacing.sm, 
    paddingVertical: spacing.xs, 
    borderRadius: borderRadius.xs,
  },
  statusPresent: {
    backgroundColor: colors.successLight,
  },
  statusHalfDay: {
    backgroundColor: colors.warningLight,
  },
  statusAbsent: {
    backgroundColor: colors.errorLight,
  },
  statusTagText: { 
    ...typography.overline,
    fontSize: 10,
  },
  statusPresentText: {
    color: colors.success,
  },
  statusHalfDayText: {
    color: colors.warning,
  },
  statusAbsentText: {
    color: colors.error,
  },
  emptyLogText: { 
    textAlign: 'center', 
    color: colors.textTertiary, 
    marginTop: spacing.xl,
    ...typography.body,
    fontStyle: 'italic',
  },
});
