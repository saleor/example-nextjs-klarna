"use client";

import { useEffect, useRef } from "react";

export const KlarnaComponent = ({
	klarnaClientToken,
	onComplete,
}: {
	klarnaClientToken: string;
	onComplete: () => Promise<void>;
}) => {
	const isInitializedRef = useRef(false);

	useEffect(() => {
		if (typeof window === "undefined" || "Klarna" in window) {
			return;
		}
		if (isInitializedRef.current) {
			return;
		}
		isInitializedRef.current = true;
		console.log("useEffect");

		// @ts-expect-error -- klarna callback
		window.klarnaAsyncCallback = () => {
			console.log("klarnaAsyncCallback");
			// @ts-expect-error -- klarna callback
			// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
			Klarna.Payments.init({
				client_token: klarnaClientToken,
			});
			// @ts-expect-error -- klarna callback
			// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
			Klarna.Payments.authorize(
				{
					payment_method_categories: [
						{
							asset_urls: {},
							identifier: "klarna",
							name: "Pay with Klarna",
						},
					],
					customer: {
						date_of_birth: "1980-01-01",
					},
				},
				async function (...args: unknown[]) {
					console.log(...args);
					await onComplete();
				},
			);
			// Klarna.Payments.load(
			// 	{
			// 		container: "#klarna-payments-container",
			// 		// payment_method_categories: klarnaSession.payment_method_categories,
			// 		// payment_method_category: "pay_later",
			// 		// payment_method_categories: [{ identifier: "pay_later" }],
			// 		payment_method_categories: [
			// 			{
			// 				asset_urls: {},
			// 				identifier: "klarna",
			// 				name: "Pay with Klarna",
			// 			},
			// 		],
			// 	},
			// 	(res) => {
			// 		console.debug(res);
			// 	},
			// );
		};

		const script = document.createElement("script");
		script.id = "klarna-payments-sdk";
		script.src = `https://x.klarnacdn.net/kp/lib/v1/api.js`;
		script.async = true;
		document.body.appendChild(script);
	}, [klarnaClientToken, onComplete]);

	return <div id="klarna-payments-container" />;
};
