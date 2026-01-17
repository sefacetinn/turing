// Simple event emitter for scroll-to-top functionality
type Listener = (tabName: string) => void;

class ScrollToTopEmitter {
  private listeners: Listener[] = [];

  subscribe(listener: Listener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  emit(tabName: string) {
    this.listeners.forEach(listener => listener(tabName));
  }
}

export const scrollToTopEmitter = new ScrollToTopEmitter();
