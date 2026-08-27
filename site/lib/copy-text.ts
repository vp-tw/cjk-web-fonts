export interface CopyTextStrategies {
  clipboard: (text: string) => Promise<void>;
  fallback: (text: string) => boolean;
}

export async function copyText(text: string, strategies: CopyTextStrategies): Promise<boolean> {
  try {
    await strategies.clipboard(text);
    return true;
  } catch {
    try {
      return strategies.fallback(text);
    } catch {
      return false;
    }
  }
}
