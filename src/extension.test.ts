import * as vscode from 'vscode';
import { activate, deactivate } from './extension';

const mockVscode = vscode as any;

describe('No-Send-Enter Extension', () => {
  let mockContext: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockVscode.registeredCommands.clear();

    mockContext = {
      subscriptions: [],
      extensionMode: 1, // ExtensionMode.Production
    };
  });

  describe('activate', () => {
    it('should register noSendEnter.newline command', () => {
      activate(mockContext);
      expect(mockVscode.commands.registerCommand).toHaveBeenCalledWith(
        'noSendEnter.newline',
        expect.any(Function),
      );
    });

    it('should register noSendEnter.send command', () => {
      activate(mockContext);
      expect(mockVscode.commands.registerCommand).toHaveBeenCalledWith(
        'noSendEnter.send',
        expect.any(Function),
      );
    });

    it('should push two disposables to context.subscriptions', () => {
      activate(mockContext);
      expect(mockContext.subscriptions).toHaveLength(2);
    });

    it('should push disposable objects with dispose method', () => {
      activate(mockContext);
      for (const sub of mockContext.subscriptions) {
        expect(sub).toHaveProperty('dispose');
        expect(typeof sub.dispose).toBe('function');
      }
    });
  });

  describe('noSendEnter.newline command', () => {
    it('should call default:type command with newline when enabled', async () => {
      mockVscode.workspace.getConfiguration.mockReturnValue({
        get: jest.fn((key: string) => {
          if (key === 'enabled') return true;
          if (key === 'debug') return false;
          return undefined;
        }),
      });
      mockVscode.commands.executeCommand.mockResolvedValue(undefined);

      activate(mockContext);
      const newlineCallback = mockVscode.registeredCommands.get('noSendEnter.newline');
      expect(newlineCallback).toBeDefined();

      await newlineCallback();
      expect(mockVscode.commands.executeCommand).toHaveBeenCalledWith('default:type', { text: '\n' });
    });

    it('should not call type command when disabled', async () => {
      mockVscode.workspace.getConfiguration.mockReturnValue({
        get: jest.fn((key: string) => {
          if (key === 'enabled') return false;
          if (key === 'debug') return false;
          return undefined;
        }),
      });

      activate(mockContext);
      const newlineCallback = mockVscode.registeredCommands.get('noSendEnter.newline');
      expect(newlineCallback).toBeDefined();

      await newlineCallback();
      expect(mockVscode.commands.executeCommand).not.toHaveBeenCalled();
    });

    it('should fall back to type command if default:type fails', async () => {
      mockVscode.workspace.getConfiguration.mockReturnValue({
        get: jest.fn((key: string) => {
          if (key === 'enabled') return true;
          if (key === 'debug') return false;
          return undefined;
        }),
      });
      mockVscode.commands.executeCommand
        .mockRejectedValueOnce(new Error('default:type failed'))
        .mockResolvedValueOnce(undefined);

      activate(mockContext);
      const newlineCallback = mockVscode.registeredCommands.get('noSendEnter.newline');

      await newlineCallback();
      expect(mockVscode.commands.executeCommand).toHaveBeenCalledWith('default:type', { text: '\n' });
      expect(mockVscode.commands.executeCommand).toHaveBeenCalledWith('type', { text: '\n' });
    });

    it('should check noSendEnter configuration section', async () => {
      mockVscode.workspace.getConfiguration.mockReturnValue({
        get: jest.fn(() => true),
      });
      mockVscode.commands.executeCommand.mockResolvedValue(undefined);

      activate(mockContext);
      const newlineCallback = mockVscode.registeredCommands.get('noSendEnter.newline');
      await newlineCallback();

      expect(mockVscode.workspace.getConfiguration).toHaveBeenCalledWith('noSendEnter');
    });
  });

  describe('noSendEnter.send command', () => {
    it('should call antigravity.sendChatActionMessage first when enabled', async () => {
      mockVscode.workspace.getConfiguration.mockReturnValue({
        get: jest.fn((key: string) => {
          if (key === 'enabled') return true;
          if (key === 'debug') return false;
          return undefined;
        }),
      });
      mockVscode.commands.executeCommand.mockResolvedValue(undefined);

      activate(mockContext);
      const sendCallback = mockVscode.registeredCommands.get('noSendEnter.send');
      expect(sendCallback).toBeDefined();

      await sendCallback();
      // First successful command stops the loop
      expect(mockVscode.commands.executeCommand).toHaveBeenCalledWith('antigravity.sendChatActionMessage');
      expect(mockVscode.commands.executeCommand).toHaveBeenCalledTimes(1);
    });

    it('should fall back to workbench.action.chat.submit if antigravity command fails', async () => {
      mockVscode.workspace.getConfiguration.mockReturnValue({
        get: jest.fn((key: string) => {
          if (key === 'enabled') return true;
          if (key === 'debug') return false;
          return undefined;
        }),
      });
      mockVscode.commands.executeCommand
        .mockRejectedValueOnce(new Error('antigravity not available'))
        .mockResolvedValueOnce(undefined);

      activate(mockContext);
      const sendCallback = mockVscode.registeredCommands.get('noSendEnter.send');

      await sendCallback();
      expect(mockVscode.commands.executeCommand).toHaveBeenCalledWith('antigravity.sendChatActionMessage');
      expect(mockVscode.commands.executeCommand).toHaveBeenCalledWith('workbench.action.chat.submit');
      expect(mockVscode.commands.executeCommand).toHaveBeenCalledTimes(2);
    });

    it('should not call send commands when disabled', async () => {
      mockVscode.workspace.getConfiguration.mockReturnValue({
        get: jest.fn((key: string) => {
          if (key === 'enabled') return false;
          if (key === 'debug') return false;
          return undefined;
        }),
      });

      activate(mockContext);
      const sendCallback = mockVscode.registeredCommands.get('noSendEnter.send');
      expect(sendCallback).toBeDefined();

      await sendCallback();
      expect(mockVscode.commands.executeCommand).not.toHaveBeenCalled();
    });

    it('should check noSendEnter configuration section', async () => {
      mockVscode.workspace.getConfiguration.mockReturnValue({
        get: jest.fn(() => true),
      });
      mockVscode.commands.executeCommand.mockResolvedValue(undefined);

      activate(mockContext);
      const sendCallback = mockVscode.registeredCommands.get('noSendEnter.send');
      await sendCallback();

      expect(mockVscode.workspace.getConfiguration).toHaveBeenCalledWith('noSendEnter');
    });

    it('should handle all send commands failing', async () => {
      mockVscode.workspace.getConfiguration.mockReturnValue({
        get: jest.fn((key: string) => {
          if (key === 'enabled') return true;
          if (key === 'debug') return false;
          return undefined;
        }),
      });
      mockVscode.commands.executeCommand.mockRejectedValue(new Error('Command failed'));

      activate(mockContext);
      const sendCallback = mockVscode.registeredCommands.get('noSendEnter.send');

      // Should not throw even if all commands fail
      await expect(sendCallback()).resolves.not.toThrow();
      expect(mockVscode.commands.executeCommand).toHaveBeenCalledTimes(3);
    });
  });

  describe('edge cases', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should handle enabled undefined (defaults to true)', async () => {
      mockVscode.workspace.getConfiguration.mockReturnValue({
        get: jest.fn((key: string, defaultValue?: any) => {
          if (key === 'enabled') return defaultValue;
          if (key === 'debug') return false;
          return undefined;
        }),
      });
      mockVscode.commands.executeCommand.mockResolvedValue(undefined);

      activate(mockContext);
      const newlineCallback = mockVscode.registeredCommands.get('noSendEnter.newline');

      await newlineCallback();
      expect(mockVscode.commands.executeCommand).toHaveBeenCalledWith('default:type', { text: '\n' });
    });

    it('should handle multiple consecutive newline calls', async () => {
      mockVscode.workspace.getConfiguration.mockReturnValue({
        get: jest.fn((key: string) => {
          if (key === 'enabled') return true;
          if (key === 'debug') return false;
          return undefined;
        }),
      });
      mockVscode.commands.executeCommand.mockResolvedValue(undefined);

      activate(mockContext);
      const newlineCallback = mockVscode.registeredCommands.get('noSendEnter.newline');

      await newlineCallback();
      await newlineCallback();
      await newlineCallback();

      expect(mockVscode.commands.executeCommand).toHaveBeenCalledTimes(3);
    });

    it('should handle debug config enabled', async () => {
      mockVscode.mockOutputChannel.appendLine.mockClear();
      mockVscode.workspace.getConfiguration.mockReturnValue({
        get: jest.fn((key: string) => {
          if (key === 'enabled') return true;
          if (key === 'debug') return true;
          return undefined;
        }),
      });
      mockVscode.commands.executeCommand.mockResolvedValue(undefined);

      activate(mockContext);
      const newlineCallback = mockVscode.registeredCommands.get('noSendEnter.newline');

      await newlineCallback();

      expect(mockVscode.mockOutputChannel.appendLine).toHaveBeenCalled();
    });

    it('should not log when debug disabled', async () => {
      mockVscode.workspace.getConfiguration.mockReturnValue({
        get: jest.fn((key: string) => {
          if (key === 'enabled') return true;
          if (key === 'debug') return false;
          return undefined;
        }),
      });
      mockVscode.commands.executeCommand.mockResolvedValue(undefined);

      activate(mockContext);
      const newlineCallback = mockVscode.registeredCommands.get('noSendEnter.newline');

      await newlineCallback();

      expect(mockVscode.mockOutputChannel.appendLine).not.toHaveBeenCalled();
    });

    it('should handle getConfiguration throwing error', async () => {
      mockVscode.workspace.getConfiguration.mockImplementation(() => {
        throw new Error('Config error');
      });
      mockVscode.commands.executeCommand.mockResolvedValue(undefined);

      activate(mockContext);
      const newlineCallback = mockVscode.registeredCommands.get('noSendEnter.newline');

      await expect(newlineCallback()).resolves.not.toThrow();
    });
  });

  describe('deactivate', () => {
    it('should run without error', () => {
      expect(() => deactivate()).not.toThrow();
    });

    it('should return undefined', () => {
      const result = deactivate();
      expect(result).toBeUndefined();
    });
  });
});
