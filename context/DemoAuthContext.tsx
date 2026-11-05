import { createContext, useCallback, useContext, useState, type PropsWithChildren } from 'react';
import { normalizeProfileSkills } from '@/lib/skills';

type DemoUser = {
  name: string;
  email: string;
  skills: string[];
};

type DemoSession = { user: DemoUser | null; needsSkills: boolean };

type DemoAuthState = {
  user: DemoUser | null;
  needsSkills: boolean;
  startDemo: (user: Pick<DemoUser, 'name' | 'email'>, options?: { needsSkills?: boolean }) => void;
  completeSkills: (skills: string[]) => void;
  endDemo: () => void;
  hasSeenIntro: boolean;
  finishIntro: () => void;
};

const DemoAuthContext = createContext<DemoAuthState | undefined>(undefined);

// This only personalizes the demo. It does not authenticate anyone or store credentials.
export function DemoAuthProvider({ children }: PropsWithChildren) {
  const [demo, setDemo] = useState<DemoSession>({ user: null, needsSkills: false });
  const [hasSeenIntro, setHasSeenIntro] = useState(false);
  const finishIntro = useCallback(() => setHasSeenIntro(true), []);

  function startDemo(
    nextUser: Pick<DemoUser, 'name' | 'email'>,
    options?: { needsSkills?: boolean }
  ) {
    setDemo({
      user: { name: nextUser.name.trim(), email: nextUser.email.trim(), skills: [] },
      needsSkills: options?.needsSkills ?? false,
    });
  }

  function completeSkills(skills: string[]) {
    const profileSkills = normalizeProfileSkills(skills);
    if (profileSkills.length === 0) return;
    setDemo((current) =>
      current.user
        ? { user: { ...current.user, skills: profileSkills }, needsSkills: false }
        : current
    );
  }

  function endDemo() {
    setDemo({ user: null, needsSkills: false });
  }

  return (
    <DemoAuthContext.Provider
      value={{ ...demo, startDemo, completeSkills, endDemo, hasSeenIntro, finishIntro }}>
      {children}
    </DemoAuthContext.Provider>
  );
}

export function useDemoAuth(): DemoAuthState {
  const context = useContext(DemoAuthContext);
  if (context === undefined) {
    throw new Error('useDemoAuth must be used inside DemoAuthProvider.');
  }
  return context;
}
