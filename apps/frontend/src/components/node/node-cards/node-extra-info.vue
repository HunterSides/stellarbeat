<template>
  <div class="card">
    <div class="card-body py-0 d-flex align-items-center">
      <table class="table card-table">
        <tbody>
          <tr class="text-gray">
            <td class="px-0" style="font-weight: 600; font-size: 0.875rem">
              Domain
            </td>
            <td class="px-0 text-right">
              {{ node.homeDomain ? node.homeDomain : "N/A" }}
            </td>
          </tr>
          <tr class="text-gray">
            <td class="px-0" style="font-weight: 600; font-size: 0.875rem">
              Organization
            </td>
            <td
              v-if="
                node.organizationId &&
                network.getOrganizationById(node.organizationId)
              "
              class="px-0 text-right"
            >
              <router-link
                :to="{
                  name: 'organization-dashboard',
                  params: {
                    organizationId: node.organizationId,
                    view: $route.query.view,
                    network: $route.query.network,
                    at: $route.query.at,
                  },
                }"
              >
                {{ network.getOrganizationById(node.organizationId).name }}
              </router-link>
            </td>
            <td v-else class="px-0 text-right">N/A</td>
          </tr>
          <tr class="text-gray">
            <td class="px-0" style="font-weight: 600; font-size: 0.875rem">
              History url
            </td>
            <td class="px-0 flex-wrap text-right wrap-word">
              {{ node.historyUrl ? node.historyUrl : "N/A" }}
            </td>
          </tr>
          <tr v-if="node.overlayVersion" class="text-gray">
            <td class="px-0" style="font-weight: 600; font-size: 0.875rem">
              Overlay version
            </td>
            <td class="px-0 text-right">
              {{ node.overlayVersion }}
            </td>
          </tr>
          <tr v-if="node.overlayMinVersion" class="text-gray">
            <td class="px-0" style="font-weight: 600; font-size: 0.875rem">
              Overlay min version
            </td>
            <td class="px-0 text-right">
              {{ node.overlayMinVersion }}
            </td>
          </tr>
          <tr v-if="node.ledgerVersion" class="text-gray">
            <td class="px-0" style="font-weight: 600; font-size: 0.875rem">
              Ledger version
            </td>
            <td class="px-0 text-right">
              {{ node.ledgerVersion }}
            </td>
          </tr>
          <tr v-if="node.isValidator" class="text-gray">
            <td class="px-0" style="font-weight: 600; font-size: 0.875rem">
              Externalize lag
            </td>
            <td class="px-0 text-right">
              {{ node.lag !== null ? node.lag + " ms" : "Not detected" }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
<script setup lang="ts">
import { Node } from "shared";
import useStore from "@/store/useStore";

defineProps<{
  node: Node;
}>();

const store = useStore();
const network = store.network;
</script>

<style scoped>
.wrap-word {
  overflow-wrap: break-word;
  max-width: 20px;
}
</style>
