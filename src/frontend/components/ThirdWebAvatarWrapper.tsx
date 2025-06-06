import {
	AccountProvider,
	AccountAvatar,
	useActiveAccount,
} from "thirdweb/react";
import { client } from "./ConnectModal";
import { flatFish } from "./NavBar";

export const ThirdWebAvatarWrapper = () => {
	const activeAccount = useActiveAccount();

	return activeAccount ? (
		<AccountProvider address={activeAccount.address} client={client}>
			<AccountAvatar
				socialType="farcaster"
				fallbackComponent={flatFish()}
				loadingComponent={<span className="loading loading-dots loading-xl" />}
			/>
		</AccountProvider>
	) : null;
};
