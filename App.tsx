import React, { useState, useCallback, createContext, useContext } from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { LoginScreen } from './src/screens/LoginScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { EventsScreen } from './src/screens/EventsScreen';
import { EventDetailScreen } from './src/screens/EventDetailScreen';
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
import { colors } from './src/theme/colors';

// App Context
interface AppContextType {
  isProviderMode: boolean;
  toggleMode: () => void;
}

export const AppContext = createContext<AppContextType>({
  isProviderMode: false,
  toggleMode: () => {},
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
      <Stack.Screen name="ProviderDetail" component={ProviderDetailScreen} />
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
    </Stack.Navigator>
  );
}

// Main Tab Navigator
function MainTabs({ onLogout }: { onLogout: () => void }) {
  const { isProviderMode } = useApp();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#09090b',
          borderTopColor: 'rgba(255, 255, 255, 0.08)',
          borderTopWidth: 1,
          paddingTop: 6,
          paddingBottom: 6,
          height: 56,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarActiveTintColor: colors.brand[400],
        tabBarInactiveTintColor: colors.zinc[600],
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
          marginTop: 2,
        },
        tabBarIconStyle: {
          marginTop: 0,
        },
        tabBarIcon: ({ focused, color }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          switch (route.name) {
            case 'HomeTab':
              iconName = focused ? 'compass' : 'compass-outline';
              break;
            case 'EventsTab':
              iconName = focused ? 'calendar' : 'calendar-outline';
              break;
            case 'OffersTab':
              iconName = focused ? 'pricetags' : 'pricetags-outline';
              break;
            case 'MessagesTab':
              iconName = focused ? 'chatbubble-ellipses' : 'chatbubble-ellipses-outline';
              break;
            case 'ProfileTab':
              iconName = focused ? 'person-circle' : 'person-circle-outline';
              break;
          }

          return (
            <View style={{
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 28,
              borderRadius: 14,
              backgroundColor: focused ? 'rgba(147, 51, 234, 0.15)' : 'transparent',
            }}>
              <Ionicons name={iconName} size={22} color={color} />
            </View>
          );
        },
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        options={{ tabBarLabel: 'Keşfet' }}
      />
      <Tab.Screen
        name="EventsTab"
        component={EventsStack}
        options={{ tabBarLabel: isProviderMode ? 'İşlerim' : 'Etkinlikler' }}
      />
      <Tab.Screen
        name="OffersTab"
        component={OffersStack}
        options={{
          tabBarLabel: 'Teklifler',
          tabBarBadge: 3,
          tabBarBadgeStyle: {
            backgroundColor: colors.brand[500],
            fontSize: 10,
            fontWeight: '700',
            minWidth: 18,
            height: 18,
            borderRadius: 9,
          },
        }}
      />
      <Tab.Screen
        name="MessagesTab"
        component={MessagesStack}
        options={{
          tabBarLabel: 'Mesajlar',
          tabBarBadge: 2,
          tabBarBadgeStyle: {
            backgroundColor: colors.error,
            fontSize: 10,
            fontWeight: '700',
            minWidth: 18,
            height: 18,
            borderRadius: 9,
          },
        }}
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

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isProviderMode, setIsProviderMode] = useState(false);

  const handleLogin = useCallback((asProvider: boolean) => {
    setIsLoggedIn(true);
    setIsProviderMode(asProvider);
  }, []);

  const handleLogout = useCallback(() => {
    setIsLoggedIn(false);
    setIsProviderMode(false);
  }, []);

  const toggleMode = useCallback(() => {
    setIsProviderMode(prev => !prev);
  }, []);

  if (!isLoggedIn) {
    return (
      <SafeAreaProvider>
        <StatusBar style="light" />
        <LoginScreen onLogin={handleLogin} />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <AppContext.Provider value={{ isProviderMode, toggleMode }}>
        <NavigationContainer>
          <MainTabs onLogout={handleLogout} />
        </NavigationContainer>
      </AppContext.Provider>
    </SafeAreaProvider>
  );
}
