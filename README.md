# InsureEase — All-in-One Indian Insurance Marketplace Mobile App

A complete, production-grade insurance mobile application built for the Indian market using **React Native**, **Expo SDK 58**, and **TypeScript**.

InsureEase lets users discover insurance plans across multiple categories (Health, Term Life, Motor Car/Bike, Travel, Home, Business), get instant indicative quotes, compare policies side-by-side, submit purchase and renewal applications, request policy portability, and manage active policies.

---

## 🚀 Key Highlights & Solved Requirements

1. **Clean & High-Contrast Bottom Navigation Bar**:
   - Fixed tab bar sizing, padding, and iconography so tab labels (**Home**, **Explore**, **My Policies**, **Help**, **Profile**) are 100% visible, sharp, and centered without vertical clipping.
2. **Removed All "Demo Plan • Indicative Only" Badges**:
   - Clean, professional plan presentation across catalog cards, plan details screens, and quote calculation screens.
3. **Universal Back Navigation**:
   - Prominent, functional back buttons on all stack and tab screens with safe fallbacks ensuring the user is never stuck.
4. **Email & Password Authentication**:
   - Primary login mode with prefilled credentials (`demo@insureease.in` / `password123`) and 1-tap demo auto-fill.
   - Retained Phone OTP sign-in as a switchable alternative tab.
   - Pending action preservation: unauthenticated users attempting to Buy, Renew, Port, or View Policies are redirected back to their intended action immediately upon login.
5. **Responsive Mobile Frame on Desktop Web**:
   - Web preview renders in a centered, sleek mobile device container (max-width 480px) with card elevation and smooth scrolling.

---

## 🛠 Tech Stack

- **Framework**: Expo SDK 58 (`expo`, `react-native` 0.83)
- **Language**: TypeScript (`strict: true`, clean typecheck)
- **Navigation**: `@react-navigation/native`, `@react-navigation/native-stack`, `@react-navigation/bottom-tabs`
- **State Management**:
  - `zustand` with persistence (`authStore`, `policyStore`, `compareStore`, `quoteStore`, `faqStore`)
  - `@tanstack/react-query` for API data caching and mutation handling
- **Form Validation**: Form validation utilities with Indian-specific regex (PAN, Aadhaar, Vehicle Reg, PIN code, Mobile, Email)
- **Icons**: `@expo/vector-icons` (Ionicons)
- **Testing**: Node test runner with `tsx` (`tests/`)

---

## 📱 Navigation Structure

```
App
├── RootNavigator
│   ├── MainTabs (BottomTabNavigator)
│   │   ├── HomeTab (HomeScreen)
│   │   ├── ExploreTab (ExploreScreen)
│   │   ├── MyPoliciesTab (MyPoliciesScreen)
│   │   ├── HelpTab (HelpScreen)
│   │   └── ProfileTab (ProfileScreen)
│   ├── PlanCategoryScreen
│   ├── PlanDetailsScreen
│   ├── CompareScreen
│   ├── QuoteInputScreen
│   ├── QuoteEligibilityScreen
│   ├── ApplicationFormScreen
│   ├── ApplicationReviewScreen
│   ├── ApplicationConfirmationScreen
│   ├── PolicyDetailsScreen
│   ├── RenewPolicyScreen
│   ├── PortPolicyScreen
│   ├── ClaimsAssistanceScreen
│   ├── SupportScreen
│   ├── SearchScreen
│   ├── NotificationScreen
│   ├── SettingsScreen
│   └── LoginScreen / OTPVerificationScreen
```

---

## 🔑 Demo Login Credentials

For quick evaluation and testing:
- **Email**: `demo@insureease.in`
- **Password**: `password123`
- **Mobile OTP**: Any 10-digit number (e.g. `9876543210`) with OTP `123456`

---

## 🏃‍♂️ Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or bun

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Dev Server (Web & Mobile)
```bash
# Start Expo Metro bundler
npm run dev
# or
npx expo start --web
```
- Open `http://localhost:8081` or `http://localhost:8082` in your browser.
- Press `i` to open in iOS Simulator (macOS with Xcode).
- Press `a` to open in Android Emulator.
- Scan QR code with the Expo Go app on your physical iOS or Android device.

### 3. Run Tests & Typecheck
```bash
# Run unit test suite
npm test

# Run TypeScript compiler checks
npm run typecheck
```

---

## 📚 Documentation & Specifications

- [API_CONTRACTS.md](file:///Users/anshyadav/Desktop/Insurance_App/API_CONTRACTS.md) — Complete REST API specifications for future backend / microservice implementation.
- [.env.example](file:///Users/anshyadav/Desktop/Insurance_App/.env.example) — Configuration template for backend endpoints and support phone numbers.
