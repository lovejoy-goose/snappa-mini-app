import { usePathname } from "wouter/use-browser-location";
import { useUserDetailsQuery } from "../hooks/queries/useOpenQuery";
import { useFrameSDK } from "../hooks/use-frame-sdk";
import { useInMemoryZustand, useZustand } from "../hooks/use-zustand";
import { formatAddress } from "../lib/utils";
import { ClickableDateSpan } from "./ClickableDateSpan";
import { ConnectModal } from "./ConnectModal";
import { ThirdWebAvatarWrapper } from "./ThirdWebAvatarWrapper";

const INCLUDE_DEBUGGING_BUTTON = false;

const routePaths = [
	"/",
	"/just-tip",
	"/palomino",
	"/decent-bookmarks",
	"/sassy",
	"/snappa",
	"/ape",
];
const routeNames = [
	"Snappa",
	"Just Tip",
	"Mino",
	"Decent Bookmarks",
	"SassyHash",
	"Snappa",
	"Snappa Swappa",
];
const routeIcons = ["🐟", "🤏", "🐴", "🔖", "💅", "🐟", "🦧"];

export const flatFish = (size = 24) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
		class="lucide lucide-fish-icon lucide-fish flip-horizontal"
		style={{ transform: "scaleX(-1)" }}
	>
		<title>Snappa</title>
		<path d="M6.5 12c.94-3.46 4.94-6 8.5-6 3.56 0 6.06 2.54 7 6-.94 3.47-3.44 6-7 6s-7.56-2.53-8.5-6Z" />
		<path d="M18 12v.5" />
		<path d="M16 17.93a9.77 9.77 0 0 1 0-11.86" />
		<path d="M7 10.67C7 8 5.58 5.97 2.73 5.5c-1 1.5-1 5 .23 6.5-1.24 1.5-1.24 5-.23 6.5C5.58 18.03 7 16 7 13.33" />
		<path d="M10.46 7.26C10.2 5.88 9.17 4.24 8 3h5.8a2 2 0 0 1 1.98 1.67l.23 1.4" />
		<path d="m16.01 17.93-.23 1.4A2 2 0 0 1 13.8 21H9.5a5.96 5.96 0 0 0 1.49-3.98" />
	</svg>
);

const NavBar = () => {
	const pathname = usePathname();
	const { jwt, warpletAddress } = useInMemoryZustand();
	const { showFees, showNerd, toggleShowFees, toggleShowNerd } = useZustand();
	const { context, contextFid } = useFrameSDK();

	const { data } = useUserDetailsQuery(contextFid);
	const { user } = data ?? {};

	const routeIndex = routePaths.indexOf(pathname);
	const routeName = routeNames[routeIndex];
	const routeIcon = routeIcons[routeIndex];

	const isSwapFlow = pathname === "/ape";
	const isSnappaRoute = pathname === "/snappa" || pathname === "/";

	return (
		<div className="navbar">
			<div className="navbar-start">
				<div className="flex items-center gap-2">
					{routeIcon} {routeName}{" "}
					{user?.proNft?.order ? (
						<span className="text-xs">
							<span className="font-bold text-2xl text-purple-700 dark:text-purple-500">
								✓
							</span>{" "}
							#{user.proNft.order.toLocaleString()}{" "}
							{user.proNft.timestamp ? "since " : ""}
							{user.proNft.timestamp ? (
								<ClickableDateSpan timestamp={user.proNft.timestamp} />
							) : null}
						</span>
					) : null}
				</div>
			</div>

			<div className="navbar-end">
				<div className="flex gap-8 items-center">
					{isSwapFlow && (
						<div className="flex gap-12">
							<div className="flex gap-2">
								<i
									className={`${showFees ? "ri-zoom-out-line" : "ri-zoom-in-line"} w-6 h-6`}
									onClick={toggleShowFees}
									onKeyDown={(e) => {
										if (e.key === "Enter") {
											toggleShowFees();
										}
									}}
								/>{" "}
								{INCLUDE_DEBUGGING_BUTTON ? (
									<i
										className={`${showNerd ? "ri-spy-fill" : "ri-spy-line"} w-6 h-6`}
										onClick={toggleShowNerd}
										onKeyDown={(e) => {
											if (e.key === "Enter") {
												toggleShowNerd();
											}
										}}
									/>
								) : null}
							</div>
						</div>
					)}

					{!contextFid && isSnappaRoute ? (
						<div>
							<ConnectModal />
						</div>
					) : null}

					{jwt ? (
						<div className="dropdown dropdown-end">
							<button
								type="button"
								tabIndex={0}
								className="btn btn-ghost btn-circle avatar"
							>
								<div className="w-6 h-6 rounded-full">
									{contextFid ? (
										<img
											src={context?.user.pfpUrl}
											alt={context?.user.username}
											className="w-full h-full object-cover"
										/>
									) : (
										<ThirdWebAvatarWrapper />
									)}
								</div>
							</button>
							<div className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100">
								{warpletAddress && (
									<div className="mx-4 text-sm text-muted-foreground">
										{formatAddress(warpletAddress)}
									</div>
								)}
							</div>
						</div>
					) : (
						flatFish(18)
					)}
				</div>
			</div>
		</div>
	);
};

export default NavBar;
