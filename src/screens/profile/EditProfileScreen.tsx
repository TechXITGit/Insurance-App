import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radii, spacing } from '../../theme/spacing';
import { Header } from '../../components/common/Header';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { useAuthStore } from '../../store/authStore';

export const EditProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user, updateUserProfile } = useAuthStore();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [city, setCity] = useState(user?.city || '');
  const [loading, setLoading] = useState(false);

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      updateUserProfile({
        fullName,
        email,
        city,
      });
      setLoading(false);
      Alert.alert('Profile Updated', 'Your profile details have been saved.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    }, 500);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Edit Profile" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Personal Information</Text>

          <Input
            label="Full Name (as per PAN / Aadhaar)"
            value={fullName}
            onChangeText={setFullName}
          />

          <Input
            label="Email Address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Input
            label="City"
            value={city}
            onChangeText={setCity}
          />

          <Input
            label="Registered Mobile Number"
            value={user?.phone ? `+91 ${user.phone}` : '+91 9876543210'}
            editable={false}
            helperText="Phone number is linked to OTP authentication and cannot be changed here."
          />

          <Button
            title="Save Changes"
            onPress={handleSave}
            loading={loading}
            variant="primary"
            size="lg"
            style={{ marginTop: spacing.md }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surfaceSubtle,
  },
  scrollContent: {
    padding: spacing.md,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  cardTitle: {
    ...typography.h3,
    color: colors.primaryNavy,
    marginBottom: spacing.md,
  },
});
