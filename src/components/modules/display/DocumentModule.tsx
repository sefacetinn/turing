/**
 * DocumentModule - Döküman Modülü
 *
 * Sözleşme, rider ve teknik spec dökümanlarını gösterir.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../theme/ThemeContext';
import { DocumentModuleData, DocumentItem, ModuleConfig } from '../../../types/modules';

interface DocumentModuleProps {
  data?: DocumentModuleData;
  config: ModuleConfig;
  mode?: 'view' | 'edit' | 'form';
  onDataChange?: (data: DocumentModuleData) => void;
}

export const DocumentModule: React.FC<DocumentModuleProps> = ({ data, config }) => {
  const { colors, isDark } = useTheme();

  if (!data || !data.documents || data.documents.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Döküman bulunmuyor</Text>
      </View>
    );
  }

  const getDocumentIcon = (type?: DocumentItem['type']): string => {
    switch (type) {
      case 'contract': return 'document-text';
      case 'rider': return 'musical-notes';
      case 'stage_plan': return 'construct';
      case 'contact_list': return 'people';
      case 'equipment_list': return 'hardware-chip';
      case 'invoice': return 'receipt';
      default: return 'document';
    }
  };

  const getDocumentColor = (type?: DocumentItem['type']): string => {
    switch (type) {
      case 'contract': return '#10B981';
      case 'rider': return '#6366F1';
      case 'stage_plan': return '#F59E0B';
      case 'contact_list': return '#8B5CF6';
      case 'equipment_list': return '#EC4899';
      case 'invoice': return '#3B82F6';
      default: return '#64748B';
    }
  };

  const getDocumentTypeName = (type?: DocumentItem['type']): string => {
    switch (type) {
      case 'contract': return 'Sözleşme';
      case 'rider': return 'Rider';
      case 'stage_plan': return 'Sahne Planı';
      case 'contact_list': return 'İletişim Listesi';
      case 'equipment_list': return 'Ekipman Listesi';
      case 'invoice': return 'Fatura';
      default: return 'Döküman';
    }
  };

  const getFileTypeIcon = (fileType?: DocumentItem['fileType']): string => {
    switch (fileType) {
      case 'pdf': return 'document-text';
      case 'image': return 'image';
      case 'excel': return 'grid';
      case 'word': return 'document';
      default: return 'document';
    }
  };

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleOpenDocument = async (uri: string, name: string) => {
    try {
      const supported = await Linking.canOpenURL(uri);
      if (supported) {
        await Linking.openURL(uri);
      } else {
        Alert.alert('Hata', 'Bu döküman açılamıyor.');
      }
    } catch (error) {
      Alert.alert('Hata', 'Döküman açılırken bir hata oluştu.');
    }
  };

  return (
    <View style={styles.container}>
      {data.documents.map((doc, index) => (
        <TouchableOpacity
          key={doc.id || index}
          style={[styles.documentCard, { backgroundColor: isDark ? '#27272A' : '#F8FAFC' }]}
          onPress={() => doc.uri && handleOpenDocument(doc.uri, doc.name)}
          disabled={!doc.uri}
        >
          <View style={[styles.docIcon, { backgroundColor: `${getDocumentColor(doc.type)}15` }]}>
            <Ionicons name={getDocumentIcon(doc.type) as any} size={20} color={getDocumentColor(doc.type)} />
          </View>
          <View style={styles.docInfo}>
            <View style={styles.docHeader}>
              <Text style={[styles.docName, { color: colors.text }]} numberOfLines={1}>
                {doc.name}
              </Text>
            </View>
            <View style={styles.docMeta}>
              <Text style={[styles.docType, { color: getDocumentColor(doc.type) }]}>
                {getDocumentTypeName(doc.type)}
              </Text>
              {doc.fileType && (
                <>
                  <Text style={[styles.docDot, { color: colors.textSecondary }]}>•</Text>
                  <View style={styles.fileTypeBadge}>
                    <Ionicons name={getFileTypeIcon(doc.fileType) as any} size={10} color={colors.textSecondary} />
                    <Text style={[styles.fileTypeText, { color: colors.textSecondary }]}>{doc.fileType.toUpperCase()}</Text>
                  </View>
                </>
              )}
              {doc.size && (
                <>
                  <Text style={[styles.docDot, { color: colors.textSecondary }]}>•</Text>
                  <Text style={[styles.docSize, { color: colors.textSecondary }]}>{formatFileSize(doc.size)}</Text>
                </>
              )}
            </View>
            {doc.uploadedBy && doc.uploadedAt && (
              <Text style={[styles.uploadedInfo, { color: colors.textSecondary }]}>
                {doc.uploadedBy} tarafından • {doc.uploadedAt}
              </Text>
            )}
          </View>
          {doc.uri && (
            <View style={styles.downloadBtn}>
              <Ionicons name="download-outline" size={20} color={colors.primary} />
            </View>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { gap: 10 },
  empty: { padding: 20, alignItems: 'center' },
  emptyText: { fontSize: 14 },
  documentCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 12,
    gap: 12,
  },
  docIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  docInfo: { flex: 1 },
  docHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  docName: { fontSize: 14, fontWeight: '600', flex: 1 },
  docMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
    flexWrap: 'wrap',
  },
  docType: { fontSize: 11, fontWeight: '600' },
  docDot: { fontSize: 8 },
  docSize: { fontSize: 11 },
  fileTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  fileTypeText: { fontSize: 10 },
  uploadedInfo: { fontSize: 11, marginTop: 4 },
  downloadBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default DocumentModule;
