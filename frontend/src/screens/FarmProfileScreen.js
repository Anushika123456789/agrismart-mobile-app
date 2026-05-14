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
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { useFocusEffect } from '@react-navigation/native';
import { landService, authService, inventoryService, machineryService, laborService } from '../services/api';
import { colors, spacing, borderRadius, typography, shadows } from '../styles/colors';

export default function FarmProfileScreen() {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);

  // Profile State
  const [profile, setProfile] = useState({ name: '', email: '', phone: '', profilePicture: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // Lands State
  const [lands, setLands] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [machinery, setMachinery] = useState([]);
  const [laborers, setLaborers] = useState([]);
  const [totalArea, setTotalArea] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  // Land Form State
  const [formData, setFormData] = useState({
    location: '',
    size: { value: '', unit: 'acres' },
    soilDetails: { nitrogen: '', phosphorus: '', potassium: '', ph: '' },
    soilType: 'other',
    status: 'active',
    mapLink: '',
  });

  // Map Picker State
  const [mapPickerVisible, setMapPickerVisible] = useState(false);
  const [pickedLocation, setPickedLocation] = useState(null);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const fetchData = async () => {
    try {
      setLoading(true);
      const [profileRes, landsRes, invRes, macRes, labRes] = await Promise.all([
        authService.getMe(),
        landService.getAll(),
        inventoryService.getAll(),
        machineryService.getAll(),
        laborService.getAll(),
      ]);

      setProfile({
        name: profileRes.data.name || '',
        email: profileRes.data.email || '',
        phone: profileRes.data.phone || '',
        profilePicture: profileRes.data.profilePicture || '',
      });

      const fetchedLands = landsRes.data || [];
      setLands(fetchedLands);
      setInventory(invRes.data || []);
      setMachinery(macRes.data.all || []);
      setLaborers(labRes.data.all || []);

      const total = fetchedLands.reduce((sum, land) => sum + (land.size?.value || 0), 0);
      setTotalArea(total);

    } catch (error) {
      Alert.alert('Error', 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  // Profile Methods
  const updateProfile = async () => {
    try {
      await authService.updateProfile(profile);
      Alert.alert('Success', 'Profile updated successfully');
      fetchData();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update profile');
    }
  };

  const updatePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      Alert.alert('Error', 'Please fill all password fields');
      return;
    }
    try {
      await authService.updatePassword(passwordForm);
      Alert.alert('Success', 'Password updated successfully');
      setShowPasswordModal(false);
      setPasswordForm({ currentPassword: '', newPassword: '' });
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update password');
    }
  };

  // Land Methods
  const createLand = async () => {
    if (!formData.location) {
      Alert.alert('Error', 'Please enter location');
      return;
    }
    try {
      const data = {
        location: formData.location,
        size: { value: parseFloat(formData.size.value) || 0, unit: 'acres' },
        soilDetails: {
          nitrogen: parseFloat(formData.soilDetails.nitrogen) || 0,
          phosphorus: parseFloat(formData.soilDetails.phosphorus) || 0,
          potassium: parseFloat(formData.soilDetails.potassium) || 0,
          ph: parseFloat(formData.soilDetails.ph) || 7,
        },
        soilType: formData.soilType,
        status: formData.status,
        mapLink: formData.mapLink,
      };
      await landService.create(data);
      Alert.alert('Success', 'Land added successfully');
      setModalVisible(false);
      resetForm();
      fetchData();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to create land');
    }
  };

  const updateLand = async () => {
    try {
      const data = {
        location: formData.location,
        size: { value: parseFloat(formData.size.value) || 0, unit: 'acres' },
        soilDetails: {
          nitrogen: parseFloat(formData.soilDetails.nitrogen) || 0,
          phosphorus: parseFloat(formData.soilDetails.phosphorus) || 0,
          potassium: parseFloat(formData.soilDetails.potassium) || 0,
          ph: parseFloat(formData.soilDetails.ph) || 7,
        },
        soilType: formData.soilType,
        status: formData.status,
        mapLink: formData.mapLink,
      };
      await landService.update(editingItem._id, data);
      Alert.alert('Success', 'Land updated successfully');
      setModalVisible(false);
      setEditingItem(null);
      resetForm();
      fetchData();
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
            fetchData();
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
      soilDetails: { nitrogen: '', phosphorus: '', potassium: '', ph: '' },
      soilType: 'other',
      status: 'active',
      mapLink: '',
    });
    setPickedLocation(null);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      location: item.location,
      size: { value: item.size?.value?.toString() || '', unit: item.size?.unit || 'acres' },
      soilDetails: {
        nitrogen: item.soilDetails?.nitrogen?.toString() || '',
        phosphorus: item.soilDetails?.phosphorus?.toString() || '',
        potassium: item.soilDetails?.potassium?.toString() || '',
        ph: item.soilDetails?.ph?.toString() || '',
      },
      soilType: item.soilType || 'other',
      status: item.status || 'active',
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

  const handleMapPick = (event) => {
    setPickedLocation(event.nativeEvent.coordinate);
  };

  const fetchCurrentLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Permission to access location was denied');
        return;
      }

      setLoading(true);
      let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const currentLoc = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      };
      
      setPickedLocation(currentLoc);
      setFormData({ 
        ...formData, 
        mapLink: `${currentLoc.latitude.toFixed(6)}, ${currentLoc.longitude.toFixed(6)}` 
      });
      
    } catch (error) {
      Alert.alert('Error', 'Could not fetch location. Ensure GPS is enabled.');
    } finally {
      setLoading(false);
    }
  };

  const confirmMapPick = () => {
    if (pickedLocation) {
      setFormData({ ...formData, mapLink: `${pickedLocation.latitude}, ${pickedLocation.longitude}` });
    }
    setMapPickerVisible(false);
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'We need camera roll permissions to change the profile picture!');
        return;
      }

      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        
        if (asset.uri && !(asset.uri.toLowerCase().endsWith('.jpg') || asset.uri.toLowerCase().endsWith('.jpeg') || asset.uri.toLowerCase().endsWith('.png') || asset.uri.toLowerCase().endsWith('.webp'))) {
          Alert.alert('Invalid Format', 'Please select a valid image file (JPG, PNG, WEBP).');
          return;
        }

        if (asset.base64) {
          const sizeInBytes = asset.base64.length * 0.75;
          if (sizeInBytes > 1024 * 1024) {
            Alert.alert('File too large', 'Image size must be less than 1MB to keep the database lightweight.');
            return;
          }
          setProfile({ ...profile, profilePicture: `data:image/jpeg;base64,${asset.base64}` });
        } else {
          Alert.alert('Error', 'Failed to process image');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while picking the image');
    }
  };

  const renderProfileTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <View style={styles.statIconBg}>
            <Text style={styles.statIcon}>🌾</Text>
          </View>
          <Text style={styles.statValue}>{lands.length}</Text>
          <Text style={styles.statLabel}>Total Plots</Text>
        </View>
        <View style={styles.statCard}>
          <View style={styles.statIconBg}>
            <Text style={styles.statIcon}>📐</Text>
          </View>
          <Text style={styles.statValue}>{totalArea.toFixed(1)}</Text>
          <Text style={styles.statLabel}>Total Acres</Text>
        </View>
      </View>

      {/* Profile Card */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Edit Profile</Text>
        
        {/* Profile Picture */}
        <View style={styles.profilePicContainer}>
          <TouchableOpacity onPress={pickImage} style={styles.profilePicWrapper} activeOpacity={0.8}>
            {profile.profilePicture ? (
              <Image source={{ uri: profile.profilePicture }} style={styles.profilePic} />
            ) : (
              <View style={styles.profilePicPlaceholder}>
                <Text style={styles.profilePicInitials}>
                  {profile.name ? profile.name.charAt(0).toUpperCase() : 'F'}
                </Text>
              </View>
            )}
            <View style={styles.editIconBadge}>
              <Text style={styles.editIconText}>📷</Text>
            </View>
          </TouchableOpacity>
          <Text style={styles.profilePicHint}>Tap to change photo</Text>
        </View>
        
        <Text style={styles.inputLabel}>Full Name</Text>
        <TextInput 
          placeholderTextColor={colors.textHint}
          style={styles.input}
          placeholder="Enter your name"
          value={profile.name}
          onChangeText={(text) => setProfile({ ...profile, name: text })}
        />
        
        <Text style={styles.inputLabel}>Email Address</Text>
        <TextInput 
          placeholderTextColor={colors.textHint}
          style={styles.input}
          placeholder="Enter your email"
          value={profile.email}
          onChangeText={(text) => setProfile({ ...profile, email: text })}
          keyboardType="email-address"
        />
        
        <Text style={styles.inputLabel}>Phone Number</Text>
        <TextInput 
          placeholderTextColor={colors.textHint}
          style={styles.input}
          placeholder="Enter your phone number"
          value={profile.phone}
          onChangeText={(text) => setProfile({ ...profile, phone: text })}
          keyboardType="phone-pad"
        />
        
        <TouchableOpacity style={styles.saveBtn} onPress={updateProfile} activeOpacity={0.8}>
          <Text style={styles.saveBtnText}>Save Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Change Password Button */}
      <TouchableOpacity style={styles.changePasswordBtn} onPress={() => setShowPasswordModal(true)} activeOpacity={0.8}>
        <Text style={styles.changePasswordIcon}>🔒</Text>
        <Text style={styles.changePasswordText}>Change Password</Text>
      </TouchableOpacity>

      {/* Password Modal */}
      <Modal animationType="slide" transparent visible={showPasswordModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Change Password</Text>
              <TouchableOpacity onPress={() => setShowPasswordModal(false)} style={styles.modalCloseBtn}>
                <Text style={styles.modalCloseBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalContent}>
              <Text style={styles.inputLabel}>Current Password</Text>
              <TextInput 
                placeholderTextColor={colors.textHint}
                style={styles.input}
                placeholder="Enter current password"
                secureTextEntry
                value={passwordForm.currentPassword}
                onChangeText={(text) => setPasswordForm({ ...passwordForm, currentPassword: text })}
              />
              
              <Text style={styles.inputLabel}>New Password</Text>
              <TextInput 
                placeholderTextColor={colors.textHint}
                style={styles.input}
                placeholder="Enter new password"
                secureTextEntry
                value={passwordForm.newPassword}
                onChangeText={(text) => setPasswordForm({ ...passwordForm, newPassword: text })}
              />
              
              <View style={styles.modalActions}>
                <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setShowPasswordModal(false)}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalBtn, styles.primaryBtn]} onPress={updatePassword}>
                  <Text style={styles.primaryBtnText}>Update</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
      
      <View style={{ height: 40 }} />
    </ScrollView>
  );

  const renderLandItem = ({ item }) => (
    <View style={styles.landCard}>
      <View style={styles.landCardHeader}>
        <View style={styles.landCardTitleSection}>
          <Text style={styles.landLocation}>{item.location}</Text>
          <View style={styles.badgeRow}>
            <View style={[styles.statusBadge, { backgroundColor: item.status === 'active' ? colors.successLight : colors.warningLight }]}>
              <Text style={[styles.statusBadgeText, { color: item.status === 'active' ? colors.success : colors.warning }]}>
                {item.status.toUpperCase()}
              </Text>
            </View>
            {item.soilType && item.soilType !== 'other' && (
              <View style={[styles.soilBadge]}>
                <Text style={styles.soilBadgeText}>{item.soilType.toUpperCase()}</Text>
              </View>
            )}
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
          <TouchableOpacity onPress={() => deleteLand(item._id, item.location)} style={[styles.actionBtn, styles.deleteBtn]} activeOpacity={0.7}>
            <Text style={styles.actionIcon}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.landCardInfo}>
        <View style={styles.landInfoItem}>
          <Text style={styles.landInfoIcon}>📐</Text>
          <Text style={styles.landInfoText}>{item.size?.value} {item.size?.unit}</Text>
        </View>
        <View style={styles.landInfoItem}>
          <Text style={styles.landInfoIcon}>🌱</Text>
          <Text style={styles.landInfoText}>
            N:{item.soilDetails?.nitrogen} | P:{item.soilDetails?.phosphorus} | 
            K:{item.soilDetails?.potassium} | pH:{item.soilDetails?.ph}
          </Text>
        </View>
      </View>

      {/* Resource Summary */}
      <View style={styles.resourceSummary}>
        <View style={styles.resourceBadge}>
          <Text style={styles.resourceBadgeText}>📦 {inventory.filter(i => (i.landId?._id || i.landId) === item._id).length} Items</Text>
        </View>
        <View style={styles.resourceBadge}>
          <Text style={styles.resourceBadgeText}>🚜 {machinery.filter(m => (m.landId?._id || m.landId) === item._id).length} Assets</Text>
        </View>
        <View style={styles.resourceBadge}>
          <Text style={styles.resourceBadgeText}>👷 {laborers.filter(l => (l.landId?._id || l.landId) === item._id).length} Workers</Text>
        </View>
      </View>
    </View>
  );

  const renderLandsTab = () => (
    <View style={{ flex: 1 }}>
      <FlatList
        data={lands}
        keyExtractor={(item) => item._id}
        renderItem={renderLandItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconBg}>
              <Text style={styles.emptyIcon}>🌾</Text>
            </View>
            <Text style={styles.emptyTitle}>No Plots Added Yet</Text>
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

      {/* Map Picker Modal */}
      <Modal animationType="slide" visible={mapPickerVisible}>
        <View style={{ flex: 1 }}>
          <MapView
            style={{ flex: 1 }}
            onPress={handleMapPick}
            region={
              pickedLocation 
                ? { latitude: pickedLocation.latitude, longitude: pickedLocation.longitude, latitudeDelta: 0.05, longitudeDelta: 0.05 }
                : { latitude: 6.9271, longitude: 79.8612, latitudeDelta: 0.5, longitudeDelta: 0.5 }
            }
          >
            {pickedLocation && <Marker coordinate={pickedLocation} />}
          </MapView>
          <View style={styles.mapActions}>
            <TouchableOpacity style={[styles.mapBtn, styles.cancelBtn]} onPress={() => setMapPickerVisible(false)}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.mapBtn, { backgroundColor: colors.info }]} onPress={fetchCurrentLocation}>
              <Text style={styles.primaryBtnText}>My Location</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.mapBtn, styles.primaryBtn]} onPress={confirmMapPick}>
              <Text style={styles.primaryBtnText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Edit Land Modal */}
      <Modal animationType="slide" transparent visible={modalVisible}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <ScrollView contentContainerStyle={styles.modalContent} showsVerticalScrollIndicator={false}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{editingItem ? 'Edit Land' : 'Add New Land'}</Text>
                <TouchableOpacity onPress={() => { setModalVisible(false); setEditingItem(null); resetForm(); }} style={styles.modalCloseBtn}>
                  <Text style={styles.modalCloseBtnText}>✕</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.inputLabel}>Location Name</Text>
              <TextInput 
                placeholderTextColor={colors.textHint}
                style={styles.input}
                placeholder="e.g., North Field"
                value={formData.location}
                onChangeText={(text) => setFormData({ ...formData, location: text })}
              />

              <Text style={styles.inputLabel}>GPS Location</Text>
              <View style={styles.gpsInputRow}>
                <TextInput 
                  placeholderTextColor={colors.textHint}
                  style={[styles.input, { flex: 1, marginBottom: 0 }]}
                  placeholder="Map Link or Coordinates"
                  value={formData.mapLink}
                  onChangeText={(text) => setFormData({ ...formData, mapLink: text })}
                />
                <TouchableOpacity style={styles.gpsBtn} onPress={fetchCurrentLocation}>
                  <Text style={styles.gpsBtnText}>📍</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.gpsBtn} onPress={() => setMapPickerVisible(true)}>
                  <Text style={styles.gpsBtnText}>🗺️</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.rowInputs}>
                <View style={{ flex: 1, marginRight: spacing.sm }}>
                  <Text style={styles.inputLabel}>Size (acres)</Text>
                  <TextInput 
                    placeholderTextColor={colors.textHint}
                    style={styles.input}
                    placeholder="0"
                    keyboardType="numeric"
                    value={formData.size.value}
                    onChangeText={(text) => setFormData({ ...formData, size: { ...formData.size, value: text.replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1') } })}
                  />
                </View>
                <View style={{ flex: 1, marginLeft: spacing.sm }}>
                  <Text style={styles.inputLabel}>Status</Text>
                  <View style={styles.statusToggle}>
                    {['active', 'fallow'].map((status) => (
                      <TouchableOpacity
                        key={status}
                        style={[styles.statusToggleBtn, formData.status === status && styles.statusToggleBtnActive]}
                        onPress={() => setFormData({ ...formData, status })}
                      >
                        <Text style={[styles.statusToggleBtnText, formData.status === status && styles.statusToggleBtnTextActive]}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
              
              <Text style={styles.inputLabel}>Soil Type</Text>
              <View style={styles.soilTypeOptions}>
                {['clay', 'sandy', 'red soil', 'other'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[styles.soilTypeOption, formData.soilType === type && styles.soilTypeOptionSelected]}
                    onPress={() => setFormData({ ...formData, soilType: type })}
                  >
                    <Text style={[styles.soilTypeOptionText, formData.soilType === type && styles.soilTypeOptionTextSelected]}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {formData.soilType === 'other' && (
                <TextInput 
                  placeholderTextColor={colors.textHint}
                  style={styles.input}
                  placeholder="Enter custom soil type"
                  onChangeText={(text) => setFormData({ ...formData, soilType: text || 'other' })}
                />
              )}

              <Text style={styles.inputLabel}>Soil Nutrients</Text>
              <View style={styles.nutrientInputs}>
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
                <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={() => { setModalVisible(false); setEditingItem(null); resetForm(); }}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalBtn, styles.primaryBtn]} onPress={editingItem ? updateLand : createLand}>
                  <Text style={styles.primaryBtnText}>{editingItem ? 'Update' : 'Save'}</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Tab Header */}
      <View style={styles.tabHeader}>
        <TouchableOpacity 
          style={[styles.tabBtn, activeTab === 'profile' && styles.tabBtnActive]} 
          onPress={() => setActiveTab('profile')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabBtnText, activeTab === 'profile' && styles.tabBtnTextActive]}>Farmer Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabBtn, activeTab === 'lands' && styles.tabBtnActive]} 
          onPress={() => setActiveTab('lands')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabBtnText, activeTab === 'lands' && styles.tabBtnTextActive]}>Land Plots</Text>
        </TouchableOpacity>
      </View>
      
      {activeTab === 'profile' ? renderProfileTab() : renderLandsTab()}
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

  // Tab Header
  tabHeader: { 
    flexDirection: 'row', 
    backgroundColor: colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: colors.mediumGray,
  },
  tabBtn: { 
    flex: 1, 
    paddingVertical: spacing.lg, 
    alignItems: 'center', 
    borderBottomWidth: 3, 
    borderBottomColor: 'transparent',
  },
  tabBtnActive: { 
    borderBottomColor: colors.primary,
  },
  tabBtnText: { 
    ...typography.button,
    color: colors.textTertiary,
  },
  tabBtnTextActive: { 
    color: colors.primary,
  },

  // Tab Content
  tabContent: { 
    flex: 1,
    padding: spacing.md,
  },

  // Stats Container
  statsContainer: { 
    flexDirection: 'row', 
    marginBottom: spacing.lg,
  },
  statCard: { 
    flex: 1, 
    backgroundColor: colors.cardBackground, 
    padding: spacing.lg, 
    borderRadius: borderRadius.lg, 
    alignItems: 'center', 
    marginHorizontal: spacing.xs,
    ...shadows.sm,
  },
  statIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  statIcon: {
    fontSize: 24,
  },
  statValue: { 
    ...typography.h2,
    color: colors.primary,
  },
  statLabel: { 
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: spacing.xs,
  },

  // Profile Picture
  profilePicContainer: { 
    alignItems: 'center', 
    marginBottom: spacing.lg,
    marginTop: spacing.sm,
  },
  profilePicWrapper: { 
    position: 'relative', 
    width: 100, 
    height: 100,
  },
  profilePic: { 
    width: 100, 
    height: 100, 
    borderRadius: 50, 
    borderWidth: 3, 
    borderColor: colors.primary,
  },
  profilePicPlaceholder: { 
    width: 100, 
    height: 100, 
    borderRadius: 50, 
    backgroundColor: colors.primaryMuted, 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderWidth: 3, 
    borderColor: colors.primary,
  },
  profilePicInitials: { 
    ...typography.display,
    color: colors.primary,
  },
  editIconBadge: { 
    position: 'absolute', 
    bottom: 0, 
    right: 0, 
    backgroundColor: colors.primary, 
    padding: spacing.sm, 
    borderRadius: borderRadius.round, 
    borderWidth: 2, 
    borderColor: colors.cardBackground,
  },
  editIconText: {
    fontSize: 12,
  },
  profilePicHint: {
    ...typography.caption,
    color: colors.textHint,
    marginTop: spacing.sm,
  },

  // Card
  card: { 
    backgroundColor: colors.cardBackground, 
    padding: spacing.lg, 
    borderRadius: borderRadius.lg,
    ...shadows.sm,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
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
    marginBottom: spacing.sm,
  },

  // Save Button
  saveBtn: { 
    backgroundColor: colors.primary, 
    paddingVertical: spacing.lg, 
    borderRadius: borderRadius.md, 
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  saveBtnText: { 
    ...typography.button,
    color: colors.textLight,
  },

  // Change Password Button
  changePasswordBtn: { 
    flexDirection: 'row',
    backgroundColor: colors.cardBackground,
    padding: spacing.lg, 
    borderRadius: borderRadius.md, 
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.error,
  },
  changePasswordIcon: {
    fontSize: 16,
    marginRight: spacing.sm,
  },
  changePasswordText: { 
    ...typography.button,
    color: colors.error,
  },

  // Land Card
  landCard: { 
    backgroundColor: colors.cardBackground, 
    marginBottom: spacing.md, 
    padding: spacing.lg, 
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  landCardHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  landCardTitleSection: {
    flex: 1,
  },
  landLocation: { 
    ...typography.h4,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  badgeRow: { 
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statusBadge: { 
    paddingHorizontal: spacing.sm, 
    paddingVertical: spacing.xs, 
    borderRadius: borderRadius.sm,
    marginRight: spacing.xs,
  },
  statusBadgeText: { 
    ...typography.overline,
    fontSize: 9,
  },
  soilBadge: { 
    backgroundColor: colors.soil,
    paddingHorizontal: spacing.sm, 
    paddingVertical: spacing.xs, 
    borderRadius: borderRadius.sm,
  },
  soilBadgeText: { 
    ...typography.overline,
    fontSize: 9,
    color: colors.textLight,
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
  deleteBtn: {
    backgroundColor: colors.errorLight,
  },
  actionIcon: { 
    fontSize: 14,
  },

  // Land Info
  landCardInfo: {
    marginBottom: spacing.md,
  },
  landInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  landInfoIcon: {
    fontSize: 14,
    marginRight: spacing.sm,
  },
  landInfoText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },

  // Resource Summary
  resourceSummary: { 
    flexDirection: 'row', 
    borderTopWidth: 1, 
    borderTopColor: colors.lightGray, 
    paddingTop: spacing.md,
  },
  resourceBadge: { 
    backgroundColor: colors.backgroundAlt, 
    paddingHorizontal: spacing.sm, 
    paddingVertical: spacing.xs, 
    borderRadius: borderRadius.sm, 
    marginRight: spacing.sm,
  },
  resourceBadgeText: { 
    ...typography.caption,
    color: colors.textSecondary,
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

  // List
  listContent: {
    padding: spacing.md,
    paddingBottom: 100,
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
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
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
  modalContent: { 
    padding: spacing.lg,
  },
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
  primaryBtn: { 
    backgroundColor: colors.primary,
  },
  primaryBtnText: { 
    ...typography.button,
    color: colors.textLight,
  },

  // GPS Input
  gpsInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  gpsBtn: {
    backgroundColor: colors.backgroundAlt,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginLeft: spacing.sm,
  },
  gpsBtnText: {
    fontSize: 18,
  },

  // Row Inputs
  rowInputs: {
    flexDirection: 'row',
  },

  // Status Toggle
  statusToggle: {
    flexDirection: 'row',
    backgroundColor: colors.lightGray,
    borderRadius: borderRadius.md,
    padding: spacing.xs,
  },
  statusToggleBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: borderRadius.sm,
  },
  statusToggleBtnActive: {
    backgroundColor: colors.cardBackground,
    ...shadows.xs,
  },
  statusToggleBtnText: {
    ...typography.buttonSmall,
    color: colors.textTertiary,
  },
  statusToggleBtnTextActive: {
    color: colors.primary,
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
  },
  soilTypeOptionSelected: {
    backgroundColor: colors.primaryMuted,
  },
  soilTypeOptionText: {
    ...typography.buttonSmall,
    color: colors.textSecondary,
  },
  soilTypeOptionTextSelected: {
    color: colors.primary,
  },

  // Nutrient Inputs
  nutrientInputs: {
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

  // Map Actions
  mapActions: { 
    position: 'absolute', 
    bottom: 30, 
    left: spacing.lg, 
    right: spacing.lg, 
    flexDirection: 'row', 
    justifyContent: 'space-between',
  },
  mapBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
});
