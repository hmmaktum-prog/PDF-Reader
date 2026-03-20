import { Stack } from 'expo-router';
import { ThemeProvider, useAppTheme } from './context/ThemeContext';
import { ContinueProvider } from './context/ContinueContext';
import { PasswordProvider } from './context/PasswordContext';
import { View } from 'react-native';

const RootLayoutNav = () => {
  const { isDark } = useAppTheme();

  const headerBg = isDark ? '#1f1f1f' : '#f4f4f4';
  const headerTint = isDark ? '#ffffff' : '#000000';

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? '#121212' : '#ffffff' }}>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: headerBg },
          headerTintColor: headerTint,
        }}
      >
        <Stack.Screen name="index" options={{ title: 'PDF Power Tools' }} />
        <Stack.Screen name="tools" options={{ title: 'All Tools' }} />
        <Stack.Screen name="screens/merge" options={{ headerShown: false }} />
        <Stack.Screen name="screens/split" options={{ headerShown: false }} />
        <Stack.Screen name="screens/split-by-line" options={{ headerShown: false }} />
        <Stack.Screen name="screens/rotate" options={{ headerShown: false }} />
        <Stack.Screen name="screens/compress" options={{ headerShown: false }} />
        <Stack.Screen name="screens/organize" options={{ headerShown: false }} />
        <Stack.Screen name="screens/remove-pages" options={{ headerShown: false }} />
        <Stack.Screen name="screens/invert" options={{ headerShown: false }} />
        <Stack.Screen name="screens/grayscale" options={{ headerShown: false }} />
        <Stack.Screen name="screens/whitener" options={{ headerShown: false }} />
        <Stack.Screen name="screens/enhance-contrast" options={{ headerShown: false }} />
        <Stack.Screen name="screens/image-to-pdf" options={{ headerShown: false }} />
        <Stack.Screen name="screens/pdf-to-image" options={{ headerShown: false }} />
        <Stack.Screen name="screens/nup" options={{ headerShown: false }} />
        <Stack.Screen name="screens/booklet" options={{ headerShown: false }} />
        <Stack.Screen name="screens/four-up-booklet" options={{ headerShown: false }} />
        <Stack.Screen name="screens/resize" options={{ headerShown: false }} />
        <Stack.Screen name="screens/repair" options={{ headerShown: false }} />
        <Stack.Screen name="screens/auto-process" options={{ headerShown: false }} />
        <Stack.Screen name="screens/ocr" options={{ headerShown: false }} />
      </Stack>
    </View>
  );
};

export default function RootLayout() {
  return (
    <ThemeProvider>
      <ContinueProvider>
        <PasswordProvider>
          <RootLayoutNav />
        </PasswordProvider>
      </ContinueProvider>
    </ThemeProvider>
  );
}
