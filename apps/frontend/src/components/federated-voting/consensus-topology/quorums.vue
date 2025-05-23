<template>
  <div>
    <ul class="quorum-list">
      <li
        v-for="(quorum, index) in paginatedQuorums"
        :key="index"
        class="quorum-item"
      >
        <div class="node-list">
          <FbasNodeBadge
            v-for="node in quorum"
            :key="node"
            :node-id="node"
            :show-vote="true"
            :visualize-phase="true"
            @select="handleNodeSelect(node)"
          />
        </div>
        <div class="quorum-badge">
          <span v-if="isMinimal(quorum)" class="minimal-badge"> Minimal </span>
        </div>
      </li>
    </ul>

    <!-- Pagination Controls -->
    <div class="pagination">
      <button
        class="btn btn-sm btn-secondary"
        :disabled="currentPage === 1"
        @click="previousPage"
      >
        Previous
      </button>
      <span>Page {{ currentPage }} of {{ totalPages }}</span>
      <button
        class="btn btn-sm btn-secondary"
        :disabled="currentPage === totalPages"
        @click="nextPage"
      >
        Next
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from "vue";
import { federatedVotingStore } from "@/store/useFederatedVotingStore";
import FbasNodeBadge from "../fbas-node-badge.vue";
import {
  findQuorums,
  findTransitivelyTrustedNodes,
} from "../analysis/DSetAnalysis";

const quorums = computed(() => {
  const selectedNodeId = federatedVotingStore.selectedNodeId;
  let result;

  if (selectedNodeId === null) {
    result = federatedVotingStore.networkAnalysis.quorums;
  } else {
    //only show quorums that make sense for the selected node. meaning quorums that it transitively trusts.
    //E.g. No nodes that trust the selected node, but are not trusted back
    const transitiveTrusts = findTransitivelyTrustedNodes(
      selectedNodeId,
      federatedVotingStore.networkAnalysis.quorumSlices,
    );
    result = federatedVotingStore.networkAnalysis.quorums.filter((quorum) => {
      return Array.from(quorum).every((node) => transitiveTrusts.has(node));
    });
  }

  // Sort by minimal first, then by size
  return result.sort((a, b) => {
    const aIsMinimal = isMinimal(a);
    const bIsMinimal = isMinimal(b);

    // Sort minimal quorums first
    if (aIsMinimal && !bIsMinimal) return -1;
    if (!aIsMinimal && bIsMinimal) return 1;

    // If both are minimal or both are non-minimal, sort by size
    return a.size - b.size;
  });
});

const currentPage = ref(1);
const itemsPerPage = 5;

const totalPages = computed(() =>
  Math.ceil(quorums.value.length / itemsPerPage),
);

const paginatedQuorums = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return quorums.value.slice(start, start + itemsPerPage);
});

function handleNodeSelect(node: string): void {
  federatedVotingStore.selectedNodeId = node;
  currentPage.value = 1;
}

function isMinimal(quorum: Set<string>): boolean {
  return (
    federatedVotingStore.networkAnalysis.minimalQuorums.filter(
      (minimalQuorum) => {
        return (
          minimalQuorum.size === quorum.size &&
          Array.from(minimalQuorum).every((node) => quorum.has(node))
        );
      },
    ).length > 0
  );
}

function nextPage(): void {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
}

function previousPage(): void {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
}
</script>

<style scoped>
/* List styling */
.quorum-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.quorum-item {
  display: flex;
  padding: 10px 0;
  justify-content: space-between;
  border-bottom: 1px solid #eee;
  gap: 6px;
}

.quorum-item:last-child {
  border-bottom: none;
}

.quorum-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 0;
}

.quorum-nodes {
  flex: 1;
}

.node-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.quorum-badge {
  margin-left: 10px;
}

.minimal-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.85em;
  background-color: #28a745;
  color: #fff;
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
}

.pagination button {
  padding: 4px 8px;
}
</style>
