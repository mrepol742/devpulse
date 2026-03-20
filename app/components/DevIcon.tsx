export const getDevIcon = (lang: string) => {
  if (!lang) return null;
  return <i className={`devicon-${lang.toLowerCase()}-plain colored`} />;
};
