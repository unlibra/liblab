export function LogoIcon ({ className }: { className?: string }) {
  return (
    <svg viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg' className={className}>
      <rect x='1' y='1' width='6' height='6' rx='0.75' className='fill-[#56C0D8] dark:fill-[#FFFFFF]' />
      <rect x='9' y='1' width='6' height='6' rx='0.75' className='fill-[#459FD2] dark:fill-[#CFCFCF]' />
      <rect x='17' y='1' width='6' height='6' rx='0.75' className='fill-[#4E85E0] dark:fill-[#999999]' />

      <rect x='1' y='9' width='6' height='6' rx='0.75' className='fill-[#459FD2] dark:fill-[#CFCFCF]' />
      <rect x='9' y='9' width='6' height='6' rx='0.75' className='fill-[#4E85E0] dark:fill-[#999999]' />
      <rect x='17' y='9' width='6' height='6' rx='0.75' className='fill-[#E98046] dark:fill-[#7A7A7A]' />

      <rect x='1' y='17' width='6' height='6' rx='0.75' className='fill-[#4E85E0] dark:fill-[#999999]' />
      <rect x='9' y='17' width='6' height='6' rx='0.75' className='fill-[#E98046] dark:fill-[#7A7A7A]' />
    </svg>
  )
}
