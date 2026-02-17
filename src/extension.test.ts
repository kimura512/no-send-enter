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
    it('should call type command with newline when enabled', async () => {
      mockVscode.workspace.getConfiguration.mockReturnValue({
        get: jest.fn((key: string) => {
          if (key === 'enabled') return true;
          return undefined;
        }),
      });

      activate(mockContext);
      const newlineCallback = mockVscode.registeredCommands.get('noSendEnter.newline');
      expect(newlineCallback).toBeDefined();

      await newlineCallback();
      expect(mockVscode.commands.executeCommand).toHaveBeenCalledWith('type', { text: '\n' });
    });

    it('should not call type command when disabled', async () => {
      mockVscode.workspace.getConfiguration.mockReturnValue({
        get: jest.fn((key: string) => {
          if (key === 'enabled') return false;
          return undefined;
        }),
      });

      activate(mockContext);
      const newlineCallback = mockVscode.registeredCommands.get('noSendEnter.newline');
      expect(newlineCallback).toBeDefined();

      await newlineCallback();
      expect(mockVscode.commands.executeCommand).not.toHaveBeenCalled();
    });

    it('should check noSendEnter configuration section', async () => {
      mockVscode.workspace.getConfiguration.mockReturnValue({
        get: jest.fn(() => true),
      });

      activate(mockContext);
      const newlineCallback = mockVscode.registeredCommands.get('noSendEnter.newline');
      await newlineCallback();

      expect(mockVscode.workspace.getConfiguration).toHaveBeenCalledWith('noSendEnter');
    });
  });

  describe('noSendEnter.send command', () => {
    it('should call send commands when enabled', async () => {
      mockVscode.workspace.getConfiguration.mockReturnValue({
        get: jest.fn((key: string) => {
          if (key === 'enabled') return true;
          return undefined;
        }),
      });

      activate(mockContext);
      const sendCallback = mockVscode.registeredCommands.get('noSendEnter.send');
      expect(sendCallback).toBeDefined();

      await sendCallback();
      expect(mockVscode.commands.executeCommand).toHaveBeenCalledWith('workbench.action.chat.send');
      expect(mockVscode.commands.executeCommand).toHaveBeenCalledWith('chat.action.submit');
    });

    it('should not call send commands when disabled', async () => {
      mockVscode.workspace.getConfiguration.mockReturnValue({
        get: jest.fn((key: string) => {
          if (key === 'enabled') return false;
          return undefined;
        }),
      });

      activate(mockContext);
      const sendCallback = mockVscode.registeredCommands.get('noSendEnter.send');
      expect(sendCallback).toBeDefined();

      await sendCallback();
      expect(mockVscode.commands.executeCommand).not.toHaveBeenCalled();
    });

    it('should call both send commands via Promise.allSettled', async () => {
      mockVscode.workspace.getConfiguration.mockReturnValue({
        get: jest.fn(() => true),
      });
      mockVscode.commands.executeCommand.mockResolvedValue(undefined);

      activate(mockContext);
      const sendCallback = mockVscode.registeredCommands.get('noSendEnter.send');
      const result = await sendCallback();

      // Promise.allSettled returns an array of results
      expect(result).toBeInstanceOf(Array);
      expect(result).toHaveLength(2);
    });

    it('should check noSendEnter configuration section', async () => {
      mockVscode.workspace.getConfiguration.mockReturnValue({
        get: jest.fn(() => true),
      });

      activate(mockContext);
      const sendCallback = mockVscode.registeredCommands.get('noSendEnter.send');
      await sendCallback();

      expect(mockVscode.workspace.getConfiguration).toHaveBeenCalledWith('noSendEnter');
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
