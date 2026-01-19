import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useTheme } from '../../../theme/ThemeContext';
import {
  getArtistById,
  CrewMember,
  CrewRole,
  RoleCategory,
  crewRoleLabels,
  roleCategoryLabels,
  roleCategoryIcons,
  getRolesForCategory,
} from '../../../data/provider/artistData';
import { CrewMemberItem } from '../../../components/artist';

type RouteParams = {
  CrewManagement: { artistId: string; memberId?: string };
};

// Group roles by category for display
const roleOptionsByCategory: { category: RoleCategory; roles: { key: CrewRole; label: string }[] }[] = [
  {
    category: 'management',
    roles: [
      { key: 'manager', label: 'Menajer' },
      { key: 'tour_manager', label: 'Tur Menajeri' },
      { key: 'road_manager', label: 'Road Manager' },
      { key: 'assistant', label: 'Asistan' },
    ],
  },
  {
    category: 'musician',
    roles: [
      { key: 'lead_vocal', label: 'Lead Vokal' },
      { key: 'backing_vocal', label: 'Backing Vokal' },
      { key: 'keyboard', label: 'Klavye' },
      { key: 'lead_guitar', label: 'Solo Gitar' },
      { key: 'bass', label: 'Bas Gitar' },
      { key: 'drums', label: 'Davul' },
      { key: 'dj', label: 'DJ' },
    ],
  },
  {
    category: 'technical',
    roles: [
      { key: 'foh_engineer', label: 'FOH Ses Mühendisi' },
      { key: 'monitor_engineer', label: 'Monitor Mühendisi' },
      { key: 'lighting_op', label: 'Işık Operatörü' },
      { key: 'stage_tech', label: 'Sahne Teknisyeni' },
    ],
  },
  {
    category: 'other',
    roles: [
      { key: 'security', label: 'Güvenlik' },
      { key: 'driver', label: 'Şoför' },
      { key: 'photographer', label: 'Fotoğrafçı' },
    ],
  },
];

export function CrewManagementScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<RouteParams, 'CrewManagement'>>();
  const { colors, isDark } = useTheme();

  const { artistId, memberId } = route.params;
  const artist = useMemo(() => getArtistById(artistId), [artistId]);

  const existingMember = useMemo(
    () => (memberId ? artist?.crew.find((c) => c.id === memberId) : null),
    [artist, memberId]
  );

  const [showForm, setShowForm] = useState(!!memberId);
  const [editingMember, setEditingMember] = useState<CrewMember | null>(existingMember || null);

  // Form States
  const [name, setName] = useState(editingMember?.name || '');
  const [role, setRole] = useState<CrewRole>(editingMember?.role || 'manager');
  const [phone, setPhone] = useState(editingMember?.phone || '');
  const [email, setEmail] = useState(editingMember?.email || '');
  const [notes, setNotes] = useState(editingMember?.notes || '');

  const handleSave = () => {
    if (!name.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Hata', 'Isim gereklidir.');
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    Alert.alert(
      'Basarili',
      editingMember ? 'Ekip uyesi guncellendi.' : 'Yeni ekip uyesi eklendi.',
      [
        {
          text: 'Tamam',
          onPress: () => {
            if (memberId) {
              navigation.goBack();
            } else {
              resetForm();
              setShowForm(false);
            }
          },
        },
      ]
    );
  };

  const handleDelete = (member: CrewMember) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      'Silme Onayı',
      `${member.name} ekipten cikarilsin mi?`,
      [
        { text: 'Iptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Basarili', 'Ekip uyesi silindi.');
          },
        },
      ]
    );
  };

  const handleEdit = (member: CrewMember) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setEditingMember(member);
    setName(member.name);
    setRole(member.role);
    setPhone(member.phone || '');
    setEmail(member.email || '');
    setNotes(member.notes || '');
    setShowForm(true);
  };

  const resetForm = () => {
    setEditingMember(null);
    setName('');
    setRole('manager');
    setPhone('');
    setEmail('');
    setNotes('');
  };

  if (!artist) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>Sanatci bulunamadi</Text>
      </SafeAreaView>
    );
  }

  const renderForm = () => (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView
        style={styles.formContent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.formContentContainer}
      >
        {/* Name Input */}
        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Ad Soyad *</Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: colors.background, borderColor: colors.border, color: colors.text },
            ]}
            value={name}
            onChangeText={setName}
            placeholder="Ahmet Yilmaz"
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        {/* Role Selection */}
        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Rol *</Text>
          {roleOptionsByCategory.map((categoryGroup) => (
            <View key={categoryGroup.category} style={styles.roleCategorySection}>
              <View style={styles.roleCategoryHeader}>
                <Ionicons
                  name={roleCategoryIcons[categoryGroup.category] as any}
                  size={14}
                  color={colors.textMuted}
                />
                <Text style={[styles.roleCategoryLabel, { color: colors.textMuted }]}>
                  {roleCategoryLabels[categoryGroup.category]}
                </Text>
              </View>
              <View style={styles.roleGrid}>
                {categoryGroup.roles.map((option) => {
                  const isSelected = role === option.key;
                  return (
                    <TouchableOpacity
                      key={option.key}
                      style={[
                        styles.roleOption,
                        {
                          backgroundColor: isSelected ? colors.primary + '20' : colors.background,
                          borderColor: isSelected ? colors.primary : colors.border,
                        },
                      ]}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setRole(option.key);
                      }}
                    >
                      <Text
                        style={[
                          styles.roleOptionText,
                          { color: isSelected ? colors.primary : colors.textSecondary },
                        ]}
                        numberOfLines={1}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))}
        </View>

        {/* Contact Info */}
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Iletisim Bilgileri</Text>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Telefon</Text>
            <View style={styles.inputWithIcon}>
              <Ionicons name="call-outline" size={20} color={colors.textSecondary} />
              <TextInput
                style={[
                  styles.inputInline,
                  { backgroundColor: colors.background, borderColor: colors.border, color: colors.text },
                ]}
                value={phone}
                onChangeText={setPhone}
                placeholder="+90 532 123 4567"
                placeholderTextColor={colors.textSecondary}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>E-posta</Text>
            <View style={styles.inputWithIcon}>
              <Ionicons name="mail-outline" size={20} color={colors.textSecondary} />
              <TextInput
                style={[
                  styles.inputInline,
                  { backgroundColor: colors.background, borderColor: colors.border, color: colors.text },
                ]}
                value={email}
                onChangeText={setEmail}
                placeholder="ornek@email.com"
                placeholderTextColor={colors.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>
        </View>

        {/* Notes */}
        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Notlar</Text>
          <TextInput
            style={[
              styles.textArea,
              { backgroundColor: colors.background, borderColor: colors.border, color: colors.text },
            ]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Ek bilgiler, notlar..."
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButtonLarge, { backgroundColor: colors.primary }]}
          onPress={handleSave}
        >
          <Ionicons name="checkmark" size={20} color="white" />
          <Text style={styles.saveButtonLargeText}>
            {editingMember ? 'Guncelle' : 'Ekip Uyesi Ekle'}
          </Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );

  const renderList = () => (
    <ScrollView
      style={styles.listContent}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.listContentContainer}
    >
      {artist.crew.length > 0 ? (
        artist.crew.map((member) => (
          <CrewMemberItem
            key={member.id}
            member={member}
            onPress={() => handleEdit(member)}
            onEdit={() => handleEdit(member)}
            onDelete={() => handleDelete(member)}
          />
        ))
      ) : (
        <View style={[styles.emptyState, { backgroundColor: colors.surface }]}>
          <Ionicons name="people-outline" size={48} color={colors.textSecondary} />
          <Text style={[styles.emptyStateTitle, { color: colors.text }]}>
            Henuz ekip uyesi yok
          </Text>
          <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
            Sanatcinin ekip uyelerini ekleyin
          </Text>
        </View>
      )}
    </ScrollView>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderColor: colors.border }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            if (showForm && !memberId) {
              resetForm();
              setShowForm(false);
            } else {
              navigation.goBack();
            }
          }}
        >
          <Ionicons name={showForm && !memberId ? 'close' : 'arrow-back'} size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {showForm
              ? editingMember
                ? 'Ekip Uyesini Duzenle'
                : 'Yeni Ekip Uyesi'
              : 'Ekip Yonetimi'}
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            {artist.stageName || artist.name}
          </Text>
        </View>
        {!showForm && (
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: colors.primary + '20' }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              resetForm();
              setShowForm(true);
            }}
          >
            <Ionicons name="add" size={24} color={colors.primary} />
          </TouchableOpacity>
        )}
        {showForm && (
          <View style={{ width: 44 }} />
        )}
      </View>

      {showForm ? renderForm() : renderList()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '600' },
  headerSubtitle: { fontSize: 13, marginTop: 2 },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  listContent: { flex: 1 },
  listContentContainer: { padding: 16, paddingBottom: 100 },

  formContent: { flex: 1 },
  formContentContainer: { padding: 16, paddingBottom: 100 },

  inputGroup: { marginBottom: 20 },
  inputLabel: { fontSize: 13, marginBottom: 8 },
  input: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  textArea: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    minHeight: 100,
  },

  roleCategorySection: {
    marginBottom: 12,
  },
  roleCategoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  roleCategoryLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  roleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  roleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  roleOptionText: { fontSize: 13 },

  section: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },

  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  inputInline: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },

  saveButtonLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  saveButtonLargeText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },

  emptyState: {
    alignItems: 'center',
    padding: 40,
    borderRadius: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptyStateText: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },

  errorText: { fontSize: 16, textAlign: 'center', marginTop: 40 },
});
