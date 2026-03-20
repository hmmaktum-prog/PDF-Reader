import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Share,
  ScrollView,
  Platform,
} from 'react-native';
import { useAppTheme } from '../context/ThemeContext';
import { useContinueTool } from '../context/ContinueContext';

export type ToolStatus = 'idle' | 'processing' | 'result' | 'error';

interface ToolShellProps {
  title: string;
  subtitle?: string;
  onExecute: (onProgress: (pct: number, label?: string) => void) => Promise<string | void>;
  executeLabel?: string;
  children?: React.ReactNode;
  resultLabel?: string;
}

export default function ToolShell({
  title,
  subtitle,
  onExecute,
  executeLabel = '▶ Execute Tool',
  children,
  resultLabel,
}: ToolShellProps) {
  const { isDark } = useAppTheme();
  const { setSharedFilePath } = useContinueTool();
  const [status, setStatus] = useState<ToolStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [resultPath, setResultPath] = useState<string | null>(null);

  const handleProgress = useCallback((pct: number, label?: string) => {
    setProgress(Math.min(Math.max(pct, 0), 100));
    if (label) setProgressLabel(label);
  }, []);

  const handleExecute = async () => {
    try {
      setStatus('processing');
      setProgress(0);
      setProgressLabel('NDK engine initializing...');
      const output = await onExecute(handleProgress);
      if (output) setResultPath(output);
      setProgress(100);
      setProgressLabel('Done!');
      setStatus('result');
    } catch (e: any) {
      setErrorMsg(e.message || 'An unexpected error occurred');
      setStatus('error');
    }
  };

  const handleContinue = () => {
    if (resultPath) {
      setSharedFilePath(resultPath);
    }
    setStatus('idle');
    setProgress(0);
    setProgressLabel('');
  };

  const handleShare = async () => {
    if (!resultPath) return;
    try {
      await Share.share({
        title: 'PDF Power Tools Output',
        message: Platform.OS === 'android' ? resultPath : undefined,
        url: Platform.OS === 'ios' ? `file://${resultPath}` : undefined,
      });
    } catch (_) {}
  };

  const handleReset = () => {
    setStatus('idle');
    setProgress(0);
    setProgressLabel('');
    setErrorMsg('');
    setResultPath(null);
  };

  const accent = '#007AFF';
  const bg = isDark ? '#121212' : '#f9f9f9';
  const text = isDark ? '#ffffff' : '#000000';
  const muted = isDark ? '#aaaaaa' : '#555555';
  const barBg = isDark ? '#333333' : '#e0e0e0';
  const cardBg = isDark ? '#1e1e1e' : '#ffffff';

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <View style={[styles.header, { backgroundColor: cardBg, borderBottomColor: isDark ? '#333' : '#e8e8e8' }]}>
        <Text style={[styles.title, { color: text }]}>{title}</Text>
        {subtitle && <Text style={[styles.subtitle, { color: muted }]}>{subtitle}</Text>}
      </View>

      {status === 'idle' && (
        <View style={styles.flex}>
          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {children}
          </ScrollView>
          <View style={[styles.footer, { backgroundColor: cardBg, borderTopColor: isDark ? '#333' : '#e8e8e8' }]}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: accent }]}
              onPress={handleExecute}
              activeOpacity={0.85}
              testID="button-execute"
            >
              <Text style={styles.buttonText}>{executeLabel}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {status === 'processing' && (
        <View style={styles.centerFlex}>
          <View style={[styles.processingCard, { backgroundColor: cardBg }]}>
            <ActivityIndicator size="large" color={accent} style={{ marginBottom: 20 }} />
            <Text style={[styles.statusText, { color: text }]}>Processing...</Text>
            <Text style={[styles.progressLabel, { color: muted }]}>{progressLabel}</Text>
            <View style={[styles.progressBarBg, { backgroundColor: barBg }]}>
              <View
                style={[styles.progressBarFill, { width: `${progress}%`, backgroundColor: accent }]}
              />
            </View>
            <Text style={[styles.progressPct, { color: accent }]}>{Math.round(progress)}%</Text>
            <Text style={[styles.processingNote, { color: muted }]}>
              Powered by QPDF / MuPDF NDK Engine
            </Text>
          </View>
        </View>
      )}

      {status === 'result' && (
        <View style={styles.centerFlex}>
          <View style={[styles.processingCard, { backgroundColor: cardBg }]}>
            <Text style={styles.successIcon}>✅</Text>
            <Text style={[styles.statusText, { color: text }]}>Processing Complete!</Text>
            {resultPath && (
              <View style={[styles.pathBox, { backgroundColor: isDark ? '#2a2a2a' : '#f0f0f0' }]}>
                <Text style={[styles.pathLabel, { color: muted }]}>📁 Output saved to:</Text>
                <Text style={[styles.resultPath, { color: text }]} numberOfLines={3}>
                  {resultPath}
                </Text>
              </View>
            )}
            {resultLabel && (
              <Text style={[styles.resultLabel, { color: muted }]}>{resultLabel}</Text>
            )}
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: '#34C759' }]}
                onPress={handleShare}
                activeOpacity={0.85}
                testID="button-share"
              >
                <Text style={styles.buttonText}>📤 Share</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: '#FF9500' }]}
                onPress={handleContinue}
                activeOpacity={0.85}
                testID="button-continue"
              >
                <Text style={styles.buttonText}>➡️ Continue</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={[styles.resetBtn, { borderColor: isDark ? '#444' : '#ccc' }]}
              onPress={handleReset}
              activeOpacity={0.7}
              testID="button-start-again"
            >
              <Text style={[styles.resetText, { color: muted }]}>🔄 Start Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {status === 'error' && (
        <View style={styles.centerFlex}>
          <View style={[styles.processingCard, { backgroundColor: cardBg }]}>
            <Text style={styles.errorIcon}>❌</Text>
            <Text style={[styles.statusText, { color: text }]}>Something went wrong</Text>
            <View style={[styles.pathBox, { backgroundColor: isDark ? '#2a1515' : '#fff0f0', borderColor: '#FF3B30' }]}>
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: accent, marginTop: 20 }]}
              onPress={handleReset}
              activeOpacity={0.85}
              testID="button-try-again"
            >
              <Text style={styles.buttonText}>🔄 Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  title: { fontSize: 22, fontWeight: 'bold' },
  subtitle: { fontSize: 13, marginTop: 3 },
  flex: { flex: 1 },
  scrollContent: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  button: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  centerFlex: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  processingCard: {
    width: '100%',
    padding: 28,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 5,
  },
  statusText: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  progressLabel: { fontSize: 13, marginBottom: 16, textAlign: 'center' },
  progressBarBg: { width: '100%', height: 10, borderRadius: 5, overflow: 'hidden', marginTop: 4 },
  progressBarFill: { height: '100%', borderRadius: 5 },
  progressPct: { fontSize: 20, fontWeight: 'bold', marginTop: 10 },
  processingNote: { fontSize: 11, marginTop: 16, fontStyle: 'italic' },
  successIcon: { fontSize: 52, marginBottom: 12 },
  errorIcon: { fontSize: 52, marginBottom: 12 },
  pathBox: {
    width: '100%',
    padding: 12,
    borderRadius: 10,
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  pathLabel: { fontSize: 11, marginBottom: 4 },
  resultPath: { fontSize: 13, fontWeight: '500' },
  resultLabel: { fontSize: 13, marginTop: 10, textAlign: 'center' },
  errorText: { color: '#FF3B30', fontSize: 14, textAlign: 'center', lineHeight: 20 },
  actionRow: { flexDirection: 'row', gap: 12, marginTop: 20, width: '100%' },
  actionBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  resetBtn: {
    marginTop: 14,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 10,
    borderWidth: 1,
  },
  resetText: { fontSize: 14 },
});
