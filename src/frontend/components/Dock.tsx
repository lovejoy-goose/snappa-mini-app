import { Link, useLocation } from "wouter";

const showLabel = false;
const SHOW_JUST_TIP = false;
const SHOW_MINO = false;
const SHOW_APE = true;

export const Dock = () => {
	const [location] = useLocation();
	const isActive = (path: string) => location === path;

	return (
		<div className="dock dock-lg flex items-center justify-center scale-120">
			<button
				type="button"
				className={isActive("/snappa") || isActive("/") ? "dock-active" : ""}
			>
				<Link
					to="/snappa"
					className="flex flex-col items-center justify-center"
				>
					<span className={isActive("/snappa") ? "animate-bounce" : ""}>
						🐟
					</span>
					{showLabel && <span className="dock-label">Snappa</span>}
				</Link>
			</button>

			{SHOW_JUST_TIP ? (
				<button
					type="button"
					className={isActive("/just-tip") ? "dock-active" : ""}
				>
					<Link
						to="/just-tip"
						className="flex flex-col items-center justify-center"
					>
						<img
							src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAACXBIWXMAAAsTAAALEwEAmpwYAAABSklEQVR4nN3UMUtcURCG4Wd1USSFLEFsRFhCsDGaQiKi0UasIihWIqmEFLEQQQsLIWUIgmAtIhJBAzERFAsRQYJBiGn8Q3JhhPXuvbqyVr7dGYbvzHwz5/AcKOEtXqFYj1ALvuMcG9jDJf7jN75hFkNoq0XwBz5mxAvoxCjmsI6zuDCXwVRCQ8Rm8AG90UElxyjL4RA9Fec1bGIRX7CFi2j/JKxJzo1ZYm9wlIolLb3IufxlDK0pr7odjKRiXzEdbS7gD/7iX1S5HLZU0R0tZFWRTPsa86lqi7EFk1mCPzGgNt5hJcSu0J9OeI+DGoTaw+NdTIV/yfLfoRRedDwg1hrejd2XVMAvTDwgNhwvJdnDe1mKPcrjNU6xjS41UI7JrmZs/3gY3ueRFPA59up2yp/ioirDH0M5RJKnt4/mesQqq00GVNff92TcAI8LNc7nhL1rAAAAAElFTkSuQmCC"
							alt="tiny"
							className={`dark:hidden ${isActive("/just-tip") ? "animate-bounce" : ""}`}
						/>
						<span
							className={`hidden dark:block ${isActive("/just-tip") ? "animate-bounce" : ""}`}
						>
							🤏
						</span>
						{showLabel && <span className="dock-label">Just Tip</span>}
					</Link>
				</button>
			) : null}

			{SHOW_MINO ? (
				<button
					type="button"
					className={isActive("/palomino") ? "dock-active" : ""}
				>
					<Link
						to="/palomino"
						className="flex flex-col items-center justify-center"
					>
						<img
							src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAACXBIWXMAAAsTAAALEwEAmpwYAAADyklEQVR4nGNgGAVDDcjLqytoqunHMDAwMNHFQklJYy5HS7NtRRHuzx3NzR8yMDAw0swyJSUtORtT0yI/O/MNdqZmd89OTf/3dGn+f3ND490uJoaxZnp6itS0j8nFzKQk0MHiUY6vza/JyY7/2xNc/1+ekfn/1YrC/9taY381R9m92FLq/n9qiuPHGCezdopttDEzDvG1NXveFefwb3u5x38QnpPp+v/kpFSwpSC8pSnm/8o8178w+YVZLt+cjPUdybJQRUWF3dXCZENhoM3vbWXuYANheEauL9xSGF5TE/6/K8Hp3ZYyj//byj3++9mY5pFsqZKSMb+bpcmdGWnOcMumpLj8n5fl8n9pntv/gz1JGBaD8KNF+f+LQx0v1oTaXNfQMBUm2VJ3S5PHi7JdUHwZ524NpidnemG1FIbPT838Z2tsuptUzzK5WZpeXJSF8CkIT093+d+R7Pl/fYn7/zU1kVgtXFMf8z/U1Q7Mzgt1e6qkqalKtK1u5qatyIkIFF8gemaO1/9l5cH/J6e5/3+2rACrxWempv+fURAKZt+Zn/PfydL8NANDKDNBS2VkLDhDHcw/IPu0JNgWTC8qDf6/pi7q/4rKMLzBjIy3tsZ9tzM1XUTQYhUVDfuGSHuULNOa4PZ/VYHb/90d8f9fLi8EY5ChT5fk/z85KY2g5QvKwz/ZmZp347XYxsA0c0KiI9y3s/P9/0/N8Pg/Oc31//NlCMMeLMr7v70t4f/OjoSfk3IC3xKyvDPd74O7tVklTotllTW1S4NtwYXAghzX/6cmpf6fkeXxfyZant3fnfR/Z3v8DxtT0zW2pqYLl1ZHfsZn8fzSkP+B9uZ38Po60M7sxdYyj/9ToFmmMc7t/+GeRLghZ6em/z82IeW/u43FBWjCYbQxNi0PdLK+Vp/g82JBWcTPExMhJdrNudmgeP5/enLafx9bi114LXazMI0uCrL5u7ExCqz5xtxsFNevb4wBW25vZtaDppVRTk5XSU5J09nO1HTvhsa4H+CUPiXtf32izy8dHf0AvBaD49rEZP+hnuQ/2IJtbUMMOFHZm5n14jTA3p7FytC4zNnS7ICfvfVRaxPTLaDqk6DF8vLyHI7m5sdOT037i27x3s6k/1dmZf53tjDfy0ALIC6ux+1kYX78YG/Sb2SLQfXuxqbY/34O1tcZaAW0tLTYHMxNV88qCv2EXjRGedjdZ6A1sDI2TQlzt719uC/lH6xoDHC2vspAD6CkZMxvY2raHehsfbU4wuOJvZnZCgZ6A0k1NRFRLS0euls8CoYUAACN1eSVFaIn0gAAAABJRU5ErkJggg=="
							alt="horse"
							className={`dark:hidden ${isActive("/palomino") ? "animate-bounce" : ""}`}
						/>
						<span
							className={`hidden dark:block ${isActive("/palomino") ? "animate-bounce" : ""}`}
						>
							🐴
						</span>
						{showLabel && <span className="dock-label">Mino</span>}
					</Link>
				</button>
			) : null}
			<button
				type="button"
				className={isActive("/decent-bookmarks") ? "dock-active" : ""}
			>
				<Link
					to="/decent-bookmarks"
					className="flex flex-col items-center justify-center"
				>
					{showLabel && <span className="dock-label">Decent</span>}
					<i
						className={`ri-bookmark-3-line text-xl text-base-content/80 dark:hidden ${isActive("/decent-bookmarks") ? "animate-pulse" : ""}`}
					/>
					<span
						className={`hidden dark:block ${isActive("/decent-bookmarks") ? "animate-pulse" : ""}`}
					>
						🔖
					</span>
					{showLabel && <span className="dock-label">Bookmarks</span>}
				</Link>
			</button>

			{SHOW_APE && (
				<button
					type="button"
					className={isActive("/ape") ? "dock-active" : ""}
				>
					<Link to="/ape" className="flex flex-col items-center justify-center">
						<img
							src="data:image/png;base64,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"
							alt="gorilla"
							className={`scale-45 dark:hidden grayscale brightness-50 ${isActive("/ape") || isActive("/") ? "animate-[spin_1.2s_ease-in-out_1]" : ""}`}
						/>
						<span
							className={`hidden dark:block ${isActive("/ape") || isActive("/") ? "animate-[spin_1.2s_ease-in-out_1]" : ""}`}
						>
							🦧
						</span>
						{showLabel && <span className="dock-label">Ape</span>}
					</Link>
				</button>
			)}

			<button type="button" className={isActive("/sassy") ? "dock-active" : ""}>
				<Link to="/sassy" className="flex flex-col items-center justify-center">
					<img
						src="/2233782.png"
						alt="SassyHash"
						className={`size-[1.5em] dark:hidden ${isActive("/sassy") ? "animate-[spin_1.2s_ease-in-out_1]" : ""}`}
					/>
					<span
						className={`hidden dark:block ${isActive("/sassy") ? "animate-[spin_1.2s_ease-in-out_1]" : ""}`}
					>
						💅
					</span>

					{showLabel && <span className="dock-label">SassyHash</span>}
				</Link>
			</button>
		</div>
	);
};
