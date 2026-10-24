import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radii, spacing } from '../../theme/spacing';
import {
  useInsuredProfileStore,
  InsuredRelation,
  InsuredProfileData,
} from '../../store/insuredProfileStore';
import { useAuthStore } from '../../store/authStore';
import { CategoryId } from '../../types/insurance';

interface InsuredPersonIntakeCardProps {
  onExplorePlans: (type: CategoryId | 'senior' | 'family') => void;
}

const RELATION_OPTIONS: { id: InsuredRelation; label: string; icon: string }[] = [
  { id: 'self', label: 'Self', icon: 'account' },
  { id: 'spouse', label: 'Spouse', icon: 'account-heart' },
  { id: 'son', label: 'Son', icon: 'human-male-boy' },
  { id: 'daughter', label: 'Daughter', icon: 'human-female-girl' },
  { id: 'father', label: 'Father', icon: 'account-tie' },
  { id: 'mother', label: 'Mother', icon: 'account-cowboy-hat' },
];

export const INSURANCE_TYPES_HEALTH: {
  id: CategoryId | 'senior' | 'family';
  title: string;
  badge: string;
  desc: string;
  icon: string;
}[] = [
  {
    id: 'health',
    title: 'Medical / Health Insurance',
    badge: '10,000+ Hospitals',
    desc: 'Comprehensive hospitalization, ICU, daycare, and unlimited restoration.',
    icon: 'heart-pulse',
  },
  {
    id: 'term_assurance',
    title: 'Term Life Insurance',
    badge: '₹1 Cr+ Cover',
    desc: 'High financial sum assured pure life cover for family income security.',
    icon: 'shield-account',
  },
  {
    id: 'accident',
    title: 'Personal Accident Policy',
    badge: '24x7 Worldwide',
    desc: 'Permanent disability, fractures, accidental emergency, and weekly payout.',
    icon: 'shield-alert',
  },
  {
    id: 'mediclaim',
    title: 'Mediclaim',
    badge: 'Hospital Bills',
    desc: 'Direct in-patient hospital bill and surgery expense reimbursement.',
    icon: 'medical-bag',
  },
  {
    id: 'senior',
    title: 'Senior Citizen Health',
    badge: 'Age 60+ Covered',
    desc: 'Specialized health cover for parents with reduced PED waiting times.',
    icon: 'human-cane',
  },
  {
    id: 'family',
    title: 'Family Floater Health',
    badge: 'All-in-One Cover',
    desc: 'Single shared sum insured covering spouse and dependent children.',
    icon: 'account-group',
  },
  {
    id: 'travel',
    title: 'Travel Medical Insurance',
    badge: 'Schengen Approved',
    desc: 'Emergency international medical hospitalization & medical evacuation.',
    icon: 'airplane',
  },
];

export const InsuredPersonIntakeCard: React.FC<InsuredPersonIntakeCardProps> = ({
  onExplorePlans,
}) => {
  const { user } = useAuthStore();
  const { profile, isProfileSubmitted, setProfile, submitProfile } = useInsuredProfileStore();

  const [isEditing, setIsEditing] = useState(!isProfileSubmitted);
  const [relation, setRelation] = useState<InsuredRelation>(profile.relation || 'self');
  const [fullName, setFullName] = useState(profile.fullName || user?.fullName || '');
  const [age, setAge] = useState(profile.age || '');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>(profile.gender || 'male');
  const [pincode, setPincode] = useState(profile.pincode || user?.pincode || '');
  const [city, setCity] = useState(profile.city || user?.city || '');
  const [phone, setPhone] = useState(profile.phone || user?.phone || '');
  const [hasPed, setHasPed] = useState(profile.hasPreExistingConditions || false);
  const [pedDetails, setPedDetails] = useState(profile.preExistingDetails || '');
  const [tobaccoUser, setTobaccoUser] = useState(profile.tobaccoUser || false);
  const [selectedInsuranceType, setSelectedInsuranceType] = useState<
    CategoryId | 'senior' | 'family'
  >(profile.insuranceType || 'health');

  // Auto-fill city for common Indian pincodes if left empty
  const handlePincodeChange = (val: string) => {
    setPincode(val);
    if (!city) {
      if (val.startsWith('11')) setCity('Delhi NCR');
      else if (val.startsWith('40')) setCity('Mumbai');
      else if (val.startsWith('56')) setCity('Bengaluru');
      else if (val.startsWith('50')) setCity('Hyderabad');
      else if (val.startsWith('60')) setCity('Chennai');
      else if (val.startsWith('70')) setCity('Kolkata');
      else if (val.startsWith('38')) setCity('Ahmedabad');
      else if (val.startsWith(' Pune') || val.startsWith('41')) setCity('Pune');
    }
  };

  const handleRelationSelect = (rel: InsuredRelation) => {
    setRelation(rel);
    if (rel === 'self') {
      if (!fullName && user?.fullName) setFullName(user.fullName);
    } else if (rel === 'father' || rel === 'mother') {
      if (!age || parseInt(age, 10) < 55) {
        setAge('62');
      }
      setSelectedInsuranceType('senior');
    } else if (rel === 'spouse' || rel === 'son' || rel === 'daughter') {
      if (selectedInsuranceType === 'health') {
        setSelectedInsuranceType('family');
      }
    }
  };

  const handleSubmit = () => {
    if (!fullName.trim()) {
      Alert.alert('Required Field', 'Please enter the name of the person who needs insurance.');
      return;
    }
    if (!age.trim() || isNaN(parseInt(age, 10)) || parseInt(age, 10) < 1 || parseInt(age, 10) > 100) {
      Alert.alert('Invalid Age', 'Please enter a valid age between 1 and 100 years.');
      return;
    }
    if (!pincode.trim() || pincode.trim().length < 6) {
      Alert.alert('Invalid PIN Code', 'Please enter a valid 6-digit postal PIN code.');
      return;
    }

    const payload: Partial<InsuredProfileData> = {
      relation,
      fullName: fullName.trim(),
      age: age.trim(),
      gender,
      pincode: pincode.trim(),
      city: city.trim() || 'India',
      phone: phone.trim(),
      email: user?.email || '',
      hasPreExistingConditions: hasPed,
      preExistingDetails: hasPed ? pedDetails.trim() : '',
      tobaccoUser,
      insuranceType: selectedInsuranceType,
    };

    submitProfile(payload);
    setIsEditing(false);
    onExplorePlans(selectedInsuranceType);
  };

  // If already submitted and not currently editing, display compact active card
  if (isProfileSubmitted && !isEditing) {
    const selectedTypeObj = INSURANCE_TYPES_HEALTH.find((t) => t.id === profile.insuranceType);
    return (
      <View style={styles.activeCard}>
        <View style={styles.activeCardHeader}>
          <View style={styles.activeBadgeRow}>
            <View style={styles.activePulseDot} />
            <Text style={styles.activeBadgeText}>ACTIVE INSURED PROFILE</Text>
          </View>
          <TouchableOpacity
            onPress={() => setIsEditing(true)}
            style={styles.editProfileBtn}
            accessibilityLabel="Edit person details"
          >
            <Ionicons name="pencil" size={14} color={colors.primaryBlue} />
            <Text style={styles.editProfileText}>Edit / Switch</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.activePersonRow}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={20} color={colors.primaryNavy} />
          </View>
          <View style={styles.activePersonInfo}>
            <Text style={styles.activePersonName}>{profile.fullName || 'Insured Member'}</Text>
            <Text style={styles.activePersonMeta}>
              {profile.relation.toUpperCase()} • {profile.age} yrs • {profile.gender.toUpperCase()} • PIN:{' '}
              {profile.pincode} ({profile.city || 'India'})
            </Text>
          </View>
        </View>

        <View style={styles.activeStatusStrip}>
          <View style={styles.activeStatusPill}>
            <Ionicons
              name={selectedTypeObj?.icon as any || 'shield-checkmark'}
              size={13}
              color={colors.primaryNavy}
            />
            <Text style={styles.activeStatusText}>
              {selectedTypeObj?.title || 'Medical Insurance'}
            </Text>
          </View>

          <View
            style={[
              styles.activeStatusPill,
              profile.hasPreExistingConditions ? styles.pedAlertPill : styles.pedClearPill,
            ]}
          >
            <Ionicons
              name={profile.hasPreExistingConditions ? 'alert-circle' : 'checkmark-circle'}
              size={13}
              color={profile.hasPreExistingConditions ? '#B45309' : '#047857'}
            />
            <Text
              style={[
                styles.activeStatusText,
                profile.hasPreExistingConditions ? styles.pedAlertText : styles.pedClearText,
              ]}
            >
              {profile.hasPreExistingConditions ? 'Pre-existing Declared' : 'No Pre-existing Conditions'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => onExplorePlans(profile.insuranceType)}
          style={styles.activeCtaBtn}
        >
          <Text style={styles.activeCtaBtnText}>
            View {selectedTypeObj?.title || 'Health'} Plans for {profile.fullName.split(' ')[0]}
          </Text>
          <Ionicons name="arrow-forward" size={16} color={colors.white} />
        </TouchableOpacity>
      </View>
    );
  }

  // Intake Form
  return (
    <View style={styles.container}>
      {/* Header Banner */}
      <View style={styles.formHeader}>
        <View style={styles.headerIconContainer}>
          <MaterialCommunityIcons name="clipboard-account" size={24} color={colors.primaryBlue} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.formTitle}>Who needs insurance?</Text>
          <Text style={styles.formSubtitle}>
            Enter details of the person needing coverage for verified health & term plans
          </Text>
        </View>
        {isProfileSubmitted && (
          <TouchableOpacity onPress={() => setIsEditing(false)} style={styles.cancelEditBtn}>
            <Ionicons name="close" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* 1. Relationship selector */}
      <Text style={styles.sectionLabel}>Select Person to Insure</Text>
      <View style={styles.relationRow}>
        {RELATION_OPTIONS.map((item) => {
          const isSelected = relation === item.id;
          return (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.8}
              onPress={() => handleRelationSelect(item.id)}
              style={[styles.relationChip, isSelected && styles.relationChipActive]}
            >
              <MaterialCommunityIcons
                name={item.icon as any}
                size={18}
                color={isSelected ? colors.white : colors.primaryNavy}
              />
              <Text style={[styles.relationChipText, isSelected && styles.relationChipTextActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* 2. Personal Information Fields */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Full Name of Insured Person *</Text>
        <TextInput
          value={fullName}
          onChangeText={setFullName}
          placeholder="e.g. Aarav Mehta"
          placeholderTextColor={colors.textMuted}
          style={styles.textInput}
        />
      </View>

      <View style={styles.twoColRow}>
        <View style={{ flex: 1, marginRight: spacing.sm }}>
          <Text style={styles.inputLabel}>Age in Years *</Text>
          <TextInput
            value={age}
            onChangeText={setAge}
            placeholder="e.g. 30"
            placeholderTextColor={colors.textMuted}
            keyboardType="number-pad"
            maxLength={2}
            style={styles.textInput}
          />
        </View>

        <View style={{ flex: 1.2 }}>
          <Text style={styles.inputLabel}>Gender *</Text>
          <View style={styles.genderRow}>
            {(['male', 'female', 'other'] as const).map((g) => {
              const active = gender === g;
              return (
                <TouchableOpacity
                  key={g}
                  onPress={() => setGender(g)}
                  style={[styles.genderBtn, active && styles.genderBtnActive]}
                >
                  <Text style={[styles.genderBtnText, active && styles.genderBtnTextActive]}>
                    {g === 'male' ? 'Male' : g === 'female' ? 'Female' : 'Other'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>

      <View style={styles.twoColRow}>
        <View style={{ flex: 1, marginRight: spacing.sm }}>
          <Text style={styles.inputLabel}>PIN Code *</Text>
          <TextInput
            value={pincode}
            onChangeText={handlePincodeChange}
            placeholder="e.g. 110001"
            placeholderTextColor={colors.textMuted}
            keyboardType="number-pad"
            maxLength={6}
            style={styles.textInput}
          />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.inputLabel}>City / Location</Text>
          <TextInput
            value={city}
            onChangeText={setCity}
            placeholder="e.g. Delhi NCR"
            placeholderTextColor={colors.textMuted}
            style={styles.textInput}
          />
        </View>
      </View>

      {/* 3. Pre-existing Conditions Checkbox (Strictly Checkbox as per rules) */}
      <View style={styles.healthDeclarationCard}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => setHasPed(!hasPed)}
          style={styles.checkboxRow}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: hasPed }}
        >
          <View style={[styles.checkboxSquare, hasPed && styles.checkboxSquareActive]}>
            {hasPed && <Ionicons name="checkmark" size={16} color={colors.white} />}
          </View>
          <View style={{ flex: 1, marginLeft: spacing.sm }}>
            <Text style={styles.checkboxTitle}>Any Pre-existing Medical Conditions?</Text>
            <Text style={styles.checkboxSubtitle}>
              Diabetes, Hypertension, Heart disease, Asthma, Thyroid, or prior surgeries
            </Text>
          </View>
        </TouchableOpacity>

        {hasPed && (
          <View style={styles.specifyContainer}>
            <Text style={styles.specifyLabel}>
              Please specify medical condition and medication details *
            </Text>
            <TextInput
              value={pedDetails}
              onChangeText={setPedDetails}
              placeholder="e.g. Type 2 Diabetes for 3 years, taking Metformin 500mg daily"
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={3}
              style={styles.multilineInput}
            />
          </View>
        )}
      </View>

      {/* 4. Tobacco / Smoking Habits Toggle */}
      <View style={styles.tobaccoRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.tobaccoTitle}>Tobacco / Smoking Habit</Text>
          <Text style={styles.tobaccoDesc}>Essential for accurate underwriting factors</Text>
        </View>
        <TouchableOpacity
          onPress={() => setTobaccoUser(!tobaccoUser)}
          style={[styles.togglePill, tobaccoUser && styles.togglePillActive]}
        >
          <Text style={[styles.togglePillText, tobaccoUser && styles.togglePillTextActive]}>
            {tobaccoUser ? 'Yes' : 'No'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 5. Separated Types of Insurance to Explore (Health & Personal Only) */}
      <Text style={styles.sectionLabel}>Select Type of Insurance to Explore</Text>
      <View style={styles.typesGrid}>
        {INSURANCE_TYPES_HEALTH.map((item) => {
          const isSelected = selectedInsuranceType === item.id;
          return (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.8}
              onPress={() => setSelectedInsuranceType(item.id)}
              style={[styles.typeOptionCard, isSelected && styles.typeOptionCardSelected]}
            >
              <View style={styles.typeOptionTop}>
                <View style={[styles.typeIconBox, isSelected && styles.typeIconBoxSelected]}>
                  <MaterialCommunityIcons
                    name={item.icon as any}
                    size={20}
                    color={isSelected ? colors.white : colors.primaryBlue}
                  />
                </View>
                <View style={[styles.typeBadge, isSelected && styles.typeBadgeSelected]}>
                  <Text style={[styles.typeBadgeText, isSelected && styles.typeBadgeTextSelected]}>
                    {item.badge}
                  </Text>
                </View>
              </View>

              <Text style={[styles.typeTitle, isSelected && styles.typeTitleSelected]}>
                {item.title}
              </Text>
              <Text style={styles.typeDesc} numberOfLines={2}>
                {item.desc}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* 6. Primary Action CTA */}
      <TouchableOpacity activeOpacity={0.85} onPress={handleSubmit} style={styles.submitBtn}>
        <Text style={styles.submitBtnText}>Save Profile & Explore Matching Plans</Text>
        <Ionicons name="arrow-forward" size={18} color={colors.white} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: radii.cardLg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md + 2,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  headerIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.lightBlueBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formTitle: {
    ...typography.h3,
    color: colors.primaryNavy,
    fontSize: 18,
    fontWeight: '800',
  },
  formSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  cancelEditBtn: {
    padding: 6,
  },
  sectionLabel: {
    ...typography.bodySmall,
    fontWeight: '700',
    color: colors.primaryNavy,
    marginTop: spacing.xs,
    marginBottom: spacing.xs + 2,
  },
  relationRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: spacing.md,
  },
  relationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.full,
    paddingVertical: 6,
    paddingHorizontal: 12,
    gap: 6,
  },
  relationChipActive: {
    backgroundColor: colors.primaryNavy,
    borderColor: colors.primaryNavy,
  },
  relationChipText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.primaryNavy,
    fontSize: 12,
  },
  relationChipTextActive: {
    color: colors.white,
    fontWeight: '700',
  },
  inputGroup: {
    marginBottom: spacing.sm,
  },
  inputLabel: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  textInput: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: 9,
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },
  twoColRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  genderRow: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 2,
    height: 42,
    alignItems: 'center',
  },
  genderBtn: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.sm,
  },
  genderBtnActive: {
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  genderBtnText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  genderBtnTextActive: {
    color: colors.primaryBlue,
    fontWeight: '700',
  },
  healthDeclarationCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: spacing.sm + 2,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxSquare: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSquareActive: {
    backgroundColor: colors.primaryBlue,
    borderColor: colors.primaryBlue,
  },
  checkboxTitle: {
    ...typography.bodySmall,
    fontWeight: '700',
    color: colors.primaryNavy,
  },
  checkboxSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  specifyContainer: {
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  specifyLabel: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  multilineInput: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    padding: spacing.sm,
    minHeight: 64,
    textAlignVertical: 'top',
    ...typography.bodySmall,
    color: colors.textPrimary,
  },
  tobaccoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs + 2,
    marginBottom: spacing.sm,
  },
  tobaccoTitle: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  tobaccoDesc: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
  },
  togglePill: {
    paddingVertical: 5,
    paddingHorizontal: 16,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSubtle,
  },
  togglePillActive: {
    backgroundColor: colors.primaryNavy,
    borderColor: colors.primaryNavy,
  },
  togglePillText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  togglePillTextActive: {
    color: colors.white,
  },
  typesGrid: {
    gap: 8,
    marginBottom: spacing.md,
  },
  typeOptionCard: {
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radii.md,
    padding: spacing.sm + 2,
    backgroundColor: colors.surfaceSubtle,
  },
  typeOptionCardSelected: {
    borderColor: colors.primaryBlue,
    backgroundColor: '#F0F7FF',
    borderWidth: 1.5,
  },
  typeOptionTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  typeIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.lightBlueBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeIconBoxSelected: {
    backgroundColor: colors.primaryBlue,
  },
  typeBadge: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.full,
  },
  typeBadgeSelected: {
    backgroundColor: colors.lightBlueBg,
  },
  typeBadgeText: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  typeBadgeTextSelected: {
    color: colors.primaryBlue,
  },
  typeTitle: {
    ...typography.bodyMedium,
    fontWeight: '700',
    color: colors.primaryNavy,
    marginTop: 2,
  },
  typeTitleSelected: {
    color: colors.primaryBlue,
  },
  typeDesc: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
    lineHeight: 15,
    marginTop: 2,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryBlue,
    borderRadius: radii.md,
    paddingVertical: 13,
    paddingHorizontal: spacing.md,
    gap: 8,
    marginTop: spacing.xs,
  },
  submitBtnText: {
    ...typography.buttonMedium,
    color: colors.white,
    fontWeight: '700',
  },

  // Active Summary Card Styles
  activeCard: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    borderRadius: radii.cardLg,
    borderWidth: 1,
    borderColor: '#C7D9F5',
    padding: spacing.md,
    shadowColor: '#1E3A8A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  activeCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs + 2,
  },
  activeBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  activePulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  activeBadgeText: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '800',
    color: colors.primaryNavy,
    letterSpacing: 0.5,
  },
  editProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.lightBlueBg,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: radii.full,
  },
  editProfileText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.primaryBlue,
    fontWeight: '700',
  },
  activePersonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: spacing.sm,
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
  },
  activePersonInfo: {
    flex: 1,
  },
  activePersonName: {
    ...typography.bodyLarge,
    fontWeight: '800',
    color: colors.primaryNavy,
  },
  activePersonMeta: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  activeStatusStrip: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: spacing.md,
  },
  activeStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSubtle,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: radii.sm,
    gap: 4,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  activeStatusText: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: '600',
    color: colors.primaryNavy,
  },
  pedAlertPill: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
  },
  pedAlertText: {
    color: '#B45309',
  },
  pedClearPill: {
    backgroundColor: '#D1FAE5',
    borderColor: '#A7F3D0',
  },
  pedClearText: {
    color: '#047857',
  },
  activeCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryNavy,
    paddingVertical: 12,
    borderRadius: radii.md,
    gap: 8,
  },
  activeCtaBtnText: {
    ...typography.buttonMedium,
    color: colors.white,
    fontWeight: '700',
    fontSize: 13,
  },
});
