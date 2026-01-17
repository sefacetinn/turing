import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { useTheme } from '../../theme/ThemeContext';
import { UploadedDocument } from '../../types/auth';

interface DocumentUploaderProps {
  label: string;
  description?: string;
  value: UploadedDocument | null;
  onChange: (doc: UploadedDocument | null) => void;
  acceptedTypes?: ('pdf' | 'image')[];
  maxSizeMB?: number;
  required?: boolean;
  error?: string;
}

export function DocumentUploader({
  label,
  description,
  value,
  onChange,
  acceptedTypes = ['pdf', 'image'],
  maxSizeMB = 10,
  required = false,
  error,
}: DocumentUploaderProps) {
  const { colors, isDark } = useTheme();

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('İzin Gerekli', 'Galeri erişimi için izin vermeniz gerekiyor.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const fileSize = asset.fileSize || 0;

      if (fileSize > maxSizeMB * 1024 * 1024) {
        Alert.alert('Dosya Çok Büyük', `Maksimum dosya boyutu ${maxSizeMB}MB olmalıdır.`);
        return;
      }

      onChange({
        uri: asset.uri,
        name: asset.fileName || `image_${Date.now()}.jpg`,
        type: 'image',
        size: fileSize,
      });
    }
  };

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];

        if (asset.size && asset.size > maxSizeMB * 1024 * 1024) {
          Alert.alert('Dosya Çok Büyük', `Maksimum dosya boyutu ${maxSizeMB}MB olmalıdır.`);
          return;
        }

        onChange({
          uri: asset.uri,
          name: asset.name,
          type: 'pdf',
          size: asset.size || 0,
        });
      }
    } catch {
      Alert.alert('Hata', 'Dosya seçilirken bir hata oluştu.');
    }
  };

  const handleUpload = () => {
    const options = [];

    if (acceptedTypes.includes('image')) {
      options.push({ text: 'Galeriden Seç', onPress: handlePickImage });
    }
    if (acceptedTypes.includes('pdf')) {
      options.push({ text: 'PDF Seç', onPress: handlePickDocument });
    }
    options.push({ text: 'İptal', style: 'cancel' as const });

    Alert.alert('Dosya Seç', 'Nasıl yüklemek istersiniz?', options);
  };

  const handleRemove = () => {
    Alert.alert(
      'Dosyayı Kaldır',
      'Bu dosyayı kaldırmak istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Kaldır', style: 'destructive', onPress: () => onChange(null) },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={[styles.label, { color: colors.text }]}>
          {label}
          {required && <Text style={{ color: colors.error }}> *</Text>}
        </Text>
      </View>

      {description && (
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          {description}
        </Text>
      )}

      {value ? (
        <View
          style={[
            styles.fileCard,
            {
              backgroundColor: isDark ? colors.zinc[800] : colors.zinc[100],
              borderColor: isDark ? colors.zinc[700] : colors.zinc[300],
            },
          ]}
        >
          <View style={styles.fileInfo}>
            <View
              style={[
                styles.fileIcon,
                {
                  backgroundColor: value.type === 'pdf'
                    ? 'rgba(239, 68, 68, 0.15)'
                    : 'rgba(75, 48, 184, 0.15)',
                },
              ]}
            >
              <Ionicons
                name={value.type === 'pdf' ? 'document' : 'image'}
                size={24}
                color={value.type === 'pdf' ? colors.error : colors.brand[500]}
              />
            </View>
            <View style={styles.fileDetails}>
              <Text
                style={[styles.fileName, { color: colors.text }]}
                numberOfLines={1}
              >
                {value.name}
              </Text>
              <Text style={[styles.fileSize, { color: colors.textSecondary }]}>
                {formatFileSize(value.size)}
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={handleRemove} style={styles.removeButton}>
            <Ionicons name="close-circle" size={24} color={colors.textMuted} />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={[
            styles.uploadButton,
            {
              backgroundColor: isDark ? colors.zinc[800] : colors.zinc[100],
              borderColor: error
                ? colors.error
                : isDark
                ? colors.zinc[700]
                : colors.zinc[300],
            },
          ]}
          onPress={handleUpload}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.uploadIcon,
              { backgroundColor: isDark ? colors.zinc[700] : colors.zinc[200] },
            ]}
          >
            <Ionicons name="cloud-upload" size={28} color={colors.brand[500]} />
          </View>
          <Text style={[styles.uploadText, { color: colors.text }]}>
            Dosya Yükle
          </Text>
          <Text style={[styles.uploadHint, { color: colors.textSecondary }]}>
            {acceptedTypes.includes('pdf') && acceptedTypes.includes('image')
              ? 'PDF veya Resim'
              : acceptedTypes.includes('pdf')
              ? 'Sadece PDF'
              : 'Sadece Resim'}
            {` (Max ${maxSizeMB}MB)`}
          </Text>
        </TouchableOpacity>
      )}

      {error && (
        <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  description: {
    fontSize: 12,
    marginBottom: 8,
  },
  uploadButton: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  uploadIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  uploadText: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  uploadHint: {
    fontSize: 12,
  },
  fileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  fileIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  fileDetails: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  fileSize: {
    fontSize: 12,
  },
  removeButton: {
    padding: 4,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
});
