import React, { useState, useCallback, createContext, useContext, useEffect, useRef } from 'react';
import { View, ActivityIndicator } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { initSentry, setUser as setSentryUser, clearUser as clearSentryUser, wrap as sentryWrap } from './src/services/sentry';

// Initialize Sentry before any other code
initSentry();

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme, DarkTheme, CommonActions, NavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import { CustomTabBar } from './src/components/navigation';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { ToastProvider } from './src/components/Toast';
import { NetworkStatusBar } from './src/components/NetworkStatusBar';
import { RBACProvider } from './src/context/RBACContext';
import { ModuleProvider } from './src/context/ModuleContext';
import { AuthProvider } from './src/context/AuthContext';
import { AdminProvider } from './src/context/AdminContext';
import { hasCompletedOnboarding, setOnboardingCompleted } from './src/utils/storage';
import { onAuthChange, getUserProfile, logoutUser, updateUserProfile, UserProfile } from './src/services/firebase';
import { User } from 'firebase/auth';

import { LoginScreen } from './src/screens/LoginScreen';
import { RegisterScreen } from './src/screens/RegisterScreen';
import { ForgotPasswordScreen } from './src/screens/ForgotPasswordScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { EventsScreen } from './src/screens/EventsScreen';
import { EventDetailScreen } from './src/screens/EventDetailScreen';
import { OrganizerEventDetailScreen } from './src/screens/OrganizerEventDetailScreen';
import { ProviderEventDetailScreen } from './src/screens/ProviderEventDetailScreen';
import { OrganizerProfileScreen } from './src/screens/OrganizerProfileScreen';
import { CalendarViewScreen } from './src/screens/CalendarViewScreen';
import { OffersScreen } from './src/screens/OffersScreen';
import { OfferDetailScreen } from './src/screens/OfferDetailScreen';
import { MessagesScreen } from './src/screens/MessagesScreen';
import { ChatScreen } from './src/screens/ChatScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { ArtistDetailScreen } from './src/screens/ArtistDetailScreen';
import { ArtistProfileScreen } from './src/screens/ArtistProfileScreen';
import { BookingProviderProfileScreen } from './src/screens/BookingProviderProfileScreen';
import { ProviderDetailScreen } from './src/screens/ProviderDetailScreen';
import { SearchScreen } from './src/screens/SearchScreen';
import { NotificationsScreen } from './src/screens/NotificationsScreen';
import { CreateEventScreen } from './src/screens/CreateEventScreen';
import { ServiceProvidersScreen } from './src/screens/ServiceProvidersScreen';
import { OperationSubcategoriesScreen } from './src/screens/OperationSubcategoriesScreen';
import { RequestOfferScreen } from './src/screens/RequestOfferScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { EditProfileScreen } from './src/screens/EditProfileScreen';
import { EditCompanyProfileScreen } from './src/screens/EditCompanyProfileScreen';
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
import { PortfolioGalleryScreen } from './src/screens/PortfolioGalleryScreen';
import { ProviderReviewsScreen } from './src/screens/ProviderReviewsScreen';
import { ProviderFinanceScreen } from './src/screens/ProviderFinanceScreen';
import { AnalyticsDashboardScreen } from './src/screens/AnalyticsDashboardScreen';
import { EventOperationsScreen } from './src/screens/EventOperationsScreen';
import { ServiceOperationsScreen } from './src/screens/ServiceOperationsScreen';
import { ProviderRequestDetailScreen } from './src/screens/ProviderRequestDetailScreen';
import { OperationHubScreen } from './src/screens/OperationHubScreen';
import { OperationSectionDetailScreen } from './src/screens/OperationSectionDetailScreen';
import { VenueDetailScreen } from './src/screens/VenueDetailScreen';

// Provider-specific screens
import { ArtistRosterScreen } from './src/screens/provider/booking/ArtistRosterScreen';
import { ArtistDetailManageScreen } from './src/screens/provider/booking/ArtistDetailManageScreen';
import { AddEditArtistScreen } from './src/screens/provider/booking/AddEditArtistScreen';
import { EditRiderScreen } from './src/screens/provider/booking/EditRiderScreen';
import { CrewManagementScreen } from './src/screens/provider/booking/CrewManagementScreen';
import { EquipmentInventoryScreen } from './src/screens/provider/technical/EquipmentInventoryScreen';
import { MenuManagementScreen } from './src/screens/provider/catering/MenuManagementScreen';
import { FleetManagementScreen } from './src/screens/provider/transport/FleetManagementScreen';
import { PersonnelManagementScreen } from './src/screens/provider/security/PersonnelManagementScreen';
import { RequestOrganizerModeScreen } from './src/screens/RequestOrganizerModeScreen';
import { RequestProviderModeScreen } from './src/screens/RequestProviderModeScreen';

// Admin Screens
import {
  AdminDashboardScreen,
  AdminUsersScreen,
  AdminUserDetailScreen,
  AdminEventsScreen,
  AdminEventDetailScreen,
  AdminFinanceScreen,
  AdminReportsScreen,
  AdminRolesScreen,
  AdminSettingsScreen,
} from './src/screens/admin';

// Auth Screens
import {
  OnboardingScreen,
  RoleSelectionScreen,
  OrganizerRegistrationScreen,
  ProviderRegistrationScreen,
  RegistrationSuccessScreen,
  AccountPendingScreen,
} from './src/screens/auth';
import { TestAccount } from './src/data/testAccounts';

// App Context
interface AppContextType {
  isProviderMode: boolean;
  toggleMode: () => void;
  canSwitchMode: boolean; // Only users with dual access can switch
  providerServices: string[];
  setProviderServices: (services: string[]) => void;
  currentAccount: TestAccount | null;
}

export const AppContext = createContext<AppContextType>({
  isProviderMode: false,
  toggleMode: () => {},
  canSwitchMode: true, // Default to true for demo
  providerServices: [],
  setProviderServices: () => {},
  currentAccount: null,
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
      <Stack.Screen name="ArtistProfile" component={ArtistProfileScreen} />
      <Stack.Screen name="BookingProviderProfile" component={BookingProviderProfileScreen} />
      <Stack.Screen name="ProviderDetail" component={ProviderDetailScreen} />
      <Stack.Screen name="Search" component={SearchScreen} />
      <Stack.Screen name="Notifications">
        {() => <NotificationsScreen isProviderMode={isProviderMode} />}
      </Stack.Screen>
      <Stack.Screen name="CreateEvent" component={CreateEventScreen} />
      <Stack.Screen name="ServiceProviders" component={ServiceProvidersScreen} />
      <Stack.Screen name="OperationSubcategories" component={OperationSubcategoriesScreen} />
      <Stack.Screen name="RequestOffer" component={RequestOfferScreen} />
      <Stack.Screen name="CategoryRequest" component={CategoryRequestScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="OfferDetail" component={OfferDetailScreen} />
      <Stack.Screen name="ProviderRequestDetail" component={ProviderRequestDetailScreen} />
      <Stack.Screen name="Contract" component={ContractScreen} />
      <Stack.Screen name="ProviderEventDetail" component={ProviderEventDetailScreen} />
      <Stack.Screen name="OrganizerEventDetail" component={OrganizerEventDetailScreen} />
      <Stack.Screen name="OrganizerProfile" component={OrganizerProfileScreen} />
      <Stack.Screen name="PortfolioGallery" component={PortfolioGalleryScreen} />
      <Stack.Screen name="ProviderReviews" component={ProviderReviewsScreen} />
      <Stack.Screen name="ProviderFinance" component={ProviderFinanceScreen} />
      <Stack.Screen name="EventOperations" component={EventOperationsScreen} />
      <Stack.Screen name="ServiceOperations" component={ServiceOperationsScreen} />
      <Stack.Screen name="OperationHub" component={OperationHubScreen} />
      <Stack.Screen name="OperationSectionDetail" component={OperationSectionDetailScreen} />
      <Stack.Screen name="CalendarView">
        {() => <CalendarViewScreen isProviderMode={isProviderMode} />}
      </Stack.Screen>
      <Stack.Screen name="AnalyticsDashboard" component={AnalyticsDashboardScreen} />
      <Stack.Screen name="VenueDetail" component={VenueDetailScreen} />
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
      <Stack.Screen name="OrganizerProfile" component={OrganizerProfileScreen} />
      <Stack.Screen name="CalendarView">
        {() => <CalendarViewScreen isProviderMode={isProviderMode} />}
      </Stack.Screen>
      <Stack.Screen name="ProviderDetail" component={ProviderDetailScreen} />
      <Stack.Screen name="BookingProviderProfile" component={BookingProviderProfileScreen} />
      <Stack.Screen name="ArtistProfile" component={ArtistProfileScreen} />
      <Stack.Screen name="CreateEvent" component={CreateEventScreen} />
      <Stack.Screen name="ServiceProviders" component={ServiceProvidersScreen} />
      <Stack.Screen name="CategoryRequest" component={CategoryRequestScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="OfferDetail" component={OfferDetailScreen} />
      <Stack.Screen name="Contract" component={ContractScreen} />
      <Stack.Screen name="PortfolioGallery" component={PortfolioGalleryScreen} />
      <Stack.Screen name="ProviderReviews" component={ProviderReviewsScreen} />
      <Stack.Screen name="EventOperations" component={EventOperationsScreen} />
      <Stack.Screen name="ServiceOperations" component={ServiceOperationsScreen} />
      <Stack.Screen name="OperationHub" component={OperationHubScreen} />
      <Stack.Screen name="OperationSectionDetail" component={OperationSectionDetailScreen} />
      <Stack.Screen name="VenueDetail" component={VenueDetailScreen} />
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
      <Stack.Screen name="ProviderRequestDetail" component={ProviderRequestDetailScreen} />
      <Stack.Screen name="CompareOffers" component={CompareOffersScreen} />
      <Stack.Screen name="Contract" component={ContractScreen} />
      <Stack.Screen name="Contracts">
        {() => <ContractsListScreen isProviderMode={isProviderMode} />}
      </Stack.Screen>
      <Stack.Screen name="OrganizerEventDetail" component={OrganizerEventDetailScreen} />
      <Stack.Screen name="ProviderEventDetail" component={ProviderEventDetailScreen} />
      <Stack.Screen name="OrganizerProfile" component={OrganizerProfileScreen} />
      <Stack.Screen name="ProviderDetail" component={ProviderDetailScreen} />
      <Stack.Screen name="BookingProviderProfile" component={BookingProviderProfileScreen} />
      <Stack.Screen name="ArtistProfile" component={ArtistProfileScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="CategoryRequest" component={CategoryRequestScreen} />
      <Stack.Screen name="CreateEvent" component={CreateEventScreen} />
      <Stack.Screen name="EventOperations" component={EventOperationsScreen} />
      <Stack.Screen name="ServiceOperations" component={ServiceOperationsScreen} />
      <Stack.Screen name="OperationHub" component={OperationHubScreen} />
      <Stack.Screen name="OperationSectionDetail" component={OperationSectionDetailScreen} />
      <Stack.Screen name="VenueDetail" component={VenueDetailScreen} />
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
      <Stack.Screen name="Search" component={SearchScreen} />
      <Stack.Screen name="ProviderDetail" component={ProviderDetailScreen} />
      <Stack.Screen name="BookingProviderProfile" component={BookingProviderProfileScreen} />
      <Stack.Screen name="ArtistProfile" component={ArtistProfileScreen} />
      <Stack.Screen name="OrganizerProfile" component={OrganizerProfileScreen} />
      <Stack.Screen name="PortfolioGallery" component={PortfolioGalleryScreen} />
      <Stack.Screen name="ProviderReviews" component={ProviderReviewsScreen} />
      <Stack.Screen name="VenueDetail" component={VenueDetailScreen} />
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
      <Stack.Screen name="EditCompanyProfile" component={EditCompanyProfileScreen} />
      <Stack.Screen name="Favorites" component={FavoritesScreen} />
      <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
      <Stack.Screen name="Security" component={SecurityScreen} />
      <Stack.Screen name="PaymentMethods" component={PaymentMethodsScreen} />
      <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
      <Stack.Screen name="About" component={AboutScreen} />
      <Stack.Screen name="ArtistDetail" component={ArtistDetailScreen} />
      <Stack.Screen name="ArtistProfile" component={ArtistProfileScreen} />
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
      <Stack.Screen name="PortfolioGallery" component={PortfolioGalleryScreen} />
      <Stack.Screen name="ProviderReviews" component={ProviderReviewsScreen} />
      {/* Provider-specific management screens */}
      <Stack.Screen name="ArtistRoster" component={ArtistRosterScreen} />
      <Stack.Screen name="ArtistDetailManage" component={ArtistDetailManageScreen} />
      <Stack.Screen name="ProviderEventDetail" component={ProviderEventDetailScreen} />
      <Stack.Screen name="AddEditArtist" component={AddEditArtistScreen} />
      <Stack.Screen name="EditRider" component={EditRiderScreen} />
      <Stack.Screen name="CrewManagement" component={CrewManagementScreen} />
      <Stack.Screen name="EquipmentInventory" component={EquipmentInventoryScreen} />
      <Stack.Screen name="MenuManagement" component={MenuManagementScreen} />
      <Stack.Screen name="FleetManagement" component={FleetManagementScreen} />
      <Stack.Screen name="PersonnelManagement" component={PersonnelManagementScreen} />
      <Stack.Screen name="RequestOrganizerMode" component={RequestOrganizerModeScreen} />
      <Stack.Screen name="RequestProviderMode" component={RequestProviderModeScreen} />
      <Stack.Screen name="VenueDetail" component={VenueDetailScreen} />
      {/* Admin Screens */}
      <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
      <Stack.Screen name="AdminUsers" component={AdminUsersScreen} />
      <Stack.Screen name="AdminUserDetail" component={AdminUserDetailScreen} />
      <Stack.Screen name="AdminEvents" component={AdminEventsScreen} />
      <Stack.Screen name="AdminEventDetail" component={AdminEventDetailScreen} />
      <Stack.Screen name="AdminFinance" component={AdminFinanceScreen} />
      <Stack.Screen name="AdminReports" component={AdminReportsScreen} />
      <Stack.Screen name="AdminRoles" component={AdminRolesScreen} />
      <Stack.Screen name="AdminSettings" component={AdminSettingsScreen} />
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
function AuthStack({ onLogin }: { onLogin: (asProvider: boolean, account?: TestAccount) => void }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login">
        {() => <LoginScreen onLogin={onLogin} />}
      </Stack.Screen>
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
      <Stack.Screen name="OrganizerRegistration" component={OrganizerRegistrationScreen} />
      <Stack.Screen name="ProviderRegistration" component={ProviderRegistrationScreen} />
      <Stack.Screen name="RegistrationSuccess">
        {() => <RegistrationSuccessScreen onLogin={onLogin} />}
      </Stack.Screen>
      <Stack.Screen name="AccountPending">
        {() => <AccountPendingScreen onLogout={() => {}} />}
      </Stack.Screen>
      {/* Admin Screens - accessible from login for admin users */}
      <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
      <Stack.Screen name="AdminUsers" component={AdminUsersScreen} />
      <Stack.Screen name="AdminUserDetail" component={AdminUserDetailScreen} />
      <Stack.Screen name="AdminEvents" component={AdminEventsScreen} />
      <Stack.Screen name="AdminEventDetail" component={AdminEventDetailScreen} />
      <Stack.Screen name="AdminFinance" component={AdminFinanceScreen} />
      <Stack.Screen name="AdminReports" component={AdminReportsScreen} />
      <Stack.Screen name="AdminRoles" component={AdminRolesScreen} />
      <Stack.Screen name="AdminSettings" component={AdminSettingsScreen} />
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
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isProviderMode, setIsProviderMode] = useState(false);
  const [accountStatus, setAccountStatus] = useState<'pending' | 'approved'>('approved');
  const [navigationKey, setNavigationKey] = useState(0); // Key to force navigation reset
  const [canSwitchMode, setCanSwitchMode] = useState(true); // Demo: allow switching for all users
  const [providerServices, setProviderServices] = useState<string[]>([
    'booking', 'technical', 'transport', 'catering', 'security'
  ]); // Default: all services enabled
  const [currentAccount, setCurrentAccount] = useState<TestAccount | null>(null);
  const navigationRef = useRef<NavigationContainerRef<any>>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Listen to Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthChange(async (user) => {
      setFirebaseUser(user);

      if (user) {
        try {
          const profile = await getUserProfile(user.uid);
          setUserProfile(profile);

          // Auto-login if Firebase user exists
          if (profile) {
            setIsLoggedIn(true);
            // Use preferredMode if set, otherwise default to isProvider
            const initialMode = profile.preferredMode
              ? profile.preferredMode === 'provider'
              : profile.isProvider;
            setIsProviderMode(initialMode);
            setAccountStatus(profile.isVerified ? 'approved' : 'pending');
            if (profile.providerServices) {
              setProviderServices(profile.providerServices);
            }
            setCanSwitchMode(profile.isProvider && profile.isOrganizer);

            // Set Sentry user context
            setSentryUser({
              id: profile.uid,
              email: profile.email,
              username: profile.displayName,
              role: profile.role,
            });
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      } else {
        // User logged out
        setUserProfile(null);
        // Don't auto-logout - let the demo mode work
      }

      setIsCheckingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  // Check onboarding status on mount
  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const completed = await hasCompletedOnboarding();
      setHasOnboarded(completed);
    } catch (e) {
      console.warn('Error checking onboarding status:', e);
    } finally {
      setIsLoading(false);
      // Hide splash screen after loading is complete
      await SplashScreen.hideAsync();
    }
  };

  const handleOnboardingComplete = useCallback(() => {
    setHasOnboarded(true);
  }, []);

  const handleLogin = useCallback((asProvider: boolean, account?: TestAccount) => {
    setIsLoggedIn(true);
    setIsProviderMode(asProvider);
    setCurrentAccount(account || null);
    // In a real app, check account status from API
    setAccountStatus('approved');

    // Set provider services based on account type
    if (account && account.providerServices) {
      setProviderServices(account.providerServices);
      setCanSwitchMode(false); // Provider accounts can't switch to organizer
    } else if (account && account.role === 'organizer') {
      setProviderServices([]);
      setCanSwitchMode(false); // Organizer accounts can't switch to provider
    } else {
      // Default: allow for demo mode without account
      setProviderServices(['booking', 'technical', 'transport', 'catering', 'security']);
      setCanSwitchMode(true);
    }
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      // Sign out from Firebase if logged in
      if (firebaseUser) {
        await logoutUser();
      }
    } catch (error) {
      console.error('Error signing out:', error);
    }

    // Clear Sentry user context
    clearSentryUser();

    setIsLoggedIn(false);
    setIsProviderMode(false);
    setAccountStatus('approved');
    setCurrentAccount(null);
    setUserProfile(null);
    setProviderServices(['booking', 'technical', 'transport', 'catering', 'security']);
    setCanSwitchMode(true);
    setNavigationKey(prev => prev + 1); // Reset navigation on logout
  }, [firebaseUser]);

  const toggleMode = useCallback(async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setIsProviderMode(prev => {
      const newMode = !prev;
      // Persist preference to Firebase if user is logged in
      if (firebaseUser?.uid) {
        updateUserProfile(firebaseUser.uid, {
          preferredMode: newMode ? 'provider' : 'organizer'
        }).catch(error => {
          console.error('Error saving mode preference:', error);
        });
      }
      return newMode;
    });
    // Increment key to force NavigationContainer to remount and reset all stacks
    setNavigationKey(prev => prev + 1);
  }, [firebaseUser?.uid]);

  // Loading state - wait for both onboarding check and auth check
  if (isLoading || isCheckingAuth) {
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
        <AuthProvider>
          <AdminProvider>
            <NavigationContainer theme={isDark ? CustomDarkTheme : CustomLightTheme}>
              <AuthStack onLogin={handleLogin} />
            </NavigationContainer>
          </AdminProvider>
        </AuthProvider>
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
      <AppContext.Provider value={{ isProviderMode, toggleMode, canSwitchMode, providerServices, setProviderServices, currentAccount }}>
        <AuthProvider>
          <RBACProvider isProvider={isProviderMode}>
            <AdminProvider>
              <ModuleProvider>
              <NavigationContainer
                ref={navigationRef}
                key={navigationKey}
                theme={isDark ? CustomDarkTheme : CustomLightTheme}
              >
                <MainTabs onLogout={handleLogout} />
              </NavigationContainer>
              <NetworkStatusBar />
            </ModuleProvider>
            </AdminProvider>
          </RBACProvider>
        </AuthProvider>
      </AppContext.Provider>
    </>
  );
}

function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <ErrorBoundary>
          <ToastProvider>
            <AppContent />
          </ToastProvider>
        </ErrorBoundary>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

// Wrap with Sentry for crash tracking
export default sentryWrap(App);
