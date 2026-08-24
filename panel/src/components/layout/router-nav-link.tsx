import { NavLink, type NavLinkProps } from "@mantine/core";
import { createLink, type LinkComponent } from "@tanstack/react-router";
import { forwardRef } from "react";

type Props = Omit<NavLinkProps, "href">;

// createLink needs a component that accepts anchor props + a forwarded ref.
// Mantine styles NavLink through data-active on the root <a>, which TanStack
// sets via activeProps when the link matches.
const MantineNavLink = forwardRef<HTMLAnchorElement, Props>((props, ref) => (
	<NavLink ref={ref} {...props} />
));

const CreatedNavLink = createLink(MantineNavLink);

export const RouterNavLink: LinkComponent<typeof MantineNavLink> = (props) => (
	// preload stays off: on this API GET mutates (reboot, delete, PTZ), and
	// even read-only preloads fork shell scripts on mouse movement.
	<CreatedNavLink
		preload={false}
		activeProps={{ "data-active": true }}
		{...props}
	/>
);
