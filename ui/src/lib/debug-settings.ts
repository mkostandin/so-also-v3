/**
 * Debug settings for development mode
 * Controls whether API calls include test data
 */

const DEBUG_STORAGE_KEY = 'volo-debug-mode';

export class DebugSettings {
	private static instance: DebugSettings;
	private debugMode: boolean = true; // Default to true for development
	private listeners: Array<(enabled: boolean) => void> = [];

	private constructor() {
		// Load from localStorage on initialization
		this.loadFromStorage();
	}

	static getInstance(): DebugSettings {
		if (!DebugSettings.instance) {
			DebugSettings.instance = new DebugSettings();
		}
		return DebugSettings.instance;
	}

	private loadFromStorage(): void {
		try {
			const stored = localStorage.getItem(DEBUG_STORAGE_KEY);
			if (stored !== null) {
				this.debugMode = JSON.parse(stored);
			} else {
				// Default to true for development if not set
				this.debugMode = true;
				this.saveToStorage();
			}
		} catch (error) {
			console.warn('Failed to load debug settings from storage:', error);
			this.debugMode = true;
		}
	}

	private saveToStorage(): void {
		try {
			localStorage.setItem(DEBUG_STORAGE_KEY, JSON.stringify(this.debugMode));
		} catch (error) {
			console.warn('Failed to save debug settings to storage:', error);
		}
	}

	isDebugModeEnabled(): boolean {
		return this.debugMode;
	}

	setDebugMode(enabled: boolean): void {
		this.debugMode = enabled;
		this.saveToStorage();
		this.notifyListeners();
	}

	toggleDebugMode(): void {
		this.setDebugMode(!this.debugMode);
	}

	addListener(callback: (enabled: boolean) => void): () => void {
		this.listeners.push(callback);
		return () => {
			const index = this.listeners.indexOf(callback);
			if (index > -1) {
				this.listeners.splice(index, 1);
			}
		};
	}

	private notifyListeners(): void {
		this.listeners.forEach(callback => {
			try {
				callback(this.debugMode);
			} catch (error) {
				console.error('Error in debug settings listener:', error);
			}
		});
	}
}

// Export singleton instance
export const debugSettings = DebugSettings.getInstance();
