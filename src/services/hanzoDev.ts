/**
 * Hanzo Dev Service - Pure JS Coding Agent for Browser
 *
 * A browser-compatible implementation of @hanzo/dev that runs inside zOS.
 * Uses WebContainers for shell execution and virtual file system for storage.
 */

import { hanzoGateway, HANZO_DEV_SYSTEM_PROMPT } from './hanzoGateway';
import { logger } from '@/lib/logger';

// Types
export interface DevFile {
  path: string;
  content: string;
  language?: string;
}

export interface DevProject {
  id: string;
  name: string;
  files: Map<string, DevFile>;
  createdAt: Date;
  updatedAt: Date;
}

export interface DevMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  files?: DevFile[];
  command?: string;
}

export interface DevSession {
  id: string;
  project: DevProject;
  messages: DevMessage[];
  model: string;
}

export interface CommandResult {
  success: boolean;
  output: string;
  files?: DevFile[];
  error?: string;
}

// Command handlers
type CommandHandler = (args: string, session: DevSession) => Promise<CommandResult>;

// Storage keys
const STORAGE_KEYS = {
  PROJECTS: 'hanzo-dev-projects',
  SESSIONS: 'hanzo-dev-sessions',
};

/**
 * Hanzo Dev Service - Browser-based coding agent
 */
class HanzoDevService {
  private sessions: Map<string, DevSession> = new Map();
  private commands: Map<string, CommandHandler> = new Map();
  private webContainer: any = null; // WebContainer instance

  constructor() {
    this.registerCommands();
    this.loadFromStorage();
  }

  /**
   * Register slash commands
   */
  private registerCommands() {
    // /plan - Create implementation plan
    this.commands.set('plan', async (args, session) => {
      const prompt = `Create a detailed implementation plan for the following task. Include:
1. Overview of the approach
2. Files that need to be created or modified
3. Step-by-step implementation order
4. Potential challenges and how to address them
5. Testing strategy

Task: ${args}

Current project files:
${this.getProjectFileList(session.project)}`;

      const response = await this.chat(prompt, session);
      return { success: true, output: response };
    });

    // /code - Generate code
    this.commands.set('code', async (args, session) => {
      const prompt = `Generate production-ready code for the following requirement.
- Write clean, well-structured code
- Include proper error handling
- Add comments only where logic is complex
- Follow best practices for the language/framework

Requirement: ${args}

Existing project context:
${this.getProjectContext(session.project)}`;

      const response = await this.chat(prompt, session);
      const files = this.extractCodeBlocks(response);
      return { success: true, output: response, files };
    });

    // /debug - Debug code
    this.commands.set('debug', async (args, session) => {
      const prompt = `Analyze and debug the following code or error. Provide:
1. Root cause analysis
2. Step-by-step fix
3. Prevention strategies

Issue: ${args}

Project files for context:
${this.getProjectContext(session.project)}`;

      const response = await this.chat(prompt, session);
      return { success: true, output: response };
    });

    // /review - Code review
    this.commands.set('review', async (args, session) => {
      const targetFile = args.trim();
      const file = session.project.files.get(targetFile);

      const prompt = `Review the following code for:
1. Bugs and potential issues
2. Performance improvements
3. Security vulnerabilities
4. Code quality and maintainability
5. Best practices adherence

${file ? `File: ${targetFile}\n\`\`\`\n${file.content}\n\`\`\`` : `Code to review:\n${args}`}`;

      const response = await this.chat(prompt, session);
      return { success: true, output: response };
    });

    // /test - Generate tests
    this.commands.set('test', async (args, session) => {
      const prompt = `Generate comprehensive tests for the following. Include:
1. Unit tests for individual functions
2. Edge cases and error scenarios
3. Integration tests where applicable
4. Mock setup if needed

Target: ${args}

Project context:
${this.getProjectContext(session.project)}`;

      const response = await this.chat(prompt, session);
      const files = this.extractCodeBlocks(response);
      return { success: true, output: response, files };
    });

    // /explain - Explain code
    this.commands.set('explain', async (args, session) => {
      const prompt = `Explain the following code in detail:
1. What it does at a high level
2. How each major section works
3. Key patterns or techniques used
4. Potential improvements

Code to explain:
${args}`;

      const response = await this.chat(prompt, session);
      return { success: true, output: response };
    });

    // /refactor - Refactor code
    this.commands.set('refactor', async (args, session) => {
      const prompt = `Refactor the following code to improve:
1. Readability and maintainability
2. Performance where applicable
3. Code structure and organization
4. Following SOLID principles

Provide the complete refactored code.

${args}`;

      const response = await this.chat(prompt, session);
      const files = this.extractCodeBlocks(response);
      return { success: true, output: response, files };
    });

    // /file - Create or update file
    this.commands.set('file', async (args, session) => {
      const [path, ...contentParts] = args.split('\n');
      const content = contentParts.join('\n');

      if (!path.trim()) {
        return { success: false, output: '', error: 'Usage: /file <path>\n<content>' };
      }

      const file: DevFile = {
        path: path.trim(),
        content: content,
        language: this.detectLanguage(path.trim()),
      };

      session.project.files.set(file.path, file);
      session.project.updatedAt = new Date();
      this.saveToStorage();

      return {
        success: true,
        output: `Created/updated file: ${file.path}`,
        files: [file]
      };
    });

    // /ls - List project files
    this.commands.set('ls', async (_args, session) => {
      const files = Array.from(session.project.files.keys());
      if (files.length === 0) {
        return { success: true, output: 'No files in project' };
      }
      return { success: true, output: files.join('\n') };
    });

    // /cat - Show file contents
    this.commands.set('cat', async (args, session) => {
      const path = args.trim();
      const file = session.project.files.get(path);
      if (!file) {
        return { success: false, output: '', error: `File not found: ${path}` };
      }
      return { success: true, output: `\`\`\`${file.language || ''}\n${file.content}\n\`\`\`` };
    });

    // /rm - Remove file
    this.commands.set('rm', async (args, session) => {
      const path = args.trim();
      if (!session.project.files.has(path)) {
        return { success: false, output: '', error: `File not found: ${path}` };
      }
      session.project.files.delete(path);
      session.project.updatedAt = new Date();
      this.saveToStorage();
      return { success: true, output: `Deleted: ${path}` };
    });

    // /run - Execute code (via WebContainer if available)
    this.commands.set('run', async (args, session) => {
      if (!this.webContainer) {
        return {
          success: false,
          output: '',
          error: 'WebContainer not initialized. Run /init-container first.'
        };
      }

      try {
        const result = await this.executeInContainer(args, session);
        return { success: true, output: result };
      } catch (error) {
        return {
          success: false,
          output: '',
          error: `Execution failed: ${(error as Error).message}`
        };
      }
    });

    // /help - Show available commands
    this.commands.set('help', async () => {
      const help = `# Hanzo Dev Commands

## Code Generation
- \`/plan <task>\` - Create an implementation plan
- \`/code <requirement>\` - Generate code
- \`/refactor <code>\` - Refactor code

## Code Analysis
- \`/debug <issue>\` - Debug code or error
- \`/review <file or code>\` - Code review
- \`/explain <code>\` - Explain how code works
- \`/test <target>\` - Generate tests

## File Operations
- \`/file <path>\` - Create/update file (content on next lines)
- \`/ls\` - List project files
- \`/cat <path>\` - Show file contents
- \`/rm <path>\` - Delete file

## Execution
- \`/run <command>\` - Run command in WebContainer

## Help
- \`/help\` - Show this help`;

      return { success: true, output: help };
    });
  }

  /**
   * Create a new session
   */
  createSession(projectName: string = 'New Project'): DevSession {
    const session: DevSession = {
      id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      project: {
        id: `project-${Date.now()}`,
        name: projectName,
        files: new Map(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      messages: [],
      model: 'deepseek-chat',
    };

    this.sessions.set(session.id, session);
    this.saveToStorage();
    return session;
  }

  /**
   * Get or create session
   */
  getSession(sessionId?: string): DevSession {
    if (sessionId && this.sessions.has(sessionId)) {
      return this.sessions.get(sessionId)!;
    }
    return this.createSession();
  }

  /**
   * Process user input - handles commands and chat
   */
  async processInput(input: string, sessionId?: string): Promise<CommandResult> {
    const session = this.getSession(sessionId);
    const trimmedInput = input.trim();

    // Check for slash commands
    if (trimmedInput.startsWith('/')) {
      const [command, ...argParts] = trimmedInput.slice(1).split(' ');
      const args = argParts.join(' ');

      const handler = this.commands.get(command.toLowerCase());
      if (handler) {
        // Add user message
        session.messages.push({
          role: 'user',
          content: trimmedInput,
          timestamp: new Date(),
          command: command,
        });

        const result = await handler(args, session);

        // Add assistant response
        session.messages.push({
          role: 'assistant',
          content: result.output,
          timestamp: new Date(),
          files: result.files,
        });

        this.saveToStorage();
        return result;
      } else {
        return {
          success: false,
          output: '',
          error: `Unknown command: /${command}. Type /help for available commands.`,
        };
      }
    }

    // Regular chat
    session.messages.push({
      role: 'user',
      content: trimmedInput,
      timestamp: new Date(),
    });

    const response = await this.chat(trimmedInput, session);
    const files = this.extractCodeBlocks(response);

    session.messages.push({
      role: 'assistant',
      content: response,
      timestamp: new Date(),
      files: files.length > 0 ? files : undefined,
    });

    this.saveToStorage();
    return { success: true, output: response, files };
  }

  /**
   * Stream response for UI
   */
  async *processInputStream(input: string, sessionId?: string): AsyncGenerator<string, CommandResult, unknown> {
    const session = this.getSession(sessionId);
    const trimmedInput = input.trim();

    // Check for slash commands - these don't stream
    if (trimmedInput.startsWith('/')) {
      const result = await this.processInput(input, sessionId);
      yield result.output;
      return result;
    }

    // Regular chat with streaming
    session.messages.push({
      role: 'user',
      content: trimmedInput,
      timestamp: new Date(),
    });

    let fullResponse = '';

    for await (const chunk of hanzoGateway.chatStream(trimmedInput, {
      model: session.model,
      systemPrompt: HANZO_DEV_SYSTEM_PROMPT,
      temperature: 0.7,
      maxTokens: 4096,
    })) {
      fullResponse += chunk;
      yield chunk;
    }

    const files = this.extractCodeBlocks(fullResponse);

    session.messages.push({
      role: 'assistant',
      content: fullResponse,
      timestamp: new Date(),
      files: files.length > 0 ? files : undefined,
    });

    this.saveToStorage();
    return { success: true, output: fullResponse, files };
  }

  /**
   * Chat with AI
   */
  private async chat(message: string, session: DevSession): Promise<string> {
    try {
      return await hanzoGateway.chat(message, {
        model: session.model,
        systemPrompt: HANZO_DEV_SYSTEM_PROMPT,
        temperature: 0.7,
        maxTokens: 4096,
      });
    } catch (error) {
      logger.error('Hanzo Dev chat error:', error);
      throw error;
    }
  }

  /**
   * Initialize WebContainer for code execution
   */
  async initWebContainer(): Promise<boolean> {
    try {
      // Dynamic import to avoid SSR issues
      const { WebContainer } = await import('@webcontainer/api');
      this.webContainer = await WebContainer.boot();
      logger.info('WebContainer initialized');
      return true;
    } catch (error) {
      logger.error('Failed to initialize WebContainer:', error);
      return false;
    }
  }

  /**
   * Execute command in WebContainer
   */
  private async executeInContainer(command: string, session: DevSession): Promise<string> {
    if (!this.webContainer) {
      throw new Error('WebContainer not initialized');
    }

    // Mount project files
    const files: Record<string, any> = {};
    session.project.files.forEach((file, path) => {
      const parts = path.split('/');
      let current = files;
      for (let i = 0; i < parts.length - 1; i++) {
        if (!current[parts[i]]) {
          current[parts[i]] = { directory: {} };
        }
        current = current[parts[i]].directory;
      }
      current[parts[parts.length - 1]] = { file: { contents: file.content } };
    });

    await this.webContainer.mount(files);

    // Execute command
    const process = await this.webContainer.spawn('sh', ['-c', command]);

    let output = '';
    process.output.pipeTo(new WritableStream({
      write(chunk) {
        output += chunk;
      }
    }));

    const exitCode = await process.exit;

    if (exitCode !== 0) {
      throw new Error(`Command exited with code ${exitCode}: ${output}`);
    }

    return output;
  }

  /**
   * Extract code blocks from markdown response
   */
  private extractCodeBlocks(content: string): DevFile[] {
    const files: DevFile[] = [];
    const codeBlockRegex = /```(\w+)?\s*(?:\/\/\s*(.+?))?[\r\n]([\s\S]*?)```/g;

    let match;
    while ((match = codeBlockRegex.exec(content)) !== null) {
      const language = match[1] || '';
      const pathComment = match[2];
      const code = match[3].trim();

      if (code && pathComment) {
        files.push({
          path: pathComment.trim(),
          content: code,
          language,
        });
      }
    }

    return files;
  }

  /**
   * Detect language from file extension
   */
  private detectLanguage(path: string): string {
    const ext = path.split('.').pop()?.toLowerCase();
    const langMap: Record<string, string> = {
      ts: 'typescript',
      tsx: 'typescript',
      js: 'javascript',
      jsx: 'javascript',
      py: 'python',
      go: 'go',
      rs: 'rust',
      java: 'java',
      cpp: 'cpp',
      c: 'c',
      css: 'css',
      html: 'html',
      json: 'json',
      yaml: 'yaml',
      yml: 'yaml',
      md: 'markdown',
      sh: 'bash',
      sql: 'sql',
    };
    return langMap[ext || ''] || ext || '';
  }

  /**
   * Get project file list
   */
  private getProjectFileList(project: DevProject): string {
    const files = Array.from(project.files.keys());
    return files.length > 0 ? files.join('\n') : '(no files yet)';
  }

  /**
   * Get project context for AI
   */
  private getProjectContext(project: DevProject): string {
    const files = Array.from(project.files.entries());
    if (files.length === 0) return '(no project files)';

    return files
      .slice(0, 5) // Limit to prevent token overflow
      .map(([path, file]) => `// ${path}\n\`\`\`${file.language}\n${file.content}\n\`\`\``)
      .join('\n\n');
  }

  /**
   * Save to localStorage
   */
  private saveToStorage() {
    try {
      const sessions = Array.from(this.sessions.entries()).map(([id, session]) => ({
        id,
        project: {
          ...session.project,
          files: Array.from(session.project.files.entries()),
        },
        messages: session.messages,
        model: session.model,
      }));
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
    } catch (error) {
      logger.error('Failed to save Hanzo Dev sessions:', error);
    }
  }

  /**
   * Load from localStorage
   */
  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SESSIONS);
      if (stored) {
        const sessions = JSON.parse(stored);
        sessions.forEach((data: any) => {
          const session: DevSession = {
            id: data.id,
            project: {
              ...data.project,
              files: new Map(data.project.files),
              createdAt: new Date(data.project.createdAt),
              updatedAt: new Date(data.project.updatedAt),
            },
            messages: data.messages.map((m: any) => ({
              ...m,
              timestamp: new Date(m.timestamp),
            })),
            model: data.model,
          };
          this.sessions.set(session.id, session);
        });
      }
    } catch (error) {
      logger.error('Failed to load Hanzo Dev sessions:', error);
    }
  }

  /**
   * Check if WebContainer is available
   */
  isWebContainerAvailable(): boolean {
    return this.webContainer !== null;
  }

  /**
   * Get all sessions
   */
  getSessions(): DevSession[] {
    return Array.from(this.sessions.values());
  }

  /**
   * Delete session
   */
  deleteSession(sessionId: string): boolean {
    const deleted = this.sessions.delete(sessionId);
    if (deleted) {
      this.saveToStorage();
    }
    return deleted;
  }
}

// Export singleton
export const hanzoDev = new HanzoDevService();

// Export class for custom instances
export { HanzoDevService };
