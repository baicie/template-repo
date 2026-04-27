import { z } from 'zod'

export const ToolPermissionSchema = z.enum([
  'read',
  'write',
  'network',
  'shell',
  'dangerous',
])

export type ToolPermission = z.infer<typeof ToolPermissionSchema>

export const ToolContextSchema = z.object({
  workspace: z.string(),
  sessionId: z.string(),
})

export type ToolContext = z.infer<typeof ToolContextSchema>

export const ToolSchema = z.object({
  name: z.string(),
  description: z.string(),
  permission: ToolPermissionSchema,
  requiresApproval: z.boolean().optional(),
  parameters: z.any(),
})

export type AgentTool = z.infer<typeof ToolSchema>

export const SkillSchema = z.object({
  name: z.string(),
  description: z.string(),
  triggers: z.array(z.string()),
  permissions: z.array(ToolPermissionSchema),
  tools: z.array(z.string()),
  content: z.string(),
})

export type Skill = z.infer<typeof SkillSchema>

export const MemoryItemSchema = z.object({
  id: z.string().optional(),
  type: z.enum([
    'user_preference',
    'project_context',
    'task_history',
    'long_term',
  ]),
  content: z.string(),
  metadata: z.record(z.string(), z.string()).optional(),
  createdAt: z.string().optional(),
})

export type MemoryItem = z.infer<typeof MemoryItemSchema>

export const AgentRunStateSchema = z.enum([
  'created',
  'context_building',
  'thinking',
  'tool_checking',
  'tool_executing',
  'observing',
  'finalizing',
  'failed',
])

export type AgentRunState = z.infer<typeof AgentRunStateSchema>

export const AgentEventSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('run.started'),
    sessionId: z.string(),
    input: z.string(),
  }),
  z.object({
    type: z.literal('skill.selected'),
    sessionId: z.string(),
    skills: z.array(z.string()),
  }),
  z.object({ type: z.literal('agent.thinking'), sessionId: z.string() }),
  z.object({
    type: z.literal('tool.call.started'),
    sessionId: z.string(),
    toolName: z.string(),
    args: z.unknown(),
  }),
  z.object({
    type: z.literal('tool.call.finished'),
    sessionId: z.string(),
    toolName: z.string(),
    result: z.unknown(),
  }),
  z.object({
    type: z.literal('approval.requested'),
    sessionId: z.string(),
    toolName: z.string(),
    args: z.unknown(),
  }),
  z.object({
    type: z.literal('run.finished'),
    sessionId: z.string(),
    output: z.string(),
  }),
  z.object({
    type: z.literal('run.failed'),
    sessionId: z.string(),
    error: z.string(),
  }),
])

export type AgentEvent = z.infer<typeof AgentEventSchema>

export const ModelGenerateInputSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['system', 'user', 'assistant', 'tool']),
      content: z.string(),
      name: z.string().optional(),
    }),
  ),
  tools: z.array(ToolSchema).optional(),
  temperature: z.number().optional(),
})

export type ModelGenerateInput = z.infer<typeof ModelGenerateInputSchema>

export const ModelGenerateResultSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('final'), content: z.string() }),
  z.object({
    type: z.literal('tool_call'),
    name: z.string(),
    args: z.unknown(),
  }),
])

export type ModelGenerateResult = z.infer<typeof ModelGenerateResultSchema>
