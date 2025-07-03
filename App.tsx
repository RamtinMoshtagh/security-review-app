import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';


import RootNavigator from './navigation/RootNavigator';
import { customTheme, customNavigationTheme } from './theme/index';

/**
 * Entry point – wraps React Navigation and React Native Paper providers.
 * All navigation logic lives in src/navigation/RootNavigator.tsx.
 */
export default function App() {
  return (
    <PaperProvider theme={customTheme}>
      <NavigationContainer theme={customNavigationTheme}>
        <RootNavigator />
      </NavigationContainer>
    </PaperProvider>
  );
}
