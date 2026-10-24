import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../../types/navigation';
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

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type OnboardingRouteProp = RouteProp<RootStackParamList, 'InsuredOnboarding'>;

const RELATION_OPTIONS: { id: InsuredRelation; label: string; icon: string; desc: string }[] = [
  { id: 'self', label: 'Self', icon: 'account', desc: 'Cover for yourself' },
  { id: 'spouse', label: 'Spouse', icon: 'account-heart', desc: 'Partner coverage' },
  { id: 'son', label: 'Son', icon: 'human-male-boy', desc: 'Child health cover' },
  { id: 'daughter', label: 'Daughter', icon: 'human-female-girl', desc: 'Child health cover' },
  { id: 'father', label: 'Father', icon: 'account-tie', desc: 'Senior care policy' },
  { id: 'mother', label: 'Mother', icon: 'account-cowboy-hat', desc: 'Senior care policy' },
];

export const HEALTH_INSURANCE_CHOICES: {
  id: CategoryId | 'senior' | 'family';
  title: string;
  badge: string;
  tagline: string;
  icon: string;
}[] = [
  {
    id: 'health',
    title: 'Medical / Health Insurance',
    badge: '10,000+ Hospitals',
    tagline: 'Comprehensive hospitalization, ICU, day-care & unlimited restore',
    icon: 'heart-pulse',
  },
  {
    id: 'term_assurance',
    title: 'Term Life Insurance',
    badge: '₹1 Cr+ Cover',
    tagline: 'High sum assured pure protection cover for family future safety',
    icon: 'shield-account',
  },
  {
    id: 'accident',
    title: 'Personal Accident Policy',
    badge: '24x7 Worldwide',
    tagline: 'Permanent disability, fractures, emergency medical & income loss',
    icon: 'shield-alert',
  },
  {
    id: 'senior',
    title: 'Senior Citizen Health',
    badge: 'Age 60+ Covered',
    tagline: 'Specialized medical coverage for parents with minimal waiting periods',
    icon: 'human-cane',
  },
  {
    id: 'family',
    title: 'Family Floater Health',
    badge: 'Shared Floater',
    tagline: 'Single affordable sum insured covering spouse & children together',
    icon: 'account-group',
  },
  {
    id: 'mediclaim',
    title: 'Mediclaim',
    badge: 'Hospital Bills',
    tagline: 'Direct hospitalization bill reimbursement & in-patient surgery costs',
    icon: 'medical-bag',
  },
  {
    id: 'travel',
    title: 'Travel Medical Insurance',
    badge: 'Schengen Compliant',
    tagline: 'Emergency international medical hospitalization & baggage protection',
    icon: 'airplane',
  },
];

const COMMON_CONDITIONS = [
  'Diabetes',
  'Hypertension (BP)',
  'Asthma',
  'Thyroid',
  'Heart Condition',
  'Prior Surgery',
];

const TOTAL_STEPS = 4;

export const InsuredOnboardingScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<OnboardingRouteProp>();
  const isEditing = route.params?.isEditing;

  const { user } = useAuthStore();
  const { profile, submitProfile } = useInsuredProfileStore();

  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form states
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
  const [selectedType, setSelectedType] = useState<CategoryId | 'senior' | 'family'>(
    profile.insuranceType || 'health'
  );

  // Step transition animations
  const stepFadeAnim = useRef(new Animated.Value(1)).current;
  const stepTranslateX = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0.25)).current;
  const scrollViewRef = useRef<ScrollView>(null);

  // Animate progress whenever step changes
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: currentStep / TOTAL_STEPS,
      duration: 350,
      useNativeDriver: false,
    }).start();

    // Scroll to top on step transition
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  }, [currentStep]);

  const transitionToStep = (newStep: number, direction: 'forward' | 'backward') => {
    Animated.sequence([
      Animated.timing(stepFadeAnim, {
        toValue: 0,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setCurrentStep(newStep);
      stepTranslateX.setValue(direction === 'forward' ? 20 : -20);
      Animated.parallel([
        Animated.timing(stepFadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(stepTranslateX, {
          toValue: 0,
          friction: 8,
          tension: 50,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const handlePincodeChange = (val: string) => {
    setPincode(val);
    if (!city || city === 'Delhi NCR') {
      if (val.startsWith('11')) setCity('Delhi NCR');
      else if (val.startsWith('40')) setCity('Mumbai');
      else if (val.startsWith('56')) setCity('Bengaluru');
      else if (val.startsWith('50')) setCity('Hyderabad');
      else if (val.startsWith('60')) setCity('Chennai');
      else if (val.startsWith('70')) setCity('Kolkata');
      else if (val.startsWith('38')) setCity('Ahmedabad');
      else if (val.startsWith('41')) setCity('Pune');
      else if (val.startsWith('30')) setCity('Jaipur');
      else if (val.startsWith('22')) setCity('Lucknow');
    }
  };

  const handleRelationChange = (rel: InsuredRelation) => {
    setRelation(rel);
    if (rel === 'self') {
      if (!fullName && profile?.fullName) setFullName(profile.fullName);
      else if (!fullName && user?.fullName && user.fullName !== 'Aarav Mehta') setFullName(user.fullName);
      if (!age) setAge('32');
    } else if (rel === 'father') {
      if (!fullName) setFullName('Rajesh Mehta');
      if (!age || parseInt(age, 10) < 55) setAge('62');
      setGender('male');
      setSelectedType('senior');
    } else if (rel === 'mother') {
      if (!fullName) setFullName('Sunita Mehta');
      if (!age || parseInt(age, 10) < 55) setAge('60');
      setGender('female');
      setSelectedType('senior');
    } else if (rel === 'spouse') {
      if (!fullName) setFullName('Pooja Mehta');
      if (!age) setAge('30');
      setGender('female');
      setSelectedType('family');
    } else if (rel === 'son') {
      if (!fullName) setFullName('Aarav Mehta');
      if (!age) setAge('8');
      setGender('male');
      setSelectedType('family');
    } else if (rel === 'daughter') {
      if (!fullName) setFullName('Ananya Mehta');
      if (!age) setAge('6');
      setGender('female');
      setSelectedType('family');
    }
    if (!pincode) {
      setPincode('110001');
      setCity('Delhi NCR');
    }
  };

  const toggleConditionChip = (cond: string) => {
    setHasPed(true);
    if (pedDetails.includes(cond)) {
      const updated = pedDetails
        .replace(new RegExp(`(?:^|,\\s*)${cond}`, 'gi'), '')
        .trim()
        .replace(/^,\s*/, '');
      setPedDetails(updated);
      if (!updated) setHasPed(false);
    } else {
      const updated = pedDetails ? `${pedDetails}, ${cond}` : cond;
      setPedDetails(updated);
    }
  };

  const validateAndAdvance = () => {
    if (currentStep === 1) {
      transitionToStep(2, 'forward');
    } else if (currentStep === 2) {
      if (!fullName.trim()) {
        Alert.alert('Name Required', 'Please enter the insured person’s full name to continue.');
        return;
      }
      const ageNum = parseInt(age, 10);
      if (!age.trim() || isNaN(ageNum) || ageNum < 1 || ageNum > 105) {
        Alert.alert('Valid Age Required', 'Please provide a valid age between 1 and 105.');
        return;
      }
      if (!pincode.trim() || pincode.trim().length < 6) {
        Alert.alert('6-Digit PIN Code Required', 'Please provide a valid 6-digit postal code.');
        return;
      }
      transitionToStep(3, 'forward');
    } else if (currentStep === 3) {
      if (hasPed && !pedDetails.trim()) {
        Alert.alert(
          'Condition Details',
          'Please specify the condition or medication name, or deselect if not applicable.'
        );
        return;
      }
      transitionToStep(4, 'forward');
    } else if (currentStep === 4) {
      handleSubmit();
    }
  };

  const handleStepBack = () => {
    if (currentStep > 1) {
      transitionToStep(currentStep - 1, 'backward');
    } else if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      handleSkip();
    }
  };

  const handleSubmit = async () => {
    const resolvedName =
      fullName.trim() || `${relation.charAt(0).toUpperCase() + relation.slice(1)} (Insured)`;
    let ageNum = parseInt(age, 10);
    if (isNaN(ageNum) || ageNum < 1 || ageNum > 100) {
      ageNum = relation === 'father' || relation === 'mother' ? 62 : 30;
    }
    const resolvedPin = pincode.trim().length >= 6 ? pincode.trim() : '110001';
    const resolvedCity = city.trim() || 'Delhi NCR';

    const payload: Partial<InsuredProfileData> = {
      relation,
      fullName: resolvedName,
      age: String(ageNum),
      gender,
      pincode: resolvedPin,
      city: resolvedCity,
      phone: phone.trim(),
      email: user?.email || '',
      hasPreExistingConditions: hasPed,
      preExistingDetails: hasPed ? pedDetails.trim() : '',
      tobaccoUser,
      insuranceType: selectedType,
    };

    await submitProfile(payload);

    // Synchronize name to auth store so that the entered name appears on Profile, Card, and Greetings
    const authUser = useAuthStore.getState().user;
    if (authUser) {
      useAuthStore.getState().updateUserProfile({
        fullName: resolvedName,
        city: resolvedCity,
      });
    }

    if (isEditing && navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('MainTabs', { screen: 'HomeTab' } as any);
    }
  };

  const handleSkip = () => {
    if (isEditing && navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('MainTabs', { screen: 'HomeTab' } as any);
    }
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return 'Who are you insuring?';
      case 2:
        return `Tell us about ${relation === 'self' ? 'yourself' : relation}`;
      case 3:
        return 'Health & Lifestyle Check';
      case 4:
        return 'Select Your Coverage Goal';
      default:
        return 'Personalized Insurance Intake';
    }
  };

  const getStepSubtitle = () => {
    switch (currentStep) {
      case 1:
        return 'Choose who this insurance policy will primarily protect';
      case 2:
        return 'Required to calculate IRDAI regulated rates and local network hospitals';
      case 3:
        return 'Ensures 100% cashless claims guarantee and waiting-period waivers';
      case 4:
        return 'Select the protection type you want to explore and compare';
      default:
        return '';
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Top App Header with Brand and Skip / Back */}
        <View style={styles.topHeader}>
          <TouchableOpacity
            onPress={handleStepBack}
            style={styles.backBtn}
            accessibilityLabel="Go back or previous step"
          >
            <Ionicons name="arrow-back" size={22} color={colors.primaryNavy} />
          </TouchableOpacity>

          <View style={styles.headerTextGroup}>
            <Text style={styles.headerBrandTitle}>InsureEase</Text>
            <Text style={styles.headerSubtitle}>Step-by-step Intake & Live Tracking</Text>
          </View>

          <TouchableOpacity
            testID="skip-onboarding-btn"
            accessibilityRole="button"
            onPress={handleSkip}
            style={styles.skipBtn}
            accessibilityLabel="Skip step"
          >
            <Text style={styles.skipBtnText}>{isEditing ? 'Cancel' : 'Skip'}</Text>
          </TouchableOpacity>
        </View>

        {/* ─── CONTINUOUS PROGRESS TRACKER HEADER ─── */}
        <View style={styles.stepperContainer}>
          {/* Status Row with Step Count & Completion Badge */}
          <View style={styles.trackerStatusRow}>
            <View style={styles.stepCountBadge}>
              <Text style={styles.stepCountBadgeText}>
                STEP {currentStep} OF {TOTAL_STEPS}
              </Text>
            </View>
            <View style={styles.completionPill}>
              <Ionicons name="shield-checkmark" size={12} color={colors.primaryBlue} />
              <Text style={styles.completionPillText}>
                {currentStep === 1
                  ? '25% Tracked'
                  : currentStep === 2
                  ? '50% Tracked'
                  : currentStep === 3
                  ? '75% Tracked'
                  : '100% Ready'}
              </Text>
            </View>
          </View>

          {/* Step Timeline Indicator */}
          <View style={styles.timelineRow}>
            {[
              { num: 1, label: 'Member', icon: 'account' },
              { num: 2, label: 'Profile', icon: 'card-account-details' },
              { num: 3, label: 'Health', icon: 'heart-pulse' },
              { num: 4, label: 'Coverage', icon: 'shield-check' },
            ].map((stepItem, idx) => {
              const isCompleted = stepItem.num < currentStep;
              const isActive = stepItem.num === currentStep;

              return (
                <React.Fragment key={stepItem.num}>
                  {idx > 0 && (
                    <View
                      style={[
                        styles.timelineConnector,
                        isCompleted && styles.timelineConnectorDone,
                      ]}
                    />
                  )}
                  <TouchableOpacity
                    activeOpacity={0.8}
                    disabled={stepItem.num > currentStep}
                    onPress={() => {
                      if (stepItem.num < currentStep) {
                        transitionToStep(stepItem.num, 'backward');
                      }
                    }}
                    style={styles.timelineStepTouch}
                  >
                    <View
                      style={[
                        styles.timelineNode,
                        isActive && styles.timelineNodeActive,
                        isCompleted && styles.timelineNodeCompleted,
                      ]}
                    >
                      {isCompleted ? (
                        <Ionicons name="checkmark" size={13} color={colors.white} />
                      ) : (
                        <Text
                          style={[
                            styles.timelineNodeNumber,
                            isActive && styles.timelineNodeNumberActive,
                          ]}
                        >
                          {stepItem.num}
                        </Text>
                      )}
                    </View>
                    <Text
                      style={[
                        styles.timelineLabel,
                        isActive && styles.timelineLabelActive,
                        isCompleted && styles.timelineLabelCompleted,
                      ]}
                    >
                      {stepItem.label}
                    </Text>
                  </TouchableOpacity>
                </React.Fragment>
              );
            })}
          </View>

          {/* Animated Continuous Progress Bar */}
          <View style={styles.progressBarTrack}>
            <Animated.View style={[styles.progressBarFill, { width: progressWidth }]} />
          </View>

          {/* Live Tracked Details Chip (Shows real-time recorded information) */}
          <View style={styles.liveDetailsChip}>
            <View style={styles.livePulseDot} />
            <Text style={styles.liveChipTitle}>Live Tracked:</Text>
            <Text style={styles.liveChipContent} numberOfLines={1}>
              {currentStep === 1
                ? `Covering ${relation.toUpperCase()}`
                : currentStep === 2
                ? `${fullName || 'Insured'} • ${relation.toUpperCase()}`
                : currentStep === 3
                ? `${fullName || 'Insured'} • ${age || 30} yrs • ${city || 'Delhi NCR'}`
                : `${fullName || 'Insured'} • ${age || 30} yrs • ${
                    hasPed ? 'Pre-existing noted' : 'Healthy'
                  } • ${tobaccoUser ? 'Smoker' : 'Non-tobacco'}`}
            </Text>
          </View>
        </View>

        {/* ─── STEP CONTENT CONTAINER ─── */}
        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Animated Hero Header */}
          <Animated.View
            style={[
              styles.stepHeroCard,
              {
                opacity: stepFadeAnim,
                transform: [{ translateX: stepTranslateX }],
              },
            ]}
          >
            <Text style={styles.stepHeroTitle}>{getStepTitle()}</Text>
            <Text style={styles.stepHeroSubtitle}>{getStepSubtitle()}</Text>
          </Animated.View>

          {/* STEP 1: RELATION SELECTION */}
          {currentStep === 1 && (
            <Animated.View
              style={[
                styles.stepSection,
                {
                  opacity: stepFadeAnim,
                  transform: [{ translateX: stepTranslateX }],
                },
              ]}
            >
              <Text style={styles.subHeading}>Choose the primary covered person:</Text>
              <View style={styles.relationGrid}>
                {RELATION_OPTIONS.map((item) => {
                  const isSelected = relation === item.id;
                  return (
                    <TouchableOpacity
                      key={item.id}
                      activeOpacity={0.8}
                      onPress={() => handleRelationChange(item.id)}
                      style={[styles.relationCard, isSelected && styles.relationCardSelected]}
                    >
                      <View
                        style={[
                          styles.relationIconBox,
                          isSelected && styles.relationIconBoxSelected,
                        ]}
                      >
                        <MaterialCommunityIcons
                          name={item.icon as any}
                          size={24}
                          color={isSelected ? colors.white : colors.primaryNavy}
                        />
                      </View>
                      <Text
                        style={[
                          styles.relationLabel,
                          isSelected && styles.relationLabelSelected,
                        ]}
                      >
                        {item.label}
                      </Text>
                      <Text style={styles.relationDesc}>{item.desc}</Text>
                      {isSelected && (
                        <View style={styles.selectedCheckBadge}>
                          <Ionicons name="checkmark-circle" size={16} color={colors.primaryBlue} />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={styles.infoTipBox}>
                <Ionicons name="bulb-outline" size={16} color={colors.primaryBlue} />
                <Text style={styles.infoTipText}>
                  Tip: Selecting Father or Mother automatically unlocks senior citizen plans with reduced waiting periods.
                </Text>
              </View>
            </Animated.View>
          )}

          {/* STEP 2: PERSONAL INFORMATION */}
          {currentStep === 2 && (
            <Animated.View
              style={[
                styles.stepSection,
                {
                  opacity: stepFadeAnim,
                  transform: [{ translateX: stepTranslateX }],
                },
              ]}
            >
              <View style={styles.card}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Full Name of Insured Person *</Text>
                  <TextInput
                    value={fullName}
                    onChangeText={setFullName}
                    placeholder="e.g. Ayush"
                    placeholderTextColor={colors.textMuted}
                    style={styles.textInput}
                    autoCapitalize="words"
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
                      maxLength={3}
                      style={styles.textInput}
                    />
                  </View>

                  <View style={{ flex: 1.3 }}>
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
                            <Text
                              style={[
                                styles.genderBtnText,
                                active && styles.genderBtnTextActive,
                              ]}
                            >
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
                    <Text style={styles.inputLabel}>6-Digit PIN Code *</Text>
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

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Contact Phone Number (Optional)</Text>
                  <TextInput
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="10-digit mobile number"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="phone-pad"
                    maxLength={10}
                    style={styles.textInput}
                  />
                </View>
              </View>

              <View style={styles.trackedSummaryCard}>
                <Ionicons name="shield-checkmark-outline" size={18} color="#059669" />
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={styles.trackedSummaryTitle}>IRDAI Geolocation Notice</Text>
                  <Text style={styles.trackedSummaryText}>
                    PIN code is used to match cashless hospitals in your zone (Zone 1/2) for zero co-payment.
                  </Text>
                </View>
              </View>
            </Animated.View>
          )}

          {/* STEP 3: HEALTH & LIFESTYLE */}
          {currentStep === 3 && (
            <Animated.View
              style={[
                styles.stepSection,
                {
                  opacity: stepFadeAnim,
                  transform: [{ translateX: stepTranslateX }],
                },
              ]}
            >
              <View style={styles.card}>
                <Text style={styles.sectionHeading}>Pre-existing Health Conditions</Text>
                <Text style={styles.sectionSub}>
                  Disclose any diagnosed medical conditions to guarantee dispute-free claims
                </Text>

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
                    <Text style={styles.checkboxTitle}>
                      Any Pre-existing Medical Conditions?
                    </Text>
                    <Text style={styles.checkboxSubtitle}>
                      Diabetes, Hypertension, Heart disease, Asthma, Thyroid, or prior surgeries
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Quick Condition Chips */}
                <View style={styles.conditionChipsContainer}>
                  <Text style={styles.chipsSectionLabel}>Quick Select Common Conditions:</Text>
                  <View style={styles.chipsRow}>
                    {COMMON_CONDITIONS.map((cond) => {
                      const isSelected = pedDetails.includes(cond);
                      return (
                        <TouchableOpacity
                          key={cond}
                          onPress={() => toggleConditionChip(cond)}
                          style={[styles.condChip, isSelected && styles.condChipSelected]}
                        >
                          <Ionicons
                            name={isSelected ? 'checkmark-circle' : 'add-circle-outline'}
                            size={14}
                            color={isSelected ? colors.white : colors.primaryNavy}
                          />
                          <Text
                            style={[
                              styles.condChipText,
                              isSelected && styles.condChipTextSelected,
                            ]}
                          >
                            {cond}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {hasPed && (
                  <View style={styles.specifyBox}>
                    <Text style={styles.specifyLabel}>
                      Specify medication details or condition duration *
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

              {/* Tobacco Lifestyle Card */}
              <View style={styles.card}>
                <View style={styles.tobaccoRow}>
                  <View style={{ flex: 1, paddingRight: spacing.sm }}>
                    <Text style={styles.tobaccoTitle}>Tobacco / Smoking Habit</Text>
                    <Text style={styles.tobaccoDesc}>
                      Non-smokers receive up to 20% lower premium pricing on pure term life plans
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setTobaccoUser(!tobaccoUser)}
                    style={[styles.toggleBtn, tobaccoUser && styles.toggleBtnActive]}
                  >
                    <Text
                      style={[styles.toggleBtnText, tobaccoUser && styles.toggleBtnTextActive]}
                    >
                      {tobaccoUser ? 'Smoker' : 'Non-Smoker'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>
          )}

          {/* STEP 4: COVERAGE GOAL SELECTION & FINAL REVIEW */}
          {currentStep === 4 && (
            <Animated.View
              style={[
                styles.stepSection,
                {
                  opacity: stepFadeAnim,
                  transform: [{ translateX: stepTranslateX }],
                },
              ]}
            >
              {/* Review of Tracked Details */}
              <View style={styles.finalReviewCard}>
                <View style={styles.finalReviewHeader}>
                  <View style={styles.finalReviewIcon}>
                    <Ionicons name="checkmark-done-circle" size={20} color="#059669" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.finalReviewTitle}>Profile Verified & Tracked</Text>
                    <Text style={styles.finalReviewSubtitle}>
                      {fullName} ({relation.toUpperCase()}) • Age {age || 30} • {city || 'Delhi NCR'}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => transitionToStep(2, 'backward')}
                    style={styles.editBadge}
                  >
                    <Text style={styles.editBadgeText}>Edit</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.finalReviewTagsRow}>
                  <View style={styles.finalTag}>
                    <Text style={styles.finalTagText}>
                      PIN: {pincode || '110001'}
                    </Text>
                  </View>
                  <View style={styles.finalTag}>
                    <Text style={styles.finalTagText}>
                      {hasPed ? 'With Pre-existing Disclosed' : 'No Pre-existing Conditions'}
                    </Text>
                  </View>
                  <View style={styles.finalTag}>
                    <Text style={styles.finalTagText}>
                      {tobaccoUser ? 'Smoker' : 'Non-Smoker'}
                    </Text>
                  </View>
                </View>
              </View>

              <Text style={styles.subHeading}>
                Select the primary insurance plan type you want tailored recommendations for:
              </Text>

              <View style={styles.insuranceChoicesList}>
                {HEALTH_INSURANCE_CHOICES.map((choice) => {
                  const isSelected = selectedType === choice.id;
                  return (
                    <TouchableOpacity
                      key={choice.id}
                      activeOpacity={0.8}
                      onPress={() => setSelectedType(choice.id)}
                      style={[
                        styles.choiceCard,
                        isSelected && styles.choiceCardSelected,
                      ]}
                    >
                      <View style={styles.choiceCardTop}>
                        <View
                          style={[
                            styles.choiceIconBox,
                            isSelected && styles.choiceIconBoxSelected,
                          ]}
                        >
                          <MaterialCommunityIcons
                            name={choice.icon as any}
                            size={22}
                            color={isSelected ? colors.white : colors.primaryBlue}
                          />
                        </View>
                        <View
                          style={[
                            styles.choiceBadge,
                            isSelected && styles.choiceBadgeSelected,
                          ]}
                        >
                          <Text
                            style={[
                              styles.choiceBadgeText,
                              isSelected && styles.choiceBadgeTextSelected,
                            ]}
                          >
                            {choice.badge}
                          </Text>
                        </View>
                      </View>

                      <Text
                        style={[styles.choiceTitle, isSelected && styles.choiceTitleSelected]}
                      >
                        {choice.title}
                      </Text>
                      <Text style={styles.choiceTagline}>{choice.tagline}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Animated.View>
          )}
        </ScrollView>

        {/* ─── BOTTOM STICKY ACTION BAR ─── */}
        <View style={styles.bottomBar}>
          {currentStep > 1 && (
            <TouchableOpacity
              onPress={handleStepBack}
              style={styles.secondaryBackBtn}
              accessibilityLabel="Previous step"
            >
              <Ionicons name="arrow-back" size={16} color={colors.primaryNavy} />
              <Text style={styles.secondaryBackBtnText}>Back</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            testID={currentStep === 4 ? 'submit-onboarding-btn' : 'continue-step-btn'}
            accessibilityRole="button"
            activeOpacity={0.85}
            onPress={validateAndAdvance}
            style={[styles.primaryActionBtn, currentStep === 1 && { flex: 1 }]}
          >
            <Text style={styles.primaryActionBtnText}>
              {currentStep === 1
                ? 'Continue to Profile'
                : currentStep === 2
                ? 'Continue to Health Check'
                : currentStep === 3
                ? 'Continue to Coverage'
                : 'See Tailored Recommendations'}
            </Text>
            <Ionicons name="arrow-forward" size={16} color={colors.white} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  backBtn: {
    marginRight: spacing.sm,
    padding: 6,
    borderRadius: radii.full,
    backgroundColor: '#F1F5F9',
  },
  headerTextGroup: {
    flex: 1,
  },
  headerBrandTitle: {
    ...typography.h3,
    fontSize: 18,
    fontWeight: '800',
    color: colors.primaryNavy,
  },
  headerSubtitle: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textSecondary,
  },
  skipBtn: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
  },
  skipBtnText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textSecondary,
  },

  // Continuous Progress Tracker Styles
  stepperContainer: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  trackerStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepCountBadge: {
    backgroundColor: '#EFF6FF',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: radii.sm,
  },
  stepCountBadgeText: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '800',
    color: colors.primaryBlue,
    letterSpacing: 0.5,
  },
  completionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  completionPillText: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: '700',
    color: colors.primaryBlue,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
    marginBottom: 8,
  },
  timelineStepTouch: {
    alignItems: 'center',
    width: 60,
  },
  timelineNode: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#F1F5F9',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 3,
  },
  timelineNodeActive: {
    backgroundColor: colors.primaryBlue,
    borderColor: '#93C5FD',
    shadowColor: colors.primaryBlue,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  timelineNodeCompleted: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  timelineNodeNumber: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  timelineNodeNumberActive: {
    color: colors.white,
  },
  timelineLabel: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '600',
    color: colors.textSecondary,
    textAlign: 'center',
  },
  timelineLabelActive: {
    fontWeight: '800',
    color: colors.primaryBlue,
  },
  timelineLabelCompleted: {
    color: '#059669',
  },
  timelineConnector: {
    flex: 1,
    height: 2,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 2,
    marginBottom: 16,
  },
  timelineConnectorDone: {
    backgroundColor: '#10B981',
  },
  progressBarTrack: {
    height: 4,
    backgroundColor: '#F1F5F9',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primaryBlue,
    borderRadius: 2,
  },
  liveDetailsChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: radii.full,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  livePulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  liveChipTitle: {
    ...typography.caption,
    fontSize: 10.5,
    fontWeight: '800',
    color: colors.primaryNavy,
  },
  liveChipContent: {
    ...typography.caption,
    fontSize: 10.5,
    color: colors.textSecondary,
    flex: 1,
  },

  // Scroll and Content
  scrollContent: {
    padding: spacing.md,
    paddingBottom: 110,
  },
  stepHeroCard: {
    backgroundColor: colors.primaryNavy,
    borderRadius: radii.card,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#1E3A8A',
  },
  stepHeroTitle: {
    ...typography.h2,
    fontSize: 20,
    color: colors.white,
    marginBottom: 4,
    fontWeight: '800',
  },
  stepHeroSubtitle: {
    ...typography.bodyMedium,
    fontSize: 12.5,
    color: '#E0E7FF',
    lineHeight: 18,
  },
  subHeading: {
    ...typography.bodyMedium,
    fontWeight: '700',
    color: colors.primaryNavy,
    marginBottom: spacing.sm,
  },
  stepSection: {
    width: '100%',
  },

  // Step 1: Relation Grid
  relationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: spacing.md,
  },
  relationCard: {
    width: '48%',
    backgroundColor: colors.white,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    padding: spacing.sm + 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  relationCardSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: colors.primaryBlue,
  },
  relationIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  relationIconBoxSelected: {
    backgroundColor: colors.primaryBlue,
  },
  relationLabel: {
    ...typography.bodyMedium,
    fontSize: 13,
    fontWeight: '700',
    color: colors.primaryNavy,
  },
  relationLabelSelected: {
    color: colors.primaryBlue,
  },
  relationDesc: {
    ...typography.caption,
    fontSize: 10.5,
    color: colors.textSecondary,
    marginTop: 2,
    textAlign: 'center',
  },
  selectedCheckBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
  },
  infoTipBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#EFF6FF',
    padding: spacing.sm + 2,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  infoTipText: {
    ...typography.caption,
    fontSize: 11.5,
    color: colors.primaryNavy,
    flex: 1,
    lineHeight: 16,
  },

  // Step 2 & 3: Card inputs
  card: {
    backgroundColor: colors.white,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionHeading: {
    ...typography.bodyLarge,
    fontSize: 15,
    fontWeight: '800',
    color: colors.primaryNavy,
    marginBottom: 2,
  },
  sectionSub: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  inputGroup: {
    marginBottom: spacing.sm + 2,
  },
  inputLabel: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  textInput: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: 10,
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },
  twoColRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm + 2,
  },
  genderRow: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 2,
    height: 44,
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
  trackedSummaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    padding: spacing.sm + 2,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    marginBottom: spacing.md,
  },
  trackedSummaryTitle: {
    ...typography.caption,
    fontWeight: '800',
    color: '#065F46',
  },
  trackedSummaryText: {
    ...typography.caption,
    fontSize: 11,
    color: '#047857',
    marginTop: 2,
  },

  // Health & Lifestyle
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: spacing.sm + 2,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: spacing.sm,
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
  conditionChipsContainer: {
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  chipsSectionLabel: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 6,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  condChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F1F5F9',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  condChipSelected: {
    backgroundColor: colors.primaryBlue,
    borderColor: colors.primaryBlue,
  },
  condChipText: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: '600',
    color: colors.primaryNavy,
  },
  condChipTextSelected: {
    color: colors.white,
  },
  specifyBox: {
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
  },
  tobaccoTitle: {
    ...typography.bodySmall,
    fontWeight: '700',
    color: colors.primaryNavy,
  },
  tobaccoDesc: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  toggleBtn: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSubtle,
  },
  toggleBtnActive: {
    backgroundColor: colors.primaryNavy,
    borderColor: colors.primaryNavy,
  },
  toggleBtnText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  toggleBtnTextActive: {
    color: colors.white,
  },

  // Final review card
  finalReviewCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: radii.card,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    marginBottom: spacing.md,
  },
  finalReviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  finalReviewIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  finalReviewTitle: {
    ...typography.bodyMedium,
    fontWeight: '800',
    color: '#166534',
  },
  finalReviewSubtitle: {
    ...typography.caption,
    fontSize: 11.5,
    color: '#15803D',
    fontWeight: '600',
  },
  editBadge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: radii.full,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  editBadgeText: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '800',
    color: '#166534',
  },
  finalReviewTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#DCFCE7',
  },
  finalTag: {
    backgroundColor: colors.white,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  finalTagText: {
    ...typography.caption,
    fontSize: 10,
    color: '#166534',
    fontWeight: '600',
  },

  // Insurance choices list
  insuranceChoicesList: {
    gap: 8,
  },
  choiceCard: {
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radii.md,
    padding: spacing.sm + 2,
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  choiceCardSelected: {
    borderColor: colors.primaryBlue,
    backgroundColor: '#EFF6FF',
    borderWidth: 1.5,
  },
  choiceCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  choiceIconBox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: colors.lightBlueBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  choiceIconBoxSelected: {
    backgroundColor: colors.primaryBlue,
  },
  choiceBadge: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.full,
  },
  choiceBadgeSelected: {
    backgroundColor: colors.lightBlueBg,
  },
  choiceBadgeText: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  choiceBadgeTextSelected: {
    color: colors.primaryBlue,
  },
  choiceTitle: {
    ...typography.bodyMedium,
    fontWeight: '700',
    color: colors.primaryNavy,
    marginTop: 2,
  },
  choiceTitleSelected: {
    color: colors.primaryBlue,
  },
  choiceTagline: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
    lineHeight: 15,
    marginTop: 2,
  },

  // Bottom action bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: Platform.OS === 'ios' ? 24 : spacing.sm + 4,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  secondaryBackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: radii.md,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  secondaryBackBtnText: {
    ...typography.buttonMedium,
    color: colors.primaryNavy,
    fontWeight: '700',
    fontSize: 13,
  },
  primaryActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryBlue,
    borderRadius: radii.md,
    paddingVertical: 13,
    gap: 8,
  },
  primaryActionBtnText: {
    ...typography.buttonMedium,
    color: colors.white,
    fontWeight: '700',
    fontSize: 13.5,
  },
});
