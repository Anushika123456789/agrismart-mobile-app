import { StyleSheet, Platform } from 'react-native';
import { colors, spacing, borderRadius, typography, shadows } from './colors';

// Dashboard Screen Styles
export const dashboardStyles = StyleSheet.create({
  header: {
    backgroundColor: colors.primary,
    paddingTop: Platform.OS === 'ios' ? 56 : 48,
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.xl,
    borderBottomLeftRadius: borderRadius.xxl + 8,
    borderBottomRightRadius: borderRadius.xxl + 8,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  welcome: {
    ...typography.bodySmall,
    color: colors.primaryLighter,
    opacity: 0.9,
  },
  userName: {
    ...typography.h3,
    color: colors.white,
    marginTop: 2,
  },
  profilePic: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  profilePicPlaceholder: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  profileInitials: {
    ...typography.h4,
    color: colors.white,
  },
  logoutButton: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  logoutText: {
    ...typography.buttonSmall,
    color: colors.white,
  },
  
  // Stats Section
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    ...shadows.md,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  statIcon: {
    fontSize: 20,
  },
  statNumber: {
    ...typography.h4,
    color: colors.primary,
    textAlign: 'center',
  },
  statLabel: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  
  // Section
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.textPrimary,
  },
  sectionLink: {
    ...typography.buttonSmall,
    color: colors.primary,
  },
  
  // Modules Grid
  modulesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xxl,
  },
  moduleCard: {
    width: '31%',
    aspectRatio: 0.95,
    margin: '1%',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
    overflow: 'hidden',
  },
  moduleIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  moduleIcon: {
    fontSize: 26,
  },
  moduleName: {
    ...typography.buttonSmall,
    color: colors.white,
    textAlign: 'center',
    marginBottom: 2,
  },
  moduleDesc: {
    ...typography.caption,
    color: colors.white,
    textAlign: 'center',
    opacity: 0.85,
    fontSize: 10,
  },
});

// Land Screen Styles
export const landStyles = StyleSheet.create({
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
  location: {
    ...typography.h4,
    color: colors.textPrimary,
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
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
  detailsContainer: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  detailIcon: {
    fontSize: 14,
    marginRight: spacing.sm,
  },
  detailText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  sizeText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  soilBadge: {
    backgroundColor: colors.soil,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.round,
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
  },
  soilText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '600',
  },
  sectionLabel: {
    ...typography.overline,
    color: colors.primary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
});

// Inventory Screen Styles
export const inventoryStyles = StyleSheet.create({
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
  itemName: {
    ...typography.h4,
    color: colors.textPrimary,
    flex: 1,
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
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  quantityButtonText: {
    ...typography.h4,
    color: colors.textPrimary,
  },
  quantityText: {
    ...typography.h3,
    marginHorizontal: spacing.xxl,
    color: colors.primary,
  },
  
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
  
  lowStockAlert: {
    ...typography.buttonSmall,
    color: colors.error,
    marginTop: spacing.md,
    textAlign: 'center',
    padding: spacing.sm,
    backgroundColor: 'rgba(231, 76, 60, 0.1)',
    borderRadius: borderRadius.sm,
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
});

// Task Screen Styles
export const taskStyles = StyleSheet.create({
  filterContainer: {
    backgroundColor: colors.white,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  filterSection: {
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.sm,
  },
  filterLabel: {
    ...typography.caption,
    color: colors.textTertiary,
    marginLeft: spacing.sm,
    marginBottom: spacing.xs,
  },
  filterBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
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
  overdueCard: {
    borderWidth: 2,
    borderColor: colors.error,
    backgroundColor: colors.errorLight,
  },
  
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  taskTitle: {
    ...typography.h4,
    color: colors.textPrimary,
    flex: 1,
    marginRight: spacing.sm,
  },
  taskHeaderRight: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  
  priorityBadge: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.xs,
  },
  priorityText: {
    ...typography.overline,
    color: colors.white,
    fontSize: 9,
  },
  
  statusBadge: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.xs,
  },
  statusText: {
    ...typography.overline,
    fontSize: 9,
  },
  
  taskDesc: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  
  metaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  metaBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundAlt,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.sm,
  },
  metaIcon: {
    fontSize: 12,
    marginRight: spacing.xs,
  },
  metaText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  
  progressSection: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
  },
  progressLabel: {
    ...typography.caption,
    color: colors.textTertiary,
    marginBottom: spacing.sm,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: colors.lightGray,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  
  cardActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primary,
  },
  actionBtnOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    borderWidth: 1.5,
    borderColor: colors.mediumGray,
    backgroundColor: colors.white,
  },
  actionBtnText: {
    ...typography.buttonSmall,
    color: colors.white,
  },
  actionBtnOutlineText: {
    ...typography.buttonSmall,
    color: colors.textSecondary,
  },
  
  overdueBadge: {
    ...typography.buttonSmall,
    color: colors.error,
    backgroundColor: 'rgba(231, 76, 60, 0.1)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.xs,
    alignSelf: 'flex-start',
    marginBottom: spacing.sm,
  },
  
  notesBox: {
    backgroundColor: colors.warningLight,
    padding: spacing.md,
    borderRadius: borderRadius.sm,
    marginTop: spacing.md,
  },
  notesTitle: {
    ...typography.caption,
    color: colors.warning,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  notesText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  
  materialsBox: {
    backgroundColor: colors.infoLight,
    padding: spacing.md,
    borderRadius: borderRadius.sm,
    marginTop: spacing.sm,
  },
  materialsHeader: {
    ...typography.caption,
    color: colors.info,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  materialItemText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
});

// Finance Screen Styles
export const financeStyles = StyleSheet.create({
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
  },
  summaryItemLabel: {
    ...typography.caption,
    color: colors.primaryLighter,
    marginBottom: spacing.xs,
  },
  summaryItemValue: {
    ...typography.h4,
  },
  incomeText: {
    color: colors.leafLight,
  },
  expenseText: {
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
  
  filterSection: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.textPrimary,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
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
  transactionDate: {
    ...typography.caption,
    color: colors.textHint,
    marginTop: spacing.xs,
  },
  transactionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  transactionAmount: {
    ...typography.h4,
  },
  incomeAmount: {
    color: colors.success,
  },
  expenseAmount: {
    color: colors.error,
  },
  actionIcon: {
    fontSize: 18,
    padding: spacing.xs,
  },
  
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
});

// Labor Screen Styles
export const laborStyles = StyleSheet.create({
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
    alignItems: 'center',
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
  laborInfo: {
    flex: 1,
  },
  laborName: {
    ...typography.h4,
    color: colors.textPrimary,
  },
  laborRole: {
    ...typography.bodySmall,
    color: colors.secondary,
    marginTop: 2,
  },
  laborRate: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
  
  attendanceSection: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
  },
  attendanceStatus: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  attendancePresent: {
    color: colors.success,
    fontWeight: '600',
  },
  attendanceAbsent: {
    color: colors.error,
    fontWeight: '600',
  },
  attendanceButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  attendanceButton: {
    flex: 1,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
  },
  presentButton: {
    backgroundColor: colors.success,
  },
  absentButton: {
    backgroundColor: colors.error,
  },
  attendanceButtonText: {
    ...typography.buttonSmall,
    color: colors.white,
  },
});

// Machinery Screen Styles
export const machineryStyles = StyleSheet.create({
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
  machineryInfo: {
    flex: 1,
  },
  machineryName: {
    ...typography.h4,
    color: colors.textPrimary,
  },
  machineryModel: {
    ...typography.bodySmall,
    color: colors.textTertiary,
    marginTop: 2,
  },
  
  statusBadge: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.xs,
  },
  statusAvailable: {
    backgroundColor: colors.successLight,
  },
  statusRepair: {
    backgroundColor: colors.warningLight,
  },
  statusDecommissioned: {
    backgroundColor: colors.lightGray,
  },
  statusText: {
    ...typography.overline,
    fontSize: 9,
  },
  statusTextAvailable: {
    color: colors.success,
  },
  statusTextRepair: {
    color: colors.warning,
  },
  statusTextDecommissioned: {
    color: colors.textTertiary,
  },
  
  detailsSection: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  detailIcon: {
    fontSize: 14,
    marginRight: spacing.sm,
    width: 20,
  },
  detailText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  
  maintenanceButton: {
    backgroundColor: colors.secondary,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  maintenanceButtonText: {
    ...typography.buttonSmall,
    color: colors.white,
  },
});

// Common Screen Styles
export const commonScreenStyles = StyleSheet.create({
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
  
  // Modern Modal
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
  
  // Form Elements
  label: {
    ...typography.overline,
    color: colors.primary,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  input: {
    backgroundColor: colors.inputBackground,
    borderWidth: 1.5,
    borderColor: colors.mediumGray,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md + 2,
    fontSize: 15,
    color: colors.textPrimary,
    fontWeight: '500',
    marginBottom: spacing.md,
  },
  inputRow: {
    flexDirection: 'row',
    gap: spacing.sm,
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
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  emptyText: {
    ...typography.body,
    color: colors.textTertiary,
    textAlign: 'center',
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
});
