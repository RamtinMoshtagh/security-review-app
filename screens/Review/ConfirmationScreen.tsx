import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useNavigation, NavigationProp } from '@react-navigation/native';

import { ReviewStackParamList } from '../../navigation/types';

const ConfirmationScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp<ReviewStackParamList, 'Confirmation'>>();

  useEffect(() => {
    const id = setTimeout(() => {
      // Reset to root tab "Insights" after 3 seconds
      navigation.reset({ index: 0, routes: [{ name: 'Insights' }] as any });
    }, 3000);
    return () => clearTimeout(id);
  }, [navigation]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.primary }]}>🎉 Review submitted successfully!</Text>
      <Text style={[styles.subtitle, { color: theme.colors.onSurface }]}>Redirecting to Insights…</Text>
    </View>
  );
};

export default ConfirmationScreen;

// ────────────────────────────────────────────────────────── Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
});
