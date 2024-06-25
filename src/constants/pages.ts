export const PAGES = [10, 20, 40, 50]

export const pageSelect = PAGES.map((page) => ({
  label: page.toString(),
  value: page
}))
