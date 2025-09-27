class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.startTime = Date.now();
  }

  start(label) {
    this.metrics.set(label, Date.now());
  }

  end(label) {
    const startTime = this.metrics.get(label);
    if (!startTime) return null;

    const duration = Date.now() - startTime;
    this.metrics.delete(label);
    return duration;
  }

  getUptime() {
    return Date.now() - this.startTime;
  }

  log(label, duration) {
    if (duration > 1000) {
      console.warn(`⚠️  Slow operation: ${label} took ${duration}ms`);
    } else if (duration > 500) {
      console.log(`⏱️  ${label} took ${duration}ms`);
    }
  }
}

// Singleton instance
const performanceMonitor = new PerformanceMonitor();

export default performanceMonitor;
