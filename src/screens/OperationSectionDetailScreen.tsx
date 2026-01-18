/**
 * Operasyon Bölümü Detay Ekranı
 *
 * Her bölümün detaylı görünümü:
 * - Provider atanmışsa: Tam özellikli görünüm
 * - Provider atanmamışsa: Planlama modu
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Linking,
  TextInput,
  Modal,
  Alert,
  RefreshControl,
} from 'react-native';
import { OptimizedImage } from '../components/OptimizedImage';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  FadeIn,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

import { useOperationPermissions, useSectionPermission } from '../hooks/useOperationPermissions';
import {
  OperationSectionType,
  OperationSection,
  SECTION_META,
  SectionTask,
  SectionNote,
  SectionRequirement,
  SectionDocument,
  getSectionStatusLabel,
  getSectionStatusColor,
} from '../types/operationSection';
import {
  sampleEventOperations,
  currentOperationUser,
  sampleSectionTeams,
} from '../data/operationSectionsData';

const { width } = Dimensions.get('window');

// Navigation types
type RootStackParamList = {
  OperationSectionDetail: {
    eventId: string;
    sectionType: OperationSectionType;
  };
  Chat: { chatId: string; recipientName: string };
};

type OperationSectionDetailRouteProp = RouteProp<RootStackParamList, 'OperationSectionDetail'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Tab types
type SectionTab = 'overview' | 'tasks' | 'team' | 'notes' | 'documents';

// Animated components
const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

export function OperationSectionDetailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<OperationSectionDetailRouteProp>();
  const insets = useSafeAreaInsets();
  const scrollY = useSharedValue(0);

  const { sectionType } = route.params;

  // Get section data
  const section = useMemo(() => {
    return sampleEventOperations.sections.find((s) => s.type === sectionType);
  }, [sectionType]);

  const meta = SECTION_META[sectionType];

  // Permission hooks
  const { canView, canEdit, canApprove } = useSectionPermission(sectionType);
  const { canCreateTask, canAssignTask, canUploadDocument, canAssignProvider } =
    useOperationPermissions();

  // State
  const [activeTab, setActiveTab] = useState<SectionTab>('overview');
  const [refreshing, setRefreshing] = useState(false);
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);
  const [newNoteText, setNewNoteText] = useState('');
  const [showAddRequirementModal, setShowAddRequirementModal] = useState(false);
  const [newRequirementTitle, setNewRequirementTitle] = useState('');
  const [newRequirementDescription, setNewRequirementDescription] = useState('');

  // Derived data
  const hasProvider = section?.provider !== null;
  const teamMembers = sampleSectionTeams[sectionType] || [];

  // Scroll handler
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // Animated header style
  const headerStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, 80, 120],
      [0, 0.5, 1],
      Extrapolation.CLAMP
    );
    return { opacity };
  });

  // Handlers
  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handleCall = useCallback((phone: string) => {
    Linking.openURL(`tel:${phone}`);
  }, []);

  const handleAddNote = useCallback(() => {
    if (!newNoteText.trim()) return;
    // TODO: API call to add note
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Başarılı', 'Not eklendi');
    setNewNoteText('');
    setShowAddNoteModal(false);
  }, [newNoteText]);

  const handleAddRequirement = useCallback(() => {
    if (!newRequirementTitle.trim()) return;
    // TODO: API call to add requirement
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Başarılı', 'Gereksinim eklendi');
    setNewRequirementTitle('');
    setNewRequirementDescription('');
    setShowAddRequirementModal(false);
  }, [newRequirementTitle]);

  const handleAssignProvider = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // TODO: Open provider assignment modal
    Alert.alert('Provider Ata', 'Provider seçme ekranı açılacak');
  }, []);

  // Tab configuration
  const tabs: { key: SectionTab; label: string; icon: string }[] = [
    { key: 'overview', label: 'Özet', icon: 'grid' },
    { key: 'tasks', label: 'Görevler', icon: 'checkbox' },
    { key: 'team', label: 'Ekip', icon: 'people' },
    { key: 'notes', label: 'Notlar', icon: 'document-text' },
    { key: 'documents', label: 'Dökümanlar', icon: 'folder' },
  ];

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'tasks':
        return renderTasks();
      case 'team':
        return renderTeam();
      case 'notes':
        return renderNotes();
      case 'documents':
        return renderDocuments();
      default:
        return null;
    }
  };

  // Overview Tab
  const renderOverview = () => (
    <Animated.View entering={FadeIn.duration(300)} style={styles.tabContent}>
      {/* Provider Info or Planning Mode */}
      {hasProvider ? (
        <View style={styles.providerCard}>
          <View style={styles.providerHeader}>
            <OptimizedImage
              source={section?.provider?.logo || ''}
              style={styles.providerLogo}
            />
            <View style={styles.providerInfo}>
              <Text style={styles.providerName}>{section?.provider?.name}</Text>
              <Text style={styles.providerContact}>
                {section?.provider?.contactPerson}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.callButton}
              onPress={() => handleCall(section?.provider?.contactPhone || '')}
            >
              <Ionicons name="call" size={18} color="#10B981" />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.planningCard}>
          <View style={styles.planningHeader}>
            <Ionicons name="alert-circle" size={32} color="#F59E0B" />
            <Text style={styles.planningTitle}>Provider Ataması Bekleniyor</Text>
            <Text style={styles.planningDescription}>
              Bu bölüm için henüz bir firma atanmadı.
              Planlama yapabilir ve notlar ekleyebilirsiniz.
            </Text>
          </View>
          {canAssignProvider(sectionType) && (
            <TouchableOpacity
              style={[styles.assignProviderButton, { backgroundColor: meta.color }]}
              onPress={handleAssignProvider}
            >
              <Ionicons name="search" size={18} color="#fff" />
              <Text style={styles.assignProviderText}>Provider Ara ve Ata</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Summary Card */}
      {section?.summary && (
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>{section.summary.label}</Text>
          <Text style={styles.summaryValue}>{section.summary.value}</Text>
          {section.summary.subLabel && (
            <Text style={styles.summarySubLabel}>{section.summary.subLabel}</Text>
          )}
        </View>
      )}

      {/* Quick Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <View style={[styles.statIconContainer, { backgroundColor: '#3B82F620' }]}>
            <Ionicons name="checkbox" size={18} color="#3B82F6" />
          </View>
          <Text style={styles.statNumber}>{section?.tasks.length || 0}</Text>
          <Text style={styles.statLabel}>Görev</Text>
        </View>
        <View style={styles.statCard}>
          <View style={[styles.statIconContainer, { backgroundColor: '#10B98120' }]}>
            <Ionicons name="checkmark-circle" size={18} color="#10B981" />
          </View>
          <Text style={styles.statNumber}>
            {section?.tasks.filter((t) => t.status === 'completed').length || 0}
          </Text>
          <Text style={styles.statLabel}>Tamamlanan</Text>
        </View>
        <View style={styles.statCard}>
          <View style={[styles.statIconContainer, { backgroundColor: '#8B5CF620' }]}>
            <Ionicons name="people" size={18} color="#8B5CF6" />
          </View>
          <Text style={styles.statNumber}>{teamMembers.length}</Text>
          <Text style={styles.statLabel}>Ekip</Text>
        </View>
      </View>

      {/* Requirements Section */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Gereksinimler</Text>
          {canEdit && (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowAddRequirementModal(true)}
            >
              <Ionicons name="add" size={18} color="#4B30B8" />
            </TouchableOpacity>
          )}
        </View>
        {section?.requirements.map((req) => (
          <View key={req.id} style={styles.requirementItem}>
            <View
              style={[
                styles.requirementStatus,
                {
                  backgroundColor:
                    req.status === 'fulfilled'
                      ? '#10B98120'
                      : req.status === 'confirmed'
                      ? '#3B82F620'
                      : '#F59E0B20',
                },
              ]}
            >
              <Ionicons
                name={
                  req.status === 'fulfilled'
                    ? 'checkmark-circle'
                    : req.status === 'confirmed'
                    ? 'ellipse'
                    : 'time'
                }
                size={16}
                color={
                  req.status === 'fulfilled'
                    ? '#10B981'
                    : req.status === 'confirmed'
                    ? '#3B82F6'
                    : '#F59E0B'
                }
              />
            </View>
            <View style={styles.requirementContent}>
              <Text style={styles.requirementTitle}>{req.title}</Text>
              {req.quantity && (
                <Text style={styles.requirementQuantity}>
                  {req.quantity} {req.unit}
                </Text>
              )}
            </View>
          </View>
        ))}
        {(!section?.requirements || section.requirements.length === 0) && (
          <Text style={styles.emptyText}>Henüz gereksinim eklenmedi</Text>
        )}
      </View>
    </Animated.View>
  );

  // Tasks Tab
  const renderTasks = () => (
    <Animated.View entering={FadeIn.duration(300)} style={styles.tabContent}>
      {canCreateTask(sectionType) && (
        <TouchableOpacity style={styles.addTaskButton}>
          <Ionicons name="add-circle" size={20} color="#4B30B8" />
          <Text style={styles.addTaskText}>Yeni Görev Ekle</Text>
        </TouchableOpacity>
      )}

      {section?.tasks.map((task) => (
        <TouchableOpacity key={task.id} style={styles.taskCard}>
          <View style={styles.taskHeader}>
            <View
              style={[
                styles.taskStatusBadge,
                {
                  backgroundColor:
                    task.status === 'completed'
                      ? '#10B98120'
                      : task.status === 'in_progress'
                      ? '#3B82F620'
                      : '#F59E0B20',
                },
              ]}
            >
              <Text
                style={[
                  styles.taskStatusText,
                  {
                    color:
                      task.status === 'completed'
                        ? '#10B981'
                        : task.status === 'in_progress'
                        ? '#3B82F6'
                        : '#F59E0B',
                  },
                ]}
              >
                {task.status === 'completed'
                  ? 'Tamamlandı'
                  : task.status === 'in_progress'
                  ? 'Devam Ediyor'
                  : 'Beklemede'}
              </Text>
            </View>
            <View
              style={[
                styles.taskPriorityBadge,
                {
                  backgroundColor:
                    task.priority === 'high'
                      ? '#EF444420'
                      : task.priority === 'medium'
                      ? '#F59E0B20'
                      : '#10B98120',
                },
              ]}
            >
              <Text
                style={[
                  styles.taskPriorityText,
                  {
                    color:
                      task.priority === 'high'
                        ? '#EF4444'
                        : task.priority === 'medium'
                        ? '#F59E0B'
                        : '#10B981',
                  },
                ]}
              >
                {task.priority === 'high'
                  ? 'Yüksek'
                  : task.priority === 'medium'
                  ? 'Orta'
                  : 'Düşük'}
              </Text>
            </View>
          </View>
          <Text style={styles.taskTitle}>{task.title}</Text>
          <Text style={styles.taskDescription} numberOfLines={2}>
            {task.description}
          </Text>
          <View style={styles.taskFooter}>
            <View style={styles.taskAssignees}>
              {task.assignedTo.slice(0, 3).map((assignee, index) => (
                <OptimizedImage
                  key={assignee.id}
                  source={assignee.image}
                  style={[
                    styles.taskAssigneeImage,
                    { marginLeft: index > 0 ? -8 : 0 },
                  ]}
                />
              ))}
              {task.assignedTo.length > 3 && (
                <View style={styles.taskAssigneeMore}>
                  <Text style={styles.taskAssigneeMoreText}>
                    +{task.assignedTo.length - 3}
                  </Text>
                </View>
              )}
            </View>
            {task.dueDate && (
              <View style={styles.taskDueDate}>
                <Ionicons name="time-outline" size={14} color="#6B7280" />
                <Text style={styles.taskDueDateText}>{task.dueDate}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      ))}

      {(!section?.tasks || section.tasks.length === 0) && (
        <View style={styles.emptyState}>
          <Ionicons name="checkbox-outline" size={48} color="#D1D5DB" />
          <Text style={styles.emptyStateTitle}>Henüz görev yok</Text>
          <Text style={styles.emptyStateText}>
            Görev ekleyerek başlayabilirsiniz
          </Text>
        </View>
      )}
    </Animated.View>
  );

  // Team Tab
  const renderTeam = () => (
    <Animated.View entering={FadeIn.duration(300)} style={styles.tabContent}>
      {/* Provider Team */}
      {hasProvider && (
        <View style={styles.teamSection}>
          <Text style={styles.teamSectionTitle}>Provider Ekibi</Text>
          {teamMembers
            .filter((m) => m.party === 'provider')
            .map((member) => (
              <TouchableOpacity key={member.id} style={styles.teamMemberCard}>
                <OptimizedImage source={member.image} style={styles.teamMemberImage} />
                <View style={styles.teamMemberInfo}>
                  <Text style={styles.teamMemberName}>{member.name}</Text>
                  <Text style={styles.teamMemberRole}>{member.role}</Text>
                </View>
                <TouchableOpacity
                  style={styles.teamMemberCall}
                  onPress={() => handleCall(member.phone)}
                >
                  <Ionicons name="call" size={16} color="#10B981" />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
        </View>
      )}

      {/* Organizer Team */}
      <View style={styles.teamSection}>
        <Text style={styles.teamSectionTitle}>Organizatör Ekibi</Text>
        {teamMembers
          .filter((m) => m.party === 'organizer')
          .map((member) => (
            <TouchableOpacity key={member.id} style={styles.teamMemberCard}>
              <OptimizedImage source={member.image} style={styles.teamMemberImage} />
              <View style={styles.teamMemberInfo}>
                <Text style={styles.teamMemberName}>{member.name}</Text>
                <Text style={styles.teamMemberRole}>{member.role}</Text>
              </View>
              <TouchableOpacity
                style={styles.teamMemberCall}
                onPress={() => handleCall(member.phone)}
              >
                <Ionicons name="call" size={16} color="#10B981" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
      </View>

      {/* Booking Team */}
      <View style={styles.teamSection}>
        <Text style={styles.teamSectionTitle}>Booking Ekibi</Text>
        {teamMembers
          .filter((m) => m.party === 'booking')
          .map((member) => (
            <TouchableOpacity key={member.id} style={styles.teamMemberCard}>
              <OptimizedImage source={member.image} style={styles.teamMemberImage} />
              <View style={styles.teamMemberInfo}>
                <Text style={styles.teamMemberName}>{member.name}</Text>
                <Text style={styles.teamMemberRole}>{member.role}</Text>
              </View>
              <TouchableOpacity
                style={styles.teamMemberCall}
                onPress={() => handleCall(member.phone)}
              >
                <Ionicons name="call" size={16} color="#10B981" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
      </View>

      {teamMembers.length === 0 && (
        <View style={styles.emptyState}>
          <Ionicons name="people-outline" size={48} color="#D1D5DB" />
          <Text style={styles.emptyStateTitle}>Ekip üyesi yok</Text>
        </View>
      )}
    </Animated.View>
  );

  // Notes Tab
  const renderNotes = () => (
    <Animated.View entering={FadeIn.duration(300)} style={styles.tabContent}>
      {canEdit && (
        <TouchableOpacity
          style={styles.addNoteButton}
          onPress={() => setShowAddNoteModal(true)}
        >
          <Ionicons name="add-circle" size={20} color="#4B30B8" />
          <Text style={styles.addNoteText}>Not Ekle</Text>
        </TouchableOpacity>
      )}

      {section?.notes.map((note) => (
        <View
          key={note.id}
          style={[styles.noteCard, note.isPinned && styles.noteCardPinned]}
        >
          {note.isPinned && (
            <View style={styles.pinnedBadge}>
              <Ionicons name="pin" size={12} color="#F59E0B" />
            </View>
          )}
          <View style={styles.noteHeader}>
            <OptimizedImage source={note.author.image} style={styles.noteAuthorImage} />
            <View style={styles.noteAuthorInfo}>
              <Text style={styles.noteAuthorName}>{note.author.name}</Text>
              <Text style={styles.noteDate}>{note.createdAt}</Text>
            </View>
          </View>
          <Text style={styles.noteText}>{note.text}</Text>
        </View>
      ))}

      {(!section?.notes || section.notes.length === 0) && (
        <View style={styles.emptyState}>
          <Ionicons name="document-text-outline" size={48} color="#D1D5DB" />
          <Text style={styles.emptyStateTitle}>Henüz not yok</Text>
          <Text style={styles.emptyStateText}>
            Not ekleyerek bilgi paylaşabilirsiniz
          </Text>
        </View>
      )}
    </Animated.View>
  );

  // Documents Tab
  const renderDocuments = () => (
    <Animated.View entering={FadeIn.duration(300)} style={styles.tabContent}>
      {canUploadDocument(sectionType) && (
        <TouchableOpacity style={styles.uploadButton}>
          <Ionicons name="cloud-upload" size={20} color="#4B30B8" />
          <Text style={styles.uploadText}>Döküman Yükle</Text>
        </TouchableOpacity>
      )}

      {section?.documents.map((doc) => (
        <TouchableOpacity key={doc.id} style={styles.documentCard}>
          <View
            style={[
              styles.documentIcon,
              {
                backgroundColor:
                  doc.type === 'pdf'
                    ? '#EF444420'
                    : doc.type === 'image'
                    ? '#3B82F620'
                    : doc.type === 'spreadsheet'
                    ? '#10B98120'
                    : '#6B728020',
              },
            ]}
          >
            <Ionicons
              name={
                doc.type === 'pdf'
                  ? 'document'
                  : doc.type === 'image'
                  ? 'image'
                  : doc.type === 'spreadsheet'
                  ? 'grid'
                  : 'document-text'
              }
              size={20}
              color={
                doc.type === 'pdf'
                  ? '#EF4444'
                  : doc.type === 'image'
                  ? '#3B82F6'
                  : doc.type === 'spreadsheet'
                  ? '#10B981'
                  : '#6B7280'
              }
            />
          </View>
          <View style={styles.documentInfo}>
            <Text style={styles.documentName} numberOfLines={1}>
              {doc.name}
            </Text>
            <Text style={styles.documentMeta}>
              {(doc.size / 1024).toFixed(1)} KB • {doc.uploadedBy.name}
            </Text>
          </View>
          <Ionicons name="download-outline" size={20} color="#6B7280" />
        </TouchableOpacity>
      ))}

      {(!section?.documents || section.documents.length === 0) && (
        <View style={styles.emptyState}>
          <Ionicons name="folder-outline" size={48} color="#D1D5DB" />
          <Text style={styles.emptyStateTitle}>Henüz döküman yok</Text>
          <Text style={styles.emptyStateText}>
            Döküman yükleyerek paylaşabilirsiniz
          </Text>
        </View>
      )}
    </Animated.View>
  );

  // Add Note Modal
  const renderAddNoteModal = () => (
    <Modal
      visible={showAddNoteModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowAddNoteModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowAddNoteModal(false)}>
            <Text style={styles.modalCancel}>İptal</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Not Ekle</Text>
          <TouchableOpacity onPress={handleAddNote}>
            <Text
              style={[
                styles.modalDone,
                !newNoteText.trim() && styles.modalDoneDisabled,
              ]}
            >
              Ekle
            </Text>
          </TouchableOpacity>
        </View>
        <TextInput
          style={styles.noteInput}
          placeholder="Notunuzu yazın..."
          placeholderTextColor="#9CA3AF"
          value={newNoteText}
          onChangeText={setNewNoteText}
          multiline
          textAlignVertical="top"
          autoFocus
        />
      </View>
    </Modal>
  );

  // Add Requirement Modal
  const renderAddRequirementModal = () => (
    <Modal
      visible={showAddRequirementModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowAddRequirementModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowAddRequirementModal(false)}>
            <Text style={styles.modalCancel}>İptal</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Gereksinim Ekle</Text>
          <TouchableOpacity onPress={handleAddRequirement}>
            <Text
              style={[
                styles.modalDone,
                !newRequirementTitle.trim() && styles.modalDoneDisabled,
              ]}
            >
              Ekle
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.modalContent}>
          <TextInput
            style={styles.requirementInput}
            placeholder="Başlık"
            placeholderTextColor="#9CA3AF"
            value={newRequirementTitle}
            onChangeText={setNewRequirementTitle}
            autoFocus
          />
          <TextInput
            style={[styles.requirementInput, styles.requirementDescInput]}
            placeholder="Açıklama (opsiyonel)"
            placeholderTextColor="#9CA3AF"
            value={newRequirementDescription}
            onChangeText={setNewRequirementDescription}
            multiline
            textAlignVertical="top"
          />
        </View>
      </View>
    </Modal>
  );

  if (!section) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Bölüm bulunamadı</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Fixed Header Background */}
      <Animated.View
        style={[
          styles.headerBackground,
          { paddingTop: insets.top },
          headerStyle,
        ]}
      >
        <Text style={styles.headerTitle}>{meta.name}</Text>
      </Animated.View>

      {/* Back Button */}
      <TouchableOpacity
        style={[styles.backButton, { top: insets.top + 8 }]}
        onPress={handleBack}
      >
        <Ionicons name="chevron-back" size={24} color="#1F2937" />
      </TouchableOpacity>

      {/* Main Content */}
      <AnimatedScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 60 },
        ]}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Section Header */}
        <View style={styles.sectionHeaderContainer}>
          <LinearGradient
            colors={meta.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.sectionGradient}
          >
            <View style={styles.sectionIconLarge}>
              <Ionicons name={meta.icon as any} size={32} color="#fff" />
            </View>
          </LinearGradient>
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionMainTitle}>{meta.name}</Text>
            <Text style={styles.sectionDescription}>{meta.description}</Text>
          </View>
          <View
            style={[
              styles.sectionStatusBadge,
              { backgroundColor: getSectionStatusColor(section.status) + '20' },
            ]}
          >
            <View
              style={[
                styles.sectionStatusDot,
                { backgroundColor: getSectionStatusColor(section.status) },
              ]}
            />
            <Text
              style={[
                styles.sectionStatusText,
                { color: getSectionStatusColor(section.status) },
              ]}
            >
              {getSectionStatusLabel(section.status)}
            </Text>
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
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setActiveTab(tab.key);
              }}
            >
              <Ionicons
                name={tab.icon as any}
                size={16}
                color={activeTab === tab.key ? meta.color : '#6B7280'}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab.key && { color: meta.color },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Tab Content */}
        {renderTabContent()}

        <View style={{ height: 100 }} />
      </AnimatedScrollView>

      {/* Modals */}
      {renderAddNoteModal()}
      {renderAddRequirementModal()}
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
  scrollContent: {
    paddingHorizontal: 16,
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#F3F4F6',
    zIndex: 100,
    paddingBottom: 12,
    paddingHorizontal: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    marginTop: 12,
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
  sectionHeaderContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionGradient: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  sectionIconLarge: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitleContainer: {
    marginBottom: 12,
  },
  sectionMainTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  sectionStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  sectionStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  sectionStatusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  tabBar: {
    marginBottom: 16,
  },
  tabBarContent: {
    gap: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#fff',
    gap: 6,
  },
  tabActive: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
  },
  tabContent: {
    minHeight: 200,
  },
  // Provider Card
  providerCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  providerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  providerLogo: {
    width: 48,
    height: 48,
    borderRadius: 12,
    marginRight: 12,
    backgroundColor: '#F3F4F6',
  },
  providerInfo: {
    flex: 1,
  },
  providerName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  providerContact: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  callButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#10B98120',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Planning Card
  planningCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F59E0B40',
    borderStyle: 'dashed',
  },
  planningHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  planningTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#92400E',
    marginTop: 12,
    marginBottom: 8,
  },
  planningDescription: {
    fontSize: 14,
    color: '#92400E',
    textAlign: 'center',
    lineHeight: 20,
    opacity: 0.8,
  },
  assignProviderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  assignProviderText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  // Summary Card
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  summarySubLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: 10,
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
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  // Section Container
  sectionContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  addButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#4B30B820',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Requirements
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  requirementStatus: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  requirementContent: {
    flex: 1,
  },
  requirementTitle: {
    fontSize: 14,
    color: '#1F2937',
  },
  requirementQuantity: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  // Tasks
  addTaskButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#4B30B840',
    borderStyle: 'dashed',
    gap: 8,
  },
  addTaskText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B30B8',
  },
  taskCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  taskHeader: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  taskStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  taskStatusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  taskPriorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  taskPriorityText: {
    fontSize: 11,
    fontWeight: '600',
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  taskDescription: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 12,
  },
  taskFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  taskAssignees: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskAssigneeImage: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#fff',
  },
  taskAssigneeMore: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -8,
  },
  taskAssigneeMoreText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6B7280',
  },
  taskDueDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  taskDueDateText: {
    fontSize: 12,
    color: '#6B7280',
  },
  // Team
  teamSection: {
    marginBottom: 20,
  },
  teamSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  teamMemberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  teamMemberImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
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
  teamMemberCall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#10B98120',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Notes
  addNoteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#4B30B840',
    borderStyle: 'dashed',
    gap: 8,
  },
  addNoteText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B30B8',
  },
  noteCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  noteCardPinned: {
    borderWidth: 1,
    borderColor: '#F59E0B40',
  },
  pinnedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  noteAuthorImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
  },
  noteAuthorInfo: {
    flex: 1,
  },
  noteAuthorName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
  },
  noteDate: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 1,
  },
  noteText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  // Documents
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#4B30B840',
    borderStyle: 'dashed',
    gap: 8,
  },
  uploadText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B30B8',
  },
  documentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  documentIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  documentInfo: {
    flex: 1,
  },
  documentName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  documentMeta: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 12,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: '#9CA3AF',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 12,
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
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalCancel: {
    fontSize: 16,
    color: '#6B7280',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1F2937',
  },
  modalDone: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4B30B8',
  },
  modalDoneDisabled: {
    color: '#D1D5DB',
  },
  modalContent: {
    padding: 16,
  },
  noteInput: {
    flex: 1,
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#1F2937',
    textAlignVertical: 'top',
  },
  requirementInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#1F2937',
    marginBottom: 12,
  },
  requirementDescInput: {
    minHeight: 100,
  },
  // Error
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
  },
});

export default OperationSectionDetailScreen;
