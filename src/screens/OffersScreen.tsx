import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme/colors';

interface OffersScreenProps {
  isProviderMode: boolean;
}

const offers = [
  { id: 'o1', title: 'Yaz Festivali 2024 - Ses Sistemi', provider: 'Pro Sound Istanbul', amount: '₺45.000', status: 'pending', date: '2 saat önce' },
  { id: 'o2', title: 'Kurumsal Gala - VIP Transfer', provider: 'Elite Transfer', amount: '₺12.500', status: 'accepted', date: '1 gün önce' },
  { id: 'o3', title: 'Düğün - Dekorasyon', provider: 'Dream Decor', amount: '₺28.000', status: 'rejected', date: '3 gün önce' },
];

export function OffersScreen({ isProviderMode }: OffersScreenProps) {
  const navigation = useNavigation<any>();
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return colors.success;
      case 'pending': return colors.warning;
      case 'rejected': return colors.error;
      default: return colors.zinc[500];
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'accepted': return 'Kabul Edildi';
      case 'pending': return 'Beklemede';
      case 'rejected': return 'Reddedildi';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted': return 'checkmark-circle';
      case 'pending': return 'time';
      case 'rejected': return 'close-circle';
      default: return 'help-circle';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Teklifler</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>5</Text>
            <Text style={styles.statLabel}>Bekleyen</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: colors.success }]}>12</Text>
            <Text style={styles.statLabel}>Kabul</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: colors.error }]}>3</Text>
            <Text style={styles.statLabel}>Red</Text>
          </View>
        </View>

        {/* Offers List */}
        <View style={styles.offersList}>
          {offers.map((offer) => (
            <TouchableOpacity
              key={offer.id}
              style={styles.offerCard}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('OfferDetail', { offerId: offer.id })}
            >
              <View style={styles.offerHeader}>
                <View style={[styles.statusIcon, { backgroundColor: `${getStatusColor(offer.status)}20` }]}>
                  <Ionicons name={getStatusIcon(offer.status) as any} size={20} color={getStatusColor(offer.status)} />
                </View>
                <View style={styles.offerHeaderRight}>
                  <Text style={styles.offerDate}>{offer.date}</Text>
                  <Ionicons name="chevron-forward" size={18} color={colors.zinc[500]} />
                </View>
              </View>

              <Text style={styles.offerTitle}>{offer.title}</Text>
              <Text style={styles.offerProvider}>{offer.provider}</Text>

              <View style={styles.offerFooter}>
                <Text style={styles.offerAmount}>{offer.amount}</Text>
                <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(offer.status)}20` }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(offer.status) }]}>
                    {getStatusText(offer.status)}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
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
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.warning,
  },
  statLabel: {
    fontSize: 11,
    color: colors.zinc[500],
    marginTop: 4,
  },
  offersList: {
    paddingHorizontal: 20,
    gap: 12,
  },
  offerCard: {
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  offerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  offerHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  offerDate: {
    fontSize: 12,
    color: colors.zinc[500],
  },
  offerTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  offerProvider: {
    fontSize: 13,
    color: colors.zinc[400],
    marginTop: 4,
  },
  offerFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  offerAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
