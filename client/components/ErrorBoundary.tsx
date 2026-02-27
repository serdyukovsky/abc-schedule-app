import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props { children: ReactNode }
interface State { hasError: boolean; error?: Error }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", padding: 24 }}>
          <h2 style={{ margin: 0, marginBottom: 8 }}>Что-то пошло не так</h2>
          <p style={{ color: "#666", textAlign: "center" }}>{this.state.error?.message}</p>
          <button style={{ marginTop: 16, padding: "8px 16px", cursor: "pointer" }} onClick={() => this.setState({ hasError: false })}>Попробовать снова</button>
        </div>
      );
    }
    return this.props.children;
  }
}
