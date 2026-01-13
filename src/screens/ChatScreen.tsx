import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';

interface ChatParams {
  conversationId?: string;
  providerId?: string;
  providerName?: string;
  providerImage?: string;
}

// Local conversations data
const conversations = [
  {
    id: 'c1',
    participantName: 'Pro Sound Istanbul',
    participantImage: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400',
    online: true,
    messages: [
      { id: 'm1', senderId: 'provider', text: 'Merhaba! Etkinliğiniz için ses sistemi hizmeti konusunda size yardımcı olabilirim.', time: '10:30', type: 'text' },
      { id: 'm2', senderId: 'me', text: 'Merhaba, 500 kişilik açık alan için profesyonel ses sistemi arıyoruz.', time: '10:32', type: 'text' },
      { id: 'm3', senderId: 'provider', text: 'Harika! Bu tarz etkinliklerde deneyimli ekibimiz var. Line array sistemimiz 1000 kişiye kadar açık alanları rahatlıkla karşılayabilir.', time: '10:35', type: 'text' },
      { id: 'm4', senderId: 'me', text: 'Fiyat teklifinizi alabilir miyim?', time: '10:36', type: 'text' },
    ],
  },
  {
    id: 'c2',
    participantName: 'Elite VIP Transfer',
    participantImage: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400',
    online: false,
    messages: [
      { id: 'm1', senderId: 'provider', text: 'VIP transfer hizmetlerimiz hakkında bilgi almak ister misiniz?', time: '09:00', type: 'text' },
      { id: 'm2', senderId: 'me', text: 'Evet, 20 kişilik VIP konuk grubumuz için havalimanı transferi gerekiyor.', time: '09:15', type: 'text' },
    ],
  },
];

export function ChatScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { colors, isDark, helpers } = useTheme();
  const params = (route.params || {}) as ChatParams;

  // Support both conversationId and providerId/providerName/providerImage
  const getConversationData = React.useMemo(() => {
    // First check for conversationId
    if (params?.conversationId) {
      const found = conversations.find(c => c.id === params.conversationId);
      if (found) return found;
    }

    // If providerId is passed, create a new conversation
    if (params?.providerId && params?.providerName) {
      return {
        id: `new_${params.providerId}`,
        participantName: params.providerName,
        participantImage: params.providerImage || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400',
        online: true,
        messages: [
          {
            id: 'm1',
            senderId: 'provider' as const,
            text: `Merhaba! ${params.providerName} olarak size nasıl yardımcı olabiliriz?`,
            time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
            type: 'text' as const
          },
        ],
      };
    }

    // Default fallback
    return conversations[0];
  }, [params?.conversationId, params?.providerId, params?.providerName, params?.providerImage]);

  const conversation = getConversationData;
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState(conversation.messages);
  const scrollViewRef = useRef<ScrollView>(null);

  // Update messages when conversation changes
  React.useEffect(() => {
    setMessages(conversation.messages);
  }, [conversation]);

  const sendMessage = () => {
    if (!message.trim()) return;

    const newMessage = {
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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, {
        borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.06)' : colors.border
      }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.headerInfo}>
          <Image source={{ uri: conversation.participantImage }} style={styles.headerAvatar} />
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
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="call-outline" size={22} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="ellipsis-vertical" size={22} color={colors.text} />
          </TouchableOpacity>
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

            return (
              <View
                key={msg.id}
                style={[styles.messageRow, isMe && styles.messageRowMe]}
              >
                {!isMe && showAvatar && (
                  <Image
                    source={{ uri: conversation.participantImage }}
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
          <TouchableOpacity style={[styles.quickAction, {
            backgroundColor: isDark ? 'rgba(147, 51, 234, 0.1)' : 'rgba(147, 51, 234, 0.08)'
          }]}>
            <Ionicons name="document-text" size={16} color={colors.brand[400]} />
            <Text style={[styles.quickActionText, { color: colors.brand[400] }]}>Teklif Gönder</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.quickAction, {
            backgroundColor: isDark ? 'rgba(147, 51, 234, 0.1)' : 'rgba(147, 51, 234, 0.08)'
          }]}>
            <Ionicons name="calendar" size={16} color={colors.brand[400]} />
            <Text style={[styles.quickActionText, { color: colors.brand[400] }]}>Toplantı Planla</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.quickAction, {
            backgroundColor: isDark ? 'rgba(147, 51, 234, 0.1)' : 'rgba(147, 51, 234, 0.08)'
          }]}>
            <Ionicons name="attach" size={16} color={colors.brand[400]} />
            <Text style={[styles.quickActionText, { color: colors.brand[400] }]}>Dosya</Text>
          </TouchableOpacity>
        </View>

        {/* Input Area */}
        <View style={[styles.inputContainer, {
          backgroundColor: isDark ? 'rgba(9, 9, 11, 0.95)' : colors.background,
          borderTopColor: isDark ? 'rgba(255, 255, 255, 0.06)' : colors.border
        }]}>
          <TouchableOpacity style={[styles.attachButton, {
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)'
          }]}>
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
            <TouchableOpacity style={styles.emojiButton}>
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
        </View>
      </KeyboardAvoidingView>
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
  onlineDotActive: {
  },
  onlineText: {
    fontSize: 12,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 4,
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
  messageBubbleMe: {
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  messageTextMe: {
  },
  messageTime: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  messageTimeMe: {
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
  typingDot1: {
    opacity: 0.4,
  },
  typingDot2: {
    opacity: 0.6,
  },
  typingDot3: {
    opacity: 0.8,
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
    backgroundColor: 'rgba(147, 51, 234, 0.1)',
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
  sendButtonActive: {
  },
});
