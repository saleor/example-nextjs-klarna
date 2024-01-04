import { getCheckoutFromCookiesOrRedirect } from "@/lib/app-router";
import { CheckoutCompleteDocument, TransactionInitializeDocument } from "@/generated/graphql";
import { executeGraphQL, klarnaAppId } from "@/lib/common";
import { KlarnaComponent } from "@/ui/components/KlarnaComponent";
import { redirect } from "next/navigation";

export default async function CartPage() {
	const checkout = await getCheckoutFromCookiesOrRedirect();

	const isKlarnaAppInstalled = checkout.availablePaymentGateways.some(
		(gateway) => gateway.id === klarnaAppId,
	);

	if (!isKlarnaAppInstalled) {
		return (
			<div className="text-red-500">
				Klarna App was not installed in this Saleor Cloud instance. Go to{" "}
				<a href="https://klarna.saleor.app/">klarna.saleor.app</a> and follow the instructions.
			</div>
		);
	}

	const transaction = await executeGraphQL({
		query: TransactionInitializeDocument,
		variables: {
			checkoutId: checkout.id,
			data: {},
		},
		cache: "no-store",
	});

	const klarnaData = transaction.transactionInitialize?.data as
		| undefined
		| {
				klarnaSessionResponse: {
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
		  };

	if (transaction.transactionInitialize?.errors.length ?? !klarnaData) {
		return (
			<div className="text-red-500">
				<p>Failed to initialize Klarna transaction</p>
				<pre>{JSON.stringify(transaction, null, 2)}</pre>
			</div>
		);
	}

	console.log({ x: klarnaData.klarnaSessionResponse.payment_method_categories });

	return (
		<div>
			<pre>{JSON.stringify(klarnaData, null, 2)}</pre>
			<KlarnaComponent
				klarnaSession={klarnaData.klarnaSessionResponse}
				onComplete={async () => {
					"use server";
					console.log("onComplete");
					const result = await executeGraphQL({
						query: CheckoutCompleteDocument,
						variables: {
							checkoutId: checkout.id,
						},
					});
					if (result.checkoutComplete?.errors.length) {
						console.error(result.checkoutComplete.errors);
					} else if (!result.checkoutComplete?.order) {
						console.error("No order returned");
					} else if (result.checkoutComplete.order.errors.length) {
						console.error(result.checkoutComplete.order.errors);
					} else {
						redirect(`/app-router/cart/success/${result.checkoutComplete.order.id}`);
					}
				}}
			/>
		</div>
	);
}
