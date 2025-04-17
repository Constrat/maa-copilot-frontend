import { Tooltip2, Tooltip2Props } from '@blueprintjs/popover2'

import { FC } from 'react'

import { formatDate, formatRelativeTime } from '../utils/times'

interface RelativeTimeProps {
  moment: string | number | Date
  className?: string
  Tooltip2Props?: Tooltip2Props
}

export const RelativeTime: FC<RelativeTimeProps> = ({
  moment,
  className,
  Tooltip2Props,
}) => {
  // Convert to timestamp if needed
  const timestamp = typeof moment === 'string' || moment instanceof Date
    ? new Date(moment).getTime()
    : moment;

  const formattedDate = formatDate(timestamp);
  const relativeTime = formatRelativeTime(timestamp);

  return (
    <Tooltip2
      content={formattedDate}
      {...Tooltip2Props}
      disabled={!formattedDate}
    >
      <span className={className}>{relativeTime}</span>
    </Tooltip2>
  )
}
