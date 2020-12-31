import {Address} from "../interfaces/address";
import {BN} from "ethereumjs-util";
import {Subject} from "rxjs";
import {BeginSignal, BlockchainEvent, DoneSignal, ProgressSignal, SystemEvent} from "../interfaces/blockchainEvent";
import {config} from "../config";
import {Subscription} from "web3-core-subscriptions";
import {tryGetDappState} from "../../o-os/loader";
import {OmoSafeState} from "../../../dapps/safe/manifest";
import {CirclesTransaction} from "./circlesTransaction";

export class CirclesToken
{
  createdInBlockNo: number;
  tokenAddress: Address;
  tokenOwner: Address;
  balance?: BN;
  noTransactionsUntilBlockNo: number;

  private readonly web3 = config.getCurrent().web3();
  private readonly safeAddress: string;

  constructor(safeAddress: string)
  {
    this.safeAddress = safeAddress;
  }

  wait(milliseconds: number)
  {
    return new Promise<void>(resolve =>
    {
      setTimeout(() => resolve(), milliseconds);
    });
  }

  /**
   * Feeds the transaction history of the specified tokens to the given subject.
   * @param subject The stream
   * @param tokenAddresses The tokens
   * @param fromBlock Start block
   * @param signalKey If a "BeginSignal" and "EndSignal" event should be put on the stream then this parameter must have a value.
   */
  async feedTransactionHistory(subject: Subject<SystemEvent>, tokensByAddress:{[tokenAddress:string]:CirclesToken}, tokenAddresses: Address[], fromBlock: number, signalKey?: string)
  {
    if (signalKey && window.o)
    {
      window.o.publishEvent(new BeginSignal(signalKey));
    }

    const partitionSize = 50000;
    const timeBetweenPartitions = 500;
    const maxTries = 2;

    const topics = [this.web3.utils.sha3('Transfer(address,address,uint256)')];
    const currentBlock = await this.web3.eth.getBlockNumber();
    const partitionCount = Math.ceil((currentBlock - fromBlock) / partitionSize);

    const getFromBlock = (index:number) => fromBlock + index * partitionSize;
    const getToBlock = (index:number) => getFromBlock(index) + partitionSize >= currentBlock
      ? currentBlock
      : getFromBlock(index) + partitionSize;

    for (let partitionIdx = 0; partitionIdx < partitionCount; partitionIdx++)
    {
      let attempt = 1;
      let error = null;

      while (attempt == 1 || (error && attempt <= maxTries))
      {
        try
        {
          if (signalKey && window.o)
          {
            const percent = (partitionIdx + 1) * (100 / partitionCount)

            window.o.publishEvent(new ProgressSignal(
              signalKey, `Loading your transansactions ..`, parseInt(percent.toFixed(0))));
          }

          const f = getFromBlock(partitionIdx);
          const t = getToBlock(partitionIdx);
          const pastLogs = await this.web3.eth.getPastLogs({
            address: tokenAddresses,
            fromBlock: f,
            toBlock: t,
            topics: topics
          });

          console.log(`Received ${pastLogs.length} events from block ${f} to ${t} (partition ${partitionIdx + 1} of ${partitionCount}).`)

          pastLogs.forEach(event =>
          {
            const transfer = <BlockchainEvent>{
              type:"blockchain",
              blockNumber: event.blockNumber,
              blockHash: event.blockHash,
              address: event.address,
              event: "Transfer",
              returnValues: {
                from: this.web3.eth.abi.decodeParameter("address", event.topics[1]),
                to: this.web3.eth.abi.decodeParameter("address", event.topics[2]),
                value: new BN(this.web3.eth.abi.decodeParameter("uint256", event.data)).toString()
              }
            };

            subject.next(CirclesToken.blockchainEventToCirclesTransaction(tokensByAddress, transfer));
          });
        }
        catch (e)
        {
          error = e;
          if (attempt < maxTries)
          {
            console.warn("(Try " + attempt + " of " + maxTries + ") An error occurred while loading the transaction history of tokens:", tokenAddresses);
            console.warn(e);
          }
          else
          {
            throw e;
          }
        }
        attempt++;

        await this.wait(timeBetweenPartitions);
      }
    }

    if (signalKey && window.o)
    {
      window.o.publishEvent(new DoneSignal(signalKey));
    }
  }

  static getTransactionId(transaction: CirclesTransaction): string
  {
    return `${transaction.blockNo}_${transaction.token}_${transaction.from}_${transaction.to}_${transaction.amount.toString()}`;
  }

  static blockchainEventToCirclesTransaction(tokensByAddress:{[tokenAddress:string]:CirclesToken}, blockChainEvent:BlockchainEvent)
  {
    const safeState = tryGetDappState<OmoSafeState>("omo.safe:1");
    const direction = blockChainEvent.returnValues.to == safeState.mySafeAddress ? "in" : "out";
    const circlesTransaction = <CirclesTransaction>{
      tokenOwner: tokensByAddress[blockChainEvent.address].tokenOwner,
      token: blockChainEvent.address,
      blockNo: Number.isInteger(blockChainEvent.blockNumber) ? <number><any>blockChainEvent.blockNumber : blockChainEvent.blockNumber.toNumber(),
      from: blockChainEvent.returnValues.from,
      to: blockChainEvent.returnValues.to,
      cached: blockChainEvent.cached,
      amount: BN.isBN(blockChainEvent.returnValues.value) ? <BN>blockChainEvent.returnValues.value : new BN(blockChainEvent.returnValues.value),
      direction: direction,
      subject: "",
      id: ""
    };
    circlesTransaction.id = CirclesToken.getTransactionId(circlesTransaction);
    return circlesTransaction;
  }

  subscribeToTransactions(subject:Subject<SystemEvent>, tokensByAddress:{[tokenAddress:string]:CirclesToken}, tokenAddresses:Address[]): Subscription<any>
  {
    const topics = [this.web3.utils.sha3('Transfer(address,address,uint256)')];
    const subscription = this.web3.eth.subscribe("logs", {
      address: tokenAddresses,
      topics: topics
    });

    return subscription.on("data", event =>
    {
      const transfer = <BlockchainEvent>{
        type:"blockchain",
        blockNumber: event.blockNumber,
        blockHash: event.blockHash,
        address: event.address,
        event: "Transfer",
        returnValues: {
          from: this.web3.eth.abi.decodeParameter("address", event.topics[1]),
          to: this.web3.eth.abi.decodeParameter("address", event.topics[2]),
          value: new BN(this.web3.eth.abi.decodeParameter("uint256", event.data)).toString()
        }
      };

      subject.next(CirclesToken.blockchainEventToCirclesTransaction(tokensByAddress, transfer));
    });
  }
}
