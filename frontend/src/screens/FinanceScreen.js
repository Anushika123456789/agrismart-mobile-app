import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
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
import DateTimePicker from '@react-native-community/datetimepicker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { financeService, landService } from '../services/api';
import { colors, spacing, borderRadius, typography, shadows } from '../styles/colors';

export default function FinanceScreen() {
  const [transactions, setTransactions] = useState([]);
  const [profitLoss, setProfitLoss] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [transactionType, setTransactionType] = useState('expense');
  const [lands, setLands] = useState([]);
  const [activeLandFilter, setActiveLandFilter] = useState('All');
  const [formData, setFormData] = useState({
    type: 'expense',
    category: 'other',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    landId: '',
  });

  const categories = {
    income: ['harvest_sale', 'equipment_sale', 'other_income'],
    expense: ['seed', 'fertilizer', 'labor', 'fuel', 'repair', 'equipment', 'other'],
  };

  const categoryLabels = {
    seed: 'Seed',
    fertilizer: 'Fertilizer',
    labor: 'Labor',
    fuel: 'Fuel',
    repair: 'Repair',
    equipment: 'Equipment',
    harvest_sale: 'Harvest Sale',
    equipment_sale: 'Equipment Sale',
    other_income: 'Other Income',
    other: 'Other',
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const fetchData = async () => {
    try {
      const [transactionsRes, profitLossRes, landRes] = await Promise.all([
        financeService.getTransactions(),
        financeService.getProfitLoss(),
        landService.getAll(),
      ]);
      setTransactions(transactionsRes.data);
      setProfitLoss(profitLossRes.data);
      setLands(landRes.data || []);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch financial data');
    } finally {
      setLoading(false);
    }
  };

  const createTransaction = async () => {
    if (!formData.amount) {
      Alert.alert('Error', 'Please enter amount');
      return;
    }
    try {
      await financeService.createTransaction({
        ...formData,
        amount: parseFloat(formData.amount),
        type: transactionType,
      });
      Alert.alert('Success', 'Transaction added successfully');
      setModalVisible(false);
      resetForm();
      fetchData();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to create transaction');
    }
  };

  const updateTransaction = async () => {
    if (!formData.amount) {
      Alert.alert('Error', 'Please enter amount');
      return;
    }
    try {
      await financeService.updateTransaction(editingItem._id, {
        ...formData,
        amount: parseFloat(formData.amount),
        type: transactionType,
      });
      Alert.alert('Success', 'Transaction updated successfully');
      setModalVisible(false);
      setEditingItem(null);
      resetForm();
      fetchData();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update transaction');
    }
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setTransactionType(item.type);
    setFormData({
      type: item.type,
      category: item.category || 'other',
      amount: item.amount?.toString() || '',
      description: item.description || '',
      date: item.date ? new Date(item.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      landId: item.landId?._id || item.landId || '',
    });
    setModalVisible(true);
  };

  const deleteTransaction = async (id) => {
    Alert.alert('Delete', 'Delete this transaction?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await financeService.deleteTransaction(id);
            fetchData();
          } catch (error) {
            Alert.alert('Error', 'Failed to delete transaction');
          }
        },
      },
    ]);
  };

  const resetForm = () => {
    setFormData({
      type: transactionType,
      category: 'other',
      amount: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      landId: '',
    });
  };

  const exportCSV = async () => {
    try {
      let csvContent = "Date,Type,Category,Description,Amount\n";
      transactions.forEach(t => {
        csvContent += `${new Date(t.date).toISOString().split('T')[0]},${t.type},${t.category},${(t.description || '').replace(',',' ')},${t.amount}\n`;
      });
      
      const fileUri = FileSystem.documentDirectory + "Finance_Export.csv";
      await FileSystem.writeAsStringAsync(fileUri, csvContent, { encoding: FileSystem.EncodingType.UTF8 });
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      } else {
        Alert.alert('Export Failed', 'Sharing operations not supported on this device.');
      }
    } catch(err) {
      Alert.alert('Error', 'Failed to generate CSV');
    }
  };

  const renderTransaction = ({ item }) => (
    <View style={[styles.transactionCard, item.type === 'income' ? styles.incomeCard : styles.expenseCard]}>
      <View style={styles.transactionLeft}>
        <Text style={styles.transactionCategory}>{categoryLabels[item.category] || item.category}</Text>
        {item.description && <Text style={styles.transactionDesc}>{item.description}</Text>}
        <View style={styles.transactionMeta}>
          <Text style={styles.transactionDate}>{new Date(item.date).toLocaleDateString()}</Text>
          {item.landId && (
            <Text style={styles.transactionLand}>{item.landId?.location || 'Assigned'}</Text>
          )}
        </View>
      </View>
      <View style={styles.transactionRight}>
        <Text style={[styles.transactionAmount, item.type === 'income' ? styles.incomeAmount : styles.expenseAmount]}>
          {item.type === 'income' ? '+' : '-'} LKR {item.amount.toLocaleString()}
        </Text>
        <View style={styles.transactionActions}>
          <TouchableOpacity onPress={() => openEditModal(item)} style={styles.actionBtn} activeOpacity={0.7}>
            <Text style={styles.actionIcon}>✏️</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => deleteTransaction(item._id)} style={styles.actionBtn} activeOpacity={0.7}>
            <Text style={styles.actionIcon}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const filteredTransactions = transactions.filter(t => {
    if (activeLandFilter === 'All') return true;
    const tlandId = t.landId?._id || t.landId;
    return tlandId === activeLandFilter;
  });

  const filteredProfitLoss = {
    totalIncome: filteredTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0),
    totalExpense: filteredTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0),
  };
  filteredProfitLoss.netProfit = filteredProfitLoss.totalIncome - filteredProfitLoss.totalExpense;

  const formatAmount = (amount) => {
    if (Math.abs(amount) >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`;
    } else if (Math.abs(amount) >= 1000) {
      return `${(amount / 1000).toFixed(1)}K`;
    }
    return amount.toLocaleString();
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading finances...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Summary Card */}
        {profitLoss && (
          <View style={styles.summaryContainer}>
            <Text style={styles.summaryLabel}>
              {activeLandFilter === 'All' ? 'Farm-wide' : 'Plot'} Net Profit / Loss
            </Text>
            <Text style={[styles.summaryAmount, filteredProfitLoss.netProfit >= 0 ? styles.profit : styles.loss]}>
              LKR {formatAmount(filteredProfitLoss.netProfit)}
            </Text>
            
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryItemLabel}>Income</Text>
                <Text style={styles.incomeText}>LKR {formatAmount(filteredProfitLoss.totalIncome)}</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={styles.summaryItemLabel}>Expenses</Text>
                <Text style={styles.expenseText}>LKR {formatAmount(filteredProfitLoss.totalExpense)}</Text>
              </View>
            </View>

            {/* Progress Bar */}
            {(filteredProfitLoss.totalIncome + filteredProfitLoss.totalExpense) > 0 && (
              <View style={styles.chartWrapper}>
                <View style={[
                  styles.chartBar, 
                  { 
                    backgroundColor: colors.leaf,
                    width: `${(filteredProfitLoss.totalIncome / (filteredProfitLoss.totalIncome + filteredProfitLoss.totalExpense)) * 100}%` 
                  }
                ]} />
                <View style={[
                  styles.chartBar, 
                  { 
                    backgroundColor: '#ffcdd2',
                    width: `${(filteredProfitLoss.totalExpense / (filteredProfitLoss.totalIncome + filteredProfitLoss.totalExpense)) * 100}%` 
                  }
                ]} />
              </View>
            )}
            
            <TouchableOpacity style={styles.exportBtn} onPress={exportCSV} activeOpacity={0.7}>
              <Text style={styles.exportBtnText}>Export CSV</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Filter Section */}
        <View style={styles.filterSection}>
          <Text style={styles.sectionTitle}>Filter by Plot</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterPills}>
            <TouchableOpacity 
              style={[styles.filterPill, activeLandFilter === 'All' && styles.filterPillActive]} 
              onPress={() => setActiveLandFilter('All')}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterPillText, activeLandFilter === 'All' && styles.filterPillTextActive]}>
                All Plots
              </Text>
            </TouchableOpacity>
            {lands.map(l => (
              <TouchableOpacity 
                key={l._id} 
                style={[styles.filterPill, activeLandFilter === l._id && styles.filterPillActive]} 
                onPress={() => setActiveLandFilter(l._id)}
                activeOpacity={0.7}
              >
                <Text style={[styles.filterPillText, activeLandFilter === l._id && styles.filterPillTextActive]}>
                  {l.location}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Transactions List */}
        <Text style={[styles.sectionTitle, { marginTop: spacing.md }]}>Recent Transactions</Text>
        
        <FlatList
          data={filteredTransactions}
          keyExtractor={(item) => item._id}
          renderItem={renderTransaction}
          scrollEnabled={false}
          contentContainerStyle={{ paddingBottom: spacing.lg }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>💰</Text>
              <Text style={styles.emptyTitle}>No Transactions</Text>
              <Text style={styles.emptyText}>Add income or expenses to track your finances</Text>
            </View>
          }
        />
      </ScrollView>

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
            <Text style={styles.modalTitle}>{editingItem ? 'Edit Transaction' : 'Add Transaction'}</Text>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Type Selector */}
              <View style={styles.typeSelector}>
                <TouchableOpacity
                  style={[styles.typeButton, transactionType === 'expense' && styles.typeButtonActive]}
                  onPress={() => { setTransactionType('expense'); setFormData({ ...formData, type: 'expense', category: 'other' }); }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.typeButtonText, transactionType === 'expense' && styles.typeButtonTextActive]}>
                    Expense
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.typeButton, transactionType === 'income' && styles.typeButtonActive]}
                  onPress={() => { setTransactionType('income'); setFormData({ ...formData, type: 'income', category: 'harvest_sale' }); }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.typeButtonText, transactionType === 'income' && styles.typeButtonTextActive]}>
                    Income
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Category</Text>
              <View style={styles.categoryContainer}>
                {categories[transactionType].map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.categoryOption, formData.category === cat && styles.categoryOptionSelected]}
                    onPress={() => setFormData({ ...formData, category: cat })}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.categoryOptionText, formData.category === cat && styles.categoryOptionTextSelected]}>
                      {categoryLabels[cat]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Amount</Text>
              <TextInput
                placeholderTextColor={colors.textHint}
                style={styles.input}
                placeholder="Amount (LKR)"
                keyboardType="numeric"
                value={formData.amount}
                onChangeText={(text) => setFormData({ ...formData, amount: text.replace(/[^0-9.]/g, '') })}
              />

              <Text style={styles.label}>Description</Text>
              <TextInput
                placeholderTextColor={colors.textHint}
                style={styles.input}
                placeholder="Description (optional)"
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
              />

              <Text style={styles.label}>Date</Text>
              <TouchableOpacity 
                onPress={() => setShowDatePicker(true)} 
                style={styles.dateInput}
                activeOpacity={0.7}
              >
                <Text style={formData.date ? styles.dateText : styles.datePlaceholder}>
                  {formData.date || 'Select Date'}
                </Text>
              </TouchableOpacity>

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
                    value={new Date(formData.date || Date.now())}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'inline' : 'default'}
                    themeVariant="light"
                    accentColor={colors.primary}
                    onChange={(event, selectedDate) => {
                      if (Platform.OS === 'android') {
                        setShowDatePicker(false);
                      }
                      if (selectedDate) {
                        setFormData({ ...formData, date: selectedDate.toISOString().split('T')[0] });
                      }
                    }}
                  />
                </View>
              )}

              {lands.length > 0 && (
                <>
                  <Text style={styles.label}>Land Plot</Text>
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
                  onPress={editingItem ? updateTransaction : createTransaction}
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
  
  // Summary Card
  summaryContainer: { 
    backgroundColor: colors.primary, 
    marginHorizontal: spacing.lg, 
    marginTop: spacing.lg,
    padding: spacing.xl, 
    borderRadius: borderRadius.xl, 
    alignItems: 'center',
    ...shadows.lg,
  },
  summaryLabel: { 
    ...typography.caption, 
    color: colors.primaryLighter,
    marginBottom: spacing.xs,
  },
  summaryAmount: { 
    ...typography.display, 
    color: colors.white,
    marginBottom: spacing.lg,
  },
  profit: { 
    color: colors.leafLight,
  },
  loss: { 
    color: '#ffcdd2',
  },
  summaryRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    width: '100%',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  summaryItem: { 
    alignItems: 'center',
    flex: 1,
  },
  summaryDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  summaryItemLabel: { 
    ...typography.caption, 
    color: colors.primaryLighter,
    marginBottom: spacing.xs,
  },
  incomeText: { 
    ...typography.h4, 
    color: colors.leafLight,
  },
  expenseText: { 
    ...typography.h4, 
    color: '#ffcdd2',
  },
  chartWrapper: { 
    flexDirection: 'row', 
    width: '100%', 
    height: 12, 
    borderRadius: 6, 
    overflow: 'hidden', 
    marginTop: spacing.xl,
  },
  chartBar: { 
    height: '100%',
  },
  exportBtn: { 
    marginTop: spacing.lg, 
    paddingHorizontal: spacing.xl, 
    paddingVertical: spacing.sm + 2, 
    backgroundColor: 'rgba(255,255,255,0.2)', 
    borderRadius: borderRadius.round,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  exportBtnText: {
    ...typography.buttonSmall,
    color: colors.white,
  },

  // Section
  sectionTitle: { 
    ...typography.h4, 
    color: colors.textPrimary,
    marginHorizontal: spacing.lg, 
    marginBottom: spacing.sm,
  },
  
  // Filter
  filterSection: { 
    marginTop: spacing.xl,
  },
  filterPills: { 
    paddingHorizontal: spacing.md,
  },
  filterPill: { 
    paddingHorizontal: spacing.md, 
    paddingVertical: spacing.sm, 
    borderRadius: borderRadius.round, 
    backgroundColor: colors.lightGray, 
    marginRight: spacing.sm,
  },
  filterPillActive: { 
    backgroundColor: colors.primary,
  },
  filterPillText: { 
    ...typography.buttonSmall, 
    color: colors.textSecondary,
  },
  filterPillTextActive: { 
    color: colors.white,
  },

  // Transaction Cards
  transactionCard: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    backgroundColor: colors.white, 
    marginHorizontal: spacing.lg, 
    marginVertical: spacing.xs, 
    padding: spacing.lg, 
    borderRadius: borderRadius.md,
    ...shadows.sm,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  incomeCard: { 
    borderLeftWidth: 4, 
    borderLeftColor: colors.success,
  },
  expenseCard: { 
    borderLeftWidth: 4, 
    borderLeftColor: colors.error,
  },
  transactionLeft: { 
    flex: 1,
  },
  transactionCategory: { 
    ...typography.body, 
    color: colors.textPrimary,
    fontWeight: '600',
  },
  transactionDesc: { 
    ...typography.bodySmall, 
    color: colors.textTertiary, 
    marginTop: 2,
  },
  transactionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  transactionDate: { 
    ...typography.caption, 
    color: colors.textHint,
  },
  transactionLand: {
    ...typography.caption,
    color: colors.info,
    marginLeft: spacing.sm,
  },
  transactionRight: { 
    alignItems: 'flex-end',
  },
  transactionAmount: { 
    ...typography.h4,
    marginBottom: spacing.xs,
  },
  incomeAmount: { 
    color: colors.success,
  },
  expenseAmount: { 
    color: colors.error,
  },
  transactionActions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.xs,
    backgroundColor: colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIcon: { 
    fontSize: 14,
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
  
  // Type Selector
  typeSelector: { 
    flexDirection: 'row',
    backgroundColor: colors.lightGray,
    borderRadius: borderRadius.md,
    padding: spacing.xs,
    marginBottom: spacing.lg,
  },
  typeButton: { 
    flex: 1, 
    paddingVertical: spacing.md, 
    alignItems: 'center', 
    borderRadius: borderRadius.sm,
  },
  typeButtonActive: { 
    backgroundColor: colors.white,
    ...shadows.sm,
  },
  typeButtonText: { 
    ...typography.button, 
    color: colors.textTertiary,
  },
  typeButtonTextActive: { 
    color: colors.primary,
  },
  
  // Form
  label: { 
    ...typography.overline, 
    color: colors.primary, 
    marginBottom: spacing.sm, 
    marginTop: spacing.md,
  },
  categoryContainer: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  categoryOption: { 
    paddingHorizontal: spacing.md, 
    paddingVertical: spacing.sm, 
    borderRadius: borderRadius.round, 
    backgroundColor: colors.lightGray,
  },
  categoryOptionSelected: { 
    backgroundColor: colors.primary,
  },
  categoryOptionText: { 
    ...typography.buttonSmall, 
    color: colors.textSecondary,
  },
  categoryOptionTextSelected: { 
    color: colors.white,
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
  
  // Date Picker
  dateInput: { 
    borderWidth: 1.5, 
    borderColor: colors.mediumGray, 
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md + 2, 
    borderRadius: borderRadius.md, 
    marginBottom: spacing.md, 
    backgroundColor: colors.backgroundAlt, 
    justifyContent: 'center',
  },
  dateText: { 
    fontSize: 15, 
    color: colors.textPrimary, 
    fontWeight: '500',
  },
  datePlaceholder: { 
    fontSize: 15, 
    color: colors.textHint,
  },
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
});
