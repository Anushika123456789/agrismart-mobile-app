import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Image,
  StatusBar,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { financeService, authService } from '../services/api';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, borderRadius, shadows } from '../styles/colors';
import { dashboardStyles as styles } from '../styles/screens';

export default function DashboardScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [financeSummary, setFinanceSummary] = useState({ totalIncome: 0, totalExpense: 0, netProfit: 0 });
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadUser();
    }, [])
  );

  const loadUser = async () => {
    try {
      const res = await authService.getMe();
      setUser(res.data);
      await AsyncStorage.setItem('user', JSON.stringify(res.data));
    } catch (err) {
      const userData = await AsyncStorage.getItem('user');
      if (userData) setUser(JSON.parse(userData));
    }
    fetchDashboardMetrics();
  };

  const fetchDashboardMetrics = async () => {
    try {
      const plRes = await financeService.getProfitLoss();
      setFinanceSummary(plRes.data);
    } catch (error) {
      console.log('Failed to fetch dashboard metrics');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUser();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        onPress: async () => {
          await AsyncStorage.removeItem('token');
          await AsyncStorage.removeItem('user');
          navigation.replace('Login');
        },
      },
    ]);
  };

  const modules = [
    { 
      name: 'Farm Profile', 
      screen: 'Farm', 
      icon: '🌾', 
      color: colors.leaf,
      description: 'Lands & Details' 
    },
    { 
      name: 'Inventory', 
      screen: 'Inventory', 
      icon: '📦', 
      color: colors.info,
      description: 'Stock Management' 
    },
    { 
      name: 'Machinery', 
      screen: 'Machinery', 
      icon: '🚜', 
      color: colors.accent,
      description: 'Equipment' 
    },
    { 
      name: 'Tasks', 
      screen: 'Tasks', 
      icon: '📋', 
      color: colors.secondary,
      description: 'Work Schedule' 
    },
    { 
      name: 'Finance', 
      screen: 'Finance', 
      icon: '💰', 
      color: colors.primary,
      description: 'Income & Expense' 
    },
    { 
      name: 'Labor', 
      screen: 'Labor', 
      icon: '👥', 
      color: colors.leafDark,
      description: 'Workforce' 
    },
  ];

  const formatCurrency = (value) => {
    const num = value || 0;
    if (Math.abs(num) >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (Math.abs(num) >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toLocaleString();
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              {user?.profilePicture ? (
                <Image source={{ uri: user.profilePicture }} style={styles.profilePic} />
              ) : (
                <View style={styles.profilePicPlaceholder}>
                  <Text style={styles.profileInitials}>
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'F'}
                  </Text>
                </View>
              )}
              <View style={{ marginLeft: spacing.md }}>
                <Text style={styles.welcome}>Welcome back,</Text>
                <Text style={styles.userName}>{user?.name || 'Farmer'}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={handleLogout} style={styles.logoutButton} activeOpacity={0.7}>
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: colors.successLight }]}>
              <Text style={styles.statIcon}>📈</Text>
            </View>
            <Text style={[styles.statNumber, { color: colors.success }]}>
              LKR {formatCurrency(financeSummary.totalIncome)}
            </Text>
            <Text style={styles.statLabel}>Revenue</Text>
          </View>
          
          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: colors.errorLight }]}>
              <Text style={styles.statIcon}>📉</Text>
            </View>
            <Text style={[styles.statNumber, { color: colors.error }]}>
              LKR {formatCurrency(financeSummary.totalExpense)}
            </Text>
            <Text style={styles.statLabel}>Expenses</Text>
          </View>
          
          <View style={styles.statCard}>
            <View style={[
              styles.statIconContainer, 
              { backgroundColor: (financeSummary.netProfit || 0) >= 0 ? colors.primaryMuted : colors.errorLight }
            ]}>
              <Text style={styles.statIcon}>{(financeSummary.netProfit || 0) >= 0 ? '✨' : '⚠️'}</Text>
            </View>
            <Text style={[
              styles.statNumber, 
              { 
                color: (financeSummary.netProfit || 0) >= 0 ? colors.primary : colors.error,
                fontSize: 16 
              }
            ]}>
              LKR {formatCurrency(financeSummary.netProfit)}
            </Text>
            <Text style={styles.statLabel}>Net Profit</Text>
          </View>
        </View>

        {/* Section Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Farm Management</Text>
        </View>

        {/* Module Grid */}
        <View style={styles.modulesGrid}>
          {modules.map((module, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.moduleCard, { backgroundColor: module.color }]}
              onPress={() => navigation.navigate(module.screen)}
              activeOpacity={0.8}
            >
              <View style={styles.moduleIconContainer}>
                <Text style={styles.moduleIcon}>{module.icon}</Text>
              </View>
              <Text style={styles.moduleName}>{module.name}</Text>
              <Text style={styles.moduleDesc}>{module.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
