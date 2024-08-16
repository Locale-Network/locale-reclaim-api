"use client";
import Button from "plaid-threads/Button";
import React from "react";
import { usePlaidLink } from "react-plaid-link";

import { StateInterface } from "@/app/page";

const Link = ({data, setState}: {data: StateInterface; setState: any}) => {
  const {linkToken, isPaymentInitiation} = data;

  const onSuccess = React.useCallback(
    (public_token: string) => {
      // If the access_token is needed, send public_token to server
      const exchangePublicTokenForAccessToken = async () => {
        const response = await fetch("/api/set_access_token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({public_token}),
        });
        if (!response.ok) {
          setState((prevState: StateInterface) => ({
            ...prevState,
            itemId: `no item_id retrieved`,
            accessToken: `no access_token retrieved`,
            isItemAccess: false,
          }));
          return;
        }
        const data = await response.json();
        setState((prevState: StateInterface) => ({
          ...prevState,
          itemId: data.item_id,
          accessToken: data.access_token,
          isItemAccess: true,
        }));
      };

      // 'payment_initiation' products do not require the public_token to be exchanged for an access_token.
      if (isPaymentInitiation) {
        setState((prevState: StateInterface) => ({
          ...prevState,
          isItemAccess: false,
        }));
      } else {
        exchangePublicTokenForAccessToken();
      }

      setState((prevState: StateInterface) => ({
        ...prevState,
        linkSuccess: true,
      }));
      // window.history.pushState("", "", "/");
    },
    [isPaymentInitiation, setState]
  );

  let isOauth = false;
  const config: Parameters<typeof usePlaidLink>[0] = {
    token: linkToken!,
    onSuccess,
  };

  if (
    typeof window !== "undefined" &&
    window.location.href.includes("?oauth_state_id=")
  ) {
    // TODO: figure out how to delete this ts-ignore
    // @ts-ignore
    config.receivedRedirectUri = window.location.href;
    isOauth = true;
  }

  const {open, ready} = usePlaidLink(config);

  return (
    <Button type="button" large onClick={() => open()} disabled={!ready}>
      Login
    </Button>
  );
};

Link.displayName = "Link";

export default Link;
