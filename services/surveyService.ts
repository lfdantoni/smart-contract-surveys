import { createPublicClient, http } from 'viem';
import { mainnet, sepolia, polygon, arbitrum, base, optimism } from 'viem/chains';
import type { Poll } from '../types';
import type { Chain, Address } from 'viem';

// Define survey contracts with their respective networks
export const SURVEY_CONTRACTS: Array<{ address: `0x${string}`; chain: Chain }> = [
  { address: '0x76f6A5cc7e5dFE4aa7F712eCB10Bb36b186962F1', chain: sepolia },
  { address: '0x7bAE3E4ea54c2D1bE52098b2908E7C6D9c0Eb220', chain: sepolia },
  { address: '0x158139d873A676fCF440a9D3f6eec71C46D1bbDd', chain: sepolia },
  // Add more contracts here with their networks:
  // { address: '0x...', chain: mainnet },
  // { address: '0x...', chain: polygon },
];

const SURVEY_ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_tokenAddress",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "_title",
        "type": "string"
      },
      {
        "internalType": "string[]",
        "name": "_questions",
        "type": "string[]"
      },
      {
        "internalType": "string[][]",
        "name": "_answersPerQuestion",
        "type": "string[][]"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "closeVoting",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getSurvey",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "questionId",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "questionText",
            "type": "string"
          },
          {
            "components": [
              {
                "internalType": "uint256",
                "name": "id",
                "type": "uint256"
              },
              {
                "internalType": "string",
                "name": "text",
                "type": "string"
              }
            ],
            "internalType": "struct TokenGatedVoting.AnswerDetails[]",
            "name": "answers",
            "type": "tuple[]"
          }
        ],
        "internalType": "struct TokenGatedVoting.SurveyQuestion[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getSurveyResults",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "questionId",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "questionText",
            "type": "string"
          },
          {
            "components": [
              {
                "internalType": "uint256",
                "name": "id",
                "type": "uint256"
              },
              {
                "internalType": "string",
                "name": "text",
                "type": "string"
              },
              {
                "internalType": "uint256",
                "name": "voteCount",
                "type": "uint256"
              }
            ],
            "internalType": "struct TokenGatedVoting.Answer[]",
            "name": "answers",
            "type": "tuple[]"
          }
        ],
        "internalType": "struct TokenGatedVoting.QuestionResult[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "isOpen",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "questionIds",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "requiredTokenBalance",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_newTokenAddress",
        "type": "address"
      }
    ],
    "name": "setTokenAddress",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "title",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "tokenContractAddress",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256[]",
        "name": "_answerIds",
        "type": "uint256[]"
      }
    ],
    "name": "vote",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

// ERC20 ABI for token symbol
const ERC20_ABI = [
  {
    inputs: [],
    name: 'symbol',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function'
  }
] as const;

// Get token logo from Trust Wallet assets or fallback to generic
function getTokenLogo(tokenAddress: string, chainId: number): string {
  const checksumAddress = tokenAddress;
  console.log('Fetching logo for token:', checksumAddress, 'on chain:', chainId);
  // Trust Wallet asset repository URLs by chain
  const chainAssetUrls: Record<number, string> = {
    1: `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${checksumAddress}/logo.png`,
    11155111: `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${checksumAddress}/logo.png`, // Sepolia uses ethereum assets
    137: `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygon/assets/${checksumAddress}/logo.png`,
    42161: `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/arbitrum/assets/${checksumAddress}/logo.png`,
    8453: `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/base/assets/${checksumAddress}/logo.png`,
    10: `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/optimism/assets/${checksumAddress}/logo.png`,
  };
  
  return chainAssetUrls[chainId] || '';
}

export async function fetchContractPolls(address: `0x${string}`, chain: Chain): Promise<Poll[]> {
  const client = createPublicClient({
    chain,
    transport: http()
  });

  const [surveyTitle, tokenAddress, isOpen] = await Promise.all([
    client.readContract({ address, abi: SURVEY_ABI, functionName: 'title' }),
    client.readContract({ address, abi: SURVEY_ABI, functionName: 'tokenContractAddress' }),
    client.readContract({ address, abi: SURVEY_ABI, functionName: 'isOpen' })
  ]);

  // Use getSurvey if open (no vote counts), getSurveyResults if closed (with vote counts)
  const surveyData = isOpen
    ? await client.readContract({ address, abi: SURVEY_ABI, functionName: 'getSurvey' })
    : await client.readContract({ address, abi: SURVEY_ABI, functionName: 'getSurveyResults' });

  // Fetch token symbol if token address exists
  let tokenSymbol: string | undefined;
  if (tokenAddress && tokenAddress !== '0x0000000000000000000000000000000000000000') {
    try {
      tokenSymbol = await client.readContract({
        address: tokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'symbol'
      });
    } catch (error) {
      console.error('Failed to fetch token symbol', error);
      tokenSymbol = 'TOKEN';
    }
  }

  // Each contract is ONE poll/survey with multiple questions
  // We return it as a single Poll with the first question as main, or aggregate all questions
  if (surveyData.length === 0) {
    return [];
  }
  
  const tokenLogo = tokenAddress && tokenAddress !== '0x0000000000000000000000000000000000000000' 
    ? getTokenLogo(tokenAddress, chain.id)
    : undefined;
  
  return [{
    id: address,
    question: surveyTitle || 'Survey',
    description: `${surveyData.length} question(s) - Contract: ${address.substring(0, 6)}...${address.substring(address.length - 4)}`,
    options: surveyData.flatMap(q => 
      q.answers.map((answer) => ({
        id: `${q.questionId}-${answer.id}`,
        text: `Q${q.questionId}: ${q.questionText} - ${answer.text}`,
        votes: isOpen ? 0 : Number((answer as any).voteCount || 0)
      }))
    ),
    tokenAddress: tokenAddress && tokenAddress !== '0x0000000000000000000000000000000000000000' ? tokenAddress : undefined,
    tokenSymbol,
    tokenLogo,
    chainId: chain.id,
    isOpen: isOpen
  }];
}

export async function fetchSurveyPolls(): Promise<Poll[]> {
  const polls: Poll[] = [];

  for (const { address, chain } of SURVEY_CONTRACTS) {
    try {
      const contractPolls = await fetchContractPolls(address, chain);
      polls.push(...contractPolls);
    } catch (error) {
      console.error(`Failed to fetch survey for ${address} on ${chain.name}`, error);
    }
  }

  return polls;
}

// Helper to prepare vote data for the smart contract
export function prepareVoteData(poll: Poll, answerIds: string[]) {
  // Extract answer IDs from the option IDs format: "questionId-answerId"
  const extractedAnswerIds = answerIds.map(optionId => {
    const [questionId, answerId] = optionId.split('-').map(Number);
    
    if (isNaN(questionId) || isNaN(answerId)) {
      throw new Error(`Invalid option ID format: ${optionId}`);
    }
    
    return BigInt(answerId);
  });

  // Get the contract address from the poll ID
  const contractAddress = poll.id as Address;
  
  // Get the chain configuration
  const chainConfig = SURVEY_CONTRACTS.find(c => c.address === contractAddress);
  if (!chainConfig) {
    throw new Error('Contract not found in configuration');
  }

  return {
    address: contractAddress,
    abi: SURVEY_ABI,
    functionName: 'vote',
    args: [extractedAnswerIds], // vote function expects uint256[] _answerIds
    chainId: chainConfig.chain.id,
    chain: chainConfig.chain,
  };
}

export { SURVEY_ABI };
