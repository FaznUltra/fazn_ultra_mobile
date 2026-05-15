import React from 'react';
import Svg, { Path, Circle, Line, Polyline, Rect } from 'react-native-svg';
import { colors } from '../../theme';

interface IconProps {
  size?: number;
  color?: string;
}

export function ChallengeSvg({ size = 24, color = colors.primaryLight }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function TournamentSvg({ size = 24, color = '#0ea5e9' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x={2} y={3} width={6} height={4} rx={1} stroke={color} strokeWidth={2} />
      <Rect x={2} y={17} width={6} height={4} rx={1} stroke={color} strokeWidth={2} />
      <Rect x={16} y={10} width={6} height={4} rx={1} stroke={color} strokeWidth={2} />
      <Line x1={8} y1={5} x2={12} y2={5} stroke={color} strokeWidth={2} />
      <Line x1={8} y1={19} x2={12} y2={19} stroke={color} strokeWidth={2} />
      <Line x1={12} y1={5} x2={12} y2={19} stroke={color} strokeWidth={2} />
      <Line x1={12} y1={12} x2={16} y2={12} stroke={color} strokeWidth={2} />
    </Svg>
  );
}

export function FaznSpecialsSvg({ size = 24, color = '#f59e0b' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M13 2L3 14H12L11 22L21 10H12L13 2Z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function HighlightSvg({ size = 24, color = '#22c55e' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={10} stroke={color} strokeWidth={2} />
      <Polyline
        points="10,8 16,12 10,16 10,8"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

export function LeagueSvg({ size = 24, color = '#ec4899' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M8 21H16M12 17V21M7 4H17L19 9C19 11.76 15.87 14 12 14C8.13 14 5 11.76 5 9L7 4Z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M5 9H2M19 9H22"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function CloseDrawerSvg({ size = 20, color = colors.textSecondary }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M18 6L6 18M6 6L18 18"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

/** Tab bar SVG icons */
export function HomeSvg({ size = 24, color = colors.textMuted }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 9.5L12 3L21 9.5V20C21 20.55 20.55 21 20 21H15V16H9V21H4C3.45 21 3 20.55 3 20V9.5Z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function ArenaSvg({ size = 24, color = colors.textMuted }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 9H4.5C3.67 9 3 9.67 3 10.5V13.5C3 14.33 3.67 15 4.5 15H6M18 9H19.5C20.33 9 21 9.67 21 10.5V13.5C21 14.33 20.33 15 19.5 15H18"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <Rect x={6} y={5} width={12} height={14} rx={2} stroke={color} strokeWidth={2} />
      <Line x1={10} y1={10} x2={10} y2={14} stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Line x1={14} y1={10} x2={14} y2={14} stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

export function FriendsSvg({ size = 24, color = colors.textMuted }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={9} cy={7} r={4} stroke={color} strokeWidth={2} />
      <Path
        d="M2 21C2 17.13 5.13 14 9 14C12.87 14 16 17.13 16 21"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <Path
        d="M19 8C19 9.66 17.66 11 16 11"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <Path
        d="M22 21C22 18.24 20.27 15.9 17.87 15.18"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function ProfileSvg({ size = 24, color = colors.textMuted }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={8} r={4} stroke={color} strokeWidth={2} />
      <Path
        d="M4 21C4 17.13 7.58 14 12 14C16.42 14 20 17.13 20 21"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function CreatePlusSvg({ size = 28, color = '#ffffff' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 5V19M5 12H19"
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
      />
    </Svg>
  );
}
