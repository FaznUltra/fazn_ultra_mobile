import React from 'react';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { colors } from '../../../theme';

interface IconProps {
  size?: number;
  color?: string;
}

export function PlaystationSvg({ size = 32, color = colors.primaryLight }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M7 8C4.79 8 3 9.79 3 12C3 14.21 4.79 16 7 16H7.5M17 8C19.21 8 21 9.79 21 12C21 14.21 19.21 16 17 16H16.5"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <Rect x={6} y={7} width={12} height={10} rx={5} stroke={color} strokeWidth={2} />
      <Circle cx={9} cy={12} r={1.4} fill={color} />
      <Circle cx={15} cy={12} r={1.4} fill={color} />
    </Svg>
  );
}

export function XboxSvg({ size = 32, color = colors.primaryLight }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={9} stroke={color} strokeWidth={2} />
      <Path
        d="M8.5 8.5L15.5 15.5M15.5 8.5L8.5 15.5"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function PcSvg({ size = 32, color = colors.primaryLight }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x={3} y={4} width={18} height={12} rx={2} stroke={color} strokeWidth={2} />
      <Path
        d="M9 20H15M12 16V20"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function MobileSvg({ size = 32, color = colors.primaryLight }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x={6} y={2} width={12} height={20} rx={2} stroke={color} strokeWidth={2} />
      <Circle cx={12} cy={18} r={1} fill={color} />
    </Svg>
  );
}

export function SearchSvg({ size = 18, color = colors.textMuted }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={11} cy={11} r={7} stroke={color} strokeWidth={2} />
      <Path
        d="M16 16L21 21"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export const PLATFORM_ICONS: Record<
  string,
  React.FC<{ size?: number; color?: string }>
> = {
  playstation: PlaystationSvg,
  xbox: XboxSvg,
  pc: PcSvg,
  mobile: MobileSvg,
};
