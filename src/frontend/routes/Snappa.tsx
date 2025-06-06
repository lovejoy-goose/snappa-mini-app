import { useEffect } from "preact/hooks";
import { CastCompose } from "../components/CastCompose";
import { PrivateKey } from "../components/PrivateKey";
import SpringTransition from "../components/effects/SpringTransition";
import { api } from "../hooks/queries/useOpenQuery";
import { useFrameSDK } from "../hooks/use-frame-sdk";
import { useSignIn } from "../hooks/use-sign-in";
import { useInMemoryZustand } from "../hooks/use-zustand";
import { LOCAL_DEBUGGING } from "../lib/constants";

const Snappa = () => {
	const { jwt, setJwt } = useInMemoryZustand();
	const { contextFid } = useFrameSDK();
	const { signIn } = useSignIn();

	useEffect(() => {
		const doSignIn = async () => {
			if (LOCAL_DEBUGGING) {
				if (!contextFid) return;
				const res = await api["local-sign-in"].$post({
					json: { fid: contextFid },
				});
				if (res.status === 200) {
					setJwt((await res.json()).token);
				}
			} else {
				await signIn();
			}
		};
		!jwt && doSignIn();
	}, [contextFid, jwt, signIn, setJwt]);

	return (
		<div className="flex flex-col text-center gap-4">
			<SpringTransition isActive={true}>
				<article className="prose dark:prose-invert">
					<div className="flex flex-col gap-4 p-4 my-4">
						<CastCompose />
						<PrivateKey />
					</div>
				</article>
			</SpringTransition>
		</div>
	);
};

export default Snappa;
