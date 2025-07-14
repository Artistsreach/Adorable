"use client";

import WebView from "./webview";

export default function Preview(props: {
  repo: string;
  baseId: string;
  activeView: string;
  appId: string;
  domain?: string;
  isHeaderVisible: boolean;
}) {
  return (
    <div className="h-full overflow-hidden relative">
      <WebView
        repo={props.repo}
        baseId={props.baseId}
        appId={props.appId}
        domain={props.domain}
        isHeaderVisible={props.isHeaderVisible}
      />
    </div>
  );
}
