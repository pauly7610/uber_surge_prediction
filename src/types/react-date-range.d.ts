declare module 'react-date-range' {
  import * as React from 'react';
  import { Locale } from 'date-fns';

  export interface DateRange {
    startDate: Date;
    endDate: Date;
    key: string;
  }

  export interface DateRangePickerProps {
    ranges: DateRange[];
    onChange: (ranges: { [key: string]: DateRange }) => void;
    locale?: Locale;
    months?: number;
    direction?: 'horizontal' | 'vertical';
    showSelectionPreview?: boolean;
    moveRangeOnFirstSelection?: boolean;
    showMonthAndYearPickers?: boolean;
    showDateDisplay?: boolean;
    staticRanges?: any[];
    inputRanges?: any[];
  }

  export class DateRangePicker extends React.Component<DateRangePickerProps> {}
} 