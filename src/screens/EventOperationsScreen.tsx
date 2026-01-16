import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Modal,
  Linking,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  EventOperation,
  OperationTeamMember,
  OperationTask,
  ScheduleBlock,
  EquipmentItem,
  PartyType,
  TaskStatus,
  sampleEventOperation,
  canViewTask,
  canEditTask,
  canApproveTask,
  getPartyColor,
  getPartyLabel,
  getStatusColor,
  getStatusLabel,
  getCategoryLabel,
  getCategoryIcon,
  hasPermission,
} from '../data/operationsData';

const { width } = Dimensions.get('window');

// Animated Header Components
function ScrollHeader({ scrollY, title }: { scrollY: Animated.SharedValue<number>; title: string }) {
  const insets = useSafeAreaInsets();

  const animatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scrollY.value, [0, 60, 120], [0, 0.5, 1], Extrapolation.CLAMP);
    const translateY = interpolate(scrollY.value, [0, 60, 120], [-20, -10, 0], Extrapolation.CLAMP);
    return { opacity, transform: [{ translateY }] };
  });

  const borderStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scrollY.value, [100, 120], [0, 1], Extrapolation.CLAMP);
    return { opacity };
  });

  return (
    <View style={[styles.scrollHeader, { paddingTop: insets.top }]}>
      <Animated.Text style={[styles.scrollHeaderTitle, animatedStyle]}>{title}</Animated.Text>
      <Animated.View style={[styles.scrollHeaderBorder, borderStyle]} />
    </View>
  );
}

function LargeTitle({ scrollY, title, subtitle }: { scrollY: Animated.SharedValue<number>; title: string; subtitle?: string }) {
  const animatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scrollY.value, [0, 40, 80], [1, 0.5, 0], Extrapolation.CLAMP);
    const translateY = interpolate(scrollY.value, [0, 80], [0, -20], Extrapolation.CLAMP);
    const scale = interpolate(scrollY.value, [0, 80], [1, 0.9], Extrapolation.CLAMP);
    return { opacity, transform: [{ translateY }, { scale }] };
  });

  return (
    <Animated.View style={[styles.largeTitleContainer, animatedStyle]}>
      <Text style={styles.largeTitle}>{title}</Text>
      {subtitle && <Text style={styles.largeTitleSubtitle}>{subtitle}</Text>}
    </Animated.View>
  );
}

// Tab types
type OperationTab = 'overview' | 'tasks' | 'schedule' | 'team' | 'equipment';

export function EventOperationsScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const scrollY = useSharedValue(0);

  // Current user simulation - in real app this would come from auth context
  // Testing with different roles by changing this
  const [currentUserId] = useState('prov2'); // Serkan Aydın - Teknik Direktör (Provider)

  const [activeTab, setActiveTab] = useState<OperationTab>('overview');
  const [selectedTask, setSelectedTask] = useState<OperationTask | null>(null);
  const [selectedMember, setSelectedMember] = useState<OperationTeamMember | null>(null);
  const [taskModalVisible, setTaskModalVisible] = useState(false);
  const [memberModalVisible, setMemberModalVisible] = useState(false);

  const operation: EventOperation = sampleEventOperation;

  // Find current user's team member data
  const currentUser = useMemo(() => {
    const allMembers = [
      ...operation.parties.organizer.teamMembers,
      ...operation.parties.provider.teamMembers,
      ...operation.parties.artist.teamMembers,
    ];
    return allMembers.find(m => m.id === currentUserId);
  }, [currentUserId, operation]);

  // Filter tasks based on user permissions
  const visibleTasks = useMemo(() => {
    if (!currentUser) return [];
    return operation.tasks.filter(task => canViewTask(currentUser, task));
  }, [currentUser, operation.tasks]);

  // Get my tasks
  const myTasks = useMemo(() => {
    return visibleTasks.filter(task => task.assignedTo.includes(currentUserId));
  }, [visibleTasks, currentUserId]);

  // Tasks needing my approval
  const pendingApprovals = useMemo(() => {
    if (!currentUser) return [];
    return visibleTasks.filter(task => canApproveTask(currentUser, task));
  }, [currentUser, visibleTasks]);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleCall = useCallback((phone: string) => {
    Linking.openURL(`tel:${phone}`);
  }, []);

  const tabs: { key: OperationTab; label: string; icon: string; badge?: number }[] = [
    { key: 'overview', label: 'Genel', icon: 'grid' },
    { key: 'tasks', label: 'Görevler', icon: 'checkbox', badge: myTasks.length > 0 ? myTasks.length : undefined },
    { key: 'schedule', label: 'Program', icon: 'calendar' },
    { key: 'team', label: 'Ekip', icon: 'people' },
    { key: 'equipment', label: 'Ekipman', icon: 'hardware-chip' },
  ];

  const getOperationStatusColor = (status: EventOperation['status']) => {
    switch (status) {
      case 'preparation': return '#8B5CF6';
      case 'load_in': return '#3B82F6';
      case 'setup': return '#F59E0B';
      case 'soundcheck': return '#14B8A6';
      case 'show': return '#EC4899';
      case 'teardown': return '#64748B';
      case 'completed': return '#10B981';
      default: return '#6B7280';
    }
  };

  const getOperationStatusLabel = (status: EventOperation['status']) => {
    switch (status) {
      case 'preparation': return 'Hazırlık';
      case 'load_in': return 'Load-In';
      case 'setup': return 'Kurulum';
      case 'soundcheck': return 'Ses Kontrolü';
      case 'show': return 'Gösteri';
      case 'teardown': return 'Söküm';
      case 'completed': return 'Tamamlandı';
      default: return status;
    }
  };

  const renderOverview = () => (
    <View style={styles.tabContent}>
      {/* Current User Info */}
      {currentUser && (
        <View style={[styles.currentUserCard, { borderLeftColor: getPartyColor(currentUser.party) }]}>
          <Image source={{ uri: currentUser.image }} style={styles.currentUserImage} />
          <View style={styles.currentUserInfo}>
            <Text style={styles.currentUserName}>{currentUser.name}</Text>
            <Text style={styles.currentUserRole}>{currentUser.roleLabel}</Text>
            <View style={[styles.partyBadge, { backgroundColor: getPartyColor(currentUser.party) + '20' }]}>
              <Text style={[styles.partyBadgeText, { color: getPartyColor(currentUser.party) }]}>
                {getPartyLabel(currentUser.party)}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Quick Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <View style={[styles.statIconContainer, { backgroundColor: '#3B82F620' }]}>
            <Ionicons name="checkbox" size={20} color="#3B82F6" />
          </View>
          <Text style={styles.statNumber}>{myTasks.length}</Text>
          <Text style={styles.statLabel}>Görevlerim</Text>
        </View>
        <View style={styles.statCard}>
          <View style={[styles.statIconContainer, { backgroundColor: '#F59E0B20' }]}>
            <Ionicons name="time" size={20} color="#F59E0B" />
          </View>
          <Text style={styles.statNumber}>{pendingApprovals.length}</Text>
          <Text style={styles.statLabel}>Onay Bekleyen</Text>
        </View>
        <View style={styles.statCard}>
          <View style={[styles.statIconContainer, { backgroundColor: '#10B98120' }]}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
          </View>
          <Text style={styles.statNumber}>
            {visibleTasks.filter(t => t.status === 'completed').length}
          </Text>
          <Text style={styles.statLabel}>Tamamlanan</Text>
        </View>
      </View>

      {/* Timeline */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Zaman Çizelgesi</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.timelineScroll}>
          <View style={styles.timelineCard}>
            {[
              { label: 'Load-In', time: operation.timeline.loadIn, icon: 'enter', color: '#3B82F6' },
              { label: 'Kurulum', time: operation.timeline.setupStart, icon: 'construct', color: '#F59E0B' },
              { label: 'Ses Kontrolü', time: operation.timeline.soundcheckStart, icon: 'volume-high', color: '#14B8A6' },
              { label: 'Kapılar', time: operation.timeline.doorsOpen, icon: 'log-in', color: '#8B5CF6' },
              { label: 'Gösteri', time: operation.timeline.showStart, icon: 'musical-notes', color: '#EC4899' },
              { label: 'Söküm', time: operation.timeline.teardownStart, icon: 'archive', color: '#64748B' },
            ].map((item, index, arr) => (
              <View key={index} style={styles.timelineItem}>
                <View style={[styles.timelineIconContainer, { backgroundColor: item.color + '15' }]}>
                  <Ionicons name={item.icon as any} size={18} color={item.color} />
                </View>
                <Text style={styles.timelineLabel}>{item.label}</Text>
                <Text style={[styles.timelineTime, { color: item.color }]}>{item.time.split(' ')[1]}</Text>
                {index < arr.length - 1 && (
                  <View style={styles.timelineConnector}>
                    <View style={[styles.timelineConnectorLine, { backgroundColor: item.color + '40' }]} />
                  </View>
                )}
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Important Notes */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Önemli Notlar</Text>
        <View style={styles.notesCard}>
          {operation.importantNotes.map((note, index) => (
            <View key={index} style={styles.noteItem}>
              <Ionicons name="alert-circle" size={16} color="#F59E0B" />
              <Text style={styles.noteText}>{note}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Emergency Contacts */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Acil Durumlar</Text>
        {operation.emergencyContacts.map((contact, index) => (
          <TouchableOpacity
            key={index}
            style={styles.emergencyCard}
            onPress={() => handleCall(contact.phone)}
          >
            <View style={styles.emergencyInfo}>
              <Text style={styles.emergencyName}>{contact.name}</Text>
              <Text style={styles.emergencyRole}>{contact.role}</Text>
            </View>
            <View style={styles.emergencyPhone}>
              <Ionicons name="call" size={18} color="#10B981" />
              <Text style={styles.emergencyPhoneText}>{contact.phone}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderTasks = () => (
    <View style={styles.tabContent}>
      {/* Task Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
        <TouchableOpacity style={[styles.filterChip, styles.filterChipActive]}>
          <Text style={[styles.filterChipText, styles.filterChipTextActive]}>Tümü</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterChip}>
          <Text style={styles.filterChipText}>Görevlerim</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterChip}>
          <Text style={styles.filterChipText}>Onay Bekleyen</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterChip}>
          <Text style={styles.filterChipText}>Devam Eden</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Tasks List */}
      {visibleTasks.map((task) => {
        const canEdit = currentUser ? canEditTask(currentUser, task) : false;
        const canApprove = currentUser ? canApproveTask(currentUser, task) : false;
        const isMyTask = task.assignedTo.includes(currentUserId);

        return (
          <TouchableOpacity
            key={task.id}
            style={styles.taskCard}
            onPress={() => {
              setSelectedTask(task);
              setTaskModalVisible(true);
            }}
          >
            <View style={styles.taskHeader}>
              <View style={[styles.taskCategoryIcon, { backgroundColor: getPartyColor(task.assignedParty) + '20' }]}>
                <Ionicons name={getCategoryIcon(task.category) as any} size={18} color={getPartyColor(task.assignedParty)} />
              </View>
              <View style={styles.taskHeaderText}>
                <Text style={styles.taskTitle}>{task.title}</Text>
                <Text style={styles.taskCategory}>{getCategoryLabel(task.category)}</Text>
              </View>
              <View style={[styles.taskStatusBadge, { backgroundColor: getStatusColor(task.status) + '20' }]}>
                <Text style={[styles.taskStatusText, { color: getStatusColor(task.status) }]}>
                  {getStatusLabel(task.status)}
                </Text>
              </View>
            </View>

            {/* Progress */}
            <View style={styles.taskProgress}>
              <View style={styles.taskProgressBar}>
                <View
                  style={[
                    styles.taskProgressFill,
                    {
                      width: `${(task.checklist.filter(c => c.completed).length / task.checklist.length) * 100}%`,
                      backgroundColor: getStatusColor(task.status),
                    },
                  ]}
                />
              </View>
              <Text style={styles.taskProgressText}>
                {task.checklist.filter(c => c.completed).length}/{task.checklist.length}
              </Text>
            </View>

            {/* Task Meta */}
            <View style={styles.taskMeta}>
              <View style={styles.taskMetaItem}>
                <Ionicons name="time-outline" size={14} color="#6B7280" />
                <Text style={styles.taskMetaText}>{task.dueDate.split(' ')[1]}</Text>
              </View>
              <View style={styles.taskMetaItem}>
                <Ionicons name="people-outline" size={14} color="#6B7280" />
                <Text style={styles.taskMetaText}>{task.assignedTo.length} kişi</Text>
              </View>
              {isMyTask && (
                <View style={[styles.taskBadge, { backgroundColor: '#3B82F620' }]}>
                  <Text style={[styles.taskBadgeText, { color: '#3B82F6' }]}>Görevim</Text>
                </View>
              )}
              {canApprove && (
                <View style={[styles.taskBadge, { backgroundColor: '#F59E0B20' }]}>
                  <Text style={[styles.taskBadgeText, { color: '#F59E0B' }]}>Onay Bekliyor</Text>
                </View>
              )}
            </View>

            {/* Approvals Status */}
            <View style={styles.approvalsRow}>
              {task.requiredApprovals.map((approval, idx) => (
                <View key={idx} style={styles.approvalItem}>
                  <Ionicons
                    name={approval.approved ? 'checkmark-circle' : 'ellipse-outline'}
                    size={14}
                    color={approval.approved ? '#10B981' : '#D1D5DB'}
                  />
                  <Text style={styles.approvalText}>{getPartyLabel(approval.party)}</Text>
                </View>
              ))}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderSchedule = () => (
    <View style={styles.tabContent}>
      {/* Date Header */}
      <View style={styles.dateHeader}>
        <Text style={styles.dateHeaderText}>{operation.eventDate}</Text>
      </View>

      {/* Schedule Items */}
      {operation.schedule.map((block, index) => {
        const isMyBlock = currentUser && block.assignedMembers.includes(currentUserId);

        return (
          <View key={block.id} style={styles.scheduleItem}>
            <View style={styles.scheduleTime}>
              <Text style={styles.scheduleTimeText}>{block.startTime.split(' ')[1]}</Text>
              <View style={[styles.scheduleTimeIndicator, { backgroundColor: block.color }]} />
            </View>
            <View style={[styles.scheduleContent, { borderLeftColor: block.color }]}>
              <View style={styles.scheduleHeader}>
                <Text style={styles.scheduleTitle}>{block.title}</Text>
                {isMyBlock && (
                  <View style={[styles.myBadge, { backgroundColor: '#3B82F620' }]}>
                    <Text style={[styles.myBadgeText, { color: '#3B82F6' }]}>Benim</Text>
                  </View>
                )}
              </View>
              {block.description && (
                <Text style={styles.scheduleDescription}>{block.description}</Text>
              )}
              <View style={styles.scheduleFooter}>
                <View style={styles.scheduleLocation}>
                  <Ionicons name="location" size={12} color="#6B7280" />
                  <Text style={styles.scheduleLocationText}>{block.location}</Text>
                </View>
                <View style={[styles.partyIndicator, { backgroundColor: getPartyColor(block.responsibleParty) + '20' }]}>
                  <Text style={[styles.partyIndicatorText, { color: getPartyColor(block.responsibleParty) }]}>
                    {getPartyLabel(block.responsibleParty)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );

  const renderTeam = () => {
    const parties: { key: PartyType; data: { companyName: string; teamMembers: OperationTeamMember[] } }[] = [
      { key: 'organizer', data: { companyName: operation.parties.organizer.companyName, teamMembers: operation.parties.organizer.teamMembers } },
      { key: 'provider', data: { companyName: operation.parties.provider.companyName, teamMembers: operation.parties.provider.teamMembers } },
      { key: 'artist', data: { companyName: operation.parties.artist.artistName, teamMembers: operation.parties.artist.teamMembers } },
    ];

    return (
      <View style={styles.tabContent}>
        {parties.map(({ key, data }) => (
          <View key={key} style={styles.teamSection}>
            <View style={[styles.teamSectionHeader, { borderLeftColor: getPartyColor(key) }]}>
              <Text style={styles.teamSectionTitle}>{data.companyName}</Text>
              <Text style={styles.teamSectionSubtitle}>{getPartyLabel(key)} • {data.teamMembers.length} kişi</Text>
            </View>
            {data.teamMembers.map((member) => (
              <TouchableOpacity
                key={member.id}
                style={styles.teamMemberCard}
                onPress={() => {
                  setSelectedMember(member);
                  setMemberModalVisible(true);
                }}
              >
                <View style={styles.teamMemberLeft}>
                  <Image source={{ uri: member.image }} style={styles.teamMemberImage} />
                  <View style={[styles.onlineIndicator, { backgroundColor: member.isOnline ? '#10B981' : '#D1D5DB' }]} />
                </View>
                <View style={styles.teamMemberInfo}>
                  <Text style={styles.teamMemberName}>{member.name}</Text>
                  <Text style={styles.teamMemberRole}>{member.roleLabel}</Text>
                  {!member.isOnline && member.lastSeen && (
                    <Text style={styles.teamMemberLastSeen}>{member.lastSeen}</Text>
                  )}
                </View>
                <TouchableOpacity
                  style={styles.teamMemberCall}
                  onPress={(e) => {
                    e.stopPropagation();
                    handleCall(member.phone);
                  }}
                >
                  <Ionicons name="call" size={18} color="#10B981" />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>
    );
  };

  const renderEquipment = () => {
    const groupedEquipment = operation.equipment.reduce((acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {} as Record<string, EquipmentItem[]>);

    const getEquipmentStatusColor = (status: EquipmentItem['status']) => {
      switch (status) {
        case 'delivered': return '#10B981';
        case 'setup': return '#3B82F6';
        case 'tested': return '#8B5CF6';
        case 'pending': return '#F59E0B';
        case 'issue': return '#EF4444';
        default: return '#6B7280';
      }
    };

    const getEquipmentStatusLabel = (status: EquipmentItem['status']) => {
      switch (status) {
        case 'delivered': return 'Teslim Alındı';
        case 'setup': return 'Kuruldu';
        case 'tested': return 'Test Edildi';
        case 'pending': return 'Beklemede';
        case 'issue': return 'Sorun Var';
        default: return status;
      }
    };

    const getCategoryIcon = (category: string): string => {
      switch (category) {
        case 'Ses': return 'volume-high';
        case 'Işık': return 'flashlight';
        case 'Video': return 'videocam';
        default: return 'cube';
      }
    };

    return (
      <View style={styles.tabContent}>
        {Object.entries(groupedEquipment).map(([category, items]) => (
          <View key={category} style={styles.equipmentSection}>
            <View style={styles.equipmentSectionHeader}>
              <Ionicons name={getCategoryIcon(category) as any} size={18} color="#4B30B8" />
              <Text style={styles.equipmentSectionTitle}>{category}</Text>
              <Text style={styles.equipmentSectionCount}>{items.length} adet</Text>
            </View>
            {items.map((item) => (
              <View key={item.id} style={styles.equipmentCard}>
                <View style={styles.equipmentInfo}>
                  <Text style={styles.equipmentName}>{item.name}</Text>
                  <View style={styles.equipmentMeta}>
                    <Text style={styles.equipmentQuantity}>x{item.quantity}</Text>
                    <Text style={styles.equipmentProvider}>{item.providerName}</Text>
                    {item.riderRequirement && (
                      <View style={styles.riderBadge}>
                        <Text style={styles.riderBadgeText}>Rider</Text>
                      </View>
                    )}
                  </View>
                </View>
                <View style={[styles.equipmentStatus, { backgroundColor: getEquipmentStatusColor(item.status) + '20' }]}>
                  <Ionicons
                    name={
                      item.status === 'issue' ? 'alert-circle' :
                      item.status === 'pending' ? 'time' :
                      item.status === 'delivered' ? 'checkmark-circle' :
                      item.status === 'setup' ? 'construct' :
                      item.status === 'tested' ? 'shield-checkmark' :
                      'checkmark-circle'
                    }
                    size={14}
                    color={getEquipmentStatusColor(item.status)}
                  />
                  <Text style={[styles.equipmentStatusText, { color: getEquipmentStatusColor(item.status) }]}>
                    {getEquipmentStatusLabel(item.status)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        ))}
      </View>
    );
  };

  // Task Detail Modal
  const renderTaskModal = () => {
    if (!selectedTask) return null;

    const allMembers = [
      ...operation.parties.organizer.teamMembers,
      ...operation.parties.provider.teamMembers,
      ...operation.parties.artist.teamMembers,
    ];

    const assignedMembers = allMembers.filter(m => selectedTask.assignedTo.includes(m.id));

    return (
      <Modal
        visible={taskModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setTaskModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Görev Detayı</Text>
            <TouchableOpacity onPress={() => setTaskModalVisible(false)}>
              <Ionicons name="close" size={24} color="#1F2937" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* Task Header */}
            <View style={styles.taskDetailHeader}>
              <View style={[styles.taskCategoryIcon, { backgroundColor: getPartyColor(selectedTask.assignedParty) + '20', width: 48, height: 48 }]}>
                <Ionicons name={getCategoryIcon(selectedTask.category) as any} size={24} color={getPartyColor(selectedTask.assignedParty)} />
              </View>
              <Text style={styles.taskDetailTitle}>{selectedTask.title}</Text>
              <View style={[styles.taskStatusBadge, { backgroundColor: getStatusColor(selectedTask.status) + '20' }]}>
                <Text style={[styles.taskStatusText, { color: getStatusColor(selectedTask.status) }]}>
                  {getStatusLabel(selectedTask.status)}
                </Text>
              </View>
            </View>

            <Text style={styles.taskDetailDescription}>{selectedTask.description}</Text>

            {/* Assigned Members */}
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Atanan Kişiler</Text>
              {assignedMembers.map((member) => (
                <View key={member.id} style={styles.assignedMemberRow}>
                  <Image source={{ uri: member.image }} style={styles.assignedMemberImage} />
                  <View style={styles.assignedMemberInfo}>
                    <Text style={styles.assignedMemberName}>{member.name}</Text>
                    <Text style={styles.assignedMemberRole}>{member.roleLabel}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Checklist */}
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Kontrol Listesi</Text>
              {selectedTask.checklist.map((item) => (
                <View key={item.id} style={styles.checklistItem}>
                  <Ionicons
                    name={item.completed ? 'checkbox' : 'square-outline'}
                    size={20}
                    color={item.completed ? '#10B981' : '#D1D5DB'}
                  />
                  <Text style={[styles.checklistText, item.completed && styles.checklistTextCompleted]}>
                    {item.text}
                  </Text>
                </View>
              ))}
            </View>

            {/* Approvals */}
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Onaylar</Text>
              {selectedTask.requiredApprovals.map((approval, idx) => (
                <View key={idx} style={styles.approvalRow}>
                  <View style={styles.approvalLeft}>
                    <Ionicons
                      name={approval.approved ? 'checkmark-circle' : 'ellipse-outline'}
                      size={20}
                      color={approval.approved ? '#10B981' : '#D1D5DB'}
                    />
                    <Text style={styles.approvalRoleText}>{getPartyLabel(approval.party)}</Text>
                  </View>
                  {approval.approved && approval.approvedBy && (
                    <Text style={styles.approvalByText}>
                      {allMembers.find(m => m.id === approval.approvedBy)?.name}
                    </Text>
                  )}
                </View>
              ))}
            </View>

            {/* Comments */}
            {selectedTask.comments.length > 0 && (
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Yorumlar</Text>
                {selectedTask.comments.map((comment) => (
                  <View key={comment.id} style={styles.commentItem}>
                    <Image source={{ uri: comment.authorImage }} style={styles.commentAuthorImage} />
                    <View style={styles.commentContent}>
                      <View style={styles.commentHeader}>
                        <Text style={styles.commentAuthorName}>{comment.authorName}</Text>
                        <Text style={styles.commentTime}>{comment.createdAt}</Text>
                      </View>
                      <Text style={styles.commentText}>{comment.text}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>

          {/* Action Buttons */}
          {currentUser && canApproveTask(currentUser, selectedTask) && (
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.approveButton}>
                <Ionicons name="checkmark" size={20} color="#fff" />
                <Text style={styles.approveButtonText}>Onayla</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>
    );
  };

  // Member Detail Modal
  const renderMemberModal = () => {
    if (!selectedMember) return null;

    return (
      <Modal
        visible={memberModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setMemberModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Ekip Üyesi</Text>
            <TouchableOpacity onPress={() => setMemberModalVisible(false)}>
              <Ionicons name="close" size={24} color="#1F2937" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* Member Header */}
            <View style={styles.memberDetailHeader}>
              <Image source={{ uri: selectedMember.image }} style={styles.memberDetailImage} />
              <Text style={styles.memberDetailName}>{selectedMember.name}</Text>
              <Text style={styles.memberDetailRole}>{selectedMember.roleLabel}</Text>
              <View style={[styles.partyBadge, { backgroundColor: getPartyColor(selectedMember.party) + '20' }]}>
                <Text style={[styles.partyBadgeText, { color: getPartyColor(selectedMember.party) }]}>
                  {getPartyLabel(selectedMember.party)}
                </Text>
              </View>
            </View>

            {/* Contact Info */}
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>İletişim</Text>
              <TouchableOpacity style={styles.contactRow} onPress={() => handleCall(selectedMember.phone)}>
                <Ionicons name="call" size={20} color="#10B981" />
                <Text style={styles.contactText}>{selectedMember.phone}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.contactRow} onPress={() => Linking.openURL(`mailto:${selectedMember.email}`)}>
                <Ionicons name="mail" size={20} color="#3B82F6" />
                <Text style={styles.contactText}>{selectedMember.email}</Text>
              </TouchableOpacity>
            </View>

            {/* Permissions */}
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>İzinler</Text>
              <View style={styles.permissionsGrid}>
                {selectedMember.permissions.slice(0, 8).map((perm, idx) => (
                  <View key={idx} style={styles.permissionBadge}>
                    <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                    <Text style={styles.permissionText}>{perm.replace(/_/g, ' ')}</Text>
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.callButton} onPress={() => handleCall(selectedMember.phone)}>
              <Ionicons name="call" size={20} color="#fff" />
              <Text style={styles.callButtonText}>Ara</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollHeader scrollY={scrollY} title={operation.eventTitle} />

      {/* Back Button */}
      <TouchableOpacity
        style={[styles.backButton, { top: insets.top + 8 }]}
        onPress={handleBack}
      >
        <Ionicons name="chevron-back" size={24} color="#1F2937" />
      </TouchableOpacity>

      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingTop: insets.top + 56 }}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {/* Large Title */}
        <LargeTitle scrollY={scrollY} title={operation.eventTitle} subtitle={operation.eventVenue} />

        {/* Event Header Card */}
        <View style={styles.eventHeaderCard}>
          <View style={styles.eventHeaderTop}>
            <View style={[styles.eventStatusBadge, { backgroundColor: getOperationStatusColor(operation.status) + '20' }]}>
              <View style={[styles.statusDot, { backgroundColor: getOperationStatusColor(operation.status) }]} />
              <Text style={[styles.eventStatusText, { color: getOperationStatusColor(operation.status) }]}>
                {getOperationStatusLabel(operation.status)}
              </Text>
            </View>
            <Text style={styles.eventDate}>{operation.eventDate}</Text>
          </View>

          {/* Three Parties */}
          <View style={styles.partiesRow}>
            <View style={styles.partyItem}>
              <Image source={{ uri: operation.parties.organizer.companyLogo }} style={styles.partyLogo} />
              <Text style={styles.partyName} numberOfLines={1}>{operation.parties.organizer.companyName}</Text>
              <Text style={styles.partyType}>Organizatör</Text>
            </View>
            <View style={styles.partyDivider} />
            <View style={styles.partyItem}>
              <Image source={{ uri: operation.parties.provider.companyLogo }} style={styles.partyLogo} />
              <Text style={styles.partyName} numberOfLines={1}>{operation.parties.provider.companyName}</Text>
              <Text style={styles.partyType}>Teknik</Text>
            </View>
            <View style={styles.partyDivider} />
            <View style={styles.partyItem}>
              <Image source={{ uri: operation.parties.artist.artistImage }} style={styles.partyLogo} />
              <Text style={styles.partyName} numberOfLines={1}>{operation.parties.artist.artistName}</Text>
              <Text style={styles.partyType}>Sanatçı</Text>
            </View>
          </View>
        </View>

        {/* Tab Bar */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabBar}
          contentContainerStyle={styles.tabBarContent}
        >
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && styles.tabActive]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Ionicons
                name={tab.icon as any}
                size={18}
                color={activeTab === tab.key ? '#4B30B8' : '#6B7280'}
              />
              <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
                {tab.label}
              </Text>
              {tab.badge && (
                <View style={styles.tabBadge}>
                  <Text style={styles.tabBadgeText}>{tab.badge}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Tab Content */}
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'tasks' && renderTasks()}
        {activeTab === 'schedule' && renderSchedule()}
        {activeTab === 'team' && renderTeam()}
        {activeTab === 'equipment' && renderEquipment()}

        <View style={{ height: 100 }} />
      </Animated.ScrollView>

      {/* Modals */}
      {renderTaskModal()}
      {renderMemberModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  scrollView: {
    flex: 1,
  },
  scrollHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#F3F4F6',
    zIndex: 100,
    paddingBottom: 12,
    paddingHorizontal: 60,
  },
  scrollHeaderTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    marginTop: 12,
  },
  scrollHeaderBorder: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  largeTitleContainer: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  largeTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    letterSpacing: -0.5,
  },
  largeTitleSubtitle: {
    fontSize: 15,
    color: '#6B7280',
    marginTop: 4,
  },
  backButton: {
    position: 'absolute',
    left: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 101,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventHeaderCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  eventHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  eventStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  eventStatusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  eventDate: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  partiesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  partyItem: {
    flex: 1,
    alignItems: 'center',
  },
  partyLogo: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginBottom: 10,
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  partyName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 2,
  },
  partyType: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  partyDivider: {
    width: 1,
    height: 60,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 12,
  },
  tabBar: {
    marginTop: 16,
    marginBottom: 8,
  },
  tabBarContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#fff',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  tabActive: {
    backgroundColor: '#4B30B820',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#4B30B8',
    fontWeight: '600',
  },
  tabBadge: {
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
    marginLeft: 4,
  },
  tabBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  tabContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  // Current User Card
  currentUserCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
  },
  currentUserImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  currentUserInfo: {
    flex: 1,
  },
  currentUserName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  currentUserRole: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  partyBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 6,
  },
  partyBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  // Section
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  // Timeline
  timelineScroll: {
    marginHorizontal: -16,
  },
  timelineCard: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  timelineItem: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginRight: 12,
    minWidth: 90,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  timelineIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  timelineLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 4,
    textAlign: 'center',
  },
  timelineTime: {
    fontSize: 15,
    fontWeight: '700',
  },
  timelineConnector: {
    position: 'absolute',
    right: -12,
    top: '50%',
    width: 12,
    height: 2,
    justifyContent: 'center',
  },
  timelineConnectorLine: {
    height: 2,
    borderRadius: 1,
  },
  // Notes
  notesCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  noteItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  noteText: {
    flex: 1,
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
  },
  // Emergency
  emergencyCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  emergencyInfo: {
    flex: 1,
  },
  emergencyName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  emergencyRole: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  emergencyPhone: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  emergencyPhoneText: {
    fontSize: 13,
    color: '#10B981',
    fontWeight: '500',
  },
  // Filters
  filterScroll: {
    marginBottom: 12,
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#fff',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#4B30B8',
  },
  filterChipText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  // Task Card
  taskCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  taskCategoryIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  taskHeaderText: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  taskCategory: {
    fontSize: 12,
    color: '#6B7280',
  },
  taskStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  taskStatusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  taskProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  taskProgressBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    marginRight: 8,
  },
  taskProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  taskProgressText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  taskMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  taskMetaText: {
    fontSize: 12,
    color: '#6B7280',
  },
  taskBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  taskBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  approvalsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  approvalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  approvalText: {
    fontSize: 11,
    color: '#6B7280',
  },
  // Schedule
  dateHeader: {
    backgroundColor: '#4B30B8',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  dateHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  scheduleItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  scheduleTime: {
    width: 60,
    alignItems: 'center',
  },
  scheduleTimeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  scheduleTimeIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  scheduleContent: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 3,
    marginLeft: 8,
  },
  scheduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  scheduleTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  myBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  myBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  scheduleDescription: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  scheduleFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scheduleLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  scheduleLocationText: {
    fontSize: 11,
    color: '#6B7280',
  },
  partyIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  partyIndicatorText: {
    fontSize: 10,
    fontWeight: '600',
  },
  // Team
  teamSection: {
    marginBottom: 24,
  },
  teamSectionHeader: {
    borderLeftWidth: 3,
    paddingLeft: 12,
    marginBottom: 12,
  },
  teamSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  teamSectionSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  teamMemberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  teamMemberLeft: {
    position: 'relative',
    marginRight: 12,
  },
  teamMemberImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#fff',
  },
  teamMemberInfo: {
    flex: 1,
  },
  teamMemberName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  teamMemberRole: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  teamMemberLastSeen: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
  teamMemberCall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#10B98120',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Equipment
  equipmentSection: {
    marginBottom: 24,
  },
  equipmentSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  equipmentSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  equipmentSectionCount: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  equipmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  equipmentInfo: {
    flex: 1,
  },
  equipmentName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  equipmentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  equipmentQuantity: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  equipmentProvider: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  riderBadge: {
    backgroundColor: '#F59E0B20',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  riderBadgeText: {
    fontSize: 10,
    color: '#F59E0B',
    fontWeight: '600',
  },
  equipmentStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  equipmentStatusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1F2937',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalSection: {
    marginBottom: 24,
  },
  modalSectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  modalActions: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  // Task Detail
  taskDetailHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  taskDetailTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  taskDetailDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 24,
  },
  assignedMemberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  assignedMemberImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  assignedMemberInfo: {
    flex: 1,
  },
  assignedMemberName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  assignedMemberRole: {
    fontSize: 12,
    color: '#6B7280',
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    gap: 10,
  },
  checklistText: {
    flex: 1,
    fontSize: 14,
    color: '#1F2937',
  },
  checklistTextCompleted: {
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  approvalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  approvalLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  approvalRoleText: {
    fontSize: 14,
    color: '#1F2937',
  },
  approvalByText: {
    fontSize: 13,
    color: '#10B981',
    fontWeight: '500',
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  commentAuthorImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
  },
  commentContent: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  commentAuthorName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
  },
  commentTime: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  commentText: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
  },
  approveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
  },
  approveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  // Member Detail
  memberDetailHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  memberDetailImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
  },
  memberDetailName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  memberDetailRole: {
    fontSize: 15,
    color: '#6B7280',
    marginBottom: 8,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    gap: 12,
  },
  contactText: {
    fontSize: 15,
    color: '#1F2937',
  },
  permissionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  permissionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 6,
  },
  permissionText: {
    fontSize: 12,
    color: '#4B5563',
    textTransform: 'capitalize',
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
  },
  callButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default EventOperationsScreen;
