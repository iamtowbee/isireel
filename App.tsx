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

const Tab = createBottomTabNavigator();

const App = () => {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName: string;

              if (route.name === 'Terminal') {
                iconName = focused ? 'terminal' : 'terminal-outline';
              } else if (route.name === 'GUI') {
                iconName = focused ? 'apps' : 'apps-outline';
              } else if (route.name === 'Jobs') {
                iconName = focused ? 'list' : 'list-outline';
              } else if (route.name === 'IPAs') {
                iconName = focused ? 'download' : 'download-outline';
              } else if (route.name === 'Local') {
                iconName = focused ? 'cube' : 'cube-outline';
              } else {
                iconName = focused ? 'game-controller' : 'game-controller-outline';
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
            name="Terminal"
            component={TerminalScreen}
            options={{
              title: 'AI Training Terminal',
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
            name="Play"
            component={PlaygroundScreen}
            options={{
              title: 'Playground',
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default App;
