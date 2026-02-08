export const COLORS = {
    primary: '#4F46E5', // Indigo
    secondary: '#10B981', // Emerald
    accent: '#F59E0B', // Amber
    background: '#F9FAFB',
    surface: '#FFFFFF',
    text: '#111827',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    error: '#EF4444',
    success: '#10B981',
    warning: '#F59E0B',
    white: '#FFFFFF',
    black: '#000000',
};

export const SPACING = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

import { TextStyle } from 'react-native';

export const TYPOGRAPHY: { [key: string]: TextStyle } = {
    h1: {
        fontSize: 24,
        fontWeight: '700',
        color: COLORS.text,
    },
    h2: {
        fontSize: 20,
        fontWeight: '600',
        color: COLORS.text,
    },
    h3: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.text,
    },
    body: {
        fontSize: 16,
        fontWeight: '400',
        color: COLORS.text,
    },
    bodySecondary: {
        fontSize: 14,
        fontWeight: '400',
        color: COLORS.textSecondary,
    },
    caption: {
        fontSize: 12,
        fontWeight: '400',
        color: COLORS.textSecondary,
    },
    button: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.white,
    },
};

export const SHADOWS = {
    small: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    medium: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5,
    },
};
