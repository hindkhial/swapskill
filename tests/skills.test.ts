import assert from 'node:assert/strict';
import test from 'node:test';
import {
  cleanSkillLabel,
  filterSkillCategories,
  findKnownSkill,
  normalizeProfileSkills,
  SKILL_CATEGORIES,
  skillKey,
} from '../lib/skills.ts';

test('skill labels collapse whitespace and normalize equivalent Unicode characters', () => {
  assert.equal(cleanSkillLabel('  Cafe\u0301\t\n drawing  '), 'Café drawing');
  assert.equal(skillKey('  CAFÉ   Drawing '), 'café drawing');
  assert.equal(cleanSkillLabel(' \n\t '), '');
});

test('known skills return their catalog spelling without matching partial labels', () => {
  assert.equal(findKnownSkill('  WEB   APPLICATIONS '), 'Web applications');
  assert.equal(findKnownSkill('english'), 'English');
  assert.equal(findKnownSkill('electrical work'), 'Electrical work');
  assert.equal(findKnownSkill('applications'), undefined);
  assert.equal(findKnownSkill('Pottery'), undefined);
});

test('profile skills canonicalize catalog labels and deduplicate custom skills in order', () => {
  assert.deepEqual(
    normalizeProfileSkills([
      ' ENGLISH ',
      'english',
      'Pottery',
      '  pottery  ',
      'Web   applications',
      'Spanish',
    ]),
    ['English', 'Pottery', 'Web applications', 'Spanish']
  );
  assert.deepEqual(normalizeProfileSkills(['Cafe\u0301 drawing', 'CAFÉ DRAWING']), [
    'Café drawing',
  ]);
});

test('profile skills drop blank and overlong values after cleaning', () => {
  const longestValid = 'x'.repeat(60);
  assert.deepEqual(
    normalizeProfileSkills(['', ' \n ', 'x'.repeat(61), `  ${longestValid}  `, '  Music  ']),
    [longestValid, 'Music']
  );
});

test('normalizing profile skills does not change the caller array', () => {
  const values = Object.freeze([' english ', 'ENGLISH', '  Pottery ']);
  assert.deepEqual(normalizeProfileSkills(values), ['English', 'Pottery']);
  assert.deepEqual(values, [' english ', 'ENGLISH', '  Pottery ']);
});

test('skill name search is case insensitive and preserves groups', () => {
  assert.deepEqual(filterSkillCategories(' APPLICATIONS '), [
    {
      id: 'technology',
      name: 'Technology',
      skills: ['Web applications', 'Mobile applications'],
    },
  ]);
});

test('matching a category name includes all skills in that category', () => {
  const languages = SKILL_CATEGORIES.find((category) => category.id === 'languages');
  assert.deepEqual(filterSkillCategories('LANGUAGES'), [languages]);
  assert.deepEqual(filterSkillCategories('Home & repairs'), [
    SKILL_CATEGORIES.find((category) => category.id === 'home'),
  ]);
});

test('category filters work with search and empty queries', () => {
  assert.deepEqual(filterSkillCategories('Spanish', 'languages')[0]?.skills, ['Spanish']);
  assert.deepEqual(filterSkillCategories('Spanish', 'technology'), []);
  assert.deepEqual(filterSkillCategories('', 'design'), [
    SKILL_CATEGORIES.find((category) => category.id === 'design'),
  ]);
  assert.deepEqual(filterSkillCategories('not in the catalog'), []);
  assert.deepEqual(filterSkillCategories('', 'unknown'), []);
});

test('empty searches return independent copies and never mutate the catalog', () => {
  const snapshot = structuredClone(SKILL_CATEGORIES);
  const results = filterSkillCategories('   ');
  assert.deepEqual(results, snapshot);
  assert.deepEqual(filterSkillCategories('', 'all'), snapshot);
  results[0].skills.push('Custom result');
  results[0].name = 'Changed result';
  assert.deepEqual(SKILL_CATEGORIES, snapshot);
});
