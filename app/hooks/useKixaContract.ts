// Stub hook — will connect to real contract later
export function useKixaContract() {
  const grantPermission = async (_params: any) => {
    console.log("grantPermission stub", _params);
    return { success: true, txHash: "mock_tx_" + Date.now() };
  };

  return { grantPermission };
}
