import { SequraForm } from "@/app/app-router/[sequraOrderId]/SequraForm";
import { PaymentGatewayInitializeDocument } from "@/generated/graphql";
import { getCheckoutFromCookiesOrRedirect } from "@/lib/app-router";
import { executeGraphQL } from "@/lib/common";

export default async function SequraFormPage({ params }: { params: { sequraOrderId: string } }) {
	const checkout = await getCheckoutFromCookiesOrRedirect();

	const orderFormData = await executeGraphQL({
		query: PaymentGatewayInitializeDocument,
		variables: {
			checkoutId: checkout.id,
			data: {
				orderId: params.sequraOrderId,
			},
		},
		cache: "no-store",
	});

	if (orderFormData.paymentGatewayInitialize?.errors.length) {
		console.error(orderFormData.paymentGatewayInitialize.errors);
		return <div>Something went wrong</div>;
	}
	if (!orderFormData.paymentGatewayInitialize?.gatewayConfigs?.[0].data) {
		return <div>Wrong response from payment app</div>;
	}

	const data = orderFormData.paymentGatewayInitialize.gatewayConfigs[0].data as unknown;

	if (typeof data !== "object" || !data || !("orderForm" in data) || typeof data.orderForm !== "string") {
		return <div>Wrong response from payment app</div>;
	}

	return (
		<div>
			<SequraForm orderForm={data.orderForm} />
		</div>
	);
}
