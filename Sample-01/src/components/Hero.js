import React, { useState, useEffect, createContext, useContext } from "react";
import { Button } from "reactstrap";
import { Alert } from "reactstrap";
import { useAuth0, Auth0Provider } from "@auth0/auth0-react";
import { getConfig } from "../config";
import history from "../utils/history";

// Create a new context for the service provider Auth0
const ServiceProviderAuth0Context = createContext();

const FederationMessage = () => (
  <Alert color="success" className="text-center mt-3">
    You've linked Yonomi via federation
  </Alert>
);

const onRedirectCallback = (appState) => {
  history.push(
    appState && appState.returnTo ? appState.returnTo : window.location.pathname
  );
};

// Hook to use the service provider Auth0 context
const useServiceProviderAuth0 = () => {
  const context = useContext(ServiceProviderAuth0Context);
  if (!context) {
    throw new Error('useServiceProviderAuth0 must be used within a ServiceProviderAuth0Provider');
  }
  return context;
};

// Service Provider Auth0 Provider component
const ServiceProviderAuth0Provider = ({ children }) => {
  const config = getConfig();
  const providerConfig = {
    domain: config.serviceProviderDomain,
    clientId: config.serviceProviderClientId,
    onRedirectCallback,
    authorizationParams: {
      redirect_uri: window.location.origin,
      audience: config.serviceProviderAudience,
      organization: config.serviceProviderOrgId,
    },
  };

  return (
    <Auth0Provider {...providerConfig}>
      <ServiceProviderContextWrapper>
        {children}
      </ServiceProviderContextWrapper>
    </Auth0Provider>
  );
};

// Wrapper component to provide the Auth0 context value
const ServiceProviderContextWrapper = ({ children }) => {
  const auth0Value = useAuth0();
  
  return (
    <ServiceProviderAuth0Context.Provider value={auth0Value}>
      {children}
    </ServiceProviderAuth0Context.Provider>
  );
};

const HeroContent = () => {
  const [showFederationMessage, setShowFederationMessage] = useState(false);
  const { user, isAuthenticated, loginWithRedirect } = useServiceProviderAuth0(); // Use service provider context
  const config = getConfig();

  console.log('isAuthenticated', isAuthenticated);
  console.log('user', user);

  // Check if user has federation connection on component mount
  useEffect(() => {
    if (isAuthenticated && user) {
      // Check if user has the service provider connection or organization
      const hasFederation = user.org_id === config.serviceProviderOrgId || 
                           user.sub?.includes(config.serviceProviderConnection);
      setShowFederationMessage(hasFederation);
    }
  }, [isAuthenticated, user, config.serviceProviderOrgId, config.serviceProviderConnection]);

  // note this requires you to add:
  //   "upstream_params": {
  //     "organization": {
  //       "value": "{idp_org_id}" 
  //     }
  //   }
  // to the Auth0 connection settings if your idp requires an organization authorization request param

  // also note you must click the stg connection button once you get the auth0 login screen to link the accounts
  return (
    <div className="text-center hero my-5">
      <Button color="primary" size="lg" onClick={() => loginWithRedirect()}>
        Link Yonomi
      </Button>
      {showFederationMessage && <FederationMessage />}
    </div>
  );
};

const Hero = () => {
  return (
    <ServiceProviderAuth0Provider>
      <HeroContent />
    </ServiceProviderAuth0Provider>
  );
};

export default Hero;
