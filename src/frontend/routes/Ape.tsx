import { useEffect } from "preact/hooks";
import { Ape as ApeComponent } from "../components/Matcha/Ape";
import SpringTransition from "../components/effects/SpringTransition";
import { api } from "../hooks/queries/useOpenQuery";
import { useFrameSDK } from "../hooks/use-frame-sdk";
import { useSignIn } from "../hooks/use-sign-in";
import { useInMemoryZustand } from "../hooks/use-zustand";
import { LOCAL_DEBUGGING, WARPLET_ADDRESS } from "../lib/constants";

const Ape = () => {
	const { jwt, setJwt, setIsLoadingWallet, setWarpletAddress } =
		useInMemoryZustand();
	const { signIn } = useSignIn();
	const { contextFid, connectedWallet } = useFrameSDK();

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

	useEffect(() => {
		const fetchData = async () => {
			try {
				if (LOCAL_DEBUGGING) {
					setWarpletAddress(WARPLET_ADDRESS);
				} else {
					const warpletAddress = await connectedWallet();
					setWarpletAddress(warpletAddress);
				}
			} catch (error) {
				console.error("Error fetching wallet address:", error);
			} finally {
				setIsLoadingWallet(false);
			}
		};
		fetchData();
	}, [connectedWallet, setIsLoadingWallet, setWarpletAddress]);

	return (
		<div className="flex flex-col text-center gap-4">
			<SpringTransition isActive={true}>
				<article className="prose dark:prose-invert">
					<div className="flex flex-col gap-4 p-4 my-4">
						<ApeComponent />
					</div>
				</article>
			</SpringTransition>
		</div>
	);
};

export default Ape;
