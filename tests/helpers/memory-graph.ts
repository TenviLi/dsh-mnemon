import { vi } from 'vitest'
import { resolveConfig } from '../../src/config.ts'
import type { MnemonRuntimeGraph } from '../../src/live-runtime.ts'
import {
  DEFAULT_THREE_TIER_TOPOLOGY,
  MemoryCatalog,
  MemoryKernel,
  MemoryTopologyManager,
  MemoryTurnViewManager,
  registerDefaultMemorySystem,
  type MemorySource,
} from '../../src/memory-system/index.ts'
import type { SearchRequest } from '../../src/service.ts'

/** Real View/Kernel authority, with only the external Provider replaced. */
export function memoryGraphFixture(initialIds = ['project']) {
  let activeIds = [...initialIds]
  const config = resolveConfig({ cliPath: '/fake/mnemon', storageScope: 'global', writeEnabled: false })
  const catalog = new MemoryCatalog()
  registerDefaultMemorySystem(catalog)
  const topology = new MemoryTopologyManager(catalog, DEFAULT_THREE_TIER_TOPOLOGY)
  for (const layer of topology.snapshot().layers) {
    if (layer.id !== 'memory-spaces') topology.configureLayer(layer.id, { participation: { projection: 'off' } })
  }
  const kernel = new MemoryKernel(catalog, topology)
  const snapshot = vi.fn<MemorySource['snapshot']>(() => ({
    revision: activeIds.join(','),
    wake: 'Active Memory Spaces.',
    state: { memoryBodyIds: activeIds },
  }))
  const views = new MemoryTurnViewManager(kernel, [{ layerId: 'memory-spaces', mode: 'routed', snapshot }], { maxViews: 2 })
  const search = vi.fn(async (request: SearchRequest) => ({
    query: request.query,
    mode: 'smart',
    results: (request.memoryBodyIds ?? []).map(memoryBodyId => ({
      id: `${memoryBodyId}:${request.query}`,
      content: `Evidence for ${request.query} in ${memoryBodyId}.`,
      relevanceTier: 'high',
      memoryBodyId,
    })),
  }))
  const graph = {
    config,
    memoryViews: views,
    memoryCatalog: catalog,
    memoryTopology: topology,
    memoryKernel: kernel,
    service: { config, search },
    dispose: vi.fn(),
  } as unknown as MnemonRuntimeGraph
  return { graph, views, search, snapshot, setIds: (ids: string[]) => { activeIds = [...ids] } }
}
