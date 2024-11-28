import useSWR from "swr";
import styles from "./StatusPage.module.css";

async function fetchAPI(key) {
  const response = await fetch(key);
  const responseBody = await response.json();
  return responseBody;
}

export default function StatusPage() {
  return (
    <>
      <h1 className={styles.statusTitle}>Status</h1>
      <DatabaseStatus />
    </>
  );
}

function DatabaseStatus() {
  const { isLoading, data } = useSWR("/api/v1/status", fetchAPI, {
    refreshInterval: 2000,
  });

  let databaseStatusInformation = "Carregando...";
  if (!isLoading && data) {
    const updatedAt = new Date(data.updated_at).toLocaleString("pt-BR");
    const {
      version: PostgresVersion,
      max_connections: maxConnections,
      opened_connections: openedConnections,
    } = data.dependencies.databases;
    databaseStatusInformation = (
      <div className={styles.statusContainer}>
        <div className={styles.statusItem}>Última atualização: {updatedAt}</div>
        <div className={styles.statusItem}>
          Versão do Postgres: {PostgresVersion}
        </div>
        <div className={styles.statusItem}>
          Conexões abertas: {openedConnections}
        </div>
        <div className={styles.statusItem}>
          Máximo de conexões: {maxConnections}
        </div>
      </div>
    );
  }
  return <div className={styles.loading}>{databaseStatusInformation}</div>;
}
