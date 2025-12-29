import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';

import TerminalScreen from './app/screens/TerminalScreen';
import GUIScreen from './app/screens/GUIScreen';
import JobsScreen from './app/screens/JobsScreen';

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
              } else {
                iconName = focused ? 'list' : 'list-outline';
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
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default App;
