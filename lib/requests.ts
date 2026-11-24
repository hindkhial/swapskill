import { SKILL_CATEGORIES } from './skills.ts';

export type RequestPost = {
  id: string;
  authorName: string;
  authorId: string;
  authorSkills: string[];
  title: string;
  description: string;
  categoryId: string;
  format: 'Remote' | 'In person';
  example?: boolean;
};

export type RequestDraft = Pick<RequestPost, 'title' | 'description' | 'categoryId' | 'format'>;

export type RequestErrors = Partial<Record<keyof RequestDraft, string>>;

export type Proposal = {
  id: string;
  postId: string | null;
  title: string;
  personName: string;
  offeredService: string;
  requestedInReturn: string;
  status: 'pending' | 'accepted' | 'declined';
  direction: 'sent' | 'received';
  example?: boolean;
};

export type ProposalDraft = Pick<Proposal, 'offeredService' | 'requestedInReturn'>;

export type ProposalErrors = Partial<Record<keyof ProposalDraft, string>>;

export const REQUEST_CATEGORIES = SKILL_CATEGORIES.map(({ id, name }) => ({ id, name }));

export const EXAMPLE_REQUESTS: RequestPost[] = [
  {
    id: 'example-website',
    authorName: 'Sam R.',
    authorId: 'example-sam',
    authorSkills: ['Illustration', 'Photoshop'],
    title: 'Build a one-page portfolio website',
    description:
      'I’m looking for a developer to build a simple portfolio for my illustrations. I have the images and text ready, and need a page that works on phones too.',
    categoryId: 'technology',
    format: 'Remote',
    example: true,
  },
  {
    id: 'example-electrical',
    authorName: 'Nora A.',
    authorId: 'example-nora',
    authorSkills: ['Graphic design', 'Illustration'],
    title: 'Replace a faulty light switch',
    description:
      'I need an electrician to check and replace a faulty light switch in my hallway. I can share photos and arrange a suitable time for the electrical work.',
    categoryId: 'home',
    format: 'In person',
    example: true,
  },
  {
    id: 'example-translation',
    authorName: 'Leo M.',
    authorId: 'example-leo',
    authorSkills: ['Video editing', 'Photography'],
    title: 'Translate a short flyer into Spanish',
    description:
      'Our community event needs a Spanish version of a one-page English flyer. I’d like a finished translation that sounds natural and keeps the event details clear.',
    categoryId: 'languages',
    format: 'Remote',
    example: true,
  },
  {
    id: 'example-logo',
    authorName: 'Amel K.',
    authorId: 'example-amel',
    authorSkills: ['Baking', 'Cooking'],
    title: 'Design a logo for my small bakery',
    description:
      'I need a simple logo for my bakery’s packaging and social pages. I can share the name, colors, and a few references to help with the design.',
    categoryId: 'design',
    format: 'Remote',
    example: true,
  },
  {
    id: 'example-bicycle',
    authorName: 'Alex T.',
    authorId: 'example-alex',
    authorSkills: ['Photography', 'Photoshop'],
    title: 'Repair a puncture on my bicycle',
    description:
      'My bicycle’s rear tire has a puncture and needs a repair. I can bring the bike and a replacement inner tube to a convenient meeting place.',
    categoryId: 'everyday',
    format: 'In person',
    example: true,
  },
  {
    id: 'example-copy',
    authorName: 'Jules D.',
    authorId: 'example-jules',
    authorSkills: ['Spreadsheets', 'Data analysis'],
    title: 'Polish the copy for my website',
    description:
      'I need someone to rewrite the introduction and service descriptions on my small business website. There are about 400 words, and I’m aiming for clear, friendly copy.',
    categoryId: 'business',
    format: 'Remote',
    example: true,
  },
];

export const EXAMPLE_PROPOSALS: Proposal[] = [
  {
    id: 'example-proposal-mina',
    postId: null,
    title: 'Design a logo for my small bakery',
    personName: 'Mina B.',
    offeredService:
      'I can design a bakery logo and provide versions for packaging and social media.',
    requestedInReturn:
      'I would like a custom birthday cake for eight people, with the design agreed together.',
    status: 'pending',
    direction: 'received',
    example: true,
  },
];

export function validateRequest(draft: RequestDraft): RequestErrors {
  const errors: RequestErrors = {};
  const title = draft.title.trim();
  const description = draft.description.trim();

  if (title.length < 5 || title.length > 80) {
    errors.title = 'Write a title between 5 and 80 characters.';
  }
  if (description.length < 20 || description.length > 500) {
    errors.description = 'Describe what you need in 20 to 500 characters.';
  }
  if (!REQUEST_CATEGORIES.some((category) => category.id === draft.categoryId)) {
    errors.categoryId = 'Choose a category for your request.';
  }
  if (draft.format !== 'Remote' && draft.format !== 'In person') {
    errors.format = 'Choose remote or in person.';
  }

  return errors;
}

export function validateProposal(draft: ProposalDraft): ProposalErrors {
  const errors: ProposalErrors = {};
  const offeredService = draft.offeredService.trim();
  const requestedInReturn = draft.requestedInReturn.trim();

  if (offeredService.length < 10 || offeredService.length > 300) {
    errors.offeredService = 'Describe what you can do in 10 to 300 characters.';
  }
  if (requestedInReturn.length < 10 || requestedInReturn.length > 300) {
    errors.requestedInReturn = 'Describe what you would like in return in 10 to 300 characters.';
  }

  return errors;
}

export function filterRequests(
  posts: readonly RequestPost[],
  query: string,
  categoryId = 'all'
): RequestPost[] {
  const search = query.trim().toLowerCase();
  return posts.filter((post) => {
    if (categoryId !== 'all' && post.categoryId !== categoryId) return false;
    const categoryName = REQUEST_CATEGORIES.find(
      (category) => category.id === post.categoryId
    )?.name;
    const searchableText = [
      post.title,
      post.description,
      post.authorName,
      post.format,
      categoryName,
    ]
      .join(' ')
      .toLowerCase();
    return searchableText.includes(search);
  });
}

export function makeInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  const first = Array.from(parts[0])[0];
  const last = parts.length > 1 ? Array.from(parts[parts.length - 1])[0] : '';
  return `${first}${last}`.toUpperCase();
}

export function canSendProposal(
  post: RequestPost | undefined,
  proposals: readonly Proposal[],
  draft: ProposalDraft
): boolean {
  return (
    !!post &&
    post.authorId !== 'me' &&
    Object.keys(validateProposal(draft)).length === 0 &&
    !proposals.some((proposal) => proposal.direction === 'sent' && proposal.postId === post.id)
  );
}
