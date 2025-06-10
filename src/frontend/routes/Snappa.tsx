import { useEffect } from "preact/hooks";
import { CastCompose } from "../components/CastCompose";
import SpringTransition from "../components/effects/SpringTransition";
import { useFrameSDK } from "../hooks/use-frame-sdk";
import { useSignIn } from "../hooks/use-sign-in";
import { useInMemoryZustand } from "../hooks/use-zustand";

const Snappa = () => {
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
						<CastCompose />
					</div>
				</article>
			</SpringTransition>
		</div>
	);
};

export default Snappa;
