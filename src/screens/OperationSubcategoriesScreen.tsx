import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { colors, gradients } from '../theme/colors';

const operationSubcategories = [
  { id: 'security', name: 'Güvenlik', description: 'Profesyonel güvenlik hizmetleri', icon: 'shield-checkmark', count: 45 },
  { id: 'catering', name: 'Catering', description: 'Yemek ve ikram hizmetleri', icon: 'restaurant', count: 38 },
  { id: 'generator', name: 'Jeneratör', description: 'Enerji ve güç sistemleri', icon: 'flash', count: 22 },
  { id: 'beverage', name: 'İçecek Hizmetleri', description: 'Bar ve içecek servisi', icon: 'cafe', count: 31 },
  { id: 'medical', name: 'Medikal', description: 'Sağlık ve ilk yardım', icon: 'medkit', count: 18 },
  { id: 'sanitation', name: 'Sanitasyon', description: 'Temizlik ve hijyen', icon: 'trash', count: 27 },
  { id: 'media', name: 'Medya', description: 'Fotoğraf ve video hizmetleri', icon: 'camera', count: 56 },
  { id: 'barrier', name: 'Bariyer', description: 'Güvenlik bariyerleri ve çitler', icon: 'remove-circle', count: 15 },
  { id: 'tent', name: 'Çadır', description: 'Çadır ve gölgelik sistemleri', icon: 'home', count: 24 },
  { id: 'ticketing', name: 'Ticketing', description: 'Bilet satış ve giriş sistemleri', icon: 'ticket', count: 12 },
  { id: 'decoration', name: 'Dekorasyon', description: 'Etkinlik dekorasyonu', icon: 'color-palette', count: 42 },
  { id: 'production', name: 'Prodüksiyon', description: 'Prodüksiyon yönetimi', icon: 'film', count: 19 },
];

export function OperationSubcategoriesScreen() {
  const navigation = useNavigation<any>();

  const handleSubcategoryPress = (subcategory: typeof operationSubcategories[0]) => {
    navigation.navigate('ServiceProviders', { category: subcategory.id });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <LinearGradient
            colors={gradients.operation}
            style={styles.headerIcon}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="settings" size={16} color="white" />
          </LinearGradient>
          <Text style={styles.headerTitle}>Operasyon Hizmetleri</Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      {/* Subtitle */}
      <View style={styles.subtitleContainer}>
        <Text style={styles.subtitle}>
          Etkinliğiniz için ihtiyacınız olan tüm operasyonel hizmetler
        </Text>
      </View>

      {/* Subcategories Grid */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.grid}>
          {operationSubcategories.map((subcategory) => (
            <TouchableOpacity
              key={subcategory.id}
              style={styles.card}
              activeOpacity={0.8}
              onPress={() => handleSubcategoryPress(subcategory)}
            >
              <LinearGradient
                colors={gradients.operation}
                style={styles.cardIconContainer}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name={subcategory.icon as any} size={22} color="white" />
              </LinearGradient>

              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{subcategory.name}</Text>
                <Text style={styles.cardDescription} numberOfLines={1}>
                  {subcategory.description}
                </Text>
              </View>

              <View style={styles.cardRight}>
                <View style={styles.countBadge}>
                  <Text style={styles.countText}>{subcategory.count}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.zinc[600]} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoIconContainer}>
            <Ionicons name="information-circle" size={20} color={colors.brand[400]} />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Birden Fazla Hizmet Mi Gerekiyor?</Text>
            <Text style={styles.infoText}>
              Toplu teklif almak için birden fazla sağlayıcı seçebilirsiniz
            </Text>
          </View>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
  },
  placeholder: {
    width: 40,
  },
  subtitleContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  subtitle: {
    fontSize: 13,
    color: colors.zinc[500],
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  grid: {
    gap: 10,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  cardIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    flex: 1,
    marginLeft: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  cardDescription: {
    fontSize: 12,
    color: colors.zinc[500],
    marginTop: 2,
  },
  cardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(217, 119, 6, 0.15)',
    borderRadius: 8,
  },
  countText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fbbf24',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    backgroundColor: 'rgba(147, 51, 234, 0.05)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(147, 51, 234, 0.15)',
    marginTop: 20,
  },
  infoIconContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  infoText: {
    fontSize: 12,
    color: colors.zinc[400],
    marginTop: 4,
    lineHeight: 18,
  },
});
