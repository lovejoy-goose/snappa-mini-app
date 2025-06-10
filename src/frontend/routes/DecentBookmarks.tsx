import { useEffect } from "preact/hooks";
import { DecentBookmarks as DecentBookmarksComponent } from "../components/DecentBookmarks";
import SpringTransition from "../components/effects/SpringTransition";
import { useSignIn } from "../hooks/use-sign-in";
import { useInMemoryZustand } from "../hooks/use-zustand";
import { useFrameSDK } from "../hooks/use-frame-sdk";

const DecentBookmarks = () => {
	const { jwt } = useInMemoryZustand();
	const { contextFid } = useFrameSDK();
	const { signIn } = useSignIn();

	useEffect(() => {
		const doSignIn = async () => {
			await signIn();
		};
		!jwt && contextFid && doSignIn();
	}, [contextFid, jwt, signIn]);

	return (
		<div className="flex flex-col text-center gap-4">
			<SpringTransition isActive={true}>
				<article className="prose dark:prose-invert">
					<div className="flex flex-col gap-4 p-4 my-4">
						<DecentBookmarksComponent />
					</div>
				</article>
			</SpringTransition>
		</div>
	);
};

export default DecentBookmarks;
