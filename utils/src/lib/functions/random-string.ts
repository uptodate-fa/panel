export function randomString(length: number, characters = 'abcdefghijklmnopqrstuvwxyz0123456789') {
  let result = '';
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}