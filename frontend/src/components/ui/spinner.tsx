import type { HTMLAttributes } from 'react'

interface CircleSpinnerProps {
  className?: string
}

const arcRatio = 1 / 4

export const CircleSpinner: React.FC<CircleSpinnerProps> = ({ className }) => {
  return (
    <svg
      className={`animate-spin ${className}`}
      viewBox='0 0 50 50'
      fill='none'
      aria-label='Loading'
    >
      {/* 外側のリング（全体） */}
      <circle
        cx='25'
        cy='25'
        r='22'
        stroke='currentColor'
        strokeWidth='5'
        opacity='0.3'
      />
      {/* 色付き部分 */}
      <circle
        cx='25'
        cy='25'
        r='22'
        stroke='currentColor'
        strokeWidth='5'
        strokeLinecap='round'
        strokeDasharray={`${2 * Math.PI * 22 * arcRatio} ${2 * Math.PI * 22 * (1 - arcRatio)}`}
        strokeDashoffset='0'
      />
    </svg>
  )
}

// Spinner component from vercel/ai-elements
// Copyright Vercel, Inc.
// Licensed under Apache License 2.0
// https://github.com/vercel/ai-elements

type SpinnerIconProps = {
  size?: number
}

const SpinnerIcon = ({ size = 16 }: SpinnerIconProps) => (
  <svg
    height={size}
    strokeLinejoin='round'
    style={{ color: 'currentcolor' }}
    viewBox='0 0 16 16'
    width={size}
  >
    <title>Loading</title>
    <g clipPath='url(#clip0_2393_1490)'>
      <path d='M8 0V4' stroke='currentColor' strokeWidth='1.5' />
      <path
        d='M8 16V12'
        opacity='0.5'
        stroke='currentColor'
        strokeWidth='1.5'
      />
      <path
        d='M3.29773 1.52783L5.64887 4.7639'
        opacity='0.9'
        stroke='currentColor'
        strokeWidth='1.5'
      />
      <path
        d='M12.7023 1.52783L10.3511 4.7639'
        opacity='0.1'
        stroke='currentColor'
        strokeWidth='1.5'
      />
      <path
        d='M12.7023 14.472L10.3511 11.236'
        opacity='0.4'
        stroke='currentColor'
        strokeWidth='1.5'
      />
      <path
        d='M3.29773 14.472L5.64887 11.236'
        opacity='0.6'
        stroke='currentColor'
        strokeWidth='1.5'
      />
      <path
        d='M15.6085 5.52783L11.8043 6.7639'
        opacity='0.2'
        stroke='currentColor'
        strokeWidth='1.5'
      />
      <path
        d='M0.391602 10.472L4.19583 9.23598'
        opacity='0.7'
        stroke='currentColor'
        strokeWidth='1.5'
      />
      <path
        d='M15.6085 10.4722L11.8043 9.2361'
        opacity='0.3'
        stroke='currentColor'
        strokeWidth='1.5'
      />
      <path
        d='M0.391602 5.52783L4.19583 6.7639'
        opacity='0.8'
        stroke='currentColor'
        strokeWidth='1.5'
      />
    </g>
    <defs>
      <clipPath id='clip0_2393_1490'>
        <rect fill='white' height='16' width='16' />
      </clipPath>
    </defs>
  </svg>
)

export type SpinnerProps = HTMLAttributes<HTMLDivElement> & {
  size?: number
}

export const Spinner = ({ className, size = 16, ...props }: SpinnerProps) => (
  <div
    className={`inline-flex animate-spin items-center justify-center ${className ?? ''}`}
    {...props}
  >
    <SpinnerIcon size={size} />
  </div>
)
