import assert from 'node:assert/strict';
import test from 'node:test';
import {
  canSendProposal,
  EXAMPLE_PROPOSALS,
  EXAMPLE_REQUESTS,
  filterRequests,
  makeInitials,
  validateProposal,
  validateRequest,
  type Proposal,
  type ProposalDraft,
  type RequestDraft,
} from '../lib/requests.ts';

const validDraft: RequestDraft = {
  title: 'Create a portfolio website',
  description: 'I need a one-page website to display six photography projects.',
  categoryId: 'technology',
  format: 'Remote',
};

const validProposal: ProposalDraft = {
  offeredService: 'I can build a responsive one-page portfolio website.',
  requestedInReturn: 'I would like a custom portrait illustration for my profile.',
};

test('a complete request and all example requests pass validation', () => {
  assert.deepEqual(validateRequest(validDraft), {});
  for (const post of EXAMPLE_REQUESTS) assert.deepEqual(validateRequest(post), {});
});

test('missing request fields all produce errors', () => {
  const errors = validateRequest({
    title: ' ',
    description: '',
    categoryId: '',
    format: '' as RequestDraft['format'],
  });
  assert.deepEqual(Object.keys(errors).sort(), ['categoryId', 'description', 'format', 'title']);
});

test('request length limits are inclusive and ignore surrounding whitespace', () => {
  for (const [field, minimum, maximum] of [
    ['title', 5, 80],
    ['description', 20, 500],
  ] as const) {
    for (const length of [minimum - 1, maximum + 1]) {
      assert.ok(validateRequest({ ...validDraft, [field]: 'x'.repeat(length) })[field]);
    }
    for (const length of [minimum, maximum]) {
      assert.deepEqual(
        validateRequest({ ...validDraft, [field]: `  ${'x'.repeat(length)}  ` }),
        {}
      );
    }
  }
});

test('request category and format must be recognized values', () => {
  assert.ok(validateRequest({ ...validDraft, categoryId: 'unknown' }).categoryId);
  assert.ok(validateRequest({ ...validDraft, format: 'Online' as RequestDraft['format'] }).format);
  assert.deepEqual(validateRequest({ ...validDraft, format: 'In person' }), {});
});

test('request search matches descriptions, categories, and author names', () => {
  assert.deepEqual(
    filterRequests(EXAMPLE_REQUESTS, ' SPANISH ').map((post) => post.id),
    ['example-translation']
  );
  assert.deepEqual(
    filterRequests(EXAMPLE_REQUESTS, 'developer').map((post) => post.id),
    ['example-website']
  );
  assert.deepEqual(
    filterRequests(EXAMPLE_REQUESTS, 'Home & repairs').map((post) => post.id),
    ['example-electrical']
  );
  assert.deepEqual(
    filterRequests(EXAMPLE_REQUESTS, 'Amel K.').map((post) => post.id),
    ['example-logo']
  );
});

test('request category filters combine with query and preserve source order', () => {
  assert.deepEqual(filterRequests(EXAMPLE_REQUESTS, '', 'all'), EXAMPLE_REQUESTS);
  assert.deepEqual(
    filterRequests(EXAMPLE_REQUESTS, '', 'languages').map((post) => post.id),
    ['example-translation']
  );
  assert.deepEqual(filterRequests(EXAMPLE_REQUESTS, 'Spanish', 'technology'), []);
  assert.deepEqual(filterRequests(EXAMPLE_REQUESTS, 'not a real request'), []);
  assert.deepEqual(filterRequests(EXAMPLE_REQUESTS, '', 'unknown'), []);
});

test('validation and searching leave their inputs unchanged', () => {
  const draft = Object.freeze({ ...validDraft, title: ` ${validDraft.title} ` });
  const posts = Object.freeze(EXAMPLE_REQUESTS.map((post) => Object.freeze({ ...post })));
  const snapshot = structuredClone(posts);
  validateRequest(draft);
  filterRequests(posts, 'website');
  assert.equal(draft.title, ` ${validDraft.title} `);
  assert.deepEqual(posts, snapshot);
});

test('initials use first and last names, handle whitespace, and provide a fallback', () => {
  assert.equal(makeInitials('  Mina   Ben Ali '), 'MA');
  assert.equal(makeInitials('Élodie'), 'É');
  assert.equal(makeInitials('Sam R.'), 'SR');
  assert.equal(makeInitials(' \n '), '?');
});

test('a complete two-sided proposal and the received example pass validation', () => {
  assert.deepEqual(validateProposal(validProposal), {});
  for (const proposal of EXAMPLE_PROPOSALS) assert.deepEqual(validateProposal(proposal), {});
});

test('proposals require both an offered service and a requested return', () => {
  assert.deepEqual(
    Object.keys(validateProposal({ offeredService: ' ', requestedInReturn: '\n' })).sort(),
    ['offeredService', 'requestedInReturn']
  );
  assert.ok(validateProposal({ ...validProposal, offeredService: '' }).offeredService);
  assert.ok(validateProposal({ ...validProposal, requestedInReturn: '' }).requestedInReturn);
});

test('both proposal terms require 10 to 300 characters after trimming', () => {
  for (const field of ['offeredService', 'requestedInReturn'] as const) {
    for (const length of [0, 9, 301]) {
      assert.ok(validateProposal({ ...validProposal, [field]: 'x'.repeat(length) })[field]);
    }
    for (const length of [10, 300]) {
      assert.deepEqual(
        validateProposal({ ...validProposal, [field]: ` ${'x'.repeat(length)} ` }),
        {}
      );
    }
  }
});

test('proposal validation leaves the sender’s terms unchanged', () => {
  const draft = Object.freeze({
    offeredService: ` ${validProposal.offeredService} `,
    requestedInReturn: ` ${validProposal.requestedInReturn} `,
  });
  assert.deepEqual(validateProposal(draft), {});
  assert.equal(draft.offeredService, ` ${validProposal.offeredService} `);
  assert.equal(draft.requestedInReturn, ` ${validProposal.requestedInReturn} `);
});

test('proposals need a real request owned by someone else and two valid terms', () => {
  const post = EXAMPLE_REQUESTS[0];
  assert.equal(canSendProposal(undefined, [], validProposal), false);
  assert.equal(canSendProposal({ ...post, authorId: 'me' }, [], validProposal), false);
  assert.equal(canSendProposal(post, [], { ...validProposal, offeredService: '' }), false);
  assert.equal(canSendProposal(post, [], { ...validProposal, requestedInReturn: '' }), false);
  assert.equal(canSendProposal(post, [], validProposal), true);
});

test('a proposal cannot be sent twice for the same request regardless of its status', () => {
  const post = EXAMPLE_REQUESTS[0];
  const proposal: Proposal = {
    id: 'test-proposal',
    postId: post.id,
    title: post.title,
    personName: post.authorName,
    ...validProposal,
    status: 'pending',
    direction: 'sent',
  };
  for (const status of ['pending', 'accepted', 'declined'] as const) {
    assert.equal(canSendProposal(post, [{ ...proposal, status }], validProposal), false);
  }
  assert.equal(
    canSendProposal(post, [{ ...proposal, postId: 'another-request' }], validProposal),
    true
  );
  assert.equal(
    canSendProposal(post, [{ ...proposal, direction: 'received' }], validProposal),
    true
  );
});
