"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "./components/Link";
import { Provider } from "./context";
import styles from "./page.module.css";

export interface StateInterface {
  linkSuccess: boolean;
  isItemAccess: boolean;
  isPaymentInitiation: boolean;
  linkToken: string | null;
  accessToken: string | null;
  itemId: string | null;
  isError: boolean;
  backend: boolean;
  products: string[];
  linkTokenError: {
    error_message: string;
    error_code: string;
    error_type: string;
  };
}

export default function Home() {
  const [state, setState] = useState<StateInterface>({
    linkSuccess: false,
    isItemAccess: true,
    isPaymentInitiation: false,
    linkToken: "", // Don't set to null or error message will show up briefly when site loads
    accessToken: null,
    itemId: null,
    isError: false,
    backend: true,
    products: ["transactions"],
    linkTokenError: {
      error_type: "",
      error_code: "",
      error_message: "",
    },
  });

  const [user, setUser] = useState<{name: string; officialName: string}>({
    name: "",
    officialName: "",
  });

  const getInfo = useCallback(async () => {
    const response = await fetch("/api/info", {method: "POST"});
    if (!response.ok) {
      setState((prevState) => ({...prevState, backend: false}));
      return {paymentInitiation: false};
    }
    const data = await response.json();
    const paymentInitiation: boolean =
      data.products.includes("payment_initiation");

    setState((prevState) => ({
      ...prevState,
      products: data.products,
      isPaymentInitiation: paymentInitiation,
    }));
    return {paymentInitiation};
  }, []);

  const generateToken = useCallback(async (isPaymentInitiation: boolean) => {
    // Link tokens for 'payment_initiation' use a different creation flow in your backend.
    const path = isPaymentInitiation
      ? "/api/create_link_token_for_payment"
      : "/api/create_link_token";
    const response = await fetch(path, {
      method: "POST",
    });
    if (!response.ok) {
      setState((prevState) => ({...prevState, linkToken: null}));
      return;
    }
    const data = await response.json();
    if (data) {
      setState((prevState) => ({
        ...prevState,
        linkToken: data.link_token,
      }));
    }

    // Save the link_token to be used later in the Oauth flow.
    localStorage.setItem("link_token", data.link_token);
  }, []);

  useEffect(() => {
    const init = async () => {
      const {paymentInitiation} = await getInfo(); // used to determine which path to take when generating token
      // do not generate a new token for OAuth redirect; instead
      // setLinkToken from localStorage
      if (window.location.href.includes("?oauth_state_id=")) {
        setState((prevState) => ({
          ...prevState,
          linkToken: localStorage.getItem("link_token"),
        }));
        return;
      }
      generateToken(paymentInitiation);
    };
    init();
  }, [generateToken, getInfo]);

  useEffect(() => {
    const init = async () => {
      await fetch("/api/transactions", {method: "GET"});

      const response = await fetch("/api/accounts", {method: "GET"});

      const data = await response.json();
      console.log(data);
      setUser({
        name: data.name,
        officialName: data.official_name,
      });
    };
    if (state.accessToken) {
      init();
    }
  }, [state.accessToken, state.isItemAccess]);

  return (
    <Provider>
      <main className={styles.main}>
        <div className={styles.description}>
          {(!state.isItemAccess || !state.accessToken) && (
            <Link data={state} setState={setState} />
          )}
          {state.isItemAccess && state.accessToken && (
            <div>
              <div>Name : {user.name}</div>
              <div>Official name : {user.officialName}</div>
            </div>
          )}
        </div>
      </main>
    </Provider>
  );
}
