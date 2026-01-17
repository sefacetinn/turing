import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';

// Tags for Provider reviews (Organizer → Provider)
export const PROVIDER_REVIEW_TAGS = [
  { id: 'professional', label: 'Profesyonel', icon: 'briefcase-outline' },
  { id: 'communication', label: 'İletişimi güçlü', icon: 'chatbubble-outline' },
  { id: 'punctual', label: 'Dakik', icon: 'time-outline' },
  { id: 'quality', label: 'Kaliteli iş', icon: 'ribbon-outline' },
  { id: 'problem_solver', label: 'Problem çözücü', icon: 'bulb-outline' },
  { id: 'team_player', label: 'Ekip uyumlu', icon: 'people-outline' },
  { id: 'fair_price', label: 'Fiyatı uygun', icon: 'pricetag-outline' },
  { id: 'creative', label: 'Yaratıcı', icon: 'color-palette-outline' },
  { id: 'experienced', label: 'Deneyimli', icon: 'medal-outline' },
  { id: 'reliable', label: 'Güvenilir', icon: 'shield-checkmark-outline' },
];

// Tags for Organizer reviews (Provider → Organizer)
export const ORGANIZER_REVIEW_TAGS = [
  { id: 'clear_brief', label: 'Net brief', icon: 'document-text-outline' },
  { id: 'easy_communication', label: 'İletişimi kolay', icon: 'chatbubble-outline' },
  { id: 'payment_reliable', label: 'Ödemede güvenilir', icon: 'card-outline' },
  { id: 'well_organized', label: 'İyi organize', icon: 'calendar-outline' },
  { id: 'respectful', label: 'Saygılı', icon: 'heart-outline' },
  { id: 'professional', label: 'Profesyonel', icon: 'briefcase-outline' },
  { id: 'flexible', label: 'Esnek', icon: 'swap-horizontal-outline' },
  { id: 'supportive', label: 'Destekleyici', icon: 'hand-left-outline' },
  { id: 'detail_oriented', label: 'Detaylara özen', icon: 'eye-outline' },
  { id: 'would_work_again', label: 'Tekrar çalışılır', icon: 'repeat-outline' },
];

interface Tag {
  id: string;
  label: string;
  icon: string;
}

interface TagSelectorProps {
  tags: Tag[];
  selectedTags: string[];
  onTagToggle: (tagId: string) => void;
  maxSelection?: number;
  horizontal?: boolean;
}

export function TagSelector({
  tags,
  selectedTags,
  onTagToggle,
  maxSelection,
  horizontal = false,
}: TagSelectorProps) {
  const { colors, isDark } = useTheme();

  const handleTagPress = (tagId: string) => {
    const isSelected = selectedTags.includes(tagId);

    // If trying to select and max reached, don't allow
    if (!isSelected && maxSelection && selectedTags.length >= maxSelection) {
      return;
    }

    onTagToggle(tagId);
  };

  const renderTag = (tag: Tag) => {
    const isSelected = selectedTags.includes(tag.id);
    const isDisabled = !isSelected && !!maxSelection && selectedTags.length >= maxSelection;

    return (
      <TouchableOpacity
        key={tag.id}
        style={[
          styles.tag,
          {
            backgroundColor: isSelected
              ? isDark ? 'rgba(75, 48, 184, 0.2)' : 'rgba(75, 48, 184, 0.1)'
              : isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
            borderColor: isSelected
              ? colors.brand[400]
              : isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
            opacity: isDisabled ? 0.5 : 1,
          },
        ]}
        onPress={() => handleTagPress(tag.id)}
        activeOpacity={0.7}
        disabled={isDisabled}
      >
        {isSelected && (
          <Ionicons
            name="checkmark-circle"
            size={14}
            color={colors.brand[400]}
            style={styles.tagCheckmark}
          />
        )}
        <Text
          style={[
            styles.tagText,
            {
              color: isSelected ? colors.brand[400] : colors.textSecondary,
            },
          ]}
        >
          {tag.label}
        </Text>
      </TouchableOpacity>
    );
  };

  if (horizontal) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalContainer}
      >
        {tags.map(renderTag)}
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      {tags.map(renderTag)}
    </View>
  );
}

// Tag display for showing selected tags (read-only)
interface TagDisplayProps {
  tags: string[];
  tagList: Tag[];
  size?: 'small' | 'medium';
}

export function TagDisplay({ tags, tagList, size = 'small' }: TagDisplayProps) {
  const { colors, isDark } = useTheme();

  return (
    <View style={styles.displayContainer}>
      {tags.map(tagId => {
        const tag = tagList.find(t => t.id === tagId);
        if (!tag) return null;

        return (
          <View
            key={tagId}
            style={[
              styles.displayTag,
              {
                backgroundColor: isDark ? 'rgba(75, 48, 184, 0.15)' : 'rgba(75, 48, 184, 0.08)',
                paddingHorizontal: size === 'small' ? 8 : 10,
                paddingVertical: size === 'small' ? 4 : 6,
              },
            ]}
          >
            <Text
              style={[
                styles.displayTagText,
                {
                  color: colors.brand[400],
                  fontSize: size === 'small' ? 11 : 12,
                },
              ]}
            >
              {tag.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  horizontalContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 4,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  tagCheckmark: {
    marginRight: 4,
  },
  tagText: {
    fontSize: 13,
    fontWeight: '500',
  },
  displayContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  displayTag: {
    borderRadius: 12,
  },
  displayTagText: {
    fontWeight: '500',
  },
});
