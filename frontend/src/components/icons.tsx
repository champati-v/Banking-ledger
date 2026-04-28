type IconProps = React.SVGProps<SVGSVGElement>

function Icon({ children, ...props }: React.PropsWithChildren<IconProps>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      {children}
    </svg>
  )
}

export function ShieldIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 3 5 6v5c0 5 3.2 8.9 7 10 3.8-1.1 7-5 7-10V6l-7-3Z" />
      <path d="M9.5 12.2 11.2 14l3.4-4" />
    </Icon>
  )
}

export function BankIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M3 10h18" />
      <path d="M5 10v8" />
      <path d="M9 10v8" />
      <path d="M15 10v8" />
      <path d="M19 10v8" />
      <path d="M4 18h16" />
      <path d="M12 3 3 8h18L12 3Z" />
    </Icon>
  )
}

export function TransferIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M7 7h14" />
      <path d="m14 4 3 3-3 3" />
      <path d="M17 17H3" />
      <path d="m10 14-3 3 3 3" />
    </Icon>
  )
}

export function WalletIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 7h14a3 3 0 0 1 3 3v7a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V7Z" />
      <path d="M4 10h16" />
      <path d="M16 14h2" />
    </Icon>
  )
}

export function UserIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M20 21a8 8 0 0 0-16 0" />
      <circle cx="12" cy="8" r="4" />
    </Icon>
  )
}

export function LogoutIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M10 17 15 12l-5-5" />
      <path d="M15 12H3" />
      <path d="M21 3v18" />
    </Icon>
  )
}

export function PlusIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </Icon>
  )
}

export function SearchIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="11" cy="11" r="6" />
      <path d="m20 20-3.5-3.5" />
    </Icon>
  )
}

export function ClockIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v5l3 2" />
    </Icon>
  )
}

export function CheckIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m5 13 4 4L19 7" />
    </Icon>
  )
}

export function AlertIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
      <path d="M10.3 4.9 2.8 19a2 2 0 0 0 1.8 3h15a2 2 0 0 0 1.8-3l-7.5-14.1a2 2 0 0 0-3.6 0Z" />
    </Icon>
  )
}
export function LayoutIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M3 9h18" />
      <path d="M9 21V9" />
    </Icon>
  )
}

export function BellIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </Icon>
  )
}

export function ArrowUpRightIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M7 17L17 7" />
      <path d="M7 7h10v10" />
    </Icon>
  )
}

export function ArrowDownLeftIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M17 7L7 17" />
      <path d="M17 17H7V7" />
    </Icon>
  )
}
