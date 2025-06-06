import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "preact/hooks";
import {
	type BaseError,
	type Hex,
	concat,
	formatUnits,
	numberToHex,
	parseUnits,
	size,
} from "viem";
import {
	useBalance,
	useSendTransaction,
	useSignTypedData,
	useWaitForTransactionReceipt,
} from "wagmi";
import {
	useZeroExPriceQuery,
	useZeroExQuoteQuery,
} from "../../hooks/queries/useProtectedQuery";
import { useFrameSDK } from "../../hooks/use-frame-sdk.tsx";
import { useInMemoryZustand, useZustand } from "../../hooks/use-zustand.ts";
import {
	ChainId,
	DEFAULT_AFFILIATE_FEE_IN_BPS,
	FAFO_ADDRESS,
	KNOWN_TOKENS,
	MINIMUM_MINI_APP_FEE_IN_BPS,
	type Token,
} from "../../lib/constants.ts";
import { formatPrice } from "../../lib/utils.ts";
import type { QuoteParams } from "../../lib/zeroex.ts";
import { BaseTokenButtonBar } from "./BaseTokenButtonBar.tsx";
import { BuyTokenInput } from "./BuyTokenInput.tsx";
import { ContractAddressField } from "./ContractAddressField.tsx";
import { DisclaimerBlurb } from "./DisclaimerBlurb.tsx";
import { FeesBreakdownCard } from "./FeesBreakdownCard.tsx";
import { PayAsYouWishModal } from "./PayAsYouWishModal.tsx";
import { QuoteCard } from "./QuoteCard.tsx";
import { RoutingCard } from "./RoutingCard.tsx";
import { SellAmountModal } from "./SellAmountModal.tsx";

const AFFILIATE_RECIPIENT_ADDRESS = FAFO_ADDRESS;

const stages = [
	{
		idx: 0,
		label: "Swap",
		description: "browse or select a token to swap",
	},
	{
		idx: 1,
		label: "Approve + Confirm",
		description: "signal intent to perform this swap",
	},
	{
		idx: 2,
		label: "Reset",
		description: "review the txn hash, reset",
	},
];

export const Ape = () => {
	const [statusText, setStatusText] = useState("");
	const [isSellAmountModalOpen, setIsSellAmountModalOpen] = useState(false);
	const [isPayAsYouWishModalOpen, setIsPayAsYouWishModalOpen] = useState(false);
	const [affiliate_fee_in_bps, setAffiliateFeeInBps] = useState(
		DEFAULT_AFFILIATE_FEE_IN_BPS,
	);
	const [signature, setSignature] = useState<Hex | undefined>(undefined);

	const { jwt, isLoadingWallet, warpletAddress } = useInMemoryZustand();
	const { showFees, showNerd, count, increase, reset } = useZustand();
	const { openUrl } = useFrameSDK();

	const [baseToken, setBaseToken] = useState<Token>(KNOWN_TOKENS[0]);

	const [sellToken, setSellToken] = useState<Token>(KNOWN_TOKENS[0]);
	const [sellAmount, setSellAmount] = useState("1");

	const [buyAmount, setBuyAmount] = useState("");
	const [buyToken, setBuyToken] = useState<Token>(KNOWN_TOKENS[1]);

	const [isFinalized, setIsFinalized] = useState(false);
	const [fetchPriceError, setFetchPriceError] = useState<string[]>([]);

	const { data: baseTokenBalanceData } = useBalance({
		address: warpletAddress ?? undefined,
		token: baseToken.symbol === "ETH" ? undefined : baseToken.address,
	});

	const formattedBaseTokenBalance = useMemo(
		() =>
			Number(
				formatUnits(baseTokenBalanceData?.value ?? 0n, baseToken.decimals),
			),
		[baseTokenBalanceData, baseToken.decimals],
	);

	useEffect(() => {
		if (
			formattedBaseTokenBalance > 0 &&
			formattedBaseTokenBalance < Number(sellAmount)
		) {
			setSellAmount(
				(
					formattedBaseTokenBalance - (baseToken.symbol === "ETH" ? 0.00001 : 0)
				).toString(),
			);
		}
	}, [formattedBaseTokenBalance, baseToken.symbol, sellAmount]);

	const queryClient = useQueryClient();

	const parsedSellAmount = useMemo(
		() =>
			sellAmount
				? parseUnits(sellAmount, sellToken.decimals).toString()
				: undefined,
		[sellAmount, sellToken.decimals],
	);

	const parsedBuyAmount = useMemo(
		() =>
			buyAmount
				? parseUnits(buyAmount, buyToken.decimals).toString()
				: undefined,
		[buyAmount, buyToken.decimals],
	);

	const quoteParams = useMemo<QuoteParams>(
		() => ({
			chainId: ChainId.BASE,
			sellToken: sellToken.address,
			buyToken: buyToken.address,
			sellAmount: parsedSellAmount ?? "",
			buyAmount: parsedBuyAmount ?? "",
			taker: warpletAddress ?? "",
			swapFeeRecipient: AFFILIATE_RECIPIENT_ADDRESS,
			swapFeeBps: Math.max(
				affiliate_fee_in_bps,
				buyToken.symbol === "BURRITO" || sellToken.symbol === "BURRITO"
					? 0
					: MINIMUM_MINI_APP_FEE_IN_BPS,
			),
			swapFeeToken: baseToken.address,
		}),
		[
			baseToken.address,
			sellToken.address,
			buyToken.address,
			parsedSellAmount,
			parsedBuyAmount,
			warpletAddress,
			affiliate_fee_in_bps,
			buyToken.symbol,
			sellToken.symbol,
		],
	);

	const buttonText = useMemo(
		() =>
			isLoadingWallet
				? "Connect Wallet"
				: stages.find((stage) => stage.idx === count)?.label,
		[count, isLoadingWallet],
	);

	const {
		data: priceData,
		error: priceError,
		isLoading: isPriceLoading,
		isFetching: isPriceFetching,
	} = useZeroExPriceQuery(jwt, affiliate_fee_in_bps, quoteParams);

	const {
		data: quoteData,
		error: quoteError,
		isLoading: isQuoteLoading,
		isFetching: isQuoteFetching,
		refetch: fetchQuote,
	} = useZeroExQuoteQuery(jwt, affiliate_fee_in_bps, quoteParams);

	useEffect(() => {
		if (priceError && !isPriceLoading) {
			setFetchPriceError((prev) => [...prev, priceError.message]);
		}
	}, [priceError, isPriceLoading]);

	useEffect(() => {
		if (quoteError) {
			setFetchPriceError((prev) => [...prev, quoteError.message]);
		}
	}, [quoteError]);

	useEffect(() => {
		if (priceData && !isFinalized) {
			if (priceData.buyAmount) {
				setBuyAmount(
					formatUnits(BigInt(priceData.buyAmount), buyToken.decimals),
				);
			}
		}
	}, [priceData, isFinalized, buyToken.decimals]);

	useEffect(() => {
		const timeoutId = setTimeout(() => {
			if (sellAmount !== "" && isFinalized) {
				fetchQuote();
			}
		}, 200);

		return () => clearTimeout(timeoutId);
	}, [sellAmount, isFinalized, fetchQuote]);

	const finalize = useCallback(() => {
		setIsFinalized(true);
		fetchQuote();
	}, [fetchQuote]);

	const { signTypedDataAsync } = useSignTypedData();

	const {
		data: hash,
		isPending: isPendingSendTransaction,
		error: sendTransactionError,
		sendTransaction,
		reset: resetSendTransaction,
	} = useSendTransaction();

	const { isLoading: isConfirming, isSuccess: isConfirmed } =
		useWaitForTransactionReceipt({
			hash,
		});

	useEffect(() => {
		if (isConfirming) setStatusText("⏳ Waiting for confirmation...");
		else if (sendTransactionError) setStatusText("🚨 Transaction Failed!");
		else if (isPendingSendTransaction)
			setStatusText("🔄 Executing transaction...");
		else if (isConfirmed) setStatusText("");
		else {
			setStatusText("");
		}
	}, [
		isConfirming,
		isConfirmed,
		sendTransactionError,
		isPendingSendTransaction,
	]);

	const executeSwap = useCallback(async () => {
		let sig: Hex | undefined;
		if (quoteData?.permit2?.eip712) {
			setStatusText("requesting approvals...");
			sig = await signTypedDataAsync(quoteData.permit2.eip712);
			setSignature(sig);
			setStatusText("approved!");
		}

		setStatusText("executing swap...");
		if (sig && quoteData?.transaction) {
			setStatusText("appending signature...");
			const signatureLengthInHex = numberToHex(size(sig), {
				signed: false,
				size: 32,
			});
			const transactionData = quoteData.transaction.data as Hex;
			const sigLengthHex = signatureLengthInHex as Hex;

			const data = concat([transactionData, sigLengthHex, sig]);

			setStatusText("submitting transaction...");
			sendTransaction({
				account: warpletAddress,
				gas: quoteData.transaction.gas
					? BigInt(quoteData.transaction.gas)
					: undefined,
				to: quoteData.transaction.to,
				data: data,
				value: BigInt(quoteData.transaction.value),
				chainId: ChainId.BASE,
			});
			setStatusText("transaction submitted");
		} else if (!signature && quoteData?.transaction) {
			setStatusText("submitting transaction (no signature required)...");
			sendTransaction({
				account: warpletAddress,
				gas: quoteData.transaction.gas
					? BigInt(quoteData.transaction.gas)
					: undefined,
				to: quoteData.transaction.to,
				data: quoteData.transaction.data,
				value: BigInt(quoteData.transaction.value),
				chainId: ChainId.BASE,
			});
			setStatusText("simple transaction submitted");
		} else {
			setStatusText("failed to obtain signature or transaction data");
			throw new Error("Failed to obtain signature or transaction data");
		}
	}, [
		quoteData,
		sendTransaction,
		signTypedDataAsync,
		warpletAddress,
		signature,
	]);

	const linkToBaseScan = useCallback(
		(hash?: string) => {
			if (hash) {
				openUrl(`https://basescan.org/tx/${hash}`);
			}
		},
		[openUrl],
	);

	const resetFlow = useCallback(() => {
		setIsFinalized(false);
		setIsSellAmountModalOpen(false);
		setIsPayAsYouWishModalOpen(false);
		setFetchPriceError([]);
		resetSendTransaction();
		queryClient.invalidateQueries({ queryKey: ["zeroex-price"] });
		queryClient.invalidateQueries({ queryKey: ["zeroex-quote"] });
		setSignature(undefined);
		setStatusText("");
		reset();
	}, [reset, queryClient, resetSendTransaction]);

	const isButtonDisabled = useMemo(
		() =>
			isLoadingWallet ||
			!sellAmount ||
			!buyAmount ||
			isPriceLoading ||
			isPendingSendTransaction ||
			(isFinalized && !quoteData) ||
			isConfirming,
		[
			isLoadingWallet,
			sellAmount,
			buyAmount,
			isPriceLoading,
			isPendingSendTransaction,
			isFinalized,
			quoteData,
			isConfirming,
		],
	);

	const buyAmountInHuman = buyAmount ? Number(buyAmount) : undefined;

	const minBuyAmountInHuman = quoteData?.minBuyAmount
		? Number(formatUnits(BigInt(quoteData.minBuyAmount), buyToken.decimals))
		: undefined;

	const slippage = (minBuyAmountInHuman ?? 0) / (buyAmountInHuman ?? 1) - 1;

	return (
		<div className="container mx-auto p-4 pb-16">
			<div className="grid grid-cols justify-end gap-6">
				<ContractAddressField />
				<BuyTokenInput
					sellToken={sellToken}
					buyToken={buyToken}
					setBuyToken={setBuyToken}
					setAffiliateFeeInBps={setAffiliateFeeInBps}
					resetFirst={resetFlow}
				/>
			</div>

			<QuoteCard
				sellToken={sellToken}
				buyToken={buyToken}
				sellAmt={Number(sellAmount)}
				buyAmt={Number(buyAmount)}
				warpletAddress={warpletAddress}
				isQuoteLoading={isPriceLoading}
				pq={quoteData ?? priceData}
				setIsSellAmountModalOpen={setIsSellAmountModalOpen}
				handleReverseQuote={() => {
					setBuyToken(sellToken);
					setSellToken(buyToken);
					setSellAmount(Math.round(Number(buyAmount)).toString());
					// setBuyAmount(sellAmount); this is handled in the quote
				}}
			/>

			<div className=" text-center text-warning mt-4">{statusText}</div>

			<div className="space-y-4">
				<button
					type="button"
					onClick={() => {
						if (count >= 2) {
							resetFlow();
						} else {
							if (isFinalized) {
								executeSwap();
							} else {
								finalize();
							}
							increase();
						}
					}}
					disabled={isButtonDisabled}
					className={`btn ${count >= 2 ? "btn-secondary" : "btn-primary"} btn-wide`}
				>
					{isPriceLoading ||
					isQuoteLoading ||
					isPriceFetching ||
					isQuoteFetching ? (
						<i className="ri-loader-2-line animate-spin" />
					) : (
						<i className="ri-loader-2-line text-base-content/0" />
					)}
					{buttonText}
				</button>
			</div>

			{quoteData && minBuyAmountInHuman && !isConfirmed ? (
				<div className="text-muted-foreground space-y-4">
					at least {formatPrice(minBuyAmountInHuman)} ${buyToken.symbol}
					<br />
					<span className="text-xs align-top">
						({(slippage * -100).toFixed(2)}% slippage)
					</span>
				</div>
			) : null}

			<div className="space-y-4">
				{isConfirmed && (
					<button
						type="button"
						className="text-primary text-center mt-4"
						onClick={() => linkToBaseScan(hash)}
					>
						<p>🎉 Transaction Confirmed!</p>
						<p>Tap to View on Basescan</p>
					</button>
				)}

				{fetchPriceError.length > 0 && (
					<div className="text-error text-sm mt-2">
						{fetchPriceError.map((error, index) => (
							<div key={`${index}-${error}`}>{error}</div>
						))}
					</div>
				)}
				{sendTransactionError && (
					<div className="text-error text-sm mt-2">
						Error:{" "}
						{(sendTransactionError as BaseError).shortMessage ||
							sendTransactionError.message}
					</div>
				)}
			</div>

			{showNerd ? (
				<div className="space-y-4 mt-4">
					issues:
					<pre className="p-4 rounded-md overflow-x-auto text-content text-left text-wrap">
						{JSON.stringify(quoteData?.issues, null, 2)}
					</pre>
					permit2:
					<pre className="p-4 rounded-md overflow-x-auto text-content text-left text-wrap">
						{JSON.stringify(quoteData?.permit2, null, 2)}
					</pre>
					transaction:
					<pre className="p-4 rounded-md overflow-x-auto text-content text-left text-wrap">
						{JSON.stringify(quoteData?.transaction, null, 2)}
					</pre>
					signature:
					<pre className="p-4 rounded-md overflow-x-auto text-content text-left text-wrap">
						{JSON.stringify(signature, null, 2)}
					</pre>
					quote:
					<pre className="p-4 rounded-md overflow-x-auto text-content text-left text-wrap">
						{JSON.stringify(quoteData, null, 2)}
					</pre>
					price:
					<pre className="p-4 rounded-md overflow-x-auto text-content text-left text-wrap">
						{JSON.stringify(priceData, null, 2)}
					</pre>
				</div>
			) : null}

			{showFees && (
				<div className="space-y-4 mt-4">
					<div className="space-y-4 my-4 mx-auto">
						<BaseTokenButtonBar
							baseToken={baseToken}
							setBaseToken={(token) => {
								setSellToken(token);
								setBaseToken(token);
								if (buyToken.symbol === token.symbol) {
									setBuyToken(KNOWN_TOKENS[1]);
								}
							}}
						/>
					</div>

					<FeesBreakdownCard
						pq={quoteData ?? priceData}
						setIsPayAsYouWishModalOpen={setIsPayAsYouWishModalOpen}
					/>
					<RoutingCard pq={quoteData ?? priceData} />
					<DisclaimerBlurb />
				</div>
			)}

			<SellAmountModal
				isOpen={isSellAmountModalOpen}
				onClose={() => setIsSellAmountModalOpen(false)}
				onConfirm={(newAmount: number) => {
					setSellAmount(newAmount.toString());
					resetFlow();
				}}
				currentAmount={Number(sellAmount)}
				maxAmount={formattedBaseTokenBalance}
			/>

			<PayAsYouWishModal
				isOpen={isPayAsYouWishModalOpen}
				onClose={() => setIsPayAsYouWishModalOpen(false)}
				onConfirm={(newAmount: number) => setAffiliateFeeInBps(newAmount)}
				currentAmount={Math.max(
					affiliate_fee_in_bps,
					buyToken.symbol === "BURRITO" ? 0 : MINIMUM_MINI_APP_FEE_IN_BPS,
				)}
				minAmount={
					buyToken.symbol === "BURRITO" ? 0 : MINIMUM_MINI_APP_FEE_IN_BPS
				}
			/>
		</div>
	);
};
