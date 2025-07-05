/* -------------------------------------------------------------------
 File: App.tsx
---------------------------------------------------------------------- */
import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AuthProvider, useAuth } from './lib/auth';
import SignInScreen   from './screens/SignInScreen';
import SignUpScreen   from './screens/SignUpScreen';
import RootNavigator  from './navigation/RootNavigator';
import { customTheme, customNavigationTheme } from './theme/index';

const Stack = createNativeStackNavigator();

function AppContent() {
  const { user } = useAuth();
  return (
    <NavigationContainer theme={customNavigationTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user
          ? <Stack.Screen name="Main" component={RootNavigator} />
          : <>
              <Stack.Screen name="SignIn" component={SignInScreen} />
              <Stack.Screen name="SignUp" component={SignUpScreen} />
            </>
        }
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <PaperProvider theme={customTheme}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </PaperProvider>
  );
}
