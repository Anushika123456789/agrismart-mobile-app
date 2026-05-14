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
  Linking,
} from 'react-native';
import { landService } from '../services/api';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, borderRadius, typography, shadows } from '../styles/colors';

export default function LandScreen() {
  const [lands, setLands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    location: '',
    size: { value: '', unit: 'acres' },
    soilType: '',
    soilDetails: { nitrogen: '', phosphorus: '', potassium: '', ph: '' },
    mapLink: '',
  });

  useFocusEffect(
    useCallback(() => {
      fetchLands();
    }, [])
  );

  const fetchLands = async () => {
    try {
      const response = await landService.getAll();
      setLands(response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch lands');
    } finally {
      setLoading(false);
    }
  };

  const isValidMapLink = (link) => {
    if (!link) return true;
    const isCoords = /^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/.test(link.trim());
    const isUrl = /^(http|https):\/\/[^ "]+$/.test(link.trim());
    return isCoords || isUrl;
  };

  const createLand = async () => {
    if (!formData.location.trim()) {
      Alert.alert('Validation Error', 'Please enter a location name for the land plot.');
      return;
    }
    
    const parsedSize = parseFloat(formData.size.value);
    if (isNaN(parsedSize) || parsedSize <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid positive number for land size.');
      return;
    }

    if (formData.mapLink && !isValidMapLink(formData.mapLink)) {
      Alert.alert('Validation Error', 'Please enter a valid map URL (http/https) or valid GPS coordinates (lat,lng).');
      return;
    }
    try {
      const data = {
        location: formData.location.trim(),
        size: { value: parsedSize, unit: 'acres' },
        soilType: formData.soilType.trim() || 'other',
        soilDetails: {
          nitrogen: parseFloat(formData.soilDetails.nitrogen) || 0,
          phosphorus: parseFloat(formData.soilDetails.phosphorus) || 0,
          potassium: parseFloat(formData.soilDetails.potassium) || 0,
          ph: parseFloat(formData.soilDetails.ph) || 7,
        },
        mapLink: formData.mapLink.trim(),
      };
      await landService.create(data);
      Alert.alert('Success', 'Land added successfully');
      setModalVisible(false);
      resetForm();
      fetchLands();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to create land');
    }
  };

  const updateLand = async () => {
    if (!formData.location.trim()) {
      Alert.alert('Validation Error', 'Please enter a location name for the land plot.');
      return;
    }
    
    const parsedSize = parseFloat(formData.size.value);
    if (isNaN(parsedSize) || parsedSize <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid positive number for land size.');
      return;
    }

    if (formData.mapLink && !isValidMapLink(formData.mapLink)) {
      Alert.alert('Validation Error', 'Please enter a valid map URL (http/https) or valid GPS coordinates (lat,lng).');
      return;
    }

    try {
      const data = {
        location: formData.location.trim(),
        size: { value: parsedSize, unit: 'acres' },
        soilType: formData.soilType.trim() || 'other',
        soilDetails: {
          nitrogen: parseFloat(formData.soilDetails.nitrogen) || 0,
          phosphorus: parseFloat(formData.soilDetails.phosphorus) || 0,
          potassium: parseFloat(formData.soilDetails.potassium) || 0,
          ph: parseFloat(formData.soilDetails.ph) || 7,
        },
        mapLink: formData.mapLink.trim(),
      };
      await landService.update(editingItem._id, data);
      Alert.alert('Success', 'Land updated successfully');
      setModalVisible(false);
      setEditingItem(null);
      resetForm();
      fetchLands();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update land');
    }
  };

  const deleteLand = async (id, location) => {
    Alert.alert('Delete Land', `Delete ${location}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await landService.delete(id);
            fetchLands();
          } catch (error) {
            Alert.alert('Error', 'Failed to delete land');
          }
        },
      },
    ]);
  };

  const resetForm = () => {
    setFormData({
      location: '',
      size: { value: '', unit: 'acres' },
      soilType: '',
      soilDetails: { nitrogen: '', phosphorus: '', potassium: '', ph: '' },
      mapLink: '',
    });
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      location: item.location,
      size: { value: item.size?.value?.toString() || '', unit: item.size?.unit || 'acres' },
      soilType: item.soilType || '',
      soilDetails: {
        nitrogen: item.soilDetails?.nitrogen?.toString() || '',
        phosphorus: item.soilDetails?.phosphorus?.toString() || '',
        potassium: item.soilDetails?.potassium?.toString() || '',
        ph: item.soilDetails?.ph?.toString() || '',
      },
      mapLink: item.mapLink || '',
    });
    setModalVisible(true);
  };

  const openMap = (link) => {
    if (!link) return;
    let url = link;
    if (/^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/.test(link.trim())) {
      url = `https://maps.google.com/?q=${link.trim()}`;
    } else if (!link.startsWith('http://') && !link.startsWith('https://')) {
      url = `https://${link}`;
    }
    Linking.openURL(url).catch(err => Alert.alert('Error', 'Could not open map link'));
  };

  const getSoilTypeColor = (type) => {
    const typeMap = {
      clay: { bg: '#8B4513', lightBg: '#f5ebe0' },
      sandy: { bg: '#daa520', lightBg: '#fef9e7' },
      'red soil': { bg: '#cd5c5c', lightBg: '#fbeaea' },
      loamy: { bg: '#6b8e23', lightBg: '#f0f5e4' },
    };
    return typeMap[type?.toLowerCase()] || { bg: colors.soil, lightBg: colors.sand };
  };

  const renderLand = ({ item }) => {
    const soilColor = getSoilTypeColor(item.soilType);
    
    return (
      <View style={styles.card}>
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleSection}>
            <Text style={styles.locationTitle}>{item.location}</Text>
            <View style={styles.sizeChip}>
              <Text style={styles.sizeChipText}>{item.size?.value} {item.size?.unit}</Text>
            </View>
          </View>
          <View style={styles.actionButtons}>
            {item.mapLink ? (
              <TouchableOpacity onPress={() => openMap(item.mapLink)} style={styles.actionBtn} activeOpacity={0.7}>
                <Text style={styles.actionIcon}>📍</Text>
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity onPress={() => openEditModal(item)} style={styles.actionBtn} activeOpacity={0.7}>
              <Text style={styles.actionIcon}>✏️</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => deleteLand(item._id, item.location)} style={[styles.actionBtn, styles.deleteActionBtn]} activeOpacity={0.7}>
              <Text style={styles.actionIcon}>🗑️</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Soil Type Badge */}
        {item.soilType && (
          <View style={[styles.soilTypeBadge, { backgroundColor: soilColor.lightBg }]}>
            <View style={[styles.soilTypeDot, { backgroundColor: soilColor.bg }]} />
            <Text style={[styles.soilTypeText, { color: soilColor.bg }]}>
              {item.soilType.charAt(0).toUpperCase() + item.soilType.slice(1)}
            </Text>
          </View>
        )}

        {/* Soil Nutrients */}
        <View style={styles.nutrientsContainer}>
          <Text style={styles.nutrientsLabel}>Soil Composition</Text>
          <View style={styles.nutrientsGrid}>
            <View style={styles.nutrientItem}>
              <View style={[styles.nutrientIcon, { backgroundColor: colors.successLight }]}>
                <Text style={styles.nutrientIconText}>N</Text>
              </View>
              <Text style={styles.nutrientValue}>{item.soilDetails?.nitrogen || 0}</Text>
              <Text style={styles.nutrientName}>Nitrogen</Text>
            </View>
            <View style={styles.nutrientItem}>
              <View style={[styles.nutrientIcon, { backgroundColor: colors.infoLight }]}>
                <Text style={styles.nutrientIconText}>P</Text>
              </View>
              <Text style={styles.nutrientValue}>{item.soilDetails?.phosphorus || 0}</Text>
              <Text style={styles.nutrientName}>Phosphorus</Text>
            </View>
            <View style={styles.nutrientItem}>
              <View style={[styles.nutrientIcon, { backgroundColor: colors.warningLight }]}>
                <Text style={styles.nutrientIconText}>K</Text>
              </View>
              <Text style={styles.nutrientValue}>{item.soilDetails?.potassium || 0}</Text>
              <Text style={styles.nutrientName}>Potassium</Text>
            </View>
            <View style={styles.nutrientItem}>
              <View style={[styles.nutrientIcon, { backgroundColor: colors.errorLight }]}>
                <Text style={styles.nutrientIconText}>pH</Text>
              </View>
              <Text style={styles.nutrientValue}>{item.soilDetails?.ph || 7}</Text>
              <Text style={styles.nutrientName}>Acidity</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading lands...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Summary Header */}
      <View style={styles.summaryHeader}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{lands.length}</Text>
          <Text style={styles.summaryLabel}>Total Plots</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>
            {lands.reduce((sum, land) => sum + (land.size?.value || 0), 0).toFixed(1)}
          </Text>
          <Text style={styles.summaryLabel}>Total Acres</Text>
        </View>
      </View>

      <FlatList
        data={lands}
        keyExtractor={(item) => item._id}
        renderItem={renderLand}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconBg}>
              <Text style={styles.emptyIcon}>🌾</Text>
            </View>
            <Text style={styles.emptyTitle}>No Lands Added Yet</Text>
            <Text style={styles.emptySubtitle}>Tap + to add your first land plot</Text>
          </View>
        }
      />

      {/* FAB */}
      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => { setEditingItem(null); resetForm(); setModalVisible(true); }}
        activeOpacity={0.8}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      {/* Modal */}
      <Modal animationType="slide" transparent visible={modalVisible}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <ScrollView contentContainerStyle={styles.modalContent} showsVerticalScrollIndicator={false}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{editingItem ? 'Edit Land' : 'Add New Land'}</Text>
                <TouchableOpacity 
                  onPress={() => { setModalVisible(false); setEditingItem(null); resetForm(); }}
                  style={styles.modalCloseBtn}
                >
                  <Text style={styles.modalCloseBtnText}>✕</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.inputLabel}>Location Name</Text>
              <TextInput 
                placeholderTextColor={colors.textHint}
                style={styles.input}
                placeholder="e.g., North Field, Plot A"
                value={formData.location}
                onChangeText={(text) => setFormData({ ...formData, location: text })}
              />

              <Text style={styles.inputLabel}>Map Link or GPS Coordinates</Text>
              <TextInput 
                placeholderTextColor={colors.textHint}
                style={styles.input}
                placeholder="e.g., 6.9271, 79.8612 or Google Maps URL"
                value={formData.mapLink}
                onChangeText={(text) => setFormData({ ...formData, mapLink: text })}
              />

              <Text style={styles.inputLabel}>Size (acres)</Text>
              <TextInput 
                placeholderTextColor={colors.textHint}
                style={styles.input}
                placeholder="Enter land size"
                keyboardType="numeric"
                value={formData.size.value}
                onChangeText={(text) => setFormData({ ...formData, size: { ...formData.size, value: text.replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1') } })}
              />
              
              <Text style={styles.inputLabel}>Soil Type</Text>
              <View style={styles.soilTypeOptions}>
                {['clay', 'sandy', 'red soil', 'loamy', 'other'].map((type) => {
                  const soilColor = getSoilTypeColor(type);
                  const isSelected = formData.soilType.toLowerCase() === type || 
                    (type === 'other' && !['clay', 'sandy', 'red soil', 'loamy'].includes(formData.soilType.toLowerCase()));
                  return (
                    <TouchableOpacity
                      key={type}
                      style={[styles.soilTypeOption, isSelected && { backgroundColor: soilColor.lightBg, borderColor: soilColor.bg }]}
                      onPress={() => setFormData({ ...formData, soilType: type === 'other' ? '' : type })}
                    >
                      <Text style={[styles.soilTypeOptionText, isSelected && { color: soilColor.bg }]}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {formData.soilType === '' || (!['clay', 'sandy', 'red soil', 'loamy'].includes(formData.soilType.toLowerCase()) && formData.soilType !== '') && (
                <TextInput 
                  placeholderTextColor={colors.textHint}
                  style={styles.input}
                  placeholder="Enter custom soil type"
                  value={['clay', 'sandy', 'red soil', 'loamy'].includes(formData.soilType.toLowerCase()) ? '' : formData.soilType}
                  onChangeText={(text) => setFormData({ ...formData, soilType: text })}
                />
              )}

              <Text style={styles.inputLabel}>Soil Nutrients</Text>
              <View style={styles.nutrientInputGrid}>
                <View style={styles.nutrientInputItem}>
                  <Text style={styles.nutrientInputLabel}>N</Text>
                  <TextInput 
                    placeholderTextColor={colors.textHint}
                    style={styles.nutrientInput}
                    placeholder="0"
                    keyboardType="numeric"
                    value={formData.soilDetails.nitrogen}
                    onChangeText={(text) => setFormData({ ...formData, soilDetails: { ...formData.soilDetails, nitrogen: text.replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1') } })}
                  />
                </View>
                <View style={styles.nutrientInputItem}>
                  <Text style={styles.nutrientInputLabel}>P</Text>
                  <TextInput 
                    placeholderTextColor={colors.textHint}
                    style={styles.nutrientInput}
                    placeholder="0"
                    keyboardType="numeric"
                    value={formData.soilDetails.phosphorus}
                    onChangeText={(text) => setFormData({ ...formData, soilDetails: { ...formData.soilDetails, phosphorus: text.replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1') } })}
                  />
                </View>
                <View style={styles.nutrientInputItem}>
                  <Text style={styles.nutrientInputLabel}>K</Text>
                  <TextInput 
                    placeholderTextColor={colors.textHint}
                    style={styles.nutrientInput}
                    placeholder="0"
                    keyboardType="numeric"
                    value={formData.soilDetails.potassium}
                    onChangeText={(text) => setFormData({ ...formData, soilDetails: { ...formData.soilDetails, potassium: text.replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1') } })}
                  />
                </View>
                <View style={styles.nutrientInputItem}>
                  <Text style={styles.nutrientInputLabel}>pH</Text>
                  <TextInput 
                    placeholderTextColor={colors.textHint}
                    style={styles.nutrientInput}
                    placeholder="7"
                    keyboardType="numeric"
                    value={formData.soilDetails.ph}
                    onChangeText={(text) => setFormData({ ...formData, soilDetails: { ...formData.soilDetails, ph: text.replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1') } })}
                  />
                </View>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={[styles.modalBtn, styles.cancelBtn]} 
                  onPress={() => { setModalVisible(false); setEditingItem(null); resetForm(); }}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.modalBtn, styles.saveBtn]} 
                  onPress={editingItem ? updateLand : createLand}
                >
                  <Text style={styles.saveBtnText}>{editingItem ? 'Update' : 'Save'}</Text>
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

  // Summary Header
  summaryHeader: {
    flexDirection: 'row',
    padding: spacing.md,
    backgroundColor: colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: colors.mediumGray,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: colors.primary,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginHorizontal: spacing.xs,
  },
  summaryValue: {
    ...typography.h2,
    color: colors.textLight,
  },
  summaryLabel: {
    ...typography.caption,
    color: colors.primaryLighter,
    marginTop: spacing.xs,
  },

  // List
  listContent: {
    padding: spacing.md,
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
  cardHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  cardTitleSection: {
    flex: 1,
  },
  locationTitle: { 
    ...typography.h4,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  sizeChip: {
    backgroundColor: colors.primaryMuted,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.round,
    alignSelf: 'flex-start',
  },
  sizeChipText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  actionButtons: { 
    flexDirection: 'row',
  },
  actionBtn: { 
    padding: spacing.sm,
    marginLeft: spacing.xs,
    backgroundColor: colors.backgroundAlt,
    borderRadius: borderRadius.sm,
  },
  deleteActionBtn: {
    backgroundColor: colors.errorLight,
  },
  actionIcon: { 
    fontSize: 16,
  },

  // Soil Type Badge
  soilTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.round,
    alignSelf: 'flex-start',
    marginBottom: spacing.md,
  },
  soilTypeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.sm,
  },
  soilTypeText: {
    ...typography.buttonSmall,
  },

  // Nutrients
  nutrientsContainer: {
    backgroundColor: colors.backgroundAlt,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  nutrientsLabel: {
    ...typography.caption,
    color: colors.textTertiary,
    marginBottom: spacing.md,
  },
  nutrientsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nutrientItem: {
    alignItems: 'center',
    flex: 1,
  },
  nutrientIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  nutrientIconText: {
    ...typography.buttonSmall,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  nutrientValue: {
    ...typography.h5,
    color: colors.textPrimary,
  },
  nutrientName: {
    ...typography.caption,
    color: colors.textTertiary,
    fontSize: 10,
  },

  // Empty State
  emptyContainer: { 
    alignItems: 'center', 
    marginTop: 80,
  },
  emptyIconBg: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  emptyIcon: { 
    fontSize: 48,
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
    justifyContent: 'center', 
    backgroundColor: colors.overlay,
  },
  modalContainer: { 
    backgroundColor: colors.cardBackground, 
    margin: spacing.lg, 
    borderRadius: borderRadius.xl,
    maxHeight: '85%',
  },
  modalContent: { 
    padding: spacing.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: { 
    ...typography.h3,
    color: colors.primary,
  },
  modalCloseBtn: {
    padding: spacing.sm,
  },
  modalCloseBtnText: {
    fontSize: 20,
    color: colors.textTertiary,
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

  // Soil Type Options
  soilTypeOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.sm,
  },
  soilTypeOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.round,
    backgroundColor: colors.lightGray,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  soilTypeOptionText: {
    ...typography.buttonSmall,
    color: colors.textSecondary,
  },

  // Nutrient Inputs
  nutrientInputGrid: {
    flexDirection: 'row',
    marginTop: spacing.sm,
  },
  nutrientInputItem: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  nutrientInputLabel: {
    ...typography.caption,
    color: colors.textTertiary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  nutrientInput: {
    borderWidth: 1,
    borderColor: colors.mediumGray,
    backgroundColor: colors.inputBackground,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    textAlign: 'center',
    ...typography.body,
    color: colors.textPrimary,
  },

  // Modal Actions
  modalActions: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginTop: spacing.xl,
  },
  modalBtn: { 
    flex: 1, 
    padding: spacing.lg, 
    borderRadius: borderRadius.md, 
    marginHorizontal: spacing.xs, 
    alignItems: 'center',
  },
  cancelBtn: { 
    backgroundColor: colors.lightGray,
  },
  cancelBtnText: { 
    ...typography.button,
    color: colors.textSecondary,
  },
  saveBtn: { 
    backgroundColor: colors.primary,
  },
  saveBtnText: { 
    ...typography.button,
    color: colors.textLight,
  },
});
