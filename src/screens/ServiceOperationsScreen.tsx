import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  LayoutAnimation,
  Platform,
  UIManager,
  Alert,
  RefreshControl,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { OptimizedImage } from '../components/OptimizedImage';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { ServiceCategory } from '../types';
import * as Haptics from 'expo-haptics';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

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
  description?: string;
  priority?: 'low' | 'medium' | 'high';
}

interface OperationNote {
  id: string;
  text: string;
  author: string;
  timestamp: string;
  isPinned?: boolean;
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

interface PaymentItem {
  id: string;
  title: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  dueDate: string;
  paidDate?: string;
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

const generatePayments = (): PaymentItem[] => {
  return [
    { id: '1', title: 'Ön Ödeme', amount: 25000, status: 'paid', dueDate: '01 Ocak 2026', paidDate: '28 Aralık 2025' },
    { id: '2', title: 'Ara Ödeme', amount: 35000, status: 'pending', dueDate: '15 Ocak 2026' },
    { id: '3', title: 'Son Ödeme', amount: 40000, status: 'pending', dueDate: '30 Ocak 2026' },
  ];
};

const getPaymentStatusInfo = (status: PaymentItem['status']) => {
  switch (status) {
    case 'paid':
      return { label: 'Ödendi', icon: 'checkmark-circle', color: '#10B981' };
    case 'overdue':
      return { label: 'Gecikmiş', icon: 'alert-circle', color: '#EF4444' };
    default:
      return { label: 'Bekliyor', icon: 'time', color: '#F59E0B' };
  }
};

// Generate notes
const generateNotes = (): OperationNote[] => [
  { id: '1', text: 'Sanatçı ekibi 14:00\'te gelecek, backstage hazır olmalı.', author: 'Cem K.', timestamp: '10:30', isPinned: true },
  { id: '2', text: 'Ses sisteminde feedback sorunu çözüldü.', author: 'Serkan A.', timestamp: '09:15', isPinned: false },
  { id: '3', text: 'VIP misafirler için özel giriş ayarlandı.', author: 'Ayşe Y.', timestamp: '08:45', isPinned: false },
];

export function ServiceOperationsScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<{ params: ServiceOperationsParams }, 'params'>>();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();

  const { serviceCategory, serviceName, providerName } = route.params;
  const config = serviceConfigs[serviceCategory] || serviceConfigs.technical;

  const [activeTab, setActiveTab] = useState<'tasks' | 'schedule' | 'team' | 'payments' | 'notes'>('tasks');
  const [refreshing, setRefreshing] = useState(false);

  // Modal states
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [editingTask, setEditingTask] = useState<OperationTask | null>(null);
  const [editingSchedule, setEditingSchedule] = useState<ScheduleItem | null>(null);
  const [editingTeamMember, setEditingTeamMember] = useState<TeamMember | null>(null);
  const [editingPayment, setEditingPayment] = useState<PaymentItem | null>(null);

  // Form states - Task
  const [taskTitle, setTaskTitle] = useState('');
  const [taskAssignee, setTaskAssignee] = useState('');
  const [taskTime, setTaskTime] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [newNoteText, setNewNoteText] = useState('');

  // Form states - Schedule
  const [scheduleTime, setScheduleTime] = useState('');
  const [scheduleTitle, setScheduleTitle] = useState('');

  // Form states - Team
  const [teamName, setTeamName] = useState('');
  const [teamRole, setTeamRole] = useState('');
  const [teamPhone, setTeamPhone] = useState('');

  // Form states - Payment
  const [paymentTitle, setPaymentTitle] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDueDate, setPaymentDueDate] = useState('');

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  // Mutable states - start with empty arrays (no mock data)
  const [tasks, setTasks] = useState<OperationTask[]>([]);
  const [notes, setNotes] = useState<OperationNote[]>([]);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [payments, setPayments] = useState<PaymentItem[]>([]);

  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const progress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  const handleCall = useCallback((phone: string) => {
    Linking.openURL(`tel:${phone}`);
  }, []);

  // Cycle task status: pending → in_progress → completed → pending
  const handleCycleTaskStatus = useCallback((taskId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    setTasks(prevTasks => prevTasks.map(task => {
      if (task.id !== taskId) return task;

      const statusCycle: TaskStatus[] = ['pending', 'in_progress', 'completed'];
      const currentIndex = statusCycle.indexOf(task.status);
      const nextStatus = statusCycle[(currentIndex + 1) % statusCycle.length];

      return { ...task, status: nextStatus };
    }));
  }, []);

  // Complete task directly
  const handleCompleteTask = useCallback((taskId: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    setTasks(prevTasks => prevTasks.map(task =>
      task.id === taskId ? { ...task, status: 'completed' } : task
    ));
  }, []);

  // Open add task modal
  const handleAddTask = useCallback(() => {
    setEditingTask(null);
    setTaskTitle('');
    setTaskAssignee('');
    setTaskTime('');
    setTaskDescription('');
    setShowTaskModal(true);
  }, []);

  // Open edit task modal
  const handleEditTask = useCallback((task: OperationTask) => {
    setEditingTask(task);
    setTaskTitle(task.title);
    setTaskAssignee(task.assignee);
    setTaskTime(task.time);
    setTaskDescription(task.description || '');
    setShowTaskModal(true);
  }, []);

  // Save task (add or edit)
  const handleSaveTask = useCallback(() => {
    if (!taskTitle.trim() || !taskAssignee.trim() || !taskTime.trim()) {
      Alert.alert('Hata', 'Lütfen tüm zorunlu alanları doldurun.');
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    if (editingTask) {
      // Edit existing task
      setTasks(prevTasks => prevTasks.map(task =>
        task.id === editingTask.id
          ? { ...task, title: taskTitle, assignee: taskAssignee, time: taskTime, description: taskDescription }
          : task
      ));
    } else {
      // Add new task
      const newTask: OperationTask = {
        id: Date.now().toString(),
        title: taskTitle,
        assignee: taskAssignee,
        time: taskTime,
        description: taskDescription,
        status: 'pending',
      };
      setTasks(prevTasks => [...prevTasks, newTask]);
    }

    setShowTaskModal(false);
  }, [taskTitle, taskAssignee, taskTime, taskDescription, editingTask]);

  // Delete task
  const handleDeleteTask = useCallback((taskId: string) => {
    Alert.alert(
      'Görevi Sil',
      'Bu görevi silmek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
          },
        },
      ]
    );
  }, []);

  // Long press on task - show options
  const handleTaskLongPress = useCallback((task: OperationTask) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      task.title,
      'Ne yapmak istiyorsunuz?',
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Düzenle', onPress: () => handleEditTask(task) },
        { text: 'Sil', style: 'destructive', onPress: () => handleDeleteTask(task.id) },
      ]
    );
  }, [handleEditTask, handleDeleteTask]);

  // Add note
  const handleAddNote = useCallback(() => {
    if (!newNoteText.trim()) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    const newNote: OperationNote = {
      id: Date.now().toString(),
      text: newNoteText,
      author: 'Ben',
      timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      isPinned: false,
    };

    setNotes(prevNotes => [newNote, ...prevNotes]);
    setNewNoteText('');
    setShowNoteModal(false);
  }, [newNoteText]);

  // Toggle note pin
  const handleToggleNotePin = useCallback((noteId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setNotes(prevNotes => prevNotes.map(note =>
      note.id === noteId ? { ...note, isPinned: !note.isPinned } : note
    ));
  }, []);

  // Delete note
  const handleDeleteNote = useCallback((noteId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setNotes(prevNotes => prevNotes.filter(note => note.id !== noteId));
  }, []);

  // Sort notes - pinned first
  const sortedNotes = useMemo(() => {
    return [...notes].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return 0;
    });
  }, [notes]);

  // ========== SCHEDULE HANDLERS ==========
  const handleAddSchedule = useCallback(() => {
    setEditingSchedule(null);
    setScheduleTime('');
    setScheduleTitle('');
    setShowScheduleModal(true);
  }, []);

  const handleEditSchedule = useCallback((item: ScheduleItem) => {
    setEditingSchedule(item);
    setScheduleTime(item.time);
    setScheduleTitle(item.title);
    setShowScheduleModal(true);
  }, []);

  const handleSaveSchedule = useCallback(() => {
    if (!scheduleTime.trim() || !scheduleTitle.trim()) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    if (editingSchedule) {
      setSchedule(prev => prev.map(item =>
        item.id === editingSchedule.id
          ? { ...item, time: scheduleTime, title: scheduleTitle }
          : item
      ));
    } else {
      const newItem: ScheduleItem = {
        id: Date.now().toString(),
        time: scheduleTime,
        title: scheduleTitle,
        status: 'upcoming',
      };
      setSchedule(prev => [...prev, newItem].sort((a, b) => a.time.localeCompare(b.time)));
    }

    setShowScheduleModal(false);
  }, [scheduleTime, scheduleTitle, editingSchedule]);

  const handleDeleteSchedule = useCallback((itemId: string) => {
    Alert.alert('Programı Sil', 'Bu program öğesini silmek istediğinizden emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          setSchedule(prev => prev.filter(item => item.id !== itemId));
        },
      },
    ]);
  }, []);

  const handleScheduleLongPress = useCallback((item: ScheduleItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(item.title, 'Ne yapmak istiyorsunuz?', [
      { text: 'İptal', style: 'cancel' },
      { text: 'Düzenle', onPress: () => handleEditSchedule(item) },
      { text: 'Sil', style: 'destructive', onPress: () => handleDeleteSchedule(item.id) },
    ]);
  }, [handleEditSchedule, handleDeleteSchedule]);

  // ========== TEAM HANDLERS ==========
  const handleAddTeamMember = useCallback(() => {
    setEditingTeamMember(null);
    setTeamName('');
    setTeamRole('');
    setTeamPhone('');
    setShowTeamModal(true);
  }, []);

  const handleEditTeamMember = useCallback((member: TeamMember) => {
    setEditingTeamMember(member);
    setTeamName(member.name);
    setTeamRole(member.role);
    setTeamPhone(member.phone);
    setShowTeamModal(true);
  }, []);

  const handleSaveTeamMember = useCallback(() => {
    if (!teamName.trim() || !teamRole.trim() || !teamPhone.trim()) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    if (editingTeamMember) {
      setTeam(prev => prev.map(member =>
        member.id === editingTeamMember.id
          ? { ...member, name: teamName, role: teamRole, phone: teamPhone }
          : member
      ));
    } else {
      const newMember: TeamMember = {
        id: Date.now().toString(),
        name: teamName,
        role: teamRole,
        phone: teamPhone,
        image: `https://i.pravatar.cc/100?u=${Date.now()}`,
        status: 'online',
      };
      setTeam(prev => [...prev, newMember]);
    }

    setShowTeamModal(false);
  }, [teamName, teamRole, teamPhone, editingTeamMember]);

  const handleDeleteTeamMember = useCallback((memberId: string) => {
    Alert.alert('Ekip Üyesini Çıkar', 'Bu ekip üyesini çıkarmak istediğinizden emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Çıkar',
        style: 'destructive',
        onPress: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          setTeam(prev => prev.filter(member => member.id !== memberId));
        },
      },
    ]);
  }, []);

  const handleTeamLongPress = useCallback((member: TeamMember) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(member.name, 'Ne yapmak istiyorsunuz?', [
      { text: 'İptal', style: 'cancel' },
      { text: 'Ara', onPress: () => handleCall(member.phone) },
      { text: 'Düzenle', onPress: () => handleEditTeamMember(member) },
      { text: 'Çıkar', style: 'destructive', onPress: () => handleDeleteTeamMember(member.id) },
    ]);
  }, [handleCall, handleEditTeamMember, handleDeleteTeamMember]);

  // ========== PAYMENT HANDLERS ==========
  const handleAddPayment = useCallback(() => {
    setEditingPayment(null);
    setPaymentTitle('');
    setPaymentAmount('');
    setPaymentDueDate('');
    setShowPaymentModal(true);
  }, []);

  const handleEditPayment = useCallback((payment: PaymentItem) => {
    setEditingPayment(payment);
    setPaymentTitle(payment.title);
    setPaymentAmount(payment.amount.toString());
    setPaymentDueDate(payment.dueDate);
    setShowPaymentModal(true);
  }, []);

  const handleSavePayment = useCallback(() => {
    if (!paymentTitle.trim() || !paymentAmount.trim() || !paymentDueDate.trim()) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
      return;
    }

    const amount = parseFloat(paymentAmount.replace(/[^\d]/g, ''));
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Hata', 'Geçerli bir tutar girin.');
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    if (editingPayment) {
      setPayments(prev => prev.map(p =>
        p.id === editingPayment.id
          ? { ...p, title: paymentTitle, amount, dueDate: paymentDueDate }
          : p
      ));
    } else {
      const newPayment: PaymentItem = {
        id: Date.now().toString(),
        title: paymentTitle,
        amount,
        dueDate: paymentDueDate,
        status: 'pending',
      };
      setPayments(prev => [...prev, newPayment]);
    }

    setShowPaymentModal(false);
  }, [paymentTitle, paymentAmount, paymentDueDate, editingPayment]);

  const handleDeletePayment = useCallback((paymentId: string) => {
    Alert.alert('Ödemeyi Sil', 'Bu ödemeyi silmek istediğinizden emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          setPayments(prev => prev.filter(p => p.id !== paymentId));
        },
      },
    ]);
  }, []);

  const handlePaymentLongPress = useCallback((payment: PaymentItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(payment.title, 'Ne yapmak istiyorsunuz?', [
      { text: 'İptal', style: 'cancel' },
      { text: 'Düzenle', onPress: () => handleEditPayment(payment) },
      { text: 'Ödendi Olarak İşaretle', onPress: () => handleMarkPaymentPaid(payment.id) },
      { text: 'Sil', style: 'destructive', onPress: () => handleDeletePayment(payment.id) },
    ]);
  }, [handleEditPayment, handleDeletePayment]);

  const handleMarkPaymentPaid = useCallback((paymentId: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setPayments(prev => prev.map(p =>
      p.id === paymentId
        ? { ...p, status: 'paid' as const, paidDate: new Date().toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' }) }
        : p
    ));
  }, []);

  const tabs = [
    { key: 'tasks', label: 'Görevler', count: tasks.length },
    { key: 'schedule', label: 'Program', count: schedule.length },
    { key: 'team', label: 'Ekip', count: team.length },
    { key: 'payments', label: 'Ödemeler', count: payments.length },
    { key: 'notes', label: 'Notlar', count: notes.length },
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
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.brand[500]}
            colors={[colors.brand[500]]}
          />
        }
      >
        {/* Tasks Tab */}
        {activeTab === 'tasks' && (
          <View style={styles.list}>
            {/* Add Task Button */}
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: isDark ? 'rgba(75, 48, 184, 0.15)' : 'rgba(75, 48, 184, 0.1)', borderColor: isDark ? 'rgba(75, 48, 184, 0.3)' : 'rgba(75, 48, 184, 0.2)' }]}
              onPress={handleAddTask}
            >
              <Ionicons name="add-circle-outline" size={20} color="#4B30B8" />
              <Text style={styles.addButtonText}>Yeni Görev Ekle</Text>
            </TouchableOpacity>

            {tasks.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="checkbox-outline" size={48} color={colors.textMuted} />
                <Text style={[styles.emptyStateTitle, { color: colors.text }]}>Henüz görev yok</Text>
                <Text style={[styles.emptyStateText, { color: colors.textMuted }]}>Yeni görev ekleyerek başlayın</Text>
              </View>
            ) : (
              <>
                {tasks.map((task) => {
                  const statusStyle = getStatusStyle(task.status);
                  return (
                    <TouchableOpacity
                      key={task.id}
                      style={[styles.taskCard, { backgroundColor: isDark ? '#18181B' : '#FFFFFF', borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }]}
                      onLongPress={() => handleTaskLongPress(task)}
                      activeOpacity={0.9}
                      delayLongPress={300}
                    >
                      {/* Interactive Checkbox */}
                      <TouchableOpacity
                        style={styles.taskLeft}
                        onPress={() => handleCycleTaskStatus(task.id)}
                        activeOpacity={0.7}
                      >
                        <View style={[
                          styles.taskCheckbox,
                          {
                            borderColor: statusStyle.text,
                            backgroundColor: task.status === 'completed' ? statusStyle.text :
                                            task.status === 'in_progress' ? statusStyle.text + '40' : 'transparent'
                          }
                        ]}>
                          {task.status === 'completed' && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
                          {task.status === 'in_progress' && <View style={styles.inProgressDot} />}
                        </View>
                      </TouchableOpacity>
                      <View style={styles.taskContent}>
                        <Text style={[styles.taskTitle, { color: colors.text }, task.status === 'completed' && styles.taskTitleCompleted]}>{task.title}</Text>
                        <View style={styles.taskMeta}>
                          <Text style={[styles.taskMetaText, { color: colors.textSecondary }]}>{task.assignee}</Text>
                          <View style={styles.taskMetaDot} />
                          <Text style={[styles.taskMetaText, { color: colors.textSecondary }]}>{task.time}</Text>
                        </View>
                      </View>
                      {/* Interactive Status Badge */}
                      <TouchableOpacity
                        style={[styles.taskStatus, { backgroundColor: statusStyle.bg }]}
                        onPress={() => handleCycleTaskStatus(task.id)}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.taskStatusText, { color: statusStyle.text }]}>{getStatusLabel(task.status)}</Text>
                      </TouchableOpacity>
                    </TouchableOpacity>
                  );
                })}

                <Text style={[styles.hintText, { color: colors.textMuted }]}>
                  İpucu: Düzenlemek veya silmek için göreve uzun basın
                </Text>
              </>
            )}
          </View>
        )}

        {/* Schedule Tab */}
        {activeTab === 'schedule' && (
          <View style={styles.list}>
            {/* Add Schedule Button */}
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: isDark ? 'rgba(75, 48, 184, 0.15)' : 'rgba(75, 48, 184, 0.1)', borderColor: isDark ? 'rgba(75, 48, 184, 0.3)' : 'rgba(75, 48, 184, 0.2)' }]}
              onPress={handleAddSchedule}
            >
              <Ionicons name="add-circle-outline" size={20} color="#4B30B8" />
              <Text style={styles.addButtonText}>Yeni Program Ekle</Text>
            </TouchableOpacity>

            {schedule.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="calendar-outline" size={48} color={colors.textMuted} />
                <Text style={[styles.emptyStateTitle, { color: colors.text }]}>Henüz program yok</Text>
                <Text style={[styles.emptyStateText, { color: colors.textMuted }]}>Yeni program ekleyerek başlayın</Text>
              </View>
            ) : (
              <>
                {schedule.map((item, index) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.scheduleRow}
                    onLongPress={() => handleScheduleLongPress(item)}
                    activeOpacity={0.9}
                    delayLongPress={300}
                  >
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
                  </TouchableOpacity>
                ))}

                <Text style={[styles.hintText, { color: colors.textMuted }]}>
                  İpucu: Düzenlemek veya silmek için programa uzun basın
                </Text>
              </>
            )}
          </View>
        )}

        {/* Team Tab */}
        {activeTab === 'team' && (
          <View style={styles.list}>
            {/* Add Team Member Button */}
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: isDark ? 'rgba(75, 48, 184, 0.15)' : 'rgba(75, 48, 184, 0.1)', borderColor: isDark ? 'rgba(75, 48, 184, 0.3)' : 'rgba(75, 48, 184, 0.2)' }]}
              onPress={handleAddTeamMember}
            >
              <Ionicons name="person-add-outline" size={20} color="#4B30B8" />
              <Text style={styles.addButtonText}>Ekip Üyesi Ekle</Text>
            </TouchableOpacity>

            {team.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="people-outline" size={48} color={colors.textMuted} />
                <Text style={[styles.emptyStateTitle, { color: colors.text }]}>Henüz ekip üyesi yok</Text>
                <Text style={[styles.emptyStateText, { color: colors.textMuted }]}>Ekip üyesi ekleyerek başlayın</Text>
              </View>
            ) : (
              <>
                {team.map((member) => (
                  <TouchableOpacity
                    key={member.id}
                    style={[styles.teamCard, { backgroundColor: isDark ? '#18181B' : '#FFFFFF', borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }]}
                    onLongPress={() => handleTeamLongPress(member)}
                    activeOpacity={0.9}
                    delayLongPress={300}
                  >
                    <View style={styles.teamAvatarContainer}>
                      <OptimizedImage source={member.image} style={styles.teamAvatar} />
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
                  </TouchableOpacity>
                ))}

                <Text style={[styles.hintText, { color: colors.textMuted }]}>
                  İpucu: Düzenlemek veya çıkarmak için ekip üyesine uzun basın
                </Text>
              </>
            )}
          </View>
        )}

        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <View style={styles.list}>
            {/* Add Payment Button */}
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: isDark ? 'rgba(75, 48, 184, 0.15)' : 'rgba(75, 48, 184, 0.1)', borderColor: isDark ? 'rgba(75, 48, 184, 0.3)' : 'rgba(75, 48, 184, 0.2)' }]}
              onPress={handleAddPayment}
            >
              <Ionicons name="wallet-outline" size={20} color="#4B30B8" />
              <Text style={styles.addButtonText}>Ödeme Ekle</Text>
            </TouchableOpacity>

            {payments.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="wallet-outline" size={48} color={colors.textMuted} />
                <Text style={[styles.emptyStateTitle, { color: colors.text }]}>Henüz ödeme yok</Text>
                <Text style={[styles.emptyStateText, { color: colors.textMuted }]}>Ödeme ekleyerek başlayın</Text>
              </View>
            ) : (
              <>
                {/* Payment Summary */}
                <View style={[styles.paymentSummary, { backgroundColor: isDark ? '#18181B' : '#FFFFFF', borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }]}>
                  <View style={styles.paymentSummaryItem}>
                    <Text style={[styles.paymentSummaryLabel, { color: colors.textSecondary }]}>Toplam</Text>
                    <Text style={[styles.paymentSummaryValue, { color: colors.text }]}>
                      ₺{payments.reduce((sum, p) => sum + p.amount, 0).toLocaleString('tr-TR')}
                    </Text>
                  </View>
                  <View style={[styles.paymentSummaryDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB' }]} />
                  <View style={styles.paymentSummaryItem}>
                    <Text style={[styles.paymentSummaryLabel, { color: colors.textSecondary }]}>Alınan</Text>
                    <Text style={[styles.paymentSummaryValue, { color: '#10B981' }]}>
                      ₺{payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0).toLocaleString('tr-TR')}
                    </Text>
                  </View>
                  <View style={[styles.paymentSummaryDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB' }]} />
                  <View style={styles.paymentSummaryItem}>
                    <Text style={[styles.paymentSummaryLabel, { color: colors.textSecondary }]}>Bekleyen</Text>
                    <Text style={[styles.paymentSummaryValue, { color: '#F59E0B' }]}>
                      ₺{payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0).toLocaleString('tr-TR')}
                    </Text>
                  </View>
                </View>

                {/* Payment Cards */}
                {payments.map((payment) => {
                  const statusInfo = getPaymentStatusInfo(payment.status);
                  return (
                    <TouchableOpacity
                      key={payment.id}
                      style={[styles.paymentCard, { backgroundColor: isDark ? '#18181B' : '#FFFFFF', borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }]}
                      onLongPress={() => handlePaymentLongPress(payment)}
                      activeOpacity={0.9}
                      delayLongPress={300}
                    >
                      <View style={styles.paymentHeader}>
                        <View style={styles.paymentInfo}>
                          <Text style={[styles.paymentTitle, { color: colors.text }]}>{payment.title}</Text>
                          <Text style={[styles.paymentDate, { color: colors.textSecondary }]}>
                            {payment.status === 'paid' ? `Ödeme: ${payment.paidDate}` : `Vade: ${payment.dueDate}`}
                          </Text>
                        </View>
                        <View style={[styles.paymentStatusBadge, { backgroundColor: statusInfo.color + '20' }]}>
                          <Ionicons name={statusInfo.icon as any} size={12} color={statusInfo.color} />
                          <Text style={[styles.paymentStatusText, { color: statusInfo.color }]}>{statusInfo.label}</Text>
                        </View>
                      </View>
                      <Text style={[styles.paymentAmount, { color: colors.text }]}>₺{payment.amount.toLocaleString('tr-TR')}</Text>
                    </TouchableOpacity>
                  );
                })}

                <Text style={[styles.hintText, { color: colors.textMuted }]}>
                  İpucu: Düzenlemek veya silmek için ödemeye uzun basın
                </Text>

                {/* Invoice Button */}
                <TouchableOpacity
                  style={[styles.invoiceButton, { backgroundColor: isDark ? 'rgba(75, 48, 184, 0.15)' : 'rgba(75, 48, 184, 0.1)' }]}
                  onPress={() => Alert.alert('Fatura', 'Fatura oluşturuluyor...')}
                >
                  <Ionicons name="document-text-outline" size={18} color="#4B30B8" />
                  <Text style={styles.invoiceButtonText}>Fatura Oluştur</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}

        {/* Notes Tab */}
        {activeTab === 'notes' && (
          <View style={styles.list}>
            {/* Add Note Button */}
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: isDark ? 'rgba(75, 48, 184, 0.15)' : 'rgba(75, 48, 184, 0.1)', borderColor: isDark ? 'rgba(75, 48, 184, 0.3)' : 'rgba(75, 48, 184, 0.2)' }]}
              onPress={() => setShowNoteModal(true)}
            >
              <Ionicons name="create-outline" size={20} color="#4B30B8" />
              <Text style={styles.addButtonText}>Not Ekle</Text>
            </TouchableOpacity>

            {sortedNotes.map((note) => (
              <View
                key={note.id}
                style={[
                  styles.noteCard,
                  { backgroundColor: isDark ? '#18181B' : '#FFFFFF', borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' },
                  note.isPinned && { borderLeftWidth: 3, borderLeftColor: '#F59E0B' }
                ]}
              >
                <View style={styles.noteHeader}>
                  <View style={styles.noteAuthorRow}>
                    {note.isPinned && (
                      <Ionicons name="pin" size={14} color="#F59E0B" style={{ marginRight: 6 }} />
                    )}
                    <Text style={[styles.noteAuthor, { color: colors.text }]}>{note.author}</Text>
                    <Text style={[styles.noteTime, { color: colors.textMuted }]}>{note.timestamp}</Text>
                  </View>
                  <View style={styles.noteActions}>
                    <TouchableOpacity
                      style={styles.noteActionBtn}
                      onPress={() => handleToggleNotePin(note.id)}
                    >
                      <Ionicons
                        name={note.isPinned ? 'pin' : 'pin-outline'}
                        size={16}
                        color={note.isPinned ? '#F59E0B' : colors.textMuted}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.noteActionBtn}
                      onPress={() => handleDeleteNote(note.id)}
                    >
                      <Ionicons name="trash-outline" size={16} color={colors.textMuted} />
                    </TouchableOpacity>
                  </View>
                </View>
                <Text style={[styles.noteText, { color: colors.textSecondary }]}>{note.text}</Text>
              </View>
            ))}

            {notes.length === 0 && (
              <View style={styles.emptyState}>
                <Ionicons name="document-text-outline" size={48} color={colors.textMuted} />
                <Text style={[styles.emptyStateTitle, { color: colors.text }]}>Henüz not yok</Text>
                <Text style={[styles.emptyStateText, { color: colors.textMuted }]}>Not ekleyerek başlayın</Text>
              </View>
            )}
          </View>
        )}

        <View style={{ height: insets.bottom + 20 }} />
      </ScrollView>

      {/* Add/Edit Task Modal */}
      <Modal
        visible={showTaskModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowTaskModal(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setShowTaskModal(false)} />
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalDragHandle}>
              <View style={[styles.dragHandle, { backgroundColor: colors.textMuted }]} />
            </View>

            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {editingTask ? 'Görevi Düzenle' : 'Yeni Görev'}
              </Text>
              <TouchableOpacity onPress={() => setShowTaskModal(false)}>
                <Ionicons name="close" size={24} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: colors.textMuted }]}>Görev Adı *</Text>
                <TextInput
                  style={[styles.formInput, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F3F4F6', color: colors.text, borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB' }]}
                  placeholder="Görev adını girin"
                  placeholderTextColor={colors.textMuted}
                  value={taskTitle}
                  onChangeText={setTaskTitle}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: colors.textMuted }]}>Sorumlu Kişi *</Text>
                <TextInput
                  style={[styles.formInput, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F3F4F6', color: colors.text, borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB' }]}
                  placeholder="Sorumlu kişiyi girin"
                  placeholderTextColor={colors.textMuted}
                  value={taskAssignee}
                  onChangeText={setTaskAssignee}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: colors.textMuted }]}>Saat *</Text>
                <TextInput
                  style={[styles.formInput, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F3F4F6', color: colors.text, borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB' }]}
                  placeholder="Örn: 14:00"
                  placeholderTextColor={colors.textMuted}
                  value={taskTime}
                  onChangeText={setTaskTime}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: colors.textMuted }]}>Açıklama (Opsiyonel)</Text>
                <TextInput
                  style={[styles.formInput, styles.formTextArea, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F3F4F6', color: colors.text, borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB' }]}
                  placeholder="Görev detayları..."
                  placeholderTextColor={colors.textMuted}
                  value={taskDescription}
                  onChangeText={setTaskDescription}
                  multiline
                  numberOfLines={3}
                />
              </View>

              <TouchableOpacity style={styles.saveButton} onPress={handleSaveTask}>
                <LinearGradient
                  colors={['#4B30B8', '#6366F1']}
                  style={styles.saveButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Ionicons name={editingTask ? 'checkmark' : 'add'} size={18} color="white" />
                  <Text style={styles.saveButtonText}>
                    {editingTask ? 'Kaydet' : 'Görev Ekle'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Add Note Modal */}
      <Modal
        visible={showNoteModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowNoteModal(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setShowNoteModal(false)} />
          <View style={[styles.modalContent, styles.noteModalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalDragHandle}>
              <View style={[styles.dragHandle, { backgroundColor: colors.textMuted }]} />
            </View>

            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Not Ekle</Text>
              <TouchableOpacity onPress={() => setShowNoteModal(false)}>
                <Ionicons name="close" size={24} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <TextInput
                style={[styles.noteInput, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F3F4F6', color: colors.text, borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB' }]}
                placeholder="Notunuzu yazın..."
                placeholderTextColor={colors.textMuted}
                value={newNoteText}
                onChangeText={setNewNoteText}
                multiline
                numberOfLines={4}
                autoFocus
              />

              <TouchableOpacity
                style={[styles.saveButton, !newNoteText.trim() && { opacity: 0.5 }]}
                onPress={handleAddNote}
                disabled={!newNoteText.trim()}
              >
                <LinearGradient
                  colors={['#4B30B8', '#6366F1']}
                  style={styles.saveButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Ionicons name="add" size={18} color="white" />
                  <Text style={styles.saveButtonText}>Not Ekle</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Add/Edit Schedule Modal */}
      <Modal
        visible={showScheduleModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowScheduleModal(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setShowScheduleModal(false)} />
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalDragHandle}>
              <View style={[styles.dragHandle, { backgroundColor: colors.textMuted }]} />
            </View>

            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {editingSchedule ? 'Programı Düzenle' : 'Yeni Program'}
              </Text>
              <TouchableOpacity onPress={() => setShowScheduleModal(false)}>
                <Ionicons name="close" size={24} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: colors.textMuted }]}>Saat *</Text>
                <TextInput
                  style={[styles.formInput, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F3F4F6', color: colors.text, borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB' }]}
                  placeholder="Örn: 14:00"
                  placeholderTextColor={colors.textMuted}
                  value={scheduleTime}
                  onChangeText={setScheduleTime}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: colors.textMuted }]}>Başlık *</Text>
                <TextInput
                  style={[styles.formInput, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F3F4F6', color: colors.text, borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB' }]}
                  placeholder="Program öğesi adı"
                  placeholderTextColor={colors.textMuted}
                  value={scheduleTitle}
                  onChangeText={setScheduleTitle}
                />
              </View>

              <TouchableOpacity style={styles.saveButton} onPress={handleSaveSchedule}>
                <LinearGradient
                  colors={['#4B30B8', '#6366F1']}
                  style={styles.saveButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Ionicons name={editingSchedule ? 'checkmark' : 'add'} size={18} color="white" />
                  <Text style={styles.saveButtonText}>
                    {editingSchedule ? 'Kaydet' : 'Program Ekle'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Add/Edit Team Member Modal */}
      <Modal
        visible={showTeamModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowTeamModal(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setShowTeamModal(false)} />
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalDragHandle}>
              <View style={[styles.dragHandle, { backgroundColor: colors.textMuted }]} />
            </View>

            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {editingTeamMember ? 'Ekip Üyesini Düzenle' : 'Yeni Ekip Üyesi'}
              </Text>
              <TouchableOpacity onPress={() => setShowTeamModal(false)}>
                <Ionicons name="close" size={24} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: colors.textMuted }]}>Ad Soyad *</Text>
                <TextInput
                  style={[styles.formInput, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F3F4F6', color: colors.text, borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB' }]}
                  placeholder="Ad ve soyad girin"
                  placeholderTextColor={colors.textMuted}
                  value={teamName}
                  onChangeText={setTeamName}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: colors.textMuted }]}>Rol *</Text>
                <TextInput
                  style={[styles.formInput, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F3F4F6', color: colors.text, borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB' }]}
                  placeholder="Örn: Teknik Direktör"
                  placeholderTextColor={colors.textMuted}
                  value={teamRole}
                  onChangeText={setTeamRole}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: colors.textMuted }]}>Telefon *</Text>
                <TextInput
                  style={[styles.formInput, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F3F4F6', color: colors.text, borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB' }]}
                  placeholder="+90 5XX XXX XX XX"
                  placeholderTextColor={colors.textMuted}
                  value={teamPhone}
                  onChangeText={setTeamPhone}
                  keyboardType="phone-pad"
                />
              </View>

              <TouchableOpacity style={styles.saveButton} onPress={handleSaveTeamMember}>
                <LinearGradient
                  colors={['#4B30B8', '#6366F1']}
                  style={styles.saveButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Ionicons name={editingTeamMember ? 'checkmark' : 'person-add'} size={18} color="white" />
                  <Text style={styles.saveButtonText}>
                    {editingTeamMember ? 'Kaydet' : 'Ekip Üyesi Ekle'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Add/Edit Payment Modal */}
      <Modal
        visible={showPaymentModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPaymentModal(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setShowPaymentModal(false)} />
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalDragHandle}>
              <View style={[styles.dragHandle, { backgroundColor: colors.textMuted }]} />
            </View>

            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {editingPayment ? 'Ödemeyi Düzenle' : 'Yeni Ödeme'}
              </Text>
              <TouchableOpacity onPress={() => setShowPaymentModal(false)}>
                <Ionicons name="close" size={24} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: colors.textMuted }]}>Ödeme Adı *</Text>
                <TextInput
                  style={[styles.formInput, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F3F4F6', color: colors.text, borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB' }]}
                  placeholder="Örn: Ön Ödeme, Ara Ödeme"
                  placeholderTextColor={colors.textMuted}
                  value={paymentTitle}
                  onChangeText={setPaymentTitle}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: colors.textMuted }]}>Tutar (₺) *</Text>
                <TextInput
                  style={[styles.formInput, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F3F4F6', color: colors.text, borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB' }]}
                  placeholder="Örn: 25000"
                  placeholderTextColor={colors.textMuted}
                  value={paymentAmount}
                  onChangeText={setPaymentAmount}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: colors.textMuted }]}>Vade Tarihi *</Text>
                <TextInput
                  style={[styles.formInput, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F3F4F6', color: colors.text, borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB' }]}
                  placeholder="Örn: 15 Ocak 2026"
                  placeholderTextColor={colors.textMuted}
                  value={paymentDueDate}
                  onChangeText={setPaymentDueDate}
                />
              </View>

              <TouchableOpacity style={styles.saveButton} onPress={handleSavePayment}>
                <LinearGradient
                  colors={['#4B30B8', '#6366F1']}
                  style={styles.saveButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Ionicons name={editingPayment ? 'checkmark' : 'wallet'} size={18} color="white" />
                  <Text style={styles.saveButtonText}>
                    {editingPayment ? 'Kaydet' : 'Ödeme Ekle'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  inProgressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3B82F6',
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
  // Payment styles
  paymentSummary: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  paymentSummaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  paymentSummaryLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  paymentSummaryValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  paymentSummaryDivider: {
    width: 1,
  },
  paymentCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  paymentDate: {
    fontSize: 13,
  },
  paymentStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  paymentStatusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  paymentAmount: {
    fontSize: 20,
    fontWeight: '700',
  },
  invoiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 10,
    gap: 8,
    marginTop: 6,
  },
  invoiceButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B30B8',
  },
  // Add Button
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    gap: 8,
    marginBottom: 16,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B30B8',
  },
  hintText: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  // Notes
  noteCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  noteAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  noteAuthor: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
  },
  noteTime: {
    fontSize: 12,
  },
  noteActions: {
    flexDirection: 'row',
    gap: 8,
  },
  noteActionBtn: {
    padding: 4,
  },
  noteText: {
    fontSize: 14,
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptyStateText: {
    fontSize: 14,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
  },
  noteModalContent: {
    maxHeight: '50%',
  },
  modalDragHandle: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    opacity: 0.3,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
  },
  formTextArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  noteInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  saveButton: {
    marginTop: 8,
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'white',
  },
});

export default ServiceOperationsScreen;
