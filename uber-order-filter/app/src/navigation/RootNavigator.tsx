import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';

import { HomeScreen } from '../screens/HomeScreen';
import { FiltersScreen } from '../screens/FiltersScreen';
import { HistoryScreen } from '../screens/HistoryScreen';
import { SettingsScreen } from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();

const TabIcon: React.FC<{ name: string; focused: boolean }> = ({
  name,
  focused,
}) => {
  const icons: Record<string, string> = {
    home: '🏠',
    filters: '⚙️',
    history: '📊',
    settings: '⚙️',
  };

  return (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 20,
      }}
    >
      <Text style={{ fontSize: 24 }}>{icons[name] || '•'}</Text>
    </View>
  );
};

export const RootNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: '#1a472a',
          tabBarInactiveTintColor: '#999999',
          tabBarStyle: {
            backgroundColor: '#ffffff',
            borderTopWidth: 1,
            borderTopColor: '#e0dbd5',
            paddingVertical: 8,
            height: 60,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
            marginBottom: 4,
          },
        })}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon name="home" focused={focused} />
            ),
          }}
        />

        <Tab.Screen
          name="Filters"
          component={FiltersScreen}
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon name="filters" focused={focused} />
            ),
          }}
        />

        <Tab.Screen
          name="History"
          component={HistoryScreen}
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon name="history" focused={focused} />
            ),
          }}
        />

        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon name="settings" focused={focused} />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};
