import React, { useState } from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";
import CameraScreen from "./src/screens/CameraScreen";
import ResultScreen from "./src/screens/ResultScreen";
import { DiagnosisResult } from "./src/types/plant";

/**
 * シンプルな2画面構成のため、ナビゲーションライブラリは使わず
 * stateで画面を切り替える。
 */
export default function App() {
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      {result && imageUri ? (
        <ResultScreen
          result={result}
          imageUri={imageUri}
          onBack={() => {
            setResult(null);
            setImageUri(null);
          }}
        />
      ) : (
        <CameraScreen
          onDiagnosed={(diagnosis, uri) => {
            setResult(diagnosis);
            setImageUri(uri);
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
});
