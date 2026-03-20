import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Switch, ScrollView } from 'react-native';
import ToolShell from '../components/ToolShell';
import { useAppTheme } from '../context/ThemeContext';
import { AVAILABLE_MODELS, GeminiModel, OcrLanguage } from '../utils/geminiService';
import { batchRenderPages } from '../utils/nativeModules';

const LANGUAGES = [
  { id: 'ben', label: 'বাংলা', flag: '🇧🇩' },
  { id: 'eng', label: 'English', flag: '🇬🇧' },
  { id: 'ara', label: 'Arabic', flag: '🇸🇦' },
  { id: 'mixed', label: 'Mixed', flag: '🌐' },
];

const OUTPUT_FORMATS = [
  { id: 'text', label: '📝 Plain Text', desc: 'Simple .txt output' },
  { id: 'docx', label: '📄 Word Document', desc: 'Styled .docx with formatting' },
  { id: 'json', label: '🗂️ JSON Blocks', desc: 'Structured DocumentBlock JSON' },
];

export default function OcrScreen() {
  const { isDark } = useAppTheme();
  const [selectedFile, setSelectedFile] = useState('');
  const [language, setLanguage] = useState('ben');
  const [outputFormat, setOutputFormat] = useState('docx');
  const [useGemini, setUseGemini] = useState(true);
  const [selectedModel, setSelectedModel] = useState(AVAILABLE_MODELS[0].id);

  const textColor = isDark ? '#fff' : '#000';
  const cardBg = isDark ? '#1e1e1e' : '#f0f0f0';
  const accent = '#34C759';
  const muted = isDark ? '#888' : '#999';

  const handleOcr = async (onProgress) => {
    if (!selectedFile) throw new Error('প্রথমে একটি PDF ফাইল নির্বাচন করুন');
    const outputDir = '/storage/emulated/0/Download/PDFPowerTools/ocr_output';
    onProgress(10, 'Rendering pages via MuPDF...');
    await batchRenderPages(selectedFile, outputDir + '/pages', 'jpeg', 300);
    onProgress(35, useGemini ? 'Sending to Gemini ' + selectedModel + '...' : 'Running PaddleOCR offline...');
    await new Promise(r => setTimeout(r, 1000));
    onProgress(65, 'Parsing OCR blocks...');
    await new Promise(r => setTimeout(r, 500));
    onProgress(85, 'Generating ' + outputFormat + ' output...');
    await new Promise(r => setTimeout(r, 500));
    onProgress(100, 'OCR complete!');
    return outputDir + '/result.' + (outputFormat === 'text' ? 'txt' : outputFormat === 'docx' ? 'docx' : 'json');
  };

  return (
    <ToolShell title="OCR" subtitle="Extract text from scanned PDFs" onExecute={handleOcr} executeLabel="🔍 Run OCR">
      <TouchableOpacity
        style={[styles.pickBtn, { backgroundColor: cardBg, borderColor: accent }]}
        onPress={() => setSelectedFile('/mock/scanned_book.pdf')}
        testID="button-pick-file"
        activeOpacity={0.7}
      >
        <Text style={{ fontSize: 30, marginBottom: 6 }}>📁</Text>
        <Text style={[styles.pickText, { color: textColor }]}>
          {selectedFile ? selectedFile.split('/').pop() : 'Select Scanned PDF'}
        </Text>
        <Text style={{ color: muted, fontSize: 12 }}>MuPDF renders → OCR engine extracts text</Text>
      </TouchableOpacity>

      <Text style={[styles.sectionLabel, { color: textColor, marginBottom: 10 }]}>🌐 Language</Text>
      <View style={styles.langRow}>
        {LANGUAGES.map(l => (
          <TouchableOpacity
            key={l.id}
            style={[styles.langCard, { backgroundColor: cardBg, borderColor: language === l.id ? accent : isDark ? '#444' : '#ccc' }, language === l.id && { backgroundColor: accent + '22' }]}
            onPress={() => setLanguage(l.id)}
          >
            <Text style={{ fontSize: 20 }}>{l.flag}</Text>
            <Text style={{ color: language === l.id ? accent : textColor, fontSize: 12, fontWeight: '600', marginTop: 2 }}>{l.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={[styles.engineToggle, { backgroundColor: cardBg }]}>
        <View>
          <Text style={{ color: textColor, fontWeight: '600' }}>🤖 Gemini AI OCR</Text>
          <Text style={{ color: muted, fontSize: 12 }}>{useGemini ? 'Online — better accuracy' : 'Offline — PaddleOCR'}</Text>
        </View>
        <Switch value={useGemini} onValueChange={setUseGemini} trackColor={{ false: '#555', true: accent }} />
      </View>

      {useGemini && (
        <View style={{ marginBottom: 14 }}>
          <Text style={{ color: muted, fontSize: 12, marginBottom: 8 }}>Select Gemini Model</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {AVAILABLE_MODELS.map(m => (
              <TouchableOpacity
                key={m.id}
                style={[styles.modelChip, { backgroundColor: cardBg, borderColor: selectedModel === m.id ? accent : isDark ? '#444' : '#ccc' }, selectedModel === m.id && { backgroundColor: accent + '22' }]}
                onPress={() => setSelectedModel(m.id)}
              >
                <Text style={{ color: selectedModel === m.id ? accent : textColor, fontSize: 12, fontWeight: '600' }}>{m.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <Text style={[styles.sectionLabel, { color: textColor, marginBottom: 10 }]}>📄 Output Format</Text>
      {OUTPUT_FORMATS.map(f => (
        <TouchableOpacity
          key={f.id}
          style={[styles.fmtCard, { backgroundColor: cardBg, borderColor: outputFormat === f.id ? accent : isDark ? '#333' : '#ddd' }, outputFormat === f.id && { backgroundColor: accent + '15' }]}
          onPress={() => setOutputFormat(f.id)}
        >
          <View style={{ flex: 1 }}>
            <Text style={{ color: outputFormat === f.id ? accent : textColor, fontWeight: '600' }}>{f.label}</Text>
            <Text style={{ color: muted, fontSize: 12 }}>{f.desc}</Text>
          </View>
          {outputFormat === f.id && <Text style={{ color: accent, fontSize: 18 }}>✓</Text>}
        </TouchableOpacity>
      ))}
    </ToolShell>
  );
}

const styles = StyleSheet.create({
  pickBtn: { padding: 24, borderRadius: 14, alignItems: 'center', borderWidth: 2, borderStyle: 'dashed', marginBottom: 16 },
  pickText: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  sectionLabel: { fontSize: 15, fontWeight: '700' },
  langRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  langCard: { flex: 1, padding: 10, borderRadius: 12, borderWidth: 2, alignItems: 'center' },
  engineToggle: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderRadius: 12, marginBottom: 10 },
  modelChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, marginRight: 8 },
  fmtCard: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 8 },
});
