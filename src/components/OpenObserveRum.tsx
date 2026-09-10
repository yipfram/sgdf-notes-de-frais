"use client";

import { useEffect } from "react";

const site = process.env.NEXT_PUBLIC_OPENOBSERVE_SITE;
const jetonClient = process.env.NEXT_PUBLIC_OPENOBSERVE_CLIENT_TOKEN;

export function OpenObserveRum() {
  useEffect(() => {
    if (!site || !jetonClient) return;

    void Promise.all([
      import("@openobserve/browser-rum"),
      import("@openobserve/browser-logs"),
    ]).then(([{ openobserveRum }, { openobserveLogs }]) => {
      if (!openobserveRum.getInitConfiguration()) {
        openobserveRum.init({
          applicationId: "scouticket",
          clientToken: jetonClient,
          site,
          organizationIdentifier:
            process.env.NEXT_PUBLIC_OPENOBSERVE_ORGANISATION ?? "default",
          service: "scouticket-web",
          env: process.env.NODE_ENV,
          version: process.env.NEXT_PUBLIC_VERSION_DEPLOIEMENT,
          trackResources: true,
          trackLongTasks: true,
          trackUserInteractions: true,
          insecureHTTP: false,
          apiVersion: "v1",
          defaultPrivacyLevel: "mask-user-input",
          sessionSampleRate: 100,
          sessionReplaySampleRate: 50,
          telemetrySampleRate: 5,
        });
        openobserveRum.startSessionReplayRecording();
      }

      if (!openobserveLogs.getInitConfiguration()) {
        openobserveLogs.init({
          clientToken: jetonClient,
          site,
          organizationIdentifier:
            process.env.NEXT_PUBLIC_OPENOBSERVE_ORGANISATION ?? "default",
          service: "scouticket-web",
          env: process.env.NODE_ENV,
          version: process.env.NEXT_PUBLIC_VERSION_DEPLOIEMENT,
          forwardErrorsToLogs: true,
          insecureHTTP: false,
          apiVersion: "v1",
        });
      }
    });
  }, []);

  return null;
}
