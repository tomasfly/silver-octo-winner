export function generateRandomSpanishMobileNumber(): string {
  const randomEightDigits = Math.floor(Math.random() * 100000000)
    .toString()
    .padStart(8, "0");

  return `6${randomEightDigits}`;
}

export function generateRandomDni(): string {
  const randomEightDigits = Math.floor(Math.random() * 100000000)
    .toString()
    .padStart(8, "0");

  return `${randomEightDigits}A`;
}
