import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { ServiceCategory } from '../types';

// Types
type ServiceOperationsParams = {
  eventId: string;
  serviceId: string;
  serviceCategory: ServiceCategory;
  serviceName: string;
  providerName: string;
};

type TaskStatus = 'pending' | 'in_progress' | 'completed';

interface OperationTask {
  id: string;
  title: string;
  status: TaskStatus;
  assignee: string;
  time: string;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  image: string;
  phone: string;
  status: 'online' | 'busy' | 'offline';
}

interface ScheduleItem {
  id: string;
  time: string;
  title: string;
  status: 'done' | 'active' | 'upcoming';
}

// Service configurations
const serviceConfigs: Record<string, { title: string; icon: string }> = {
  technical: { title: 'Teknik Operasyonlar', icon: 'hardware-chip-outline' },
  booking: { title: 'Sanatçı Operasyonları', icon: 'musical-notes-outline' },
  catering: { title: 'Catering Operasyonları', icon: 'restaurant-outline' },
  security: { title: 'Güvenlik Operasyonları', icon: 'shield-outline' },
  transport: { title: 'Ulaşım Operasyonları', icon: 'car-outline' },
  decoration: { title: 'Dekorasyon Operasyonları', icon: 'color-palette-outline' },
  venue: { title: 'Mekan Operasyonları', icon: 'business-outline' },
  accommodation: { title: 'Konaklama Operasyonları', icon: 'bed-outline' },
};

// Sample data
const generateTasks = (category: string): OperationTask[] => {
  const tasks: Record<string, OperationTask[]> = {
    technical: [
      { id: '1', title: 'Ses sistemi kurulumu', status: 'completed', assignee: 'Serkan A.', time: '08:00' },
      { id: '2', title: 'Işık sistemleri montaj', status: 'in_progress', assignee: 'Deniz K.', time: '10:00' },
      { id: '3', title: 'Video/LED ekran test', status: 'pending', assignee: 'Can Y.', time: '14:00' },
      { id: '4', title: 'Ses kontrolü', status: 'pending', assignee: 'Burak S.', time: '17:00' },
    ],
    booking: [
      { id: '1', title: 'Rider kontrolü', status: 'completed', assignee: 'Cem K.', time: '09:00' },
      { id: '2', title: 'Backstage hazırlığı', status: 'in_progress', assignee: 'Emre T.', time: '12:00' },
      { id: '3', title: 'Ses kontrolü koordinasyonu', status: 'pending', assignee: 'Tolga B.', time: '16:00' },
    ],
    catering: [
      { id: '1', title: 'Mutfak kurulumu', status: 'completed', assignee: 'Ali Y.', time: '07:00' },
      { id: '2', title: 'Malzeme kontrolü', status: 'completed', assignee: 'Fatma D.', time: '09:00' },
      { id: '3', title: 'Ekip yemeği servisi', status: 'in_progress', assignee: 'Mehmet K.', time: '12:00' },
      { id: '4', title: 'VIP catering hazırlığı', status: 'pending', assignee: 'Ayşe B.', time: '17:00' },
    ],
    security: [
      { id: '1', title: 'Bariyer yerleşimi', status: 'completed', assignee: 'Hasan Ö.', time: '06:00' },
      { id: '2', title: 'Ekip briefing', status: 'in_progress', assignee: 'Ayşe Y.', time: '14:00' },
      { id: '3', title: 'Giriş noktaları kontrolü', status: 'pending', assignee: 'Murat C.', time: '17:00' },
    ],
    transport: [
      { id: '1', title: 'Araç kontrolleri', status: 'completed', assignee: 'Kemal A.', time: '08:00' },
      { id: '2', title: 'VIP transfer koordinasyonu', status: 'in_progress', assignee: 'Osman K.', time: '12:00' },
      { id: '3', title: 'Sanatçı transferi', status: 'pending', assignee: 'Yusuf Ş.', time: '15:00' },
    ],
    decoration: [
      { id: '1', title: 'Sahne dekorasyonu', status: 'in_progress', assignee: 'Selin A.', time: '08:00' },
      { id: '2', title: 'VIP alan düzenlemesi', status: 'pending', assignee: 'Burak Y.', time: '14:00' },
      { id: '3', title: 'Giriş alanı hazırlığı', status: 'pending', assignee: 'Zeynep K.', time: '16:00' },
    ],
  };
  return tasks[category] || tasks.technical;
};

const generateTeam = (category: string): TeamMember[] => {
  const teams: Record<string, TeamMember[]> = {
    technical: [
      { id: '1', name: 'Serkan Aydın', role: 'Teknik Direktör', image: 'https://i.pravatar.cc/100?img=11', phone: '+90 533 111 2233', status: 'online' },
      { id: '2', name: 'Deniz Kaya', role: 'Işık Operatörü', image: 'https://i.pravatar.cc/100?img=12', phone: '+90 533 222 3344', status: 'busy' },
      { id: '3', name: 'Can Yılmaz', role: 'Video Teknisyeni', image: 'https://i.pravatar.cc/100?img=13', phone: '+90 533 333 4455', status: 'online' },
    ],
    booking: [
      { id: '1', name: 'Cem Karaca', role: 'Tur Menajeri', image: 'https://i.pravatar.cc/100?img=14', phone: '+90 534 111 2233', status: 'online' },
      { id: '2', name: 'Emre Tunç', role: 'Sahne Müdürü', image: 'https://i.pravatar.cc/100?img=15', phone: '+90 534 222 3344', status: 'online' },
    ],
    catering: [
      { id: '1', name: 'Ali Yıldız', role: 'Şef', image: 'https://i.pravatar.cc/100?img=16', phone: '+90 535 111 2233', status: 'busy' },
      { id: '2', name: 'Fatma Demir', role: 'Operasyon Müdürü', image: 'https://i.pravatar.cc/100?img=17', phone: '+90 535 222 3344', status: 'online' },
    ],
    security: [
      { id: '1', name: 'Hasan Öztürk', role: 'Güvenlik Amiri', image: 'https://i.pravatar.cc/100?img=18', phone: '+90 536 111 2233', status: 'online' },
      { id: '2', name: 'Ayşe Yıldız', role: 'Saha Koordinatörü', image: 'https://i.pravatar.cc/100?img=19', phone: '+90 536 222 3344', status: 'online' },
    ],
    transport: [
      { id: '1', name: 'Kemal Arslan', role: 'Filo Müdürü', image: 'https://i.pravatar.cc/100?img=20', phone: '+90 537 111 2233', status: 'online' },
      { id: '2', name: 'Osman Koç', role: 'VIP Şoför', image: 'https://i.pravatar.cc/100?img=21', phone: '+90 537 222 3344', status: 'busy' },
    ],
    decoration: [
      { id: '1', name: 'Selin Acar', role: 'Tasarım Direktörü', image: 'https://i.pravatar.cc/100?img=22', phone: '+90 538 111 2233', status: 'online' },
      { id: '2', name: 'Burak Yılmaz', role: 'Dekoratör', image: 'https://i.pravatar.cc/100?img=23', phone: '+90 538 222 3344', status: 'offline' },
    ],
  };
  return teams[category] || teams.technical;
};

const generateSchedule = (category: string): ScheduleItem[] => {
  const schedules: Record<string, ScheduleItem[]> = {
    technical: [
      { id: '1', time: '06:00', title: 'Ekipman yükleme', status: 'done' },
      { id: '2', time: '08:00', title: 'Ses sistemi kurulum', status: 'done' },
      { id: '3', time: '10:00', title: 'Işık sistemi kurulum', status: 'active' },
      { id: '4', time: '14:00', title: 'Video sistemi test', status: 'upcoming' },
      { id: '5', time: '17:00', title: 'Ses kontrolü', status: 'upcoming' },
      { id: '6', time: '19:00', title: 'Final kontrol', status: 'upcoming' },
    ],
    booking: [
      { id: '1', time: '12:00', title: 'Sanatçı varış', status: 'upcoming' },
      { id: '2', time: '14:00', title: 'Ses kontrolü', status: 'upcoming' },
      { id: '3', time: '17:00', title: 'Dinlenme', status: 'upcoming' },
      { id: '4', time: '20:00', title: 'Performans', status: 'upcoming' },
    ],
    catering: [
      { id: '1', time: '07:00', title: 'Mutfak hazırlık', status: 'done' },
      { id: '2', time: '12:00', title: 'Ekip yemeği', status: 'active' },
      { id: '3', time: '17:00', title: 'VIP kokteyl', status: 'upcoming' },
      { id: '4', time: '19:00', title: 'Ana servis', status: 'upcoming' },
    ],
    security: [
      { id: '1', time: '06:00', title: 'Bariyer kurulum', status: 'done' },
      { id: '2', time: '14:00', title: 'Ekip toplantısı', status: 'active' },
      { id: '3', time: '18:00', title: 'Kapılar açık', status: 'upcoming' },
      { id: '4', time: '23:00', title: 'Tahliye', status: 'upcoming' },
    ],
    transport: [
      { id: '1', time: '08:00', title: 'Araç kontrol', status: 'done' },
      { id: '2', time: '12:00', title: 'Ekip transferi', status: 'active' },
      { id: '3', time: '15:00', title: 'Sanatçı transferi', status: 'upcoming' },
      { id: '4', time: '23:30', title: 'Dönüş transferi', status: 'upcoming' },
    ],
    decoration: [
      { id: '1', time: '06:00', title: 'Malzeme teslimi', status: 'done' },
      { id: '2', time: '08:00', title: 'Sahne dekorasyonu', status: 'active' },
      { id: '3', time: '14:00', title: 'VIP alan', status: 'upcoming' },
      { id: '4', time: '17:00', title: 'Final kontrol', status: 'upcoming' },
    ],
  };
  return schedules[category] || schedules.technical;
};

export function ServiceOperationsScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<{ params: ServiceOperationsParams }, 'params'>>();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();

  const { serviceCategory, serviceName, providerName } = route.params;
  const config = serviceConfigs[serviceCategory] || serviceConfigs.technical;

  const [activeTab, setActiveTab] = useState<'tasks' | 'schedule' | 'team'>('tasks');

  const tasks = useMemo(() => generateTasks(serviceCategory), [serviceCategory]);
  const team = useMemo(() => generateTeam(serviceCategory), [serviceCategory]);
  const schedule = useMemo(() => generateSchedule(serviceCategory), [serviceCategory]);

  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const progress = Math.round((completedTasks / tasks.length) * 100);

  const handleCall = useCallback((phone: string) => {
    Linking.openURL(`tel:${phone}`);
  }, []);

  const tabs = [
    { key: 'tasks', label: 'Görevler', count: tasks.length },
    { key: 'schedule', label: 'Program', count: schedule.length },
    { key: 'team', label: 'Ekip', count: team.length },
  ];

  const getStatusStyle = (status: TaskStatus) => {
    switch (status) {
      case 'completed':
        return { bg: isDark ? 'rgba(16, 185, 129, 0.15)' : '#ECFDF5', text: '#10B981' };
      case 'in_progress':
        return { bg: isDark ? 'rgba(59, 130, 246, 0.15)' : '#EFF6FF', text: '#3B82F6' };
      default:
        return { bg: isDark ? 'rgba(156, 163, 175, 0.15)' : '#F3F4F6', text: '#6B7280' };
    }
  };

  const getStatusLabel = (status: TaskStatus) => {
    switch (status) {
      case 'completed': return 'Tamamlandı';
      case 'in_progress': return 'Devam Ediyor';
      default: return 'Bekliyor';
    }
  };

  const getMemberStatusColor = (status: TeamMember['status']) => {
    switch (status) {
      case 'online': return '#10B981';
      case 'busy': return '#F59E0B';
      default: return '#9CA3AF';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#09090B' : '#FAFAFA' }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: isDark ? '#18181B' : '#FFFFFF', borderBottomColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{config.title}</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>{providerName}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Progress Bar */}
      <View style={[styles.progressSection, { backgroundColor: isDark ? '#18181B' : '#FFFFFF' }]}>
        <View style={styles.progressHeader}>
          <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>İlerleme</Text>
          <Text style={[styles.progressValue, { color: colors.text }]}>{completedTasks}/{tasks.length} görev</Text>
        </View>
        <View style={[styles.progressBar, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB' }]}>
          <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: '#10B981' }]} />
        </View>
      </View>

      {/* Tabs */}
      <View style={[styles.tabBar, { backgroundColor: isDark ? '#18181B' : '#FFFFFF', borderBottomColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }]}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key as any)}
          >
            <Text style={[
              styles.tabText,
              { color: activeTab === tab.key ? colors.text : colors.textSecondary },
              activeTab === tab.key && styles.tabTextActive
            ]}>
              {tab.label}
            </Text>
            <View style={[styles.tabBadge, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#F3F4F6' }]}>
              <Text style={[styles.tabBadgeText, { color: colors.textSecondary }]}>{tab.count}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Tasks Tab */}
        {activeTab === 'tasks' && (
          <View style={styles.list}>
            {tasks.map((task) => {
              const statusStyle = getStatusStyle(task.status);
              return (
                <View key={task.id} style={[styles.taskCard, { backgroundColor: isDark ? '#18181B' : '#FFFFFF', borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }]}>
                  <View style={styles.taskLeft}>
                    <View style={[styles.taskCheckbox, { borderColor: statusStyle.text, backgroundColor: task.status === 'completed' ? statusStyle.text : 'transparent' }]}>
                      {task.status === 'completed' && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
                    </View>
                  </View>
                  <View style={styles.taskContent}>
                    <Text style={[styles.taskTitle, { color: colors.text }, task.status === 'completed' && styles.taskTitleCompleted]}>{task.title}</Text>
                    <View style={styles.taskMeta}>
                      <Text style={[styles.taskMetaText, { color: colors.textSecondary }]}>{task.assignee}</Text>
                      <View style={styles.taskMetaDot} />
                      <Text style={[styles.taskMetaText, { color: colors.textSecondary }]}>{task.time}</Text>
                    </View>
                  </View>
                  <View style={[styles.taskStatus, { backgroundColor: statusStyle.bg }]}>
                    <Text style={[styles.taskStatusText, { color: statusStyle.text }]}>{getStatusLabel(task.status)}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Schedule Tab */}
        {activeTab === 'schedule' && (
          <View style={styles.list}>
            {schedule.map((item, index) => (
              <View key={item.id} style={styles.scheduleRow}>
                <View style={styles.scheduleTimeline}>
                  <View style={[
                    styles.scheduleTimelineDot,
                    { backgroundColor: item.status === 'done' ? '#10B981' : item.status === 'active' ? '#3B82F6' : isDark ? 'rgba(255,255,255,0.2)' : '#D1D5DB' }
                  ]} />
                  {index < schedule.length - 1 && (
                    <View style={[styles.scheduleTimelineLine, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB' }]} />
                  )}
                </View>
                <View style={[styles.scheduleCard, { backgroundColor: isDark ? '#18181B' : '#FFFFFF', borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }]}>
                  <Text style={[styles.scheduleTime, { color: item.status === 'active' ? '#3B82F6' : colors.textSecondary }]}>{item.time}</Text>
                  <Text style={[styles.scheduleTitle, { color: colors.text }]}>{item.title}</Text>
                  {item.status === 'active' && (
                    <View style={styles.scheduleActiveIndicator}>
                      <View style={styles.scheduleActiveDot} />
                      <Text style={styles.scheduleActiveText}>Şu an</Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Team Tab */}
        {activeTab === 'team' && (
          <View style={styles.list}>
            {team.map((member) => (
              <View key={member.id} style={[styles.teamCard, { backgroundColor: isDark ? '#18181B' : '#FFFFFF', borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }]}>
                <View style={styles.teamAvatarContainer}>
                  <Image source={{ uri: member.image }} style={styles.teamAvatar} />
                  <View style={[styles.teamStatusDot, { backgroundColor: getMemberStatusColor(member.status) }]} />
                </View>
                <View style={styles.teamInfo}>
                  <Text style={[styles.teamName, { color: colors.text }]}>{member.name}</Text>
                  <Text style={[styles.teamRole, { color: colors.textSecondary }]}>{member.role}</Text>
                </View>
                <TouchableOpacity
                  style={[styles.teamCallBtn, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : '#ECFDF5' }]}
                  onPress={() => handleCall(member.phone)}
                >
                  <Ionicons name="call-outline" size={18} color="#10B981" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: insets.bottom + 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  headerSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  progressSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  progressValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    marginRight: 24,
    gap: 8,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#3B82F6',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  tabTextActive: {
    fontWeight: '600',
  },
  tabBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  tabBadgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  list: {
    padding: 16,
  },
  // Task Card
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  taskLeft: {
    marginRight: 14,
  },
  taskCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 4,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskMetaText: {
    fontSize: 13,
  },
  taskMetaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#9CA3AF',
    marginHorizontal: 8,
  },
  taskStatus: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  taskStatusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  // Schedule
  scheduleRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  scheduleTimeline: {
    width: 20,
    alignItems: 'center',
    marginRight: 12,
  },
  scheduleTimelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  scheduleTimelineLine: {
    width: 2,
    flex: 1,
    marginTop: 6,
  },
  scheduleCard: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
  },
  scheduleTime: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  scheduleTitle: {
    fontSize: 15,
    fontWeight: '500',
  },
  scheduleActiveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  scheduleActiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#3B82F6',
    marginRight: 6,
  },
  scheduleActiveText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#3B82F6',
  },
  // Team
  teamCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  teamAvatarContainer: {
    position: 'relative',
    marginRight: 14,
  },
  teamAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  teamStatusDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  teamInfo: {
    flex: 1,
  },
  teamName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  teamRole: {
    fontSize: 13,
  },
  teamCallBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ServiceOperationsScreen;
