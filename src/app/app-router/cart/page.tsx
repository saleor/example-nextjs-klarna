import { getCheckoutFromCookiesOrRedirect } from "@/lib/app-router";
import { executeGraphQL, klarnaAppId } from "@/lib/common";
import { KlarnaData } from "@/app/app-router/cart/pay/[klarnaClientToken]/page";
import { TransactionInitializeDocument } from "@/generated/graphql";
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

	return (
		<form
			action={async () => {
				"use server";
				const transaction = await executeGraphQL({
					query: TransactionInitializeDocument,
					variables: {
						checkoutId: checkout.id,
						data: {},
					},
					cache: "no-store",
				});

				const klarnaData = transaction.transactionInitialize?.data as undefined | KlarnaData;
				if (transaction.transactionInitialize?.errors.length ?? !klarnaData) {
					console.error(transaction.transactionInitialize?.errors);
					return;
				}
				redirect(`/app-router/cart/pay/${klarnaData.klarnaSessionResponse.client_token}`);
			}}
		>
			<button type="submit" className="rounded-md border p-2 shadow-md">
				Pay with Klarna
			</button>
		</form>
	);
}
