import React from "react";

export function ErrorFallback({ error }: { error?: Error }) {
  return (
    <div style={{ padding: 24, textAlign: "center" }}>
      <p>Ошибка: {error?.message ?? "Неизвестная ошибка"}</p>
    </div>
  );
}
