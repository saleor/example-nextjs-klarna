import { CheckoutCompleteDocument } from "@/generated/graphql";
import { getCheckoutFromCookiesOrRedirect } from "@/lib/app-router";
import { executeGraphQL } from "@/lib/common";
import { KlarnaComponent } from "@/ui/components/KlarnaComponent";
import { redirect } from "next/navigation";

export interface KlarnaData {
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
}

export default async function PayPage({
	params: { klarnaClientToken },
}: {
	params: { klarnaClientToken: string };
}) {
	const checkout = await getCheckoutFromCookiesOrRedirect();
	return (
		<div>
			<KlarnaComponent
				klarnaClientToken={klarnaClientToken}
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
