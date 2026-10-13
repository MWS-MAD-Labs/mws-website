export const PUBLIC_SITE_NAME = 'Millennia World School';
export const NOT_FOUND_PAGE_TITLE = 'Page Not Found';

export function publicDocumentTitle(title: string) {
  return title === PUBLIC_SITE_NAME ? PUBLIC_SITE_NAME : `${title} - ${PUBLIC_SITE_NAME}`;
}
