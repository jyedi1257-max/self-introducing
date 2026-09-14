interface PromptOptions {
  trait: string;
  character: string;
  /** "조금 더 엉뚱하게!" 를 눌렀을 때 */
  extraWhimsical?: boolean;
}

/**
 * 학생이 입력한 두 단어를 그대로 모델에 넘기지 않고
 * 수업에 맞는 안전하고 일정한 프롬프트로 감싸서 만든다.
 */
export function buildImagePrompt({
  trait,
  character,
  extraWhimsical = false,
}: PromptOptions): string {
  const base = `Create one imaginative character illustration that represents:

Trait: "${trait}"
Character or metaphor: "${character}"

Interpret the two concepts together as one coherent visual character.

Style:
- friendly whimsical character illustration
- colorful classroom sticker illustration
- simple clean background
- expressive and easy to understand
- suitable for teenagers and school use
- playful rather than childish
- one clear main subject
- no realistic human portrait

Safety:
- nonviolent
- nonsexual
- no drugs
- no weapons
- no frightening gore

Do not include:
- written words
- Korean text
- English text
- logos
- watermarks
- UI elements

The image should visually communicate both "${trait}" and "${character}" without using written text.`;

  if (!extraWhimsical) return base;

  return `${base}

Make the visual metaphor more unexpected,
creative and humorous while preserving
both concepts.`;
}
