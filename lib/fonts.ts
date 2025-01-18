export const LOCAL_FONTS = {
  Roundkey: {
    name: 'Roundkey',
    label: 'Roundkey Bold',
    path: '/font/FontsFree-Net-Roundkey-Bold.ttf',
    weight: 'bold',
    style: 'normal'
  },
  LiShohid: {
    name: 'Li Shohid Tahmid',
    label: 'Li Shohid',
    path: '/font/Li Shohid Tahmid Tamin Unicode.ttf',
    weight: 'normal',
    style: 'normal'
  }
};

export const FONT_OPTIONS = [
  { value: LOCAL_FONTS.Roundkey.name, label: LOCAL_FONTS.Roundkey.label },
  { value: LOCAL_FONTS.LiShohid.name, label: LOCAL_FONTS.LiShohid.label },
  { value: 'Noto Sans Bengali', label: 'Noto Sans' },
  { value: 'Hind Siliguri', label: 'Hind Siliguri' },
  { value: 'Kalpurush', label: 'Kalpurush' }
];

export const generateFontFaceStyles = () => {
  return Object.values(LOCAL_FONTS)
    .map(font => `
      @font-face {
        font-family: '${font.name}';
        src: url('${font.path}') format('truetype');
        font-weight: ${font.weight};
        font-style: ${font.style};
      }
    `)
    .join('\n');
};

export const useFontLoader = () => {
  const injectFontStyles = () => {
    const style = document.createElement('style');
    style.textContent = generateFontFaceStyles();
    document.head.appendChild(style);
    return style;
  };

  return { injectFontStyles };
};