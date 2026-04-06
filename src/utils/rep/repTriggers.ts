export const GIVEREP_TRIGGERS = [
  '+rep',
  'thanks',
  'thank',
  'thx',
  'ty',
  'thnx',
  'tnx',
  'tysm',
  'tyvm',
  'thanx',
] as const;

export const GIVEREP_TRIGGERS_REGEX = new RegExp(
  `(?<!\\w)(${GIVEREP_TRIGGERS.map((trigger) => `(${escapeRegex(trigger)}+)`).join('|')})(?!\\w)`,
  'i',
);

function escapeRegex(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function containsGiveRepTrigger(content: string): boolean {
  return GIVEREP_TRIGGERS_REGEX.test(content.toLowerCase());
}
