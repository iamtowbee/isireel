import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';

import TerminalScreen from './app/screens/TerminalScreen';
import GUIScreen from './app/screens/GUIScreen';
import JobsScreen from './app/screens/JobsScreen';
import IPAManagerScreen from './app/screens/IPAManagerScreen';
import LocalModelsScreen from './app/screens/LocalModelsScreen';
import PlaygroundScreen from './app/screens/PlaygroundScreen';
import ChatScreen from './app/screens/ChatScreen';
import MockTrainerScreen from './app/screens/MockTrainerScreen';
import StatsScreen from './app/screens/StatsScreen';
import SettingsScreen from './app/screens/SettingsScreen';

const Tab = createBottomTabNavigator();

const App = () => {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName: string;

              if (route.name === 'Chat') {
                iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
              } else if (route.name === 'Terminal') {
                iconName = focused ? 'terminal' : 'terminal-outline';
              } else if (route.name === 'Play') {
                iconName = focused ? 'game-controller' : 'game-controller-outline';
              } else if (route.name === 'Mock') {
                iconName = focused ? 'flask' : 'flask-outline';
              } else if (route.name === 'Stats') {
                iconName = focused ? 'stats-chart' : 'stats-chart-outline';
              } else if (route.name === 'Settings') {
                iconName = focused ? 'settings' : 'settings-outline';
              } else if (route.name === 'GUI') {
                iconName = focused ? 'apps' : 'apps-outline';
              } else if (route.name === 'Jobs') {
                iconName = focused ? 'list' : 'list-outline';
              } else if (route.name === 'IPAs') {
                iconName = focused ? 'download' : 'download-outline';
              } else {
                iconName = focused ? 'cube' : 'cube-outline';
              }

              return <Icon name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: '#007acc',
            tabBarInactiveTintColor: 'gray',
            tabBarStyle: {
              backgroundColor: '#1e1e1e',
              borderTopColor: '#3c3c3c',
            },
            headerStyle: {
              backgroundColor: '#1e1e1e',
            },
            headerTintColor: '#d4d4d4',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          })}
        >
          <Tab.Screen
            name="Chat"
            component={ChatScreen}
            options={{
              title: 'AI Chat',
            }}
          />
          <Tab.Screen
            name="Terminal"
            component={TerminalScreen}
            options={{
              title: 'AI Training Terminal',
            }}
          />
          <Tab.Screen
            name="Play"
            component={PlaygroundScreen}
            options={{
              title: 'Playground',
            }}
          />
          <Tab.Screen
            name="Mock"
            component={MockTrainerScreen}
            options={{
              title: 'Mock Lab',
            }}
          />
          <Tab.Screen
            name="Stats"
            component={StatsScreen}
            options={{
              title: 'Stats',
            }}
          />
          <Tab.Screen
            name="GUI"
            component={GUIScreen}
            options={{
              title: 'GUI Mode',
            }}
          />
          <Tab.Screen
            name="Jobs"
            component={JobsScreen}
            options={{
              title: 'Training Jobs',
            }}
          />
          <Tab.Screen
            name="IPAs"
            component={IPAManagerScreen}
            options={{
              title: 'IPA Manager',
            }}
          />
          <Tab.Screen
            name="Local"
            component={LocalModelsScreen}
            options={{
              title: 'Local Models',
            }}
          />
          <Tab.Screen
            name="Settings"
            component={SettingsScreen}
            options={{
              title: 'Settings',
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default App;
