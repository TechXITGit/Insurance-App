import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radii, spacing } from '../../theme/spacing';
import { Header } from '../../components/common/Header';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'renewal' | 'application' | 'info';
  read: boolean;
}

export const NotificationCenterScreen: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif_1',
      title: 'Policy Renewal Due',
      message: 'Your Optima Secure Family policy is due for renewal on 27 Oct 2026. Renew early to retain NCB.',
      timestamp: '2 hours ago',
      type: 'renewal',
      read: false,
    },
    {
      id: 'notif_2',
      title: 'Proposal Document Verified',
      message: 'Underwriting desk has reviewed and approved your proposal KYC.',
      timestamp: 'Yesterday',
      type: 'application',
      read: false,
    },
    {
      id: 'notif_3',
      title: 'IRDAI Guideline Update',
      message: 'New cashless everywhere initiative activated across 10,000+ hospitals.',
      timestamp: '3 days ago',
      type: 'info',
      read: true,
    },
  ]);

  const markAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Notifications"
        rightAction={
          <TouchableOpacity onPress={markAllRead} style={{ padding: 4 }}>
            <Text style={styles.markReadText}>Mark all read</Text>
          </TouchableOpacity>
        }
      />

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={[styles.itemCard, !item.read && styles.itemCardUnread]}>
            <View style={styles.iconCircle}>
              {item.type === 'renewal' ? (
                <MaterialCommunityIcons name="clock-alert-outline" size={20} color={colors.warning} />
              ) : item.type === 'application' ? (
                <Ionicons name="checkmark-circle-outline" size={20} color={colors.success} />
              ) : (
                <Ionicons name="information-circle-outline" size={20} color={colors.primaryBlue} />
              )}
            </View>

            <View style={{ flex: 1 }}>
              <View style={styles.row}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.timestamp}>{item.timestamp}</Text>
              </View>
              <Text style={styles.message}>{item.message}</Text>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surfaceSubtle,
  },
  markReadText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.primaryBlue,
  },
  listContent: {
    padding: spacing.md,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.white,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  itemCardUnread: {
    borderColor: colors.primaryBlue,
    backgroundColor: '#FAFCFF',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.lightBlueBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    ...typography.bodyMedium,
    fontWeight: '700',
    color: colors.primaryNavy,
  },
  timestamp: {
    ...typography.caption,
    fontSize: 10,
    color: colors.textMuted,
  },
  message: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 18,
  },
});
