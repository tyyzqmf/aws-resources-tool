import { SideNavigationProps } from "@cloudscape-design/components";

/**
 * Define your Navigation Items here
 */
export const NavItems: SideNavigationProps.Item[] = [
  { text: "Home", type: "link", href: "/" },
  { text: "Shopping Lists", type: "link", href: "/shopping" },
  { type: "divider" },
  {
    text: "Developer Tools",
    type: "expandable-link-group",
    href: "#",
    defaultExpanded: false,
    items: [{ text: "API Explorer", type: "link", href: "/apiExplorer" }],
  },
];
