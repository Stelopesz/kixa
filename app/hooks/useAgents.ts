import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export function useAgents(walletAddress?: string) {
  const { data, error, mutate } = useSWR(
    walletAddress ? `/api/agents?wallet=${walletAddress}` : null,
    fetcher,
    { refreshInterval: 5000 }
  );

  return {
    agents: Array.isArray(data) ? data : [],
    isLoading: !error && !data,
    isError: error,
    mutate
  };
}

export async function createAgent(data: {
  wallet_address: string;
  name: string;
  description: string;
  agent_type?: string;
  config?: any;
}) {
  const response = await fetch('/api/agents', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create agent');
  }
  
  return response.json();
}

export async function updateAgent(id: string, updates: any) {
  const response = await fetch('/api/agents', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, ...updates })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update agent');
  }
  
  return response.json();
}
