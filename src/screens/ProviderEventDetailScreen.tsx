import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { darkTheme as defaultColors, gradients } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';

const colors = defaultColors;

const { width } = Dimensions.get('window');

interface TeamMember {
  id: string;
  name: string;
  role: string;
  phone: string;
  image: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
}

interface ScheduleItem {
  id: string;
  time: string;
  title: string;
  stage: string;
  duration: string;
}

interface PaymentItem {
  id: string;
  title: string;
  amount: number;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue';
  paidDate?: string;
}

// Mock data
const mockEventDetail = {
  id: 'pe1',
  eventTitle: 'Yaz Festivali 2024',
  eventDate: '15-17 Temmuz 2024',
  eventTime: '16:00 - 04:00',
  venue: 'KüsümPark Açık Hava',
  location: 'İstanbul, Kadıköy',
  image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800',
  organizerName: 'Event Masters',
  organizerImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
  organizerPhone: '+90 532 123 4567',
  role: 'Ses Sistemi Sağlayıcı',
  category: 'technical',
  status: 'confirmed',
  earnings: 85000,
  description: 'İstanbulun en büyük açık hava festivali için komple ses sistemi kurulumu ve operasyonu. 3 gün boyunca 50+ sanatçı performansı.',
};

const mockTeam: TeamMember[] = [
  { id: 't1', name: 'Ahmet Yılmaz', role: 'Ses Mühendisi', phone: '+90 532 111 2233', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200' },
  { id: 't2', name: 'Mehmet Kaya', role: 'Teknik Asistan', phone: '+90 533 222 3344', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200' },
  { id: 't3', name: 'Ayşe Demir', role: 'Sahne Koordinatörü', phone: '+90 534 333 4455', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200' },
];

const mockTasks: Task[] = [
  { id: 'task1', title: 'Ekipman Listesi Hazırla', description: 'Festival için gerekli tüm ses ekipmanlarını listele', dueDate: '10 Temmuz', status: 'completed', priority: 'high' },
  { id: 'task2', title: 'Araç Kiralama', description: 'Ekipman taşıma için TIR kiralama', dueDate: '12 Temmuz', status: 'completed', priority: 'high' },
  { id: 'task3', title: 'Sahne Planı İnceleme', description: 'Organizatörden gelen sahne planını incele', dueDate: '13 Temmuz', status: 'in_progress', priority: 'medium' },
  { id: 'task4', title: 'Ekip Briefing', description: 'Tüm ekip ile toplantı yapma', dueDate: '14 Temmuz', status: 'pending', priority: 'medium' },
  { id: 'task5', title: 'Kurulum', description: 'Ses sistemi kurulumu', dueDate: '14-15 Temmuz', status: 'pending', priority: 'high' },
];

const mockSchedule: ScheduleItem[] = [
  { id: 's1', time: '16:00', title: 'Açılış DJ Seti', stage: 'Ana Sahne', duration: '2 saat' },
  { id: 's2', time: '18:00', title: 'Local Band Performance', stage: 'Ana Sahne', duration: '1.5 saat' },
  { id: 's3', time: '20:00', title: 'DJ Burak Yeter', stage: 'Ana Sahne', duration: '2 saat' },
  { id: 's4', time: '22:30', title: 'Mabel Matiz', stage: 'Ana Sahne', duration: '2 saat' },
  { id: 's5', time: '00:30', title: 'Closing DJ Set', stage: 'Ana Sahne', duration: '3 saat' },
];

const mockPayments: PaymentItem[] = [
  { id: 'p1', title: 'Ön Ödeme (%50)', amount: 42500, dueDate: '1 Temmuz', status: 'paid', paidDate: '28 Haziran' },
  { id: 'p2', title: 'Kalan Ödeme (%50)', amount: 42500, dueDate: '18 Temmuz', status: 'pending' },
];

export function ProviderEventDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const [activeSection, setActiveSection] = useState<'overview' | 'tasks' | 'schedule' | 'payments'>('overview');
  const { colors, isDark, helpers } = useTheme();

  const event = mockEventDetail;

  // Calculate task stats
  const taskStats = useMemo(() => {
    const completed = mockTasks.filter(t => t.status === 'completed').length;
    const inProgress = mockTasks.filter(t => t.status === 'in_progress').length;
    const pending = mockTasks.filter(t => t.status === 'pending').length;
    return { completed, inProgress, pending, total: mockTasks.length };
  }, []);

  // Calculate payment stats
  const paymentStats = useMemo(() => {
    const paid = mockPayments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
    const pending = mockPayments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);
    return { paid, pending, total: event.earnings };
  }, [event.earnings]);

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const renderTeamMember = (member: TeamMember) => (
    <View key={member.id} style={[
      styles.teamMember,
      {
        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground,
        borderColor: isDark ? 'rgba(255, 255, 255, 0.04)' : colors.border,
      },
      ...(isDark ? [] : [helpers.getShadow('sm')]),
    ]}>
      <Image source={{ uri: member.image }} style={styles.teamMemberImage} />
      <View style={styles.teamMemberInfo}>
        <Text style={[styles.teamMemberName, { color: colors.text }]}>{member.name}</Text>
        <Text style={[styles.teamMemberRole, { color: colors.textMuted }]}>{member.role}</Text>
      </View>
      <TouchableOpacity
        style={styles.callButton}
        onPress={() => handleCall(member.phone)}
      >
        <Ionicons name="call" size={18} color={colors.success} />
      </TouchableOpacity>
    </View>
  );

  const renderTask = (task: Task) => {
    const getStatusColor = (status: string) => {
      switch (status) {
        case 'completed': return colors.success;
        case 'in_progress': return colors.warning;
        case 'pending': return colors.textMuted;
        default: return colors.textMuted;
      }
    };

    const getPriorityColor = (priority: string) => {
      switch (priority) {
        case 'high': return colors.error;
        case 'medium': return colors.warning;
        case 'low': return colors.success;
        default: return colors.textMuted;
      }
    };

    return (
      <TouchableOpacity key={task.id} style={[
        styles.taskCard,
        {
          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground,
          borderColor: isDark ? 'rgba(255, 255, 255, 0.04)' : colors.border,
        },
        ...(isDark ? [] : [helpers.getShadow('sm')]),
      ]}>
        <View style={styles.taskHeader}>
          <View style={[styles.taskStatusDot, { backgroundColor: getStatusColor(task.status) }]} />
          <View style={styles.taskInfo}>
            <Text style={[styles.taskTitle, { color: colors.text }]}>{task.title}</Text>
            <Text style={[styles.taskDescription, { color: colors.textMuted }]}>{task.description}</Text>
          </View>
          <View style={[styles.priorityBadge, { backgroundColor: `${getPriorityColor(task.priority)}20` }]}>
            <Text style={[styles.priorityText, { color: getPriorityColor(task.priority) }]}>
              {task.priority === 'high' ? 'Yüksek' : task.priority === 'medium' ? 'Orta' : 'Düşük'}
            </Text>
          </View>
        </View>
        <View style={styles.taskFooter}>
          <View style={styles.taskDueDate}>
            <Ionicons name="calendar-outline" size={12} color={colors.textMuted} />
            <Text style={[styles.taskDueDateText, { color: colors.textMuted }]}>{task.dueDate}</Text>
          </View>
          {task.status !== 'completed' && (
            <TouchableOpacity style={styles.completeButton}>
              <Ionicons name="checkmark" size={14} color={colors.success} />
              <Text style={[styles.completeButtonText, { color: colors.success }]}>Tamamla</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderScheduleItem = (item: ScheduleItem, index: number) => (
    <View key={item.id} style={styles.scheduleItem}>
      <View style={styles.scheduleTime}>
        <Text style={[styles.scheduleTimeText, { color: colors.brand[400] }]}>{item.time}</Text>
        <Text style={[styles.scheduleDuration, { color: colors.textMuted }]}>{item.duration}</Text>
      </View>
      <View style={styles.scheduleLineContainer}>
        <View style={[styles.scheduleDot, { backgroundColor: colors.brand[500] }]} />
        {index < mockSchedule.length - 1 && <View style={[styles.scheduleLine, { backgroundColor: colors.brand[700] }]} />}
      </View>
      <View style={styles.scheduleContent}>
        <Text style={[styles.scheduleTitle, { color: colors.text }]}>{item.title}</Text>
        <View style={styles.scheduleStage}>
          <Ionicons name="location-outline" size={12} color={colors.textMuted} />
          <Text style={[styles.scheduleStageText, { color: colors.textMuted }]}>{item.stage}</Text>
        </View>
      </View>
    </View>
  );

  const renderPayment = (payment: PaymentItem) => {
    const getStatusInfo = (status: string) => {
      switch (status) {
        case 'paid': return { label: 'Ödendi', color: colors.success, icon: 'checkmark-circle' as const };
        case 'pending': return { label: 'Bekliyor', color: colors.warning, icon: 'time' as const };
        case 'overdue': return { label: 'Gecikmiş', color: colors.error, icon: 'alert-circle' as const };
        default: return { label: status, color: colors.textMuted, icon: 'help-circle' as const };
      }
    };

    const statusInfo = getStatusInfo(payment.status);

    return (
      <View key={payment.id} style={[
        styles.paymentCard,
        {
          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground,
          borderColor: isDark ? 'rgba(255, 255, 255, 0.04)' : colors.border,
        },
        ...(isDark ? [] : [helpers.getShadow('sm')]),
      ]}>
        <View style={styles.paymentHeader}>
          <View style={styles.paymentInfo}>
            <Text style={[styles.paymentTitle, { color: colors.text }]}>{payment.title}</Text>
            <Text style={[styles.paymentDueDate, { color: colors.textMuted }]}>
              {payment.status === 'paid' ? `Ödeme: ${payment.paidDate}` : `Vade: ${payment.dueDate}`}
            </Text>
          </View>
          <View style={[styles.paymentStatusBadge, { backgroundColor: `${statusInfo.color}20` }]}>
            <Ionicons name={statusInfo.icon} size={12} color={statusInfo.color} />
            <Text style={[styles.paymentStatusText, { color: statusInfo.color }]}>
              {statusInfo.label}
            </Text>
          </View>
        </View>
        <Text style={[styles.paymentAmount, { color: colors.text }]}>₺{payment.amount.toLocaleString('tr-TR')}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Image */}
        <View style={styles.headerImage}>
          <Image source={{ uri: event.image }} style={styles.eventImage} />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.9)']}
            style={styles.imageGradient}
          />

          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>

          {/* Event Info */}
          <View style={styles.headerContent}>
            <View style={styles.roleContainer}>
              <LinearGradient
                colors={gradients.technical}
                style={styles.roleBadge}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="volume-high" size={12} color="white" />
                <Text style={styles.roleText}>{event.role}</Text>
              </LinearGradient>
            </View>
            <Text style={styles.eventTitle}>{event.eventTitle}</Text>
            <View style={styles.eventMeta}>
              <View style={styles.eventMetaItem}>
                <Ionicons name="calendar" size={14} color="white" />
                <Text style={styles.eventMetaText}>{event.eventDate}</Text>
              </View>
              <View style={styles.eventMetaItem}>
                <Ionicons name="location" size={14} color="white" />
                <Text style={styles.eventMetaText}>{event.venue}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Organizer Card */}
        <View style={[
          styles.organizerCard,
          {
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground,
            borderColor: isDark ? 'rgba(255, 255, 255, 0.04)' : colors.border,
          },
          ...(isDark ? [] : [helpers.getShadow('sm')]),
        ]}>
          <Image source={{ uri: event.organizerImage }} style={styles.organizerImage} />
          <View style={styles.organizerInfo}>
            <Text style={[styles.organizerLabel, { color: colors.textMuted }]}>Organizatör</Text>
            <Text style={[styles.organizerName, { color: colors.text }]}>{event.organizerName}</Text>
          </View>
          <View style={styles.organizerActions}>
            <TouchableOpacity
              style={[styles.organizerActionButton, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.surfaceAlt }]}
              onPress={() => handleCall(event.organizerPhone)}
            >
              <Ionicons name="call" size={18} color={colors.success} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.organizerActionButton, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.surfaceAlt }]}>
              <Ionicons name="chatbubble" size={18} color={colors.brand[400]} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Earnings Summary */}
        <View style={styles.earningsSummary}>
          <LinearGradient
            colors={gradients.primary}
            style={styles.earningsGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.earningsContent}>
              <View style={styles.earningsItem}>
                <Text style={styles.earningsLabel}>Toplam Kazanç</Text>
                <Text style={styles.earningsValue}>₺{event.earnings.toLocaleString('tr-TR')}</Text>
              </View>
              <View style={styles.earningsDivider} />
              <View style={styles.earningsItem}>
                <Text style={styles.earningsLabel}>Alınan</Text>
                <Text style={styles.earningsValue}>₺{paymentStats.paid.toLocaleString('tr-TR')}</Text>
              </View>
              <View style={styles.earningsDivider} />
              <View style={styles.earningsItem}>
                <Text style={styles.earningsLabel}>Bekleyen</Text>
                <Text style={styles.earningsValue}>₺{paymentStats.pending.toLocaleString('tr-TR')}</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Section Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.sectionTabs}
        >
          <TouchableOpacity
            style={[
              styles.sectionTab,
              {
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.surfaceAlt,
                borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : colors.border,
              },
              activeSection === 'overview' && {
                backgroundColor: 'rgba(147, 51, 234, 0.15)',
                borderColor: 'rgba(147, 51, 234, 0.3)',
              },
            ]}
            onPress={() => setActiveSection('overview')}
          >
            <Ionicons
              name={activeSection === 'overview' ? 'information-circle' : 'information-circle-outline'}
              size={14}
              color={activeSection === 'overview' ? colors.brand[400] : colors.textMuted}
            />
            <Text style={[
              styles.sectionTabText,
              { color: activeSection === 'overview' ? colors.brand[400] : colors.textSecondary },
            ]}>
              Genel
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.sectionTab,
              {
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.surfaceAlt,
                borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : colors.border,
              },
              activeSection === 'tasks' && {
                backgroundColor: 'rgba(147, 51, 234, 0.15)',
                borderColor: 'rgba(147, 51, 234, 0.3)',
              },
            ]}
            onPress={() => setActiveSection('tasks')}
          >
            <Ionicons
              name={activeSection === 'tasks' ? 'checkbox' : 'checkbox-outline'}
              size={14}
              color={activeSection === 'tasks' ? colors.brand[400] : colors.textMuted}
            />
            <Text style={[
              styles.sectionTabText,
              { color: activeSection === 'tasks' ? colors.brand[400] : colors.textSecondary },
            ]}>
              Görevler
            </Text>
            <View style={styles.sectionTabBadge}>
              <Text style={styles.sectionTabBadgeText}>{taskStats.pending}</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.sectionTab,
              {
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.surfaceAlt,
                borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : colors.border,
              },
              activeSection === 'schedule' && {
                backgroundColor: 'rgba(147, 51, 234, 0.15)',
                borderColor: 'rgba(147, 51, 234, 0.3)',
              },
            ]}
            onPress={() => setActiveSection('schedule')}
          >
            <Ionicons
              name={activeSection === 'schedule' ? 'calendar' : 'calendar-outline'}
              size={14}
              color={activeSection === 'schedule' ? colors.brand[400] : colors.textMuted}
            />
            <Text style={[
              styles.sectionTabText,
              { color: activeSection === 'schedule' ? colors.brand[400] : colors.textSecondary },
            ]}>
              Program
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.sectionTab,
              {
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.surfaceAlt,
                borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : colors.border,
              },
              activeSection === 'payments' && {
                backgroundColor: 'rgba(147, 51, 234, 0.15)',
                borderColor: 'rgba(147, 51, 234, 0.3)',
              },
            ]}
            onPress={() => setActiveSection('payments')}
          >
            <Ionicons
              name={activeSection === 'payments' ? 'wallet' : 'wallet-outline'}
              size={14}
              color={activeSection === 'payments' ? colors.brand[400] : colors.textMuted}
            />
            <Text style={[
              styles.sectionTabText,
              { color: activeSection === 'payments' ? colors.brand[400] : colors.textSecondary },
            ]}>
              Ödemeler
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Overview Section */}
        {activeSection === 'overview' && (
          <View style={styles.overviewSection}>
            {/* Description */}
            <View style={styles.sectionBlock}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Açıklama</Text>
              <Text style={[styles.descriptionText, { color: colors.textSecondary }]}>{event.description}</Text>
            </View>

            {/* Task Progress */}
            <View style={styles.sectionBlock}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Görev İlerlemesi</Text>
                <Text style={[styles.sectionSubtitle, { color: colors.textMuted }]}>
                  {taskStats.completed}/{taskStats.total} tamamlandı
                </Text>
              </View>
              <View style={[styles.progressBar, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : colors.surfaceAlt }]}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${(taskStats.completed / taskStats.total) * 100}%`, backgroundColor: colors.brand[500] }
                  ]}
                />
              </View>
            </View>

            {/* Team */}
            <View style={styles.sectionBlock}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Ekip ({mockTeam.length} kişi)</Text>
              {mockTeam.map(member => renderTeamMember(member))}
            </View>

            {/* Documents */}
            <View style={styles.sectionBlock}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Dökümanlar</Text>
              <TouchableOpacity style={[
                styles.documentItem,
                {
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground,
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.04)' : colors.border,
                },
                ...(isDark ? [] : [helpers.getShadow('sm')]),
              ]}>
                <View style={[styles.documentIcon, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.surfaceAlt }]}>
                  <Ionicons name="document-text" size={20} color={colors.brand[400]} />
                </View>
                <View style={styles.documentInfo}>
                  <Text style={[styles.documentName, { color: colors.text }]}>Sözleşme.pdf</Text>
                  <Text style={[styles.documentSize, { color: colors.textMuted }]}>2.4 MB</Text>
                </View>
                <Ionicons name="download-outline" size={20} color={colors.textMuted} />
              </TouchableOpacity>
              <TouchableOpacity style={[
                styles.documentItem,
                {
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground,
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.04)' : colors.border,
                },
                ...(isDark ? [] : [helpers.getShadow('sm')]),
              ]}>
                <View style={[styles.documentIcon, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.surfaceAlt }]}>
                  <Ionicons name="document-text" size={20} color={colors.success} />
                </View>
                <View style={styles.documentInfo}>
                  <Text style={[styles.documentName, { color: colors.text }]}>Sahne_Plani.pdf</Text>
                  <Text style={[styles.documentSize, { color: colors.textMuted }]}>5.1 MB</Text>
                </View>
                <Ionicons name="download-outline" size={20} color={colors.textMuted} />
              </TouchableOpacity>
              <TouchableOpacity style={[
                styles.documentItem,
                {
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground,
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.04)' : colors.border,
                },
                ...(isDark ? [] : [helpers.getShadow('sm')]),
              ]}>
                <View style={[styles.documentIcon, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.surfaceAlt }]}>
                  <Ionicons name="image" size={20} color={colors.warning} />
                </View>
                <View style={styles.documentInfo}>
                  <Text style={[styles.documentName, { color: colors.text }]}>Ekipman_Listesi.xlsx</Text>
                  <Text style={[styles.documentSize, { color: colors.textMuted }]}>156 KB</Text>
                </View>
                <Ionicons name="download-outline" size={20} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Tasks Section */}
        {activeSection === 'tasks' && (
          <View style={styles.tasksSection}>
            <View style={styles.taskStats}>
              <View style={styles.taskStatItem}>
                <View style={[styles.taskStatDot, { backgroundColor: colors.success }]} />
                <Text style={[styles.taskStatText, { color: colors.textSecondary }]}>{taskStats.completed} Tamamlandı</Text>
              </View>
              <View style={styles.taskStatItem}>
                <View style={[styles.taskStatDot, { backgroundColor: colors.warning }]} />
                <Text style={[styles.taskStatText, { color: colors.textSecondary }]}>{taskStats.inProgress} Devam Ediyor</Text>
              </View>
              <View style={styles.taskStatItem}>
                <View style={[styles.taskStatDot, { backgroundColor: colors.textMuted }]} />
                <Text style={[styles.taskStatText, { color: colors.textSecondary }]}>{taskStats.pending} Bekliyor</Text>
              </View>
            </View>
            {mockTasks.map(task => renderTask(task))}
          </View>
        )}

        {/* Schedule Section */}
        {activeSection === 'schedule' && (
          <View style={styles.scheduleSection}>
            <View style={styles.scheduleHeader}>
              <Text style={[styles.scheduleDate, { color: colors.text }]}>15 Temmuz 2024 - 1. Gün</Text>
            </View>
            {mockSchedule.map((item, index) => renderScheduleItem(item, index))}
          </View>
        )}

        {/* Payments Section */}
        {activeSection === 'payments' && (
          <View style={styles.paymentsSection}>
            {mockPayments.map(payment => renderPayment(payment))}

            {/* Invoice Button */}
            <TouchableOpacity style={[styles.invoiceButton, { backgroundColor: 'rgba(147, 51, 234, 0.1)' }]}>
              <Ionicons name="document-text-outline" size={18} color={colors.brand[400]} />
              <Text style={[styles.invoiceButtonText, { color: colors.brand[400] }]}>Fatura Oluştur</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom Actions */}
      <View style={[
        styles.bottomActions,
        {
          backgroundColor: colors.background,
          borderTopColor: isDark ? 'rgba(255, 255, 255, 0.06)' : colors.border,
        },
      ]}>
        <TouchableOpacity style={[
          styles.supportButton,
          {
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.surfaceAlt,
            borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : colors.border,
          },
        ]}>
          <Ionicons name="help-circle-outline" size={20} color={colors.text} />
          <Text style={[styles.supportButtonText, { color: colors.text }]}>Destek</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.checkInButton}>
          <LinearGradient
            colors={gradients.primary}
            style={styles.checkInGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons name="location" size={18} color="white" />
            <Text style={styles.checkInText}>Check-in Yap</Text>
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
  headerImage: {
    height: 260,
    position: 'relative',
  },
  eventImage: {
    width: '100%',
    height: '100%',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 180,
  },
  backButton: {
    position: 'absolute',
    top: 12,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  roleContainer: {
    marginBottom: 10,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 6,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  eventTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  eventMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  eventMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  eventMetaText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  organizerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 20,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  organizerImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  organizerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  organizerLabel: {
    fontSize: 11,
    marginBottom: 2,
  },
  organizerName: {
    fontSize: 15,
    fontWeight: '600',
  },
  organizerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  organizerActionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  earningsSummary: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  earningsGradient: {
    borderRadius: 16,
    padding: 16,
  },
  earningsContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  earningsItem: {
    flex: 1,
    alignItems: 'center',
  },
  earningsLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  earningsValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },
  earningsDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  sectionTabs: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 6,
  },
  sectionTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginRight: 6,
    gap: 4,
  },
  sectionTabActive: {
    backgroundColor: 'rgba(147, 51, 234, 0.15)',
    borderColor: 'rgba(147, 51, 234, 0.3)',
  },
  sectionTabText: {
    fontSize: 12,
    fontWeight: '500',
  },
  sectionTabTextActive: {
  },
  sectionTabBadge: {
    backgroundColor: colors.error,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 6,
  },
  sectionTabBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.white,
  },
  overviewSection: {
    padding: 20,
  },
  sectionBlock: {
    marginBottom: 24,
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
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 13,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 22,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.brand[500],
    borderRadius: 4,
  },
  teamMember: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  teamMemberImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  teamMemberInfo: {
    flex: 1,
    marginLeft: 12,
  },
  teamMemberName: {
    fontSize: 14,
    fontWeight: '600',
  },
  teamMemberRole: {
    fontSize: 12,
    marginTop: 2,
  },
  callButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  documentIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  documentInfo: {
    flex: 1,
    marginLeft: 12,
  },
  documentName: {
    fontSize: 14,
    fontWeight: '500',
  },
  documentSize: {
    fontSize: 11,
    marginTop: 2,
  },
  tasksSection: {
    padding: 20,
  },
  taskStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  taskStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  taskStatDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  taskStatText: {
    fontSize: 12,
  },
  taskCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  taskStatusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 4,
    marginRight: 12,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  taskDescription: {
    fontSize: 12,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '600',
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: 22,
  },
  taskDueDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  taskDueDateText: {
    fontSize: 11,
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 8,
  },
  completeButtonText: {
    fontSize: 11,
    fontWeight: '600',
  },
  scheduleSection: {
    padding: 20,
  },
  scheduleHeader: {
    marginBottom: 16,
  },
  scheduleDate: {
    fontSize: 15,
    fontWeight: '600',
  },
  scheduleItem: {
    flexDirection: 'row',
  },
  scheduleTime: {
    width: 60,
    alignItems: 'flex-end',
    paddingRight: 12,
  },
  scheduleTimeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  scheduleDuration: {
    fontSize: 10,
    marginTop: 2,
  },
  scheduleLineContainer: {
    alignItems: 'center',
    width: 20,
  },
  scheduleDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.brand[500],
    marginTop: 4,
  },
  scheduleLine: {
    width: 2,
    flex: 1,
    backgroundColor: colors.brand[700],
    marginTop: 4,
  },
  scheduleContent: {
    flex: 1,
    paddingLeft: 12,
    paddingBottom: 24,
  },
  scheduleTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  scheduleStage: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  scheduleStageText: {
    fontSize: 12,
  },
  paymentsSection: {
    padding: 20,
  },
  paymentCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  paymentDueDate: {
    fontSize: 12,
    marginTop: 2,
  },
  paymentStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  paymentStatusText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  paymentAmount: {
    fontSize: 20,
    fontWeight: '700',
  },
  invoiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(147, 51, 234, 0.1)',
    gap: 8,
    marginTop: 8,
  },
  invoiceButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 20,
    paddingBottom: 34,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    gap: 12,
  },
  supportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 8,
  },
  supportButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  checkInButton: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  checkInGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    gap: 8,
  },
  checkInText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'white',
  },
});
