<template>
  <div class="network-analysis-badges">
    <span
      v-if="
        federatedVotingStore.networkAnalysis.hasQuorumIntersectionOfWellBehavedNodes(
          federatedVotingStore.illBehavedNodes,
        )
      "
      class="badge badge-success ms-2 mr-1"
      >Quorum Intersection</span
    >
    <span
      v-else
      v-tooltip="'No quorum intersection of well-behaved nodes'"
      class="badge badge-danger ms-2 mr-1"
    >
      No Quorum Intersection</span
    >
    <span
      v-if="federatedVotingStore.consensusReached.value"
      v-tooltip="'Consensus reached by intact nodes'"
      class="badge badge-success ms-2"
    >
      Consensus Reached
    </span>
    <span
      v-if="
        !federatedVotingStore.networkAnalysis.hasQuorumAvailabilityOfWellbehavedNodes(
          federatedVotingStore.illBehavedNodes,
        )
      "
      v-tooltip="'No quorum availability of well-behaved nodes'"
      class="badge badge-warning ms-2 mr-1"
    >
      No Quorum Availability
    </span>
    <span
      v-if="federatedVotingStore.isNetworkSplit.value"
      v-tooltip="'Network confirmed different values'"
      class="badge badge-danger ms-2"
    >
      Network Split
    </span>
    <span
      v-else-if="federatedVotingStore.isVoteStuck.value"
      class="badge badge-danger ms-2"
    >
      Vote Stuck
    </span>
  </div>
</template>

<script setup lang="ts">
import { federatedVotingStore } from "@/store/useFederatedVotingStore";
</script>

<style scoped>
.network-analysis-badges {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1px;
}
</style>
