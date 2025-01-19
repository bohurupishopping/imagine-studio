export const LOCAL_FONTS = {
  Roundkey: {
    name: 'Roundkey',
    label: 'Roundkey Bold',
    path: '/font/FontsFree-Net-Roundkey-Bold.ttf',
    weight: 'bold',
    style: 'normal'
  },
  Abdullah: {
    name: 'Abdullah',
    label: 'Abdullah Lalmonirhat',
    path: '/font/Abdullah Lalmonirhat.ttf',
    weight: 'normal',
    style: 'normal'
  },
  AlQuds: {
    name: 'Al Quds',
    label: 'Al Quds V2',
    path: '/font/Al Quds V2.ttf',
    weight: 'normal',
    style: 'normal'
  },
  AlinurSirat: {
    name: 'Alinur Sirat',
    label: 'Alinur Sirat',
    path: '/font/Alinur Sirat.ttf',
    weight: 'normal',
    style: 'normal'
  },
  BrutalHonesty: {
    name: 'Brutal Honesty',
    label: 'Brutal Honesty',
    path: '/font/Brutal Honesty Demo.ttf',
    weight: 'normal',
    style: 'normal'
  },
  DirtyBrush: {
    name: 'Dirty Brush',
    label: 'Dirty Brush',
    path: '/font/DirtyBrush.ttf',
    weight: 'normal',
    style: 'normal'
  },
  Durbar: {
    name: 'Durbar',
    label: 'Durbar Regular',
    path: '/font/Durbar-Regular-400.ttf',
    weight: 'normal',
    style: 'normal'
  },
  Liakat: {
    name: 'Liakat',
    label: 'Liakat Kalikapur',
    path: '/font/Liakat Kalikapur.ttf',
    weight: 'normal',
    style: 'normal'
  },
  Maturasc: {
    name: 'Maturasc',
    label: 'Maturasc',
    path: '/font/MATURASC.TTF',
    weight: 'normal',
    style: 'normal'
  },
  Mypuma: {
    name: 'Mypuma',
    label: 'Mypuma',
    path: '/font/MYPUMA_.TTF',
    weight: 'normal',
    style: 'normal'
  },
  Niladri: {
    name: 'Niladri',
    label: 'Niladri Nodia',
    path: '/font/Niladri Nodia.ttf',
    weight: 'normal',
    style: 'normal'
  },
  ShohidTahmid: {
    name: 'Shohid Tahmid',
    label: 'Shohid Tahmid Tamin',
    path: '/font/Shohid Tahmid Tamin.ttf',
    weight: 'normal',
    style: 'normal'
  },
  Shokuntola: {
    name: 'Shokuntola',
    label: 'Shokuntola UNICODE',
    path: '/font/Shokuntola UNICODE.ttf',
    weight: 'normal',
    style: 'normal'
  }
};

export const FONT_OPTIONS = Object.values(LOCAL_FONTS).map(font => ({
  value: font.name,
  label: font.label
}));

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
