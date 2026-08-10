import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Picker,
} from 'react-native';
import { AppSettings } from '../types';
import { settingsStorage, clearAllData } from '../services/storageService';

export const SettingsScreen: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      const s = await settingsStorage.get();
      setSettings(s);
    };
    loadSettings();
  }, []);

  const handleToggleSetting = async (key: keyof AppSettings, value: any) => {
    if (!settings) return;

    const updated = { ...settings, [key]: value };
    setSettings(updated);
    await settingsStorage.update({ [key]: value });
  };

  const handleClearAllData = () => {
    Alert.alert(
      'Clear All Data',
      'This will delete all filters, history, and preferences. This cannot be undone.',
      [
        { text: 'Cancel', onPress: () => {} },
        {
          text: 'Clear',
          onPress: async () => {
            await clearAllData();
            Alert.alert('Success', 'All data cleared');
            setSettings(settingsStorage.defaultSettings);
          },
          style: 'destructive',
        },
      ]
    );
  };

  if (!settings) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Audio & Notifications</Text>

        <View style={styles.settingItem}>
          <View style={styles.settingLabel}>
            <Text style={styles.settingName}>Enable Audio Alerts</Text>
            <Text style={styles.settingDesc}>
              Play sound when poor order detected
            </Text>
          </View>
          <Switch
            value={settings.enableAudio}
            onValueChange={value =>
              handleToggleSetting('enableAudio', value)
            }
          />
        </View>

        {settings.enableAudio && (
          <>
            <View style={styles.settingItem}>
              <View style={styles.settingLabel}>
                <Text style={styles.settingName}>Alert Volume</Text>
                <Text style={styles.settingDesc}>{settings.audioVolume}%</Text>
              </View>
              <Text style={styles.volumeSlider}>
                {[0, 25, 50, 75, 100].map(vol => (
                  <TouchableOpacity
                    key={vol}
                    onPress={() => handleToggleSetting('audioVolume', vol)}
                    style={[
                      styles.volumeButton,
                      vol === settings.audioVolume && styles.volumeButtonActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.volumeButtonText,
                        vol === settings.audioVolume &&
                          styles.volumeButtonTextActive,
                      ]}
                    >
                      {vol}
                    </Text>
                  </TouchableOpacity>
                ))}
              </Text>
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingLabel}>
                <Text style={styles.settingName}>Alert Type</Text>
              </View>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={settings.audioType}
                  onValueChange={value =>
                    handleToggleSetting('audioType', value)
                  }
                  style={styles.picker}
                >
                  <Picker.Item label="Beep" value="beep" />
                  <Picker.Item label="Chime" value="chime" />
                  <Picker.Item label="Alert" value="alert" />
                  <Picker.Item label="Custom" value="custom" />
                </Picker>
              </View>
            </View>
          </>
        )}

        <View style={styles.settingItem}>
          <View style={styles.settingLabel}>
            <Text style={styles.settingName}>Vibration</Text>
            <Text style={styles.settingDesc}>Haptic feedback on alerts</Text>
          </View>
          <Switch
            value={settings.enableVibration}
            onValueChange={value =>
              handleToggleSetting('enableVibration', value)
            }
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Display</Text>

        <View style={styles.settingItem}>
          <View style={styles.settingLabel}>
            <Text style={styles.settingName}>Theme</Text>
          </View>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={settings.theme}
              onValueChange={value => handleToggleSetting('theme', value)}
              style={styles.picker}
            >
              <Picker.Item label="Light" value="light" />
              <Picker.Item label="Dark" value="dark" />
              <Picker.Item label="Auto" value="auto" />
            </Picker>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data & Privacy</Text>

        <View style={styles.settingItem}>
          <View style={styles.settingLabel}>
            <Text style={styles.settingName}>Data Storage</Text>
            <Text style={styles.settingDesc}>Where to save your data</Text>
          </View>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={settings.dataStorageMode}
              onValueChange={value =>
                handleToggleSetting('dataStorageMode', value)
              }
              style={styles.picker}
            >
              <Picker.Item label="Local Only" value="local" />
              <Picker.Item label="Cloud Sync" value="cloud" />
              <Picker.Item label="Hybrid" value="hybrid" />
            </Picker>
          </View>
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingLabel}>
            <Text style={styles.settingName}>Privacy Mode</Text>
            <Text style={styles.settingDesc}>
              Disable cloud sync & analytics
            </Text>
          </View>
          <Switch
            value={settings.privacyMode}
            onValueChange={value => handleToggleSetting('privacyMode', value)}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Danger Zone</Text>

        <TouchableOpacity
          style={styles.dangerButton}
          onPress={handleClearAllData}
        >
          <Text style={styles.dangerButtonText}>🗑 Clear All Data</Text>
        </TouchableOpacity>

        <Text style={styles.dangerNote}>
          This will permanently delete all filters, history, and preferences.
          This action cannot be undone.
        </Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.versionText}>Version 0.1.0</Text>
        <Text style={styles.versionText}>© 2026 Uber Order Filter</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f7f5',
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0dbd5',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a472a',
    marginBottom: 12,
  },
  settingItem: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 8,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingLabel: {
    flex: 1,
  },
  settingName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c2c2c',
    marginBottom: 4,
  },
  settingDesc: {
    fontSize: 12,
    color: '#666666',
  },
  volumeSlider: {
    flexDirection: 'row',
    gap: 4,
  },
  volumeButton: {
    backgroundColor: '#f8f7f5',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e0dbd5',
  },
  volumeButtonActive: {
    backgroundColor: '#1a472a',
    borderColor: '#1a472a',
  },
  volumeButtonText: {
    fontSize: 11,
    color: '#666666',
    fontWeight: '600',
  },
  volumeButtonTextActive: {
    color: '#ffffff',
  },
  pickerContainer: {
    flex: 1,
    backgroundColor: '#f8f7f5',
    borderRadius: 6,
    overflow: 'hidden',
  },
  picker: {
    flex: 1,
    height: 100,
  },
  dangerButton: {
    backgroundColor: '#e74c3c',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  dangerButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  dangerNote: {
    fontSize: 12,
    color: '#e74c3c',
    marginTop: 12,
    lineHeight: 18,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 32,
    alignItems: 'center',
  },
  versionText: {
    fontSize: 12,
    color: '#999999',
  },
});
