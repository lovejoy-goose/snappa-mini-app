import { useEffect } from "preact/hooks";
import { useLocation } from "wouter";
import { SoonTM as SoonTMComponent } from "../components/SoonTM";
import SpringTransition from "../components/effects/SpringTransition";
import { useFrameSDK } from "../hooks/use-frame-sdk";
import { useSignIn } from "../hooks/use-sign-in";
import { useInMemoryZustand } from "../hooks/use-zustand";

const Picosub = () => {
	const { jwt } = useInMemoryZustand();
	const { contextFid } = useFrameSDK();
	const { signIn } = useSignIn();

	const location = useLocation();

	useEffect(() => {
		const doSignIn = async () => {
			await signIn();
		};
		!jwt && contextFid && doSignIn();
	}, [contextFid, jwt, signIn]);

	const showPastedCast = location[0] === "/just-tip";
	const linkOut =
		location[0] === "/just-tip"
			? "https://farcaster.xyz/miniapps/-SHPMZSVAfYF/picosub"
			: undefined;

	return (
		<div className="flex flex-col text-center gap-4">
			<SpringTransition isActive={true}>
				<article className="prose dark:prose-invert">
					<div className="flex flex-col gap-4 p-4 my-4">
						<SoonTMComponent
							showPastedCast={showPastedCast}
							linkOut={linkOut}
						/>
					</div>
				</article>
			</SpringTransition>
		</div>
	);
};

export default Picosub;
