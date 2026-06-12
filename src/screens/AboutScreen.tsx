import React from 'react';
import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as AppAmbit from 'appambit';
import { getColors } from '../theme/colors';
import { FontSize, FontWeight } from '../theme/typography';
import { Layout, Radius, Shadow, Spacing } from '../theme/spacing';

interface ExternalLink {
  label: string;
  url: string;
}

interface OrgInfo {
  name: string;
  description: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  websiteUrl: string | null;
  links: ExternalLink[];
}

const ORG_INFO: OrgInfo = {
  name: 'AppAmbit',
  description:
    'AppAmbit helps organizations build branded, production-ready apps with analytics, ' +
    'content management, and push notifications built in.',
  contactEmail: 'hello@appambit.com',
  contactPhone: null,
  websiteUrl: 'https://appambit.com',
  links: [
    { label: 'Documentation', url: 'https://docs.appambit.com' },
    { label: 'Privacy Policy', url: 'https://appambit.com/privacy-policy' },
    { label: 'Terms of Service', url: 'https://appambit.com/terms-of-service' },
    { label: 'Discord', url: 'https://discord.com/invite/nJyetYue2s' },
    { label: 'GitHub', url: 'https://github.com/AppAmbit' },
  ],
};

function openExternal(url: string, label: string) {
  AppAmbit.trackEvent('Resource Opened', { url, label });
  Linking.openURL(url).catch(() => {});
}

export const AboutScreen: React.FC = () => {
  const scheme = useColorScheme() ?? 'light';
  const colors = getColors(scheme);
  const insets = useSafeAreaInsets();
  const org = ORG_INFO;

  const hasContact = org.contactEmail || org.contactPhone || org.websiteUrl;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + Spacing.xl, paddingBottom: insets.bottom + Spacing.xxxl },
        ]}>

        <View style={styles.header}>
          <Text style={[styles.orgName, { color: colors.textPrimary }]}>
            {org.name}
          </Text>
        </View>

        {org.description ? (
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {org.description}
          </Text>
        ) : (
          <Text style={[styles.description, { color: colors.textTertiary }]}>
            No description available.
          </Text>
        )}

        {hasContact && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Contact
            </Text>

            {org.contactEmail && (
              <Pressable
                style={[styles.row, Shadow.sm, { backgroundColor: colors.surface }]}
                onPress={() => openExternal(`mailto:${org.contactEmail}`, 'Email')}>
                <Ionicons name="mail-outline" size={20} color={colors.accent} style={styles.rowIcon} />
                <Text style={[styles.rowText, { color: colors.textPrimary }]}>
                  {org.contactEmail}
                </Text>
              </Pressable>
            )}

            {org.contactPhone && (
              <Pressable
                style={[styles.row, Shadow.sm, { backgroundColor: colors.surface }]}
                onPress={() => openExternal(`tel:${org.contactPhone}`, 'Phone')}>
                <Ionicons name="call-outline" size={20} color={colors.accent} style={styles.rowIcon} />
                <Text style={[styles.rowText, { color: colors.textPrimary }]}>
                  {org.contactPhone}
                </Text>
              </Pressable>
            )}

            {org.websiteUrl && (
              <Pressable
                style={[styles.row, Shadow.sm, { backgroundColor: colors.surface }]}
                onPress={() => openExternal(org.websiteUrl!, 'Website')}>
                <Ionicons name="globe-outline" size={20} color={colors.accent} style={styles.rowIcon} />
                <Text style={[styles.rowText, { color: colors.textPrimary }]}>
                  {org.websiteUrl}
                </Text>
              </Pressable>
            )}
          </View>
        )}

        {org.links.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Links
            </Text>
            {org.links.map((link) => (
              <Pressable
                key={link.url}
                style={[styles.row, Shadow.sm, { backgroundColor: colors.surface }]}
                onPress={() => openExternal(link.url, link.label)}>
                <Ionicons name="link-outline" size={20} color={colors.accent} style={styles.rowIcon} />
                <Text style={[styles.rowText, { color: colors.textPrimary }]} numberOfLines={1}>
                  {link.label}
                </Text>
                <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Layout.screenPaddingH,
    gap: Spacing.lg,
  },
  header: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  orgName: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    textAlign: 'center',
  },
  description: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.5,
    textAlign: 'center',
  },
  section: {
    gap: Spacing.sm,
  },
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: Radius.md,
    gap: Spacing.sm,
  },
  rowIcon: {
    marginRight: Spacing.sm,
  },
  rowText: {
    flex: 1,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semiBold,
  },
});
