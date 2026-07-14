
import React, { useState, useEffect } from 'react';
import { SettingsService } from '../services/storage';

interface AppIconProps {
  size?: number;
  className?: string;
}

// Gold Master Egypt Logo Component
// Renders the official premium Gold Master vector logo by default, or the custom base64 uploaded logo if set
export const AppIcon: React.FC<AppIconProps> = ({ size = 64, className = '' }) => {
  const [customLogo, setCustomLogo] = useState<string | null>(null);

  useEffect(() => {
    const loadLogo = () => {
      try {
        const store = SettingsService.getStoreProfile();
        if (store && store.logoBase64 && store.logoBase64.startsWith('data:')) {
          setCustomLogo(store.logoBase64);
        } else {
          setCustomLogo(null);
        }
      } catch (e) {
        setCustomLogo(null);
      }
    };

    loadLogo();

    // Listen for store-profile-updated event to update logo dynamically
    window.addEventListener('store-profile-updated', loadLogo);
    return () => {
      window.removeEventListener('store-profile-updated', loadLogo);
    };
  }, []);

  // If there is a custom uploaded logo in Settings, render it
  if (customLogo) {
    return (
      <img
        src={customLogo}
        alt="Gold Master Egypt"
        width={size}
        height={size}
        className={className}
        style={{ objectFit: 'cover', borderRadius: '24%' }}
        onError={() => setCustomLogo(null)}
      />
    );
  }

  // Otherwise, render the gorgeous, scalable vector logo matching the user's design exactly
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
    >
      <rect
        width="100"
        height="100"
        rx="24"
        fill="url(#goldMasterGradient)"
        stroke="rgba(255, 255, 255, 0.12)"
        strokeWidth="1.5"
      />
      {/* Subtle top inner light border */}
      <rect
        x="1.5"
        y="1.5"
        width="97"
        height="97"
        rx="22.5"
        fill="none"
        stroke="rgba(255, 255, 255, 0.08)"
        strokeWidth="1"
      />
      <text
        x="50"
        y="53"
        fill="#FFFFFF"
        fontFamily="'Inter', system-ui, -apple-system, sans-serif"
        fontWeight="800"
        fontSize="54"
        textAnchor="middle"
        dominantBaseline="middle"
      >
        G
      </text>
      <defs>
        <linearGradient id="goldMasterGradient" x1="0" y1="0" x2="100" y2="100">
          <stop offset="0%" stopColor="#bfa353" />
          <stop offset="50%" stopColor="#9e7f33" />
          <stop offset="100%" stopColor="#735617" />
        </linearGradient>
      </defs>
    </svg>
  );
};

