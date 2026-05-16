import React from 'react';
import Svg, { Path, Circle, Rect, Line } from 'react-native-svg';
import { colors } from '../../theme';

interface IconProps {
  size?: number;
  color?: string;
}

export function ChevronLeftIcon({ size = 24, color = colors.textPrimary }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M15 18L9 12L15 6" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function ChevronRightIcon({ size = 16, color = colors.textMuted }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M9 18L15 12L9 6" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function CloseIcon({ size = 14, color = colors.textMuted }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M18 6L6 18M6 6L18 18" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function EyeIcon({ size = 20, color = colors.primaryLight }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12C22 12 19 19 12 19C5 19 2 12 2 12Z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx={12} cy={12} r={3} stroke={color} strokeWidth={2} />
    </Svg>
  );
}

export function OnlineIcon({ size = 20, color = colors.primaryLight }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={9} stroke={color} strokeWidth={2} />
      <Circle cx={12} cy={12} r={3.5} fill={color} />
    </Svg>
  );
}

export function GamepadIcon({ size = 20, color = colors.primaryLight }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x={2} y={7} width={20} height={11} rx={4} stroke={color} strokeWidth={2} />
      <Line x1={7} y1={11} x2={7} y2={15} stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Line x1={5} y1={13} x2={9} y2={13} stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Circle cx={16} cy={12} r={1.2} fill={color} />
      <Circle cx={18.5} cy={14.5} r={1.2} fill={color} />
    </Svg>
  );
}

export function SwordIcon({ size = 20, color = colors.primaryLight }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M14.5 3H21V9.5L9.5 21L3 14.5L14.5 3Z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Line x1={13} y1={11} x2={16} y2={14} stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

export function HistoryIcon({ size = 20, color = colors.primaryLight }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M3 12C3 7.03 7.03 3 12 3C16.97 3 21 7.03 21 12C21 16.97 16.97 21 12 21C8.5 21 5.5 19 4 16" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Path d="M3 12H6M12 7V12L15 14" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function BellIcon({ size = 20, color = colors.primaryLight }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M18 8C18 5 15.5 3 12 3C8.5 3 6 5 6 8C6 13 4 15 4 15H20C20 15 18 13 18 8Z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M10 19C10.5 20 11 20.5 12 20.5C13 20.5 13.5 20 14 19" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

export function PeopleIcon({ size = 20, color = colors.primaryLight }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={9} cy={8} r={3.5} stroke={color} strokeWidth={2} />
      <Path d="M3 20C3 16.5 5.5 14 9 14C12.5 14 15 16.5 15 20" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Path d="M16 14C19 14 21 16.5 21 20M15.5 4.5C17.5 5 18.5 6.5 18.5 8.5C18.5 10 17.8 11.2 16.5 12" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

export function TrophyIcon({ size = 20, color = colors.primaryLight }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M7 4H17V10C17 12.76 14.76 15 12 15C9.24 15 7 12.76 7 10V4Z" stroke={color} strokeWidth={2} strokeLinejoin="round" />
      <Path d="M7 6H4V8C4 9.66 5.34 11 7 11M17 6H20V8C20 9.66 18.66 11 17 11M12 15V18M8 21H16M10 18H14" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function LockIcon({ size = 20, color = colors.primaryLight }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x={4} y={10} width={16} height={11} rx={2} stroke={color} strokeWidth={2} />
      <Path d="M8 10V7C8 4.79 9.79 3 12 3C14.21 3 16 4.79 16 7V10" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Circle cx={12} cy={15} r={1.5} fill={color} />
    </Svg>
  );
}

export function MailIcon({ size = 20, color = colors.primaryLight }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x={3} y={5} width={18} height={14} rx={2} stroke={color} strokeWidth={2} />
      <Path d="M4 7L12 13L20 7" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function PhoneIcon({ size = 20, color = colors.primaryLight }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M5 3H9L11 8L8.5 9.5C9.5 11.5 12.5 14.5 14.5 15.5L16 13L21 15V19C21 20 20 21 19 21C10 20.5 4 14.5 3 5C3 4 4 3 5 3Z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function ShieldIcon({ size = 20, color = colors.primaryLight }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2L4 6V12C4 16.42 7.58 20.54 12 22C16.42 20.54 20 16.42 20 12V6L12 2Z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M9 12L11 14L15 10" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function GlobeIcon({ size = 20, color = colors.primaryLight }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={9} stroke={color} strokeWidth={2} />
      <Path d="M3 12H21M12 3C14.5 5.5 15.5 8.5 15.5 12C15.5 15.5 14.5 18.5 12 21C9.5 18.5 8.5 15.5 8.5 12C8.5 8.5 9.5 5.5 12 3Z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function MoonIcon({ size = 20, color = colors.primaryLight }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M20 14.5C18.8 15.2 17.4 15.6 16 15.6C11.3 15.6 7.5 11.8 7.5 7.1C7.5 5.7 7.9 4.3 8.6 3.1C5.3 4.4 3 7.6 3 11.3C3 16.3 7 20.3 12 20.3C15.7 20.3 18.9 18 20 14.5Z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function TrashIcon({ size = 20, color = colors.primaryLight }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M4 7H20M9 7V4H15V7M6 7L7 20H17L18 7M10 11V16M14 11V16" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function HelpIcon({ size = 20, color = colors.primaryLight }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={9} stroke={color} strokeWidth={2} />
      <Path d="M9.5 9.5C9.5 8 10.5 7 12 7C13.5 7 14.5 8 14.5 9.3C14.5 11 12 11 12 13" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Circle cx={12} cy={16.5} r={1.1} fill={color} />
    </Svg>
  );
}

export function BugIcon({ size = 20, color = colors.primaryLight }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x={8} y={8} width={8} height={11} rx={4} stroke={color} strokeWidth={2} />
      <Path d="M9 6C9 4.5 10.3 3.5 12 3.5C13.7 3.5 15 4.5 15 6M4 11H8M16 11H20M4 16H8M16 16H20M12 8V19" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

export function DocumentIcon({ size = 20, color = colors.primaryLight }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M6 3H14L19 8V21H6V3Z" stroke={color} strokeWidth={2} strokeLinejoin="round" />
      <Path d="M14 3V8H19M9 12H15M9 16H15" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function PrivacyDocIcon({ size = 20, color = colors.primaryLight }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M6 3H14L19 8V21H6V3Z" stroke={color} strokeWidth={2} strokeLinejoin="round" />
      <Path d="M14 3V8H19" stroke={color} strokeWidth={2} strokeLinejoin="round" />
      <Path d="M12 11C13.1 11 14 11.9 14 13V14H10V13C10 11.9 10.9 11 12 11Z M10.5 14H13.5V17H10.5V14Z" stroke={color} strokeWidth={1.6} strokeLinejoin="round" />
    </Svg>
  );
}
