import { HealthcareDataProvider } from './HealthcareDataProvider';
import { VerifiedDirectoryProvider } from './VerifiedDirectoryProvider';
import { GovernmentFacilityProvider } from './GovernmentFacilityProvider';
import { ABDMProvider } from './ABDMProvider';
import { DemoProvider } from './DemoProvider';
import { db } from '../db/store';

export class ProviderManager {
  private static instance: ProviderManager;
  private directoryProvider = new VerifiedDirectoryProvider();
  private governmentProvider = new GovernmentFacilityProvider();
  private abdmProvider = new ABDMProvider();
  private demoProvider = new DemoProvider();

  private activeProviderType: 'directory' | 'government' | 'abdm' | 'demo' = 'directory';

  private constructor() {}

  public static getInstance(): ProviderManager {
    if (!ProviderManager.instance) {
      ProviderManager.instance = new ProviderManager();
    }
    return ProviderManager.instance;
  }

  public getActiveProvider(): HealthcareDataProvider {
    // If system is explicitly in demo mode
    if (!db.isLiveMode) {
      return this.demoProvider;
    }

    switch (this.activeProviderType) {
      case 'government':
        return this.governmentProvider;
      case 'abdm':
        return this.abdmProvider;
      case 'demo':
        return this.demoProvider;
      case 'directory':
      default:
        return this.directoryProvider;
    }
  }

  public setProviderType(type: 'directory' | 'government' | 'abdm' | 'demo') {
    this.activeProviderType = type;
  }

  public getProviderStatus() {
    return [
      {
        id: 'directory',
        name: this.directoryProvider.name,
        type: 'Verified Maharashtra State Health Directory',
        isConnected: true,
        isActive: db.isLiveMode && this.activeProviderType === 'directory',
      },
      {
        id: 'government',
        name: this.governmentProvider.name,
        type: 'National Health Facility Registry (HFR/MOHFW)',
        isConnected: this.governmentProvider.isConnected,
        isActive: db.isLiveMode && this.activeProviderType === 'government',
      },
      {
        id: 'abdm',
        name: this.abdmProvider.name,
        type: 'Ayushman Bharat Digital Mission (M1/M2 Bridge)',
        isConnected: this.abdmProvider.isConnected,
        isActive: db.isLiveMode && this.activeProviderType === 'abdm',
      },
      {
        id: 'demo',
        name: this.demoProvider.name,
        type: 'Isolated Demonstration Sandbox',
        isConnected: true,
        isActive: !db.isLiveMode,
      },
    ];
  }
}

export const providerManager = ProviderManager.getInstance();
