// Only reviewed words are sent to the image model; arbitrary input is rejected.
const traits = new Map(Object.entries({
  "고장 난":"slightly broken but friendly", "느린":"slow and gentle", "빠른":"swift",
  "부지런한":"hardworking", "용감한":"brave", "겁 없는":"fearless",
  "느긋한":"relaxed", "화끈한":"enthusiastic", "수줍은":"shy",
  "기억하는":"thoughtful and good at remembering", "호기심 많은":"curious",
  "꿈꾸는":"dreamy", "타버린":"lightly toasted cartoon style, unharmed",
  "배터리 없는":"sleepy and low on energy", "화가 난":"grumpy but harmless",
  "장난치는":"playful", "폭주하는":"energetic and rushing playfully",
  "배고픈":"hungry", "말하는":"chatty", "춤추는":"dancing",
  "날아가는":"flying", "조용한":"quiet", "신이 난":"excited", "착한":"kind",
  "시끄러운":"lively", "웃는":"smiling", "자유로운":"free spirited"
}));
const characters = new Map(Object.entries({
  "우주":"outer space mascot", "하늘":"sky mascot", "바다":"ocean mascot",
  "화산":"friendly volcano mascot", "떡볶이":"Korean spicy rice cake mascot",
  "아이스크림":"ice cream mascot", "김밥":"Korean rice roll mascot",
  "로봇":"robot", "공룡":"dinosaur", "외계인":"friendly alien",
  "유령":"friendly sheet ghost", "학교":"school building mascot", "힘":"strength mascot",
  "선생님":"stylized cartoon teacher mascot", "친구":"friendly cartoon companion",
  "번개":"lightning bolt mascot", "구름":"cloud mascot", "바람":"breeze mascot",
  "별":"star mascot", "보석":"gem mascot", "사자":"lion", "고양이":"cat",
  "거북이":"turtle", "문어":"octopus"
}));
export const DAILY_LIMIT = 80;
export const USER_LIMIT = 6;
export function buildPrompt(body) {
  if (!body || typeof body !== "object" || Array.isArray(body) ||
    typeof body.trait !== "string" || typeof body.character !== "string" ||
    typeof body.extraWhimsical !== "boolean") return null;
  const trait = traits.get(body.trait.normalize("NFC").trim());
  const character = characters.get(body.character.normalize("NFC").trim());
  if (!trait || !character) return null;
  return "One fully clothed, age-appropriate, friendly cartoon sticker of a " +
    character + " that is " + trait +
    ". Express both concepts visually. Colorful, simple background, single subject, no text, no logos, no violence, no weapons, no nudity, no sexual content, no gore." +
    (body.extraWhimsical ? " Use an unexpected playful visual metaphor." : "");
}
export function quotaDecision(total, user) {
  return total < DAILY_LIMIT && user < USER_LIMIT;
}
