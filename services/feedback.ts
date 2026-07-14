import { Haptics, ImpactStyle } from '@capacitor/haptics';

export const FeedbackService = {
  vibrateLight: async () => {
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch {
      if (navigator.vibrate) navigator.vibrate(10);
    }
  },
  
  vibrateSuccess: async () => {
    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
      setTimeout(async () => await Haptics.impact({ style: ImpactStyle.Heavy }), 150);
    } catch {
      if (navigator.vibrate) navigator.vibrate([20, 50, 30]);
    }
  },
  
  playSuccessSound: () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc1.type = 'sine';
      osc2.type = 'triangle';
      
      osc1.frequency.setValueAtTime(987.77, ctx.currentTime);
      osc1.frequency.setValueAtTime(1318.51, ctx.currentTime + 0.1);
      
      osc2.frequency.setValueAtTime(987.77, ctx.currentTime);
      osc2.frequency.setValueAtTime(1318.51, ctx.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
      
      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc1.start(ctx.currentTime);
      osc2.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.6);
      osc2.stop(ctx.currentTime + 0.6);
    } catch (e) {
      console.warn("AudioContext error", e);
    }
  },
  
  triggerSuccess: async () => {
    FeedbackService.playSuccessSound();
    await FeedbackService.vibrateSuccess();
  }
};
