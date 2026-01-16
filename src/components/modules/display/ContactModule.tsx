/**
 * ContactModule - İletişim Modülü
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../theme/ThemeContext';
import { ContactModuleData, ModuleConfig } from '../../../types/modules';

interface ContactModuleProps {
  data?: ContactModuleData;
  config: ModuleConfig;
  mode?: 'view' | 'edit' | 'form';
  onDataChange?: (data: ContactModuleData) => void;
}

export const ContactModule: React.FC<ContactModuleProps> = ({ data, config }) => {
  const { colors, isDark } = useTheme();

  if (!data) return null;

  const handleCall = (phone: string) => Linking.openURL(`tel:${phone}`);
  const handleEmail = (email: string) => Linking.openURL(`mailto:${email}`);

  const renderContact = (contact: { name: string; role?: string; phone: string; email?: string }, isPrimary: boolean) => (
    <View style={[styles.contactCard, { backgroundColor: isDark ? '#27272A' : '#F8FAFC' }]}>
      <View style={styles.contactInfo}>
        <Text style={[styles.contactName, { color: colors.text }]}>{contact.name}</Text>
        {contact.role && <Text style={[styles.contactRole, { color: colors.textSecondary }]}>{contact.role}</Text>}
      </View>
      <View style={styles.contactActions}>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]} onPress={() => handleCall(contact.phone)}>
          <Ionicons name="call" size={16} color="#10B981" />
        </TouchableOpacity>
        {contact.email && (
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: 'rgba(99, 102, 241, 0.1)' }]} onPress={() => handleEmail(contact.email!)}>
            <Ionicons name="mail" size={16} color="#6366F1" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {data.primaryContact && renderContact(data.primaryContact, true)}
      {data.secondaryContact && renderContact(data.secondaryContact, false)}
      {data.socialMedia && (
        <View style={styles.socialRow}>
          {data.socialMedia.instagram && (
            <TouchableOpacity style={styles.socialBtn} onPress={() => Linking.openURL(`https://instagram.com/${data.socialMedia!.instagram}`)}>
              <Ionicons name="logo-instagram" size={18} color="#E1306C" />
            </TouchableOpacity>
          )}
          {data.socialMedia.twitter && (
            <TouchableOpacity style={styles.socialBtn} onPress={() => Linking.openURL(`https://twitter.com/${data.socialMedia!.twitter}`)}>
              <Ionicons name="logo-twitter" size={18} color="#1DA1F2" />
            </TouchableOpacity>
          )}
          {data.socialMedia.facebook && (
            <TouchableOpacity style={styles.socialBtn} onPress={() => Linking.openURL(`https://facebook.com/${data.socialMedia!.facebook}`)}>
              <Ionicons name="logo-facebook" size={18} color="#4267B2" />
            </TouchableOpacity>
          )}
          {data.socialMedia.website && (
            <TouchableOpacity style={styles.socialBtn} onPress={() => Linking.openURL(data.socialMedia!.website!)}>
              <Ionicons name="globe-outline" size={18} color="#6366F1" />
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { gap: 8 },
  contactCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderRadius: 10 },
  contactInfo: { flex: 1 },
  contactName: { fontSize: 14, fontWeight: '600' },
  contactRole: { fontSize: 12, marginTop: 2 },
  contactActions: { flexDirection: 'row', gap: 8 },
  actionBtn: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  socialRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  socialBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(0,0,0,0.04)', alignItems: 'center', justifyContent: 'center' },
});

export default ContactModule;
