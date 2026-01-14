import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  Linking,
  Alert,
  Modal,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  Share,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { darkTheme as defaultColors, gradients } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';
import {
  TeamMember,
  Task,
  ScheduleItem,
  PaymentItem,
  EventDocument,
  EventDetail,
  mockSchedule,
  getProviderEventById,
  getTeamByEventId,
  getTasksByEventId,
  getPaymentsByEventId,
  getDocumentsByEventId,
  getStatusColor,
  getPriorityColor,
  getPaymentStatusInfo,
  getDocumentIcon,
  formatFileSize,
} from '../data/providerEventData';
import {
  CheckInStatus,
  getCheckInStatus,
  performCheckIn,
  performCheckOut,
  startBreak,
  endBreak,
  formatWorkingTime,
  calculateWorkingMinutes,
  formatTime,
} from '../services/checkInService';
import { RatingModal } from '../components/rating';

// Route params type
type RootStackParamList = {
  ProviderEventDetail: { eventId: string };
  Chat: { chatId: string; recipientName: string };
};

type ProviderEventDetailRouteProp = RouteProp<RootStackParamList, 'ProviderEventDetail'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const colors = defaultColors;
const { width } = Dimensions.get('window');

export function ProviderEventDetailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ProviderEventDetailRouteProp>();
  const { colors, isDark, helpers } = useTheme();
  const insets = useSafeAreaInsets();
  const TAB_BAR_HEIGHT = 80;

  // Get eventId from route params
  const eventId = route.params?.eventId || 'pe1';

  // State
  const [activeSection, setActiveSection] = useState<'overview' | 'tasks' | 'team' | 'schedule' | 'payments' | 'documents'>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [documents, setDocuments] = useState<EventDocument[]>([]);

  // Modal states
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');

  // Check-in states
  const [checkInStatus, setCheckInStatus] = useState<CheckInStatus | null>(null);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [currentWorkingMinutes, setCurrentWorkingMinutes] = useState(0);

  // Rating Modal State
  const [showRatingModal, setShowRatingModal] = useState(false);

  // Load event data
  const loadEventData = useCallback(async () => {
    const eventData = getProviderEventById(eventId);
    if (eventData) {
      setEvent(eventData);
      setTasks(getTasksByEventId(eventId));
      setTeam(getTeamByEventId(eventId));
      setPayments(getPaymentsByEventId(eventId));
      setDocuments(getDocumentsByEventId(eventId));
    }

    // Load check-in status
    const status = await getCheckInStatus(eventId);
    setCheckInStatus(status);

    setIsLoading(false);
    setRefreshing(false);
  }, [eventId]);

  useEffect(() => {
    loadEventData();
  }, [loadEventData]);

  // Update working minutes timer
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (checkInStatus?.isCheckedIn && checkInStatus.checkInTime) {
      // Check if on break
      const isOnBreak = checkInStatus.breaks.some(b => !b.endTime);

      if (!isOnBreak) {
        interval = setInterval(() => {
          const minutes = calculateWorkingMinutes(
            checkInStatus.checkInTime!,
            null,
            checkInStatus.breaks
          );
          setCurrentWorkingMinutes(minutes);
        }, 60000); // Update every minute

        // Initial calculation
        const minutes = calculateWorkingMinutes(
          checkInStatus.checkInTime,
          null,
          checkInStatus.breaks
        );
        setCurrentWorkingMinutes(minutes);
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [checkInStatus]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadEventData();
  }, [loadEventData]);

  // Hooks must be called before any early returns
  const taskStats = useMemo(() => {
    const completed = tasks.filter(t => t.status === 'completed').length;
    const inProgress = tasks.filter(t => t.status === 'in_progress').length;
    const pending = tasks.filter(t => t.status === 'pending').length;
    return { completed, inProgress, pending, total: tasks.length };
  }, [tasks]);

  const paymentStats = useMemo(() => {
    const paid = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
    const pending = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);
    return { paid, pending, total: event?.earnings || 0 };
  }, [payments, event?.earnings]);

  // If event not found
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.brand[500]} />
          <Text style={[styles.loadingText, { color: colors.textMuted }]}>Yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!event) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
          <Text style={[styles.errorText, { color: colors.text }]}>Etkinlik bulunamadı</Text>
          <TouchableOpacity
            style={[styles.backToListButton, { backgroundColor: colors.brand[500] }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backToListText}>Geri Dön</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleCompleteTask = (taskId: string) => {
    setTasks(prev => prev.map(task =>
      task.id === taskId
        ? { ...task, status: 'completed' as const }
        : task
    ));
  };

  const handleStartTask = (taskId: string) => {
    setTasks(prev => prev.map(task =>
      task.id === taskId && task.status === 'pending'
        ? { ...task, status: 'in_progress' as const }
        : task
    ));
  };

  // Handler functions
  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) {
      Alert.alert('Hata', 'Görev başlığı gereklidir');
      return;
    }

    const newTask: Task = {
      id: `task_${Date.now()}`,
      title: newTaskTitle.trim(),
      description: newTaskDescription.trim(),
      dueDate: new Date().toLocaleDateString('tr-TR'),
      status: 'pending',
      priority: newTaskPriority,
      createdAt: new Date().toLocaleDateString('tr-TR'),
    };

    setTasks(prev => [...prev, newTask]);
    setNewTaskTitle('');
    setNewTaskDescription('');
    setNewTaskPriority('medium');
    setShowAddTaskModal(false);
    Alert.alert('Başarılı', 'Görev eklendi');
  };

  const handleDeleteTask = (taskId: string) => {
    Alert.alert(
      'Görevi Sil',
      'Bu görevi silmek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => {
            setTasks(prev => prev.filter(t => t.id !== taskId));
            Alert.alert('Başarılı', 'Görev silindi');
          },
        },
      ]
    );
  };

  // Check-in handler
  const handleCheckIn = async () => {
    if (!event) return;

    setIsCheckingIn(true);

    // Mock event location (in real app, this would come from event data)
    const eventLocation = {
      latitude: 41.0082, // Istanbul coordinates
      longitude: 28.9784,
      venueName: event.venue,
      address: event.venue,
    };

    // For demo purposes, skip location check (set to false for production)
    const result = await performCheckIn(eventId, eventLocation, true);

    setIsCheckingIn(false);

    if (result.success) {
      setCheckInStatus(result.status || null);
      Alert.alert('Check-in Başarılı', result.message);
    } else {
      Alert.alert('Check-in Hatası', result.message);
    }
  };

  // Check-out handler
  const handleCheckOut = async () => {
    Alert.alert(
      'Check-out',
      'Çalışmanızı bitirmek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Check-out Yap',
          style: 'destructive',
          onPress: async () => {
            setIsCheckingIn(true);
            const result = await performCheckOut(eventId);
            setIsCheckingIn(false);

            if (result.success) {
              setCheckInStatus(result.status || null);
              Alert.alert('Check-out Başarılı', result.message);
            } else {
              Alert.alert('Check-out Hatası', result.message);
            }
          },
        },
      ]
    );
  };

  // Break handler
  const handleBreak = async () => {
    const isOnBreak = checkInStatus?.breaks.some(b => !b.endTime);

    if (isOnBreak) {
      // End break
      setIsCheckingIn(true);
      const result = await endBreak(eventId);
      setIsCheckingIn(false);

      if (result.success) {
        setCheckInStatus(result.status || null);
        Alert.alert('Mola Bitti', result.message);
      } else {
        Alert.alert('Hata', result.message);
      }
    } else {
      // Start break
      Alert.alert(
        'Mola',
        'Mola vermek istediğinizden emin misiniz?',
        [
          { text: 'İptal', style: 'cancel' },
          {
            text: 'Mola Başlat',
            onPress: async () => {
              setIsCheckingIn(true);
              const result = await startBreak(eventId);
              setIsCheckingIn(false);

              if (result.success) {
                setCheckInStatus(result.status || null);
                Alert.alert('Mola Başladı', result.message);
              } else {
                Alert.alert('Hata', result.message);
              }
            },
          },
        ]
      );
    }
  };

  const handleSupport = () => {
    Alert.alert(
      'Destek',
      'Nasıl yardımcı olabiliriz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Organizatöre Sor',
          onPress: () => navigation.navigate('Chat', { chatId: `org_${event.organizerId}`, recipientName: event.organizerName }),
        },
        {
          text: 'Destek Hattını Ara',
          onPress: () => Linking.openURL('tel:+908501234567'),
        },
      ]
    );
  };

  const handleInvoice = () => {
    Alert.alert(
      'Fatura Oluştur',
      'Fatura oluşturmak istediğiniz ödemeyi seçin:',
      [
        { text: 'İptal', style: 'cancel' },
        ...payments.filter(p => p.status === 'paid').map(p => ({
          text: `${p.title} - ₺${p.amount.toLocaleString('tr-TR')}`,
          onPress: () => Alert.alert('Başarılı', `${p.title} için fatura oluşturuldu`),
        })),
      ]
    );
  };

  const handleDocumentDownload = (doc: EventDocument) => {
    Alert.alert(
      'Döküman İndir',
      `${doc.name} indirilsin mi?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'İndir',
          onPress: () => Alert.alert('Başarılı', `${doc.name} indiriliyor...`),
        },
      ]
    );
  };

  // Handle share
  const handleShare = async () => {
    try {
      await Share.share({
        message: `${event.eventTitle}\n📅 ${event.eventDate}\n📍 ${event.venue}\n🎯 Rolüm: ${event.role}\n\nTuring ile yönetiyorum.`,
        title: event.eventTitle,
      });
    } catch (error) {
      Alert.alert('Hata', 'Paylaşım sırasında bir hata oluştu');
    }
  };

  // Handle menu
  const handleMenu = () => {
    Alert.alert(
      'İş Seçenekleri',
      'Ne yapmak istiyorsunuz?',
      [
        { text: 'Takvime Ekle', onPress: () => Alert.alert('Eklendi', 'Etkinlik takviminize eklendi.') },
        { text: 'Hatırlatıcı Kur', onPress: () => Alert.alert('Ayarlandı', 'Etkinlikten 1 gün önce hatırlatılacak.') },
        { text: 'Sorun Bildir', onPress: () => navigation.navigate('Chat', { chatId: `org_${event.organizerId}`, recipientName: event.organizerName }) },
        { text: 'Sözleşmeyi Görüntüle', onPress: () => Alert.alert('Sözleşme', 'Sözleşme dökümanı açılıyor...') },
        { text: 'İptal', style: 'cancel' },
      ]
    );
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
    const statusColor = getStatusColor(task.status, colors);
    const priorityColor = getPriorityColor(task.priority, colors);
    const statusLabels: Record<string, string> = {
      pending: 'Bekliyor',
      in_progress: 'Devam Ediyor',
      completed: 'Tamamlandı',
    };

    return (
      <View key={task.id} style={[
        styles.taskCard,
        {
          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground,
          borderColor: isDark ? 'rgba(255, 255, 255, 0.04)' : colors.border,
        },
        ...(isDark ? [] : [helpers.getShadow('sm')]),
        task.status === 'completed' && { opacity: 0.7 },
      ]}>
        <View style={styles.taskHeader}>
          <View style={[styles.taskStatusDot, { backgroundColor: statusColor }]} />
          <View style={styles.taskInfo}>
            <Text style={[styles.taskTitle, { color: colors.text }, task.status === 'completed' && { textDecorationLine: 'line-through' }]}>{task.title}</Text>
            <Text style={[styles.taskDescription, { color: colors.textMuted }]}>{task.description}</Text>
          </View>
          <View style={[styles.priorityBadge, { backgroundColor: `${priorityColor}20` }]}>
            <Text style={[styles.priorityText, { color: priorityColor }]}>
              {task.priority === 'high' ? 'Yüksek' : task.priority === 'medium' ? 'Orta' : 'Düşük'}
            </Text>
          </View>
        </View>
        <View style={styles.taskFooter}>
          <View style={styles.taskDueDate}>
            <Ionicons name="calendar-outline" size={12} color={colors.textMuted} />
            <Text style={[styles.taskDueDateText, { color: colors.textMuted }]}>{task.dueDate}</Text>
          </View>
          <View style={styles.taskStatusLabel}>
            <Text style={[styles.taskStatusLabelText, { color: statusColor }]}>{statusLabels[task.status]}</Text>
          </View>
        </View>
        <View style={styles.taskActions}>
          {task.status === 'pending' && (
            <TouchableOpacity
              style={[styles.taskActionButton, { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)' }]}
              onPress={() => handleStartTask(task.id)}
            >
              <Ionicons name="play" size={14} color={colors.info} />
              <Text style={[styles.taskActionText, { color: colors.info }]}>Başla</Text>
            </TouchableOpacity>
          )}
          {task.status === 'in_progress' && (
            <TouchableOpacity
              style={[styles.taskActionButton, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)' }]}
              onPress={() => handleCompleteTask(task.id)}
            >
              <Ionicons name="checkmark-circle" size={14} color={colors.success} />
              <Text style={[styles.taskActionText, { color: colors.success }]}>Tamamla</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.taskActionButton, { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.1)' }]}
            onPress={() => handleDeleteTask(task.id)}
          >
            <Ionicons name="trash-outline" size={14} color={colors.error} />
            <Text style={[styles.taskActionText, { color: colors.error }]}>Sil</Text>
          </TouchableOpacity>
        </View>
      </View>
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
    const statusInfo = getPaymentStatusInfo(payment.status, colors);

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

  // Render document item
  const renderDocument = (doc: EventDocument) => {
    const iconName = getDocumentIcon(doc.fileType);
    const iconColor = doc.type === 'contract' ? colors.brand[400] :
                      doc.type === 'plan' ? colors.success :
                      doc.type === 'rider' ? colors.info : colors.warning;

    return (
      <TouchableOpacity
        key={doc.id}
        style={[
          styles.documentItem,
          {
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground,
            borderColor: isDark ? 'rgba(255, 255, 255, 0.04)' : colors.border,
          },
          ...(isDark ? [] : [helpers.getShadow('sm')]),
        ]}
        onPress={() => handleDocumentDownload(doc)}
      >
        <View style={[styles.documentIcon, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.surfaceAlt }]}>
          <Ionicons name={iconName as any} size={20} color={iconColor} />
        </View>
        <View style={styles.documentInfo}>
          <Text style={[styles.documentName, { color: colors.text }]}>{doc.name}</Text>
          <Text style={[styles.documentSize, { color: colors.textMuted }]}>
            {formatFileSize(doc.size)} • {doc.uploadedAt}
          </Text>
        </View>
        <Ionicons name="download-outline" size={20} color={colors.textMuted} />
      </TouchableOpacity>
    );
  };

  // Render team member for Team tab (extended view)
  const renderTeamMemberExtended = (member: TeamMember) => {
    const statusColor = member.status === 'available' ? colors.success :
                        member.status === 'busy' ? colors.warning : colors.textMuted;
    const statusLabel = member.status === 'available' ? 'Müsait' :
                        member.status === 'busy' ? 'Meşgul' : 'İzinli';

    return (
      <View key={member.id} style={[
        styles.teamMemberExtended,
        {
          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground,
          borderColor: isDark ? 'rgba(255, 255, 255, 0.04)' : colors.border,
        },
        ...(isDark ? [] : [helpers.getShadow('sm')]),
      ]}>
        <View style={styles.teamMemberHeader}>
          <Image source={{ uri: member.image }} style={styles.teamMemberImageLarge} />
          <View style={styles.teamMemberMainInfo}>
            <Text style={[styles.teamMemberName, { color: colors.text }]}>{member.name}</Text>
            <Text style={[styles.teamMemberRole, { color: colors.textMuted }]}>{member.role}</Text>
            <View style={styles.teamMemberStatusRow}>
              <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
              <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
            </View>
          </View>
          <View style={styles.teamMemberActions}>
            <TouchableOpacity
              style={[styles.teamActionButton, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.1)' }]}
              onPress={() => handleCall(member.phone)}
            >
              <Ionicons name="call" size={16} color={colors.success} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.teamActionButton, { backgroundColor: isDark ? 'rgba(147, 51, 234, 0.1)' : 'rgba(147, 51, 234, 0.1)' }]}
              onPress={() => Linking.openURL(`mailto:${member.email}`)}
            >
              <Ionicons name="mail" size={16} color={colors.brand[400]} />
            </TouchableOpacity>
          </View>
        </View>
        {member.assignedTasks.length > 0 && (
          <View style={styles.assignedTasksInfo}>
            <Ionicons name="checkbox-outline" size={14} color={colors.textMuted} />
            <Text style={[styles.assignedTasksText, { color: colors.textMuted }]}>
              {member.assignedTasks.length} atanmış görev
            </Text>
          </View>
        )}
        {member.checkInStatus?.checkedIn && (
          <View style={styles.checkInInfo}>
            <Ionicons name="location" size={14} color={colors.success} />
            <Text style={[styles.checkInText, { color: colors.success }]}>
              Check-in: {member.checkInStatus.time}
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.brand[500]}
          />
        }
      >
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

          {/* Header Actions */}
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerActionButton} onPress={handleShare}>
              <Ionicons name="share-outline" size={20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerActionButton} onPress={handleMenu}>
              <Ionicons name="ellipsis-horizontal" size={20} color="white" />
            </TouchableOpacity>
          </View>

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
            <TouchableOpacity
              style={[styles.organizerActionButton, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.surfaceAlt }]}
              onPress={() => navigation.navigate('Chat', { chatId: `org_${event.organizerId || '1'}`, recipientName: event.organizerName })}
            >
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
        <View style={[styles.tabContainer, { borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : colors.border }]}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabContent}
          >
            <TouchableOpacity
              style={styles.tab}
              onPress={() => setActiveSection('overview')}
            >
              <Text style={[styles.tabText, { color: activeSection === 'overview' ? colors.brand[400] : colors.textMuted }]}>
                Genel
              </Text>
              {activeSection === 'overview' && <View style={[styles.tabIndicator, { backgroundColor: colors.brand[400] }]} />}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.tab}
              onPress={() => setActiveSection('tasks')}
            >
              <Text style={[styles.tabText, { color: activeSection === 'tasks' ? colors.brand[400] : colors.textMuted }]}>
                Görevler {taskStats.pending > 0 && `(${taskStats.pending})`}
              </Text>
              {activeSection === 'tasks' && <View style={[styles.tabIndicator, { backgroundColor: colors.brand[400] }]} />}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.tab}
              onPress={() => setActiveSection('schedule')}
            >
              <Text style={[styles.tabText, { color: activeSection === 'schedule' ? colors.brand[400] : colors.textMuted }]}>
                Program
              </Text>
              {activeSection === 'schedule' && <View style={[styles.tabIndicator, { backgroundColor: colors.brand[400] }]} />}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.tab}
              onPress={() => setActiveSection('team')}
            >
              <Text style={[styles.tabText, { color: activeSection === 'team' ? colors.brand[400] : colors.textMuted }]}>
                Ekip ({team.length})
              </Text>
              {activeSection === 'team' && <View style={[styles.tabIndicator, { backgroundColor: colors.brand[400] }]} />}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.tab}
              onPress={() => setActiveSection('payments')}
            >
              <Text style={[styles.tabText, { color: activeSection === 'payments' ? colors.brand[400] : colors.textMuted }]}>
                Ödemeler
              </Text>
              {activeSection === 'payments' && <View style={[styles.tabIndicator, { backgroundColor: colors.brand[400] }]} />}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.tab}
              onPress={() => setActiveSection('documents')}
            >
              <Text style={[styles.tabText, { color: activeSection === 'documents' ? colors.brand[400] : colors.textMuted }]}>
                Dökümanlar ({documents.length})
              </Text>
              {activeSection === 'documents' && <View style={[styles.tabIndicator, { backgroundColor: colors.brand[400] }]} />}
            </TouchableOpacity>
          </ScrollView>
        </View>

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
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 0 }]}>Ekip</Text>
                <TouchableOpacity onPress={() => setActiveSection('team')}>
                  <Text style={[styles.seeAllText, { color: colors.brand[400] }]}>Tümünü Gör</Text>
                </TouchableOpacity>
              </View>
              {team.length > 0 ? (
                team.slice(0, 3).map(member => renderTeamMember(member))
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons name="people-outline" size={32} color={colors.textMuted} />
                  <Text style={[styles.emptyStateText, { color: colors.textMuted }]}>Henüz ekip üyesi yok</Text>
                </View>
              )}
            </View>

            {/* Documents */}
            <View style={styles.sectionBlock}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 0 }]}>Dökümanlar</Text>
                <TouchableOpacity onPress={() => setActiveSection('documents')}>
                  <Text style={[styles.seeAllText, { color: colors.brand[400] }]}>Tümünü Gör</Text>
                </TouchableOpacity>
              </View>
              {documents.length > 0 ? (
                documents.slice(0, 3).map(doc => renderDocument(doc))
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons name="folder-outline" size={32} color={colors.textMuted} />
                  <Text style={[styles.emptyStateText, { color: colors.textMuted }]}>Henüz döküman yok</Text>
                </View>
              )}
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
            {tasks.length > 0 ? (
              tasks.map(task => renderTask(task))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="checkbox-outline" size={48} color={colors.textMuted} />
                <Text style={[styles.emptyStateText, { color: colors.textMuted }]}>Henüz görev yok</Text>
                <Text style={[styles.emptyStateSubtext, { color: colors.textMuted }]}>
                  Yeni görev ekleyerek başlayın
                </Text>
              </View>
            )}
            {/* Add Task Button */}
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: 'rgba(147, 51, 234, 0.1)' }]}
              onPress={() => setShowAddTaskModal(true)}
            >
              <Ionicons name="add-circle-outline" size={20} color={colors.brand[400]} />
              <Text style={[styles.addButtonText, { color: colors.brand[400] }]}>Görev Ekle</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Team Section */}
        {activeSection === 'team' && (
          <View style={styles.teamSection}>
            <View style={styles.teamStats}>
              <View style={styles.teamStatItem}>
                <View style={[styles.teamStatDot, { backgroundColor: colors.success }]} />
                <Text style={[styles.teamStatText, { color: colors.textSecondary }]}>
                  {team.filter(t => t.status === 'available').length} Müsait
                </Text>
              </View>
              <View style={styles.teamStatItem}>
                <View style={[styles.teamStatDot, { backgroundColor: colors.warning }]} />
                <Text style={[styles.teamStatText, { color: colors.textSecondary }]}>
                  {team.filter(t => t.status === 'busy').length} Meşgul
                </Text>
              </View>
              <View style={styles.teamStatItem}>
                <View style={[styles.teamStatDot, { backgroundColor: colors.textMuted }]} />
                <Text style={[styles.teamStatText, { color: colors.textSecondary }]}>
                  {team.filter(t => t.status === 'off').length} İzinli
                </Text>
              </View>
            </View>
            {team.length > 0 ? (
              team.map(member => renderTeamMemberExtended(member))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="people-outline" size={48} color={colors.textMuted} />
                <Text style={[styles.emptyStateText, { color: colors.textMuted }]}>Henüz ekip üyesi yok</Text>
                <Text style={[styles.emptyStateSubtext, { color: colors.textMuted }]}>
                  Ekip üyeleri organizatör tarafından atanır
                </Text>
              </View>
            )}
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
            {payments.length > 0 ? (
              payments.map(payment => renderPayment(payment))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="wallet-outline" size={48} color={colors.textMuted} />
                <Text style={[styles.emptyStateText, { color: colors.textMuted }]}>Henüz ödeme yok</Text>
              </View>
            )}

            {/* Invoice Button */}
            <TouchableOpacity
              style={[styles.invoiceButton, { backgroundColor: 'rgba(147, 51, 234, 0.1)' }]}
              onPress={handleInvoice}
            >
              <Ionicons name="document-text-outline" size={18} color={colors.brand[400]} />
              <Text style={[styles.invoiceButtonText, { color: colors.brand[400] }]}>Fatura Oluştur</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Documents Section */}
        {activeSection === 'documents' && (
          <View style={styles.documentsSection}>
            {documents.length > 0 ? (
              <>
                {/* Group by type */}
                {documents.filter(d => d.type === 'contract').length > 0 && (
                  <View style={styles.documentGroup}>
                    <Text style={[styles.documentGroupTitle, { color: colors.textMuted }]}>Sözleşmeler</Text>
                    {documents.filter(d => d.type === 'contract').map(doc => renderDocument(doc))}
                  </View>
                )}
                {documents.filter(d => d.type === 'plan').length > 0 && (
                  <View style={styles.documentGroup}>
                    <Text style={[styles.documentGroupTitle, { color: colors.textMuted }]}>Planlar</Text>
                    {documents.filter(d => d.type === 'plan').map(doc => renderDocument(doc))}
                  </View>
                )}
                {documents.filter(d => d.type === 'rider').length > 0 && (
                  <View style={styles.documentGroup}>
                    <Text style={[styles.documentGroupTitle, { color: colors.textMuted }]}>Teknik Rider</Text>
                    {documents.filter(d => d.type === 'rider').map(doc => renderDocument(doc))}
                  </View>
                )}
                {documents.filter(d => !['contract', 'plan', 'rider'].includes(d.type)).length > 0 && (
                  <View style={styles.documentGroup}>
                    <Text style={[styles.documentGroupTitle, { color: colors.textMuted }]}>Diğer</Text>
                    {documents.filter(d => !['contract', 'plan', 'rider'].includes(d.type)).map(doc => renderDocument(doc))}
                  </View>
                )}
              </>
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="folder-outline" size={48} color={colors.textMuted} />
                <Text style={[styles.emptyStateText, { color: colors.textMuted }]}>Henüz döküman yok</Text>
                <Text style={[styles.emptyStateSubtext, { color: colors.textMuted }]}>
                  Dökümanlar organizatör tarafından paylaşılır
                </Text>
              </View>
            )}
          </View>
        )}

        <View style={{ height: 180 }} />
      </ScrollView>

      {/* Bottom Actions */}
      <View style={[
        styles.bottomActions,
        {
          backgroundColor: colors.background,
          borderTopColor: isDark ? 'rgba(255, 255, 255, 0.06)' : colors.border,
          paddingBottom: insets.bottom + TAB_BAR_HEIGHT,
        },
      ]}>
        {/* Check-in Status Card */}
        {checkInStatus?.isCheckedIn && (
          <View style={[
            styles.checkInStatusCard,
            {
              backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.08)',
              borderColor: isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.15)',
            }
          ]}>
            <View style={styles.checkInStatusHeader}>
              <View style={styles.checkInStatusLeft}>
                <View style={[styles.checkInStatusDot, { backgroundColor: checkInStatus.breaks.some(b => !b.endTime) ? colors.warning : colors.success }]} />
                <Text style={[styles.checkInStatusText, { color: colors.text }]}>
                  {checkInStatus.breaks.some(b => !b.endTime) ? 'Molada' : 'Çalışıyor'}
                </Text>
              </View>
              <View style={styles.checkInStatusRight}>
                <Ionicons name="time-outline" size={14} color={colors.textMuted} />
                <Text style={[styles.checkInStatusTime, { color: colors.text }]}>
                  {formatWorkingTime(currentWorkingMinutes)}
                </Text>
              </View>
            </View>
            <View style={styles.checkInStatusDetails}>
              <Text style={[styles.checkInStatusDetail, { color: colors.textMuted }]}>
                Giriş: {checkInStatus.checkInTime ? formatTime(new Date(checkInStatus.checkInTime)) : '-'}
              </Text>
              {checkInStatus.breaks.length > 0 && (
                <Text style={[styles.checkInStatusDetail, { color: colors.textMuted }]}>
                  Mola: {checkInStatus.breaks.length}x
                </Text>
              )}
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.checkInActions}>
          {checkInStatus?.isCheckedIn ? (
            <>
              {/* Break Button */}
              <TouchableOpacity
                style={[
                  styles.breakButton,
                  {
                    backgroundColor: checkInStatus.breaks.some(b => !b.endTime)
                      ? 'rgba(16, 185, 129, 0.15)'
                      : isDark ? 'rgba(245, 158, 11, 0.15)' : 'rgba(245, 158, 11, 0.1)',
                    borderColor: checkInStatus.breaks.some(b => !b.endTime)
                      ? 'rgba(16, 185, 129, 0.3)'
                      : isDark ? 'rgba(245, 158, 11, 0.3)' : 'rgba(245, 158, 11, 0.2)',
                  },
                ]}
                onPress={handleBreak}
                disabled={isCheckingIn}
              >
                <Ionicons
                  name={checkInStatus.breaks.some(b => !b.endTime) ? 'play' : 'pause'}
                  size={18}
                  color={checkInStatus.breaks.some(b => !b.endTime) ? colors.success : colors.warning}
                />
                <Text style={[
                  styles.breakButtonText,
                  { color: checkInStatus.breaks.some(b => !b.endTime) ? colors.success : colors.warning }
                ]}>
                  {checkInStatus.breaks.some(b => !b.endTime) ? 'Devam Et' : 'Mola'}
                </Text>
              </TouchableOpacity>

              {/* Check-out Button */}
              <TouchableOpacity
                style={styles.checkOutButton}
                onPress={handleCheckOut}
                disabled={isCheckingIn}
              >
                <LinearGradient
                  colors={['#ef4444', '#dc2626']}
                  style={styles.checkOutGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  {isCheckingIn ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <>
                      <Ionicons name="log-out-outline" size={18} color="white" />
                      <Text style={styles.checkOutText}>Check-out</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </>
          ) : event?.status === 'completed' ? (
            <>
              {/* Support Button */}
              <TouchableOpacity
                style={[
                  styles.supportButton,
                  {
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.surfaceAlt,
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : colors.border,
                  },
                ]}
                onPress={handleSupport}
              >
                <Ionicons name="help-circle-outline" size={20} color={colors.text} />
                <Text style={[styles.supportButtonText, { color: colors.text }]}>Destek</Text>
              </TouchableOpacity>

              {/* Review Organizer Button */}
              <TouchableOpacity
                style={styles.checkInButton}
                onPress={() => setShowRatingModal(true)}
              >
                <LinearGradient
                  colors={['#F59E0B', '#FBBF24']}
                  style={styles.checkInGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Ionicons name="star" size={18} color="white" />
                  <Text style={styles.checkInButtonText}>Organizatoru Degerlendir</Text>
                </LinearGradient>
              </TouchableOpacity>
            </>
          ) : (
            <>
              {/* Support Button */}
              <TouchableOpacity
                style={[
                  styles.supportButton,
                  {
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.surfaceAlt,
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : colors.border,
                  },
                ]}
                onPress={handleSupport}
              >
                <Ionicons name="help-circle-outline" size={20} color={colors.text} />
                <Text style={[styles.supportButtonText, { color: colors.text }]}>Destek</Text>
              </TouchableOpacity>

              {/* Check-in Button */}
              <TouchableOpacity
                style={styles.checkInButton}
                onPress={handleCheckIn}
                disabled={isCheckingIn}
              >
                <LinearGradient
                  colors={gradients.primary}
                  style={styles.checkInGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  {isCheckingIn ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <>
                      <Ionicons name="location" size={18} color="white" />
                      <Text style={styles.checkInButtonText}>Check-in Yap</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      {/* Add Task Modal */}
      <Modal
        visible={showAddTaskModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddTaskModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[
            styles.modalContent,
            {
              backgroundColor: colors.background,
              borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : colors.border,
            },
          ]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Yeni Görev Ekle</Text>
              <TouchableOpacity onPress={() => setShowAddTaskModal(false)}>
                <Ionicons name="close" size={24} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Görev Başlığı *</Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.surfaceAlt,
                    color: colors.text,
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : colors.border,
                  },
                ]}
                placeholder="Görev başlığını girin"
                placeholderTextColor={colors.textMuted}
                value={newTaskTitle}
                onChangeText={setNewTaskTitle}
              />

              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Açıklama</Text>
              <TextInput
                style={[
                  styles.textInput,
                  styles.textArea,
                  {
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.surfaceAlt,
                    color: colors.text,
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : colors.border,
                  },
                ]}
                placeholder="Görev açıklamasını girin"
                placeholderTextColor={colors.textMuted}
                value={newTaskDescription}
                onChangeText={setNewTaskDescription}
                multiline
                numberOfLines={3}
              />

              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Öncelik</Text>
              <View style={styles.priorityOptions}>
                {(['low', 'medium', 'high'] as const).map(priority => (
                  <TouchableOpacity
                    key={priority}
                    style={[
                      styles.priorityOption,
                      {
                        backgroundColor: newTaskPriority === priority
                          ? (priority === 'high' ? 'rgba(239, 68, 68, 0.15)' :
                             priority === 'medium' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)')
                          : isDark ? 'rgba(255, 255, 255, 0.05)' : colors.surfaceAlt,
                        borderColor: newTaskPriority === priority
                          ? (priority === 'high' ? colors.error :
                             priority === 'medium' ? colors.warning : colors.success)
                          : isDark ? 'rgba(255, 255, 255, 0.1)' : colors.border,
                      },
                    ]}
                    onPress={() => setNewTaskPriority(priority)}
                  >
                    <Text style={[
                      styles.priorityOptionText,
                      {
                        color: newTaskPriority === priority
                          ? (priority === 'high' ? colors.error :
                             priority === 'medium' ? colors.warning : colors.success)
                          : colors.textSecondary,
                      },
                    ]}>
                      {priority === 'high' ? 'Yüksek' : priority === 'medium' ? 'Orta' : 'Düşük'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[
                  styles.modalCancelButton,
                  {
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.surfaceAlt,
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : colors.border,
                  },
                ]}
                onPress={() => setShowAddTaskModal(false)}
              >
                <Text style={[styles.modalCancelText, { color: colors.text }]}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalSubmitButton, { backgroundColor: colors.brand[500] }]}
                onPress={handleAddTask}
              >
                <Text style={styles.modalSubmitText}>Ekle</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Rating Modal */}
      {event && (
        <RatingModal
          visible={showRatingModal}
          onClose={() => setShowRatingModal(false)}
          target={{
            id: event.organizerId,
            name: event.organizerName,
            image: event.organizerImage,
            type: 'organizer',
          }}
          event={{
            id: event.id,
            title: event.eventTitle,
            date: event.eventDate,
          }}
          reviewerType="provider"
          onSubmit={(review) => {
            setShowRatingModal(false);
            Alert.alert('Basarili', 'Degerlendirmeniz gonderildi!');
          }}
        />
      )}
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
  headerActions: {
    position: 'absolute',
    top: 12,
    right: 16,
    flexDirection: 'row',
    gap: 8,
  },
  headerActionButton: {
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
  tabContainer: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderBottomWidth: 1,
  },
  tabContent: {
    flexDirection: 'row',
    gap: 8,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    position: 'relative',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: -1,
    left: 12,
    right: 12,
    height: 2,
    borderRadius: 1,
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
  taskStatusLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskStatusLabelText: {
    fontSize: 11,
    fontWeight: '500',
  },
  taskActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.04)',
    gap: 8,
  },
  taskActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  taskActionText: {
    fontSize: 12,
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
  // Check-in Status Card
  checkInStatusCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 12,
  },
  checkInStatusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  checkInStatusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkInStatusRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  checkInStatusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  checkInStatusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  checkInStatusTime: {
    fontSize: 16,
    fontWeight: '700',
  },
  checkInStatusDetails: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 16,
  },
  checkInStatusDetail: {
    fontSize: 12,
  },
  // Check-in Actions
  checkInActions: {
    flexDirection: 'row',
    gap: 12,
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
  checkInButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'white',
  },
  // Break Button
  breakButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 8,
  },
  breakButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  // Check-out Button
  checkOutButton: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  checkOutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    gap: 8,
  },
  checkOutText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'white',
  },
  // Loading & Error states
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 16,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
  },
  backToListButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  backToListText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  // Empty states
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 8,
  },
  emptyStateText: {
    fontSize: 15,
    fontWeight: '500',
    marginTop: 8,
  },
  emptyStateSubtext: {
    fontSize: 13,
    textAlign: 'center',
  },
  // See all text
  seeAllText: {
    fontSize: 13,
    fontWeight: '500',
  },
  // Add button
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    marginTop: 8,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  // Team section
  teamSection: {
    padding: 20,
  },
  teamStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  teamStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  teamStatDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  teamStatText: {
    fontSize: 12,
  },
  teamMemberExtended: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  teamMemberHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  teamMemberImageLarge: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  teamMemberMainInfo: {
    flex: 1,
    marginLeft: 14,
  },
  teamMemberStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  teamMemberActions: {
    flexDirection: 'row',
    gap: 8,
  },
  teamActionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  assignedTasksInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.04)',
    gap: 6,
  },
  assignedTasksText: {
    fontSize: 12,
  },
  checkInInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  checkInText: {
    fontSize: 12,
    fontWeight: '500',
  },
  // Documents section
  documentsSection: {
    padding: 20,
  },
  documentGroup: {
    marginBottom: 20,
  },
  documentGroupTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderBottomWidth: 0,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalBody: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  priorityOptions: {
    flexDirection: 'row',
    gap: 10,
  },
  priorityOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
  },
  priorityOptionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    paddingTop: 0,
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: '500',
  },
  modalSubmitButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalSubmitText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
});
