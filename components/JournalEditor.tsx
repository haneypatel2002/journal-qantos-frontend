import React, { useMemo, useRef, useState } from 'react';
import { View, TextInput, StyleSheet, ActivityIndicator, Text, Pressable, Keyboard, Platform } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';

interface JournalEditorProps {
  content: string;
  onContentChange: (text: string) => void;
  placeholder?: string;
  loading?: boolean;
}

export default function JournalEditor({ content, onContentChange, placeholder, loading = false }: JournalEditorProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const inputRef = useRef<TextInput>(null);
  const [isFocused, setIsFocused] = useState(false);

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loaderPlaceholder}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.loaderText}>Syncing entry...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Pressable 
        style={[styles.editorContainer, isFocused && styles.editorContainerFocused]} 
        onPress={() => inputRef.current?.focus()}
      >
        <View style={styles.editorHeader}>
          {isFocused && (
            <TouchableOpacity 
              onPress={() => Keyboard.dismiss()} 
              style={styles.doneButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.doneText}>Close</Text>
              <Ionicons name="chevron-down" size={14} color={colors.primary} />
            </TouchableOpacity>
          )}
        </View>
        <TextInput
          ref={inputRef}
          style={styles.editor}
          multiline
          placeholder={placeholder || "Write about your day..."}
          placeholderTextColor={colors.textMuted}
          value={content}
          onChangeText={onContentChange}
          textAlignVertical="top"
          scrollEnabled
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          selectionColor={colors.primary}
        />
      </Pressable>
    </View>
  );
}

import { TouchableOpacity } from 'react-native';

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  editorContainer: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    minHeight: 180,
    maxHeight: 300,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  editorContainerFocused: {
    borderColor: colors.primary,
    elevation: 4,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  editorHeader: {
    height: 32,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  doneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '15',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  doneText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
    marginRight: 2,
  },
  editor: {
    padding: 16,
    paddingTop: 0,
    color: colors.text,
    fontSize: 16,
    lineHeight: 24,
    minHeight: 148,
  },
  loaderPlaceholder: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    minHeight: 180,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    borderStyle: 'dashed',
  },
  loaderText: {
    marginTop: 8,
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
  },
});
