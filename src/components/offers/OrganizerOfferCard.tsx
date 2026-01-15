import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../theme/ThemeContext';
import { gradients } from '../../theme/colors';
import { OrganizerOffer, needsResponse } from '../../data/offersData';
import {
  getCategoryGradient,
  getCategoryIcon,
  getCategoryShortLabel,
} from '../../utils/categoryHelpers';

interface OrganizerOfferCardProps {
  offer: OrganizerOffer;
  onPress: () => void;
  onAccept: () => void;
  onReject: () => void;
  onCounterOffer: () => void;
}

export function OrganizerOfferCard({ offer, onPress, onAccept, onReject, onCounterOffer }: OrganizerOfferCardProps) {
  const { colors, isDark } = useTheme();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return colors.success;
      case 'pending': return colors.warning;
      case 'counter_offered': return colors.brand[400];
      case 'rejected': return colors.error;
      default: return colors.textMuted;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'accepted': return 'Kabul Edildi';
      case 'pending': return 'Beklemede';
      case 'counter_offered':
        if (offer.counterOffer) {
          if (offer.counterOffer.by === 'organizer') return 'Cevap Bekleniyor';
          return 'Karşı Teklif Geldi';
        }
        return 'Pazarlık';
      case 'rejected': return 'Reddedildi';
      default: return status;
    }
  };

  const getStatusIcon = (status: string): keyof typeof Ionicons.glyphMap => {
    switch (status) {
      case 'accepted': return 'checkmark-circle';
      case 'pending': return 'time';
      case 'counter_offered': return 'swap-horizontal';
      case 'rejected': return 'close-circle';
      default: return 'help-circle';
    }
  };

  const statusColor = getStatusColor(offer.status);
  const showActions = needsResponse(offer, false);
  const currentAmount = offer.counterOffer ? offer.counterOffer.amount : offer.amount;
  const isUrgent = showActions && offer.status === 'pending';
  const hasCounterFromProvider = offer.counterOffer?.by === 'provider';
  const budgetDiff = currentAmount - offer.originalBudget;
  const isUnderBudget = budgetDiff <= 0;
  const isCompleted = offer.status === 'accepted' || offer.status === 'rejected';

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : '#f8f9fa',
          borderColor: isDark ? 'rgba(255, 255, 255, 0.04)' : '#e5e7eb',
        },
        showActions && {
          borderColor: 'rgba(147, 51, 234, 0.3)',
          backgroundColor: 'rgba(147, 51, 234, 0.03)',
        },
        isUrgent && {
          borderColor: 'rgba(16, 185, 129, 0.4)',
          backgroundColor: 'rgba(16, 185, 129, 0.03)',
        }
      ]}
      activeOpacity={0.9}
      onPress={onPress}
    >
      <LinearGradient
        colors={getCategoryGradient(offer.serviceCategory)}
        style={styles.topBar}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      />

      {isUrgent && (
        <View style={styles.newBanner}>
          <View style={[styles.newBannerDot, { backgroundColor: colors.success }]} />
          <Text style={[styles.newBannerText, { color: colors.success }]}>Yeni Teklif Geldi</Text>
        </View>
      )}

      {hasCounterFromProvider && showActions && (
        <View style={styles.counterBanner}>
          <Ionicons name="swap-horizontal" size={14} color={colors.brand[400]} />
          <Text style={[styles.counterBannerText, { color: colors.brand[400] }]}>Karşı Teklif Yanıtı</Text>
        </View>
      )}

      <View style={styles.header}>
        <View style={styles.providerSection}>
          <View style={styles.providerImageWrapper}>
            <Image source={{ uri: offer.provider.image }} style={styles.providerImage} />
            {offer.provider.verified && (
              <View style={[styles.verifiedBadge, { backgroundColor: colors.brand[500], borderColor: colors.background }]}>
                <Ionicons name="checkmark" size={10} color="white" />
              </View>
            )}
          </View>
          <View style={styles.providerInfo}>
            <Text style={[styles.providerName, { color: colors.text }]}>{offer.provider.name}</Text>
            <View style={styles.providerMeta}>
              <View style={styles.ratingBadge}>
                <Ionicons name="star" size={12} color="#fbbf24" />
                <Text style={styles.ratingText}>{offer.provider.rating}</Text>
              </View>
              {offer.provider.verified && (
                <View style={styles.verifiedText}>
                  <Ionicons name="shield-checkmark" size={12} color={colors.success} />
                  <Text style={[styles.verifiedLabel, { color: colors.success }]}>Onaylı</Text>
                </View>
              )}
            </View>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: `${statusColor}15`, borderColor: `${statusColor}30` }]}>
          <Ionicons name={getStatusIcon(offer.status)} size={12} color={statusColor} />
          <Text style={[styles.statusText, { color: statusColor }]}>
            {getStatusText(offer.status)}
          </Text>
        </View>
      </View>

      <View style={styles.serviceSection}>
        <View style={styles.serviceBadge}>
          <LinearGradient
            colors={getCategoryGradient(offer.serviceCategory)}
            style={styles.serviceBadgeGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons
              name={getCategoryIcon(offer.serviceCategory) as keyof typeof Ionicons.glyphMap}
              size={12}
              color="white"
            />
            <Text style={styles.serviceBadgeText}>
              {getCategoryShortLabel(offer.serviceCategory)}
            </Text>
          </LinearGradient>
        </View>
        <Text style={[styles.eventTitle, { color: colors.textSecondary }]}>{offer.eventTitle}</Text>
      </View>

      {/* Message section - only for active offers */}
      {!isCompleted && (
        <View style={styles.messageSection}>
          <Ionicons name="chatbubble-outline" size={14} color={colors.textMuted} />
          <Text style={[styles.messageText, { color: colors.textMuted }]} numberOfLines={2}>{offer.message}</Text>
        </View>
      )}

      {/* Counter offer section - only for active offers */}
      {!isCompleted && offer.counterOffer && (
        <View style={[
          styles.counterOfferSection,
          offer.counterOffer.by === 'provider' && styles.counterOfferFromProvider
        ]}>
          <View style={styles.counterOfferHeader}>
            <View style={[
              styles.counterOfferIcon,
              { backgroundColor: offer.counterOffer.by === 'provider' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(147, 51, 234, 0.15)' }
            ]}>
              <Ionicons
                name={offer.counterOffer.by === 'provider' ? 'arrow-down' : 'arrow-up'}
                size={14}
                color={offer.counterOffer.by === 'provider' ? colors.warning : colors.brand[400]}
              />
            </View>
            <View style={styles.counterOfferTitleRow}>
              <Text style={[
                styles.counterOfferTitle,
                { color: offer.counterOffer.by === 'provider' ? colors.warning : colors.brand[400] }
              ]}>
                {offer.counterOffer.by === 'organizer' ? 'Gönderdiğiniz Teklif' : 'Sağlayıcı Karşı Teklifi'}
              </Text>
              <Text style={[styles.counterOfferTime, { color: colors.textMuted }]}>{offer.counterOffer.date}</Text>
            </View>
          </View>
          <View style={styles.counterOfferBody}>
            <Text style={[styles.counterOfferAmount, { color: colors.text }]}>
              ₺{offer.counterOffer.amount.toLocaleString('tr-TR')}
            </Text>
            {offer.counterOffer.message && (
              <Text style={[styles.counterOfferMessage, { color: colors.textMuted }]} numberOfLines={2}>
                "{offer.counterOffer.message}"
              </Text>
            )}
          </View>
        </View>
      )}

      {/* Simplified price for completed offers */}
      {isCompleted ? (
        <View style={styles.completedPriceSection}>
          <View style={[styles.completedPriceRow, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)' }]}>
            <View style={styles.completedPriceLabel}>
              <Text style={[styles.priceLabel, { color: colors.textMuted }]}>
                {offer.status === 'accepted' ? 'Kabul Edilen Tutar' : 'Teklif Tutarı'}
              </Text>
            </View>
            <Text style={[styles.completedPriceValue, { color: offer.status === 'accepted' ? colors.success : colors.error }]}>
              ₺{currentAmount.toLocaleString('tr-TR')}
            </Text>
          </View>
          {/* Show rejection reason or acceptance info */}
          {offer.status === 'rejected' && offer.rejectionReason && (
            <View style={[styles.rejectionReasonBox, { backgroundColor: 'rgba(239, 68, 68, 0.08)' }]}>
              <Ionicons name="information-circle" size={14} color={colors.error} />
              <Text style={[styles.rejectionReasonText, { color: colors.error }]}>{offer.rejectionReason}</Text>
            </View>
          )}
          {offer.status === 'accepted' && (
            <View style={[styles.acceptedInfoBox, { backgroundColor: 'rgba(16, 185, 129, 0.08)' }]}>
              <Ionicons name="checkmark-circle" size={14} color={colors.success} />
              <Text style={[styles.acceptedInfoText, { color: colors.success }]}>
                Karşılıklı onaylandı • {offer.acceptedAt}
              </Text>
            </View>
          )}
        </View>
      ) : (
        <>
          <View style={styles.priceSection}>
            <View style={[styles.priceRow, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)' }]}>
              <View style={styles.priceItem}>
                <Text style={[styles.priceLabel, { color: colors.textMuted }]}>
                  {offer.counterOffer ? 'İlk Teklif' : 'Teklif Tutarı'}
                </Text>
                <Text style={[
                  styles.priceValue,
                  { color: colors.text },
                  offer.counterOffer && { color: colors.textMuted, textDecorationLine: 'line-through', fontSize: 12 }
                ]}>
                  ₺{offer.amount.toLocaleString('tr-TR')}
                </Text>
              </View>
              <View style={[styles.priceDivider, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)' }]} />
              <View style={styles.priceItem}>
                <Text style={[styles.priceLabel, { color: colors.textMuted }]}>Bütçeniz</Text>
                <Text style={[styles.budgetValue, { color: colors.textSecondary }]}>
                  ₺{offer.originalBudget.toLocaleString('tr-TR')}
                </Text>
              </View>
              <View style={[styles.priceDivider, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)' }]} />
              <View style={styles.priceItem}>
                <Text style={[styles.priceLabel, { color: colors.textMuted }]}>Fark</Text>
                <View style={[
                  styles.diffBadge,
                  { backgroundColor: isUnderBudget ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)' }
                ]}>
                  <Ionicons
                    name={isUnderBudget ? 'trending-down' : 'trending-up'}
                    size={12}
                    color={isUnderBudget ? colors.success : colors.error}
                  />
                  <Text style={[styles.diffValue, { color: isUnderBudget ? colors.success : colors.error }]}>
                    ₺{Math.abs(budgetDiff).toLocaleString('tr-TR')}
                  </Text>
                </View>
              </View>
            </View>

            <View style={[
              styles.budgetStatus,
              { backgroundColor: isUnderBudget ? 'rgba(16, 185, 129, 0.08)' : 'rgba(245, 158, 11, 0.08)' }
            ]}>
              <Ionicons
                name={isUnderBudget ? 'checkmark-circle' : 'alert-circle'}
                size={14}
                color={isUnderBudget ? colors.success : colors.warning}
              />
              <Text style={[styles.budgetStatusText, { color: isUnderBudget ? colors.success : colors.warning }]}>
                {isUnderBudget ? 'Bütçe dahilinde' : 'Bütçeyi aşıyor'}
              </Text>
            </View>
          </View>

          <View style={styles.deliverySection}>
            <Ionicons name="time-outline" size={14} color={colors.textMuted} />
            <Text style={[styles.deliveryText, { color: colors.textMuted }]}>Teslim: {offer.deliveryTime}</Text>
          </View>
        </>
      )}

      <View style={styles.footer}>
        <View style={styles.footerLeft}>
          <Ionicons name="calendar-outline" size={14} color={colors.textMuted} />
          <Text style={[styles.footerTime, { color: colors.textMuted }]}>{offer.date}</Text>
        </View>

        {showActions && (
          <View style={styles.actionButtonsRow}>
            <TouchableOpacity style={styles.actionBtnReject} onPress={onReject}>
              <Ionicons name="close" size={18} color={colors.error} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtnCounter} onPress={onCounterOffer}>
              <Ionicons name="swap-horizontal" size={16} color={colors.brand[400]} />
              <Text style={[styles.actionBtnCounterText, { color: colors.brand[400] }]}>Pazarlık</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtnAccept} onPress={onAccept}>
              <LinearGradient
                colors={gradients.primary}
                style={styles.actionBtnAcceptGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="checkmark" size={16} color="white" />
                <Text style={styles.actionBtnAcceptText}>Kabul Et</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {offer.status === 'counter_offered' && offer.counterOffer?.by === 'organizer' && (
          <View style={styles.waitingStatus}>
            <View style={[styles.waitingDot, { backgroundColor: colors.warning }]} />
            <Text style={[styles.waitingText, { color: colors.textMuted }]}>Sağlayıcı inceliyor</Text>
          </View>
        )}

        {(offer.status === 'accepted' || offer.status === 'rejected') && (
          <View style={styles.completedArrow}>
            <Text style={[styles.completedText, { color: colors.textMuted }]}>Detaylar</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 2,
  },
  topBar: {
    height: 4,
  },
  newBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(16, 185, 129, 0.15)',
  },
  newBannerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  newBannerText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  counterBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    backgroundColor: 'rgba(147, 51, 234, 0.1)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(147, 51, 234, 0.15)',
  },
  counterBannerText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  providerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  providerImageWrapper: {
    position: 'relative',
  },
  providerImage: {
    width: 48,
    height: 48,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  providerInfo: {
    flex: 1,
    gap: 4,
  },
  providerName: {
    fontSize: 15,
    fontWeight: '700',
  },
  providerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    borderRadius: 6,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fbbf24',
  },
  verifiedText: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  verifiedLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 5,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  serviceSection: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  serviceBadge: {
    marginBottom: 8,
  },
  serviceBadgeGradient: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  serviceBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'white',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  eventTitle: {
    fontSize: 13,
  },
  messageSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginHorizontal: 16,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 12,
    marginBottom: 14,
  },
  messageText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  counterOfferSection: {
    marginHorizontal: 16,
    padding: 14,
    backgroundColor: 'rgba(147, 51, 234, 0.08)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(147, 51, 234, 0.15)',
    marginBottom: 14,
  },
  counterOfferFromProvider: {
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },
  counterOfferHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  counterOfferIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterOfferTitleRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  counterOfferTitle: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  counterOfferTime: {
    fontSize: 10,
  },
  counterOfferBody: {
    gap: 6,
  },
  counterOfferAmount: {
    fontSize: 22,
    fontWeight: '700',
  },
  counterOfferMessage: {
    fontSize: 12,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  priceSection: {
    marginHorizontal: 16,
    marginBottom: 10,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  priceItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  priceLabel: {
    fontSize: 9,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  priceValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  budgetValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  priceDivider: {
    width: 1,
    height: 28,
  },
  diffBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  diffValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  budgetStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 8,
  },
  budgetStatusText: {
    fontSize: 11,
    fontWeight: '500',
  },
  deliverySection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginHorizontal: 16,
    marginBottom: 14,
  },
  deliveryText: {
    fontSize: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.04)',
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerTime: {
    fontSize: 12,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtnReject: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  actionBtnCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(147, 51, 234, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(147, 51, 234, 0.2)',
  },
  actionBtnCounterText: {
    fontSize: 12,
    fontWeight: '600',
  },
  actionBtnAccept: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionBtnAcceptGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  actionBtnAcceptText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  waitingStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 10,
  },
  waitingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  waitingText: {
    fontSize: 11,
  },
  completedArrow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  completedText: {
    fontSize: 12,
  },
  // Simplified price section for completed offers
  completedPriceSection: {
    marginHorizontal: 16,
    marginBottom: 10,
    gap: 8,
  },
  completedPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 12,
  },
  completedPriceLabel: {
    flex: 1,
  },
  completedPriceValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  rejectionReasonBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 10,
  },
  rejectionReasonText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },
  acceptedInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 10,
  },
  acceptedInfoText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '500',
  },
});
