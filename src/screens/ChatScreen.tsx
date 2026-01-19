import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Alert,
  Keyboard,
  Animated,
  Dimensions,
} from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
import * as Haptics from 'expo-haptics';
import { OptimizedImage } from '../components/OptimizedImage';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { gradients } from '../theme/colors';
import { getConversationById, createNewConversation, ChatMessage } from '../data/messagesData';

interface ChatParams {
  conversationId?: string;
  providerId?: string;
  providerName?: string;
  providerImage?: string;
  serviceCategory?: string;
}

// Mock events for offer selection
const mockEvents = [
  { id: 'e1', title: 'Yaz Festivali 2026', date: '15 Temmuz 2026' },
  { id: 'e2', title: 'Kurumsal Lansman', date: '22 Ağustos 2026' },
  { id: 'e3', title: 'Düğün Organizasyonu', date: '5 Eylül 2026' },
];

export function ChatScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { colors, isDark, helpers } = useTheme();
  const insets = useSafeAreaInsets();
  const params = (route.params || {}) as ChatParams;

  // Support both conversationId and providerId/providerName/providerImage
  const getConversationData = React.useMemo(() => {
    // First check for conversationId
    if (params?.conversationId) {
      const found = getConversationById(params.conversationId);
      if (found) {
        return {
          id: found.id,
          participantName: found.participantName,
          participantImage: found.participantImage,
          online: found.online,
          messages: found.messages,
        };
      }
    }

    // If providerId is passed, create a new conversation
    if (params?.providerId && params?.providerName) {
      const newConv = createNewConversation(
        params.providerId,
        params.providerName,
        params.providerImage || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400',
        params.serviceCategory || 'provider'
      );
      return {
        id: newConv.id,
        participantName: newConv.participantName,
        participantImage: newConv.participantImage,
        online: newConv.online,
        messages: newConv.messages,
      };
    }

    // Default fallback - get first conversation
    const defaultConv = getConversationById('c1');
    if (defaultConv) {
      return {
        id: defaultConv.id,
        participantName: defaultConv.participantName,
        participantImage: defaultConv.participantImage,
        online: defaultConv.online,
        messages: defaultConv.messages,
      };
    }

    // Ultimate fallback
    return {
      id: 'fallback',
      participantName: 'Bilinmeyen',
      participantImage: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400',
      online: false,
      messages: [],
    };
  }, [params?.conversationId, params?.providerId, params?.providerName, params?.providerImage, params?.serviceCategory]);

  const conversation = getConversationData;
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>(conversation.messages as ChatMessage[]);
  const scrollViewRef = useRef<ScrollView>(null);

  // Keyboard state
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const keyboardPadding = useRef(new Animated.Value(0)).current;

  // Handle keyboard events
  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSubscription = Keyboard.addListener(showEvent, (event) => {
      setKeyboardHeight(event.endCoordinates.height);
      Animated.timing(keyboardPadding, {
        toValue: Platform.OS === 'ios' ? 0 : event.endCoordinates.height,
        duration: event.duration || 250,
        useNativeDriver: false,
      }).start();

      // Scroll to bottom when keyboard appears
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });

    const hideSubscription = Keyboard.addListener(hideEvent, (event) => {
      setKeyboardHeight(0);
      Animated.timing(keyboardPadding, {
        toValue: 0,
        duration: event.duration || 250,
        useNativeDriver: false,
      }).start();
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, [keyboardPadding]);

  // Modal states
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [showFileOptions, setShowFileOptions] = useState(false);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Common emojis for quick access
  const commonEmojis = ['😊', '👍', '❤️', '🎉', '👏', '🔥', '✅', '💯', '🙏', '😂', '🤝', '⭐', '💪', '🎵', '🎤', '🎸', '🎹', '🥁', '📅', '💼'];

  // Offer form state
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [offerAmount, setOfferAmount] = useState('');
  const [offerDescription, setOfferDescription] = useState('');

  // Meeting form state
  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingDate, setMeetingDate] = useState('');
  const [meetingTime, setMeetingTime] = useState('');
  const [meetingLocation, setMeetingLocation] = useState('');

  // Update messages when conversation changes
  React.useEffect(() => {
    setMessages(conversation.messages as ChatMessage[]);
  }, [conversation]);

  // Handle call button
  const handleCall = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      'Sesli Arama',
      `${conversation.participantName} ile sesli arama başlatılsın mı?`,
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Ara', onPress: () => Alert.alert('Aranıyor...', 'Arama özelliği yakında aktif olacak.') },
      ]
    );
  };

  // Handle emoji selection
  const handleEmojiSelect = (emoji: string) => {
    setMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  // Handle chat options
  const chatOptions = [
    { id: 'profile', label: 'Profili Görüntüle', icon: 'person-outline', action: () => {
      setShowOptionsModal(false);
      navigation.navigate('ProviderDetail', { providerId: conversation.id });
    }},
    { id: 'mute', label: 'Bildirimleri Sessize Al', icon: 'notifications-off-outline', action: () => {
      setShowOptionsModal(false);
      Alert.alert('Bildirimler', 'Bildirimler sessize alındı.');
    }},
    { id: 'search', label: 'Mesajlarda Ara', icon: 'search-outline', action: () => {
      setShowOptionsModal(false);
      Alert.alert('Arama', 'Mesaj arama özelliği yakında aktif olacak.');
    }},
    { id: 'media', label: 'Medya & Dosyalar', icon: 'images-outline', action: () => {
      setShowOptionsModal(false);
      Alert.alert('Medya', 'Paylaşılan medya ve dosyalar görüntülenecek.');
    }},
    { id: 'block', label: 'Engelle', icon: 'ban-outline', action: () => {
      setShowOptionsModal(false);
      Alert.alert(
        'Engelle',
        `${conversation.participantName} engellensin mi?`,
        [
          { text: 'İptal', style: 'cancel' },
          { text: 'Engelle', style: 'destructive', onPress: () => Alert.alert('Engellendi', 'Kullanıcı engellendi.') },
        ]
      );
    }},
    { id: 'delete', label: 'Sohbeti Sil', icon: 'trash-outline', action: () => {
      setShowOptionsModal(false);
      Alert.alert(
        'Sohbeti Sil',
        'Bu sohbet silinsin mi? Bu işlem geri alınamaz.',
        [
          { text: 'İptal', style: 'cancel' },
          { text: 'Sil', style: 'destructive', onPress: () => navigation.goBack() },
        ]
      );
    }},
  ];

  const sendMessage = () => {
    if (!message.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const newMessage: ChatMessage = {
      id: `m${messages.length + 1}`,
      senderId: 'me',
      text: message,
      time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      type: 'text',
    };

    setMessages([...messages, newMessage]);
    setMessage('');

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  // Send Offer
  const handleSendOffer = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!selectedEvent || !offerAmount) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Hata', 'Lütfen etkinlik seçin ve teklif tutarı girin.');
      return;
    }

    const event = mockEvents.find(e => e.id === selectedEvent);
    const newMessage: ChatMessage = {
      id: `m${messages.length + 1}`,
      senderId: 'me',
      time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      type: 'offer',
      eventTitle: event?.title,
      offerAmount: parseFloat(offerAmount.replace(/\./g, '').replace(',', '.')),
      offerDescription: offerDescription || undefined,
      offerStatus: 'pending',
    };

    setMessages([...messages, newMessage]);
    setShowOfferModal(false);
    setSelectedEvent(null);
    setOfferAmount('');
    setOfferDescription('');

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    // Simulate provider response
    setTimeout(() => {
      const responseMessage: ChatMessage = {
        id: `m${messages.length + 2}`,
        senderId: 'provider',
        text: 'Teklifinizi aldım, inceleyip en kısa sürede dönüş yapacağım.',
        time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
        type: 'text',
      };
      setMessages(prev => [...prev, responseMessage]);
    }, 2000);
  };

  // Send Meeting Request
  const handleSendMeeting = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!meetingTitle || !meetingDate || !meetingTime) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Hata', 'Lütfen toplantı başlığı, tarih ve saat girin.');
      return;
    }

    const newMessage: ChatMessage = {
      id: `m${messages.length + 1}`,
      senderId: 'me',
      time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      type: 'meeting',
      meetingTitle,
      meetingDate,
      meetingTime,
      meetingLocation: meetingLocation || 'Belirtilmedi',
      meetingStatus: 'pending',
    };

    setMessages([...messages, newMessage]);
    setShowMeetingModal(false);
    setMeetingTitle('');
    setMeetingDate('');
    setMeetingTime('');
    setMeetingLocation('');

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  // Handle File Upload
  const handleDocumentPick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        sendFileMessage(file.name, formatFileSize(file.size || 0), 'document', file.uri);
      }
    } catch (error) {
      Alert.alert('Hata', 'Dosya seçilirken bir hata oluştu.');
    }
    setShowFileOptions(false);
  };

  const handleImagePick = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('İzin Gerekli', 'Galeri erişimi için izin vermeniz gerekiyor.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const image = result.assets[0];
        const fileName = image.uri.split('/').pop() || 'image.jpg';
        sendFileMessage(fileName, 'Resim', 'image', image.uri);
      }
    } catch (error) {
      Alert.alert('Hata', 'Resim seçilirken bir hata oluştu.');
    }
    setShowFileOptions(false);
  };

  const sendFileMessage = (fileName: string, fileSize: string, fileType: string, fileUri: string) => {
    const newMessage: ChatMessage = {
      id: `m${messages.length + 1}`,
      senderId: 'me',
      time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      type: 'file',
      fileName,
      fileSize,
      fileType,
      fileUri,
    };

    setMessages([...messages, newMessage]);

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Format currency input
  const formatCurrency = (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  // Render special message types
  const renderOfferMessage = (msg: ChatMessage, isMe: boolean) => (
    <View style={[styles.specialMessageCard, {
      backgroundColor: isDark ? 'rgba(75, 48, 184, 0.15)' : 'rgba(75, 48, 184, 0.1)',
      borderColor: colors.brand[400],
    }]}>
      <View style={styles.specialMessageHeader}>
        <View style={[styles.specialMessageIcon, { backgroundColor: colors.brand[500] }]}>
          <Ionicons name="document-text" size={16} color="white" />
        </View>
        <Text style={[styles.specialMessageTitle, { color: colors.text }]}>Teklif</Text>
        <View style={[styles.statusBadge, {
          backgroundColor: msg.offerStatus === 'pending' ? 'rgba(251, 191, 36, 0.2)' :
            msg.offerStatus === 'accepted' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'
        }]}>
          <Text style={[styles.statusBadgeText, {
            color: msg.offerStatus === 'pending' ? '#fbbf24' :
              msg.offerStatus === 'accepted' ? '#10b981' : '#ef4444'
          }]}>
            {msg.offerStatus === 'pending' ? 'Beklemede' :
              msg.offerStatus === 'accepted' ? 'Kabul Edildi' : 'Reddedildi'}
          </Text>
        </View>
      </View>
      <View style={styles.specialMessageBody}>
        <Text style={[styles.offerEventTitle, { color: colors.textMuted }]}>{msg.eventTitle}</Text>
        <Text style={[styles.offerAmount, { color: colors.text }]}>
          ₺{msg.offerAmount?.toLocaleString('tr-TR')}
        </Text>
        {msg.offerDescription && (
          <Text style={[styles.offerDescription, { color: colors.textMuted }]}>{msg.offerDescription}</Text>
        )}
      </View>
      {!isMe && msg.offerStatus === 'pending' && (
        <View style={styles.offerActions}>
          <TouchableOpacity style={[styles.offerActionBtn, { backgroundColor: colors.success }]}>
            <Ionicons name="checkmark" size={16} color="white" />
            <Text style={styles.offerActionText}>Kabul Et</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.offerActionBtn, { backgroundColor: 'rgba(239, 68, 68, 0.8)' }]}>
            <Ionicons name="close" size={16} color="white" />
            <Text style={styles.offerActionText}>Reddet</Text>
          </TouchableOpacity>
        </View>
      )}
      <Text style={[styles.specialMessageTime, { color: colors.textMuted }]}>{msg.time}</Text>
    </View>
  );

  const renderMeetingMessage = (msg: ChatMessage, isMe: boolean) => (
    <View style={[styles.specialMessageCard, {
      backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)',
      borderColor: '#3b82f6',
    }]}>
      <View style={styles.specialMessageHeader}>
        <View style={[styles.specialMessageIcon, { backgroundColor: '#3b82f6' }]}>
          <Ionicons name="calendar" size={16} color="white" />
        </View>
        <Text style={[styles.specialMessageTitle, { color: colors.text }]}>Toplantı Daveti</Text>
        <View style={[styles.statusBadge, {
          backgroundColor: msg.meetingStatus === 'pending' ? 'rgba(251, 191, 36, 0.2)' :
            msg.meetingStatus === 'accepted' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'
        }]}>
          <Text style={[styles.statusBadgeText, {
            color: msg.meetingStatus === 'pending' ? '#fbbf24' :
              msg.meetingStatus === 'accepted' ? '#10b981' : '#ef4444'
          }]}>
            {msg.meetingStatus === 'pending' ? 'Beklemede' :
              msg.meetingStatus === 'accepted' ? 'Onaylandı' : 'Reddedildi'}
          </Text>
        </View>
      </View>
      <View style={styles.specialMessageBody}>
        <Text style={[styles.meetingTitle, { color: colors.text }]}>{msg.meetingTitle}</Text>
        <View style={styles.meetingDetails}>
          <View style={styles.meetingDetailRow}>
            <Ionicons name="calendar-outline" size={14} color={colors.textMuted} />
            <Text style={[styles.meetingDetailText, { color: colors.textMuted }]}>{msg.meetingDate}</Text>
          </View>
          <View style={styles.meetingDetailRow}>
            <Ionicons name="time-outline" size={14} color={colors.textMuted} />
            <Text style={[styles.meetingDetailText, { color: colors.textMuted }]}>{msg.meetingTime}</Text>
          </View>
          <View style={styles.meetingDetailRow}>
            <Ionicons name="location-outline" size={14} color={colors.textMuted} />
            <Text style={[styles.meetingDetailText, { color: colors.textMuted }]}>{msg.meetingLocation}</Text>
          </View>
        </View>
      </View>
      {!isMe && msg.meetingStatus === 'pending' && (
        <View style={styles.offerActions}>
          <TouchableOpacity style={[styles.offerActionBtn, { backgroundColor: colors.success }]}>
            <Ionicons name="checkmark" size={16} color="white" />
            <Text style={styles.offerActionText}>Onayla</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.offerActionBtn, { backgroundColor: 'rgba(239, 68, 68, 0.8)' }]}>
            <Ionicons name="close" size={16} color="white" />
            <Text style={styles.offerActionText}>Reddet</Text>
          </TouchableOpacity>
        </View>
      )}
      <Text style={[styles.specialMessageTime, { color: colors.textMuted }]}>{msg.time}</Text>
    </View>
  );

  const renderFileMessage = (msg: ChatMessage, isMe: boolean) => (
    <View style={[styles.fileMessageCard, {
      backgroundColor: isMe ? colors.brand[600] : (isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'),
    }]}>
      <View style={styles.fileMessageContent}>
        <View style={[styles.fileIcon, {
          backgroundColor: isMe ? 'rgba(255, 255, 255, 0.2)' : (isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)')
        }]}>
          <Ionicons
            name={msg.fileType === 'image' ? 'image' : 'document'}
            size={20}
            color={isMe ? 'white' : colors.brand[400]}
          />
        </View>
        <View style={styles.fileInfo}>
          <Text style={[styles.fileName, { color: isMe ? 'white' : colors.text }]} numberOfLines={1}>
            {msg.fileName}
          </Text>
          <Text style={[styles.fileSize, { color: isMe ? 'rgba(255,255,255,0.6)' : colors.textMuted }]}>
            {msg.fileSize}
          </Text>
        </View>
        <TouchableOpacity style={[styles.downloadBtn, {
          backgroundColor: isMe ? 'rgba(255, 255, 255, 0.2)' : (isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)')
        }]}>
          <Ionicons name="download-outline" size={18} color={isMe ? 'white' : colors.brand[400]} />
        </TouchableOpacity>
      </View>
      <Text style={[styles.messageTime, { color: isMe ? 'rgba(255, 255, 255, 0.5)' : colors.textMuted }, { alignSelf: 'flex-end', marginTop: 6 }]}>
        {msg.time}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, {
        borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.06)' : colors.border
      }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.headerInfo}
          onPress={() => navigation.navigate('ProviderDetail', { providerId: conversation.id })}
          activeOpacity={0.7}
        >
          <OptimizedImage source={conversation.participantImage} style={styles.headerAvatar} />
          <View>
            <Text style={[styles.headerName, { color: colors.text }]}>{conversation.participantName}</Text>
            <View style={styles.onlineStatus}>
              <View style={[styles.onlineDot, { backgroundColor: colors.textMuted }, conversation.online && { backgroundColor: colors.success }]} />
              <Text style={[styles.onlineText, { color: colors.textMuted }]}>
                {conversation.online ? 'Çevrimiçi' : 'Son görülme: 2 saat önce'}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.headerActions}>
          <Pressable
            style={styles.headerButton}
            onPress={handleCall}
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          >
            <Ionicons name="call-outline" size={22} color={colors.text} />
          </Pressable>
          <Pressable
            style={styles.headerButton}
            onPress={() => setShowOptionsModal(true)}
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          >
            <Ionicons name="ellipsis-vertical" size={22} color={colors.text} />
          </Pressable>
        </View>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Date Header */}
          <View style={styles.dateHeader}>
            <Text style={[styles.dateHeaderText, {
              color: colors.textMuted,
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.04)'
            }]}>Bugün</Text>
          </View>

          {messages.map((msg, index) => {
            const isMe = msg.senderId === 'me';
            const showAvatar = !isMe && (index === 0 || messages[index - 1]?.senderId === 'me');

            // Render special message types
            if (msg.type === 'offer') {
              return (
                <View key={msg.id} style={[styles.messageRow, isMe && styles.messageRowMe]}>
                  {!isMe && showAvatar && (
                    <OptimizedImage source={conversation.participantImage} style={styles.messageAvatar} />
                  )}
                  {!isMe && !showAvatar && <View style={styles.avatarPlaceholder} />}
                  {renderOfferMessage(msg, isMe)}
                </View>
              );
            }

            if (msg.type === 'meeting') {
              return (
                <View key={msg.id} style={[styles.messageRow, isMe && styles.messageRowMe]}>
                  {!isMe && showAvatar && (
                    <OptimizedImage source={conversation.participantImage} style={styles.messageAvatar} />
                  )}
                  {!isMe && !showAvatar && <View style={styles.avatarPlaceholder} />}
                  {renderMeetingMessage(msg, isMe)}
                </View>
              );
            }

            if (msg.type === 'file') {
              return (
                <View key={msg.id} style={[styles.messageRow, isMe && styles.messageRowMe]}>
                  {!isMe && showAvatar && (
                    <OptimizedImage source={conversation.participantImage} style={styles.messageAvatar} />
                  )}
                  {!isMe && !showAvatar && <View style={styles.avatarPlaceholder} />}
                  {renderFileMessage(msg, isMe)}
                </View>
              );
            }

            return (
              <View
                key={msg.id}
                style={[styles.messageRow, isMe && styles.messageRowMe]}
              >
                {!isMe && showAvatar && (
                  <OptimizedImage
                    source={conversation.participantImage}
                    style={styles.messageAvatar}
                  />
                )}
                {!isMe && !showAvatar && <View style={styles.avatarPlaceholder} />}

                <View style={[styles.messageBubble, {
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'
                }, isMe && { backgroundColor: colors.brand[600] }]}>
                  <Text style={[styles.messageText, { color: colors.text }, isMe && { color: 'white' }]}>
                    {msg.text}
                  </Text>
                  <Text style={[styles.messageTime, { color: colors.textMuted }, isMe && { color: 'rgba(255, 255, 255, 0.5)' }]}>
                    {msg.time}
                    {isMe && (
                      <Ionicons name="checkmark-done" size={14} color="rgba(255,255,255,0.5)" />
                    )}
                  </Text>
                </View>
              </View>
            );
          })}

          {/* Typing Indicator */}
          {conversation.online && (
            <View style={styles.typingIndicator}>
              <View style={styles.typingDots}>
                <View style={[styles.typingDot, { backgroundColor: colors.textMuted, opacity: 0.4 }]} />
                <View style={[styles.typingDot, { backgroundColor: colors.textMuted, opacity: 0.6 }]} />
                <View style={[styles.typingDot, { backgroundColor: colors.textMuted, opacity: 0.8 }]} />
              </View>
              <Text style={[styles.typingText, { color: colors.textMuted }]}>yazıyor...</Text>
            </View>
          )}
        </ScrollView>

        {/* Quick Actions */}
        <View style={[styles.quickActions, {
          borderTopColor: isDark ? 'rgba(255, 255, 255, 0.04)' : colors.border
        }]}>
          <TouchableOpacity
            style={[styles.quickAction, {
              backgroundColor: isDark ? 'rgba(75, 48, 184, 0.1)' : 'rgba(75, 48, 184, 0.08)'
            }]}
            onPress={() => setShowOfferModal(true)}
          >
            <Ionicons name="document-text" size={16} color={colors.brand[400]} />
            <Text style={[styles.quickActionText, { color: colors.brand[400] }]}>Teklif Gönder</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.quickAction, {
              backgroundColor: isDark ? 'rgba(75, 48, 184, 0.1)' : 'rgba(75, 48, 184, 0.08)'
            }]}
            onPress={() => setShowMeetingModal(true)}
          >
            <Ionicons name="calendar" size={16} color={colors.brand[400]} />
            <Text style={[styles.quickActionText, { color: colors.brand[400] }]}>Toplantı Planla</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.quickAction, {
              backgroundColor: isDark ? 'rgba(75, 48, 184, 0.1)' : 'rgba(75, 48, 184, 0.08)'
            }]}
            onPress={() => setShowFileOptions(true)}
          >
            <Ionicons name="attach" size={16} color={colors.brand[400]} />
            <Text style={[styles.quickActionText, { color: colors.brand[400] }]}>Dosya</Text>
          </TouchableOpacity>
        </View>

        {/* Input Area */}
        <Animated.View style={[styles.inputContainer, {
          backgroundColor: isDark ? 'rgba(9, 9, 11, 0.95)' : colors.background,
          borderTopColor: isDark ? 'rgba(255, 255, 255, 0.06)' : colors.border,
          paddingBottom: keyboardHeight > 0 ? 12 : Math.max(insets.bottom, 12) + 80,
        }]}>
          <TouchableOpacity
            style={[styles.attachButton, {
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)'
            }]}
            onPress={() => setShowFileOptions(true)}
          >
            <Ionicons name="add" size={24} color={colors.textMuted} />
          </TouchableOpacity>

          <View style={[styles.inputWrapper, {
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)'
          }]}>
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Mesaj yazın..."
              placeholderTextColor={colors.textMuted}
              value={message}
              onChangeText={setMessage}
              multiline
              maxLength={1000}
            />
            <TouchableOpacity style={styles.emojiButton} onPress={() => setShowEmojiPicker(true)}>
              <Ionicons name="happy-outline" size={22} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.sendButton, {
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)'
            }, message.trim() && { backgroundColor: colors.brand[500] }]}
            onPress={sendMessage}
            disabled={!message.trim()}
          >
            <Ionicons
              name="send"
              size={20}
              color={message.trim() ? 'white' : colors.textMuted}
            />
          </TouchableOpacity>
        </Animated.View>
      </KeyboardAvoidingView>

      {/* Send Offer Modal */}
      <Modal
        visible={showOfferModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          Keyboard.dismiss();
          setShowOfferModal(false);
        }}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => {
              Keyboard.dismiss();
              setShowOfferModal(false);
            }}
          />
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Teklif Gönder</Text>
              <TouchableOpacity onPress={() => {
                Keyboard.dismiss();
                setShowOfferModal(false);
              }}>
                <Ionicons name="close" size={24} color={colors.zinc[400]} />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
            >
              {/* Event Selection */}
              <View style={styles.formSection}>
                <Text style={[styles.formLabel, { color: colors.textMuted }]}>Etkinlik Seçin</Text>
                <View style={styles.eventOptions}>
                  {mockEvents.map(event => (
                    <TouchableOpacity
                      key={event.id}
                      style={[
                        styles.eventOption,
                        {
                          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : colors.cardBackground,
                          borderColor: selectedEvent === event.id ? colors.brand[400] : (isDark ? 'rgba(255, 255, 255, 0.06)' : colors.border),
                        },
                        selectedEvent === event.id && { backgroundColor: isDark ? 'rgba(75, 48, 184, 0.1)' : 'rgba(75, 48, 184, 0.08)' }
                      ]}
                      onPress={() => setSelectedEvent(event.id)}
                    >
                      <View style={styles.eventOptionContent}>
                        <Text style={[styles.eventOptionTitle, { color: colors.text }]}>{event.title}</Text>
                        <Text style={[styles.eventOptionDate, { color: colors.textMuted }]}>{event.date}</Text>
                      </View>
                      {selectedEvent === event.id && (
                        <Ionicons name="checkmark-circle" size={22} color={colors.brand[400]} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Offer Amount */}
              <View style={styles.formSection}>
                <Text style={[styles.formLabel, { color: colors.textMuted }]}>Teklif Tutarı</Text>
                <View style={[styles.amountInputContainer, {
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : colors.cardBackground,
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : colors.border,
                }]}>
                  <Text style={[styles.currencySymbol, { color: colors.text }]}>₺</Text>
                  <TextInput
                    style={[styles.amountInput, { color: colors.text }]}
                    placeholder="0"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="numeric"
                    value={offerAmount}
                    onChangeText={(text) => setOfferAmount(formatCurrency(text))}
                  />
                </View>
              </View>

              {/* Description */}
              <View style={styles.formSection}>
                <Text style={[styles.formLabel, { color: colors.textMuted }]}>Açıklama (Opsiyonel)</Text>
                <TextInput
                  style={[styles.descriptionInput, {
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : colors.cardBackground,
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : colors.border,
                    color: colors.text,
                  }]}
                  placeholder="Teklifiniz hakkında detaylar..."
                  placeholderTextColor={colors.textMuted}
                  multiline
                  numberOfLines={3}
                  value={offerDescription}
                  onChangeText={setOfferDescription}
                />
              </View>
            </ScrollView>

            <TouchableOpacity style={styles.submitButton} onPress={() => {
              Keyboard.dismiss();
              handleSendOffer();
            }}>
              <LinearGradient
                colors={gradients.primary}
                style={styles.submitButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="paper-plane" size={18} color="white" />
                <Text style={styles.submitButtonText}>Teklif Gönder</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Schedule Meeting Modal */}
      <Modal
        visible={showMeetingModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          Keyboard.dismiss();
          setShowMeetingModal(false);
        }}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => {
              Keyboard.dismiss();
              setShowMeetingModal(false);
            }}
          />
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Toplantı Planla</Text>
              <TouchableOpacity onPress={() => {
                Keyboard.dismiss();
                setShowMeetingModal(false);
              }}>
                <Ionicons name="close" size={24} color={colors.zinc[400]} />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
            >
              {/* Meeting Title */}
              <View style={styles.formSection}>
                <Text style={[styles.formLabel, { color: colors.textMuted }]}>Toplantı Başlığı</Text>
                <TextInput
                  style={[styles.textInput, {
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : colors.cardBackground,
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : colors.border,
                    color: colors.text,
                  }]}
                  placeholder="Örn: Etkinlik Detayları Görüşmesi"
                  placeholderTextColor={colors.textMuted}
                  value={meetingTitle}
                  onChangeText={setMeetingTitle}
                />
              </View>

              {/* Date and Time */}
              <View style={styles.formRow}>
                <View style={[styles.formSection, { flex: 1 }]}>
                  <Text style={[styles.formLabel, { color: colors.textMuted }]}>Tarih</Text>
                  <TextInput
                    style={[styles.textInput, {
                      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : colors.cardBackground,
                      borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : colors.border,
                      color: colors.text,
                    }]}
                    placeholder="GG.AA.YYYY"
                    placeholderTextColor={colors.textMuted}
                    value={meetingDate}
                    onChangeText={setMeetingDate}
                  />
                </View>
                <View style={[styles.formSection, { flex: 1, marginLeft: 12 }]}>
                  <Text style={[styles.formLabel, { color: colors.textMuted }]}>Saat</Text>
                  <TextInput
                    style={[styles.textInput, {
                      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : colors.cardBackground,
                      borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : colors.border,
                      color: colors.text,
                    }]}
                    placeholder="SS:DD"
                    placeholderTextColor={colors.textMuted}
                    value={meetingTime}
                    onChangeText={setMeetingTime}
                  />
                </View>
              </View>

              {/* Location */}
              <View style={styles.formSection}>
                <Text style={[styles.formLabel, { color: colors.textMuted }]}>Konum / Link (Opsiyonel)</Text>
                <TextInput
                  style={[styles.textInput, {
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : colors.cardBackground,
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : colors.border,
                    color: colors.text,
                  }]}
                  placeholder="Adres veya video konferans linki"
                  placeholderTextColor={colors.textMuted}
                  value={meetingLocation}
                  onChangeText={setMeetingLocation}
                />
              </View>

              {/* Quick Location Options */}
              <View style={styles.quickLocationOptions}>
                {['Google Meet', 'Zoom', 'Ofis Ziyareti', 'Mekan Yerinde'].map(option => (
                  <TouchableOpacity
                    key={option}
                    style={[styles.quickLocationBtn, {
                      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
                      borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : colors.border,
                    }]}
                    onPress={() => setMeetingLocation(option)}
                  >
                    <Text style={[styles.quickLocationText, { color: colors.textMuted }]}>{option}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <TouchableOpacity style={styles.submitButton} onPress={() => {
              Keyboard.dismiss();
              handleSendMeeting();
            }}>
              <LinearGradient
                colors={['#3b82f6', '#2563eb']}
                style={styles.submitButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="calendar" size={18} color="white" />
                <Text style={styles.submitButtonText}>Davet Gönder</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* File Options Modal */}
      <Modal
        visible={showFileOptions}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowFileOptions(false)}
      >
        <TouchableOpacity
          style={styles.fileOptionsOverlay}
          activeOpacity={1}
          onPress={() => setShowFileOptions(false)}
        >
          <View style={[styles.fileOptionsContent, {
            backgroundColor: colors.background,
            borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : colors.border,
          }]}>
            <TouchableOpacity
              style={[styles.fileOption, {
                borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.06)' : colors.border,
              }]}
              onPress={handleImagePick}
            >
              <View style={[styles.fileOptionIcon, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                <Ionicons name="image" size={22} color="#10b981" />
              </View>
              <View style={styles.fileOptionInfo}>
                <Text style={[styles.fileOptionTitle, { color: colors.text }]}>Galeri</Text>
                <Text style={[styles.fileOptionDesc, { color: colors.textMuted }]}>Fotoğraf seçin</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.fileOption, {
                borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.06)' : colors.border,
              }]}
              onPress={handleDocumentPick}
            >
              <View style={[styles.fileOptionIcon, { backgroundColor: 'rgba(75, 48, 184, 0.15)' }]}>
                <Ionicons name="document" size={22} color={colors.brand[400]} />
              </View>
              <View style={styles.fileOptionInfo}>
                <Text style={[styles.fileOptionTitle, { color: colors.text }]}>Dosya</Text>
                <Text style={[styles.fileOptionDesc, { color: colors.textMuted }]}>PDF, Word, vb.</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.fileOption}
              onPress={() => setShowFileOptions(false)}
            >
              <View style={[styles.fileOptionIcon, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
                <Ionicons name="close" size={22} color="#ef4444" />
              </View>
              <View style={styles.fileOptionInfo}>
                <Text style={[styles.fileOptionTitle, { color: colors.text }]}>İptal</Text>
                <Text style={[styles.fileOptionDesc, { color: colors.textMuted }]}>Geri dön</Text>
              </View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Options Modal */}
      <Modal
        visible={showOptionsModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowOptionsModal(false)}
      >
        <TouchableOpacity
          style={styles.fileOptionsOverlay}
          activeOpacity={1}
          onPress={() => setShowOptionsModal(false)}
        >
          <View style={[styles.optionsModalContent, {
            backgroundColor: colors.background,
            borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : colors.border,
          }]}>
            <View style={[styles.optionsHeader, { borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.06)' : colors.border }]}>
              <Text style={[styles.optionsTitle, { color: colors.text }]}>Sohbet Seçenekleri</Text>
            </View>
            {chatOptions.map((option, index) => (
              <TouchableOpacity
                key={option.id}
                style={[styles.optionItem, {
                  borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.06)' : colors.border,
                  borderBottomWidth: index < chatOptions.length - 1 ? 1 : 0,
                }]}
                onPress={option.action}
              >
                <Ionicons
                  name={option.icon as any}
                  size={20}
                  color={option.id === 'block' || option.id === 'delete' ? '#ef4444' : colors.text}
                />
                <Text style={[
                  styles.optionLabel,
                  { color: option.id === 'block' || option.id === 'delete' ? '#ef4444' : colors.text }
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Emoji Picker Modal */}
      <Modal
        visible={showEmojiPicker}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowEmojiPicker(false)}
      >
        <TouchableOpacity
          style={styles.fileOptionsOverlay}
          activeOpacity={1}
          onPress={() => setShowEmojiPicker(false)}
        >
          <View style={[styles.emojiPickerContent, {
            backgroundColor: colors.background,
            borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : colors.border,
          }]}>
            <View style={[styles.optionsHeader, { borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.06)' : colors.border }]}>
              <Text style={[styles.optionsTitle, { color: colors.text }]}>Emoji Seç</Text>
            </View>
            <View style={styles.emojiGrid}>
              {commonEmojis.map((emoji, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.emojiItem}
                  onPress={() => handleEmojiSelect(emoji)}
                >
                  <Text style={styles.emojiText}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 4,
    marginRight: 8,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    marginRight: 12,
  },
  headerName: {
    fontSize: 16,
    fontWeight: '600',
  },
  onlineStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  onlineText: {
    fontSize: 12,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 4,
    zIndex: 10,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  dateHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  dateHeaderText: {
    fontSize: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-end',
  },
  messageRowMe: {
    justifyContent: 'flex-end',
  },
  messageAvatar: {
    width: 28,
    height: 28,
    borderRadius: 8,
    marginRight: 8,
  },
  avatarPlaceholder: {
    width: 36,
  },
  messageBubble: {
    maxWidth: '75%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  messageTime: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 36,
    marginTop: 8,
  },
  typingDots: {
    flexDirection: 'row',
    gap: 4,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  typingText: {
    fontSize: 12,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.04)',
  },
  quickAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(75, 48, 184, 0.1)',
    borderRadius: 20,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 24,
    gap: 8,
    backgroundColor: 'rgba(9, 9, 11, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  attachButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    minHeight: 40,
    maxHeight: 100,
  },
  input: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 4,
  },
  emojiButton: {
    padding: 4,
    marginLeft: 4,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  formSection: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 10,
  },
  formRow: {
    flexDirection: 'row',
  },
  eventOptions: {
    gap: 10,
  },
  eventOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  eventOptionContent: {
    flex: 1,
  },
  eventOptionTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  eventOptionDate: {
    fontSize: 12,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
  },
  descriptionInput: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  textInput: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 14,
  },
  quickLocationOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: -10,
    marginBottom: 20,
  },
  quickLocationBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  quickLocationText: {
    fontSize: 12,
  },
  submitButton: {
    marginTop: 10,
    borderRadius: 14,
    overflow: 'hidden',
  },
  submitButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'white',
  },
  // Special Message Styles
  specialMessageCard: {
    maxWidth: '85%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
  },
  specialMessageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  specialMessageIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  specialMessageTitle: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  specialMessageBody: {
    marginBottom: 8,
  },
  specialMessageTime: {
    fontSize: 10,
    alignSelf: 'flex-end',
  },
  offerEventTitle: {
    fontSize: 12,
    marginBottom: 4,
  },
  offerAmount: {
    fontSize: 22,
    fontWeight: '700',
  },
  offerDescription: {
    fontSize: 12,
    marginTop: 6,
    lineHeight: 16,
  },
  offerActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
    marginBottom: 8,
  },
  offerActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    borderRadius: 8,
  },
  offerActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  meetingTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 10,
  },
  meetingDetails: {
    gap: 6,
  },
  meetingDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  meetingDetailText: {
    fontSize: 12,
  },
  // File Message Styles
  fileMessageCard: {
    maxWidth: '75%',
    borderRadius: 16,
    padding: 12,
  },
  fileMessageContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fileIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 2,
  },
  fileSize: {
    fontSize: 11,
  },
  downloadBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // File Options Modal
  fileOptionsOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fileOptionsContent: {
    width: '80%',
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  fileOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  fileOptionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  fileOptionInfo: {
    flex: 1,
  },
  fileOptionTitle: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 2,
  },
  fileOptionDesc: {
    fontSize: 12,
  },
  // Options Modal
  optionsModalContent: {
    width: '80%',
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  optionsHeader: {
    padding: 16,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  optionsTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  optionLabel: {
    fontSize: 15,
  },
  // Emoji Picker
  emojiPickerContent: {
    width: '85%',
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    justifyContent: 'center',
  },
  emojiItem: {
    width: '20%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiText: {
    fontSize: 28,
  },
});
