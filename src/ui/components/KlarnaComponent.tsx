"use client";

import { useEffect } from "react";

export const KlarnaComponent = ({
	klarnaSession,
	onComplete,
}: {
	klarnaSession: {
		client_token: string;
		payment_method_categories?:
			| {
					asset_urls?:
						| {
								descriptive?: string | undefined;
								standard?: string | undefined;
						  }
						| undefined;
					identifier?: string | undefined;
					name?: string | undefined;
			  }[]
			| undefined;
		session_id: string;
	};
	onComplete: () => Promise<void>;
}) => {
	useEffect(() => {
		if (typeof window === "undefined" || "Klarna" in window) {
			return;
		}

		// @ts-expect-error -- klarna callback
		window.klarnaAsyncCallback = () => {
			Klarna.Payments.init({
				client_token: klarnaSession.client_token,
			});
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
				async function (...args) {
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
	}, []);

	return <div id="klarna-payments-container" />;
};
