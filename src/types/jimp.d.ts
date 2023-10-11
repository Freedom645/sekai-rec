import J from 'jimp';

type JimpType = J & typeof J;

declare global {
  const Jimp: JimpType;
}
