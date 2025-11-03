import React, { Fragment } from "react";
import { useAuth0 } from "@auth0/auth0-react";

import Hero from "../components/Hero";
import Content from "../components/Content";

const Home = () => {
  const { isAuthenticated } = useAuth0();

  return (
    <Fragment>
      {isAuthenticated && <Hero />}
      {isAuthenticated && <hr />}
      <Content />
    </Fragment>
  );
};

export default Home;
