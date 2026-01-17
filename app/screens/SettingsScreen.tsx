import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const SettingsScreen = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [sounds, setSounds] = useState(false);
  const [animations, setAnimations] = useState(true);
  const [easterEggs, setEasterEggs] = useState(true);
  const [mockMode, setMockMode] = useState(false);
  const [godMode, setGodMode] = useState(false);

  const handleToggle = (
    value: boolean,
    setValue: (value: boolean) => void,
    title: string
  ) => {
    if (title === 'God Mode' && !value) {
      Alert.alert(
        '🔥 GOD MODE ACTIVATED! 🔥',
        'You now have unlimited AI power! (Just kidding, this does nothing 😄)',
        [{ text: 'AWESOME!', onPress: () => setValue(true) }]
      );
    } else if (title === 'Mock Mode' && !value) {
      Alert.alert(
        '🎭 Mock Mode',
        'All training will now produce hilarious fake results!',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Enable', onPress: () => setValue(true) },
        ]
      );
    } else {
      setValue(!value);
    }
  };

  const settingSections = [
    {
      title: 'Appearance',
      items: [
        {
          icon: 'moon',
          label: 'Dark Mode',
          value: darkMode,
          onToggle: () => setDarkMode(!darkMode),
          description: 'Always on because we love dark mode!',
        },
        {
          icon: 'sparkles',
          label: 'Animations',
          value: animations,
          onToggle: () => setAnimations(!animations),
          description: 'Fancy transitions and effects',
        },
      ],
    },
    {
      title: 'Notifications',
      items: [
        {
          icon: 'notifications',
          label: 'Push Notifications',
          value: notifications,
          onToggle: () => setNotifications(!notifications),
          description: 'Get notified about training completion',
        },
        {
          icon: 'volume-high',
          label: 'Sound Effects',
          value: sounds,
          onToggle: () => setSounds(!sounds),
          description: 'Pew pew! (Coming soon)',
        },
      ],
    },
    {
      title: 'Fun Stuff',
      items: [
        {
          icon: 'gift',
          label: 'Easter Eggs',
          value: easterEggs,
          onToggle: () => setEasterEggs(!easterEggs),
          description: 'Enable hidden surprises',
        },
        {
          icon: 'flask',
          label: 'Mock Mode',
          value: mockMode,
          onToggle: () => handleToggle(mockMode, setMockMode, 'Mock Mode'),
          description: 'Everything becomes fake and hilarious',
        },
        {
          icon: 'flame',
          label: 'God Mode',
          value: godMode,
          onToggle: () => handleToggle(godMode, setGodMode, 'God Mode'),
          description: 'Unlimited power! (Not really)',
        },
      ],
    },
  ];

  const actions = [
    {
      icon: 'trash',
      label: 'Clear All Data',
      color: '#ff6b6b',
      onPress: () =>
        Alert.alert(
          'Clear Data',
          'This would delete everything... but it doesn\'t work yet! 😅',
          [{ text: 'Phew!' }]
        ),
    },
    {
      icon: 'refresh',
      label: 'Reset Settings',
      color: '#4ecdc4',
      onPress: () =>
        Alert.alert('Reset', 'Settings reset! (Just kidding)', [
          { text: 'OK' },
        ]),
    },
    {
      icon: 'download',
      label: 'Export Data',
      color: '#ffd700',
      onPress: () =>
        Alert.alert('Export', 'Exporting... just kidding, nothing to export!', [
          { text: 'OK' },
        ]),
    },
    {
      icon: 'bug',
      label: 'Report a Bug',
      color: '#9b59b6',
      onPress: () =>
        Alert.alert(
          'Report Bug',
          'Bugs are features! But you can submit issues on GitHub.',
          [{ text: 'Cool!' }]
        ),
    },
  ];

  const appInfo = [
    { label: 'Version', value: '1.0.0' },
    { label: 'Build', value: '420' },
    { label: 'Backend', value: 'Rust 🦀' },
    { label: 'Frontend', value: 'React Native ⚛️' },
    { label: 'AI Power', value: 'Over 9000! 🔥' },
    { label: 'Bugs', value: 'Zero* (*that we know of)' },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Icon name="settings" size={40} color="#4ecdc4" />
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Customize your experience!</Text>
      </View>

      {/* Settings Sections */}
      {settingSections.map((section, sectionIndex) => (
        <View key={sectionIndex} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          {section.items.map((item, itemIndex) => (
            <View key={itemIndex} style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={styles.settingIcon}>
                  <Icon name={item.icon} size={24} color="#00ff88" />
                </View>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>{item.label}</Text>
                  <Text style={styles.settingDescription}>
                    {item.description}
                  </Text>
                </View>
              </View>
              <Switch
                value={item.value}
                onValueChange={item.onToggle}
                trackColor={{ false: '#333', true: '#00ff88' }}
                thumbColor={item.value ? '#fff' : '#f4f3f4'}
              />
            </View>
          ))}
        </View>
      ))}

      {/* Action Buttons */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Actions</Text>
        {actions.map((action, index) => (
          <TouchableOpacity
            key={index}
            style={styles.actionButton}
            onPress={action.onPress}
          >
            <Icon name={action.icon} size={24} color={action.color} />
            <Text style={[styles.actionLabel, { color: action.color }]}>
              {action.label}
            </Text>
            <Icon name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>
        ))}
      </View>

      {/* App Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Information</Text>
        <View style={styles.infoCard}>
          {appInfo.map((info, index) => (
            <View
              key={index}
              style={[
                styles.infoRow,
                index < appInfo.length - 1 && styles.infoRowBorder,
              ]}
            >
              <Text style={styles.infoLabel}>{info.label}</Text>
              <Text style={styles.infoValue}>{info.value}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Credits */}
      <View style={styles.creditsCard}>
        <Text style={styles.creditsTitle}>Made with ❤️ by</Text>
        <Text style={styles.creditsName}>Yobi & Claude</Text>
        <Text style={styles.creditsSubtext}>
          Powered by Rust, React Native, and AI magic
        </Text>
        <View style={styles.creditsLinks}>
          <TouchableOpacity
            style={styles.creditsButton}
            onPress={() =>
              Alert.alert('GitHub', 'Check out the code on GitHub!', [
                { text: 'Cool!' },
              ])
            }
          >
            <Icon name="logo-github" size={20} color="#fff" />
            <Text style={styles.creditsButtonText}>GitHub</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.creditsButton}
            onPress={() =>
              Alert.alert('Support', 'Thanks for the support! 🙏', [
                { text: '❤️' },
              ])
            }
          >
            <Icon name="heart" size={20} color="#ff6b6b" />
            <Text style={styles.creditsButtonText}>Support</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Fun Easter Egg */}
      <TouchableOpacity
        style={styles.easterEggButton}
        onPress={() =>
          Alert.alert(
            '🎉 Secret Found!',
            'You found a secret button! You get... absolutely nothing! But here\'s a cookie 🍪',
            [{ text: 'Thanks!' }]
          )
        }
      >
        <Text style={styles.easterEggText}>
          Tap here for a surprise! 👀
        </Text>
      </TouchableOpacity>

      <View style={styles.spacer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#4ecdc4',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4ecdc4',
    marginTop: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    marginTop: 5,
  },
  section: {
    padding: 15,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1a1a1a',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#333',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0a0a0a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: '#888',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#333',
    gap: 12,
  },
  actionLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#333',
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
  },
  infoRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  infoLabel: {
    fontSize: 15,
    color: '#888',
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  creditsCard: {
    backgroundColor: '#1a1a1a',
    margin: 15,
    padding: 25,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#4ecdc4',
    alignItems: 'center',
  },
  creditsTitle: {
    fontSize: 16,
    color: '#888',
    marginBottom: 8,
  },
  creditsName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4ecdc4',
    marginBottom: 8,
  },
  creditsSubtext: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 20,
  },
  creditsLinks: {
    flexDirection: 'row',
    gap: 10,
  },
  creditsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  creditsButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  easterEggButton: {
    backgroundColor: '#1a1a1a',
    margin: 15,
    padding: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ff69b4',
    borderStyle: 'dashed',
  },
  easterEggText: {
    fontSize: 16,
    color: '#ff69b4',
    textAlign: 'center',
    fontWeight: '600',
  },
  spacer: {
    height: 30,
  },
});

export default SettingsScreen;
