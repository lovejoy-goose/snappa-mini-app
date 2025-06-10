import { useEffect } from "preact/hooks";
import { useSearchParams } from "wouter";
import { SassyCast } from "../components/SassyCast";
import SpringTransition from "../components/effects/SpringTransition";
import { useCastDetailsQuery } from "../hooks/queries/useOpenQuery";
import { useFrameSDK } from "../hooks/use-frame-sdk";
import { useSignIn } from "../hooks/use-sign-in";
import { useInMemoryZustand } from "../hooks/use-zustand";

const Sassy = () => {
	const [queryParams] = useSearchParams();
	const castFidString = queryParams.get("castFid");
	const castFid = castFidString ? Number(castFidString) : null;
	const castHashRaw = queryParams.get("castHash");
	const castHash = castHashRaw ? `0x${castHashRaw.replace("0x", "")}` : null;

	const { castMetadata, contextFid } = useFrameSDK();
	const { jwt, setCastResponse } = useInMemoryZustand();
	const { signIn } = useSignIn();

	const { data: castDetailsQueryResult } = useCastDetailsQuery(
		castMetadata?.author.fid ?? castFid ?? null,
		(castMetadata?.hash ?? castHash) as `0x${string}` | null,
	);

	useEffect(() => {
		if (castDetailsQueryResult)
			setCastResponse(castDetailsQueryResult?.cast ?? null);
	}, [castDetailsQueryResult, setCastResponse]);

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
						<SassyCast />
					</div>
				</article>
			</SpringTransition>
		</div>
	);
};

export default Sassy;
