# SwapSkill

SwapSkill is a React Native school project for exchanging services without money: you design someone's logo, and they repair your bike in return.

**This is a front-end demo.** It creates no real accounts, checks no credentials against a server, and sends no form data over the network. Use example details. The temporary name, email, selected skills, requests, and offers disappear when you reload or choose **End demo**; passwords are never saved in the demo context or persistent storage.

## Start the app

Node 24 and npm are already available in the development environment. Open a terminal in the original project:

```sh
cd /Users/macbookpro/Documents/ReactProjects/swapskill
node --version
npm --version
```

Only if `node_modules` is missing, install the exact dependencies recorded in the lockfile:

```sh
npm ci
```

Then choose one command:

| Command | Purpose |
| --- | --- |
| `npm run web` | Start Expo and open the browser preview. |
| `npm run dev` | Start Expo and show the QR code for a phone. |
| `npm run typecheck` | Check the application's TypeScript. |
| `npm run test` | Run auth, skill-selection, and request-validation tests. |

Stop Expo with **Ctrl+C**. For phone testing, use the same Wi-Fi network and an Expo Go version compatible with this project's Expo SDK, or a compatible development build. `npm run ios` requires Xcode and an iOS Simulator; `npm run android` requires Android Studio and an emulator.

## What happens on screen

1. Opening `/` shows the supplied logo and name, “Welcome to SwapSkill,” and “A little help. A fair exchange.” in the center.
2. After 1.5 seconds, the logo moves upward while the welcome text fades over 650 ms. The login Card then appears over 300 ms. Reduced-motion settings skip this animation.
3. **Sign Up** in the login footer opens registration. Its footer returns to **Log In**. Direct `/login` and `/sign-up` visits skip the intro.
4. A valid **Log In** opens the request feed. In **Sign Up**, **Next** opens **What can you offer?**, the second registration step.
5. Choose at least one skill using categories and search, or add a skill missing from the catalog. **Continue** saves the selections to the in-memory demo profile and opens Home. Selected skills are shown in the Profile tab. The catalog starts with 36 skills in six categories; it describes abilities users can offer as services.
6. Home shows a scrolling feed of example requests, with descriptions, categories, and the author's skills under their name. Each post describes only the service needed. Search and category filters narrow the feed. **Post a request** opens the local request form.
7. **Requests** contains My posts, Received, and Sent. New posts appear in My posts and the feed. A responder opens a post and describes both the service they will do and what they want in return. Saving the offer adds both sides to Sent. Received includes a clearly marked sample offer you can accept or decline. These actions never contact anyone.
8. **Profile** shows your demo name, email, and skills. **End demo** returns to login without replaying the intro. Reloading clears the demo profile and intro flag. Existing demo logins do not load a saved profile, because there is no account database.

Login requires a valid email and nonblank password. Signup also requires a name, at least eight password characters, and matching confirmation. **Forgot password?** explains that resets are unavailable; it does not send an email.

## Use the official components directly

[React Native Reusables](https://reactnativereusables.com/docs) copies component source into your project through its CLI. Therefore, importing from `@/components/ui/button` is the official usage model. The screens import these components directly; there are no `AppButton`, `AppInput`, or `AppText` wrappers.

| Component | Official documentation | Used in this app |
| --- | --- | --- |
| `Card` and its header/content/footer parts | [Card](https://reactnativereusables.com/docs/components/card) | Authentication, request forms, feed posts, and profile |
| `Button` | [Button](https://reactnativereusables.com/docs/components/button) | Submit, password visibility, account links, End demo |
| `Input` | [Input](https://reactnativereusables.com/docs/components/input) | Login, signup, and request fields; search |
| `Label` | [Label](https://reactnativereusables.com/docs/components/label) | Field names associated with their inputs |
| `Text` | [Text](https://reactnativereusables.com/docs/components/text) | Text throughout the app |
| `Checkbox` | [Checkbox](https://reactnativereusables.com/docs/components/checkbox) | Selecting several profile skills |
| `Badge` | [Badge](https://reactnativereusables.com/docs/components/badge) | Requester skill pills, profile skills, request categories, and proposal status |
| `Avatar` | [Avatar](https://reactnativereusables.com/docs/components/avatar) | Initials on posts and profiles |
| `Tabs` | [Tabs](https://reactnativereusables.com/docs/components/tabs) | My posts / Received / Sent within Requests |
| `Textarea` | [Textarea](https://reactnativereusables.com/docs/components/textarea) | Request descriptions and both sides of an offer |
| `Separator` | [Separator](https://reactnativereusables.com/docs/components/separator) | Subtle divider inside request cards |

The request feed adds these official components with this command (already run):

```sh
npx --yes @react-native-reusables/cli@latest add avatar tabs textarea separator --styling-library uniwind --yes
```

Existing components and package files were preserved. The generated Textarea needed one compatibility adjustment for the installed Uniwind version: `placeholderTextColorClassName` replaces the upstream Nativewind placeholder property, and its ref uses React Native’s TextInput instance type. Its public form behavior is unchanged.

The bottom Home / Requests / Profile navigation uses [Expo Router Tabs](https://docs.expo.dev/router/advanced/tabs/), which is already bundled with this Expo version. The Reusables Tabs component is for switching content inside a screen.

The skills step adds official `Checkbox` and `Badge` with this command (already run for this project):

```sh
npx @react-native-reusables/cli@latest add checkbox badge --styling-library uniwind
```

The CLI also supplies `components/ui/icon.tsx`, which Checkbox uses to draw its checkmark. Existing Text was preserved. No package or lockfile changes were needed.

`Button`, `Input`, and `Text` were already present. During this update, official CLI **0.7.1** added `Card` and `Label` using:

```sh
npx @react-native-reusables/cli@latest add card label --styling-library uniwind
```

The automated run also supplied `--yes`. When asked to overwrite the existing `Text`, we chose **No**. The CLI did not change `package.json` or `package-lock.json`, because the required dependencies were already installed. You do not need to rerun this command now.

In another project that already has React Native Reusables and Uniwind configured, add just these five components with:

```sh
npx @react-native-reusables/cli@latest add card button input label text --styling-library uniwind
```

`add` places the official files under the aliases in `components.json`. `--styling-library uniwind` selects the version matching this project. You do not need `init` or every available component. [CLI reference](https://github.com/founded-labs/react-native-reusables/blob/main/apps/cli/README.md)

Here is a small example you can copy into a screen. It uses the same five library components and local state:

```tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';

export default function ExampleScreen() {
  const [email, setEmail] = useState('');

  return (
    <Card className="rounded-3xl shadow-none">
      <CardContent className="gap-4">
        <Label nativeID="example-email-label" htmlFor="example-email">Email</Label>
        <Input
          nativeID="example-email"
          aria-labelledby="example-email-label"
          accessibilityLabel="Email"
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
        <Button onPress={() => setEmail('learner@example.com')}>
          <Text>Fill example email</Text>
        </Button>
      </CardContent>
    </Card>
  );
}
```

The request cards use `<Badge variant="skill">` for the rounded skill pills beneath a person’s name. This is a small theme variant added to the official Badge, with `--color-skill` and `--color-skill-foreground` in `global.css`. Pills wrap on narrow screens. The skills belong to the author, not the category of help requested; a new post copies the current demo profile’s selected skills. Remote/in-person details remain on the request detail screen.

Requests and offers have different roles. Amel posts “I need a logo for my bakery,” with Baking and Cooking shown as her skills. A designer responds with “I’ll design your logo” and asks for “A custom birthday cake” in return. Amel does not choose a fixed return when posting. The two offer fields are stored separately as `offeredService` and `requestedInReturn`, and both require 10–300 characters. Sent shows what **you** offer and ask for; Received shows what **they** offer and ask for.

`className="rounded-3xl shadow-none"` customizes the existing Card. It does not create a new component. Likewise, `<Button variant="outline">` selects a library variant. Keep `Text` inside `Button` so the library can apply its button-text styles.

## Where to learn from the code

| File | Responsibility |
| --- | --- |
| `app/index.tsx` | Intro layout containing the default login form |
| `app/login.tsx`, `app/sign-up.tsx` | Direct routes sharing the same form |
| `app/skills.tsx` | Skills onboarding: category search, checkboxes, custom skills, and Continue |
| `lib/skills.ts` | Editable category catalog, search, name cleanup, and duplicate handling |
| `components/AuthLayout.tsx` | Intro animation, logo placement, scrolling, keyboard space |
| `components/AppLogo.tsx` | Supplied logo artwork and editable two-color name |
| `components/auth/AuthForm.tsx` | Direct library imports, field rendering, password visibility, and submit action |
| `components/ui/` | Official component source added by the CLI |
| `hooks/useAuthForm.ts`, `lib/auth-validation.ts` | Shared local form state and validation rules |
| `context/DemoAuthContext.tsx` | Temporary profile, skills setup status, and whether the intro has played |
| `app/(main)/(tabs)/` | Home feed, Requests, Profile, and Expo bottom-tab navigation |
| `app/(main)/new-request.tsx` | Request form using Input, Textarea, Label, and Button |
| `app/(main)/request/[id].tsx` | Request details and local offer form |
| `components/requests/RequestCard.tsx` | SwapSkill-specific post composed from official Card, Avatar, Badge, Separator, and Button |
| `lib/requests.ts` | Fictional sample posts, categories, filtering, and validation |
| `context/DemoRequestsContext.tsx` | Temporary posts, two-sided offers, and received-offer status |

Edit semantic colors such as `--color-primary` and `--color-background` in `global.css` to style library classes. `lib/theme.ts` supplies matching native navigation and logo colors. The root calls `Uniwind.setTheme('light')` to keep this design light even when the device uses dark mode. [Uniwind theming](https://docs.uniwind.dev/theming/basics)

## Check changes as you learn

Run `npm run typecheck` and `npm run test`, then try empty fields, an invalid email, mismatched passwords, both visibility buttons, account switching, valid demo submission, and End demo. In skills setup, test category filters, searches with no matches, adding a custom skill, duplicate names, removing selections, and saving several skills to Profile. In Home, search by a description or category, open a post, submit an empty offer to see both validation errors, then fill both sides and check Sent. Post a new request with only the help needed and check My posts and the feed; try empty fields first. Accept or decline the received sample offer and verify its status. Reload to see the intro again and confirm the demo profile resets.

Phone or simulator testing is still needed for native keyboard behavior, Next/Go keys, small screens, larger text, and notch/home-indicator spacing. Browser checks do not establish that these native behaviors work correctly.
