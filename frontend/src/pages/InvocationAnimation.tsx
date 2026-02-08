import React from 'react';
import LaptopInvocationAnimation from '../components/LaptopInvocationAnimation';

interface InvocationAnimationProps {
  onAnimationComplete: () => void;
}

export default function InvocationAnimation({ onAnimationComplete }: InvocationAnimationProps) {
  return <LaptopInvocationAnimation onAnimationComplete={onAnimationComplete} />;
}
