// Error monitoring for frontend
const ERROR_MONITOR_URL = process.env.NEXT_PUBLIC_ERROR_MONITOR_URL || null;
const APP_NAME = 'sistem-agent-frontend';
const APP_VERSION = '1.0.0';

class FrontendErrorMonitor {
  constructor() {
    this.enabled = !!ERROR_MONITOR_URL;
    if (this.enabled) {
      this.setupGlobalHandlers();
      console.log('[Error Monitor] Enabled:', ERROR_MONITOR_URL);
    }
  }

  setupGlobalHandlers() {
    //捕获JavaScript错误
    window.onerror = (message, source, lineno, colno, error) => {
      this.captureError({
        name: 'JavaScript Error',
        message: String(message),
        stack: error?.stack,
        context: {
          type: 'window.onerror',
          source,
          lineno,
          colno,
          url: window.location.href,
          userAgent: navigator.userAgent
        }
      });
    };

    // 捕获未处理的Promise拒绝
    window.onunhandledrejection = (event) => {
      const error = event.reason instanceof Error 
        ? event.reason 
        : new Error(String(event.reason));
      
      this.captureError({
        name: 'Unhandled Promise Rejection',
        message: error.message,
        stack: error.stack,
        context: {
          type: 'unhandledrejection',
          reason: String(event.reason),
          url: window.location.href
        }
      });
    };

    // 捕获React错误
    if (typeof window !== 'undefined') {
      const originalConsoleError = console.error;
      console.error = (...args) => {
        // 检测React错误
        if (args[0]?.includes?.('Error:') || args[0]?.includes?.('Warning:')) {
          this.captureError({
            name: 'React Error',
            message: String(args[0]),
            stack: args[1]?.stack,
            context: {
              type: 'react-error',
              args: args.map(String).slice(0, 3),
              url: window.location.href
            }
          });
        }
        originalConsoleError.apply(console, args);
      };
    }
  }

  async captureError(errorData) {
    if (!this.enabled) return;

    try {
      const payload = {
        app: APP_NAME,
        version: APP_VERSION,
        timestamp: new Date().toISOString(),
        name: errorData.name,
        message: errorData.message,
        stack: errorData.stack,
        context: {
          ...errorData.context,
          platform: navigator.platform,
          userAgent: navigator.userAgent,
          screenWidth: window.screen.width,
          screenHeight: window.screen.height,
          viewportWidth: window.innerWidth,
          viewportHeight: window.innerHeight
        }
      };

      await fetch(`${ERROR_MONITOR_URL}/api/errors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true
      });

      console.log('[Error Monitor] Error sent:', errorData.name);
    } catch (err) {
      console.error('[Error Monitor] Failed to send error:', err);
    }
  }

  // 手动报告错误
  report(error, context = {}) {
    this.captureError({
      name: error?.name || 'Manual Error',
      message: error?.message || String(error),
      stack: error?.stack,
      context: { ...context, type: 'manual' }
    });
  }
}

// 创建全局实例
window.errorMonitor = new FrontendErrorMonitor();

export default FrontendErrorMonitor;