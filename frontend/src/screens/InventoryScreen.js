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
import { inventoryService, landService } from '../services/api';
import { colors, spacing, borderRadius, typography, shadows } from '../styles/colors';

export default function InventoryScreen() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [lands, setLands] = useState([]);
  
  // Filtering state
  const [activeFilter, setActiveFilter] = useState('All');
  const filterTabs = ['All', 'Seeds', 'Chemicals', 'Tools & Other'];

  const [formData, setFormData] = useState({
    name: '',
    category: 'fertilizer',
    quantity: '',
    unit: 'kg',
    reorderPoint: '',
    expiryDate: '',
    supplierName: '',
    supplierContact: '',
    landId: '',
  });

  const categories = [
    { label: 'Seed', value: 'seed' },
    { label: 'Fertilizer', value: 'fertilizer' },
    { label: 'Pesticide', value: 'pesticide' },
    { label: 'Herbicide', value: 'herbicide' },
    { label: 'Other', value: 'other' },
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
      const [invRes, landRes] = await Promise.all([
        inventoryService.getAll(),
        landService.getAll()
      ]);
      setItems(invRes.data);
      setLands(landRes.data || []);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch inventory or lands');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert('Validation Error', 'Please enter a valid item name.');
      return false;
    }
    const qty = parseFloat(formData.quantity);
    if (isNaN(qty) || qty < 0) {
      Alert.alert('Validation Error', 'Please enter a valid positive number for quantity.');
      return false;
    }
    const reorder = parseFloat(formData.reorderPoint);
    if (isNaN(reorder) || reorder < 0) {
      Alert.alert('Validation Error', 'Please enter a valid positive number for reorder point.');
      return false;
    }
    return true;
  };

  const createItem = async () => {
    if (!validateForm()) return;
    try {
      await inventoryService.create({
        name: formData.name,
        category: formData.category,
        quantity: parseFloat(formData.quantity) || 0,
        unit: formData.unit,
        reorderPoint: parseFloat(formData.reorderPoint) || 0,
        expiryDate: formData.expiryDate ? new Date(formData.expiryDate) : undefined,
        supplier: {
          name: formData.supplierName,
          contact: formData.supplierContact,
        },
        landId: formData.landId || undefined
      });
      Alert.alert('Success', 'Item added successfully');
      setModalVisible(false);
      resetForm();
      fetchData();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to create item');
    }
  };

  const updateItem = async () => {
    if (!validateForm()) return;
    try {
      await inventoryService.update(editingItem._id, {
        name: formData.name,
        category: formData.category,
        quantity: parseFloat(formData.quantity) || 0,
        unit: formData.unit,
        reorderPoint: parseFloat(formData.reorderPoint) || 0,
        expiryDate: formData.expiryDate ? new Date(formData.expiryDate) : undefined,
        supplier: {
          name: formData.supplierName,
          contact: formData.supplierContact,
        },
        landId: formData.landId || undefined
      });
      Alert.alert('Success', 'Item updated successfully');
      setModalVisible(false);
      setEditingItem(null);
      resetForm();
      fetchData();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update item');
    }
  };

  const deleteItem = async (id, name) => {
    Alert.alert('Delete Item', `Delete ${name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await inventoryService.delete(id);
            fetchData();
          } catch (error) {
            Alert.alert('Error', 'Failed to delete item');
          }
        },
      },
    ]);
  };

  const updateQuantity = async (id, currentQuantity, change) => {
    const newQuantity = currentQuantity + change;
    try {
      await inventoryService.update(id, { quantity: newQuantity });
      fetchData();
    } catch (error) {
      Alert.alert('Error', 'Failed to update quantity');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'fertilizer',
      quantity: '',
      unit: 'kg',
      reorderPoint: '',
      expiryDate: '',
      supplierName: '',
      supplierContact: '',
      landId: '',
    });
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      quantity: item.quantity?.toString() || '0',
      unit: item.unit || 'kg',
      reorderPoint: item.reorderPoint?.toString() || '0',
      expiryDate: item.expiryDate ? item.expiryDate.split('T')[0] : '',
      supplierName: item.supplier?.name || '',
      supplierContact: item.supplier?.contact || '',
      landId: item.landId?._id || item.landId || '',
    });
    setModalVisible(true);
  };

  const getCategoryColor = (category) => {
    const colorMap = { 
      seed: colors.leaf, 
      fertilizer: colors.info, 
      pesticide: colors.error, 
      herbicide: colors.accent, 
      other: colors.secondary 
    };
    return colorMap[category] || colors.gray;
  };

  const filteredItems = items.filter(item => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Seeds' && item.category === 'seed') return true;
    if (activeFilter === 'Chemicals' && ['fertilizer', 'pesticide', 'herbicide'].includes(item.category)) return true;
    if (activeFilter === 'Tools & Other' && item.category === 'other') return true;
    return false;
  });

  const renderItem = ({ item }) => {
    const isLowStock = item.quantity <= item.reorderPoint;
    const isExpired = item.expiryDate && new Date(item.expiryDate) < new Date();

    return (
      <View style={[styles.card, isLowStock && styles.lowStockCard]}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <Text style={styles.itemName}>{item.name}</Text>
            <View style={styles.badgeRow}>
              <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(item.category) }]}>
                <Text style={styles.categoryText}>{item.category.toUpperCase()}</Text>
              </View>
              {isExpired && (
                <View style={[styles.categoryBadge, { backgroundColor: colors.error }]}>
                  <Text style={styles.categoryText}>EXPIRED</Text>
                </View>
              )}
              {item.landId && (
                <View style={[styles.categoryBadge, { backgroundColor: colors.infoLight }]}>
                  <Text style={[styles.categoryText, { color: colors.info }]}>
                    {item.landId?.location || 'Assigned'}
                  </Text>
                </View>
              )}
            </View>
          </View>
          <View style={styles.cardActions}>
            <TouchableOpacity onPress={() => openEditModal(item)} style={styles.actionButton} activeOpacity={0.7}>
              <Text style={styles.actionText}>✏️</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => deleteItem(item._id, item.name)} style={styles.actionButton} activeOpacity={0.7}>
              <Text style={styles.actionText}>🗑️</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.quantitySection}>
          <TouchableOpacity 
            style={styles.quantityButton} 
            onPress={() => updateQuantity(item._id, item.quantity, -1)}
            activeOpacity={0.7}
          >
            <Text style={styles.quantityButtonText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.quantityText}>{item.quantity} {item.unit}</Text>
          <TouchableOpacity 
            style={styles.quantityButton} 
            onPress={() => updateQuantity(item._id, item.quantity, 1)}
            activeOpacity={0.7}
          >
            <Text style={styles.quantityButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.trackingDetails}>
          <Text style={styles.detailText}>Reorder at: {item.reorderPoint} {item.unit}</Text>
          {item.supplier?.name && (
            <Text style={styles.detailText}>Supplier: {item.supplier.name}</Text>
          )}
          {item.expiryDate && (
            <Text style={styles.detailText}>Expires: {new Date(item.expiryDate).toLocaleDateString()}</Text>
          )}
        </View>

        {isLowStock && (
          <View style={styles.lowStockAlertContainer}>
            <Text style={styles.lowStockAlert}>Low Stock - Reorder Soon</Text>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading inventory...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      
      {/* Filter Bar */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {filterTabs.map((tab) => (
            <TouchableOpacity 
              key={tab} 
              style={[styles.filterBtn, activeFilter === tab && styles.filterBtnActive]}
              onPress={() => setActiveFilter(tab)}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterText, activeFilter === tab && styles.filterTextActive]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 100, paddingTop: spacing.sm }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyTitle}>No Items Found</Text>
            <Text style={styles.emptyText}>Add inventory items using the + button below</Text>
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
            <Text style={styles.modalTitle}>{editingItem ? 'Edit Item' : 'Add Inventory Item'}</Text>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>Item Details</Text>
              <TextInput 
                placeholderTextColor={colors.textHint}
                style={styles.input} 
                placeholder="Item Name" 
                value={formData.name} 
                onChangeText={(text) => setFormData({ ...formData, name: text })} 
              />

              <View style={styles.categoryContainer}>
                {categories.map((cat) => (
                  <TouchableOpacity 
                    key={cat.value} 
                    style={[styles.categoryOption, formData.category === cat.value && styles.categoryOptionSelected]} 
                    onPress={() => setFormData({ ...formData, category: cat.value })}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.categoryOptionText, formData.category === cat.value && styles.categoryOptionTextSelected]}>
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.row}>
                <TextInput 
                  placeholderTextColor={colors.textHint}
                  style={[styles.input, { flex: 1, marginRight: spacing.sm }]} 
                  placeholder="Quantity" 
                  keyboardType="numeric" 
                  value={formData.quantity.toString()} 
                  onChangeText={(text) => setFormData({ ...formData, quantity: text.replace(/[^0-9.]/g, '') })} 
                />
                <TextInput 
                  placeholderTextColor={colors.textHint}
                  style={[styles.input, { flex: 1 }]} 
                  placeholder="Unit (kg, L)" 
                  value={formData.unit} 
                  onChangeText={(text) => setFormData({ ...formData, unit: text })} 
                />
              </View>

              <Text style={styles.label}>Stock Management</Text>
              <TextInput 
                placeholderTextColor={colors.textHint}
                style={styles.input} 
                placeholder="Low Stock Alert Point" 
                keyboardType="numeric" 
                value={formData.reorderPoint.toString()} 
                onChangeText={(text) => setFormData({ ...formData, reorderPoint: text.replace(/[^0-9.]/g, '') })} 
              />
              
              <TouchableOpacity style={styles.dateInput} onPress={() => setShowDatePicker(true)} activeOpacity={0.7}>
                <Text style={formData.expiryDate ? styles.dateText : styles.datePlaceholder}>
                  {formData.expiryDate ? formData.expiryDate : 'Expiry Date (Optional)'}
                </Text>
              </TouchableOpacity>
              
              {showDatePicker && (
                <View style={styles.datePickerContainer}>
                  <View style={styles.datePickerHeader}>
                    <Text style={styles.datePickerTitle}>Select Expiry Date</Text>
                    <TouchableOpacity 
                      onPress={() => setShowDatePicker(false)} 
                      style={styles.datePickerDoneBtn}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.datePickerDoneText}>Done</Text>
                    </TouchableOpacity>
                  </View>
                  <DateTimePicker
                    value={formData.expiryDate ? new Date(formData.expiryDate) : new Date()}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'inline' : 'default'}
                    style={{ height: Platform.OS === 'ios' ? 320 : undefined }}
                    themeVariant="light"
                    accentColor={colors.primary}
                    onChange={(e, val) => {
                      if (Platform.OS === 'android') {
                        setShowDatePicker(false);
                      }
                      if (val) {
                        setFormData({ ...formData, expiryDate: val.toISOString().split('T')[0] });
                      }
                    }}
                  />
                </View>
              )}

              <Text style={styles.label}>Supplier Details</Text>
              <TextInput 
                placeholderTextColor={colors.textHint}
                style={styles.input} 
                placeholder="Supplier Name" 
                value={formData.supplierName} 
                onChangeText={(text) => setFormData({ ...formData, supplierName: text })} 
              />
              <TextInput 
                placeholderTextColor={colors.textHint}
                style={styles.input} 
                placeholder="Supplier Contact" 
                value={formData.supplierContact} 
                onChangeText={(text) => setFormData({ ...formData, supplierContact: text })} 
                keyboardType="phone-pad" 
              />

              {lands.length > 0 && (
                <>
                  <Text style={styles.label}>Storage Location</Text>
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
                  onPress={editingItem ? updateItem : createItem}
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
    backgroundColor: colors.background 
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
  
  // Filter Bar
  filterContainer: { 
    backgroundColor: colors.white, 
    paddingVertical: spacing.md, 
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  filterBtn: { 
    paddingHorizontal: spacing.lg, 
    paddingVertical: spacing.sm + 2, 
    borderRadius: borderRadius.round, 
    backgroundColor: colors.lightGray, 
    marginHorizontal: spacing.xs,
  },
  filterBtnActive: { 
    backgroundColor: colors.primary,
  },
  filterText: { 
    ...typography.buttonSmall, 
    color: colors.textSecondary,
  },
  filterTextActive: { 
    color: colors.white,
  },
  
  // Cards
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
  lowStockCard: { 
    borderWidth: 2, 
    borderColor: colors.error, 
    backgroundColor: colors.errorLight,
  },
  cardHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start',
  },
  cardHeaderLeft: {
    flex: 1,
  },
  itemName: { 
    ...typography.h4, 
    color: colors.textPrimary,
  },
  badgeRow: { 
    flexDirection: 'row', 
    flexWrap: 'wrap',
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  categoryBadge: { 
    paddingHorizontal: spacing.sm + 2, 
    paddingVertical: spacing.xs, 
    borderRadius: borderRadius.round,
  },
  categoryText: { 
    ...typography.overline, 
    color: colors.white, 
    fontSize: 9,
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
  
  // Quantity Section
  quantitySection: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.backgroundAlt,
    borderRadius: borderRadius.md,
  },
  quantityButton: { 
    backgroundColor: colors.white, 
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    justifyContent: 'center', 
    alignItems: 'center',
    ...shadows.sm,
  },
  quantityButtonText: { 
    ...typography.h3, 
    color: colors.textPrimary,
  },
  quantityText: { 
    ...typography.h3, 
    marginHorizontal: spacing.xxl, 
    color: colors.primary,
  },
  
  // Tracking Details
  trackingDetails: { 
    marginTop: spacing.md, 
    paddingTop: spacing.md, 
    borderTopWidth: 1, 
    borderTopColor: colors.lightGray,
  },
  detailText: { 
    ...typography.bodySmall, 
    color: colors.textTertiary, 
    marginBottom: spacing.xs,
  },
  
  // Alerts
  lowStockAlertContainer: {
    marginTop: spacing.md,
    backgroundColor: 'rgba(231, 76, 60, 0.1)',
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
  },
  lowStockAlert: { 
    ...typography.buttonSmall, 
    color: colors.error, 
    textAlign: 'center',
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
  label: { 
    ...typography.overline, 
    color: colors.primary, 
    marginTop: spacing.md, 
    marginBottom: spacing.sm,
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
  row: { 
    flexDirection: 'row',
  },
  categoryContainer: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    marginBottom: spacing.md,
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
