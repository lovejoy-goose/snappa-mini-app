import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Route, Switch } from "wouter";
import { Dock } from "./components/Dock";
import NavBar from "./components/NavBar";
import { FrameSDKProvider } from "./providers/FrameSDKContext";
import WagmiProvider from "./providers/WagmiProvider";
import Ape from "./routes/Ape";
import DecentBookmarks from "./routes/DecentBookmarks";
import Palomino from "./routes/Palomino";
import Picosub from "./routes/Picosub";
import Sassy from "./routes/Sassy";
import Snappa from "./routes/Snappa";

const queryClient = new QueryClient();

function App() {
	return (
		<div className="min-h-screen bg-base-100">
			<WagmiProvider>
				<QueryClientProvider client={queryClient}>
					<FrameSDKProvider>
						<NavBar />

						<Switch>
							<Route path="/" component={Snappa} />
							<Route path="/ape" component={Ape} />
							<Route path="/just-tip" component={Picosub} />
							<Route path="/palomino" component={Palomino} />
							<Route path="/decent-bookmarks" component={DecentBookmarks} />
							<Route path="/sassy" component={Sassy} />
							<Route path="/snappa" component={Snappa} />
							<Route component={Snappa} />
						</Switch>

						<Dock />
					</FrameSDKProvider>
				</QueryClientProvider>
			</WagmiProvider>
		</div>
	);
}

export default App;
