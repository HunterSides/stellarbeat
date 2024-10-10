import { QuorumSet } from "@stellarbeat/js-stellarbeat-shared";
import { type NetworkChange } from "@/services/change-queue/network-change-queue";

export class InnerQuorumSetAdd implements NetworkChange {
  _quorumSet: QuorumSet;
  _innerQuorumSet: QuorumSet;

  constructor(quorumSet: QuorumSet) {
    this._quorumSet = quorumSet;
    this._innerQuorumSet = new QuorumSet();
    this._innerQuorumSet.threshold = 1;
  }

  execute(): void {
    this._quorumSet.innerQuorumSets.push(this._innerQuorumSet);
  }

  revert(): void {
    this._quorumSet.innerQuorumSets.splice(
      this._quorumSet.innerQuorumSets.indexOf(this._innerQuorumSet),
      1,
    );
  }
}
