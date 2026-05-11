import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export function usePermissions(walletAddress?: string) {
  const { data, error, mutate } = useSWR(
    walletAddress ? `/api/permissions?wallet=${walletAddress}` : null,
    fetcher,
    { refreshInterval: 5000 }
  );

  return {
    permissions: data || [],
    isLoading: !error && !data,
    isError: error,
    mutate
  };
}

export async function createPermission(data: {
  wallet_address: string;
  agent_id?: string;
  type: string;
  name: string;
  description?: string;
  token?: string;
  limit?: string;
  config?: any;
  expiration: string;
}) {
  const response = await fetch('/api/permissions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create permission');
  }
  
  return response.json();
}

export async function revokePermission(id: string, wallet_address: string) {
  const response = await fetch('/api/permissions', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, wallet_address, status: 'revoked' })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to revoke permission');
  }
  
  return response.json();
}
