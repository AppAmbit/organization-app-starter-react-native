import React, { useRef } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  useColorScheme,
  useWindowDimensions,
  View,
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type {
  BottomTabBarProps,
} from '@react-navigation/bottom-tabs';
import { HomeScreen } from '../screens/HomeScreen';
import { CategoriesScreen } from '../screens/CategoriesScreen';
import { ResourcesScreen } from '../screens/ResourcesScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { AboutScreen } from '../screens/AboutScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { getColors } from '../theme/colors';
import { FontWeight } from '../theme/typography';
import { Radius, Shadow, Spacing } from '../theme/spacing';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNotifications } from '../context/NotificationsContext';

export type TabParamList = {
  Home: undefined;
  Categories: undefined;
  Resources: undefined;
  Notifications: undefined;
  About: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

const TAB_CONFIG: Record<
  keyof TabParamList,
  { icon: string; iconActive: string; label: string }
> = {
  Home: { icon: 'home-outline', iconActive: 'home', label: 'Home' },
  Categories: { icon: 'grid-outline', iconActive: 'grid', label: 'Categories' },
  Resources: { icon: 'folder-outline', iconActive: 'folder', label: 'Resources' },
  Notifications: { icon: 'notifications-outline', iconActive: 'notifications', label: 'Notifications' },
  About: { icon: 'information-circle-outline', iconActive: 'information-circle', label: 'About' },
  Profile: { icon: 'person-outline', iconActive: 'person', label: 'Profile' },
};

const TabItem: React.FC<{
  label: string;
  icon: string;
  isFocused: boolean;
  onPress: () => void;
  inactiveColor: string;
  accent: string;
  badgeCount?: number;
  isTablet: boolean;
}> = ({ label, icon, isFocused, onPress, inactiveColor, accent, badgeCount, isTablet }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const indicatorWidth = useRef(new Animated.Value(0)).current;

  const iconBoxSize = isTablet ? 46 : 40;
  const iconBoxHeight = isTablet ? 38 : 34;
  const iconSize = isTablet ? 24 : 22;
  const labelFontSize = isTablet ? 11 : 10;

  React.useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: isFocused ? 1.05 : 1,
        useNativeDriver: true,
        tension: 180,
        friction: 8,
      }),
      Animated.spring(indicatorWidth, {
        toValue: isFocused ? 24 : 0,
        useNativeDriver: false,
        tension: 180,
        friction: 10,
      }),
    ]).start();
  }, [isFocused, scale, indicatorWidth]);

  return (
    <Pressable onPress={onPress} style={styles.tabItem} hitSlop={4}>
      <Animated.View style={[styles.tabInner, { transform: [{ scale }] }]}>
        <View style={[
          styles.iconWrap,
          { width: iconBoxSize, height: iconBoxHeight },
          isFocused && { backgroundColor: accent + '1A' },
        ]}>
          <Ionicons
            name={icon}
            size={iconSize}
            color={isFocused ? accent : inactiveColor}
          />
          {!!badgeCount && badgeCount > 0 && (
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>{badgeCount > 9 ? '9+' : badgeCount}</Text>
            </View>
          )}
        </View>

        <Animated.View
          style={[
            styles.indicator,
            { backgroundColor: accent, width: indicatorWidth },
          ]}
        />
      </Animated.View>

      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.8}
        allowFontScaling={false}
        style={[
          styles.tabLabel,
          { color: isFocused ? accent : inactiveColor, fontSize: labelFontSize },
          isFocused && styles.tabLabelActive,
        ]}>
        {label}
      </Text>
    </Pressable>
  );
};

const CustomTabBar: React.FC<BottomTabBarProps> = ({ state, navigation }) => {
  const scheme = useColorScheme() ?? 'light';
  const colors = getColors(scheme);
  const insets = useSafeAreaInsets();
  const { unreadCount } = useNotifications();
  const { width } = useWindowDimensions();
  const isTablet = width >= 600;

  return (
    <View
      style={[
        styles.tabBar,
        Shadow.lg,
        {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          paddingTop: isTablet ? 10 : Spacing.sm,
          paddingBottom: insets.bottom + (isTablet ? Spacing.sm : Spacing.xs),
        },
      ]}>
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const config = TAB_CONFIG[route.name as keyof TabParamList];

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TabItem
            key={route.key}
            label={config.label}
            icon={isFocused ? config.iconActive : config.icon}
            isFocused={isFocused}
            onPress={onPress}
            inactiveColor={colors.textTertiary}
            accent={colors.accent}
            badgeCount={route.name === 'Notifications' ? unreadCount : 0}
            isTablet={isTablet}
          />
        );
      })}
    </View>
  );
};

export const BottomTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Categories" component={CategoriesScreen} />
      <Tab.Screen name="Resources" component={ResourcesScreen} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} />
      <Tab.Screen name="About" component={AboutScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingTop: Spacing.sm,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  tabInner: {
    alignItems: 'center',
    gap: 3,
  },
  iconWrap: {
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicator: {
    height: 3,
    borderRadius: 1.5,
  },
  badgeContainer: {
    position: 'absolute',
    top: 2,
    right: 4,
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: 'bold',
  },
  tabLabel: {
    fontWeight: FontWeight.medium,
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  tabLabelActive: {
    fontWeight: FontWeight.semiBold,
  },
});
