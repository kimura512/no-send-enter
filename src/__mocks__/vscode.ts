// Mock for vscode module

const registeredCommands = new Map<string, (...args: any[]) => any>();

const commands = {
  registerCommand: jest.fn((command: string, callback: (...args: any[]) => any) => {
    registeredCommands.set(command, callback);
    return { dispose: jest.fn() };
  }),
  executeCommand: jest.fn(),
};

const workspace = {
  getConfiguration: jest.fn((section?: string) => ({
    get: jest.fn((key: string, defaultValue?: any) => {
      if (key === 'enabled') return true;
      return defaultValue;
    }),
  })),
};

const window = {
  showInformationMessage: jest.fn(),
  showErrorMessage: jest.fn(),
};

export { commands, workspace, window, registeredCommands };
