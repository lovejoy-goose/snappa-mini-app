import { useContext } from "preact/hooks";
import {
	FrameSDKContext,
	type FrameSDKContextType,
} from "../providers/FrameSDKContext";

export function useFrameSDK(): FrameSDKContextType {
	const context = useContext(FrameSDKContext);
	if (context === undefined) {
		throw new Error("useFrameSDK must be used within a FrameSDKProvider");
	}
	return context;
}
