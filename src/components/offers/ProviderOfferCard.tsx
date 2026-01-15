import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../theme/ThemeContext';
import { gradients } from '../../theme/colors';
import { ProviderOffer, needsResponse } from '../../data/offersData';
import {
  getCategoryGradient,
  getCategoryIcon,
  getCategoryShortLabel,
} from '../../utils/categoryHelpers';

interface ProviderOfferCardProps {
  offer: ProviderOffer;
  onPress: () => void;
  onAccept: () => void;
  onReject: () => void;
  onCounterOffer: () => void;
}

export function ProviderOfferCard({ offer, onPress, onAccept, onReject, onCounterOffer }: ProviderOfferCardProps) {
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
          if (offer.counterOffer.by === 'provider') return 'Cevap Bekleniyor';
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
  const showActions = needsResponse(offer, true);
  const isUrgent = showActions && offer.counterOffer?.by === 'organizer';

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
          borderColor: 'rgba(239, 68, 68, 0.4)',
          backgroundColor: 'rgba(239, 68, 68, 0.03)',
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
        <View style={styles.urgentBanner}>
          <Ionicons name="alert-circle" size={14} color="#ef4444" />
          <Text style={styles.urgentBannerText}>Yanıt Bekliyor</Text>
        </View>
      )}

      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.organizerSection}>
            <Image source={{ uri: offer.organizer.image }} style={styles.organizerImage} />
            <View style={styles.organizerInfo}>
              <Text style={[styles.organizerLabel, { color: colors.textMuted }]}>Organizatör</Text>
              <Text style={[styles.organizerName, { color: colors.text }]}>{offer.organizer.name}</Text>
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

      <Text style={[styles.eventTitle, { color: colors.text }]}>{offer.eventTitle}</Text>

      <View style={styles.roleBadgeContainer}>
        <LinearGradient
          colors={getCategoryGradient(offer.serviceCategory)}
          style={styles.roleBadge}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Ionicons
            name={getCategoryIcon(offer.serviceCategory) as keyof typeof Ionicons.glyphMap}
            size={12}
            color="white"
          />
          <Text style={styles.roleBadgeText}>
            {getCategoryShortLabel(offer.serviceCategory)}
          </Text>
        </LinearGradient>
      </View>

      <View style={styles.eventDetailsRow}>
        <View style={styles.eventDetailItem}>
          <View style={styles.eventDetailIcon}>
            <Ionicons name="calendar" size={14} color={colors.brand[400]} />
          </View>
          <View>
            <Text style={[styles.eventDetailLabel, { color: colors.textMuted }]}>Tarih</Text>
            <Text style={[styles.eventDetailValue, { color: colors.text }]}>{offer.eventDate}</Text>
          </View>
        </View>
        <View style={styles.eventDetailDivider} />
        <View style={styles.eventDetailItem}>
          <View style={styles.eventDetailIcon}>
            <Ionicons name="location" size={14} color={colors.brand[400]} />
          </View>
          <View>
            <Text style={[styles.eventDetailLabel, { color: colors.textMuted }]}>Konum</Text>
            <Text style={[styles.eventDetailValue, { color: colors.text }]}>{offer.location}</Text>
          </View>
        </View>
      </View>

      {offer.counterOffer && (
        <View style={[
          styles.counterOfferSection,
          offer.counterOffer.by === 'organizer' && styles.counterOfferIncoming
        ]}>
          <View style={styles.counterOfferHeader}>
            <View style={styles.counterOfferIconBox}>
              <Ionicons
                name={offer.counterOffer.by === 'organizer' ? 'arrow-down' : 'arrow-up'}
                size={14}
                color={offer.counterOffer.by === 'organizer' ? colors.warning : colors.brand[400]}
              />
            </View>
            <View style={styles.counterOfferTitleSection}>
              <Text style={[styles.counterOfferTitle, { color: offer.counterOffer.by === 'organizer' ? colors.warning : colors.brand[400] }]}>
                {offer.counterOffer.by === 'provider' ? 'Gönderilen Karşı Teklif' : 'Gelen Karşı Teklif'}
              </Text>
              <Text style={[styles.counterOfferTime, { color: colors.textMuted }]}>{offer.counterOffer.date}</Text>
            </View>
          </View>
          <View style={styles.counterOfferAmountRow}>
            <Text style={[styles.counterOfferAmount, { color: colors.text }]}>
              ₺{offer.counterOffer.amount.toLocaleString('tr-TR')}
            </Text>
            {offer.counterOffer.amount !== offer.amount && (
              <View style={[
                styles.counterOfferDiff,
                { backgroundColor: offer.counterOffer.amount < offer.amount ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)' }
              ]}>
                <Text style={[
                  styles.counterOfferDiffText,
                  { color: offer.counterOffer.amount < offer.amount ? colors.error : colors.success }
                ]}>
                  {offer.counterOffer.amount < offer.amount ? '-' : '+'}
                  ₺{Math.abs(offer.counterOffer.amount - offer.amount).toLocaleString('tr-TR')}
                </Text>
              </View>
            )}
          </View>
          {offer.counterOffer.message && (
            <Text style={[styles.counterOfferMessage, { color: colors.textMuted }]} numberOfLines={2}>
              "{offer.counterOffer.message}"
            </Text>
          )}
        </View>
      )}

      <View style={styles.amountSection}>
        <View style={styles.amountLeft}>
          <Text style={[styles.amountLabel, { color: colors.textMuted }]}>
            {offer.counterOffer ? 'İlk Teklifiniz' : 'Teklif Tutarınız'}
          </Text>
          <Text style={[
            styles.amountValue,
            { color: colors.success },
            offer.counterOffer && [styles.amountValueOld, { color: colors.textMuted }]
          ]}>
            ₺{offer.amount.toLocaleString('tr-TR')}
          </Text>
        </View>
        {!offer.counterOffer && (
          <View style={styles.amountRight}>
            <View style={styles.amountSuccessIcon}>
              <Ionicons name="checkmark-circle" size={16} color={colors.success} />
            </View>
            <Text style={[styles.amountHint, { color: colors.success }]}>Aktif Teklif</Text>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <View style={styles.footerLeft}>
          <Ionicons name="time-outline" size={14} color={colors.textMuted} />
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
                <Text style={styles.actionBtnAcceptText}>Kabul</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {offer.status === 'pending' && (
          <View style={styles.waitingStatus}>
            <View style={[styles.waitingDot, { backgroundColor: colors.warning }]} />
            <Text style={[styles.waitingText, { color: colors.textMuted }]}>Organizatör inceliyor</Text>
          </View>
        )}
        {offer.status === 'counter_offered' && offer.counterOffer?.by === 'provider' && (
          <View style={styles.waitingStatus}>
            <View style={[styles.waitingDot, { backgroundColor: colors.warning }]} />
            <Text style={[styles.waitingText, { color: colors.textMuted }]}>Yanıt bekleniyor</Text>
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
  urgentBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(239, 68, 68, 0.15)',
  },
  urgentBannerText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#ef4444',
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
  headerLeft: {
    flex: 1,
  },
  organizerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  organizerImage: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  organizerInfo: {
    gap: 2,
  },
  organizerLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  organizerName: {
    fontSize: 14,
    fontWeight: '600',
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
  eventTitle: {
    fontSize: 18,
    fontWeight: '700',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  roleBadgeContainer: {
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'white',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  eventDetailsRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 12,
    marginBottom: 14,
  },
  eventDetailItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
  },
  eventDetailIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(147, 51, 234, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventDetailLabel: {
    fontSize: 10,
  },
  eventDetailValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  eventDetailDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
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
  counterOfferIncoming: {
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },
  counterOfferHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  counterOfferIconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterOfferTitleSection: {
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
  counterOfferAmountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  counterOfferAmount: {
    fontSize: 22,
    fontWeight: '700',
  },
  counterOfferDiff: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  counterOfferDiffText: {
    fontSize: 11,
    fontWeight: '600',
  },
  counterOfferMessage: {
    fontSize: 12,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  amountSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    padding: 14,
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.1)',
    marginBottom: 14,
  },
  amountLeft: {
    gap: 2,
  },
  amountLabel: {
    fontSize: 11,
  },
  amountValue: {
    fontSize: 22,
    fontWeight: '700',
  },
  amountValueOld: {
    fontSize: 16,
    textDecorationLine: 'line-through',
  },
  amountRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  amountSuccessIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  amountHint: {
    fontSize: 11,
    fontWeight: '500',
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
});
