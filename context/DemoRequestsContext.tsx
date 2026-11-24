import { createContext, useContext, useRef, useState, type PropsWithChildren } from 'react';
import { useDemoAuth } from '@/context/DemoAuthContext';
import {
  canSendProposal,
  EXAMPLE_PROPOSALS,
  EXAMPLE_REQUESTS,
  validateRequest,
  type Proposal,
  type ProposalDraft,
  type RequestDraft,
  type RequestPost,
} from '@/lib/requests';

type RequestState = {
  posts: RequestPost[];
  proposals: Proposal[];
};

type DemoRequestsState = RequestState & {
  createRequest: (draft: RequestDraft) => string | null;
  sendProposal: (postId: string, draft: ProposalDraft) => boolean;
  respondToProposal: (id: string, status: 'accepted' | 'declined') => void;
};

const DemoRequestsContext = createContext<DemoRequestsState | undefined>(undefined);

// Changing the demo account or logging out starts with fresh example content.
export function DemoRequestsProvider({ children }: PropsWithChildren) {
  const { user } = useDemoAuth();
  return <RequestsSession key={user?.email ?? 'signed-out'}>{children}</RequestsSession>;
}

function RequestsSession({ children }: PropsWithChildren) {
  const { user } = useDemoAuth();
  const [state, setState] = useState<RequestState>(() => ({
    posts: EXAMPLE_REQUESTS.map((post) => ({ ...post, authorSkills: [...post.authorSkills] })),
    proposals: EXAMPLE_PROPOSALS.map((proposal) => ({ ...proposal })),
  }));
  const latest = useRef(state);
  const nextId = useRef(0);

  function updateState(next: RequestState) {
    // Read the latest action immediately, including a second tap before React renders.
    latest.current = next;
    setState(next);
  }

  function createRequest(draft: RequestDraft): string | null {
    if (!user || Object.keys(validateRequest(draft)).length > 0) return null;

    const post: RequestPost = {
      id: `request-${++nextId.current}`,
      authorId: 'me',
      authorName: user.name,
      authorSkills: [...user.skills],
      title: draft.title.trim(),
      description: draft.description.trim(),
      categoryId: draft.categoryId,
      format: draft.format,
    };
    updateState({ ...latest.current, posts: [post, ...latest.current.posts] });
    return post.id;
  }

  function sendProposal(postId: string, draft: ProposalDraft): boolean {
    const post = latest.current.posts.find((item) => item.id === postId);
    if (!user || !post || !canSendProposal(post, latest.current.proposals, draft)) return false;

    const proposal: Proposal = {
      id: `proposal-${++nextId.current}`,
      postId: post.id,
      title: post.title,
      personName: post.authorName,
      offeredService: draft.offeredService.trim(),
      requestedInReturn: draft.requestedInReturn.trim(),
      status: 'pending',
      direction: 'sent',
      example: post.example,
    };
    updateState({ ...latest.current, proposals: [proposal, ...latest.current.proposals] });
    return true;
  }

  function respondToProposal(id: string, status: 'accepted' | 'declined') {
    if (!user || (status !== 'accepted' && status !== 'declined')) return;
    const proposal = latest.current.proposals.find((item) => item.id === id);
    if (!proposal || proposal.direction !== 'received' || proposal.status !== 'pending') return;

    updateState({
      ...latest.current,
      proposals: latest.current.proposals.map((item) =>
        item.id === id ? { ...item, status } : item
      ),
    });
  }

  return (
    <DemoRequestsContext.Provider
      value={{ ...state, createRequest, sendProposal, respondToProposal }}>
      {children}
    </DemoRequestsContext.Provider>
  );
}

export function useDemoRequests(): DemoRequestsState {
  const context = useContext(DemoRequestsContext);
  if (context === undefined) {
    throw new Error('useDemoRequests must be used inside DemoRequestsProvider.');
  }
  return context;
}
