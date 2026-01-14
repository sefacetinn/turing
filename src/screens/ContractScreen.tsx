import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { gradients, darkTheme as defaultColors } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';
import { ContractStatus, ContractParams, Contract, mockContract, getContractTemplate, fillTemplate, getContractStatusInfo } from '../data/contractData';

const colors = defaultColors;

export function ContractScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { colors, isDark } = useTheme();
  const params = (route.params || {}) as ContractParams;

  const [contract, setContract] = useState<Contract>(mockContract);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [signaturePoints, setSignaturePoints] = useState<{ x: number; y: number }[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);

  const contractTemplate = getContractTemplate(contract.category);
  const statusInfo = getContractStatusInfo(contract.status, colors);
  const canSign = contract.status === 'pending_provider' && !contract.providerSignature.signed;

  const handleSign = useCallback(() => setShowSignatureModal(true), []);

  const handleSignatureComplete = useCallback(() => {
    setContract(prev => ({ ...prev, status: 'signed' as ContractStatus, providerSignature: { signed: true, signedAt: new Date().toISOString(), signatureData: 'signature_data' } }));
    setShowSignatureModal(false);
    Alert.alert('Sözleşme İmzalandı', 'Sözleşmeniz başarıyla imzalandı.', [{ text: 'Tamam' }]);
  }, []);

  const handleDownloadPDF = useCallback(async () => {
    setIsDownloading(true);
    setTimeout(() => { setIsDownloading(false); Alert.alert('PDF İndirildi', 'Sözleşme PDF olarak indirildi.', [{ text: 'Tamam' }]); }, 2000);
  }, []);

  const handleShare = useCallback(() => Alert.alert('Paylaş', 'Sözleşme paylaşım seçenekleri', [{ text: 'E-posta ile Gönder' }, { text: 'WhatsApp' }, { text: 'İptal', style: 'cancel' }]), []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={24} color={colors.text} /></TouchableOpacity>
        <View style={styles.headerTitleSection}><Text style={[styles.headerTitle, { color: colors.text }]}>Sözleşme</Text><Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>#{contract.id.toUpperCase()}</Text></View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={[styles.headerButton, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' }]} onPress={handleShare}><Ionicons name="share-outline" size={20} color={colors.textSecondary} /></TouchableOpacity>
          <TouchableOpacity style={[styles.headerButton, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' }]} onPress={handleDownloadPDF} disabled={isDownloading}><Ionicons name={isDownloading ? 'hourglass-outline' : 'download-outline'} size={20} color={colors.textSecondary} /></TouchableOpacity>
        </View>
      </View>

      {/* Status Banner */}
      <View style={[styles.statusBanner, { backgroundColor: `${statusInfo.color}15` }]}><Ionicons name={statusInfo.icon} size={18} color={statusInfo.color} /><Text style={[styles.statusBannerText, { color: statusInfo.color }]}>{statusInfo.label}</Text></View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Contract Header */}
        <View style={styles.contractHeader}>
          <LinearGradient colors={['rgba(147, 51, 234, 0.1)', 'rgba(99, 102, 241, 0.05)']} style={styles.contractHeaderGradient}>
            <Ionicons name="document-text" size={32} color={colors.brand[400]} />
            <Text style={[styles.contractTitle, { color: colors.text }]}>{contractTemplate.title}</Text>
            <Text style={[styles.contractNumber, { color: colors.textMuted }]}>Sözleşme No: {contract.id.toUpperCase()}</Text>
            <Text style={[styles.contractDate, { color: colors.textMuted }]}>Düzenlenme Tarihi: {contract.createdAt}</Text>
          </LinearGradient>
        </View>

        {/* Parties Section */}
        <View style={styles.partiesSection}>
          {[{ party: contract.organizer, label: 'ORGANİZATÖR', iconBg: 'rgba(59, 130, 246, 0.15)', icon: 'business', iconColor: colors.info, signature: contract.organizerSignature },
            { party: contract.provider, label: 'HİZMET SAĞLAYICI', iconBg: 'rgba(147, 51, 234, 0.15)', icon: 'briefcase', iconColor: colors.brand[400], signature: contract.providerSignature }].map((item, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <View style={styles.partyDivider}><View style={styles.partyDividerLine} /><Ionicons name="swap-horizontal" size={20} color={colors.textSecondary} /><View style={styles.partyDividerLine} /></View>}
              <View style={styles.partyCard}>
                <View style={styles.partyHeader}><View style={[styles.partyIcon, { backgroundColor: item.iconBg }]}><Ionicons name={item.icon as any} size={18} color={item.iconColor} /></View><Text style={[styles.partyLabel, { color: colors.textMuted }]}>{item.label}</Text></View>
                <Text style={[styles.partyName, { color: colors.text }]}>{item.party.name}</Text>
                <Text style={[styles.partyRep, { color: colors.textMuted }]}>{item.party.representative} - {item.party.title}</Text>
                <View style={styles.partyContact}><View style={styles.partyContactItem}><Ionicons name="mail-outline" size={12} color={colors.textMuted} /><Text style={[styles.partyContactText, { color: colors.textMuted }]}>{item.party.email}</Text></View><View style={styles.partyContactItem}><Ionicons name="call-outline" size={12} color={colors.textMuted} /><Text style={[styles.partyContactText, { color: colors.textMuted }]}>{item.party.phone}</Text></View></View>
                {item.signature.signed ? <View style={styles.signatureStatus}><Ionicons name="checkmark-circle" size={14} color={colors.success} /><Text style={[styles.signatureStatusText, { color: colors.success }]}>İmzalandı - {item.signature.signedAt}</Text></View> : <View style={[styles.signatureStatus, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}><Ionicons name="time-outline" size={14} color={colors.warning} /><Text style={[styles.signatureStatusText, { color: colors.warning }]}>İmza Bekleniyor</Text></View>}
              </View>
            </React.Fragment>
          ))}
        </View>

        {/* Service Summary */}
        <View style={styles.serviceSummary}>
          <View style={styles.serviceSummaryHeader}><Ionicons name="receipt-outline" size={18} color={colors.brand[400]} /><Text style={[styles.serviceSummaryTitle, { color: colors.text }]}>Hizmet Özeti</Text></View>
          <View style={styles.serviceSummaryContent}>
            {[{ label: 'Etkinlik', value: contract.eventName }, { label: 'Tarih', value: contract.eventDate }, { label: 'Konum', value: contract.eventLocation }, { label: 'Hizmet', value: contract.serviceName }].map((row, i) => <View key={i} style={styles.summaryRow}><Text style={[styles.summaryLabel, { color: colors.textMuted }]}>{row.label}</Text><Text style={[styles.summaryValue, { color: colors.text }]}>{row.value}</Text></View>)}
            <View style={[styles.summaryRow, styles.summaryRowTotal]}><Text style={[styles.summaryLabelTotal, { color: colors.text }]}>Toplam Tutar</Text><Text style={[styles.summaryValueTotal, { color: colors.success }]}>₺{contract.amount.toLocaleString('tr-TR')}</Text></View>
          </View>
        </View>

        {/* Contract Sections */}
        <View style={styles.contractSections}>
          <Text style={[styles.sectionsTitle, { color: colors.text }]}>Sözleşme Maddeleri</Text>
          {contractTemplate.sections.map((section, i) => <View key={i} style={styles.sectionCard}><Text style={[styles.sectionTitle, { color: colors.brand[400] }]}>{section.title}</Text><Text style={[styles.sectionContent, { color: colors.textMuted }]}>{fillTemplate(section.content, contract)}</Text></View>)}
        </View>

        {/* Signature Section */}
        <View style={styles.signatureSection}>
          <Text style={[styles.signatureSectionTitle, { color: colors.text }]}>İmza Bölümü</Text>
          <View style={styles.signatureBoxes}>
            {[{ label: 'Organizatör İmzası', signature: contract.organizerSignature, canSign: false }, { label: 'Hizmet Sağlayıcı İmzası', signature: contract.providerSignature, canSign }].map((box, i) => (
              <View key={i} style={styles.signatureBox}>
                <Text style={[styles.signatureBoxLabel, { color: colors.textMuted }]}>{box.label}</Text>
                <View style={[styles.signatureArea, box.signature.signed && styles.signatureAreaSigned]}>
                  {box.signature.signed ? <><Ionicons name="checkmark-circle" size={32} color={colors.success} /><Text style={[styles.signedText, { color: colors.success }]}>İmzalandı</Text><Text style={[styles.signedDate, { color: colors.textMuted }]}>{box.signature.signedAt}</Text></> : box.canSign ? <TouchableOpacity style={styles.signButton} onPress={handleSign}><Ionicons name="finger-print" size={24} color={colors.brand[400]} /><Text style={[styles.signButtonText, { color: colors.brand[400] }]}>İmzala</Text></TouchableOpacity> : <Text style={[styles.pendingSignature, { color: colors.textMuted }]}>İmza Bekleniyor</Text>}
                </View>
              </View>
            ))}
          </View>
        </View>
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom Action Button */}
      {canSign && <View style={[styles.bottomActions, { backgroundColor: colors.background, borderTopColor: colors.border }]}><TouchableOpacity style={styles.signContractButton} onPress={handleSign}><LinearGradient colors={gradients.primary} style={styles.signContractGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}><Ionicons name="finger-print" size={22} color="white" /><Text style={styles.signContractText}>Sözleşmeyi İmzala</Text></LinearGradient></TouchableOpacity></View>}

      {/* Signature Modal */}
      <Modal visible={showSignatureModal} animationType="slide" transparent={true} onRequestClose={() => setShowSignatureModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.signatureModal, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}><Text style={[styles.modalTitle, { color: colors.text }]}>Mobil İmza</Text><TouchableOpacity onPress={() => setShowSignatureModal(false)}><Ionicons name="close" size={24} color={colors.text} /></TouchableOpacity></View>
            <Text style={[styles.modalSubtitle, { color: colors.textMuted }]}>Sözleşmeyi onaylamak için aşağıdaki alana imzanızı atın</Text>
            <View style={styles.signaturePad}><View style={[styles.signaturePadInner, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)' }]}><Text style={[styles.signaturePadPlaceholder, { color: colors.textMuted }]}>İmzanızı buraya atın</Text></View><TouchableOpacity style={styles.clearSignatureButton} onPress={() => setSignaturePoints([])}><Ionicons name="trash-outline" size={18} color={colors.textSecondary} /><Text style={[styles.clearSignatureText, { color: colors.textSecondary }]}>Temizle</Text></TouchableOpacity></View>
            <View style={styles.agreementSection}><Ionicons name="shield-checkmark" size={20} color={colors.success} /><Text style={[styles.agreementText, { color: colors.textSecondary }]}>İmzalayarak, yukarıdaki sözleşme şartlarını okuduğumu, anladığımı ve kabul ettiğimi onaylıyorum.</Text></View>
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalCancelButton, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' }]} onPress={() => setShowSignatureModal(false)}><Text style={[styles.modalCancelText, { color: colors.textSecondary }]}>İptal</Text></TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirmButton} onPress={handleSignatureComplete}><LinearGradient colors={gradients.primary} style={styles.modalConfirmGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}><Ionicons name="checkmark" size={20} color="white" /><Text style={styles.modalConfirmText}>Onayla ve İmzala</Text></LinearGradient></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitleSection: { flex: 1, marginLeft: 8 },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  headerSubtitle: { fontSize: 12, marginTop: 2 },
  headerActions: { flexDirection: 'row', gap: 8 },
  headerButton: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  statusBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 10, marginHorizontal: 16, marginTop: 12, borderRadius: 10 },
  statusBannerText: { fontSize: 13, fontWeight: '600' },
  scrollView: { flex: 1 },
  contractHeader: { margin: 16 },
  contractHeaderGradient: { padding: 24, borderRadius: 20, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(147, 51, 234, 0.2)' },
  contractTitle: { fontSize: 18, fontWeight: '700', marginTop: 12, textAlign: 'center' },
  contractNumber: { fontSize: 12, marginTop: 8 },
  contractDate: { fontSize: 11, marginTop: 4 },
  partiesSection: { marginHorizontal: 16, marginBottom: 16 },
  partyCard: { padding: 16, backgroundColor: 'rgba(255, 255, 255, 0.02)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.04)' },
  partyHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  partyIcon: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  partyLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  partyName: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  partyRep: { fontSize: 12, marginBottom: 10 },
  partyContact: { gap: 6 },
  partyContactItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  partyContactText: { fontSize: 11 },
  signatureStatus: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12, paddingVertical: 8, paddingHorizontal: 10, backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: 8 },
  signatureStatusText: { fontSize: 11, fontWeight: '500' },
  partyDivider: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12 },
  partyDividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(255, 255, 255, 0.08)', marginHorizontal: 16 },
  serviceSummary: { marginHorizontal: 16, marginBottom: 16, backgroundColor: 'rgba(255, 255, 255, 0.02)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.04)', overflow: 'hidden' },
  serviceSummaryHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255, 255, 255, 0.04)' },
  serviceSummaryTitle: { fontSize: 14, fontWeight: '600' },
  serviceSummaryContent: { padding: 16 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(255, 255, 255, 0.04)' },
  summaryRowTotal: { borderBottomWidth: 0, paddingTop: 12, marginTop: 4 },
  summaryLabel: { fontSize: 13 },
  summaryValue: { fontSize: 13, fontWeight: '500' },
  summaryLabelTotal: { fontSize: 14, fontWeight: '600' },
  summaryValueTotal: { fontSize: 18, fontWeight: '700' },
  contractSections: { marginHorizontal: 16, marginBottom: 16 },
  sectionsTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  sectionCard: { padding: 16, backgroundColor: 'rgba(255, 255, 255, 0.02)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.04)', marginBottom: 10 },
  sectionTitle: { fontSize: 13, fontWeight: '700', marginBottom: 10 },
  sectionContent: { fontSize: 12, lineHeight: 20 },
  signatureSection: { marginHorizontal: 16, marginBottom: 16 },
  signatureSectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  signatureBoxes: { flexDirection: 'row', gap: 12 },
  signatureBox: { flex: 1 },
  signatureBoxLabel: { fontSize: 11, fontWeight: '600', marginBottom: 8, textAlign: 'center' },
  signatureArea: { height: 120, backgroundColor: 'rgba(255, 255, 255, 0.02)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.06)', borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' },
  signatureAreaSigned: { borderStyle: 'solid', borderColor: 'rgba(16, 185, 129, 0.3)', backgroundColor: 'rgba(16, 185, 129, 0.05)' },
  signedText: { fontSize: 12, fontWeight: '600', marginTop: 6 },
  signedDate: { fontSize: 10, marginTop: 2 },
  pendingSignature: { fontSize: 12 },
  signButton: { alignItems: 'center', gap: 6 },
  signButtonText: { fontSize: 12, fontWeight: '600' },
  bottomActions: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, paddingBottom: 32, borderTopWidth: 1 },
  signContractButton: { borderRadius: 14, overflow: 'hidden' },
  signContractGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 16 },
  signContractText: { fontSize: 16, fontWeight: '700', color: 'white' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.8)', justifyContent: 'flex-end' },
  signatureModal: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  modalTitle: { fontSize: 20, fontWeight: '700' },
  modalSubtitle: { fontSize: 13, marginBottom: 20 },
  signaturePad: { marginBottom: 20 },
  signaturePadInner: { height: 180, borderRadius: 16, borderWidth: 2, borderColor: 'rgba(147, 51, 234, 0.3)', borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' },
  signaturePadPlaceholder: { fontSize: 14 },
  clearSignatureButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 12 },
  clearSignatureText: { fontSize: 12 },
  agreementSection: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, padding: 16, backgroundColor: 'rgba(16, 185, 129, 0.08)', borderRadius: 12, marginBottom: 20 },
  agreementText: { flex: 1, fontSize: 12, lineHeight: 18 },
  modalActions: { flexDirection: 'row', gap: 12 },
  modalCancelButton: { flex: 1, paddingVertical: 14, alignItems: 'center', borderRadius: 12 },
  modalCancelText: { fontSize: 14, fontWeight: '600' },
  modalConfirmButton: { flex: 2, borderRadius: 12, overflow: 'hidden' },
  modalConfirmGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14 },
  modalConfirmText: { fontSize: 14, fontWeight: '700', color: 'white' },
});
