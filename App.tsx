import React, { useState, useCallback, createContext, useContext, useEffect, useRef } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme, DarkTheme, CommonActions, NavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import { CustomTabBar } from './src/components/navigation';
import { RBACProvider } from './src/context/RBACContext';
import { hasCompletedOnboarding, setOnboardingCompleted } from './src/utils/storage';

import { LoginScreen } from './src/screens/LoginScreen';
import { RegisterScreen } from './src/screens/RegisterScreen';
import { ForgotPasswordScreen } from './src/screens/ForgotPasswordScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { EventsScreen } from './src/screens/EventsScreen';
import { EventDetailScreen } from './src/screens/EventDetailScreen';
import { OrganizerEventDetailScreen } from './src/screens/OrganizerEventDetailScreen';
import { ProviderEventDetailScreen } from './src/screens/ProviderEventDetailScreen';
import { CalendarViewScreen } from './src/screens/CalendarViewScreen';
import { OffersScreen } from './src/screens/OffersScreen';
import { OfferDetailScreen } from './src/screens/OfferDetailScreen';
import { MessagesScreen } from './src/screens/MessagesScreen';
import { ChatScreen } from './src/screens/ChatScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { ArtistDetailScreen } from './src/screens/ArtistDetailScreen';
import { ProviderDetailScreen } from './src/screens/ProviderDetailScreen';
import { SearchScreen } from './src/screens/SearchScreen';
import { NotificationsScreen } from './src/screens/NotificationsScreen';
import { CreateEventScreen } from './src/screens/CreateEventScreen';
import { ServiceProvidersScreen } from './src/screens/ServiceProvidersScreen';
import { OperationSubcategoriesScreen } from './src/screens/OperationSubcategoriesScreen';
import { RequestOfferScreen } from './src/screens/RequestOfferScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { EditProfileScreen } from './src/screens/EditProfileScreen';
import { FavoritesScreen } from './src/screens/FavoritesScreen';
import { CategoryRequestScreen } from './src/screens/CategoryRequestScreen';
import { NotificationSettingsScreen } from './src/screens/NotificationSettingsScreen';
import { SecurityScreen } from './src/screens/SecurityScreen';
import { PaymentMethodsScreen } from './src/screens/PaymentMethodsScreen';
import { HelpSupportScreen } from './src/screens/HelpSupportScreen';
import { AboutScreen } from './src/screens/AboutScreen';
import { AddCardScreen } from './src/screens/AddCardScreen';
import { ChangePasswordScreen } from './src/screens/ChangePasswordScreen';
import { QuietHoursScreen } from './src/screens/QuietHoursScreen';
import { ProviderServicesScreen } from './src/screens/ProviderServicesScreen';
import { ContractScreen } from './src/screens/ContractScreen';
import { ContractsListScreen } from './src/screens/ContractsListScreen';
import { CompareOffersScreen } from './src/screens/CompareOffersScreen';
import { LanguageScreen } from './src/screens/LanguageScreen';
import { CurrencyScreen } from './src/screens/CurrencyScreen';
import { TermsScreen } from './src/screens/TermsScreen';
import { PrivacyPolicyScreen } from './src/screens/PrivacyPolicyScreen';
import { ContactSupportScreen } from './src/screens/ContactSupportScreen';
import TeamScreen from './src/screens/TeamScreen';
import InviteMemberScreen from './src/screens/InviteMemberScreen';
import MemberDetailScreen from './src/screens/MemberDetailScreen';
import { MyReviewsScreen } from './src/screens/MyReviewsScreen';

// Provider-specific screens
import { ArtistRosterScreen } from './src/screens/provider/booking/ArtistRosterScreen';
import { EquipmentInventoryScreen } from './src/screens/provider/technical/EquipmentInventoryScreen';
import { MenuManagementScreen } from './src/screens/provider/catering/MenuManagementScreen';
import { FleetManagementScreen } from './src/screens/provider/transport/FleetManagementScreen';
import { PersonnelManagementScreen } from './src/screens/provider/security/PersonnelManagementScreen';

// Auth Screens
import {
  OnboardingScreen,
  RoleSelectionScreen,
  OrganizerRegistrationScreen,
  ProviderRegistrationScreen,
  RegistrationSuccessScreen,
  AccountPendingScreen,
} from './src/screens/auth';

// App Context
interface AppContextType {
  isProviderMode: boolean;
  toggleMode: () => void;
  canSwitchMode: boolean; // Only users with dual access can switch
}

export const AppContext = createContext<AppContextType>({
  isProviderMode: false,
  toggleMode: () => {},
  canSwitchMode: true, // Default to true for demo
});

export const useApp = () => useContext(AppContext);

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Home Stack
function HomeStack() {
  const { isProviderMode } = useApp();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain">
        {() => <HomeScreen isProviderMode={isProviderMode} />}
      </Stack.Screen>
      <Stack.Screen name="ArtistDetail" component={ArtistDetailScreen} />
      <Stack.Screen name="ProviderDetail" component={ProviderDetailScreen} />
      <Stack.Screen name="Search" component={SearchScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="CreateEvent" component={CreateEventScreen} />
      <Stack.Screen name="ServiceProviders" component={ServiceProvidersScreen} />
      <Stack.Screen name="OperationSubcategories" component={OperationSubcategoriesScreen} />
      <Stack.Screen name="RequestOffer" component={RequestOfferScreen} />
      <Stack.Screen name="CategoryRequest" component={CategoryRequestScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="OfferDetail" component={OfferDetailScreen} />
      <Stack.Screen name="Contract" component={ContractScreen} />
      <Stack.Screen name="ProviderEventDetail" component={ProviderEventDetailScreen} />
      <Stack.Screen name="OrganizerEventDetail" component={OrganizerEventDetailScreen} />
    </Stack.Navigator>
  );
}

// Events Stack
function EventsStack() {
  const { isProviderMode } = useApp();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="EventsMain">
        {() => <EventsScreen isProviderMode={isProviderMode} />}
      </Stack.Screen>
      <Stack.Screen name="EventDetail" component={EventDetailScreen} />
      <Stack.Screen name="OrganizerEventDetail" component={OrganizerEventDetailScreen} />
      <Stack.Screen name="ProviderEventDetail" component={ProviderEventDetailScreen} />
      <Stack.Screen name="CalendarView">
        {() => <CalendarViewScreen isProviderMode={isProviderMode} />}
      </Stack.Screen>
      <Stack.Screen name="ProviderDetail" component={ProviderDetailScreen} />
      <Stack.Screen name="CreateEvent" component={CreateEventScreen} />
      <Stack.Screen name="ServiceProviders" component={ServiceProvidersScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="OfferDetail" component={OfferDetailScreen} />
      <Stack.Screen name="Contract" component={ContractScreen} />
    </Stack.Navigator>
  );
}

// Offers Stack
function OffersStack() {
  const { isProviderMode } = useApp();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="OffersMain">
        {() => <OffersScreen isProviderMode={isProviderMode} />}
      </Stack.Screen>
      <Stack.Screen name="OfferDetail" component={OfferDetailScreen} />
      <Stack.Screen name="CompareOffers" component={CompareOffersScreen} />
      <Stack.Screen name="Contract" component={ContractScreen} />
      <Stack.Screen name="Contracts">
        {() => <ContractsListScreen isProviderMode={isProviderMode} />}
      </Stack.Screen>
      <Stack.Screen name="OrganizerEventDetail" component={OrganizerEventDetailScreen} />
      <Stack.Screen name="ProviderDetail" component={ProviderDetailScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
    </Stack.Navigator>
  );
}

// Messages Stack
function MessagesStack() {
  const { isProviderMode } = useApp();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MessagesMain">
        {() => <MessagesScreen isProviderMode={isProviderMode} />}
      </Stack.Screen>
      <Stack.Screen name="Chat" component={ChatScreen} />
    </Stack.Navigator>
  );
}

// Profile Stack
function ProfileStack({ onLogout }: { onLogout: () => void }) {
  const { isProviderMode, toggleMode } = useApp();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileMain">
        {() => (
          <ProfileScreen
            isProviderMode={isProviderMode}
            onToggleMode={toggleMode}
            onLogout={onLogout}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="Settings">
        {() => <SettingsScreen onLogout={onLogout} />}
      </Stack.Screen>
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="Favorites" component={FavoritesScreen} />
      <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
      <Stack.Screen name="Security" component={SecurityScreen} />
      <Stack.Screen name="PaymentMethods" component={PaymentMethodsScreen} />
      <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
      <Stack.Screen name="About" component={AboutScreen} />
      <Stack.Screen name="ArtistDetail" component={ArtistDetailScreen} />
      <Stack.Screen name="ProviderDetail" component={ProviderDetailScreen} />
      <Stack.Screen name="AddCard" component={AddCardScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      <Stack.Screen name="QuietHours" component={QuietHoursScreen} />
      <Stack.Screen name="ProviderServices" component={ProviderServicesScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="Contract" component={ContractScreen} />
      <Stack.Screen name="Contracts">
        {() => <ContractsListScreen isProviderMode={isProviderMode} />}
      </Stack.Screen>
      <Stack.Screen name="Language" component={LanguageScreen} />
      <Stack.Screen name="Currency" component={CurrencyScreen} />
      <Stack.Screen name="Terms" component={TermsScreen} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
      <Stack.Screen name="ContactSupport" component={ContactSupportScreen} />
      <Stack.Screen name="Team" component={TeamScreen} />
      <Stack.Screen name="InviteMember" component={InviteMemberScreen} />
      <Stack.Screen name="MemberDetail" component={MemberDetailScreen} />
      <Stack.Screen name="MyReviews" component={MyReviewsScreen} />
      {/* Provider-specific management screens */}
      <Stack.Screen name="ArtistRoster" component={ArtistRosterScreen} />
      <Stack.Screen name="EquipmentInventory" component={EquipmentInventoryScreen} />
      <Stack.Screen name="MenuManagement" component={MenuManagementScreen} />
      <Stack.Screen name="FleetManagement" component={FleetManagementScreen} />
      <Stack.Screen name="PersonnelManagement" component={PersonnelManagementScreen} />
    </Stack.Navigator>
  );
}

// Main Tab Navigator
function MainTabs({ onLogout }: { onLogout: () => void }) {
  const { isProviderMode } = useApp();

  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        options={{ tabBarLabel: 'Ana Sayfa' }}
      />
      <Tab.Screen
        name="EventsTab"
        component={EventsStack}
        options={{ tabBarLabel: isProviderMode ? 'İşlerim' : 'Etkinlikler' }}
      />
      <Tab.Screen
        name="OffersTab"
        component={OffersStack}
        options={{ tabBarLabel: 'Teklifler' }}
      />
      <Tab.Screen
        name="MessagesTab"
        component={MessagesStack}
        options={{ tabBarLabel: 'Mesajlar' }}
      />
      <Tab.Screen
        name="ProfileTab"
        options={{ tabBarLabel: 'Profil' }}
      >
        {() => <ProfileStack onLogout={onLogout} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

// Auth Stack Navigator
function AuthStack({ onLogin }: { onLogin: (asProvider: boolean) => void }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login">
        {() => <LoginScreen onLogin={onLogin} />}
      </Stack.Screen>
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
      <Stack.Screen name="OrganizerRegistration" component={OrganizerRegistrationScreen} />
      <Stack.Screen name="ProviderRegistration" component={ProviderRegistrationScreen} />
      <Stack.Screen name="RegistrationSuccess" component={RegistrationSuccessScreen} />
      <Stack.Screen name="AccountPending">
        {() => <AccountPendingScreen onLogout={() => {}} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

// Custom Navigation Themes
const CustomDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#09090b',
    card: '#18181b',
    text: '#fafafa',
    border: 'rgba(255, 255, 255, 0.08)',
    primary: '#9333ea',
  },
};

const CustomLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#ffffff',
    card: '#ffffff',
    text: '#18181b',
    border: 'rgba(0, 0, 0, 0.08)',
    primary: '#7c3aed',
  },
};

// App Content with Theme
function AppContent() {
  const { colors: themeColors, isDark } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [hasOnboarded, setHasOnboarded] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isProviderMode, setIsProviderMode] = useState(false);
  const [accountStatus, setAccountStatus] = useState<'pending' | 'approved'>('approved');
  const [navigationKey, setNavigationKey] = useState(0); // Key to force navigation reset
  const [canSwitchMode, setCanSwitchMode] = useState(true); // Demo: allow switching for all users
  const navigationRef = useRef<NavigationContainerRef<any>>(null);

  // Check onboarding status on mount
  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    const completed = await hasCompletedOnboarding();
    setHasOnboarded(completed);
    setIsLoading(false);
  };

  const handleOnboardingComplete = useCallback(() => {
    setHasOnboarded(true);
  }, []);

  const handleLogin = useCallback((asProvider: boolean) => {
    setIsLoggedIn(true);
    setIsProviderMode(asProvider);
    // In a real app, check account status from API
    setAccountStatus('approved');
    // In a real app, this would come from the user's profile
    // setCanSwitchMode(user.hasProviderAccess && user.hasOrganizerAccess);
    setCanSwitchMode(true); // Demo: allow for all
  }, []);

  const handleLogout = useCallback(() => {
    setIsLoggedIn(false);
    setIsProviderMode(false);
    setAccountStatus('approved');
    setNavigationKey(prev => prev + 1); // Reset navigation on logout
  }, []);

  const toggleMode = useCallback(() => {
    setIsProviderMode(prev => !prev);
    // Increment key to force NavigationContainer to remount and reset all stacks
    setNavigationKey(prev => prev + 1);
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: isDark ? '#09090b' : '#ffffff' }}>
        <ActivityIndicator size="large" color={isDark ? '#9333ea' : '#7c3aed'} />
      </View>
    );
  }

  // Onboarding (first time users)
  if (!hasOnboarded) {
    return (
      <>
        <StatusBar style="light" />
        <OnboardingScreen onComplete={handleOnboardingComplete} />
      </>
    );
  }

  // Not logged in - show auth screens
  if (!isLoggedIn) {
    return (
      <>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <NavigationContainer theme={isDark ? CustomDarkTheme : CustomLightTheme}>
          <AuthStack onLogin={handleLogin} />
        </NavigationContainer>
      </>
    );
  }

  // Provider with pending account
  if (isProviderMode && accountStatus === 'pending') {
    return (
      <>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <AccountPendingScreen onLogout={handleLogout} />
      </>
    );
  }

  // Logged in - show main app
  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <AppContext.Provider value={{ isProviderMode, toggleMode, canSwitchMode }}>
        <RBACProvider isProvider={isProviderMode}>
          <NavigationContainer
            ref={navigationRef}
            key={navigationKey}
            theme={isDark ? CustomDarkTheme : CustomLightTheme}
          >
            <MainTabs onLogout={handleLogout} />
          </NavigationContainer>
        </RBACProvider>
      </AppContext.Provider>
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
