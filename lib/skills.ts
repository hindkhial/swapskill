export type SkillCategory = {
  id: string;
  name: string;
  skills: string[];
};

export const SKILL_CATEGORIES: SkillCategory[] = [
  {
    id: 'technology',
    name: 'Technology',
    skills: [
      'Software development',
      'Web applications',
      'Mobile applications',
      'Computer troubleshooting',
      'Data analysis',
      'Spreadsheets',
    ],
  },
  {
    id: 'design',
    name: 'Design & media',
    skills: [
      'Graphic design',
      'Photoshop',
      'Photography',
      'Video editing',
      'Illustration',
      'Presentation design',
    ],
  },
  {
    id: 'languages',
    name: 'Languages',
    skills: ['English', 'Spanish', 'French', 'Arabic', 'German', 'Italian'],
  },
  {
    id: 'home',
    name: 'Home & repairs',
    skills: [
      'Electrical work',
      'Plumbing',
      'Painting',
      'Carpentry',
      'Furniture assembly',
      'Gardening',
    ],
  },
  {
    id: 'everyday',
    name: 'Everyday help',
    skills: ['Cooking', 'Baking', 'Sewing', 'Bicycle repair', 'Fitness', 'Music'],
  },
  {
    id: 'business',
    name: 'Business',
    skills: [
      'Writing',
      'Social media',
      'Marketing',
      'Bookkeeping',
      'Public speaking',
      'Project management',
    ],
  },
];

export function cleanSkillLabel(value: string): string {
  return value.normalize('NFC').trim().replace(/\s+/g, ' ');
}

export function skillKey(value: string): string {
  return cleanSkillLabel(value).toLowerCase();
}

export function findKnownSkill(value: string): string | undefined {
  const key = skillKey(value);
  for (const category of SKILL_CATEGORIES) {
    const match = category.skills.find((skill) => skillKey(skill) === key);
    if (match) return match;
  }
  return undefined;
}

export function normalizeProfileSkills(values: readonly string[]): string[] {
  const skills: string[] = [];
  const seen = new Set<string>();

  for (const value of values) {
    const cleaned = cleanSkillLabel(value);
    if (!cleaned || cleaned.length > 60) continue;

    const label = findKnownSkill(cleaned) ?? cleaned;
    const key = skillKey(label);
    if (!seen.has(key)) {
      skills.push(label);
      seen.add(key);
    }
  }

  return skills;
}

export function filterSkillCategories(query: string, categoryId = 'all'): SkillCategory[] {
  const search = skillKey(query);
  const results: SkillCategory[] = [];

  for (const category of SKILL_CATEGORIES) {
    if (categoryId !== 'all' && category.id !== categoryId) continue;

    const matchesCategory = skillKey(category.name).includes(search);
    const skills = category.skills.filter(
      (skill) => matchesCategory || skillKey(skill).includes(search)
    );
    if (skills.length > 0) {
      results.push({ ...category, skills });
    }
  }

  return results;
}
