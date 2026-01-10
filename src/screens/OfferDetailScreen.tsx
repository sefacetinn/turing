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
import { offers } from '../data/mockData';

export function OfferDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { offerId } = (route.params as { offerId: string }) || { offerId: 'o1' };

  const offer = offers.find(o => o.id === offerId) || offers[0];
  const [showNegotiate, setShowNegotiate] = useState(false);

  const getStatusInfo = (status: string) => {
    const statusMap: Record<string, { color: string; text: string; bg: string; icon: string }> = {
      pending: { color: colors.warning, text: 'Beklemede', bg: 'rgba(245, 158, 11, 0.15)', icon: 'time' },
      accepted: { color: colors.success, text: 'Kabul Edildi', bg: 'rgba(16, 185, 129, 0.15)', icon: 'checkmark-circle' },
      rejected: { color: colors.error, text: 'Reddedildi', bg: 'rgba(239, 68, 68, 0.15)', icon: 'close-circle' },
    };
    return statusMap[status] || statusMap.pending;
  };

  const statusInfo = getStatusInfo(offer.status);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Teklif Detayı</Text>
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-horizontal" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Status Banner */}
        <View style={[styles.statusBanner, { backgroundColor: statusInfo.bg }]}>
          <Ionicons name={statusInfo.icon as any} size={20} color={statusInfo.color} />
          <Text style={[styles.statusBannerText, { color: statusInfo.color }]}>
            {statusInfo.text}
          </Text>
        </View>

        {/* Provider Info */}
        <View style={styles.providerCard}>
          <Image source={{ uri: offer.providerImage }} style={styles.providerImage} />
          <View style={styles.providerInfo}>
            <Text style={styles.providerName}>{offer.providerName}</Text>
            <Text style={styles.providerService}>{offer.service}</Text>
          </View>
          <TouchableOpacity style={styles.chatButton}>
            <Ionicons name="chatbubble-outline" size={18} color={colors.brand[400]} />
          </TouchableOpacity>
        </View>

        {/* Event Info */}
        <View style={styles.eventCard}>
          <View style={styles.eventIcon}>
            <Ionicons name="calendar" size={18} color={colors.zinc[400]} />
          </View>
          <View>
            <Text style={styles.eventTitle}>{offer.eventTitle}</Text>
            <Text style={styles.eventDate}>15 Temmuz 2024</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.zinc[600]} />
        </View>

        {/* Price Section */}
        <View style={styles.priceSection}>
          <Text style={styles.sectionTitle}>Fiyatlandırma</Text>

          <View style={styles.priceCard}>
            {offer.discount > 0 && (
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>%{offer.discount} İndirim</Text>
              </View>
            )}

            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Teklif Tutarı</Text>
              {offer.discount > 0 && (
                <Text style={styles.originalPrice}>₺{offer.originalAmount.toLocaleString()}</Text>
              )}
              <Text style={styles.finalPrice}>₺{offer.amount.toLocaleString()}</Text>
            </View>
          </View>

          {/* Price Breakdown */}
          {offer.items.length > 0 && (
            <View style={styles.breakdown}>
              <Text style={styles.breakdownTitle}>Detay</Text>
              {offer.items.map((item, index) => (
                <View key={index} style={styles.breakdownItem}>
                  <View style={styles.breakdownLeft}>
                    <Text style={styles.breakdownName}>{item.name}</Text>
                    {item.quantity > 1 && (
                      <Text style={styles.breakdownQty}>x{item.quantity}</Text>
                    )}
                  </View>
                  <Text style={styles.breakdownPrice}>₺{item.price.toLocaleString()}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Notes */}
        {offer.notes && (
          <View style={styles.notesSection}>
            <Text style={styles.sectionTitle}>Notlar</Text>
            <View style={styles.notesCard}>
              <Text style={styles.notesText}>{offer.notes}</Text>
            </View>
          </View>
        )}

        {/* Validity */}
        <View style={styles.validitySection}>
          <Ionicons name="time-outline" size={16} color={colors.zinc[500]} />
          <Text style={styles.validityText}>
            Geçerlilik: {offer.validUntil}
          </Text>
        </View>

        {/* Comparison (for pending offers) */}
        {offer.status === 'pending' && (
          <View style={styles.comparisonSection}>
            <Text style={styles.sectionTitle}>Diğer Teklifler</Text>
            <View style={styles.comparisonCard}>
              <View style={styles.comparisonItem}>
                <Text style={styles.comparisonProvider}>LightShow Pro</Text>
                <Text style={styles.comparisonPrice}>₺92.000</Text>
              </View>
              <View style={styles.comparisonDivider} />
              <View style={styles.comparisonItem}>
                <Text style={styles.comparisonProvider}>SoundTech</Text>
                <Text style={styles.comparisonPrice}>₺88.000</Text>
              </View>
            </View>
            <Text style={styles.comparisonNote}>
              Bu teklif ortalama piyasa fiyatının %5 altında
            </Text>
          </View>
        )}

        <View style={{ height: 150 }} />
      </ScrollView>

      {/* Bottom Actions */}
      {offer.status === 'pending' && (
        <View style={styles.bottomActions}>
          <TouchableOpacity
            style={styles.rejectButton}
            onPress={() => {}}
          >
            <Ionicons name="close" size={20} color={colors.error} />
            <Text style={styles.rejectButtonText}>Reddet</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.negotiateButton}
            onPress={() => setShowNegotiate(true)}
          >
            <Ionicons name="chatbubbles-outline" size={18} color={colors.text} />
            <Text style={styles.negotiateButtonText}>Pazarlık</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.acceptButton}>
            <LinearGradient
              colors={gradients.primary}
              style={styles.acceptButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="checkmark" size={20} color="white" />
              <Text style={styles.acceptButtonText}>Kabul Et</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      {/* Accepted/Rejected Actions */}
      {offer.status !== 'pending' && (
        <View style={styles.bottomActions}>
          <TouchableOpacity style={styles.fullWidthButton}>
            <LinearGradient
              colors={offer.status === 'accepted' ? ['#059669', '#34d399'] : gradients.primary}
              style={styles.fullWidthButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons
                name={offer.status === 'accepted' ? 'chatbubble' : 'refresh'}
                size={18}
                color="white"
              />
              <Text style={styles.fullWidthButtonText}>
                {offer.status === 'accepted' ? 'Mesaj Gönder' : 'Yeniden Teklif İste'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
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
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
  },
  moreButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  statusBannerText: {
    fontSize: 14,
    fontWeight: '600',
  },
  providerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 20,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  providerImage: {
    width: 48,
    height: 48,
    borderRadius: 12,
  },
  providerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  providerName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  providerService: {
    fontSize: 13,
    color: colors.zinc[500],
    marginTop: 2,
  },
  chatButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(147, 51, 234, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 12,
    padding: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 12,
  },
  eventIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  eventDate: {
    fontSize: 12,
    color: colors.zinc[500],
    marginTop: 2,
  },
  priceSection: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  priceCard: {
    padding: 20,
    backgroundColor: 'rgba(147, 51, 234, 0.08)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(147, 51, 234, 0.2)',
  },
  discountBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderRadius: 8,
    marginBottom: 12,
  },
  discountText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.success,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  priceLabel: {
    fontSize: 14,
    color: colors.zinc[400],
  },
  originalPrice: {
    fontSize: 14,
    color: colors.zinc[500],
    textDecorationLine: 'line-through',
    marginRight: 8,
  },
  finalPrice: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
  },
  breakdown: {
    marginTop: 16,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 14,
  },
  breakdownTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.zinc[400],
    marginBottom: 12,
  },
  breakdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
  },
  breakdownLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  breakdownName: {
    fontSize: 13,
    color: colors.text,
  },
  breakdownQty: {
    fontSize: 11,
    color: colors.zinc[500],
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  breakdownPrice: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.text,
  },
  notesSection: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  notesCard: {
    padding: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 12,
  },
  notesText: {
    fontSize: 13,
    color: colors.zinc[400],
    lineHeight: 20,
  },
  validitySection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 20,
  },
  validityText: {
    fontSize: 12,
    color: colors.zinc[500],
  },
  comparisonSection: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  comparisonCard: {
    padding: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 14,
  },
  comparisonItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  comparisonProvider: {
    fontSize: 13,
    color: colors.zinc[400],
  },
  comparisonPrice: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.text,
  },
  comparisonDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  comparisonNote: {
    fontSize: 12,
    color: colors.success,
    textAlign: 'center',
    marginTop: 12,
  },
  bottomActions: {
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
  rejectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  rejectButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.error,
  },
  negotiateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 12,
  },
  negotiateButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  acceptButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  acceptButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
  },
  acceptButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  fullWidthButton: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
  },
  fullWidthButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  fullWidthButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'white',
  },
});
