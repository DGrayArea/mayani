import React from "react";
import { View, Text } from "react-native";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.log("Error caught:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text>Something went wrong. Please try again.</Text>
        </View>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
