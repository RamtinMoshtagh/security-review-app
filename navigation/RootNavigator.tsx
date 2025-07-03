import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import LandingScreen from '../screens/LandingScreen';
import ReviewFlowScreen from '../screens/Review/ReviewFlowScreen';
import ConfirmationScreen from '../screens/Review/ConfirmationScreen';
import InsightsScreen from '../screens/InsightsScreen';
import VenueDetailScreen from '../screens/VenueDetailScreen';
import VenueListScreen from '../screens/VenueListScreen';
import { customTheme } from '../theme';
import { RootTabParamList, ReviewStackParamList } from './types';

const Tab = createBottomTabNavigator<RootTabParamList>();
const Stack = createNativeStackNavigator<ReviewStackParamList>();

function ReviewStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ReviewFlow" component={ReviewFlowScreen} />
      <Stack.Screen name="Confirmation" component={ConfirmationScreen} />
      <Stack.Screen name="VenueDetail" component={VenueDetailScreen} />
      <Stack.Screen name="VenueList" component={VenueListScreen} />
    </Stack.Navigator>
  );
}

const RootNavigator: React.FC = () => (
  <Tab.Navigator
    initialRouteName="Home"
    screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: customTheme.colors.primary,
      tabBarInactiveTintColor: customTheme.colors.outline,
      tabBarStyle: {
        backgroundColor: customTheme.colors.surface,
        borderTopColor: customTheme.colors.outline,
        paddingBottom: 4,
        height: 70,
      },
      tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
    }}
  >
    <Tab.Screen
      name="Home"
      component={LandingScreen}
      options={{
        tabBarLabel: 'Home',
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons
            name="home-outline"
            color={color}
            size={size}
            accessibilityRole="tab"
            accessibilityLabel="Home tab"
          />
        ),
      }}
    />

    <Tab.Screen
      name="ReviewStack"
      component={ReviewStackNavigator}
      options={{
        tabBarLabel: 'Review',
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons
            name="clipboard-text"
            color={color}
            size={size}
            accessibilityRole="tab"
            accessibilityLabel="Review tab"
          />
        ),
      }}
    />

    <Tab.Screen
      name="Insights"
      component={InsightsScreen}
      options={{
        tabBarLabel: 'Insights',
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons
            name="chart-box-outline"
            color={color}
            size={size}
            accessibilityRole="tab"
            accessibilityLabel="Insights tab"
          />
        ),
      }}
    />
  </Tab.Navigator>
);

export default RootNavigator;
