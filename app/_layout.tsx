import FontAwesome from '@expo/vector-icons/FontAwesome';
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MenuProvider } from 'react-native-popup-menu';
import { useFonts } from 'expo-font';
import { SplashScreen, Stack } from 'expo-router';
import { useEffect } from 'react';
// import { useColorScheme } from 'react-native';
import AuthProvider from '../context/AuthContext';
import TokenVerifier from '../components/TokenVerifier';
import Toast from 'react-native-toast-message';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    Inter: require('../assets/fonts/Inter.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

const queryClient = new QueryClient();

function RootLayoutNav() {
  // const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={DefaultTheme}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TokenVerifier>
            <MenuProvider>
              <Stack>
                <Stack.Screen name='(tabs)' options={{ headerShown: false }} />
                <Stack.Screen
                  name='(auth)/login'
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name='(auth)/register'
                  options={{
                    headerShown: true,
                    title: 'Registration',
                    headerStyle: {
                      backgroundColor: '#fff',
                    },
                    headerTitleStyle: {
                      color: '#000',
                    },
                    headerTintColor: '#000',
                  }}
                />
                <Stack.Screen
                  name='editProfile'
                  options={{
                    headerTitleAlign: 'center',
                    title: 'Edit Profile',
                    presentation: 'modal',
                    animation: 'fade_from_bottom',
                  }}
                />

                <Stack.Screen
                  name='changePassword'
                  options={{
                    headerTitleAlign: 'center',
                    title: 'Change Password',
                    presentation: 'modal',
                    animation: 'fade_from_bottom',
                  }}
                />

                <Stack.Screen
                  name='borrowedBooks'
                  options={{
                    headerTitleAlign: 'center',
                    title: 'Borrowed Books',
                    presentation: 'modal',
                    animation: 'slide_from_right',
                  }}
                />
              </Stack>

              <Toast />
            </MenuProvider>
          </TokenVerifier>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
