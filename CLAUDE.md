# FAZN Mobile — Agent Guidelines

## This is a production-level app. Design consistency is non-negotiable.

---

## Screen structure — always use ScreenContainer

Every app screen (everything outside `src/screens/auth/`) **must** use `ScreenContainer` as its root element:

```tsx
import { ScreenContainer } from '../../components/ui/ScreenContainer';

export function MyScreen() {
  return (
    <ScreenContainer testID="my-screen">
      {/* content */}
    </ScreenContainer>
  );
}
```

- Never add `SafeAreaView`, `ScrollView`, or `paddingHorizontal` inside a screen — `ScreenContainer` handles all of that.
- Use `noPadding` only when you need edge-to-edge content (hero images, full-bleed maps).
- Use `noScroll` only for screens that manage their own scroll (e.g. FlatList-heavy screens).
- Auth screens (`src/screens/auth/`) use `KeyboardAvoid` + `SafeAreaView` directly — do not change them.

---

## Design tokens — always import from `../../theme`

```ts
import { colors, spacing, radius } from '../../theme';
```

Never hardcode hex values, pixel gaps, or border radii. Every value comes from the token file.

| Token | Value | Usage |
|---|---|---|
| `colors.background` | `#0a0a0a` | Page background |
| `colors.card` | `#141414` | Card / bottom sheet surfaces |
| `colors.surface` | `#1c1c1c` | Input fields, option rows |
| `colors.primary` | `#7c3aed` | Primary actions, active fills |
| `colors.primaryLight` | `#8b5cf6` | Active tab icons, links |
| `colors.textPrimary` | `#ffffff` | Headings, body |
| `colors.textSecondary` | `#9ca3af` | Subtitles, helper text |
| `colors.textMuted` | `#6b7280` | Placeholders, inactive icons |
| `colors.border` | `#2a2a2a` | Dividers, borders |
| `colors.error` | `#ef4444` | Error states |
| `colors.success` | `#22c55e` | Success states |

---

## Typography — follow this scale exactly

| Role | fontSize | fontWeight | color |
|---|---|---|---|
| Screen title | 28 | `'700'` | `colors.textPrimary` |
| Section heading | 18–20 | `'700'` | `colors.textPrimary` |
| Card title | 15–16 | `'600'` | `colors.textPrimary` |
| Body / description | 14 | `'400'` | `colors.textSecondary` |
| Caption / hint | 12–13 | `'400'` | `colors.textMuted` |
| Link / action text | 14 | `'600'` | `colors.primaryLight` |

All screen titles sit at the top of `ScreenContainer` content, above any list or card grid.

---

## Component conventions

### Buttons
- Use the shared `Button` component (`src/components/ui/Button.tsx`) for all CTAs.
- Primary variant: filled purple (`colors.primary`), white text.
- Outline variant: transparent with `colors.border` border and `colors.textPrimary` text.
- Never create one-off `TouchableOpacity` styled as a primary button — extend `Button` instead.

### Cards / list rows
- Background: `colors.surface` (`#1c1c1c`), `borderRadius: radius.md` (12).
- Horizontal padding inside card: `spacing.md` (16).
- Vertical padding inside card: `spacing.sm + 2` (10).
- Separator between rows: `gap: spacing.xs` (4) on the container, never manual margins.

### Icons
- Use the SVG icon set in `src/components/create/CreateDrawerIcons.tsx` as the pattern.
- All icons accept `size` and `color` props; never hardcode size or color inside the SVG component.
- Prefer `react-native-svg` over image assets for all UI icons.

### Spacing rhythm
- Between a screen title and the first content block: `marginBottom: spacing.lg` (24).
- Between sections: `marginTop: spacing.xl` (32).
- Between stacked cards: `gap: spacing.xs` (4) to `gap: spacing.sm` (8).
- Horizontal screen padding is owned by `ScreenContainer` — do not re-add it inside screens.

---

## Navigation

- The bottom tab bar (`TabBar`) is always visible in the authenticated app — do not wrap any tab screen in another navigator that hides it.
- Sub-screens within a tab (e.g. a challenge detail page) should be added to a nested stack inside that tab's navigator, not to the root tab navigator.
- Never navigate to an auth screen from an app screen — trigger `useAuthStore().logout()` instead and let `RootNavigator` redirect automatically.

---

## Testing

- Every new screen and component must have a corresponding test in `src/__tests__/`.
- Use `testID` on the root element of every screen and on all interactive elements.
- All tests must pass before committing: `npx jest`.
- Mock `react-native-safe-area-context` and `react-native-svg` in test files that need them (see existing tests for the pattern).

---

## Security rules (non-negotiable)

- Never commit `.env` or `.env.local`.
- Never log passwords, tokens, or full request bodies.
- Always use `expo-secure-store` for token persistence — never `AsyncStorage` for sensitive data.
- Validate all user input before sending to the API.
