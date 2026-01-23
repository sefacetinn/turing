import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import {
  EventRevision,
  getRevisionTypeLabel,
  getRevisionTypeIcon,
  formatRevisionValue,
} from '../hooks/useEventRevisions';
import { RevisionApprovalModal } from './RevisionApprovalModal';

interface PendingRevisionsAlertProps {
  pendingRevisions: EventRevision[];
  onApprove: (revisionId: string, comment?: string) => Promise<boolean>;
  onReject: (revisionId: string, comment?: string) => Promise<boolean>;
  onRefresh?: () => void;
}

export function PendingRevisionsAlert({
  pendingRevisions,
  onApprove,
  onReject,
  onRefresh,
}: PendingRevisionsAlertProps) {
  const { colors, isDark } = useTheme();
  const [selectedRevision, setSelectedRevision] = useState<EventRevision | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  if (pendingRevisions.length === 0) {
    return null;
  }

  const handleRevisionPress = (revision: EventRevision) => {
    setSelectedRevision(revision);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedRevision(null);
  };

  const handleApprove = async (revisionId: string, comment?: string) => {
    const success = await onApprove(revisionId, comment);
    if (success) {
      onRefresh?.();
    }
    return success;
  };

  const handleReject = async (revisionId: string, comment?: string) => {
    const success = await onReject(revisionId, comment);
    if (success) {
      onRefresh?.();
    }
    return success;
  };

  return (
    <>
      <View style={[
        styles.container,
        {
          backgroundColor: isDark ? 'rgba(245, 158, 11, 0.08)' : 'rgba(245, 158, 11, 0.06)',
          borderColor: isDark ? 'rgba(245, 158, 11, 0.2)' : 'rgba(245, 158, 11, 0.15)',
        }
      ]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: 'rgba(245, 158, 11, 0.2)' }]}>
            <Ionicons name="alert-circle" size={20} color="#f59e0b" />
          </View>
          <View style={styles.headerText}>
            <Text style={[styles.title, { color: colors.text }]}>
              Onay Bekleyen Değişiklik{pendingRevisions.length > 1 ? 'ler' : ''}
            </Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              {pendingRevisions.length} etkinlik için değişiklik talebi var
            </Text>
          </View>
        </View>

        {/* Revision Items */}
        <View style={styles.revisionList}>
          {pendingRevisions.slice(0, 3).map((revision, index) => (
            <TouchableOpacity
              key={revision.id}
              style={[
                styles.revisionItem,
                {
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)',
                },
                index !== 0 && styles.revisionItemMargin,
              ]}
              onPress={() => handleRevisionPress(revision)}
              activeOpacity={0.7}
            >
              <View style={[styles.revisionIcon, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                <Ionicons
                  name={getRevisionTypeIcon(revision.type) as any}
                  size={16}
                  color="#f59e0b"
                />
              </View>
              <View style={styles.revisionContent}>
                <Text style={[styles.revisionEvent, { color: colors.text }]} numberOfLines={1}>
                  {revision.eventTitle}
                </Text>
                <Text style={[styles.revisionType, { color: colors.textMuted }]}>
                  {getRevisionTypeLabel(revision.type)}: {formatRevisionValue(revision.type, revision.newValue)}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Show more if more than 3 */}
        {pendingRevisions.length > 3 && (
          <TouchableOpacity style={styles.showMore}>
            <Text style={[styles.showMoreText, { color: '#f59e0b' }]}>
              +{pendingRevisions.length - 3} daha fazla
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Approval Modal */}
      <RevisionApprovalModal
        visible={modalVisible}
        revision={selectedRevision}
        onClose={handleCloseModal}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  revisionList: {
    gap: 8,
  },
  revisionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  revisionItemMargin: {
    marginTop: 0,
  },
  revisionIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  revisionContent: {
    flex: 1,
  },
  revisionEvent: {
    fontSize: 14,
    fontWeight: '500',
  },
  revisionType: {
    fontSize: 12,
    marginTop: 2,
  },
  showMore: {
    marginTop: 12,
    alignItems: 'center',
  },
  showMoreText: {
    fontSize: 13,
    fontWeight: '500',
  },
});

export default PendingRevisionsAlert;
