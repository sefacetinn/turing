import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors, gradients } from '../theme/colors';

// Local providers data
const providers = [
  { id: 'p1', name: 'Pro Sound Istanbul', category: 'technical', subcategory: 'Ses Sistemleri', image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400', rating: 4.9, reviews: 128, location: 'İstanbul', verified: true, price: '₺50.000 - ₺150.000', description: 'Profesyonel ses sistemleri ve akustik çözümler.', completedJobs: 450, responseTime: '< 1 saat', portfolio: [] },
  { id: 'p2', name: 'Elite VIP Transfer', category: 'transport', subcategory: 'VIP Ulaşım', image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400', rating: 4.8, reviews: 89, location: 'İstanbul', verified: true, price: '₺5.000 - ₺25.000', description: 'Lüks araç filosu ile VIP transfer hizmetleri.', completedJobs: 890, responseTime: '< 30 dk', portfolio: [] },
];

export function ProviderDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { providerId } = (route.params as { providerId: string }) || { providerId: 'p1' };

  const provider = providers.find(p => p.id === providerId) || providers[0];
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setIsFavorite(!isFavorite)}
          >
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={22}
              color={isFavorite ? colors.error : colors.text}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="share-outline" size={22} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Provider Card */}
        <View style={styles.providerCard}>
          <Image source={{ uri: provider.image }} style={styles.providerImage} />
          <View style={styles.providerInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.providerName}>{provider.name}</Text>
              {provider.verified && (
                <Ionicons name="checkmark-circle" size={18} color={colors.brand[400]} />
              )}
            </View>
            <Text style={styles.providerCategory}>{provider.subcategory}</Text>

            <View style={styles.ratingRow}>
              <Ionicons name="star" size={14} color="#fbbf24" />
              <Text style={styles.ratingValue}>{provider.rating}</Text>
              <Text style={styles.ratingCount}>({provider.reviews} değerlendirme)</Text>
            </View>

            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={14} color={colors.zinc[500]} />
              <Text style={styles.locationText}>{provider.location}</Text>
            </View>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{provider.completedJobs}</Text>
            <Text style={styles.statLabel}>Tamamlanan İş</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: colors.success }]}>{provider.responseTime}</Text>
            <Text style={styles.statLabel}>Yanıt Süresi</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.verifiedIcon}>
              <Ionicons name="shield-checkmark" size={18} color={colors.brand[400]} />
            </View>
            <Text style={styles.statLabel}>Doğrulanmış</Text>
          </View>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hakkında</Text>
          <Text style={styles.aboutText}>{provider.description}</Text>
        </View>

        {/* Price Range */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fiyat Aralığı</Text>
          <View style={styles.priceCard}>
            <Ionicons name="pricetag-outline" size={20} color={colors.brand[400]} />
            <Text style={styles.priceText}>{provider.price}</Text>
          </View>
        </View>

        {/* Portfolio */}
        {provider.portfolio && provider.portfolio.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Portfolyo</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>Tümü</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {provider.portfolio.map((image, index) => (
                <TouchableOpacity key={index}>
                  <Image source={{ uri: image }} style={styles.portfolioImage} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Services */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hizmetler</Text>
          <View style={styles.servicesGrid}>
            {['Kurulum', 'Teknik Destek', 'Ekipman Kiralama', 'Danışmanlık'].map((service, index) => (
              <View key={index} style={styles.serviceItem}>
                <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                <Text style={styles.serviceText}>{service}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Reviews Preview */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Değerlendirmeler</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>Tümü ({provider.reviews})</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <View style={styles.reviewAvatar}>
                <Text style={styles.reviewAvatarText}>EM</Text>
              </View>
              <View style={styles.reviewInfo}>
                <Text style={styles.reviewerName}>Event Masters</Text>
                <View style={styles.reviewStars}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Ionicons key={star} name="star" size={12} color="#fbbf24" />
                  ))}
                </View>
              </View>
              <Text style={styles.reviewDate}>2 hafta önce</Text>
            </View>
            <Text style={styles.reviewText}>
              Çok profesyonel bir ekip. Etkinliğimiz için mükemmel bir ses sistemi kurdular.
              Kesinlikle tavsiye ederim.
            </Text>
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom Action */}
      <View style={styles.bottomAction}>
        <TouchableOpacity style={styles.messageBtn}>
          <Ionicons name="chatbubble-outline" size={20} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.callBtn}>
          <Ionicons name="call-outline" size={20} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.requestBtn}>
          <LinearGradient
            colors={gradients.primary}
            style={styles.requestBtnGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.requestBtnText}>Teklif İste</Text>
            <Ionicons name="paper-plane" size={16} color="white" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 4,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  providerCard: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  providerImage: {
    width: 100,
    height: 100,
    borderRadius: 20,
  },
  providerInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  providerName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  providerCategory: {
    fontSize: 14,
    color: colors.zinc[400],
    marginTop: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  ratingValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  ratingCount: {
    fontSize: 12,
    color: colors.zinc[500],
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  locationText: {
    fontSize: 13,
    color: colors.zinc[500],
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  statLabel: {
    fontSize: 11,
    color: colors.zinc[500],
    marginTop: 4,
  },
  verifiedIcon: {
    marginBottom: 2,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  seeAllText: {
    fontSize: 13,
    color: colors.brand[400],
  },
  aboutText: {
    fontSize: 14,
    color: colors.zinc[400],
    lineHeight: 22,
  },
  priceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: 'rgba(147, 51, 234, 0.08)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(147, 51, 234, 0.2)',
  },
  priceText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  portfolioImage: {
    width: 180,
    height: 120,
    borderRadius: 14,
    marginRight: 12,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 10,
  },
  serviceText: {
    fontSize: 13,
    color: colors.text,
  },
  reviewCard: {
    padding: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 14,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  reviewAvatar: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(147, 51, 234, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewAvatarText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.brand[400],
  },
  reviewInfo: {
    flex: 1,
    marginLeft: 10,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  reviewStars: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 2,
  },
  reviewDate: {
    fontSize: 11,
    color: colors.zinc[500],
  },
  reviewText: {
    fontSize: 13,
    color: colors.zinc[400],
    lineHeight: 20,
  },
  bottomAction: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 32,
    backgroundColor: 'rgba(9, 9, 11, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    gap: 10,
  },
  messageBtn: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  callBtn: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  requestBtn: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
  },
  requestBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  requestBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'white',
  },
});
