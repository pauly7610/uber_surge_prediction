declare module 'react-date-range' {
  import * as React from 'react';

  export interface DateRange {
    startDate: Date;
    endDate: Date;
    key: string;
  }

  export interface DateRangePickerProps {
    ranges: DateRange[];
    onChange: (ranges: { [key: string]: DateRange }) => void;
  }

  export class DateRangePicker extends React.Component<DateRangePickerProps> {}
} 