import { StyleSheet, Platform } from 'react-native';
import { colors, spacing, borderRadius, typography, shadows } from './colors';

export const globalStyles = StyleSheet.create({
  // Container Styles
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  containerWhite: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: spacing.lg,
  },
  safeArea: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  
  // Modern Header Styles
  header: {
    backgroundColor: colors.primary,
    paddingTop: Platform.OS === 'ios' ? 56 : 48,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.xl,
    borderBottomLeftRadius: borderRadius.xxl,
    borderBottomRightRadius: borderRadius.xxl,
  },
  headerFlat: {
    backgroundColor: colors.primary,
    paddingTop: Platform.OS === 'ios' ? 56 : 48,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.textLight,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    ...typography.bodySmall,
    color: colors.primaryLighter,
    opacity: 0.9,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  // Modern Card Styles
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.sm,
    ...shadows.md,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  cardCompact: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.xs,
    ...shadows.sm,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  cardElevated: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.sm,
    ...shadows.lg,
    borderWidth: 0,
  },
  cardInteractive: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.sm,
    ...shadows.sm,
    borderWidth: 1.5,
    borderColor: colors.mediumGray,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  cardDivider: {
    height: 1,
    backgroundColor: colors.lightGray,
    marginVertical: spacing.md,
  },
  
  // Modern Input Styles
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
  inputFocused: {
    borderColor: colors.primary,
    borderWidth: 2,
    backgroundColor: colors.inputBackgroundFocused,
  },
  inputError: {
    borderColor: colors.error,
    borderWidth: 1.5,
    backgroundColor: colors.errorLight,
  },
  inputLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    fontWeight: '600',
  },
  inputHelper: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
  },
  
  // Modern Button Styles
  buttonPrimary: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.xxl,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    ...shadows.sm,
  },
  buttonPrimaryLarge: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxl,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
  buttonPrimaryText: {
    ...typography.button,
    color: colors.textLight,
  },
  buttonSecondary: {
    backgroundColor: colors.secondary,
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.xxl,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    ...shadows.sm,
  },
  buttonSecondaryText: {
    ...typography.button,
    color: colors.textLight,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  buttonOutlineText: {
    ...typography.button,
    color: colors.primary,
  },
  buttonGhost: {
    backgroundColor: colors.primaryMuted,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  buttonGhostText: {
    ...typography.button,
    color: colors.primary,
  },
  buttonDanger: {
    backgroundColor: colors.error,
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.xxl,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    ...shadows.sm,
  },
  buttonDangerText: {
    ...typography.button,
    color: colors.textLight,
  },
  buttonSmall: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.sm,
  },
  buttonIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Text Styles
  textPrimary: {
    color: colors.textPrimary,
    ...typography.body,
  },
  textSecondary: {
    color: colors.textSecondary,
    ...typography.bodySmall,
  },
  textTertiary: {
    color: colors.textTertiary,
    ...typography.caption,
  },
  textHint: {
    color: colors.textHint,
    ...typography.caption,
  },
  textLight: {
    color: colors.textLight,
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.h4,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    marginTop: spacing.lg,
  },
  
  // Badge Styles
  badge: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.round,
    alignSelf: 'flex-start',
  },
  badgeText: {
    ...typography.overline,
    fontSize: 10,
  },
  badgePrimary: {
    backgroundColor: colors.primaryMuted,
  },
  badgePrimaryText: {
    color: colors.primary,
  },
  badgeSuccess: {
    backgroundColor: colors.successLight,
  },
  badgeSuccessText: {
    color: colors.success,
  },
  badgeWarning: {
    backgroundColor: colors.warningLight,
  },
  badgeWarningText: {
    color: colors.warning,
  },
  badgeError: {
    backgroundColor: colors.errorLight,
  },
  badgeErrorText: {
    color: colors.error,
  },
  
  // Modern FAB
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
  fabSmall: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  fabText: {
    fontSize: 28,
    color: colors.textLight,
    fontWeight: '400',
    marginTop: -2,
  },
  fabIcon: {
    fontSize: 24,
    color: colors.textLight,
  },
  
  // Modern Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: colors.overlay,
  },
  modalOverlayCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  modalContentCenter: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    margin: spacing.xl,
    maxHeight: '85%',
    width: '90%',
    ...shadows.xl,
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
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  modalSection: {
    marginBottom: spacing.lg,
  },
  modalSectionTitle: {
    ...typography.overline,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  
  // Chip/Pill Styles
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.round,
    backgroundColor: colors.lightGray,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  chipActive: {
    backgroundColor: colors.primary,
  },
  chipText: {
    ...typography.buttonSmall,
    color: colors.textSecondary,
  },
  chipTextActive: {
    color: colors.textLight,
  },
  
  // Utility Styles
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  flex1: {
    flex: 1,
  },
  
  // Spacing utilities
  mb1: { marginBottom: spacing.xs },
  mb2: { marginBottom: spacing.sm },
  mb3: { marginBottom: spacing.md },
  mb4: { marginBottom: spacing.lg },
  mb5: { marginBottom: spacing.xl },
  mt1: { marginTop: spacing.xs },
  mt2: { marginTop: spacing.sm },
  mt3: { marginTop: spacing.md },
  mt4: { marginTop: spacing.lg },
  mt5: { marginTop: spacing.xl },
  p1: { padding: spacing.xs },
  p2: { padding: spacing.sm },
  p3: { padding: spacing.md },
  p4: { padding: spacing.lg },
  p5: { padding: spacing.xl },
  ph: { paddingHorizontal: spacing.lg },
  pv: { paddingVertical: spacing.md },
  
  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.huge * 2,
    paddingHorizontal: spacing.xl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.lg,
    opacity: 0.8,
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
    maxWidth: 280,
  },
  
  // Loading State
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  
  // Divider
  divider: {
    height: 1,
    backgroundColor: colors.lightGray,
    marginVertical: spacing.md,
  },
  dividerThick: {
    height: 8,
    backgroundColor: colors.backgroundAlt,
    marginVertical: spacing.lg,
  },
  
  // Avatar
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  avatarLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  avatarText: {
    ...typography.h4,
    color: colors.primary,
  },
  
  // Progress Bar
  progressContainer: {
    height: 8,
    backgroundColor: colors.lightGray,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  
  // Status indicator
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.sm,
  },
});
