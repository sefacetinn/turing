import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Linking,
  Alert,
  Modal,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  Share,
  ScrollView,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
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
import { OptimizedImage } from '../components/OptimizedImage';

// Route params type
type RootStackParamList = {
  ProviderEventDetail: { eventId: string };
  Chat: { chatId: string; recipientName: string };
};

type ProviderEventDetailRouteProp = RouteProp<RootStackParamList, 'ProviderEventDetail'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const colors = defaultColors;
const { width } = Dimensions.get('window');

const HEADER_HEIGHT = 100;
const SCROLL_THRESHOLD = 200;

export function ProviderEventDetailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ProviderEventDetailRouteProp>();
  const { colors, isDark, helpers } = useTheme();
  const insets = useSafeAreaInsets();
  const TAB_BAR_HEIGHT = 80;

  // Animated scroll
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const headerBgStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [SCROLL_THRESHOLD - 50, SCROLL_THRESHOLD],
      [0, 1],
      Extrapolation.CLAMP
    );
    return { opacity };
  });

  const headerTitleStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [SCROLL_THRESHOLD - 30, SCROLL_THRESHOLD + 20],
      [0, 1],
      Extrapolation.CLAMP
    );
    const translateY = interpolate(
      scrollY.value,
      [SCROLL_THRESHOLD - 30, SCROLL_THRESHOLD + 20],
      [10, 0],
      Extrapolation.CLAMP
    );
    return { opacity, transform: [{ translateY }] };
  });

  // Get eventId from route params
  const eventId = route.params?.eventId || 'pe1';

  // State
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
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTasks(prev => prev.map(task =>
      task.id === taskId
        ? { ...task, status: 'completed' as const }
        : task
    ));
  };

  const handleStartTask = (taskId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTasks(prev => prev.map(task =>
      task.id === taskId && task.status === 'pending'
        ? { ...task, status: 'in_progress' as const }
        : task
    ));
  };

  // Handler functions
  const handleCall = (phone: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openURL(`tel:${phone}`);
  };

  const handleAddTask = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!newTaskTitle.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
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
      <OptimizedImage source={member.image} style={styles.teamMemberImage} />
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
          <OptimizedImage source={member.image} style={styles.teamMemberImageLarge} />
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
              style={[styles.teamActionButton, { backgroundColor: isDark ? 'rgba(75, 48, 184, 0.1)' : 'rgba(75, 48, 184, 0.1)' }]}
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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Animated Header */}
      <Animated.View style={[styles.animatedHeader, { paddingTop: insets.top }]}>
        <Animated.View style={[StyleSheet.absoluteFill, headerBgStyle]}>
          <BlurView intensity={80} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
          <View style={[StyleSheet.absoluteFill, { backgroundColor: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.85)' }]} />
        </Animated.View>
        <View style={styles.animatedHeaderContent}>
          <TouchableOpacity
            style={styles.animatedBackButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Animated.View style={[styles.animatedTitleContainer, headerTitleStyle]}>
            <Text style={[styles.animatedHeaderTitle, { color: colors.text }]} numberOfLines={1}>
              {event.eventTitle}
            </Text>
          </Animated.View>
          <View style={styles.animatedHeaderActions}>
            <TouchableOpacity style={styles.animatedHeaderAction} onPress={handleShare}>
              <Ionicons name="share-outline" size={20} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.animatedHeaderAction} onPress={handleMenu}>
              <Ionicons name="ellipsis-horizontal" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.brand[500]}
          />
        }
      >
        {/* Hero Image - Clean */}
        <View style={styles.heroImage}>
          <OptimizedImage source={event.image} style={styles.heroEventImage} />
          <LinearGradient
            colors={['rgba(0,0,0,0.4)', 'transparent', 'rgba(0,0,0,0.6)']}
            locations={[0, 0.5, 1]}
            style={styles.heroGradient}
          />
        </View>

        {/* Event Details Card - Below Image */}
        <View style={[
          styles.eventDetailsCard,
          {
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : colors.cardBackground,
            borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : colors.border,
          },
        ]}>
          {/* Event Title & Role */}
          <Text style={[styles.cardEventTitle, { color: colors.text }]}>{event.eventTitle}</Text>
          <View style={styles.detailsHeader}>
            <LinearGradient
              colors={gradients.technical}
              style={styles.detailsRoleBadge}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="volume-high" size={14} color="white" />
              <Text style={styles.detailsRoleText}>{event.role}</Text>
            </LinearGradient>
          </View>

          {/* Date, Time, Venue Grid */}
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <View style={[styles.detailIconBox, { backgroundColor: isDark ? 'rgba(75, 48, 184, 0.15)' : 'rgba(75, 48, 184, 0.1)' }]}>
                <Ionicons name="calendar" size={16} color={colors.brand[400]} />
              </View>
              <View style={styles.detailContent}>
                <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Tarih</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>{event.eventDate}</Text>
              </View>
            </View>
            <View style={styles.detailItem}>
              <View style={[styles.detailIconBox, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)' }]}>
                <Ionicons name="time" size={16} color="#10B981" />
              </View>
              <View style={styles.detailContent}>
                <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Saat</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>20:00 - 23:00</Text>
              </View>
            </View>
            <View style={[styles.detailItem, styles.detailItemFull]}>
              <View style={[styles.detailIconBox, { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.1)' }]}>
                <Ionicons name="location" size={16} color="#EF4444" />
              </View>
              <View style={styles.detailContent}>
                <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Mekan</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>{event.venue}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Organizer Card - Compact & Clickable */}
        <TouchableOpacity
          style={[
            styles.organizerCardCompact,
            {
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : colors.cardBackground,
              borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : colors.border,
            },
          ]}
          activeOpacity={0.7}
          onPress={() => (navigation as any).navigate('OrganizerProfile', { organizerId: event.organizerId || '1' })}
        >
          <OptimizedImage source={event.organizerImage} style={styles.organizerImageCompact} />
          <View style={styles.organizerInfoCompact}>
            <Text style={[styles.organizerLabelCompact, { color: colors.textMuted }]}>Organizatör</Text>
            <View style={styles.organizerNameRow}>
              <Text style={[styles.organizerNameCompact, { color: colors.text }]}>{event.organizerName}</Text>
              <Ionicons name="chevron-forward" size={14} color={colors.textMuted} />
            </View>
          </View>
          <View style={styles.organizerActionsCompact}>
            <TouchableOpacity
              style={[styles.organizerActionBtn, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.08)' }]}
              onPress={(e) => { e.stopPropagation(); handleCall(event.organizerPhone); }}
            >
              <Ionicons name="call" size={16} color="#10B981" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.organizerActionBtn, { backgroundColor: isDark ? 'rgba(75, 48, 184, 0.1)' : 'rgba(75, 48, 184, 0.08)' }]}
              onPress={(e) => { e.stopPropagation(); navigation.navigate('Chat', { chatId: `org_${event.organizerId || '1'}`, recipientName: event.organizerName }); }}
            >
              <Ionicons name="chatbubble" size={16} color={colors.brand[400]} />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>

        {/* Venue Card */}
        <View style={[
          styles.venueCard,
          {
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : colors.cardBackground,
            borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : colors.border,
          },
        ]}>
          <View style={styles.venueHeader}>
            <View style={[styles.venueIconBox, { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.12)' : 'rgba(239, 68, 68, 0.08)' }]}>
              <Ionicons name="business" size={18} color="#EF4444" />
            </View>
            <View style={styles.venueInfo}>
              <Text style={[styles.venueLabel, { color: colors.textMuted }]}>Mekan</Text>
              <Text style={[styles.venueName, { color: colors.text }]}>{event.venue}</Text>
            </View>
          </View>
          <View style={styles.venueDetails}>
            <View style={styles.venueDetailRow}>
              <Ionicons name="location-outline" size={14} color={colors.textMuted} />
              <Text style={[styles.venueDetailText, { color: colors.textSecondary }]}>
                Harbiye Mah. Taşkışla Cad. No:1, Şişli/İstanbul
              </Text>
            </View>
            <View style={styles.venueDetailRow}>
              <Ionicons name="people-outline" size={14} color={colors.textMuted} />
              <Text style={[styles.venueDetailText, { color: colors.textSecondary }]}>Kapasite: 12.000 kişi</Text>
            </View>
          </View>
          <View style={styles.venueActions}>
            <TouchableOpacity
              style={[styles.venueActionBtn, { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.08)' }]}
              onPress={() => Linking.openURL(`https://maps.google.com/?q=${encodeURIComponent(event.venue + ' İstanbul')}`)}
            >
              <Ionicons name="map-outline" size={14} color="#3B82F6" />
              <Text style={[styles.venueActionText, { color: '#3B82F6' }]}>Haritada Gör</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.venueActionBtn, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.08)' }]}
              onPress={() => Linking.openURL('tel:+902122315400')}
            >
              <Ionicons name="call-outline" size={14} color="#10B981" />
              <Text style={[styles.venueActionText, { color: '#10B981' }]}>Mekanı Ara</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Performance Details Card */}
        <View style={[
          styles.performanceCard,
          {
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : colors.cardBackground,
            borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : colors.border,
          },
        ]}>
          <Text style={[styles.performanceTitle, { color: colors.textMuted }]}>PERFORMANS DETAYLARI</Text>

          <View style={styles.performanceGrid}>
            <View style={[styles.performanceItem, { borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : colors.border }]}>
              <View style={styles.performanceLeft}>
                <View style={[styles.performanceIcon, { backgroundColor: isDark ? 'rgba(99, 102, 241, 0.15)' : 'rgba(99, 102, 241, 0.08)' }]}>
                  <Ionicons name="time-outline" size={16} color="#6366F1" />
                </View>
                <Text style={[styles.performanceLabel, { color: colors.textMuted }]}>Sahne Saati</Text>
              </View>
              <Text style={[styles.performanceValue, { color: colors.text }]}>20:00</Text>
            </View>

            <View style={[styles.performanceItem, { borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : colors.border }]}>
              <View style={styles.performanceLeft}>
                <View style={[styles.performanceIcon, { backgroundColor: isDark ? 'rgba(99, 102, 241, 0.15)' : 'rgba(99, 102, 241, 0.08)' }]}>
                  <Ionicons name="hourglass-outline" size={16} color="#6366F1" />
                </View>
                <Text style={[styles.performanceLabel, { color: colors.textMuted }]}>Performans Süresi</Text>
              </View>
              <Text style={[styles.performanceValue, { color: colors.text }]}>2 saat 30 dk</Text>
            </View>

            <View style={[styles.performanceItem, { borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : colors.border }]}>
              <View style={styles.performanceLeft}>
                <View style={[styles.performanceIcon, { backgroundColor: isDark ? 'rgba(99, 102, 241, 0.15)' : 'rgba(99, 102, 241, 0.08)' }]}>
                  <Ionicons name="musical-notes-outline" size={16} color="#6366F1" />
                </View>
                <Text style={[styles.performanceLabel, { color: colors.textMuted }]}>Set Sayısı</Text>
              </View>
              <Text style={[styles.performanceValue, { color: colors.text }]}>2 set</Text>
            </View>

            <View style={[styles.performanceItem, { borderBottomWidth: 0 }]}>
              <View style={styles.performanceLeft}>
                <View style={[styles.performanceIcon, { backgroundColor: isDark ? 'rgba(99, 102, 241, 0.15)' : 'rgba(99, 102, 241, 0.08)' }]}>
                  <Ionicons name="people-outline" size={16} color="#6366F1" />
                </View>
                <Text style={[styles.performanceLabel, { color: colors.textMuted }]}>Beklenen Katılım</Text>
              </View>
              <Text style={[styles.performanceValue, { color: colors.text }]}>~10.000 kişi</Text>
            </View>
          </View>
        </View>

        {/* Earnings Card - Compact Inline */}
        <View style={[
          styles.earningsCardCompact,
          {
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : colors.cardBackground,
            borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : colors.border,
          },
        ]}>
          <View style={styles.earningsCompactItem}>
            <Text style={[styles.earningsCompactLabel, { color: colors.textMuted }]}>Toplam</Text>
            <Text style={[styles.earningsCompactValue, { color: colors.text }]}>₺{event.earnings.toLocaleString('tr-TR')}</Text>
          </View>
          <View style={[styles.earningsCompactDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : colors.border }]} />
          <View style={styles.earningsCompactItem}>
            <Text style={[styles.earningsCompactLabel, { color: colors.textMuted }]}>Alınan</Text>
            <Text style={[styles.earningsCompactValue, { color: '#10B981' }]}>₺{paymentStats.paid.toLocaleString('tr-TR')}</Text>
          </View>
          <View style={[styles.earningsCompactDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : colors.border }]} />
          <View style={styles.earningsCompactItem}>
            <Text style={[styles.earningsCompactLabel, { color: colors.textMuted }]}>Bekleyen</Text>
            <Text style={[styles.earningsCompactValue, { color: '#F59E0B' }]}>₺{paymentStats.pending.toLocaleString('tr-TR')}</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <TouchableOpacity
            style={[
              styles.quickActionCard,
              {
                backgroundColor: isDark ? 'rgba(59, 130, 246, 0.08)' : 'rgba(59, 130, 246, 0.06)',
                borderColor: isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.12)',
              }
            ]}
            onPress={() => (navigation as any).navigate('ServiceOperations', {
              eventId: event.id,
              serviceId: event.id,
              serviceCategory: 'technical',
              serviceName: event.role,
              providerName: event.organizerName,
            })}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)' }]}>
              <Ionicons name="settings-outline" size={20} color="#3B82F6" />
            </View>
            <View style={styles.quickActionContent}>
              <Text style={[styles.quickActionTitle, { color: colors.text }]}>Operasyonlar</Text>
              <Text style={[styles.quickActionDesc, { color: colors.textMuted }]}>Görevler, program, ekip, ödemeler</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Content Section */}
        <View style={styles.contentSection}>
          {/* Description */}
          <View style={styles.sectionBlock}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Açıklama</Text>
            <Text style={[styles.descriptionText, { color: colors.textSecondary }]}>{event.description}</Text>
          </View>

          {/* Documents - Inline */}
          {documents.length > 0 && (
            <View style={styles.sectionBlock}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Dökümanlar</Text>
              <View style={styles.documentsCompact}>
                {documents.slice(0, 3).map(doc => (
                  <TouchableOpacity
                    key={doc.id}
                    style={[styles.documentCompactItem, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : colors.surfaceAlt, borderColor: isDark ? 'rgba(255,255,255,0.06)' : colors.border }]}
                    onPress={() => handleDocumentDownload(doc)}
                  >
                    <Ionicons
                      name={doc.type === 'contract' ? 'document-text' : doc.type === 'plan' ? 'map' : 'document'}
                      size={18}
                      color={colors.brand[400]}
                    />
                    <Text style={[styles.documentCompactName, { color: colors.text }]} numberOfLines={1}>{doc.name}</Text>
                    <Ionicons name="download-outline" size={16} color={colors.textMuted} />
                  </TouchableOpacity>
                ))}
                {documents.length > 3 && (
                  <TouchableOpacity
                    style={[styles.documentCompactMore, { borderColor: isDark ? 'rgba(255,255,255,0.1)' : colors.border }]}
                    onPress={() => Alert.alert('Dökümanlar', 'Tüm dökümanlar Operasyonlar sayfasında görüntülenebilir.')}
                  >
                    <Text style={[styles.documentCompactMoreText, { color: colors.brand[400] }]}>+{documents.length - 3} döküman daha</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          {/* Support Button */}
          <TouchableOpacity
            style={[
              styles.supportButtonInline,
              {
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.surfaceAlt,
                borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : colors.border,
              },
            ]}
            onPress={handleSupport}
          >
            <Ionicons name="help-circle-outline" size={20} color={colors.textSecondary} />
            <Text style={[styles.supportButtonInlineText, { color: colors.textSecondary }]}>Yardıma mı ihtiyacınız var?</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        <View style={{ height: 120 }} />
      </Animated.ScrollView>

      {/* Bottom Actions - Only show for completed events */}
      {event?.status === 'completed' && (
        <View style={[
          styles.bottomActions,
          {
            backgroundColor: colors.background,
            borderTopColor: isDark ? 'rgba(255, 255, 255, 0.06)' : colors.border,
            paddingBottom: insets.bottom + TAB_BAR_HEIGHT,
          },
        ]}>
          <TouchableOpacity
            style={[styles.reviewButton, { flex: 1 }]}
            onPress={() => setShowRatingModal(true)}
          >
            <LinearGradient
              colors={['#F59E0B', '#FBBF24']}
              style={styles.reviewButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="star" size={18} color="white" />
              <Text style={styles.reviewButtonText}>Organizatörü Değerlendir</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  animatedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    height: HEADER_HEIGHT,
  },
  animatedHeaderContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  animatedBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  animatedTitleContainer: {
    flex: 1,
    marginHorizontal: 12,
  },
  animatedHeaderTitle: {
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
  },
  animatedHeaderActions: {
    flexDirection: 'row',
    gap: 4,
  },
  animatedHeaderAction: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // New Hero styles
  heroImage: {
    height: 180,
    position: 'relative',
  },
  heroEventImage: {
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  // Event Details Card
  eventDetailsCard: {
    marginHorizontal: 16,
    marginTop: -24,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    zIndex: 10,
  },
  cardEventTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  detailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailsRoleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  detailsRoleText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'white',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 5,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '47%',
    gap: 10,
  },
  detailItemFull: {
    width: '100%',
  },
  detailIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 10,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  // Organizer Card Compact
  organizerCardCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  organizerImageCompact: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  organizerInfoCompact: {
    flex: 1,
    marginLeft: 10,
  },
  organizerLabelCompact: {
    fontSize: 10,
    marginBottom: 1,
  },
  organizerNameCompact: {
    fontSize: 14,
    fontWeight: '600',
  },
  organizerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  organizerActionsCompact: {
    flexDirection: 'row',
    gap: 8,
  },
  organizerActionBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Venue Card
  venueCard: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  venueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  venueIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  venueInfo: {
    flex: 1,
    marginLeft: 12,
  },
  venueLabel: {
    fontSize: 10,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  venueName: {
    fontSize: 15,
    fontWeight: '600',
  },
  venueDetails: {
    gap: 8,
    marginBottom: 14,
    paddingLeft: 52,
  },
  venueDetailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  venueDetailText: {
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
  venueActions: {
    flexDirection: 'row',
    gap: 10,
    paddingLeft: 52,
  },
  venueActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  venueActionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  // Performance Details Card
  performanceCard: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  performanceTitle: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 14,
  },
  performanceGrid: {
    gap: 0,
  },
  performanceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  performanceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  performanceIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  performanceLabel: {
    fontSize: 13,
  },
  performanceValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  // Earnings Card Compact
  earningsCardCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  earningsCompactItem: {
    flex: 1,
    alignItems: 'center',
  },
  earningsCompactLabel: {
    fontSize: 10,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 3,
  },
  earningsCompactValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  earningsCompactDivider: {
    width: 1,
    height: 28,
  },
  // Quick Actions
  quickActionsSection: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  quickActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionContent: {
    flex: 1,
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  quickActionDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  // Content Section
  contentSection: {
    padding: 16,
    paddingTop: 20,
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
  summaryStats: {
    flexDirection: 'row',
    gap: 12,
  },
  summaryStatCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    gap: 6,
  },
  summaryStatValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  summaryStatLabel: {
    fontSize: 12,
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
    backgroundColor: 'rgba(75, 48, 184, 0.1)',
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
  supportButtonInline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 16,
  },
  supportButtonInlineText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    marginLeft: 10,
  },
  // Compact Documents
  documentsCompact: {
    gap: 8,
  },
  documentCompactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    gap: 10,
  },
  documentCompactName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  documentCompactMore: {
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  documentCompactMoreText: {
    fontSize: 13,
    fontWeight: '500',
  },
  // Review Button
  reviewButton: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  reviewButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  reviewButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
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
