import { Card } from "@looker/components";
import { getEmbedSDK, ILookerConnection } from "@looker/embed-sdk";
import React, { useCallback } from "react";
import styled from "styled-components";
import { useAppContext } from "./AppContext";
import useExtensionSdk from "./hooks/useExtensionSdk";

const StyledCard = styled(Card)`
  width: 100%;
  height: 100%;
  background-color: #ffffff;
  & > iframe {
    width: 100%;
    height: 100%;
  }
`;

const Dashboard: React.FC = () => {
  const extension_sdk = useExtensionSdk();
  const {
    setDashboardOptions,
    setDashboard,
    getDashboardMetadata,
    resetDashboardMetadata,
  } = useAppContext();
  const dashboardRef = useCallback((el: HTMLDivElement) => {
    if (el && !el.children.length) {
      const embed_sdk = getEmbedSDK();
      embed_sdk.init(extension_sdk.lookerHostData?.hostUrl!);
      embed_sdk
        .createDashboardWithId("607")
        .on("dashboard:loaded", (dashboard: any) => {
          resetDashboardMetadata();
          setDashboardOptions(dashboard.dashboard.options);
          getDashboardMetadata(dashboard.dashboard.id);
        })
        .appendTo(el)
        .build()
        .connect()
        .then((dashboard: ILookerConnection) => {
          setDashboard(dashboard);
        })
        .catch((error: any) => {
          console.error("Error embedding dashboard:", error);
        });
    }
  }, []);

  return (
    <StyledCard p="xsmall" raised borderRadius="large" ref={dashboardRef} />
  );
};

export default Dashboard;
