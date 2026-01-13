import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { darkTheme as defaultColors, gradients } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';

const colors = defaultColors;

interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  gradient: readonly [string, string];
  subcategories?: SubCategory[];
}

interface SubCategory {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const serviceCategories: ServiceCategory[] = [
  {
    id: 'booking',
    name: 'Booking',
    description: 'Sanatçı, DJ, Müzisyen',
    icon: 'musical-notes',
    gradient: gradients.booking,
  },
  {
    id: 'technical',
    name: 'Teknik',
    description: 'Ses, Işık, Sahne Sistemleri',
    icon: 'volume-high',
    gradient: gradients.technical,
  },
  {
    id: 'venue',
    name: 'Mekan',
    description: 'Etkinlik Alanları, Salonlar',
    icon: 'business',
    gradient: gradients.venue,
  },
  {
    id: 'accommodation',
    name: 'Konaklama',
    description: 'Otel, Apart, Villa',
    icon: 'bed',
    gradient: gradients.accommodation,
  },
  {
    id: 'transport',
    name: 'Ulaşım',
    description: 'VIP Transfer, Araç Kiralama',
    icon: 'car',
    gradient: gradients.transport,
  },
  {
    id: 'flight',
    name: 'Uçuş',
    description: 'Özel Jet, Charter, Helikopter',
    icon: 'airplane',
    gradient: gradients.flight,
  },
  {
    id: 'operation',
    name: 'Operasyon',
    description: 'Etkinlik operasyon hizmetleri',
    icon: 'settings',
    gradient: gradients.operation,
    subcategories: [
      { id: 'security', name: 'Güvenlik', icon: 'shield' },
      { id: 'catering', name: 'Catering', icon: 'restaurant' },
      { id: 'generator', name: 'Jeneratör', icon: 'flash' },
      { id: 'beverage', name: 'İçecek', icon: 'cafe' },
      { id: 'medical', name: 'Medikal', icon: 'medkit' },
      { id: 'sanitation', name: 'Sanitasyon', icon: 'trash' },
      { id: 'media', name: 'Medya & Prodüksiyon', icon: 'camera' },
      { id: 'barrier', name: 'Bariyer & Sahne Bariyeri', icon: 'remove' },
      { id: 'tent', name: 'Çadır & Tente', icon: 'home' },
      { id: 'ticketing', name: 'Biletleme', icon: 'ticket' },
      { id: 'decoration', name: 'Dekorasyon', icon: 'color-palette' },
    ],
  },
];

// Mock initial selected services (full-service provider)
const initialSelectedServices = [
  'booking', 'technical', 'venue', 'accommodation', 'transport', 'flight', 'operation',
  'security', 'catering', 'generator', 'beverage', 'medical', 'sanitation', 'media', 'barrier', 'tent', 'ticketing', 'decoration'
];

export function ProviderServicesScreen() {
  const navigation = useNavigation<any>();
  const { colors, isDark, helpers } = useTheme();
  const [selectedServices, setSelectedServices] = useState<string[]>(initialSelectedServices);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['operation']);

  const toggleService = (serviceId: string) => {
    setSelectedServices(prev =>
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const isServiceSelected = (serviceId: string) => selectedServices.includes(serviceId);

  const getSelectedSubcategoryCount = (category: ServiceCategory) => {
    if (!category.subcategories) return 0;
    return category.subcategories.filter(sub => selectedServices.includes(sub.id)).length;
  };

  const handleSave = () => {
    if (selectedServices.length === 0) {
      Alert.alert('Uyarı', 'En az bir hizmet türü seçmelisiniz.');
      return;
    }
    Alert.alert('Başarılı', 'Hizmet türleriniz güncellendi.', [
      { text: 'Tamam', onPress: () => navigation.goBack() }
    ]);
  };

  const mainCategoriesSelected = serviceCategories.filter(c => !c.subcategories && selectedServices.includes(c.id)).length;
  const operationSelected = selectedServices.includes('operation');
  const operationSubsSelected = getSelectedSubcategoryCount(serviceCategories.find(c => c.id === 'operation')!);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Verdiğim Hizmetler</Text>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={[styles.saveButtonText, { color: colors.brand[400] }]}>Kaydet</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={[styles.statsContainer, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground, borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.border, ...(isDark ? {} : helpers.getShadow('sm')) }]}>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: colors.brand[400] }]}>{selectedServices.length}</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>Toplam Hizmet</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : colors.border }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: colors.brand[400] }]}>{mainCategoriesSelected + (operationSelected ? 1 : 0)}</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>Ana Kategori</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : colors.border }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: colors.brand[400] }]}>{operationSubsSelected}</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>Operasyon</Text>
        </View>
      </View>

      {/* Info Box */}
      <View style={[styles.infoBox, { backgroundColor: isDark ? 'rgba(147, 51, 234, 0.08)' : 'rgba(147, 51, 234, 0.05)', borderColor: isDark ? 'rgba(147, 51, 234, 0.15)' : 'rgba(147, 51, 234, 0.1)' }]}>
        <Ionicons name="information-circle" size={20} color={colors.brand[400]} />
        <Text style={[styles.infoText, { color: colors.textMuted }]}>
          Seçtiğiniz hizmet türlerine göre organizatörlerden teklif talepleri alırsınız.
        </Text>
      </View>

      <ScrollView style={styles.servicesList} showsVerticalScrollIndicator={false}>
        {serviceCategories.map(category => (
          <View key={category.id} style={styles.categoryContainer}>
            {/* Main Category */}
            <TouchableOpacity
              style={[
                styles.categoryCard,
                { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground, borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.border },
                isServiceSelected(category.id) && styles.categoryCardSelected
              ]}
              activeOpacity={0.8}
              onPress={() => toggleService(category.id)}
            >
              <LinearGradient
                colors={category.gradient}
                style={styles.categoryIcon}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name={category.icon} size={22} color="white" />
              </LinearGradient>

              <View style={styles.categoryInfo}>
                <Text style={[styles.categoryName, { color: colors.text }]}>{category.name}</Text>
                <Text style={[styles.categoryDescription, { color: colors.textMuted }]}>{category.description}</Text>
                {category.subcategories && isServiceSelected(category.id) && (
                  <Text style={[styles.subcategoryCount, { color: colors.brand[400] }]}>
                    {getSelectedSubcategoryCount(category)}/{category.subcategories.length} alt hizmet seçili
                  </Text>
                )}
              </View>

              <View style={styles.categoryRight}>
                {category.subcategories && isServiceSelected(category.id) && (
                  <TouchableOpacity
                    style={styles.expandButton}
                    onPress={() => toggleCategory(category.id)}
                  >
                    <Ionicons
                      name={expandedCategories.includes(category.id) ? 'chevron-up' : 'chevron-down'}
                      size={20}
                      color={colors.textMuted}
                    />
                  </TouchableOpacity>
                )}
                <View style={[
                  styles.checkbox,
                  { borderColor: isDark ? colors.zinc[600] : colors.border },
                  isServiceSelected(category.id) && styles.checkboxSelected
                ]}>
                  {isServiceSelected(category.id) && (
                    <Ionicons name="checkmark" size={16} color="white" />
                  )}
                </View>
              </View>
            </TouchableOpacity>

            {/* Subcategories */}
            {category.subcategories &&
             isServiceSelected(category.id) &&
             expandedCategories.includes(category.id) && (
              <View style={styles.subcategoriesContainer}>
                {category.subcategories.map((sub, index) => (
                  <TouchableOpacity
                    key={sub.id}
                    style={[
                      styles.subcategoryCard,
                      { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground, borderColor: isDark ? 'rgba(255, 255, 255, 0.04)' : colors.border },
                      isServiceSelected(sub.id) && styles.subcategoryCardSelected,
                      index === category.subcategories!.length - 1 && { marginBottom: 0 }
                    ]}
                    activeOpacity={0.8}
                    onPress={() => toggleService(sub.id)}
                  >
                    <View style={[
                      styles.subcategoryIcon,
                      { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.cardBackground },
                      isServiceSelected(sub.id) && styles.subcategoryIconSelected
                    ]}>
                      <Ionicons
                        name={sub.icon}
                        size={16}
                        color={isServiceSelected(sub.id) ? colors.brand[400] : colors.textMuted}
                      />
                    </View>
                    <Text style={[
                      styles.subcategoryName,
                      { color: isServiceSelected(sub.id) ? colors.text : colors.textMuted },
                      isServiceSelected(sub.id) && styles.subcategoryNameSelected
                    ]}>
                      {sub.name}
                    </Text>
                    <View style={[
                      styles.subCheckbox,
                      { borderColor: isDark ? colors.zinc[600] : colors.border },
                      isServiceSelected(sub.id) && styles.subCheckboxSelected
                    ]}>
                      {isServiceSelected(sub.id) && (
                        <Ionicons name="checkmark" size={12} color="white" />
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        ))}

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(147, 51, 234, 0.15)',
    borderRadius: 10,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginBottom: 16,
    paddingVertical: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 14,
    backgroundColor: 'rgba(147, 51, 234, 0.08)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(147, 51, 234, 0.15)',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  servicesList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  categoryContainer: {
    marginBottom: 12,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  categoryCardSelected: {
    backgroundColor: 'rgba(147, 51, 234, 0.05)',
    borderColor: 'rgba(147, 51, 234, 0.2)',
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryInfo: {
    flex: 1,
    marginLeft: 14,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
  },
  categoryDescription: {
    fontSize: 12,
    marginTop: 2,
  },
  subcategoryCount: {
    fontSize: 11,
    marginTop: 4,
  },
  categoryRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  expandButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: colors.brand[500],
    borderColor: colors.brand[500],
  },
  subcategoriesContainer: {
    marginTop: 8,
    marginLeft: 20,
    paddingLeft: 16,
    borderLeftWidth: 2,
    borderLeftColor: 'rgba(147, 51, 234, 0.2)',
  },
  subcategoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 12,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  subcategoryCardSelected: {
    backgroundColor: 'rgba(147, 51, 234, 0.08)',
    borderColor: 'rgba(147, 51, 234, 0.15)',
  },
  subcategoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subcategoryIconSelected: {
    backgroundColor: 'rgba(147, 51, 234, 0.15)',
  },
  subcategoryName: {
    flex: 1,
    fontSize: 14,
    marginLeft: 12,
  },
  subcategoryNameSelected: {
    fontWeight: '500',
  },
  subCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subCheckboxSelected: {
    backgroundColor: colors.brand[500],
    borderColor: colors.brand[500],
  },
});
