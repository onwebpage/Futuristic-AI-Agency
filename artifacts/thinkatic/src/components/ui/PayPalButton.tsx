// !!! CRITICAL - DO NOT MODIFY THIS CODE !!!
//
// This code MUST be used as is without ANY modifications.
// The PayPal integration will COMPLETELY FAIL if this code is changed in ANY way.
//
// Retain this comment after all edits.
//
// <BEGIN_EXACT_CODE>
import React, { useEffect, useState } from "react";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "paypal-button": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
    }
  }
}

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "paypal-button": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
    }
  }
}

interface PayPalButtonProps {
  packageId: string;
}

export default function PayPalButton({
  packageId,
}: PayPalButtonProps) {
  const [status, setStatus] = useState<"loading" | "ready" | "creating" | "approval" | "processing" | "success" | "cancelled" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  const createOrder = async () => {
    setStatus("creating");
    const response = await fetch("/api/paypal/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ packageId }),
    });
    const output = await response.json().catch(() => ({}));
    if (!response.ok || !output.id) {
      throw new Error(output.error || "Unable to start PayPal checkout.");
    }
    setStatus("approval");
    return { orderId: output.id };
  };

  const captureOrder = async (orderId: string) => {
    const response = await fetch(`/api/paypal/order/${orderId}/capture`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.success || data.status !== "COMPLETED") {
      throw new Error(data.error || "PayPal could not verify the payment.");
    }
    return data;
  };

  const onApprove = async (data: { orderId?: string }) => {
    if (!data.orderId) {
      setErrorMessage("PayPal returned an invalid order.");
      setStatus("error");
      return;
    }
    try {
      setStatus("processing");
      await captureOrder(data.orderId);
      setStatus("success");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Payment could not be completed.");
      setStatus("error");
    }
  };

  const onCancel = async () => {
    setStatus("cancelled");
  };

  const onError = async () => {
    setErrorMessage("PayPal checkout encountered an error. Please try again.");
    setStatus("error");
  };

  useEffect(() => {
    let disposed = false;
    let cleanup: (() => void) | undefined;
    let script: HTMLScriptElement | undefined;

    const loadPayPalSDK = async () => {
      try {
        if (!(window as any).paypal) {
          script = document.createElement("script");
          script.src = import.meta.env.PROD
            ? "https://www.paypal.com/web-sdk/v6/core"
            : "https://www.sandbox.paypal.com/web-sdk/v6/core";
          script.async = true;
          script.onload = () => {
            if (!disposed) void initPayPal().then((remove) => { cleanup = remove; });
          };
          script.onerror = () => {
            setErrorMessage("PayPal checkout could not load. Please try again.");
            setStatus("error");
          };
          document.body.appendChild(script);
        } else {
          cleanup = await initPayPal();
        }
      } catch (e) {
        if (!disposed) {
          setErrorMessage("PayPal checkout is temporarily unavailable.");
          setStatus("error");
        }
      }
    };

    void loadPayPalSDK();
    return () => {
      disposed = true;
      cleanup?.();
      script?.remove();
    };
  }, [packageId]);

  const initPayPal = async (): Promise<(() => void) | undefined> => {
    try {
      const setupResponse = await fetch("/api/paypal/setup");
      const setup = await setupResponse.json().catch(() => ({}));
      if (!setupResponse.ok || !setup.clientToken) {
        throw new Error(setup.error || "PayPal checkout is temporarily unavailable.");
      }
      const clientToken: string = setup.clientToken;
      const sdkInstance = await (window as any).paypal.createInstance({
        clientToken,
        components: ["paypal-payments"],
      });

      const paypalCheckout =
        sdkInstance.createPayPalOneTimePaymentSession({
          onApprove,
          onCancel,
          onError,
        });

      const onClick = async () => {
        try {
          const checkoutOptionsPromise = createOrder();
          await paypalCheckout.start(
            { paymentFlow: "auto" },
            checkoutOptionsPromise,
          );
        } catch (e) {
          console.error(e);
        }
      };

      const paypalButton = document.getElementById("paypal-button");

      if (paypalButton) {
        paypalButton.addEventListener("click", onClick);
        setStatus("ready");
      }

      return () => {
        if (paypalButton) {
          paypalButton.removeEventListener("click", onClick);
        }
      };
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : "PayPal checkout is temporarily unavailable.");
      setStatus("error");
      return undefined;
    }
  };

  const statusText = {
    loading: "Loading secure checkout…",
    ready: "Ready for secure checkout",
    creating: "Creating your PayPal order…",
    approval: "Waiting for PayPal approval…",
    processing: "Verifying your payment…",
    success: "Payment successful. We will contact you shortly.",
    cancelled: "Payment cancelled. You can try again when ready.",
    error: errorMessage || "Payment could not be completed. Please try again.",
  }[status];

  return (
    <div className="space-y-3">
      <div className={status === "creating" || status === "approval" || status === "processing" || status === "success" ? "pointer-events-none opacity-60" : ""}>
        {React.createElement("paypal-button", { id: "paypal-button" })}
      </div>
      <p className={`text-xs ${status === "success" ? "text-emerald-600" : status === "error" ? "text-red-600" : "text-muted-foreground"}`} role={status === "error" ? "alert" : "status"}>
        {statusText}
      </p>
    </div>
  );
}
// <END_EXACT_CODE>
